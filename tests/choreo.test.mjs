import { test } from "node:test";
import assert from "node:assert/strict";
import {
  pose,
  contacts,
  pile,
  boilStep,
  MOVES,
} from "../styles/vox/lib/choreo.js";

const near = (a, b, eps = 1e-3) =>
  assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);

test("catalogue lists every move", () => {
  assert.deepEqual(Object.keys(MOVES).sort(), [
    "crumple",
    "drag",
    "flip",
    "fold",
    "lift",
    "peel",
    "slap",
    "slide",
    "slideUnder",
  ]);
});

test("a slapped piece is hidden before it starts, lands, and rests flat", () => {
  const m = [{ kind: "slap", at: 1 }];
  assert.equal(pose(m, 0.99).visible, false);
  assert.equal(pose(m, 1.0).visible, true);
  assert.ok(pose(m, 1.0).lift > 0.9, "starts high off the table");
  const rest = pose(m, 4);
  near(rest.lift, 0);
  near(rest.rot, 0);
  near(rest.scale, 1);
  near(rest.dx, 0);
  near(rest.dy, 0);
});

test("a slap overshoots: it presses into the table before settling", () => {
  const m = [{ kind: "slap", at: 0 }];
  const lifts = Array.from({ length: 60 }, (_, i) => pose(m, i / 60).lift);
  assert.ok(
    Math.min(...lifts) < -0.02,
    "lift goes below 0 (squash) at least once",
  );
});

test("same t gives the same pose whatever was asked before (seek in any order)", () => {
  const m = [
    { kind: "slap", at: 0.2 },
    { kind: "drag", at: 0.6, by: [120, -40] },
    { kind: "peel", at: 2, corner: "tr" },
  ];
  const a = JSON.stringify(pose(m, 1.37));
  pose(m, 3.1);
  pose(m, 0.1);
  assert.equal(JSON.stringify(pose(m, 1.37)), a);
});

test("composes overlapping moves continuously (no jump between frames)", () => {
  const m = [
    { kind: "slap", at: 0 },
    { kind: "drag", at: 0.15, by: [200, 0] },
  ];
  for (let i = 1; i < 120; i++) {
    const p0 = pose(m, (i - 1) / 60),
      p1 = pose(m, i / 60);
    assert.ok(Math.abs(p1.dx - p0.dx) < 40, `dx jumps at frame ${i}`);
  }
  near(pose(m, 5).dx, 200);
});

test("slide comes from a side and rests at the spot", () => {
  const m = [{ kind: "slide", at: 0, from: [-900, 0] }];
  assert.ok(pose(m, 0.001).dx < -800);
  near(pose(m, 4).dx, 0);
});

test("slideUnder passes below another piece: dz is negative once it is under", () => {
  const m = [{ kind: "slideUnder", at: 0, from: [600, 0], under: 3 }];
  assert.ok(pose(m, 0.01).dz >= 0, "starts on top of the table order");
  assert.ok(pose(m, 3).dz <= -3, "ends under the piece at z=3");
  near(pose(m, 3).dx, 0);
});

test("peel curls a corner and then the piece leaves", () => {
  const m = [
    { kind: "slap", at: 0 },
    { kind: "peel", at: 1, corner: "tr" },
  ];
  assert.ok(pose(m, 1.3).curl > 0.3);
  assert.equal(pose(m, 4).visible, false);
});

test("flip turns over: flip goes 0 → 1", () => {
  const m = [{ kind: "flip", at: 0 }];
  near(pose(m, 0).flip, 0);
  near(pose(m, 4).flip, 1);
});

test("fold goes to the requested fraction and unfold back", () => {
  const m = [
    { kind: "fold", at: 0, to: 0.5 },
    { kind: "fold", at: 2, to: 0 },
  ];
  near(pose(m, 1.9).fold, 0.5, 0.02);
  near(pose(m, 5).fold, 0, 0.02);
});

test("crumple balls up, is thrown, and is gone", () => {
  const m = [
    { kind: "slap", at: 0 },
    { kind: "crumple", at: 1, throwTo: [1500, -300] },
  ];
  assert.ok(pose(m, 1.4).crumple > 0.5);
  assert.equal(pose(m, 4).visible, false);
});

test("lift takes it away for good", () => {
  const m = [
    { kind: "slap", at: 0 },
    { kind: "lift", at: 1 },
  ];
  assert.ok(pose(m, 1.2).lift > 0.2);
  assert.equal(pose(m, 3).visible, false);
});

test("contacts: slap lands where it is seen to land; peel/crumple/fold have their own sounds", () => {
  const c = contacts([
    { kind: "slap", at: 1 },
    { kind: "fold", at: 2, to: 0.5 },
    { kind: "crumple", at: 3 },
  ]);
  assert.deepEqual(
    c.map((x) => x.type),
    ["paper-place", "fold", "crumple"],
  );
  assert.ok(c[0].t > 1 && c[0].t < 1.6);
});

test("merges near contacts: a pile landing together is one louder hit", () => {
  const c = contacts([
    { kind: "slap", at: 1 },
    { kind: "slap", at: 1.02 },
    { kind: "slap", at: 1.05 },
  ]);
  assert.equal(c.length, 1);
  assert.ok(c[0].gain > 1);
});

test("pile: n seeded rests, z increasing, reproducible", () => {
  const a = pile(5, { x: 100, y: 200, seed: 4 });
  assert.equal(a.length, 5);
  assert.deepEqual(
    a.map((p) => p.z),
    [0, 1, 2, 3, 4],
  );
  assert.deepEqual(a, pile(5, { x: 100, y: 200, seed: 4 }));
  for (const p of a)
    assert.ok(Math.abs(p.x - 100) <= 60 && Math.abs(p.rot) <= 12);
});

test("boilStep cycles hand drawings on a 12 fps clock", () => {
  assert.equal(boilStep(0), 0);
  assert.equal(boilStep(1 / 12), 1);
  assert.equal(boilStep(3 / 12), 0);
  assert.equal(boilStep(0.05), 0);
});
