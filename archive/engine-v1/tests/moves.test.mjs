import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { ensureAssets } from "./_assets.mjs";

const studio = fileURLToPath(new URL("..", import.meta.url));
const moves = fileURLToPath(new URL("./fixture-moves", import.meta.url));
const halftone = fileURLToPath(new URL("./fixture-halftone", import.meta.url));
ensureAssets();

async function inPage(film, fn) {
  const { chromium } = await import("playwright");
  const { startServer, filmUrl } = await import("../core/server.mjs");
  const server = await startServer();
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
    await page.goto(filmUrl(server, film, "?format=9x16&render=1"));
    await page.waitForFunction(() => window.ready === true, null, { timeout: 60_000 });
    return await page.evaluate(fn);
  } finally {
    await browser.close();
    server.close();
  }
}

let R;
const facts = async () =>
  (R ??= await inPage(moves, async () => {
    const M = window.MOVES;
    const rect = (el) => {
      const r = el.getBoundingClientRect();
      return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
    };
    await window.seek(1.5);
    const hero = {
      size: parseFloat(M.hero.el.style.font.match(/(\d+)px/)[1]),
      rect: rect(M.hero.el),
      before: M.hero.el.nextElementSibling === M.subject.el,
      cues: M.hero.cues(),
    };
    const odo = { cues: M.odo.cues(), mid: M.odo.value(3.0), end: M.odo.value(4.0) };
    await window.seek(4.2);
    const typed = M.typed.el.textContent;
    const route = { cues: M.rt.cues(), start: M.rt.tip(7.6), end: M.rt.tip(9.5), keys: M.rt.follow((x, y) => ({ x, y })) };
    const edges = M.edges.map((p) => ({ clip: p.el.style.clipPath, filter: p.el.style.filter }));
    // A stepped corner slide holds its pose for a 12 fps frame; a smooth one does not.
    const pose = (p, t) => (window.seek(t), p.el.style.transform);
    const stepA = [await pose(M.edges[3], 11.37), await pose(M.edges[3], 11.38)];
    const smoothA = [await pose(M.edges[2], 11.37), await pose(M.edges[2], 11.38)];
    return {
      hero, odo, typed, route, edges, stepA, smoothA,
      dz: { keys: M.dz.keys, cues: M.dz.cues() },
      split: M.sp.cues(),
      cues: window.CUES,
    };
  }));

test("heroWord: ≥ 380 px display face, cropped by the frame edge, behind its subject, heard", { timeout: 120_000 }, async () => {
  const { hero } = await facts();
  assert.ok(hero.size >= 380);
  assert.ok(hero.rect.right > 1080, `bleeds off the right edge (right ${hero.rect.right})`);
  assert.ok(hero.before, "inserted just before the subject, so the subject is in front");
  // One sound, at the contact: the word falls for 0.12 s from tIn (0.2) and the paper takes it then.
  // No extra thud under the stamp: a landing is one sound.
  assert.deepEqual(hero.cues.map((c) => c.type), ["stamp"]);
  assert.ok(Math.abs(hero.cues[0].t - 0.32) < 1e-9, `stamp at ${hero.cues[0].t}`);
});

test("counter: eases to its target, one key per step capped per second, typed value on screen", { timeout: 120_000 }, async () => {
  const { odo, typed } = await facts();
  assert.equal(Math.round(odo.end), 1892);
  assert.ok(odo.mid > 1854 && odo.mid < 1892);
  const keys = odo.cues.filter((c) => c.type === "key").map((c) => c.t);
  assert.ok(keys.length >= 10 && keys.length <= 38, `${keys.length} key cues`);
  for (let i = 1; i < keys.length - 1; i++) assert.ok(keys[i] - keys[i - 1] >= 1 / 18 - 1e-9, "never a machine gun");
  assert.match(typed, /^131\s*years$/);
});

test("docZoom: a wide look then a push that frames the quote, the highlighter heard", { timeout: 120_000 }, async () => {
  const { dz } = await facts();
  const [[t0, wide], [t1, close]] = dz.keys;
  assert.ok(t0 < t1 && close.z > wide.z * 1.5, `pushes in (${wide.z} → ${close.z})`);
  // The quote is 0.48 of a 900 px page and fills 0.82 of the frame width.
  assert.ok(Math.abs(close.z - (0.82 * 1080) / (0.48 * 900)) < 1e-6);
  assert.equal(close.r, 90 - 3, "upright on the turned station and page");
  assert.ok(dz.cues.some((c) => c.type === "marker" && Math.abs(c.t - 5.75) < 1e-9));
});

test("route: drawn leg by leg from the first point to the last, a pen per leg, camera keys per stop", { timeout: 120_000 }, async () => {
  const { route } = await facts();
  assert.equal(route.cues.length, 3);
  assert.ok(Math.hypot(route.start.x - 120, route.start.y - 500) < 1);
  assert.ok(Math.hypot(route.end.x - 900, route.end.y - 1500) < 1);
  assert.equal(route.keys.length, 4);
  assert.ok(route.keys.every(([t], i) => i === 0 || t > route.keys[i - 1][0]));
});

test("split and paper: torn seam heard; edges vary; stepped slides hold on a 12 fps clock", { timeout: 120_000 }, async () => {
  const { split, edges, stepA, smoothA, cues } = await facts();
  assert.ok(split.some((c) => c.type === "tear"));
  const [border, deckle, torn, none] = edges;
  assert.equal(border.clip, "");
  assert.match(deckle.filter, /url\("?#deckle/);
  assert.match(torn.clip, /^polygon\(/);
  assert.match(none.filter, /url\("?#bare/);
  assert.equal(stepA[0], stepA[1], "stepped: same pose within one 1/12 s");
  assert.notEqual(smoothA[0], smoothA[1], "default stays smooth");
  assert.ok(cues.some((c) => c.type === "swish"), "the table's own moves are in the film's cues");
});

test("halftone: the engraving becomes dots of ink on bare paper, the plain one stays continuous", { timeout: 120_000 }, () => {
  rmSync(`${halftone}/out`, { recursive: true, force: true });
  execFileSync("node", [`${studio}/core/render.mjs`, halftone, "--stills", "0.5"], { stdio: "pipe" });
  const png = `${halftone}/out/stills-9x16/000-0.50s.png`;
  // Tone histogram of a 300 × 300 patch over the face: a print screen is ink or paper, almost
  // never a mid grey; the continuous-tone engraving beside it is full of mid greys.
  const tones = (x, y) => {
    const px = [...execFileSync("ffmpeg", ["-loglevel", "error", "-i", png, "-vf", `crop=300:300:${x}:${y}`, "-f", "rawvideo", "-pix_fmt", "gray", "-"])];
    const share = (f) => px.filter(f).length / px.length;
    return { ink: share((v) => v < 70), paper: share((v) => v > 200), mid: share((v) => v >= 90 && v <= 180) };
  };
  const dots = tones(700, 500);
  const plain = tones(160, 500);
  assert.ok(dots.ink > 0.1 && dots.paper > 0.1, `ink and paper both present (${JSON.stringify(dots)})`);
  assert.ok(dots.mid < 0.08, `few mid greys in the screen (${dots.mid})`);
  assert.ok(plain.mid > dots.mid * 2, `the plain engraving has the greys (${plain.mid})`);
});
