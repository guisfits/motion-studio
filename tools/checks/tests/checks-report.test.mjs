import { test } from "node:test";
import assert from "node:assert/strict";
import { NORMS } from "../norms.mjs";
import { finding, summarize, toMarkdown } from "../report.mjs";

test("norms carry the sourced thresholds", () => {
  assert.equal(NORMS.caption.maxCps, 17);
  assert.equal(NORMS.caption.minLegibleS, 0.5);
  assert.equal(NORMS.caption.maxWords, 4);
  assert.deepEqual(NORMS.sync.heroWindowFrames, [-3, 0]);
  assert.equal(NORMS.sync.letteringToleranceFrames, 3);
  assert.equal(NORMS.frames.deadWindowS, 4);
  assert.equal(NORMS.frames.minCoverage, 0.1);
  assert.equal(NORMS.camera.emphasisMinScaleDelta, 0.15);
  assert.equal(NORMS.audio.lufs, -14);
  assert.equal(NORMS.audio.lufsTol, 1);
  assert.equal(NORMS.audio.maxLra, 3);
  assert.ok(Object.isFrozen(NORMS));
});

test("summary fails on any red and sorts red first", () => {
  const f = [
    finding("yellow", "Y1", 3, "polish"),
    finding("red", "R1", 9, "dead"),
    finding("red", "R2", 1, "clip"),
  ];
  assert.deepEqual(summarize(f), { red: 2, orange: 0, yellow: 1, pass: false });
  const md = toMarkdown(f).split("\n");
  assert.match(md[0], /🔴 R2 · 1\.00 s/);
  assert.match(md[2], /🟡 Y1/);
  assert.equal(summarize([]).pass, true);
});

test("a finding with an unknown severity throws", () => {
  assert.throws(
    () => finding("Red", "X1", null, "typo"),
    /unknown severity "Red"/,
  );
  assert.throws(
    () => finding(undefined, "X1", null, "missing"),
    /unknown severity/,
  );
  assert.throws(
    () => finding("toString", "X1", null, "inherited"),
    /unknown severity/,
  );
});
