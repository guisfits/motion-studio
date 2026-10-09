// Sound effects placed on the film's timeline. A cue whose type is an action of a recorded
// library (sfx-library.json, files in sfx/ and sfx/fetched/, plus any project library) plays a
// real recording; any other type falls back to the synthesized VOICES below.
//
//   node core/audio/sfx.mjs cues.json out/sfx.wav [--dur 15] [--no-thin] [--library my/sfx-library.json]
//   cues.json: [{ "t": 0.5, "type": "click", "gain": 1, "len": 0.4 }, ...]
//
// `t` is when the sound is HEARD: a landing's contact, the middle of a camera travel, the start of
// a stroke. The renderer places each recording so its own anchor (library field `anchor`) falls on
// `t`. Cues are thinned first (thin.mjs); `len` is how long the sound lasts after its anchor.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { SR, writeWav, noiseSource } from "./wav.mjs";
import { thinCues, summary } from "./thin.mjs";

const TAU = 2 * Math.PI;
const noise = noiseSource(7);

// [length in seconds, sample(t) → [-1, 1]]. Sober palette: soft, short, never cartoonish.
export const VOICES = {
  click: [0.05, (t) => Math.sin(TAU * 1800 * t) * Math.exp(-t * 90) * 0.45],
  tick: [
    0.06,
    (t) =>
      (Math.sin(TAU * 950 * t) + 0.4 * Math.sin(TAU * 2400 * t)) *
      Math.exp(-t * 120) *
      0.35,
  ],
  pop: [
    0.15,
    (t) => Math.sin(TAU * (500 + 700 * t) * t) * Math.exp(-t * 30) * 0.35,
  ],
  thump: [
    0.5,
    (t) => Math.sin(TAU * (85 - 50 * t) * t) * Math.exp(-t * 9) * 0.8,
  ],
  whoosh: [
    0.45,
    (t) => noise() * Math.sin(Math.PI * Math.min(1, t / 0.45)) ** 2 * 0.22,
  ],
  // Page turn: two quick paper flutters of filtered noise.
  page: [
    0.4,
    (t) =>
      noise() *
      (Math.exp(-(((t - 0.06) / 0.035) ** 2)) +
        0.7 * Math.exp(-(((t - 0.2) / 0.06) ** 2))) *
      0.3,
  ],
  chime: [
    1.6,
    (t) =>
      [1, 2.76, 5.4].reduce(
        (s, p, i) =>
          s +
          (Math.sin(TAU * 1320 * p * t) * Math.exp(-t * (2.5 + i * 2))) /
            (i + 1),
        0,
      ) * 0.22,
  ],
  // A gust that carries paper away: noise swelling and fading over 2.2 s, smoothed (one-pole).
  wind: [1.7, windSample()],
  // Typewriter key: a hard noise click on a low body knock.
  type: [
    0.09,
    (t) =>
      (noise() * Math.exp(-t * 260) * 0.8 + Math.sin(TAU * 180 * t) * Math.exp(-t * 60) * 0.5) * 0.5,
  ],
  // The carriage bell at the end of a line: the "tim".
  ding: [
    1.2,
    (t) =>
      (Math.sin(TAU * 2093 * t) + 0.35 * Math.sin(TAU * 5280 * t) * Math.exp(-t * 6)) *
      Math.exp(-t * 4.5) *
      0.28,
  ],
  // Paper tearing: a fibrous rip, noise gated by fast irregular bursts.
  tear: [0.55, burstSample(0.55, 90, 0.5)],
  // Paper crumpling: sparse crackles over half a second.
  crumple: [0.7, burstSample(0.7, 26, 0.6)],
  // Fire: low hiss with sparse pops.
  crackle: [1.6, crackleSample()],
  // An ink drop landing: a short rising blip.
  drip: [0.18, (t) => Math.sin(TAU * (600 + 2400 * t) * t) * Math.exp(-t * 28) * 0.35],
  // A quill or pen scratching on paper: short grainy strokes.
  scratch: [
    0.5,
    (t) =>
      noise() *
      (0.5 + 0.5 * Math.sin(TAU * 7 * t)) ** 2 *
      Math.sin(Math.PI * Math.min(1, t / 0.5)) *
      0.22,
  ],
};

