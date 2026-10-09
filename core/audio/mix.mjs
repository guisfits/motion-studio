// Sums the stems, balances them around the voice, normalises to -14 LUFS (streaming/social
// target), and muxes onto the silent render. The audio is cut to the picture's length.
//
//   node core/audio/mix.mjs --video out/silent-9x16.mp4 --out out/final-9x16.mp4
//        [--music music.wav] [--sfx sfx.wav] [--voice voice.wav]
//        [--voice-takes out/voices.auto.json]                more voice takes, each at its start
//        [--music-gain 1] [--sfx-gain 1] [--voice-gain 1]     trims (linear) on top of the balance below
//        [--fade-out 0.8]                                    seconds of fade at the end (0 = hard cut)
//        [--report]                                          print how the stems sit against the voice
//
// The voice leads (effects louder than the voice turn a film into noise). With a
// voice stem the mix is built around its measured speech level:
//   SFX    a typical hit sits SFX_BELOW_VOICE dB under the speech, and the SFX bus ducks SFX_DUCK dB
//          more while the voice speaks (sidechain from the voice, fast attack, ~250 ms release)
//   music  the bed sits MUSIC_BELOW_VOICE dB under the speech in the gaps, ducks MUSIC_DUCK dB more
//          under the voice (so MUSIC_BELOW_VOICE + MUSIC_DUCK = -20 dB under speech) and dips a
//          little under each SFX
//   master a gentle limiter, then two-pass loudnorm to -14 LUFS, true peak -1 dB
// Without a voice stem the old balance holds: the music at 0.8 and the SFX a few dB under it.
//
// Voice takes: a film may speak in more than one take, such as its own narration and a house
// outro that carries its own recorded voice from its own start. render.mjs writes the takes the
// film declares (window.VOICE_TAKES) to out/voices.auto.json as [{ file, at }]; they are summed
// with --voice (at 0) into one voice stem before anything is measured, so the balance, the ducking
// and the loudness all follow one speech level.
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import {
  decodeStereo,
  CHANNELS,
  speechLevelDb,
  activeWindows,
  powerMeanDb,
  hitLevelDb,
  windowDb,
  underSpeech,
} from "./levels.mjs";

// Levels are measured on the stems as the mix takes them in: stereo, 16 kHz, 50 ms windows.
const SR_MEASURE = 16000 * CHANNELS;

export const SFX_BELOW_VOICE = 12;
export const SFX_DUCK = 10;
export const MUSIC_BELOW_VOICE = 10.5;
export const MUSIC_DUCK = 8;
export const SFX_BELOW_MUSIC = 6; // no voice stem: the SFX hit under the music's mean level
// The music's release is slower than the speech's pauses, so it measures a little shallower than
// asked: aim a little deeper.
const MUSIC_DUCK_TRIM = 0.85;
const RATIO = 10;
// A compressor with ratio R takes (level - threshold) * (1 - 1/R) off: this is the distance from
// the speech level down to the threshold that makes the reduction equal to the duck depth.
const overThreshold = (depth) => depth / (1 - 1 / RATIO);

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : undefined;
}

const lin = (db) => 10 ** (db / 20);
const clampThr = (db) => Math.min(1, Math.max(0.00098, lin(db)));

