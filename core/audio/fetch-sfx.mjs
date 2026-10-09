// Fetches the library's Mixkit sounds into sfx/fetched/ (gitignored). The Mixkit licence allows
// use in your own films but not redistribution of the files, so the repository carries only the
// recipe (sfx-sources.json: source URL, high-pass, length) and every checkout rebuilds them.
//
//   node core/audio/fetch-sfx.mjs [--only id,id] [--force]    (--force reprocesses the cached downloads)
//
// Each preview is processed the way the committed CC0 files were: high-pass (rumble), mono 48 kHz,
// leading silence trimmed to 6 ms before the onset (-32 dB under the clip's peak), cut to `len`
// seconds with a fade-out, an optional soft tanh drive (`drive`, for quiet crinkles), peak-
// normalised to -3 dBFS, mp3 96 kbps. Until a file is fetched, its action falls back to a
// synthesized voice (sfx.mjs), so films render either way.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const OUT = join(HERE, "sfx/fetched");
const CACHE = join(OUT, ".download");
const PEAK_DB = -3;

const argv = process.argv.slice(2);
const only = (() => {
  const i = argv.indexOf("--only");
  return i >= 0 ? argv[i + 1].split(",") : null;
})();
const force = argv.includes("--force");

// The loudest sample of a file after `filters`, in dBFS (ffmpeg volumedetect reports on stderr).
// volumedetect clips at 0 dBFS, and a high-pass can overshoot past it: measure HEADROOM dB down.
const HEADROOM = 20;
function detect(file, filters) {
  const af = `${filters},volume=-${HEADROOM}dB,volumedetect`;
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", file, "-af", af, "-f", "null", "-"], {
    encoding: "utf8",
  });
  const m = /max_volume:\s*(-?[\d.]+) dB/.exec(r.stderr ?? "");
  if (r.status !== 0 || !m) throw new Error(`volumedetect failed on ${file}`);
  return Number(m[1]) + HEADROOM;
}

function processOne(id, { url, highpass = 100, len, drive = false }) {
  const raw = join(CACHE, `${id}.mp3`);
  const out = join(OUT, `${id}.mp3`);
  if (existsSync(out) && !force) return "kept";
  if (!existsSync(raw))
    execFileSync("curl", ["-fsSL", "--retry", "3", "--retry-delay", "2", "-o", raw, url], { stdio: "inherit" });
  const base = `highpass=f=${highpass},aformat=channel_layouts=mono,aresample=48000`;
  const peak = detect(raw, base);
  const fade = Math.min(0.25, len * 0.3);
  const shape = [
    base,
    `silenceremove=start_periods=1:start_threshold=${(peak - 32).toFixed(1)}dB:start_silence=0.006`,
    `atrim=0:${len}`,
    `afade=t=out:st=${(len - fade).toFixed(3)}:d=${fade.toFixed(3)}`,
    ...(drive ? ["volume=2", "asoftclip=type=tanh"] : []),
  ].join(",");
  const shaped = detect(raw, shape);
  const tmp = join(OUT, `${id}.tmp.mp3`);
  execFileSync("ffmpeg", [
    "-y", "-v", "error", "-i", raw,
    "-af", `${shape},volume=${(PEAK_DB - shaped).toFixed(2)}dB`,
    "-ac", "1", "-ar", "48000", "-c:a", "libmp3lame", "-b:a", "96k", tmp,
  ]);
  renameSync(tmp, out);
  return "fetched";
}

const sources = JSON.parse(readFileSync(join(HERE, "sfx-sources.json"), "utf8"));
mkdirSync(CACHE, { recursive: true });
const counts = { fetched: 0, kept: 0, failed: 0 };
for (const [id, src] of Object.entries(sources)) {
  if (only && !only.includes(id)) continue;
  try {
    const r = processOne(id, src);
    counts[r]++;
    if (r === "fetched") console.log(`sfx: ${id}`);
  } catch (e) {
    counts.failed++;
    rmSync(join(OUT, `${id}.tmp.mp3`), { force: true });
    console.error(`sfx: ${id} failed: ${String(e.message).split("\n")[0]}`);
  }
}
console.log(`fetch-sfx: ${counts.fetched} fetched, ${counts.kept} already there, ${counts.failed} failed → ${OUT}`);
if (counts.failed) process.exitCode = 1;
