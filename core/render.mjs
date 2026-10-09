// Renders a film by walking time: seek(t) → screenshot → ffmpeg. Nothing depends on a clock,
// so the same command produces the same frames on every run.
//
//   node core/render.mjs <film-dir> [--format 9x16|1x1|16x9|all] [--root DIR]
//        [--draft]                 540-wide, 30 fps, no motion blur (fast, for pacing)
//        [--from s] [--to s]       render only that range (review clip of the seconds a fix touched)
//        [--stills beats|downbeats|t1,t2,...]   PNG per moment + a labelled contact sheet; no video
//        [--fps N] [--sub N]       final defaults: 60 fps, 4 subframes blended for motion blur
//
// The served root: see server.mjs. Outputs land in <film-dir>/out/: silent-<format>.mp4, draft-<format>.mp4,
// <kind>-<format>-<from>-<to>.mp4 for ranges, stills-<format>/ + stills-<format>.png.
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, existsSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { startServer, filmUrl, rootFor } from "./server.mjs";
import { layout, FORMATS } from "./lib/layout.js";
import { makeSheet } from "./critique/sheet.mjs";

function parseArgs(argv) {
  const film = argv[2];
  if (!film || film.startsWith("--")) {
    console.error(
      "usage: node core/render.mjs <film-dir> [--format F|all] [--draft] [--from s --to s] [--stills ...] [--root DIR]",
    );
    process.exit(2);
  }
  const get = (k) => {
    const i = argv.indexOf(`--${k}`);
    return i > 0 ? argv[i + 1] : undefined;
  };
  const draft = argv.includes("--draft");
  return {
    film: resolve(film),
    root: get("root"),
    format: get("format") ?? "9x16",
    draft,
    from: get("from") !== undefined ? Number(get("from")) : undefined,
    to: get("to") !== undefined ? Number(get("to")) : undefined,
    stills: get("stills"),
    fps: Number(get("fps") ?? (draft ? 30 : 60)),
    sub: Number(get("sub") ?? (draft ? 1 : 4)),
    scale: draft ? 0.5 : 1,
  };
}

async function openFilm(browser, server, film, format) {
  const L = layout(format);
  const page = await browser.newPage({
    viewport: { width: L.W, height: L.H },
    deviceScaleFactor: 1,
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e));
  page.on("console", (m) => {
    if (m.type() === "error") console.error(`[page] ${m.text()}`);
  });
  await page.goto(filmUrl(server, film, `?format=${format}&render=1`));
  try {
    await page.waitForFunction(
      () => window.ready === true || window.__filmError,
      null,
      { timeout: 60_000 },
    );
  } catch (e) {
    throw errors[0] ?? e;
  }
  if (errors.length) throw errors[0];
  const info = await page.evaluate(() => window.FILM);
  const cdp = await page.context().newCDPSession(page);
  // One frame: paint t, then capture the stage. CDP capture is ~2x faster than locator.screenshot.
  const frame = async (t, { scale, type }) => {
    await page.evaluate((tt) => window.seek(tt), t);
    if (errors.length) throw errors[0];
    const { data } = await cdp.send("Page.captureScreenshot", {
      format: type,
      quality: type === "jpeg" ? 92 : undefined,
      optimizeForSpeed: true,
      clip: { x: 0, y: 0, width: L.W, height: L.H, scale },
    });
    return Buffer.from(data, "base64");
  };
  return { page, info, frame, L };
}

function ffmpegEncoder({ out, fps, sub, type }) {
  // tmix averages SUB consecutive subframes (motion blur); select keeps one frame per group.
  const vf =
    sub > 1
      ? [
          `tmix=frames=${sub}`,
          `select='eq(mod(n\\,${sub})\\,${sub - 1})'`,
          `setpts=N/${fps}/TB`,
        ].join(",")
      : "null";
  const ff = spawn(
    "ffmpeg",
    [
      "-y",
      "-loglevel",
      "error",
      "-f",
      "image2pipe",
      "-c:v",
      type === "jpeg" ? "mjpeg" : "png",
      "-framerate",
      String(fps * sub),
      "-i",
      "-",
      "-vf",
      vf,
      "-r",
      String(fps),
      "-c:v",
      "libx264",
      "-crf",
      "16",
      "-preset",
      "medium",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      out,
    ],
    { stdio: ["pipe", "inherit", "inherit"] },
  );
  const done = new Promise((ok, fail) =>
    ff.on("close", (c) =>
      c === 0 ? ok() : fail(new Error(`ffmpeg exited ${c}`)),
    ),
  );
  const write = async (buf) => {
    if (!ff.stdin.write(buf))
      await new Promise((r) => ff.stdin.once("drain", r));
  };
  return {
    write,
    end: async () => {
      ff.stdin.end();
      await done;
    },
  };
}

