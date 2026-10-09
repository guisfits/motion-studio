// Downloads one reference clip (yt-dlp) and turns it into frames + a labelled sheet to study.
// Reference media is someone else's work: keep media/ and frames/ local (never commit or
// publish them); only the notes written from them belong in a repository.
//
//   node core/reference/inspiration.mjs <id> <url> [--fps 2] [--out DIR]
//   → <out>/media/<id>.mp4, <out>/frames/<id>/*.png, <out>/frames/<id>.png (sheet)
//   <out>: --out, else $MOTION_INSPIRATIONS, else ./inspirations
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { makeSheet } from "../critique/sheet.mjs";

const [, , id, url] = process.argv;
if (!id || !url || !/^[a-z0-9-]+$/.test(id)) {
  console.error("usage: node core/reference/inspiration.mjs <kebab-id> <url> [--fps 2] [--out DIR]");
  process.exit(2);
}
const i = process.argv.indexOf("--fps");
const fps = i > 0 ? Number(process.argv[i + 1]) : 2;
const o = process.argv.indexOf("--out");
const root = resolve(o > 0 ? process.argv[o + 1] : (process.env.MOTION_INSPIRATIONS ?? "inspirations"));
const media = join(root, "media");
const frames = join(root, "frames", id);
mkdirSync(media, { recursive: true });
const clip = join(media, `${id}.mp4`);
if (!existsSync(clip)) {
  execFileSync("yt-dlp", ["-q", "--no-playlist", "-f", "bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/b", "--merge-output-format", "mp4", "-o", clip, url], { stdio: "inherit" });
}
rmSync(frames, { recursive: true, force: true });
mkdirSync(frames, { recursive: true });
execFileSync("ffmpeg", ["-loglevel", "error", "-i", clip, "-vf", `fps=${fps},scale=480:-2`, join(frames, "%04d.png")]);
const files = readdirSync(frames).filter((f) => f.endsWith(".png")).sort();
// Long clips: keep the sheet readable with at most 60 cells, evenly spaced.
const step = Math.max(1, Math.ceil(files.length / 60));
const cells = files
  .filter((_, k) => k % step === 0)
  .map((f) => ({ file: join(frames, f), label: `${((files.indexOf(f)) / fps).toFixed(1)}s` }));
const sheet = await makeSheet(cells, join(root, "frames", `${id}.png`), { title: `${id} · ${url}`, cols: 10, cellW: 160 });
const dur = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", clip]).toString().trim();
console.log(`${id}: ${Number(dur).toFixed(1)}s, ${files.length} frames → ${sheet}`);
