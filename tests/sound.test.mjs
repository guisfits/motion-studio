// Sound that serves the picture (effects too loud, out of sync with the motion, piling on top
// of each other read as noise): thinning, tails, levels against the voice, ducking, and where
// cues sit in time.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  thinCues,
  GAP,
  KEY_GAP,
  SAME_GAP,
  CAMERA_GAP,
  FIRST_WINDOW,
  BURST_MIN,
} from "../core/audio/thin.mjs";
import { renderSfx, loadLibrary, ONE_SHOT_TAIL } from "../core/audio/sfx.mjs";
import {
  buildGraph,
  planLevels,
  measurePlan,
  mix,
  SFX_BELOW_VOICE,
  MUSIC_BELOW_VOICE,
  SFX_BELOW_MUSIC,
} from "../core/audio/mix.mjs";
import { decodeStereo, underSpeech, CHANNELS } from "../core/audio/levels.mjs";
import { SR, writeWav, noiseSource } from "../core/audio/wav.mjs";
import { spring, springReach, SPRINGS } from "../core/lib/motion.js";
import { landsAt } from "../styles/vox/lib/kit.js";
import { EASE, WHOOSH_MIN, SWISH_MIN, WHOOSH_TRAVEL } from "../core/lib/table.js";

const sound = fileURLToPath(new URL("./fixture-sound", import.meta.url));
const table = fileURLToPath(new URL("./fixture-table", import.meta.url));
const dir = mkdtempSync(join(tmpdir(), "sound-test-"));
process.on("exit", () => rmSync(dir, { recursive: true, force: true }));

const db = (x) => 20 * Math.log10(x);
const kept = (cues) => thinCues(cues).kept.map((c) => [c.t, c.type]);
const reasons = (cues) => thinCues(cues).dropped.map((d) => [d.cue.type, d.reason]);

// --- thinning ------------------------------------------------------------------------------------

test("thinCues: two non-ambient cues never start closer than GAP; the earlier of equals wins", () => {
  const r = thinCues([
    { t: 1, type: "paper-place" },
    { t: 1 + GAP - 0.01, type: "thud-soft" },
    { t: 1 + GAP, type: "stamp" },
  ]);
  const t = r.kept.map((c) => c.t);
  for (let i = 1; i < t.length; i++) assert.ok(t[i] - t[i - 1] >= GAP - 1e-9, `${t[i]} - ${t[i - 1]}`);
  assert.equal(r.kept.length, 2);
  assert.deepEqual(r.dropped.map((d) => d.reason), ["gap"]);
  assert.equal(r.dropped[0].cue.type, "thud-soft", "the cue inside the gap goes, not the first one");
});

test("thinCues: priority is landing > camera > slide > text > keys, whatever the order in time", () => {
  // A pen starts 0.1 s before a landing, a slide 0.1 s after: the landing keeps its place.
  assert.deepEqual(kept([{ t: 0.9, type: "pen" }, { t: 1, type: "paper-place" }, { t: 1.1, type: "paper-slide" }]), [[1, "paper-place"]]);
  // A camera whoosh beats a slide and a pen; a slide beats a pen.
  assert.deepEqual(kept([{ t: 1, type: "pen" }, { t: 1.1, type: "paper-slide" }, { t: 1.2, type: "whoosh" }]), [[1.2, "whoosh"]]);
  assert.deepEqual(kept([{ t: 1, type: "pen" }, { t: 1.1, type: "paper-slide" }]), [[1.1, "paper-slide"]]);
  // The signature (the sonic logo) is admitted before everything: all near it yield, even a landing.
  assert.deepEqual(kept([{ t: 1, type: "stamp" }, { t: 1.1, type: "logo" }]), [[1.1, "logo"]]);
  // Far enough apart, all of them sound.
  assert.equal(kept([{ t: 1, type: "pen" }, { t: 2, type: "paper-slide" }, { t: 3, type: "whoosh" }, { t: 4, type: "stamp" }]).length, 4);
});

