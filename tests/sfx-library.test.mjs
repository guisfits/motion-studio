import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { SR } from "../core/audio/wav.mjs";
import { VOICES, ALIASES, decodeSample, loadLibrary, renderSfx, sampleFile } from "../core/audio/sfx.mjs";

const audio = fileURLToPath(new URL("../core/audio/", import.meta.url));
const engine = fileURLToPath(new URL("../", import.meta.url));
const lib = loadLibrary();
// The library as declared (every action, whether or not its files are on disk).
const declared = JSON.parse(readFileSync(join(audio, "sfx-library.json"), "utf8"));
const sources = JSON.parse(readFileSync(join(audio, "sfx-sources.json"), "utf8"));
const committed = readdirSync(join(audio, "sfx")).filter((f) => f.endsWith(".mp3")).map((f) => f.slice(0, -4));
const fetchedAll = Object.keys(sources).every((id) => existsSync(join(audio, "sfx/fetched", `${id}.mp3`)));
const NOT_FETCHED = fetchedAll ? false : "Mixkit files not fetched (node core/audio/fetch-sfx.mjs)";

// Names the components emit as auto cues (vox kit, table, voice) plus the extra actions.
const AUTO = ["paper-place", "paper-slide", "pour", "drip", "marker", "pen", "thud-soft", "stamp", "bell", "key", "ding", "whoosh", "swish", "tear"];
const EXTRA = [
  "page", "book-close", "crumple", "tape", "seal", "burn", "fire", "match", "candle", "splash", "impact", "riser", "swell",
  "church-bell", "bells-far", "church-room", "creak", "door", "click", "pop", "return", "burst",
  "stamp-wood", "stamp-ink", "sticker", "sticker-peel", "postit-peel", "postit-stick", "squeak", "highlight", "quill", "quill-long",
  "space", "carriage", "paper-slide-wood", "paper-drop", "riffle", "paper-wipe", "book-thud", "knock", "glass-clink", "flame",
  "flame-whoosh", "blow-out", "whoosh-deep", "riser-soft", "reverse-cymbal", "boom", "bell-deep", "organ", "choir",
  "swoosh", "thud", "slap",
];
const COMPONENTS = ["styles/vox/lib/kit.js", "styles/vox/lib/moves.js", "core/lib/table.js", "core/lib/voice.js"];

// Every `type:` a component's cues() / cue list can emit, read from the source (string literals in
// the expression, ignoring comparisons such as `kind === "underline"`).
function componentCueTypes() {
  const types = new Set();
  for (const file of COMPONENTS) {
    const src = readFileSync(join(engine, file), "utf8");
    for (const m of src.matchAll(/\btype:\s*([^,}\n]+)/g)) {
      const expr = m[1].replace(/[=!]==?\s*"[^"]*"/g, "");
      for (const q of expr.matchAll(/"([a-z][a-z-]*)"/g)) types.add(q[1]);
    }
  }
  return types;
}

const resolved = (name) => (declared[name]?.alias ? declared[declared[name].alias] : declared[name]);

test("the library declares every auto-cue name and the extra actions", () => {
  for (const name of [...AUTO, ...EXTRA]) {
    const a = resolved(name);
    assert.ok(a, `missing action ${name}`);
    assert.ok(a.files.length > 0 && a.gain > 0, name);
  }
});

test("every cue type a component emits has a recording, and a voice to fall back on", () => {
  const types = componentCueTypes();
  assert.ok(types.size >= 14, `found only ${[...types]}`);
  for (const t of AUTO) assert.ok(types.has(t), `AUTO lists ${t} but no component emits it`);
  for (const t of types) {
    assert.ok(resolved(t), `component cue "${t}" has no recording in sfx-library.json`);
    assert.ok(VOICES[t] ?? VOICES[ALIASES[t]], `component cue "${t}" has no synthesized fallback`);
  }
});

test("every recorded action falls back to a synthesized voice when its files are absent", () => {
  for (const name of Object.keys(declared)) {
    const target = declared[name].alias ?? name;
    assert.ok(VOICES[target] ?? VOICES[ALIASES[target]] ?? declared[target]?.ambient ?? declared[target]?.signature ??
      // Actions with a committed file never fall back.
      resolved(name).files.some((id) => committed.includes(id)),
      `${name} has no fallback voice and depends on fetched files`);
  }
  for (const name of Object.keys(ALIASES)) assert.ok(resolved(name), `${name} has only a synthesized voice`);
  assert.ok(VOICES.thump);
});