// Noise opened in short bursts at `rate` per second (deterministic: gates drawn from the noise).
function burstSample(len, rate, gain) {
  let gate = 0;
  let next = 0;
  return (t) => {
    if (t >= next) {
      gate = 0.3 + 0.7 * Math.abs(noise());
      next = t + (0.4 + Math.abs(noise())) / rate;
    }
    gate *= 0.9993;
    return noise() * gate * Math.sin(Math.PI * Math.min(1, t / len)) * gain;
  };
}

function crackleSample() {
  let low = 0;
  return (t) => {
    low += (noise() - low) * 0.05;
    const pop = Math.abs(noise()) > 0.9985 ? noise() * 0.9 : 0;
    return (low * 0.5 + pop) * Math.sin(Math.PI * Math.min(1, t / 1.6)) * 0.6;
  };
}

function windSample() {
  let low = 0;
  return (t) => {
    low += (noise() - low) * 0.06;
    return low * Math.sin(Math.PI * Math.min(1, t / 1.7)) ** 1.5 * 1.6;
  };
}

// The synthesized voice each recorded action falls back to when its files are absent (Mixkit
// files not fetched yet, see fetch-sfx.mjs), so a film always renders; also the names the
// components' auto cues use (vox kit, table, voice) before any library covers them.
export const ALIASES = {
  "paper-place": "page", "paper-slide": "whoosh", pour: "whoosh", marker: "scratch", pen: "scratch",
  "thud-soft": "thump", stamp: "thump", bell: "chime", key: "type", swish: "whoosh",
  splash: "drip", burst: "type", return: "ding", flip: "page", fire: "crackle", match: "scratch",
  riser: "wind", swell: "wind", "riser-soft": "wind", "church-bell": "chime", "bell-deep": "chime",
  creak: "scratch", door: "thump", boom: "thump", "stamp-wood": "thump", riffle: "page",
  "paper-wipe": "whoosh", flame: "whoosh", "flame-whoosh": "whoosh", "whoosh-deep": "whoosh",
  "paper-wind": "wind", rustle: "page",
};

const HERE = fileURLToPath(new URL(".", import.meta.url));
// The engine's own library: committed CC0 files in sfx/, fetched Mixkit files in sfx/fetched/.
const BUILTIN = { json: join(HERE, "sfx-library.json"), dirs: [join(HERE, "sfx"), join(HERE, "sfx/fetched")] };
const extra = (process.env.MOTION_SFX_LIBRARY ?? "").split(":").filter(Boolean);
let library;
let files; // id → absolute path of every file a loaded library found
let declared; // every action name any loaded library declares, present or not
const aliasOf = new Map(); // alias → its target, for aliases whose target has no file
const decoded = new Map();
const warned = new Set();

// Adds a project library (a JSON like sfx-library.json whose files live in <its dir>/sfx/). Later
// libraries override earlier actions with the same name (a project's own `logo`, say). Call it
// before the first render; the CLI's --library and $MOTION_SFX_LIBRARY (colon list) do the same.
export function addLibrary(path) {
  extra.push(resolve(path));
  library = undefined;
}

function readLibrary({ json, dirs }, into) {
  const data = JSON.parse(readFileSync(json, "utf8"));
  for (const [name, a] of Object.entries(data)) {
    declared.add(name);
    if (a.alias) {
      into[name] = a;
      continue;
    }
    const present = [];
    for (const id of a.files) {
      const dir = dirs.find((d) => existsSync(join(d, `${id}.mp3`)));
      if (!dir) continue;
      files.set(id, join(dir, `${id}.mp3`));
      present.push(id);
    }
    if (present.length) into[name] = { ...a, files: present };
    else {
      delete into[name];
      if (!warned.has(name)) {
        warned.add(name);
        console.warn(`sfx: no file of "${name}" is on disk (engine Mixkit files: node core/audio/fetch-sfx.mjs); using its synthesized voice`);
      }
    }
  }
}

// action → { files: [ids], gain, ... }, read once per process: the engine's library, then each
// extra one. An action keeps only the files present on disk; one with none is left out, so its
// cues fall back to the synthesized voices. An entry `{ "alias": "other" }` (optional "gain") is
// another name for an action: it resolves to that action's files here.
export function loadLibrary() {
  if (!library) {
    library = {};
    files = new Map();
    declared = new Set();
    aliasOf.clear();
    readLibrary(BUILTIN, library);
    for (const json of extra) readLibrary({ json, dirs: [join(dirname(json), "sfx")] }, library);
    for (const [name, a] of Object.entries(library))
      if (a.alias) {
        const target = library[a.alias];
        if (target?.files) library[name] = { ...target, gain: a.gain ?? target.gain };
        else if (declared.has(a.alias)) {
          delete library[name];
          aliasOf.set(name, a.alias);
        } else throw new Error(`sfx-library: "${name}" aliases unknown action "${a.alias}"`);
      }
  }
  return library;
}