test("thinCues: a run of more than BURST_MIN keys is one burst; a short run keeps its keys", () => {
  const run = (n, step) => Array.from({ length: n }, (_, i) => ({ t: 1 + i * step, type: "key", gain: 0.6 }));
  const long = thinCues(run(BURST_MIN + 4, 0.13));
  assert.deepEqual(long.kept.map((c) => c.type), ["burst"]);
  assert.equal(long.kept[0].t, 1, "the burst starts with the run");
  assert.ok(long.kept[0].len >= 0.5 && long.kept[0].len <= 1.4, `burst len ${long.kept[0].len}`);
  assert.equal(long.kept[0].gain, 0.6);
  assert.ok(long.dropped.every((d) => d.reason === "burst"));
  // BURST_MIN keys or fewer stay keys.
  assert.equal(thinCues(run(BURST_MIN, 0.13)).kept.filter((c) => c.type === "key").length, BURST_MIN);
  // Keys faster than KEY_GAP are thinned to one per KEY_GAP before the run is counted.
  const fast = thinCues(run(6, KEY_GAP / 2));
  assert.deepEqual(fast.dropped.map((d) => d.reason), Array(3).fill("key-rate"));
  assert.equal(fast.kept.length, 3);
  // Two runs far apart are two bursts.
  const two = thinCues([...run(BURST_MIN + 2, 0.13), ...run(BURST_MIN + 2, 0.13).map((c) => ({ ...c, t: c.t + 5 }))]);
  assert.deepEqual(two.kept.map((c) => c.type), ["burst", "burst"]);
});

test("thinCues: the same sound twice inside SAME_GAP is one event; one whoosh per CAMERA_GAP", () => {
  // paper-place twice in 0.5 s (0.4 apart clears GAP, so the repeat rule is what drops it).
  assert.ok(0.4 > GAP && 0.4 < SAME_GAP);
  assert.deepEqual(reasons([{ t: 1, type: "paper-place" }, { t: 1.4, type: "paper-place" }]), [["paper-place", "repeat"]]);
  // Another landing at the same distance is a different sound and stays.
  assert.equal(kept([{ t: 1, type: "paper-place" }, { t: 1.4, type: "stamp" }]).length, 2);
  // Past SAME_GAP the repeat is a new event.
  assert.equal(kept([{ t: 1, type: "paper-place" }, { t: 1 + SAME_GAP, type: "paper-place" }]).length, 2);
  // Whooshes: 0.6 s apart is one travel (the louder stays), CAMERA_GAP apart are two.
  const w = thinCues([{ t: 1, type: "whoosh", gain: 0.4 }, { t: 1.6, type: "whoosh", gain: 0.9 }]);
  assert.deepEqual(w.kept.map((c) => c.gain), [0.9]);
  assert.deepEqual(w.dropped.map((d) => d.reason), ["one-per-travel"]);
  assert.equal(kept([{ t: 1, type: "whoosh" }, { t: 1 + CAMERA_GAP, type: "whoosh" }]).length, 2);
});

test("thinCues: nothing starts inside the first window of a louder cue", () => {
  // The bell's "tim" at 1.0; a key 0.15 s later clears KEY_GAP but is inside the bell's first window.
  assert.ok(0.15 >= KEY_GAP && 0.15 < FIRST_WINDOW);
  const r = thinCues([{ t: 1, type: "ding" }, { t: 1.15, type: "key" }]);
  assert.deepEqual(r.kept.map((c) => c.type), ["ding"]);
  assert.deepEqual(r.dropped.map((d) => d.reason), ["masked"]);
  // Outside the window the key sounds.
  assert.equal(kept([{ t: 1, type: "ding" }, { t: 1 + FIRST_WINDOW + 0.01, type: "key" }]).length, 2);
});

