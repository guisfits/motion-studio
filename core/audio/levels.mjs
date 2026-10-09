// Level measurements for the mix: how loud the voice speaks, how loud a typical SFX hit is, and
// what the stems came to after gain and ducking. Pure functions over mono samples, plus a decoder.
//
// Units: dBFS of the RMS over 50 ms windows (the window a listener hears a hit in). "Speech level"
// is the mean power of the windows where the voice is active; "hit level" is the p90 of the
// windows of an SFX stem that carry sound, so a stem of mostly quiet keys and a few thuds reads as
// its thuds, not as its average.
import { execFileSync } from "node:child_process";

export const WINDOW = 0.05;
export const SILENCE_DB = -90;

// Decodes any audio file the way the mix takes it in (stereo; a mono stem is upmixed exactly as
// the mix's own aformat does), as interleaved f32. Pass `sr * CHANNELS` as the rate to the
// measurements below: a window then covers the same 50 ms in both channels, and the level is the
// power averaged over left and right.
export const CHANNELS = 2;
export function decodeStereo(file, sr = 16000) {
  const b = execFileSync(
    "ffmpeg",
    ["-v", "error", "-i", file, "-af", `aformat=sample_rates=${sr}:channel_layouts=stereo`, "-f", "f32le", "-"],
    { maxBuffer: 1 << 30 },
  );
  return new Float32Array(b.buffer.slice(b.byteOffset, b.byteOffset + b.length));
}

// RMS in dBFS of consecutive windows of `win` seconds.
export function windowDb(samples, sr, win = WINDOW) {
  const n = Math.max(1, Math.round(win * sr));
  const out = [];
  for (let i = 0; i + n <= samples.length; i += n) {
    let e = 0;
    for (let j = 0; j < n; j++) e += samples[i + j] * samples[i + j];
    out.push(e > 0 ? 10 * Math.log10(e / n) : SILENCE_DB);
  }
  return out;
}

const percentile = (arr, p) => {
  const s = [...arr].sort((a, b) => a - b);
  return s.length
    ? s[Math.min(s.length - 1, Math.floor(p * s.length))]
    : SILENCE_DB;
};
export const powerMeanDb = (db) =>
  db.length
    ? 10 * Math.log10(db.reduce((a, v) => a + 10 ** (v / 10), 0) / db.length)
    : SILENCE_DB;

// Windows (as indices) where a voice is speaking: within 30 dB of its loud windows and above -55.
export function activeWindows(db) {
  const floor = Math.max(-55, percentile(db, 0.95) - 30);
  return db.map((v, i) => (v > floor ? i : -1)).filter((i) => i >= 0);
}

// Mean power (dBFS) of the windows where the voice speaks.
export function speechLevelDb(samples, sr) {
  const db = windowDb(samples, sr);
  return powerMeanDb(activeWindows(db).map((i) => db[i]));
}

// p90 window level (dBFS) of an SFX stem over the windows that carry sound.
export function hitLevelDb(samples, sr) {
  const db = windowDb(samples, sr).filter((v) => v > -60);
  return percentile(db, 0.9);
}

// How a stem sits against the voice, window by window:
//   speech  the voice's own level where it speaks (dBFS)
//   under   the stem's mean level in those windows; hit its p90 there
//   gap     the stem's mean level where the voice is silent
export function underSpeech(voice, stem, sr) {
  const v = windowDb(voice, sr);
  const s = windowDb(stem, sr);
  const act = activeWindows(v).filter((i) => i < s.length);
  const on = new Set(act);
  const there = act.map((i) => s[i]);
  const gaps = s.filter((x, i) => !on.has(i) && x > -60);
  return {
    speech: powerMeanDb(act.map((i) => v[i])),
    under: powerMeanDb(there),
    hit: percentile(there.filter((x) => x > -60), 0.9),
    gap: powerMeanDb(gaps),
  };
}

// Number of cues whose starts are closer than `gap` seconds to the previous cue (overlap count).
export function overlaps(times, gap) {
  const t = [...times].sort((a, b) => a - b);
  let n = 0;
  for (let i = 1; i < t.length; i++) if (t[i] - t[i - 1] < gap) n++;
  return n;
}