// Gains and sidechain thresholds from the measured levels (all dBFS). Pure.
//   levels  { voice?: speech level, sfx?: hit level, music?: mean level }
//   trims   { voice, sfx, music } linear multipliers (default 1; music 0.8 when there is no voice)
export function planLevels(levels, trims = {}) {
  const tv = trims.voice ?? 1;
  const hasVoice = levels.voice != null;
  const tm = trims.music ?? (hasVoice ? 1 : 0.8);
  const ts = trims.sfx ?? 1;
  const db = (x) => 20 * Math.log10(x);
  const plan = {
    voice: tv,
    music: tm,
    sfx: ts,
    sfxDuck: null,
    musicDuck: null,
    ref: null,
  };
  if (hasVoice) {
    const ref = levels.voice + db(tv);
    plan.ref = ref;
    if (levels.sfx != null) {
      plan.sfx = ts * lin(ref - SFX_BELOW_VOICE - levels.sfx);
      plan.sfxHit = ref - SFX_BELOW_VOICE + db(ts);
    }
    if (levels.music != null)
      plan.music = tm * lin(ref - MUSIC_BELOW_VOICE - levels.music);
    plan.sfxDuck = {
      threshold: clampThr(ref - overThreshold(SFX_DUCK)),
      attack: 5,
      release: 250,
    };
    plan.musicDuck = {
      threshold: clampThr(ref - overThreshold(MUSIC_DUCK * MUSIC_DUCK_TRIM)),
      attack: 20,
      release: 500,
    };
  } else if (levels.music != null && levels.sfx != null) {
    const ref = levels.music + db(tm);
    plan.ref = ref;
    plan.sfx = ts * lin(ref - SFX_BELOW_MUSIC - levels.sfx);
    plan.sfxHit = ref - SFX_BELOW_MUSIC + db(ts);
  }
  return plan;
}

// Sums voice takes into one stem: each take delayed to its start `at` (seconds), nothing scaled,
// written to `out` as 48 kHz mono PCM. takes: [{ file, at = 0 }].
export function sumVoices(takes, out) {
  if (!takes?.length) throw new Error("sumVoices needs at least one take");
  const graph = takes
    .map(
      ({ at = 0 }, i) =>
        `[${i}:a]aformat=sample_rates=48000:channel_layouts=mono,adelay=${Math.round(at * 1000)}:all=1[v${i}]`,
    )
    .concat(
      `${takes.map((_, i) => `[v${i}]`).join("")}amix=inputs=${takes.length}:normalize=0:duration=longest[v]`,
    )
    .join(";");
  execFileSync("ffmpeg", [
    "-y",
    "-loglevel",
    "error",
    ...takes.flatMap(({ file }) => ["-i", file]),
    "-filter_complex",
    graph,
    "-map",
    "[v]",
    "-c:a",
    "pcm_s16le",
    out,
  ]);
  return out;
}

const STEREO = "aformat=sample_rates=48000:channel_layouts=stereo";