test("thinCues: ambient beds and the signature ignore the gap rules; ambients are never dropped", () => {
  const cues = [
    { t: 1, type: "church-room" },
    { t: 1, type: "fire" },
    { t: 1.02, type: "bells-far" },
    { t: 1.05, type: "stamp" },
    { t: 1.05, type: "logo" },
  ];
  const r = thinCues(cues);
  const types = r.kept.map((c) => c.type);
  for (const a of ["church-room", "fire", "bells-far"]) assert.ok(types.includes(a), `${a} kept`);
  assert.ok(types.includes("logo"));
  assert.ok(!types.includes("stamp"), "the landing under the logo yields");
  assert.ok(r.dropped.every((d) => !["church-room", "fire", "bells-far", "logo"].includes(d.cue.type)));
});

test("thinCues: deterministic, order-independent, never mutates its input, keeps t order", () => {
  const cues = Array.from({ length: 40 }, (_, i) => ({
    t: Math.round((i * 0.137 + (i % 3) * 0.05) * 1000) / 1000,
    type: ["paper-place", "pen", "whoosh", "key", "stamp", "paper-slide", "ding"][i % 7],
    gain: 0.5 + (i % 4) / 8,
  }));
  const frozen = JSON.stringify(cues);
  const a = thinCues(cues);
  assert.equal(JSON.stringify(cues), frozen, "input untouched");
  assert.deepEqual(thinCues(cues), a, "same list, same result");
  const t = a.kept.map((c) => c.t);
  assert.deepEqual(t, [...t].sort((x, y) => x - y));
  assert.ok(a.kept.length < cues.length, "a busy list is thinned");
  // The same cues listed in the reverse order keep the same sounds (time decides, not list order).
  const rev = thinCues([...cues].reverse());
  assert.deepEqual(rev.kept.map((c) => [c.t, c.type]).sort(), a.kept.map((c) => [c.t, c.type]).sort());
  // Nothing in, nothing out.
  assert.deepEqual(thinCues([]), { kept: [], dropped: [] });
});

// --- tails ---------------------------------------------------------------------------------------

// The last sample louder than the noise floor, in seconds.
const lastSound = (buf) => {
  let i = buf.length - 1;
  while (i >= 0 && Math.abs(buf[i]) < 1e-5) i--;
  return (i + 1) / SR;
};

test("renderSfx: a one-shot never rings past ONE_SHOT_TAIL (0.6 s) after its cue; library tails bound the rest", () => {
  assert.equal(ONE_SHOT_TAIL, 0.6);
  const lib = loadLibrary();
  const T = 1;
  for (const [name, a] of Object.entries(lib)) {
    if (a.ambient || a.signature) continue;
    const limit = a.tail ?? ONE_SHOT_TAIL;
    const buf = renderSfx([{ t: T, type: name }], T + 6, { thin: false });
    const end = lastSound(buf);
    assert.ok(end > T, `${name} is audible`);
    assert.ok(end <= T + limit + 0.01, `${name} ends ${(end - T).toFixed(3)} s after its cue (limit ${limit})`);
  }
  // A cue's own len shortens it further.
  const short = lastSound(renderSfx([{ t: T, type: "church-bell", len: 0.3 }], T + 6, { thin: false }));
  assert.ok(short <= T + 0.31, `len 0.3 → ${short - T}`);
});

test("renderSfx thins by default; thin: false renders the list as given", () => {
  const cues = [{ t: 1, type: "stamp" }, { t: 1.1, type: "thud-soft" }];
  const energy = (b) => b.reduce((s, x) => s + x * x, 0);
  const thinned = renderSfx(cues, 3);
  const raw = renderSfx(cues, 3, { thin: false });
  assert.deepEqual(thinned, renderSfx([cues[0]], 3, { thin: false }), "the cue inside the gap is not rendered");
  assert.ok(energy(raw) > energy(thinned));
});

// --- levels --------------------------------------------------------------------------------------

