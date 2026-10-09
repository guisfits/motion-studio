import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const studio = fileURLToPath(new URL("..", import.meta.url));
// beats.py needs numpy + librosa (requirements.txt): $MOTION_PYTHON, else ./.venv/bin/python.
const python = process.env.MOTION_PYTHON ?? join(studio, ".venv/bin/python");
const dir = mkdtempSync(join(tmpdir(), "motion-audio-"));
const run = (cmd, args) =>
  execFileSync(cmd, args, { stdio: "pipe" }).toString();
const md5 = (f) => createHash("md5").update(readFileSync(f)).digest("hex");
const duration = (f) =>
  Number(
    run("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "csv=p=0",
      f,
    ]),
  );

test("sfx.mjs renders cues at their times into a WAV of the requested length", () => {
  const cues = [];
  for (let t = 0.5; t < 8; t += 0.5)
    cues.push({ t, type: t % 2 === 0.5 ? "thump" : "click" });
  writeFileSync(join(dir, "cues.json"), JSON.stringify(cues));
  run("node", [
    join(studio, "core/audio/sfx.mjs"),
    join(dir, "cues.json"),
    join(dir, "sfx.wav"),
    "--dur",
    "9",
  ]);
  assert.ok(Math.abs(duration(join(dir, "sfx.wav")) - 9) < 0.01);
});

test("unknown sfx type is an error that names the valid ones", () => {
  writeFileSync(
    join(dir, "bad.json"),
    JSON.stringify([{ t: 1, type: "laser" }]),
  );
  assert.throws(
    () =>
      run("node", [
        join(studio, "core/audio/sfx.mjs"),
        join(dir, "bad.json"),
        join(dir, "bad.wav"),
      ]),
    /laser.*click/s,
  );
});

test(
  "beats.py measures a 120 BPM click track",
  { skip: !existsSync(python) },
  () => {
    const grid = JSON.parse(
      run(python, [join(studio, "core/audio/beats.py"), join(dir, "sfx.wav")]),
    );
    assert.ok(Math.abs(grid.bpm - 120) < 3, `bpm ${grid.bpm}`);
    const gaps = grid.beats.slice(1).map((b, i) => b - grid.beats[i]);
    const median = gaps.sort((a, b) => a - b)[gaps.length >> 1];
    assert.ok(Math.abs(median - 0.5) < 0.03, `median beat gap ${median}`);
    assert.deepEqual(
      grid.downbeats,
      grid.beats.filter((_, i) => i % 4 === 0),
    );
  },
);

test("score.mjs synthesizes music and the matching beat grid, deterministically", () => {
  const score = {
    bpm: 90,
    bars: 4,
    chords: ["Dm", "Bb", "F", "C"],
    voices: {
      organ: {},
      strings: { from: 1 },
      bell: {},
      bass: {},
      kick: { from: 2 },
    },
    tail: 2,
  };
  writeFileSync(join(dir, "score.json"), JSON.stringify(score));
  const args = [
    join(studio, "core/audio/score.mjs"),
    join(dir, "score.json"),
    "--out",
    dir,
  ];
  run("node", args);
  const first = md5(join(dir, "music.wav"));
  const grid = JSON.parse(readFileSync(join(dir, "beats.json"), "utf8"));
  assert.equal(grid.bpm, 90);
  assert.equal(grid.beats.length, 16);
  assert.ok(Math.abs(grid.beats[1] - grid.beats[0] - 60 / 90) < 1e-3);
  assert.deepEqual(
    grid.downbeats,
    grid.beats.filter((_, i) => i % 4 === 0),
  );
  const expected = (4 * 4 * 60) / 90 + 2;
  assert.ok(Math.abs(duration(join(dir, "music.wav")) - expected) < 0.01);
  run("node", args);
  assert.equal(md5(join(dir, "music.wav")), first);
});