// The ffmpeg filter graph. Inputs are numbered 1.. in `stems` order (0 is the video).
//   stems  [["music"|"sfx"|"voice", file], ...]
//   plan   planLevels(...)
//   tail   loudnorm options string (pass 1: print_format=json; pass 2: the measured values), or
//          null for taps (the report: the stems after gain and ducking, and the sum, unnormalised)
export function buildGraph({ stems, plan, dur, fadeOut = 0.8, norm }) {
  const has = (n) => stems.some(([name]) => name === n);
  // Every stem is padded with silence to the picture's length: a sidechain ends with its key, so
  // a voice shorter than the picture (the outro after the last line) would otherwise end the music
  // and the SFX with it.
  const parts = stems.map(
    ([name], i) =>
      `[${i + 1}:a]${STEREO},apad=whole_dur=${dur},volume=${plan[name].toFixed(5)}[${name}]`,
  );
  const duck = (target, key, d) =>
    `[${target}][${key}]sidechaincompress=threshold=${d.threshold.toFixed(5)}:ratio=${RATIO}:attack=${d.attack}:release=${d.release}:makeup=1[${target}]`;
  if (has("voice")) {
    // The voice is split for the sidechains; the speech itself stays untouched.
    const keys = [has("sfx") && "vk_sfx", has("music") && "vk_music"].filter(
      Boolean,
    );
    // Nothing to key (the voice is the only stem): no split, the voice passes through as it is.
    if (keys.length)
      parts.push(
        `[voice]asplit=${keys.length + 1}[voice]${keys.map((k) => `[${k}]`).join("")}`,
      );
    if (has("sfx")) parts.push(duck("sfx", "vk_sfx", plan.sfxDuck));
    if (has("music")) parts.push(duck("music", "vk_music", plan.musicDuck));
  }
  // The music also dips under each SFX so a hit reads through the bed (gently: it follows the
  // already-ducked SFX, which are quiet by design).
  if (has("sfx") && has("music")) {
    parts.push("[sfx]asplit=2[sfx][sk]");
    const thr = plan.sfxHit == null ? 0.004 : clampThr(plan.sfxHit - 4.5);
    parts.push(
      `[music][sk]sidechaincompress=threshold=${thr.toFixed(5)}:ratio=3:attack=4:release=220:makeup=1[music]`,
    );
  }
  const names = stems.map(([name]) => name);
  if (norm == null) {
    // Report taps: each stem as it enters the sum, and the sum.
    const taps = names.map((n) => `[${n}]asplit=2[${n}][t_${n}]`);
    return [
      ...parts,
      ...taps,
      `${names.map((n) => `[${n}]`).join("")}amix=inputs=${names.length}:normalize=0,atrim=0:${dur}[t_mix]`,
    ].join(";");
  }
  const fade =
    fadeOut > 0
      ? `,afade=t=out:st=${(Number(dur) - fadeOut).toFixed(3)}:d=${fadeOut}`
      : "";
  parts.push(
    `${names.map((n) => `[${n}]`).join("")}amix=inputs=${names.length}:normalize=0,atrim=0:${dur},alimiter=limit=0.89:attack=5:release=60:level=disabled,loudnorm=${norm}${fade}[a]`,
  );
  return parts.join(";");
}

const probeDur = (video) =>
  execFileSync("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "csv=p=0",
    video,
  ])
    .toString()
    .trim();

// Measures the stems and returns the plan for them.
export function measurePlan({ music, sfx, voice, gains = {} }) {
  const levels = {};
  const v = voice ? decodeStereo(voice) : null;
  if (v) levels.voice = speechLevelDb(v, SR_MEASURE);
  if (sfx) levels.sfx = hitLevelDb(decodeStereo(sfx), SR_MEASURE);
  if (music) {
    // The bed is judged where it has to sit under the voice: its level over the windows where the
    // voice speaks (the whole stem when there is no voice).
    const db = windowDb(decodeStereo(music), SR_MEASURE);
    const speaking = v ? activeWindows(windowDb(v, SR_MEASURE)) : db.map((_, i) => i);
    levels.music = powerMeanDb(speaking.filter((i) => i < db.length).map((i) => db[i]).filter((x) => x > -60));
  }
  return { plan: planLevels(levels, gains), levels };
}

export function mix({
  video,
  out,
  music,
  sfx,
  voice,
  voiceTakes = [],
  gains = {},
  fadeOut = 0.8,
  report = false,
}) {
  // More than one take: summed into one voice stem first (see "Voice takes" above).
  const tmp = voiceTakes.length ? mkdtempSync(join(tmpdir(), "mix-voice-")) : null;
  try {
    if (tmp)
      voice = sumVoices(
        [...(voice ? [{ file: voice, at: 0 }] : []), ...voiceTakes],
        join(tmp, "voice.wav"),
      );
    return mixStems({ video, out, music, sfx, voice, gains, fadeOut, report });
  } finally {
    if (tmp) rmSync(tmp, { recursive: true, force: true });
  }
}