test("planLevels: SFX hits sit 12 dB under the speech, the bed 10.5 dB under it in the gaps", () => {
  assert.equal(SFX_BELOW_VOICE, 12);
  assert.equal(MUSIC_BELOW_VOICE, 10.5);
  const levels = { voice: -22.3, sfx: -30, music: -34 };
  const p = planLevels(levels, {});
  assert.equal(p.voice, 1, "the voice is never touched");
  assert.ok(Math.abs(levels.sfx + db(p.sfx) - (levels.voice - 12)) < 1e-9, "a typical hit: speech − 12 dB");
  assert.ok(Math.abs(p.sfxHit - (levels.voice - 12)) < 1e-9);
  assert.ok(Math.abs(levels.music + db(p.music) - (levels.voice - 10.5)) < 1e-9, "bed in the gaps: speech − 10.5 dB");
  // Ducked under the voice the SFX end ~22 dB and the bed ~18.5 dB under it (music + duck ≈ −20 with its trim).
  assert.equal(p.sfxDuck.attack, 5);
  assert.equal(p.sfxDuck.release, 250);
  assert.ok(p.sfxDuck.threshold < 1 && p.sfxDuck.threshold > 0.00098);
  assert.ok(p.musicDuck.release > p.sfxDuck.release, "the bed recovers more slowly than the effects");
  // The voice trim moves the whole reference; the sfx trim is on top.
  const t = planLevels(levels, { voice: 2, sfx: 0.5 });
  assert.ok(Math.abs(levels.sfx + db(t.sfx) - (levels.voice + db(2) - 12 + db(0.5))) < 1e-9);
  assert.equal(t.voice, 2);
});

test("planLevels without a voice: the music keeps 0.8, the SFX hit 6 dB under the bed; nothing ducks", () => {
  assert.equal(SFX_BELOW_MUSIC, 6);
  const p = planLevels({ sfx: -30, music: -20 }, {});
  assert.equal(p.music, 0.8);
  assert.ok(Math.abs(-30 + db(p.sfx) - (-20 + db(0.8) - 6)) < 1e-9);
  assert.equal(p.sfxDuck, null);
  assert.equal(p.musicDuck, null);
  // A stem alone just passes through.
  const solo = planLevels({ sfx: -30 }, {});
  assert.equal(solo.sfx, 1);
  assert.equal(solo.voice, 1);
});

// --- the filter graph ----------------------------------------------------------------------------

const stems3 = [["music", "m.wav"], ["sfx", "s.wav"], ["voice", "v.wav"]];
const plan3 = planLevels({ voice: -22, sfx: -30, music: -30 });

test("buildGraph: the SFX bus and the music bed are both sidechain-compressed by the voice", () => {
  const g = buildGraph({ stems: stems3, plan: plan3, dur: 10, norm: "I=-14" });
  assert.match(g, /\[voice\]asplit=3\[voice\]\[vk_sfx\]\[vk_music\]/, "the voice is split for the two sidechains and passes through");
  assert.match(g, /\[sfx\]\[vk_sfx\]sidechaincompress=/);
  assert.match(g, /\[music\]\[vk_music\]sidechaincompress=/);
  assert.equal((g.match(/sidechaincompress/g) ?? []).length, 3, "two keyed by the voice, one by the SFX (the bed dips under a hit)");
  assert.match(g, /\[music\]\[sk\]sidechaincompress/);
  assert.match(g, /loudnorm=I=-14/);
  assert.match(g, /alimiter/);
  // The voice itself carries no compressor: it stays the reference.
  assert.doesNotMatch(g, /\[voice\]\[[a-z_]+\]sidechaincompress/);
});

test("buildGraph: with only the voice there is no asplit; with one stem to key it splits in two", () => {
  const voiceOnly = buildGraph({ stems: [["voice", "v.wav"]], plan: planLevels({ voice: -22 }), dur: 10, norm: "I=-14" });
  assert.doesNotMatch(voiceOnly, /asplit/, "no asplit=1");
  assert.doesNotMatch(voiceOnly, /sidechaincompress/);
  const withSfx = buildGraph({ stems: [["sfx", "s.wav"], ["voice", "v.wav"]], plan: plan3, dur: 10, norm: "I=-14" });
  assert.match(withSfx, /\[voice\]asplit=2\[voice\]\[vk_sfx\]/);
  assert.doesNotMatch(withSfx, /vk_music|\[sk\]/);
  const withMusic = buildGraph({ stems: [["music", "m.wav"], ["voice", "v.wav"]], plan: plan3, dur: 10, norm: "I=-14" });
  assert.match(withMusic, /\[voice\]asplit=2\[voice\]\[vk_music\]/);
});

