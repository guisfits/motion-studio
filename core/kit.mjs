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
// A film uses a piece by its manifest path (/<path under root>/<kind>/<id>.<ext>).
// Takes (screen recordings) are frame-extracted only with --takes (they are large).
// Downloads send a neutral User-Agent; set $MOTION_USER_AGENT to add your contact, as Wikimedia asks.
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  copyFileSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
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
      // Wikimedia asks for a descriptive agent and rate-limits bursts (429): pace and retry.
      execFileSync("curl", ["-fsSL", "--retry", "4", "--retry-delay", "5", "--retry-all-errors",
        "-A", USER_AGENT, "-o", p.abs, p.url], { stdio: "inherit" });
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

function build() {
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
    if (p.kind === "take") {
      if (flag("takes") && !fresh(p.abs, join(out, "clip.json")))
        execFileSync(
          "node",
          [join(ENGINE, "reference/clip.mjs"), p.abs, out, "--fps", "60"],
          { stdio: "inherit" },
        );
    } else if (!fresh(p.abs, out)) {
      try {
        if (p.cut === "none") copyFileSync(p.abs, out);
        else
          execFileSync("swift", [join(ENGINE, "reference/cutout.swift"), p.abs, out, "--mode", p.cut,
            ...(p.border ? ["--border", String(p.border)] : [])], { stdio: "pipe" });
        built++;
      } catch (e) {
        // A source the cutter cannot read (no subject, odd format) is reported, not fatal:
        // change its `cut` in the catalog (paper / none) and rebuild it.
        failedCuts.push(`${p.kind}/${p.id} (${p.cut}): ${String(e.stderr ?? e.message).trim().split("\n").pop()}`);
        continue;
      }
    }
    const file = p.kind === "take" ? p.abs : out;
    const [w, h] = size(file);
    manifest[`${p.kind}/${p.id}`] = {
      path: `/${relative(ROOT, out).split(sep).join("/")}`,
      kind: p.kind,
      w,
      h,
      tags: p.tags ?? [],
      source: p.source,
      license: p.license,
    };
  }
  mkdirSync(PIECES, { recursive: true });
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 1)}\n`);
  console.log(
    `kit: ${built} built, ${Object.keys(manifest).length} in manifest → ${manifestPath}`,
  );
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
  if (cmd === "build") build();
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
