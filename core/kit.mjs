// The collage kit: builds every piece in a kit's catalog.json into its pieces/ folder and draws
// contact sheets to browse it. Pieces are rebuilt from their sources (keep those out of git), so
// a project carries recipes, not thousands of PNGs.
//
//   node core/kit.mjs fetch [--only id,id]                  download the catalog's `url` sources
//   node core/kit.mjs build [--only id,id] [--kind portrait] [--takes]
//   node core/kit.mjs sheet [--kind portrait]               → <kit>/out/<kind>.png
//   node core/kit.mjs list  [--kind page] [--tag t]
//
// Where things are (each flag overrides the one before it):
//   --kit DIR       the kit folder (default $MOTION_KIT, else ./kit): catalog.json, sources/,
//                   pieces/, out/
//   --catalog FILE  the catalog (default <kit>/catalog.json)
//   --pieces DIR    where pieces and manifest.json go (default <kit>/pieces)
//   --root DIR      the served root (see server.mjs): catalog `src` paths and manifest URLs are
//                   relative to it (default: the git top level of the kit)
//
// Entry fields the build reads: `cut` subject | paper | none | regions, `border` px, `matte`
// vision (default) | birefnet. New downloaded entries come from core/reference/find.mjs add.
//
// A film uses a piece by its manifest path (/<path under root>/<kind>/<id>.<ext>).
// Takes (screen recordings) are frame-extracted only with --takes (they are large).
// Downloads send a neutral User-Agent; set $MOTION_USER_AGENT to add your contact, as Wikimedia asks.
import { execFile, execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  statSync,
  copyFileSync,
  writeFileSync,
} from "node:fs";
import { availableParallelism, homedir, tmpdir } from "node:os";
import { basename, dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { cutRegions } from "./reference/regions.mjs";
import { makeSheet } from "./critique/sheet.mjs";
import { rootFor } from "./server.mjs";

const ENGINE = fileURLToPath(new URL(".", import.meta.url));

const args = process.argv.slice(2);
const cmd = args[0];
const opt = (k) => {
  const i = args.indexOf(`--${k}`);
  return i > 0 ? args[i + 1] : undefined;
};
const flag = (k) => args.includes(`--${k}`);

const KIT = resolve(opt("kit") ?? process.env.MOTION_KIT ?? "kit");
const CATALOG = resolve(opt("catalog") ?? join(KIT, "catalog.json"));
const PIECES = resolve(opt("pieces") ?? join(KIT, "pieces"));
const ROOT = rootFor(KIT, opt("root"));
const USER_AGENT = process.env.MOTION_USER_AGENT ?? "motion-studio-kit/0.1";

// Catalog entries with "*" expanded into one entry per matching file.
export function catalog() {
  const { pieces } = JSON.parse(
    readFileSync(CATALOG, "utf8"),
  );
  return pieces.flatMap((p) => {
    if (p.url) return [{ ...p, abs: join(KIT, "sources", p.file) }];
    if (!p.src.includes("*")) return [{ ...p, abs: join(ROOT, p.src) }];
    const dir = join(ROOT, dirname(p.src));
    const [pre, post] = basename(p.src).split("*");
    return readdirSync(dir)
      .filter((f) => f.startsWith(pre) && f.endsWith(post))
      .sort()
      .map((f) => ({
        ...p,
        id: p.id === "*" ? f.slice(0, f.length - extname(f).length) : p.id,
        src: join(dirname(p.src), f),
        abs: join(dir, f),
      }));
  });
}

const outPath = (p) => {
  const ext = p.cut === "none" ? extname(p.abs) : ".png";
  return p.kind === "take"
    ? join(PIECES, "take", p.id)
    : join(PIECES, p.kind, `${p.id}${ext}`);
};

const fresh = (src, out) =>
  existsSync(out) && statSync(out).mtimeMs >= statSync(src).mtimeMs;

function size(file) {
  if (file.endsWith(".svg")) return [0, 0];
  const s = execFileSync("ffprobe", [
    "-v",
    "error",
    "-select_streams",
    "v",
    "-show_entries",
    "stream=width,height",
    "-of",
    "csv=p=0",
    file,
  ])
    .toString()
    .trim();
  return s.split(",").map(Number);
}

// Downloads the catalog's external sources (entries with `url`) into <kit>/sources/.
// Check each source's licence before you add it to the catalog.
function fetchSources() {
  const only = opt("only")?.split(",");
  const failed = [];
  for (const p of catalog().filter((p) => p.url && (!only || only.includes(p.id)))) {
    if (existsSync(p.abs)) continue;
    mkdirSync(dirname(p.abs), { recursive: true });
    console.log(`fetch ${p.id} ← ${p.url}`);
    try {
      if (p.resolve === "texturelabs") {
        execFileSync("node", [join(ENGINE, "reference/find.mjs"), "texturelabs-file", p.url, p.size ?? "L", p.abs], { stdio: "inherit" });
        continue;
      }
      // Wikimedia asks for a descriptive agent and rate-limits bursts (429): pace and retry.
      execFileSync("curl", ["-fsSL", "--retry", "4", "--retry-delay", "5", "--retry-all-errors",
        "-A", USER_AGENT, "-H", `AIC-User-Agent: ${USER_AGENT}`, "-o", p.abs, p.url], { stdio: "inherit" });
    } catch {
      failed.push(p.id);
    }
    execFileSync("sleep", [p.url.includes("wiki") ? "2" : "0.3"]);
  }
  if (failed.length) {
    console.log(`failed (${failed.length}): ${failed.join(", ")}`);
    process.exitCode = 1;
  }
}

// cutout.swift compiled once per version of its source: `swift file.swift` recompiles on every
// call (seconds each), the binary starts in milliseconds.
function cutter() {
  const src = join(ENGINE, "reference/cutout.swift");
  const hash = createHash("sha1").update(readFileSync(src)).digest("hex").slice(0, 12);
  const bin = join(homedir(), ".cache", "motion-studio", `cutout-${hash}`);
  if (!existsSync(bin)) {
    try {
      mkdirSync(dirname(bin), { recursive: true });
      execFileSync("swiftc", ["-O", "-o", bin, src], { stdio: "pipe" });
    } catch {
      return ["swift", [src]];
    }
  }
  return [bin, []];
}

async function pool(items, size, work) {
  const queue = [...items];
  await Promise.all(
    Array.from({ length: Math.min(size, queue.length) }, async () => {
      while (queue.length) await work(queue.shift());
    }),
  );
}

// BiRefNet (open-weight, local, CPU) through rembg, for what Vision lifts badly (a halo on hair,
// a figure in a busy plate): `matte: "birefnet"` in the entry. Never a silent fallback: when
// Vision finds no subject the source is usually a ground or a page (cut none / paper), and
// BiRefNet then guesses wrong (it ate the text of a papyrus). One process mattes
// the whole batch so the model loads once; the first run downloads it (~1 GB, cached by rembg).
function birefnet(pairs) {
  if (!pairs.length) return;
  execFileSync("uv", ["run", "--quiet", "--script", join(ENGINE, "reference/matte.py"), ...pairs.flat()], {
    stdio: ["ignore", "inherit", "pipe"],
  });
}

async function cutAll(jobs) {
  const [bin, pre] = cutter();
  const run = promisify(execFile);
  const swiftCut = (input, out, mode, border) =>
    run(bin, [...pre, input, out, "--mode", mode, ...(border ? ["--border", String(border)] : [])]);
  const failed = [];
  const mattes = [];
  let built = 0;
  const done = (j) => {
    j.record(j.spec);
    built++;
  };
  const why = (e) => String(e.stderr ?? e.message).trim().split("\n").pop();

  await pool(jobs, Math.max(2, Math.floor(availableParallelism() / 2)), async (j) => {
    const { p, out } = j;
    try {
      if (p.cut === "none") copyFileSync(p.abs, out);
      else if (p.matte === "birefnet") return mattes.push(j);
      else await swiftCut(p.abs, out, p.cut, p.border);
      done(j);
    } catch (e) {
      // A source the cutter cannot read (no subject, odd format) is reported, not fatal: change
      // its `cut` in the catalog (paper / none), or set `matte: "birefnet"`, and rebuild it.
      failed.push(`${p.kind}/${p.id} (${p.cut}): ${why(e)}`);
    }
  });

  if (mattes.length) {
    const tmp = mkdtempSync(join(tmpdir(), "kit-matte-"));
    const pairs = mattes.map((j, i) => [j.p.abs, join(tmp, `${i}.png`)]);
    try {
      birefnet(pairs);
    } catch (e) {
      for (const j of mattes) failed.push(`${j.p.kind}/${j.p.id} (birefnet): ${why(e)}`);
      return { built, failed };
    }
    // The matte keeps the source's size; the cutter adds the border and the crop.
    await pool(mattes.map((j, i) => [j, pairs[i][1]]), 6, async ([j, matte]) => {
      try {
        await swiftCut(matte, j.out, "alpha", j.p.border);
        done(j);
      } catch (e) {
        failed.push(`${j.p.kind}/${j.p.id} (birefnet): ${why(e)}`);
      }
    });
  }
  return { built, failed };
}

async function build() {
  const jobs = [];
  const only = opt("only")?.split(",");
  const kind = opt("kind");
  const manifestPath = join(PIECES, "manifest.json");
  const manifest = existsSync(manifestPath)
    ? JSON.parse(readFileSync(manifestPath, "utf8"))
    : {};
  let built = 0;
  const failedCuts = [];
  const missing = [];
  for (const p of catalog()) {
    if (only && !only.includes(p.id)) continue;
    if (kind && p.kind !== kind) continue;
    if (!existsSync(p.abs)) {
      missing.push(
        p.url ? `${p.id} (not fetched: ${p.url})` : `${p.id} (${p.src})`,
      );
      continue;
    }
    const out = outPath(p);
    mkdirSync(dirname(out), { recursive: true });
    if (p.cut === "regions") {
      // One source, N pieces: each region becomes <id>-<region>.png with its own manifest row.
      const dest = dirname(out);
      let outs, spec;
      try {
        if (!Array.isArray(p.regions) || !p.regions.length)
          throw new Error(`${p.id}: cut "regions" needs a non-empty regions list`);
        outs = p.regions.map((r) => join(dest, `${p.id}-${r.id}.png`));
        // mtime only says the source is unchanged; the recipe (regions, oven) is in the catalog,
        // so a hash of it rides in each manifest row and a changed entry re-cuts.
        spec = createHash("sha1")
          .update(JSON.stringify([p.regions, p.oven ?? null]))
          .digest("hex")
          .slice(0, 12);
        const upToDate = p.regions.every(
          (r, i) => fresh(p.abs, outs[i]) && manifest[`${p.kind}/${p.id}-${r.id}`]?.spec === spec,
        );
        if (!upToDate) {
          cutRegions(p.abs, p, dest);
          built += outs.length;
        }
      } catch (e) {
        failedCuts.push(`${p.kind}/${p.id} (regions): ${String(e.stderr ?? e.message).trim().split("\n").pop()}`);
        continue;
      }
      for (const [i, r] of p.regions.entries()) {
        const [w, h] = size(outs[i]);
        manifest[`${p.kind}/${p.id}-${r.id}`] = {
          path: `/${relative(ROOT, outs[i]).split(sep).join("/")}`,
          kind: p.kind,
          w,
          h,
          tags: p.tags ?? [],
          material: p.material,
          spec,
          source: p.source,
          license: p.license,
        };
      }
      continue;
    }
    const key = `${p.kind}/${p.id}`;
    const record = (spec) => {
      const file = p.kind === "take" ? p.abs : out;
      const [w, h] = size(file);
      manifest[key] = {
        path: `/${relative(ROOT, out).split(sep).join("/")}`,
        kind: p.kind,
        w,
        h,
        tags: p.tags ?? [],
        spec,
        source: p.source,
        license: p.license,
      };
    };
    if (p.kind === "take") {
      if (flag("takes") && !fresh(p.abs, join(out, "clip.json")))
        execFileSync(
          "node",
          [join(ENGINE, "reference/clip.mjs"), p.abs, out, "--fps", "60"],
          { stdio: "inherit" },
        );
      record();
      continue;
    }
    // Like regions: the recipe (cut, border, matte) rides in the manifest, so editing it re-cuts.
    const spec = createHash("sha1")
      .update(JSON.stringify([p.cut, p.border ?? 0, p.matte ?? "vision"]))
      .digest("hex")
      .slice(0, 12);
    if (fresh(p.abs, out) && manifest[key]?.spec === spec) record(spec);
    else jobs.push({ p, out, spec, record });
  }

  // The cuts run after the scan, in parallel (Vision is per-image; one process per core pair).
  const cut = await cutAll(jobs);
  built += cut.built;
  failedCuts.push(...cut.failed);
  mkdirSync(PIECES, { recursive: true });
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 1)}\n`);
  console.log(
    `kit: ${built} built, ${Object.keys(manifest).length} in manifest → ${manifestPath}`,
  );
  if (failedCuts.length)
    console.log(`failed cuts (${failedCuts.length}):\n  ${failedCuts.join("\n  ")}`);
  if (missing.length)
    console.log(
      `missing sources (${missing.length}):\n  ${missing.join("\n  ")}`,
    );
}

async function sheet() {
  const manifest = JSON.parse(
    readFileSync(join(PIECES, "manifest.json"), "utf8"),
  );
  const kinds = opt("kind")
    ? [opt("kind")]
    : [...new Set(Object.values(manifest).map((m) => m.kind))];
  mkdirSync(join(KIT, "out"), { recursive: true });
  for (const kind of kinds) {
    const cells = Object.entries(manifest)
      .filter(([, m]) => m.kind === kind && kind !== "take")
      .map(([key, m]) => ({
        file: join(ROOT, m.path),
        label: key.split("/")[1],
      }));
    if (!cells.length) continue;
    const out = join(KIT, "out", `${kind}.png`);
    await makeSheet(cells, out, {
      title: `kit · ${kind} · ${cells.length}`,
      cols: 8,
      cellW: 220,
      cellBg: "#3d4a56",
    });
    console.log(`sheet: ${out}`);
  }
}

function list() {
  const manifest = JSON.parse(
    readFileSync(join(PIECES, "manifest.json"), "utf8"),
  );
  for (const [key, m] of Object.entries(manifest)) {
    if (opt("kind") && m.kind !== opt("kind")) continue;
    if (opt("tag") && !m.tags.includes(opt("tag"))) continue;
    console.log(
      `${key.padEnd(48)} ${String(m.w).padStart(5)}×${String(m.h).padEnd(5)} ${m.path}`,
    );
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (cmd === "build") await build();
  else if (cmd === "fetch") fetchSources();
  else if (cmd === "sheet") await sheet();
  else if (cmd === "list") list();
  else {
    console.error(
      "usage: node core/kit.mjs fetch|build|sheet|list [--kit DIR] [--catalog F] [--pieces DIR] [--root DIR] [--kind k] [--only ids] [--tag t] [--takes]",
    );
    process.exit(2);
  }
}
