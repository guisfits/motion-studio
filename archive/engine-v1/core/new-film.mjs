// Starts a film from the template:
//
//   node core/new-film.mjs <film-dir> [--dur 15] [--root DIR]
//
// The film's imports are written as absolute paths under the served root (see server.mjs), so
// the same template works in the engine checkout and in a project that mounts the engine.
import { cpSync, existsSync, readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { basename, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { ENGINE_ROOT, enginePrefix, rootFor } from "./server.mjs";

const argv = process.argv;
const target = argv[2];
const arg = (k) => {
  const i = argv.indexOf(`--${k}`);
  return i > 0 ? argv[i + 1] : undefined;
};
if (!target || target.startsWith("--")) {
  console.error("usage: node core/new-film.mjs <film-dir> [--dur seconds] [--root DIR]");
  process.exit(2);
}
const dest = resolve(target);
const slug = basename(dest);
if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
  console.error(`the film directory's name must be a kebab-case slug, got "${slug}"`);
  process.exit(2);
}
const dur = Number(arg("dur") ?? 15);
if (existsSync(dest)) {
  console.error(`${dest} already exists`);
  process.exit(1);
}
const root = rootFor(dest, arg("root"));
const posix = (p) => p.split(sep).join("/") || ".";
const vars = {
  __SLUG__: slug,
  __DUR__: String(dur),
  __ENGINE__: enginePrefix(root), // URL prefix of the engine under the served root
  __ENGINE_DIR__: posix(relative(root, ENGINE_ROOT)), // CLI path of the engine from the root
  __FILM__: posix(relative(root, dest)), // CLI path of the film from the root
};

const template = fileURLToPath(new URL("./templates/film", import.meta.url));
cpSync(template, dest, { recursive: true });
const fill = (dir) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) fill(p);
    else if (/\.(md|html|json)$/.test(f)) {
      let s = readFileSync(p, "utf8");
      for (const [k, v] of Object.entries(vars)) s = s.replaceAll(k, v);
      writeFileSync(p, s);
    }
  }
};
fill(dest);
// Enough bars of music to cover the film; the score's tail rings out past the last frame.
const scorePath = join(dest, "score.json");
const score = JSON.parse(readFileSync(scorePath, "utf8"));
score.bars = Math.ceil((dur * score.bpm) / 240);
writeFileSync(scorePath, `${JSON.stringify(score, null, 2)}\n`);
console.log(`new film → ${dest}  (${dur}s, served from ${root})`);