test("every file id is either committed (CC0) or fetched from a recipe, never both", () => {
  const ids = new Set(Object.values(declared).flatMap((a) => a.files ?? []));
  for (const id of ids) {
    const c = committed.includes(id);
    const f = id in sources;
    assert.ok(c !== f, `${id}: committed=${c}, recipe=${f}`);
  }
  for (const id of committed) assert.ok(ids.has(id), `sfx/${id}.mp3 is not in the library`);
  for (const id of Object.keys(sources)) {
    assert.ok(ids.has(id), `sfx-sources.json: ${id} is not in the library`);
    assert.match(sources[id].url, /^https:\/\/assets\.mixkit\.co\//, id);
    assert.ok(sources[id].len > 0 && sources[id].len <= 13, `${id} len`);
  }
});

test("every loaded action lists present files and aliases resolve", () => {
  if (lib.whoosh) assert.deepEqual(lib.swoosh.files, lib.whoosh.files);
  assert.deepEqual(lib.thud.files, lib["thud-soft"].files);
  for (const [name, a] of Object.entries(lib)) {
    assert.ok(Array.isArray(a.files) && a.files.length > 0, name);
    assert.ok(a.gain > 0 && a.gain <= 1.5, `${name} gain ${a.gain}`);
    for (const id of a.files) assert.ok(existsSync(sampleFile(id)), `${name}: ${id} missing`);
  }
});

test("every loaded file decodes to audible, peak-normalised audio", () => {
  for (const id of new Set(Object.values(lib).flatMap((a) => a.files))) {
    const s = decodeSample(id);
    assert.ok(s.length > 0.05 * SR, `${id} too short`);
    let peak = 0;
    for (const v of s) peak = Math.max(peak, Math.abs(v));
    assert.ok(peak > 0.1, `${id} is silent (peak ${peak})`);
    assert.ok(peak < 0.99, `${id} clips (peak ${peak})`);
    assert.ok(peak > 0.5, `${id} is not peak-normalised (peak ${peak})`);
    assert.ok(s.length < 13 * SR, `${id} is longer than 13 s`);
  }
});

test("a contact cue lands on its time: silent before the pre-roll, loudest attack at t", () => {
  const t = 1.5;
  const buf = renderSfx([{ t, type: "stamp" }], 3);
  const at = Math.round(t * SR);
  const pre = Math.round(0.25 * SR);
  let before = 0;
  for (let i = 0; i < at - pre; i++) before = Math.max(before, Math.abs(buf[i]));
  let after = 0;
  for (let i = at; i < at + 0.3 * SR; i++) after = Math.max(after, Math.abs(buf[i]));
  assert.equal(before, 0);
  assert.ok(after > 0.02, `peak after the cue ${after}`);
});

test("repeated cues alternate variants, deterministically", () => {
  const n = lib.tear.files.length;
  assert.ok(n >= 2);
  const cues = Array.from({ length: n + 1 }, (_, i) => ({ t: 0.5 + i * 4, type: "tear" }));
  const dur = 4 * n + 5;
  const a = renderSfx(cues, dur);
  assert.deepEqual(a, renderSfx(cues, dur));
  const at = (i) => a.subarray(Math.round((0.5 + i * 4) * SR), Math.round((0.5 + i * 4) * SR) + 4800);
  assert.notDeepEqual(at(0), at(1));
  assert.deepEqual(at(0), at(n));
});

test("typewriter keys differ in level", { skip: NOT_FETCHED }, () => {
  const keys = renderSfx([0, 1, 2, 3].map((i) => ({ t: 0.2 + i, type: "key" })), 5);
  const peaks = [0, 1, 2, 3].map((i) => {
    let p = 0;
    for (let j = 0; j < 0.3 * SR; j++) p = Math.max(p, Math.abs(keys[Math.round((0.2 + i) * SR) + j]));
    return p;
  });
  assert.ok(new Set(peaks.map((p) => p.toFixed(3))).size > 1, `keys identical: ${peaks}`);
});

test("a name outside the library still falls back to the synthesized voices", () => {
  const buf = renderSfx([{ t: 0.1, type: "thump" }], 1);
  assert.ok(buf.some((v) => Math.abs(v) > 0.1));
});

test("the CLI renders a library cue list", () => {
  const dir = mkdtempSync(join(tmpdir(), "sfx-lib-"));
  writeFileSync(join(dir, "cues.json"), JSON.stringify([{ t: 0.5, type: "page" }, { t: 1.5, type: "church-bell", gain: 0.5 }]));
  execFileSync("node", [join(audio, "sfx.mjs"), join(dir, "cues.json"), join(dir, "out.wav"), "--dur", "4"]);
  assert.ok(readFileSync(join(dir, "out.wav")).length > 4 * SR * 2);
});

test("every loaded file is mono 48 kHz mp3 and the sampler lists every loaded action", { timeout: 60_000 }, () => {
  for (const id of new Set(Object.values(lib).flatMap((a) => a.files))) {
    const out = execFileSync(
      "ffprobe",
      ["-v", "error", "-show_entries", "stream=codec_name,sample_rate,channels", "-of", "csv=p=0", sampleFile(id)],
      { encoding: "utf8" },
    ).trim();
    assert.equal(out, "mp3,48000,1", id);
  }
  const dir = mkdtempSync(join(tmpdir(), "sfx-sampler-"));
  execFileSync("node", [join(audio, "sfx/sampler.mjs"), "--out", dir], { stdio: "pipe" });
  const sampler = readFileSync(join(dir, "sampler.txt"), "utf8");
  for (const name of Object.keys(lib)) assert.match(sampler, new RegExp(`\\s${name}\\s`), `sampler.txt lacks ${name}`);
  assert.ok(existsSync(join(dir, "sampler.mp3")));
});

// A project library: its own signature (a sonic logo) and an override whose file is absent.
function projectLibrary() {
  const dir = mkdtempSync(join(tmpdir(), "sfx-project-"));
  mkdirSync(join(dir, "sfx"));
  execFileSync("ffmpeg", ["-v", "error", "-f", "lavfi", "-i", "sine=frequency=440:duration=1.8", "-af", "volume=-4dB",
    "-ac", "1", "-ar", "48000", "-c:a", "libmp3lame", "-b:a", "96k", join(dir, "sfx", "my-logo.mp3")]);
  writeFileSync(join(dir, "sfx-library.json"), JSON.stringify({
    logo: { files: ["my-logo"], gain: 0.9, signature: true },
    whoosh: { files: ["not-on-disk"], gain: 0.5 },
  }));
  return join(dir, "sfx-library.json");
}

test("a project library adds its signature and an action without files falls back to a voice", { timeout: 60_000 }, () => {
  const json = projectLibrary();
  const probe = `
    import { loadLibrary, renderSfx } from ${JSON.stringify(join(audio, "sfx.mjs"))};
    const lib = loadLibrary();
    const loud = (type) => renderSfx([{ t: 0.5, type }], 2.5).some((v) => Math.abs(v) > 0.05);
    console.log(JSON.stringify({ logo: lib.logo?.files, whoosh: lib.whoosh ?? null, plays: ["logo", "whoosh", "swoosh"].map(loud) }));`;
  const r = JSON.parse(execFileSync("node", ["--input-type=module", "-e", probe], {
    env: { ...process.env, MOTION_SFX_LIBRARY: json }, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"],
  }));
  assert.deepEqual(r.logo, ["my-logo"]);
  assert.equal(r.whoosh, null, "an action with no file on disk is left out");
  assert.deepEqual(r.plays, [true, true, true]);
});

test("credits list every committed file as CC0 and every fetched one with its source", () => {
  const credits = readFileSync(join(audio, "sfx", "CREDITS.md"), "utf8");
  for (const id of committed) assert.match(credits, new RegExp(`\\| ${id} \\| https://freesound\\.org/s/\\d+/ \\| CC0 1\\.0 \\|`), `${id} has no CC0 row`);
  for (const id of Object.keys(sources)) assert.ok(credits.includes(`| ${id} | ${sources[id].url} |`), `${id} has no source row`);
});