test("score.mjs rejects a chord it cannot spell", () => {
  writeFileSync(
    join(dir, "bad-score.json"),
    JSON.stringify({
      bpm: 90,
      bars: 1,
      chords: ["H7b9"],
      voices: { organ: {} },
    }),
  );
  assert.throws(
    () =>
      run("node", [
        join(studio, "core/audio/score.mjs"),
        join(dir, "bad-score.json"),
        "--out",
        dir,
      ]),
    /H7b9/,
  );
});

test(
  "mix.mjs muxes stems onto the silent render at -14 LUFS",
  { timeout: 60_000 },
  () => {
    const silent = join(dir, "silent.mp4");
    run("ffmpeg", [
      "-y",
      "-loglevel",
      "error",
      "-f",
      "lavfi",
      "-i",
      "color=c=black:s=320x240:d=9:r=30",
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      silent,
    ]);
    const out = join(dir, "final.mp4");
    run("node", [
      join(studio, "core/audio/mix.mjs"),
      "--video",
      silent,
      "--music",
      join(dir, "music.wav"),
      "--sfx",
      join(dir, "sfx.wav"),
      "--out",
      out,
    ]);
    const streams = run("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "stream=codec_type",
      "-of",
      "csv=p=0",
      out,
    ]);
    assert.match(streams, /video/);
    assert.match(streams, /audio/);
    assert.ok(Math.abs(duration(out) - 9) < 0.1);
    const log = execFileSync("sh", [
      "-c",
      `ffmpeg -nostats -i "${out}" -af ebur128 -f null - 2>&1 | grep -A1 "Integrated loudness" | tail -1`,
    ]).toString();
    const lufs = Number(log.match(/I:\s*(-?[\d.]+)/)[1]);
    assert.ok(Math.abs(lufs + 14) < 1.5, `integrated ${lufs} LUFS`);
  },
);

test(
  "mix.mjs keeps the music and SFX after the voice ends (a voice shorter than the picture)",
  { timeout: 60_000 },
  () => {
    // 9 s picture, a 3 s voice, an SFX hit at 7 s (an outro's logo, say): the sidechains keyed by
    // the voice must not end the other stems when the voice ends.
    const silent = join(dir, "silent-short-voice.mp4");
    run("ffmpeg", ["-y", "-loglevel", "error", "-f", "lavfi", "-i", "color=c=black:s=320x240:d=9:r=30",
      "-c:v", "libx264", "-pix_fmt", "yuv420p", silent]);
    const voice = join(dir, "voice-3s.wav");
    run("ffmpeg", ["-y", "-loglevel", "error", "-f", "lavfi", "-i",
      "aevalsrc='0.3*sin(2*PI*220*t)*(0.6+0.4*sin(2*PI*3*t))':s=48000:d=3", voice]);
    const sfx = join(dir, "sfx-late-hit.wav");
    run("ffmpeg", ["-y", "-loglevel", "error", "-f", "lavfi", "-i",
      "aevalsrc='if(between(t,7,7.6),0.5*sin(2*PI*880*t),0)':s=48000:d=9", sfx]);
    const out = join(dir, "final-short-voice.mp4");
    run("node", [join(studio, "core/audio/mix.mjs"), "--video", silent, "--sfx", sfx, "--voice", voice,
      "--fade-out", "0", "--out", out]);
    const audioDur = Number(run("ffprobe", ["-v", "error", "-select_streams", "a", "-show_entries",
      "stream=duration", "-of", "csv=p=0", out]));
    assert.ok(Math.abs(audioDur - 9) < 0.1, `audio lasts ${audioDur} s, the picture 9 s`);
    const late = execFileSync("sh", ["-c",
      `ffmpeg -nostats -ss 7 -t 0.6 -i "${out}" -vn -af volumedetect -f null - 2>&1 | grep max_volume`]).toString();
    const peak = Number(late.match(/max_volume:\s*(-?[\d.]+)/)[1]);
    assert.ok(peak > -40, `the hit at 7 s is heard (${peak} dB)`);
  },
);
