// Turns a simulator screen recording into a frame sequence a film can play frame-exactly.
//
//   node core/reference/clip.mjs <rec.mov> <film-dir>/assets/<name> [--fps 60] [--from s] [--to s]
//   → <dir>/00001.jpg … + <dir>/clip.json { fps, count, w, h }
//
// A <video> element cannot be seeked deterministically in headless Chromium (and Playwright's
// Chromium has no H.264), so a recording is played from stills: lib/clip.js shows frame
// floor(t * fps) and the renderer waits for its decode.
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [, , input, dir] = process.argv;
const get = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? process.argv[i + 1] : d;
};
if (!input || !dir) {
  console.error("usage: node clip.mjs <recording> <out-dir> [--fps 60] [--from s] [--to s]");
  process.exit(2);
}
const fps = Number(get("fps", 60));
const range = [
  ...(get("from") ? ["-ss", get("from")] : []),
  ...(get("to") ? ["-to", get("to")] : []),
];
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });
// Simulator recordings have a variable frame rate; fps= resamples to a constant grid.
execFileSync("ffmpeg", ["-loglevel", "error", ...range, "-i", input, "-vf", `fps=${fps}`,
  "-q:v", "2", join(dir, "%05d.jpg")]);
const count = readdirSync(dir).filter((f) => f.endsWith(".jpg")).length;
const [w, h] = execFileSync("ffprobe", ["-v", "error", "-select_streams", "v", "-show_entries",
  "stream=width,height", "-of", "csv=p=0", join(dir, "00001.jpg")]).toString().trim().split(",").map(Number);
writeFileSync(join(dir, "clip.json"), `${JSON.stringify({ fps, count, w, h })}\n`);
console.log(`clip: ${count} frames at ${fps} fps (${(count / fps).toFixed(2)} s, ${w}×${h}) → ${dir}`);