test("buildGraph: music + sfx without a voice has no voice sidechain; the bed still dips under a hit", () => {
  const plan = planLevels({ sfx: -30, music: -20 });
  const g = buildGraph({ stems: [["music", "m.wav"], ["sfx", "s.wav"]], plan, dur: 10, norm: "I=-14" });
  assert.doesNotMatch(g, /vk_|\[voice\]/);
  assert.match(g, /\[music\]\[sk\]sidechaincompress/);
});

// Real ffmpeg: every combination of stems builds a graph ffmpeg accepts (a report-tap one too).
test("buildGraph: every stem combination is accepted by ffmpeg, with and without report taps", { timeout: 120_000 }, () => {
  const wav = join(dir, "noise.wav");
  const n = noiseSource(3);
  const ch = new Float32Array(SR * 2).map(() => n() * 0.05);
  writeWav(wav, [ch]);
  const video = join(dir, "v.mp4");
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "lavfi", "-i", "color=black:s=64x64:d=2:r=10", "-c:v", "libx264", "-pix_fmt", "yuv420p", video]);
  const combos = [["voice"], ["music"], ["sfx"], ["music", "sfx"], ["voice", "music"], ["voice", "sfx"], ["voice", "music", "sfx"]];
  for (const names of combos) {
    const stems = names.map((x) => [x, wav]);
    const plan = planLevels(names.includes("voice") ? { voice: -22, sfx: -30, music: -30 } : { sfx: -30, music: -30 });
    for (const norm of ["I=-14:TP=-1:LRA=11:print_format=json", null]) {
      const graph = buildGraph({ stems, plan, dur: 2, norm });
      // Every labelled output must be taken: [a], or each stem's tap and the sum.
      const taps = norm ? ["a"] : [...names.map((x) => `t_${x}`), "t_mix"];
      const out = taps.flatMap((l) => ["-map", `[${l}]`, "-f", "null", "-"]);
      execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", video, ...stems.flatMap(([, f]) => ["-i", f]), "-filter_complex", graph, ...out], { stdio: "pipe" });
    }
    assert.ok(true, names.join("+"));
  }
});

test("mix(): a voice-only mix and a music + sfx mix (no voice) both render", { timeout: 120_000 }, () => {
  const video = join(dir, "v.mp4");
  const wav = join(dir, "noise.wav");
  for (const [label, o] of [["voice", { voice: wav }], ["nov", { music: wav, sfx: wav }]]) {
    const out = join(dir, `${label}.mp4`);
    mix({ video, out, ...o });
    const codec = execFileSync("ffprobe", ["-v", "error", "-select_streams", "a:0", "-show_entries", "stream=codec_name", "-of", "csv=p=0", out]).toString().trim();
    assert.equal(codec, "aac", `${label}: an audio track`);
  }
});

// --- ducking depth, measured ---------------------------------------------------------------------

// A speech-like voice: 3 s phrases with 1.5 s of silence between them, each phrase a string of
// 0.12–0.30 s syllables of low-passed noise at random loudness, with short dips between syllables and
// a gap after some (the way a talker breathes). A steady noise would be a harder target for a
// compressor than speech and would read 6 dB deeper; its level (about −22 dBFS) is the real voice's.
function syllables(seed) {
  const r = noiseSource(seed);
  const rnd = () => r() * 0.5 + 0.5;
  const env = new Float32Array(18 * SR);
  let t = 0;
  while (t < 18) {
    const phrase = Math.floor(t / 4.5);
    if (t >= phrase * 4.5 + 3) {
      t = (phrase + 1) * 4.5;
      continue;
    }
    const d = 0.12 + 0.18 * rnd();
    const a = 0.35 + 0.65 * rnd();
    for (let i = Math.floor(t * SR); i < Math.min(env.length, Math.floor((t + d) * SR)); i++)
      env[i] = a * Math.sin((Math.PI * (i / SR - t)) / d) ** 1.5;
    t += d + (r() > 0.6 ? 0.18 : 0.02);
  }
  return env;
}

