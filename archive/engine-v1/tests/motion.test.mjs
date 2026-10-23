import { test } from "node:test";
import assert from "node:assert/strict";
import {
  spring,
  track,
  indicator,
  swapAlpha,
  loopT,
  clamp,
  lerp,
  rng,
  SPRINGS,
  springReach,
  revealProgress,
} from "../core/lib/motion.js";

const close = (a, b, eps = 1e-3) =>
  assert.ok(Math.abs(a - b) < eps, `${a} !≈ ${b}`);

test("spring is 0 before it starts and settles at 1", () => {
  assert.equal(spring(-1), 0);
  assert.equal(spring(0), 0);
  close(spring(3), 1);
  for (const p of Object.values(SPRINGS)) close(spring(4, p.k, p.d), 1);
});

test("spring presets keep their overshoot budget", () => {
  const peak = (p) => {
    let m = 0;
    for (let t = 0; t < 3; t += 1 / 240) m = Math.max(m, spring(t, p.k, p.d));
    return m;
  };
  assert.ok(peak(SPRINGS.heavy) <= 1.0001, "heavy must not overshoot");
  assert.ok(peak(SPRINGS.snappy) < 1.03, "snappy overshoot is a hair");
  assert.ok(peak(SPRINGS.playful) > 1.05, "playful overshoot is visible");
});

test("critically damped branch is monotonic", () => {
  let prev = 0;
  for (let t = 0; t < 2; t += 0.01) {
    const v = spring(t, 100, 20);
    assert.ok(v >= prev - 1e-12);
    prev = v;
  }
});

test("track starts at the first key, ends at the last, and is continuous", () => {
  const keys = [
    [0, 10],
    [1, 50],
    [1.3, -20],
  ];
  assert.equal(track(-0.5, keys), 10);
  close(track(6, keys), -20);
  // No jump at a key change: the value just before and just after are nearly equal.
  for (const [k] of keys.slice(1))
    close(track(k - 1e-4, keys), track(k + 1e-4, keys), 0.05);
});

test("track is a pure function of time (order of evaluation does not matter)", () => {
  const keys = [
    [0, 0],
    [0.5, 100],
    [1, 30],
  ];
  const forward = [0.2, 0.7, 1.4].map((t) => track(t, keys));
  const backward = [1.4, 0.7, 0.2].map((t) => track(t, keys)).reverse();
  assert.deepEqual(forward, backward);
});

test("indicator stretches between stops and lands on the last one", () => {
  const stops = [
    [0, 0],
    [1, 300],
  ];
  const mid = indicator(1.08, stops, 120);
  assert.ok(mid.right - mid.left > 120, "leading edge runs ahead while moving");
  const end = indicator(5, stops, 120);
  close(end.left, 300);
  close(end.right, 420);
});

test("swapAlpha is 0 outside the window and 1 inside it", () => {
  assert.equal(swapAlpha(0, 1, 3), 0);
  assert.equal(swapAlpha(2, 1, 3), 1);
  assert.equal(swapAlpha(3, 1, 3), 0);
});

test("loopT wraps negatives and overflow", () => {
  assert.equal(loopT(17, 15), 2);
  assert.equal(loopT(-1, 15), 14);
});

test("clamp and lerp", () => {
  assert.equal(clamp(2), 1);
  assert.equal(clamp(-2), 0);
  assert.equal(clamp(5, 0, 10), 5);
  assert.equal(lerp(10, 20, 0.25), 12.5);
});

test("rng is seeded: same seed, same sequence; values in [0, 1)", () => {
  const a = rng(7),
    b = rng(7),
    c = rng(8);
  const sa = Array.from({ length: 50 }, a);
  assert.deepEqual(sa, Array.from({ length: 50 }, b));
  assert.notDeepEqual(sa, Array.from({ length: 50 }, c));
  assert.ok(sa.every((v) => v >= 0 && v < 1));
});

test("stepped holds time on a stop-motion grid (12 fps = on twos)", async () => {
  const { stepped } = await import("../core/lib/motion.js");
  assert.equal(stepped(0.0, 12), 0);
  close(stepped(0.08, 12), 0);
  close(stepped(0.09, 12), 1 / 12);
  close(stepped(1.0, 12), 1);
});