// The file of a library id, or undefined when no loaded library has it on disk.
export function sampleFile(id) {
  loadLibrary();
  return files.get(id);
}

// Decodes a library file to mono f32 at SR, cached per process.
export function decodeSample(id) {
  if (!decoded.has(id)) {
    const file = sampleFile(id);
    if (!file) throw new Error(`sfx: no file for "${id}" in the loaded libraries`);
    const b = execFileSync(
      "ffmpeg",
      ["-v", "error", "-i", file, "-ac", "1", "-ar", String(SR), "-f", "f32le", "-"],
      { maxBuffer: 1 << 28 },
    );
    decoded.set(id, new Float32Array(b.buffer.slice(b.byteOffset, b.byteOffset + b.length)));
  }
  return decoded.get(id);
}

// Deterministic jitter in [0, 1) from an integer (so repeated keys differ but every render matches).
const jitter = (n) => ((Math.imul(n + 1, 2654435761) >>> 0) % 1000) / 1000;

// Where a hit lands in a recording, and how loud it is (cached per file):
//   attack  first 5 ms window within 9 dB of the loudest: the contact of a landing
//   peak    the loudest 5 ms window: the middle of a whoosh
//   rmsPeak the loudest 50 ms RMS in dBFS: what a listener hears as its loudness
const meta = new Map();
export function sampleMeta(id) {
  if (!meta.has(id)) {
    const s = decodeSample(id);
    const w = Math.round(0.005 * SR);
    const env = [];
    for (let i = 0; i + w <= s.length; i += w) {
      let e = 0;
      for (let j = 0; j < w; j++) e += s[i + j] * s[i + j];
      env.push(Math.sqrt(e / w));
    }
    const max = Math.max(...env);
    // Smoothed over the neighbours so a single zero-crossing window does not read as silence.
    const near = (i) => Math.max(env[i], env[i - 1] ?? 0, env[i + 1] ?? 0);
    const attack = env.findIndex((_, i) => near(i) >= 0.35 * max) * 0.005;
    const peak = env.indexOf(max) * 0.005;
    const long = Math.round(0.05 * SR);
    let loudest = 0;
    for (let i = 0; i + long <= s.length; i += w) {
      let e = 0;
      for (let j = 0; j < long; j++) e += s[i + j] * s[i + j];
      loudest = Math.max(loudest, e / long);
    }
    meta.set(id, { attack, peak, rmsPeak: 10 * Math.log10(loudest || 1e-12) });
  }
  return meta.get(id);
}

// Every recording is brought to the same hit loudness (rmsPeak = REF_DB) before the action's gain
// and the cue's gain, so a thud (-5 dB) and a key (-20 dB) differ by the numbers in the library,
// not by how loudly each file was recorded. Beds keep their authored level.
export const REF_DB = -16;
const MAX_PRE = { contact: 0.25, peak: 0.45 };
export const ONE_SHOT_TAIL = 0.6;

// Adds a recording at `start` (samples). `rate` ≠ 1 resamples by linear interpolation. The region
// [from, to) seconds of the sample is played, with a short fade in and a raised-cosine fade out.
function mixSample(buf, sample, start, gain, { rate = 1, from = 0, to = Infinity, fadeIn = 0.004, fadeOut = 0 } = {}) {
  const first = Math.round(from * SR);
  const last = Math.min(sample.length - 1, Math.round(to * SR));
  const len = Math.floor((last - first) / rate);
  const fi = Math.max(1, Math.round(fadeIn * SR));
  const fo = Math.round(fadeOut * SR);
  for (let i = 0; i < len && start + i < buf.length; i++) {
    if (start + i < 0) continue;
    const x = first + i * rate;
    const k = Math.floor(x);
    let g = gain;
    if (i < fi) g *= i / fi;
    if (fo && len - i < fo) g *= 0.5 - 0.5 * Math.cos((Math.PI * (len - i)) / fo);
    buf[start + i] += (sample[k] + (sample[k + 1] - sample[k]) * (x - k)) * g;
  }
}

// A soft knee above 0.8 so overlapping hits never hard-clip.
function softLimit(buf) {
  for (let i = 0; i < buf.length; i++) {
    const a = Math.abs(buf[i]);
    if (a > 0.8) buf[i] = Math.sign(buf[i]) * (0.8 + 0.19 * Math.tanh((a - 0.8) / 0.19));
  }
}

