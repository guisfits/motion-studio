import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { NORMS } from "../core/checks/norms.mjs";
import { deadFrames, judgeLoudness, loudness } from "../core/checks/media.mjs";

const dir = mkdtempSync(join(tmpdir(), "checks-"));
const ff = (...a) => execFileSync("ffmpeg", ["-loglevel", "error", "-y", ...a]);

test(
  "a 5 s still is a dead window; moving noise is not",
  { timeout: 60_000 },
  () => {
    ff(
      "-f",
      "lavfi",
      "-i",
      "color=gray:s=180x320:d=5:r=30",
      "-pix_fmt",
      "yuv420p",
      join(dir, "still.mp4"),
    );
    ff(
      "-f",
      "lavfi",
      "-i",
      "testsrc2=s=180x320:d=5:r=30",
      "-pix_fmt",
      "yuv420p",
      join(dir, "moving.mp4"),
    );
    assert.equal(deadFrames(join(dir, "still.mp4"))[0].code, "M1");
    assert.deepEqual(deadFrames(join(dir, "moving.mp4")), []);
  },
);

test("loudness is measured and judged", { timeout: 60_000 }, () => {
  ff(
    "-f",
    "lavfi",
    "-i",
    "sine=f=440:d=6",
    "-af",
    "volume=-30dB",
    join(dir, "quiet.wav"),
  );
  const r = loudness(join(dir, "quiet.wav"));
  assert.ok(r.I < -30);
  assert.equal(r.findings[0].code, "M2");
});

test("judgeLoudness: an unreadable LRA is M3, like an unreadable integrated loudness is M2", () => {
  const codes = (I, LRA) => judgeLoudness({ I, LRA }).map((f) => f.code);
  assert.deepEqual(codes(NORMS.audio.lufs, NORMS.audio.maxLra), []);
  assert.deepEqual(codes(NORMS.audio.lufs, NaN), ["M3"]);
  assert.deepEqual(codes(NaN, NORMS.audio.maxLra), ["M2"]);
  assert.deepEqual(codes(NORMS.audio.lufs, NORMS.audio.maxLra + 1), ["M3"]);
});

test("a file ffmpeg cannot read is red M0, not a clean pass", () => {
  const bad = join(dir, "corrupt.mp4");
  writeFileSync(bad, "not a video at all");
  const dead = deadFrames(bad);
  assert.deepEqual(
    dead.map((f) => f.code),
    ["M0"],
  );
  assert.equal(dead[0].severity, "red");
  assert.match(dead[0].msg, /ffmpeg could not read .*corrupt\.mp4/);
  assert.deepEqual(
    loudness(bad).findings.map((f) => f.code),
    ["M0"],
  );
});

test("a missing ffmpeg throws instead of passing", () => {
  const path = process.env.PATH;
  process.env.PATH = "";
  try {
    assert.throws(
      () => deadFrames(join(dir, "still.mp4")),
      /ffmpeg not found on PATH/,
    );
    assert.throws(
      () => loudness(join(dir, "quiet.wav")),
      /ffmpeg not found on PATH/,
    );
  } finally {
    process.env.PATH = path;
  }
});
