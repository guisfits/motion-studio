import { test } from "node:test";
import assert from "node:assert/strict";
import {
  fbm,
  polyMask,
  tornAlpha,
  fibreRim,
  fitSize,
  bake,
} from "../core/reference/oven.mjs";

const W = 120,
  H = 80;
const square = polyMask(W, H, [
  [20, 20],
  [100, 20],
  [100, 60],
  [20, 60],
]);
const count = (a) => a.reduce((n, v) => n + (v > 127 ? 1 : 0), 0);

test("fbm is deterministic and in 0..1", () => {
  assert.equal(fbm(3.2, 7.7, 5), fbm(3.2, 7.7, 5));
  for (let i = 0; i < 200; i++) {
    const v = fbm(i * 0.37, i * 0.11, 2);
    assert.ok(v >= 0 && v <= 1);
  }
  assert.notEqual(fbm(1.5, 1.5, 1), fbm(1.5, 1.5, 2));
});

test("polyMask fills the polygon and clamps outside points", () => {
  assert.equal(count(square), 80 * 40);
  const off = polyMask(W, H, [
    [-50, -50],
    [60, -50],
    [60, 40],
    [-50, 40],
  ]);
  assert.equal(count(off), 60 * 40);
  assert.equal(
    count(
      polyMask(W, H, [
        [10, 10],
        [10, 10],
        [10, 10],
      ]),
    ),
    0,
    "degenerate → empty",
  );
});

test("tornAlpha roughens the edge but keeps the body", () => {
  const t = tornAlpha(square, W, H, { seed: 3 });
  assert.equal(t[40 * W + 60], 255, "centre stays opaque");
  assert.equal(t[2 * W + 2], 0, "far outside stays clear");
  let changed = 0;
  for (let i = 0; i < W * H; i++) if (t[i] > 127 !== square[i] > 127) changed++;
  assert.ok(changed > 40, "the straight edge got ragged");
  assert.deepEqual(t, tornAlpha(square, W, H, { seed: 3 }));
});

test("fibreRim is a band just outside the shape", () => {
  const r = fibreRim(square, W, H, { width: 6, seed: 1 });
  assert.equal(r[40 * W + 60], 0, "nothing inside the shape");
  assert.ok(r[40 * W + 101] > 0, "rim right outside the right edge");
  assert.equal(r[40 * W + 115], 0, "nothing far outside");
});

test("caps the long side", () => {
  assert.deepEqual(fitSize(4000, 3000, 1600), [1600, 1200]);
  assert.deepEqual(fitSize(800, 600, 1600), [800, 600]);
});

test("fitSize never returns a zero side for a very thin source", () => {
  assert.deepEqual(fitSize(5000, 1, 1600), [1600, 1]);
  assert.deepEqual(fitSize(2, 9000, 1600), [1, 1600]);
});

test("bake: opaque body, paper-white rim, transparent outside, deterministic", () => {
  const rgba = new Uint8ClampedArray(W * H * 4).fill(40);
  const out = bake(rgba, W, H, { alpha: square, seed: 2, depth: 0 }); // depth 0: the edge stays put, so the rim's place is known
  const px = (x, y) =>
    Array.from(out.slice((y * W + x) * 4, (y * W + x) * 4 + 4));
  assert.equal(px(60, 40)[3], 255);
  assert.ok(px(60, 40)[0] < 80, "body keeps the ink");
  assert.equal(px(2, 2)[3], 0);
  const rim = px(101, 40);
  assert.ok(rim[3] > 0 && rim[0] > 200, "rim is light paper");
  assert.deepEqual(out, bake(rgba, W, H, { alpha: square, seed: 2, depth: 0 }));
});