// cues: [{ t, type, gain?, len? }]. thin: false renders the list as given.
export function renderSfx(cues, dur, { thin = true } = {}) {
  if (thin) cues = thinCues(cues).kept;
  const n = Math.ceil(dur * SR);
  const buf = new Float32Array(n);
  const lib = loadLibrary();
  // Occurrence rank of each cue among cues of its type, in time order: picks the variant.
  const rank = new Map();
  const seen = {};
  cues
    .map((c, i) => [c, i])
    .sort((a, b) => a[0].t - b[0].t || a[1] - b[1])
    .forEach(([c, i]) => rank.set(i, (seen[c.type] = (seen[c.type] ?? -1) + 1)));
  cues.forEach((c, ci) => {
    const gain = c.gain ?? 1;
    const action = lib[c.type];
    if (action) {
      const r = rank.get(ci);
      const id = action.files[r % action.files.length];
      const sample = decodeSample(id);
      const m = sampleMeta(id);
      const kind = action.anchor ?? "start";
      const anchor = kind === "peak" ? m.peak : kind === "contact" ? m.attack : 0;
      // The recording starts `pre` before the cue (never more than the anchor allows), skipping
      // any longer lead-in, so its anchor falls exactly on c.t.
      const pre = Math.min(anchor, MAX_PRE[kind] ?? 0);
      const free = action.ambient || action.signature;
      const tail = c.len ?? action.tail ?? (free ? Infinity : ONE_SHOT_TAIL);
      const from = anchor - pre;
      const to = anchor + tail;
      const norm = free ? 1 : Math.min(3, Math.max(0.25, 10 ** ((REF_DB - m.rmsPeak) / 20)));
      // A typewriter key is one recording: vary level and speed a little so a line does not machine-gun.
      const key = c.type === "key";
      const g = action.gain * gain * norm * (key ? 0.8 + 0.3 * jitter(r) : 1);
      const rate = key ? 0.94 + 0.12 * jitter(r + 97) : 1;
      const span = Math.min(to, sample.length / SR) - from;
      mixSample(buf, sample, Math.round((c.t - pre) * SR), g, {
        rate,
        from,
        to,
        fadeIn: kind === "peak" ? Math.min(0.12, Math.max(pre, 0.004)) : 0.004,
        fadeOut: free && tail === Infinity ? 0 : Math.min(0.25, 0.4 * span),
      });
      return;
    }
    const start = Math.round(c.t * SR);
    const type = aliasOf.get(c.type) ?? c.type;
    const v = VOICES[type] ?? VOICES[ALIASES[type]];
    if (!v)
      throw new Error(
        `unknown sfx type "${c.type}" (valid: ${[...Object.keys(lib), ...Object.keys(VOICES)].join(", ")})`,
      );
    // A cue's len cuts the voice too (a 10 ms fade, never a click), as it cuts a recording.
    const [voiceLen, fn] = v;
    const len = Math.min(voiceLen, c.len ?? Infinity);
    const total = Math.round(len * SR);
    const fade = Math.min(total, Math.round(0.01 * SR));
    for (let i = 0; i < total && start + i < n; i++) {
      const s = fn(i / SR) * gain * (total - i < fade && len < voiceLen ? (total - i) / fade : 1);
      if (start + i >= 0) buf[start + i] += s;
    }
  });
  softLimit(buf);
  return buf;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [, , cuesPath, out] = process.argv;
  if (!cuesPath || !out) {
    console.error("usage: node core/audio/sfx.mjs cues.json out.wav [--dur seconds] [--no-thin] [--library json]");
    process.exit(2);
  }
  for (let k = 0; k < process.argv.length; k++)
    if (process.argv[k] === "--library") addLibrary(process.argv[k + 1]);
  const cues = JSON.parse(readFileSync(cuesPath, "utf8"));
  const thin = !process.argv.includes("--no-thin");
  const i = process.argv.indexOf("--dur");
  const dur =
    i > 0
      ? Number(process.argv[i + 1])
      : Math.max(0, ...cues.map((c) => c.t)) + 2;
  try {
    if (thin) console.log(`sfx thinning: ${summary(cues.length, thinCues(cues))}`);
    writeWav(out, [renderSfx(cues, dur, { thin })]);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
  console.log(`sfx: ${cues.length} cues, ${dur}s → ${out}`);
}
