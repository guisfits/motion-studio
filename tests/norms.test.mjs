import { test } from "node:test";
import assert from "node:assert/strict";
import { NORMS, normsFor } from "../core/checks/norms.mjs";

test("the voice take may have at most 3 % ASR character error rate", () => {
  assert.equal(NORMS.voice.maxCer, 0.03);
  assert.ok(Object.isFrozen(NORMS.voice));
});

test("rhythm norms are register A's p10–p90 (grammar §10)", () => {
  const r = NORMS.rhythm;
  assert.deepEqual(r.aslRange, [0.7, 2.1]);
  assert.deepEqual(r.eventsPer10s, [4.7, 13.8]);
  assert.deepEqual(r.wordsPerEvent, [2.1, 5.5]);
  assert.equal(r.endSlowdown, 0.75);
  assert.equal(r.maxStillHoldS, 4);
  assert.ok(Object.isFrozen(r));
});

test("caption type norms: cap height 2.5–4.5 % of the frame, WCAG 4.5:1", () => {
  assert.deepEqual(NORMS.caption.capHeight, [0.025, 0.045]);
  assert.equal(NORMS.caption.minContrast, 4.5);
});

test("a punch is a scale move of 2x or more, at most two per film", () => {
  assert.equal(NORMS.camera.punchMax, 2.0);
  assert.equal(NORMS.camera.maxPunches, 2);
  assert.equal(NORMS.camera.emphasisMinScaleDelta, 0.15);
});

test("the instructive register overlays register A key by key and A stays the default", () => {
  const i = NORMS.registers.instructive;
  assert.deepEqual(i.film, { minS: 60, maxS: 90 });
  assert.deepEqual(i.appSegment, { minS: 15, maxS: 30 });
  assert.deepEqual(i.rhythm.aslRange, [1.4, 3.8]);
  assert.deepEqual(i.rhythm.eventsPer10s, [2.6, 7.0]);
  assert.deepEqual(i.rhythm.wordsPerEvent, [3.5, 8.0]);
  assert.equal(i.rhythm.maxStillHoldS, 6);
  assert.equal(i.rhythm.restAfterKeyS, 1.0);
  assert.equal(i.camera.emphasisMinScaleDelta, 0.12);
  assert.equal(i.camera.maxPushRatePerS, 0.12);
  assert.equal(i.camera.minMoveS, 1.0);
  assert.equal(i.camera.maxPunches, 1);
  assert.equal(i.camera.forbidShake, true);
  assert.ok(Object.isFrozen(i) && Object.isFrozen(i.rhythm) && Object.isFrozen(i.camera));
  assert.equal(normsFor(undefined), NORMS);
  assert.equal(normsFor("A"), NORMS);
  const n = normsFor("instructive");
  assert.deepEqual(n.rhythm.aslRange, [1.4, 3.8]);
  assert.equal(n.rhythm.endSlowdown, NORMS.rhythm.endSlowdown);
  assert.equal(n.rhythm.eventMergeS, NORMS.rhythm.eventMergeS);
  assert.equal(n.camera.punchMax, NORMS.camera.punchMax);
  assert.equal(n.caption, NORMS.caption);
  assert.throws(() => normsFor("bogus"), /unknown register/);
});