function stillTimes(spec, film, dur) {
  if (spec === "beats" || spec === "downbeats") {
    const file = join(film, "beats.json");
    if (!existsSync(file))
      throw new Error(
        `--stills ${spec} needs ${file} (run core/audio/beats.py or core/audio/score.mjs first)`,
      );
    const grid = JSON.parse(readFileSync(file, "utf8"));
    let ts = spec === "beats" ? grid.beats : grid.downbeats;
    // A contact sheet stops being readable past ~48 cells: fall back to downbeats.
    if (ts.length > 48) ts = grid.downbeats;
    // Sample just after the beat, where the state change it triggers is visible.
    return ts.filter((t) => t < dur).map((t) => Math.min(dur - 1e-3, t + 0.25));
  }
  return spec
    .split(",")
    .map(Number)
    .filter((t) => Number.isFinite(t));
}

async function renderStills(film, opts, format) {
  const { info, frame } = film;
  const times = stillTimes(opts.stills, opts.film, info.dur);
  const dir = join(opts.film, "out", `stills-${format}`);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const cells = [];
  for (const [i, t] of times.entries()) {
    const file = join(
      dir,
      `${String(i).padStart(3, "0")}-${t.toFixed(2)}s.png`,
    );
    writeFileSync(file, await frame(t, { scale: 1, type: "png" }));
    cells.push({ file, label: `${t.toFixed(2)}s` });
  }
  const sheet = join(opts.film, "out", `stills-${format}.png`);
  await makeSheet(cells, sheet, {
    title: `${format} · ${opts.stills} · ${cells.length} stills`,
  });
  console.log(`stills: ${cells.length} → ${dir}\nsheet:  ${sheet}`);
}

async function renderVideo(film, opts, format) {
  const { info, frame } = film;
  const from = opts.from ?? 0;
  const to = Math.min(opts.to ?? info.dur, info.dur);
  const kind = opts.draft ? "draft" : "silent";
  const range =
    opts.from !== undefined || opts.to !== undefined ? `-${from}-${to}` : "";
  const out = join(opts.film, "out", `${kind}-${format}${range}.mp4`);
  const type = opts.draft ? "jpeg" : "png";
  const enc = ffmpegEncoder({ out, fps: opts.fps, sub: opts.sub, type });
  const rate = opts.fps * opts.sub;
  const total = Math.round((to - from) * rate);
  const started = Date.now();
  for (let i = 0; i < total; i++) {
    await enc.write(await frame(from + i / rate, { scale: opts.scale, type }));
    if ((i + 1) % rate === 0 || i === total - 1) {
      const done = (i + 1) / total;
      const eta =
        ((Date.now() - started) / done - (Date.now() - started)) / 1000;
      process.stdout.write(
        `\r${format} ${kind}: ${(from + (i + 1) / rate).toFixed(1)}s / ${to}s  ${(done * 100).toFixed(0)}%  eta ${eta.toFixed(0)}s   `,
      );
    }
  }
  await enc.end();
  console.log(`\n→ ${out}  (${((Date.now() - started) / 1000).toFixed(1)}s)`);
}

const opts = parseArgs(process.argv);
const formats = opts.format === "all" ? Object.keys(FORMATS) : [opts.format];
mkdirSync(join(opts.film, "out"), { recursive: true });
const server = await startServer(0, rootFor(opts.film, opts.root));
const browser = await chromium.launch();
try {
  for (const format of formats) {
    const film = await openFilm(browser, server, opts.film, format);
    if (!film.info.formats.includes(format))
      throw new Error(`film does not declare format ${format}`);
    // Components declare the sound of their own actions (their cues()); a film that gathers
    // them in window.CUES gets out/cues.auto.json for audio/sfx.mjs, so every placement, key,
    // pen stroke, tear and camera move is heard without a hand-written cue list.
    const cues = await film.page.evaluate(() => window.CUES ?? null);
    if (cues) {
      mkdirSync(join(opts.film, "out"), { recursive: true });
      writeFileSync(join(opts.film, "out", "cues.auto.json"), `${JSON.stringify(cues.sort((a, b) => a.t - b.t), null, 1)}\n`);
    }
    if (opts.stills) await renderStills(film, opts, format);
    else await renderVideo(film, opts, format);
    await film.page.close();
  }
} finally {
  await browser.close();
  server.close();
}
