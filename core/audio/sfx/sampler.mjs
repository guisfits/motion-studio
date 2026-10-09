// Writes sampler.mp3 + sampler.txt: the first variant of every library action in library order,
// so the whole library can be auditioned in one file. Mixkit files are in it once fetched, so the
// output goes to an ignored folder (default ./out), never into the repository.
//
//   node core/audio/sfx/sampler.mjs [--out dir] [--library my/sfx-library.json]
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { SR } from "../wav.mjs";
import { addLibrary, decodeSample, loadLibrary, renderSfx } from "../sfx.mjs";

const argv = process.argv;
const arg = (k) => {
  const i = argv.indexOf(`--${k}`);
  return i > 0 ? argv[i + 1] : undefined;
};
if (arg("library")) addLibrary(arg("library"));
const OUT = resolve(arg("out") ?? "out");
mkdirSync(OUT, { recursive: true });
const lib = loadLibrary();

// Short sounds sit 0.8 s apart; long ones get their length (max 3 s) plus 0.3 s before the next.
const rows = [];
let t = 0.3;
for (const [action, a] of Object.entries(lib)) {
  const len = decodeSample(a.files[0]).length / SR;
  rows.push({ t, action, file: a.files[0] });
  t += Math.max(0.8, Math.min(len, 3) + 0.3);
}
const dur = Math.ceil(t + 1);
const buf = renderSfx(rows.map((r) => ({ t: r.t, type: r.action })), dur);

const pcm = Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength);
execFileSync(
  "ffmpeg",
  ["-y", "-v", "error", "-f", "f32le", "-ar", String(SR), "-ac", "1", "-i", "-", "-c:a", "libmp3lame", "-b:a", "96k", join(OUT, "sampler.mp3")],
  { input: pcm, maxBuffer: 1 << 28 },
);

const pad = (s, n) => String(s).padEnd(n);
writeFileSync(
  join(OUT, "sampler.txt"),
  [
    "Sampler: first variant of each action, in this order (time of entry, action, file).",
    "Short sounds sit 0.8 s apart; long ones get their length (max 3 s) before the next.",
    "",
    ...rows.map((r) => `${r.t.toFixed(1).padStart(6)} s  ${pad(r.action, 17)} ${r.file}`),
    "",
  ].join("\n"),
);
console.log(`sampler: ${rows.length} actions, ${dur}s → ${OUT}`);
