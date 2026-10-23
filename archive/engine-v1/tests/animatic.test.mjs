import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const studio = fileURLToPath(new URL("..", import.meta.url));
// The quote in the folder name proves the paths survive ffmpeg and the spawns.
const film = fileURLToPath(new URL("./.tmp-films/anim'atic", import.meta.url));

// A film whose whole frame is one colour per moment: red until 1 s, green until 2 s, blue after,
// and white inside the house window. Beat b1 spans the first two colours and has ONE key word at
// 0.3 s, so a one-still-per-beat animatic would show red only.
const RED = [255, 0, 0];
const GREEN = [0, 255, 0];
const BLUE = [0, 0, 255];
const WHITE = [255, 255, 255];
const page = (dur, house) => `<!doctype html><meta charset="utf-8" />
<body style="margin:0"><script>
  window.FILM = { dur: ${dur}, format: "9x16", formats: ["9x16"]${house ? `, house: [${house}]` : ""} };
  const HOUSE = ${house ? `[${house}]` : "null"};
  window.seek = (t) => {
    document.body.style.background = HOUSE && t >= HOUSE[0] ? "#fff" : t < 1 ? "#f00" : t < 2 ? "#0f0" : "#00f";
  };
  window.seek(0);
  window.ready = true;
</script>`;

function animatic({ dur, house, voiceS, beats, args = [] }) {
  rmSync(film, { recursive: true, force: true });
  mkdirSync(`${film}/voice`, { recursive: true });
  mkdirSync(`${film}/crew`, { recursive: true });
  writeFileSync(`${film}/index.html`, page(dur, house));
  execFileSync("ffmpeg", ["-loglevel", "error", "-f", "lavfi", "-i",
    `sine=frequency=440:duration=${voiceS}`, "-ar", "48000", `${film}/voice/voice.wav`]);
  writeFileSync(`${film}/crew/sync-sheet.json`, JSON.stringify({ beats }));
  execFileSync(process.execPath, [`${studio}/core/animatic.mjs`, film, "--format", "9x16", ...args], {
    stdio: "pipe",
  });
  return `${film}/out/animatic-9x16.mp4`;
}

const probe = (file, args) =>
  execFileSync("ffprobe", ["-v", "error", ...args, "-of", "csv=p=0", file]).toString().trim();

// The colour of the frame on screen at t seconds.
const colourAt = (mp4, t) => [
  ...execFileSync("ffmpeg", ["-loglevel", "error", "-ss", String(t), "-i", mp4, "-frames:v", "1",
    "-vf", "crop=16:16:10:10,scale=1:1", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]),
];
const near = (got, want) => got.every((c, i) => Math.abs(c - want[i]) <= 40);

const BEATS = [
  { id: "b1", t: [0, 2], key: [{ word: "fé", t: 0.3 }] },
  { id: "b2", t: [2, 3], key: [{ word: "Lutero", t: 2.2 }] },
];

test("the animatic renders draw(t): what a beat changes after its key word is on screen at its time", { timeout: 120_000 }, () => {
  const mp4 = animatic({ dur: 3.2, voiceS: 3, beats: BEATS });
  assert.ok(existsSync(mp4));
  assert.ok(existsSync(`${film}/out/animatic-9x16.png`), "contact sheet");
  // b1's first key word is at 0.3 s (red); the colour change at 1 s is mid-beat.
  assert.ok(near(colourAt(mp4, 0.5), RED), "0.5 s");
  assert.ok(near(colourAt(mp4, 1.5), GREEN), `1.5 s is ${colourAt(mp4, 1.5)}: a mid-beat change must show`);
  assert.ok(near(colourAt(mp4, 2.5), BLUE), "2.5 s");
  const audio = probe(mp4, ["-select_streams", "a", "-show_entries", "stream=index"]);
  assert.equal(audio.split("\n").length, 1);
  assert.ok(audio);
  const [w] = probe(mp4, ["-select_streams", "v", "-show_entries", "stream=width,r_frame_rate"]).split(",");
  assert.equal(w, "540");
  rmSync(film, { recursive: true, force: true });
});

test("without a house window the animatic ends at the voice end; --fps sets the frame rate", { timeout: 120_000 }, () => {
  const mp4 = animatic({ dur: 3.6, voiceS: 3, beats: BEATS, args: ["--fps", "8"] });
  const [, rate] = probe(mp4, ["-select_streams", "v", "-show_entries", "stream=width,r_frame_rate"]).split(",");
  assert.equal(rate, "8/1");
  const video = Number(probe(mp4, ["-show_entries", "format=duration"]));
  assert.ok(video >= 3 - 1e-3 && video <= 3 + 1 / 8 + 1e-3, `animatic runs ${video} s`);
  const audio = Number(probe(mp4, ["-select_streams", "a", "-show_entries", "stream=duration"]));
  assert.ok(audio + 0.05 >= 3, `narration cut at ${audio} s`);
  rmSync(film, { recursive: true, force: true });
});

test("a declared FILM.house window is in the animatic, to its t1, after the voice ends", { timeout: 120_000 }, () => {
  const mp4 = animatic({ dur: 4.5, house: [3.2, 4.5], voiceS: 3, beats: BEATS });
  const container = Number(probe(mp4, ["-show_entries", "format=duration"]));
  assert.ok(Math.abs(container - 4.5) <= 0.15, `animatic runs ${container} s, wanted 4.5`);
  assert.ok(near(colourAt(mp4, 4), WHITE), "house window on screen at 4 s");
  assert.ok(near(colourAt(mp4, 3.1), BLUE), "story before the window");
  const audio = Number(probe(mp4, ["-select_streams", "a", "-show_entries", "stream=duration"]));
  assert.ok(audio + 0.05 >= 3, `narration cut at ${audio} s`);
  rmSync(film, { recursive: true, force: true });
});