function mixStems({ video, out, music, sfx, voice, gains, fadeOut, report }) {
  const stems = [
    ["music", music],
    ["sfx", sfx],
    ["voice", voice],
  ].filter(([, f]) => f);
  if (!video || !out || !stems.length)
    throw new Error(
      "mix needs --video, --out and at least one of --music/--sfx/--voice",
    );
  const dur = probeDur(video);
  const { plan, levels } = measurePlan({ music, sfx, voice, gains });
  const inputs = ["-i", video, ...stems.flatMap(([, f]) => ["-i", f])];
  const graph = (norm) => buildGraph({ stems, plan, dur, fadeOut, norm });

  // Pass 1: measure the integrated loudness of the balanced mix; pass 2 applies exactly the gain
  // that lands it on -14 LUFS (linear, so the balance is not touched again).
  const probe = spawnSync(
    "ffmpeg",
    [
      "-hide_banner",
      "-nostats",
      ...inputs,
      "-filter_complex",
      graph("I=-14:TP=-1:LRA=11:print_format=json"),
      "-map",
      "[a]",
      "-f",
      "null",
      "-",
    ],
    { encoding: "utf8", maxBuffer: 1 << 26 },
  );
  const json = probe.stderr.match(/\{[^{}]*"input_i"[^{}]*\}/s);
  if (!json)
    throw new Error(
      `mix: loudnorm measurement failed\n${probe.stderr.slice(-800)}`,
    );
  const m = JSON.parse(json[0]);
  const norm = `I=-14:TP=-1:LRA=11:measured_I=${m.input_i}:measured_LRA=${m.input_lra}:measured_TP=${m.input_tp}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;
  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-loglevel",
      "error",
      ...inputs,
      "-filter_complex",
      graph(norm),
      "-map",
      "0:v",
      "-map",
      "[a]",
      "-c:v",
      "copy",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-ar",
      "48000",
      "-t",
      dur,
      "-movflags",
      "+faststart",
      out,
    ],
    { stdio: "inherit" },
  );
  if (report) console.log(mixReport({ stems, plan, levels, dur, inputs }));
  return out;
}

// How the stems sit against the voice in the mix, measured on the graph's own taps.
export function mixReport({ stems, plan, levels, dur, inputs }) {
  const dir = mkdtempSync(join(tmpdir(), "mix-report-"));
  try {
    const names = stems.map(([n]) => n);
    const args = [
      "-y",
      "-loglevel",
      "error",
      ...inputs,
      "-filter_complex",
      buildGraph({ stems, plan, dur, norm: null }),
    ];
    for (const n of [...names, "mix"])
      args.push(
        "-map",
        `[t_${n}]`,
        "-ar",
        "16000",
        join(dir, `${n}.wav`),
      );
    execFileSync("ffmpeg", args);
    const rd = (n) => decodeStereo(join(dir, `${n}.wav`));
    const r = (x) => x.toFixed(1);
    const lines = [];
    const voice = names.includes("voice") ? rd("voice") : null;
    if (voice) lines.push(`voice speech level ${r(levels.voice)} dBFS`);
    for (const n of names.filter((x) => x !== "voice")) {
      const s = rd(n);
      if (voice) {
        const u = underSpeech(voice, s, SR_MEASURE);
        lines.push(
          `${n} re voice: ${r(u.under - u.speech)} dB mean under speech (p90 ${r(u.hit - u.speech)}), ${r(u.gap - u.speech)} dB in the gaps`,
        );
      } else lines.push(`${n} level ${r(hitLevelDb(s, SR_MEASURE))} dBFS (p90)`);
    }
    return lines.join("\n");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const out = mix({
      video: arg("video"),
      out: arg("out"),
      music: arg("music"),
      sfx: arg("sfx"),
      voice: arg("voice"),
      voiceTakes: arg("voice-takes")
        ? JSON.parse(readFileSync(arg("voice-takes"), "utf8"))
        : [],
      gains: Object.fromEntries(
        ["music", "sfx", "voice"]
          .filter((k) => arg(`${k}-gain`))
          .map((k) => [k, Number(arg(`${k}-gain`))]),
      ),
      fadeOut:
        arg("fade-out") !== undefined ? Number(arg("fade-out")) : undefined,
      report: process.argv.includes("--report"),
    });
    console.log(`mix → ${out}`);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