function synthStems() {
  const env = syllables(3);
  const n = noiseSource(11);
  let lp = 0;
  let lp2 = 0;
  const voice = env.map((e) => {
    lp += 0.08 * (n() - lp);
    lp2 += 0.08 * (lp - lp2);
    return lp2 * 8 * e * 0.25;
  });
  const steady = (amp) => {
    const m = noiseSource(5);
    return new Float32Array(env.length).map(() => m() * amp);
  };
  writeWav(join(dir, "duck-voice.wav"), [voice, voice]);
  writeWav(join(dir, "duck-sfx.wav"), [steady(0.03), steady(0.03)]);
  writeWav(join(dir, "duck-music.wav"), [steady(0.03), steady(0.03)]);
  return { voice: join(dir, "duck-voice.wav"), sfx: join(dir, "duck-sfx.wav"), music: join(dir, "duck-music.wav") };
}

// Runs the mix graph on the synthetic stems and returns, per stem, how far it sits under the voice's
// speech and how much deeper it is there than in the gaps (the duck), from the graph's own taps.
function duckDepth(which) {
  const files = synthStems();
  const stems = which.map((w) => [w, files[w]]);
  const { plan } = measurePlan({ voice: files.voice, ...Object.fromEntries(which.filter((w) => w !== "voice").map((w) => [w, files[w]])) });
  const video = join(dir, "v.mp4");
  const graph = buildGraph({ stems, plan, dur: 18, norm: null });
  const args = ["-y", "-loglevel", "error", "-i", video, ...stems.flatMap(([, f]) => ["-i", f]), "-filter_complex", graph];
  const names = stems.map(([w]) => w);
  for (const w of [...names, "mix"]) args.push("-map", `[t_${w}]`, "-ar", "16000", join(dir, `d_${which.join("")}_${w}.wav`));
  execFileSync("ffmpeg", args);
  const voice = decodeStereo(join(dir, `d_${which.join("")}_voice.wav`));
  const out = {};
  for (const w of names.filter((x) => x !== "voice")) {
    const u = underSpeech(voice, decodeStereo(join(dir, `d_${which.join("")}_${w}.wav`)), 16000 * CHANNELS);
    out[w] = { duck: u.gap - u.under, belowSpeech: u.speech - u.under, gapBelowSpeech: u.speech - u.gap };
  }
  return out;
}

test("under the voice the SFX bus ducks 8–12 dB (design 10) and the bed 7–12 dB (design 8)", { timeout: 120_000 }, () => {
  const video = join(dir, "v.mp4");
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "lavfi", "-i", "color=black:s=64x64:d=18:r=10", "-c:v", "libx264", "-pix_fmt", "yuv420p", video]);
  // Each stem alone with the voice, so the bed's dip under hits does not enter the SFX measurement.
  const sfx = duckDepth(["sfx", "voice"]).sfx;
  assert.ok(sfx.duck >= 8 && sfx.duck <= 12, `sfx duck ${sfx.duck.toFixed(1)} dB`);
  const music = duckDepth(["music", "voice"]).music;
  assert.ok(music.duck >= 7 && music.duck <= 12, `music duck ${music.duck.toFixed(1)} dB`);
  // In the pauses they sit near their planned level (12 and 10.5 dB under the speech; the release
  // tail after a phrase makes the measure a little lower, never higher), and under speech both are
  // far under it: the voice leads.
  assert.ok(sfx.gapBelowSpeech >= 11 && sfx.gapBelowSpeech <= 16, `sfx in the gaps ${sfx.gapBelowSpeech.toFixed(1)} dB under speech`);
  assert.ok(music.gapBelowSpeech >= 9.5 && music.gapBelowSpeech <= 14, `music in the gaps ${music.gapBelowSpeech.toFixed(1)} dB under speech`);
  assert.ok(sfx.belowSpeech >= 20, `sfx under speech ${sfx.belowSpeech.toFixed(1)} dB`);
  assert.ok(music.belowSpeech >= 18, `music under speech ${music.belowSpeech.toFixed(1)} dB`);
});

