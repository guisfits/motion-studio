import { describe, expect, it } from "vitest";
import { bounce, drift, flutter, impactShake, throwIn } from "../motion";

const FPS = 16;

describe("bounce (AE inertial bounce as a closed-form progress)", () => {
  it("starts at 0 and settles on 1", () => {
    expect(bounce(0, FPS)).toBe(0);
    expect(bounce(FPS * 3, FPS)).toBeCloseTo(1, 3);
  });
  it("overshoots past 1 once, then rings down", () => {
    const xs = Array.from({ length: FPS * 2 }, (_, f) => bounce(f, FPS));
    const peak = Math.max(...xs);
    expect(peak).toBeGreaterThan(1.05);
    expect(peak).toBeLessThan(1.4);
  });
  it("reaches the target fast: past 0.9 within 0.25 s", () => {
    const f = Array.from({ length: FPS }, (_, i) => i).find((i) => bounce(i, FPS) >= 0.9)!;
    expect(f / FPS).toBeLessThanOrEqual(0.25);
  });
  it("is negative-safe: holds 0 before its start", () => {
    expect(bounce(-5, FPS)).toBe(0);
  });
});

describe("throwIn", () => {
  const from = { x: -400, y: 300, rotate: -40, scale: 1.3 };
  const to = { x: 200, y: 500, rotate: 4, scale: 1 };
  it("is at `from` before the start and lands on `to`", () => {
    expect(throwIn(-1, FPS, { from, to })).toMatchObject(from);
    const end = throwIn(FPS * 3, FPS, { from, to });
    expect(end.x).toBeCloseTo(to.x, 1);
    expect(end.y).toBeCloseTo(to.y, 1);
    expect(end.rotate).toBeCloseTo(to.rotate, 1);
    expect(end.scale).toBeCloseTo(to.scale, 2);
  });
  it("travels fast (most of the way in `frames`) and arcs above the straight line", () => {
    const mid = throwIn(2, FPS, { from, to, frames: 4, arc: 120 });
    const straightY = from.y + (to.y - from.y) * ((mid.x - from.x) / (to.x - from.x));
    expect(mid.y).toBeLessThan(straightY);
    const p = (throwIn(4, FPS, { from, to, frames: 4 }).x - from.x) / (to.x - from.x);
    expect(p).toBeGreaterThan(0.9);
  });
  it("overshoots its landing rotation (settle wobble)", () => {
    const rots = Array.from({ length: 24 }, (_, f) => throwIn(f, FPS, { from, to, frames: 4 }).rotate);
    expect(Math.max(...rots)).toBeGreaterThan(to.rotate + 0.5);
  });
});

describe("flutter (falling leaf)", () => {
  const leaf = { x: 300, y: -200, fall: 18, sway: 60, swayHz: 0.9, spin: 40 };
  it("falls at its speed and sways around its line", () => {
    const a = flutter(0, FPS, "l1", leaf);
    const b = flutter(FPS, FPS, "l1", leaf);
    expect(b.y - a.y).toBeCloseTo(leaf.fall, 6); // fall is px per second; b is one second later
    const xs = Array.from({ length: FPS * 3 }, (_, f) => flutter(f, FPS, "l1", leaf).x);
    expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(leaf.sway);
  });
  it("tumbles in 3D: the flip (rotateY) passes through edge-on", () => {
    const flips = Array.from({ length: FPS * 3 }, (_, f) => Math.cos((flutter(f, FPS, "l1", leaf).flip * Math.PI) / 180));
    expect(Math.min(...flips)).toBeLessThan(0.3);
  });
  it("is pure: same seed and frame give the same pose; another seed differs", () => {
    expect(flutter(7, FPS, "l1", leaf)).toEqual(flutter(7, FPS, "l1", leaf));
    expect(flutter(7, FPS, "l2", leaf).x).not.toBeCloseTo(flutter(7, FPS, "l1", leaf).x, 3);
  });
});

describe("drift (floating objects)", () => {
  it("stays within its amplitude and moves smoothly", () => {
    const xs = Array.from({ length: 200 }, (_, f) => drift(f, FPS, "c", { amp: 10, hz: 0.5 }).x);
    expect(Math.max(...xs.map(Math.abs))).toBeLessThanOrEqual(10.0001);
    const steps = xs.slice(1).map((v, i) => Math.abs(v - xs[i]));
    expect(Math.max(...steps)).toBeLessThan(10 * 2 * Math.PI * 0.5 * 2 / FPS);
  });
});

describe("impactShake", () => {
  it("is zero before the hit, strong right after, gone after its decay", () => {
    const opt = { at: 10, amp: 20, hz: 9, decay: 6 };
    expect(impactShake(9, FPS, "s", opt)).toEqual({ x: 0, y: 0, rotate: 0 });
    const hit = Array.from({ length: 3 }, (_, i) => impactShake(10 + i, FPS, "s", opt));
    expect(Math.max(...hit.map((p) => Math.hypot(p.x, p.y)))).toBeGreaterThan(5);
    const late = impactShake(10 + FPS * 2, FPS, "s", opt);
    expect(Math.hypot(late.x, late.y)).toBeLessThan(0.5);
  });
});