test("revealProgress: a spring-paced reveal that ends exactly at tIn + dur, never in a long tail", () => {
  const sp = { k: 40, d: 12.6 }; // the hand's pace: the plain spring is still short of 1 after a second
  assert.ok(springReach(sp.k, sp.d, 0.999) > 1.3, "the raw spring has a long tail");
  assert.equal(revealProgress(0.99, 1, { ...sp, dur: 0.8 }), 0, "nothing before tIn");
  assert.equal(revealProgress(1, 1, { ...sp, dur: 0.8 }), 0);
  assert.equal(revealProgress(1.8, 1, { ...sp, dur: 0.8 }), 1, "the last glyph is fully shown at tIn + dur");
  assert.equal(revealProgress(5, 1, { ...sp, dur: 0.8 }), 1);
  assert.ok(revealProgress(1.4, 1, { ...sp, dur: 0.8 }) < 1, "still writing half way");
  let prev = 0;
  for (let i = 0; i <= 120; i++) {
    const p = revealProgress(1 + (i / 120) * 0.8, 1, { ...sp, dur: 0.8 });
    assert.ok(p >= prev - 1e-9 && p <= 1, `monotone and within 0..1 at step ${i}`);
    assert.ok(p - prev < 0.08, `no jump at step ${i}: ${prev} -> ${p}`);
    prev = p;
  }
  // The default dur is where the spring has visibly arrived (97%).
  const dur = springReach(sp.k, sp.d, 0.97);
  assert.equal(revealProgress(1 + dur, 1, sp), 1);
  assert.ok(revealProgress(1 + dur - 0.05, 1, sp) < 1);
});

test("cutAtPeak: the fastest moment of an eased move (spring, symmetric ease, camera pose)", async () => {
  const { cutAtPeak, spring: sp, springReach } = await import("../core/lib/motion.js");
  // A symmetric ease-in-out peaks halfway.
  const ease = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t / (t * t + (1 - t) * (1 - t)));
  assert.ok(Math.abs(cutAtPeak(ease, 0, 1) - 0.5) < 1 / 240);
  // A spring from rest: its velocity peaks where its acceleration crosses zero, between the start
  // and the half-way point (an overdamped spring's peak speed comes before its middle).
  const k = 95, d = 17;
  const tp = cutAtPeak((t) => sp(t, k, d), 0, 2);
  const v = (t) => (sp(t + 1e-4, k, d) - sp(t - 1e-4, k, d)) / 2e-4;
  assert.ok(tp > 0 && tp < springReach(k, d, 0.5) + 1e-3, `peak at ${tp}`);
  for (const dt of [-0.02, 0.02]) assert.ok(v(tp) >= v(tp + dt), "no faster moment nearby");
  // An object curve: the length of its change; a field that never moves does not shift the peak.
  assert.equal(cutAtPeak((t) => ({ x: 500 * ease(t), y: 7 }), 0, 1), cutAtPeak(ease, 0, 1));
});

test("fbm: seeded, smooth, bounded, and wraps on its period", async () => {
  const { fbm } = await import("../core/lib/motion.js");
  const a = fbm(4);
  const b = fbm(4);
  const c = fbm(5);
  const xs = Array.from({ length: 200 }, (_, i) => i * 0.137);
  assert.deepEqual(xs.map((x) => a(x, 0.3)), xs.map((x) => b(x, 0.3)), "same seed, same field");
  assert.notDeepEqual(xs.map((x) => a(x)), xs.map((x) => c(x)), "another seed, another field");
  for (const x of xs) assert.ok(Math.abs(a(x, x)) <= 1);
  for (const x of xs) assert.ok(Math.abs(a(x + 0.001) - a(x)) < 0.02, "smooth: no jumps");
  const p = fbm(9, { periodX: 8 });
  for (const y of [0, 0.4, 1.7]) assert.ok(Math.abs(p(0, y) - p(8, y)) < 1e-12, "closes on itself");
});