// --- where cues sit in time ----------------------------------------------------------------------

test("springReach: the first moment a spring has covered `frac` of its way, exact to the millisecond", () => {
  for (const [k, d, frac] of [[75, 15, 0.95], [120, 16, 0.95], [80, 17, 0.95], [140, 15, 0.95], [55, 11, 0.5], [95, 17, 0.5], [320, 30, 0.95]]) {
    const r = springReach(k, d, frac);
    assert.ok(spring(r, k, d) >= frac, `${k}/${d}: at ${r} the spring is past ${frac}`);
    assert.ok(spring(r - 0.001, k, d) < frac, `${k}/${d}: a millisecond earlier it is not`);
  }
  // Reference values for common entrance springs (3 decimals).
  const at = (k, d, f) => Number(springReach(k, d, f).toFixed(3));
  assert.equal(at(75, 15), 0.438, "scrap");
  assert.equal(at(120, 16), 0.277, "post-it");
  assert.equal(at(80, 17), 0.49, "sheet");
  assert.equal(at(140, 15), 0.224, "sticker");
  assert.equal(at(55, 11, 0.5), 0.197, "stamp lift whoosh");
  // Never reached → null (a spring that cannot get there is not given a time).
  assert.equal(springReach(75, 15, 1.5), null);
  assert.equal(springReach(75, 15, 0.95, 0.1), null);
  // A stiffer spring lands sooner; the middle of a travel comes before its landing.
  assert.ok(springReach(320, 30) < springReach(170, 26));
  assert.ok(springReach(95, 17, 0.5) < springReach(95, 17));
});

test("landsAt: tIn + the spring's reach; a hand-stepped entrance lands on the first step at or after it", () => {
  const r = springReach(SPRINGS.snappy.k, SPRINGS.snappy.d);
  assert.equal(landsAt(1), 1 + r);
  assert.equal(landsAt(1, SPRINGS.heavy), 1 + springReach(SPRINGS.heavy.k, SPRINGS.heavy.d));
  // 0.202 s on a 12 fps clock is the 3rd step: 0.25 s.
  assert.ok(Math.abs(landsAt(0.2, SPRINGS.snappy, 12) - 0.45) < 1e-12);
  // Landing exactly on a step stays on it (no jump to the next).
  const exact = { k: 100, d: 20 };
  const re = springReach(exact.k, exact.d);
  const onGrid = landsAt(0, exact, 1 / re);
  assert.ok(Math.abs(onGrid - re) < 1e-9, `${onGrid} vs ${re}`);
  assert.ok(landsAt(0.3, SPRINGS.snappy, 12) >= 0.3 + r, "never before the spring is there");
});

// Evaluate fn(arg) in a fixture page (render mode).
async function inPage(film, arg, fn) {
  const { chromium } = await import("playwright");
  const { startServer, filmUrl } = await import("../core/server.mjs");
  const server = await startServer();
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
    await page.goto(filmUrl(server, film, "?format=9x16&render=1"));
    await page.waitForFunction(() => window.ready === true, null, { timeout: 60_000 });
    return await page.evaluate(fn, arg);
  } finally {
    await browser.close();
    server.close();
  }
}

test("typewriter: key i is heard when character i appears, at tIn + (i + 1) / cps; the bell after the last", { timeout: 120_000 }, async () => {
  // "AB C" at 10 cps from 0.5 s: the fixture's own cues, and what the screen shows at each key.
  const { cues, shown } = await inPage(sound, null, async () => {
    const cues = window.TW_CUES();
    const shown = [];
    for (const c of cues) {
      await window.seek(c.t + 0.005);
      shown.push(window.TW_TEXT());
    }
    return { cues, shown };
  });
  const keys = cues.filter((c) => c.type === "key").map((c) => Number(c.t.toFixed(9)));
  assert.deepEqual(keys, [0.6, 0.7, 0.9], "A at 0.6, B at 0.7, the space is silent, C at 0.9");
  const ding = cues.find((c) => c.type === "ding");
  assert.equal(ding.t.toFixed(3), "0.950");
  // At each key the character has just appeared; the bell rings over the whole line.
  assert.deepEqual(shown, ["A", "AB", "AB C", "AB C"]);
});

test("Table.cues: one whoosh per real camera travel, at the middle of its spring; small moves are silent", { timeout: 120_000 }, async () => {
  const half = springReach(EASE.move.k, EASE.move.d, 0.5);
  const cuesFor = (keys) =>
    inPage(table, keys, (keys) => {
      window.TABLE.camera(keys);
      return window.TABLE.cues().filter((c) => c.type === "whoosh" || c.type === "swish");
    });
  const home = { x: 540, y: 960, z: 1 };
  // Under WHOOSH_MIN px of travel: silent. Just over: a whoosh.
  assert.deepEqual(await cuesFor([[0, home], [1, { ...home, x: 540 + WHOOSH_MIN - 50 }]]), []);
  const one = await cuesFor([[0, home], [1, { ...home, x: 540 + WHOOSH_MIN + 50 }]]);
  assert.deepEqual(one.map((c) => c.type), ["whoosh"]);
  assert.ok(Math.abs(one[0].t - (1 + half)) < 1e-9, `at the middle of the spring (${one[0].t})`);
  // Over SWISH_MIN it is a whip, louder (capped at 0.9).
  const whip = await cuesFor([[0, home], [2, { ...home, x: 540 + SWISH_MIN + 100 }]]);
  assert.deepEqual(whip.map((c) => c.type), ["swish"]);
  assert.ok(whip[0].gain > one[0].gain && whip[0].gain <= 0.9);
  // The whip eases by its own spring when asked to.
  const fast = await cuesFor([[0, home], [2, { ...home, x: 540 + SWISH_MIN + 100, ease: "whip" }]]);
  assert.ok(Math.abs(fast[0].t - (2 + springReach(EASE.whip.k, EASE.whip.d, 0.5))) < 1e-9);
  // Keys closer than WHOOSH_TRAVEL are one travel: one cue, the longer move's.
  assert.ok(0.6 < WHOOSH_TRAVEL);
  const merged = await cuesFor([[0, home], [1, { ...home, x: 540 + 600 }], [1.6, { ...home, x: 540 + 600 + 900 }]]);
  assert.equal(merged.length, 1, "two keys 0.6 s apart are one travel");
  assert.equal(merged[0].type, "whoosh");
  assert.ok(Math.abs(merged[0].t - (1.6 + half)) < 1e-9, "the longer (900 px) move of the two keeps its place");
  // Far apart they are two.
  const apart = await cuesFor([[0, home], [1, { ...home, x: 540 + 600 }], [3, { ...home, x: 540 + 1200 }]]);
  assert.equal(apart.length, 2);
  // Zoom and roll count as travel (900 px per unit of zoom, 14 px per degree), and a key without z is fine.
  assert.equal((await cuesFor([[0, home], [1, { x: 540, y: 960, z: 1.7 }]])).length, 1, "a 0.7 zoom is 630 px of travel");
  assert.equal((await cuesFor([[0, home], [1, { x: 540, y: 960, z: 1, r: 40 }]])).length, 1, "40° of roll is 560 px of travel");
  assert.equal((await cuesFor([[0, { x: 540, y: 960 }], [1, { x: 540 + 700, y: 960 }]])).length, 1);
});
