import { describe, expect, it } from "vitest";
import { bounce, drift, flutter, hover, impactShake, throwIn } from "../motion";

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
  it("takes its `frames` to arrive at any damping, even a wobbly one", () => {
    // The 95 % point is the FIRST time the spring gets there; a low damping rings back below it
    // afterwards, and the throw must not be timed on one of those later crossings.
    for (const damping of [0.1, 0.2, 0.3, 0.45, 0.7, 1.2]) {
      for (const frames of [3, 6, 20]) {
        const prog = (f: number) => (throwIn(f, 30, { from, to, frames, damping }).x - from.x) / (to.x - from.x);
        expect(prog(frames)).toBeCloseTo(0.95, 2);
        expect(prog(frames - 1)).toBeLessThan(0.95);
      }
    }
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

describe("hover (a slow carry that ends floating)", () => {
  const from = { x: 100, y: 800, rotate: -6, scale: 0.8 };
  const to = { x: 700, y: 300, rotate: 4, scale: 1 };
  const opt = { from, to, frames: 30, amp: 6, hz: 0.5 };
  const at = (f: number, seed = "h") => hover(f, FPS, seed, opt);

  it("starts on `from` and is exactly on `to` when its frames are up", () => {
    expect(at(0)).toEqual(from);
    expect(at(-4)).toEqual(from);
    expect(at(30)).toEqual(to);
  });

  it("never overshoots: x, y, rotate and scale approach the target monotonically", () => {
    let prev = at(0);
    for (let f = 1; f <= 30; f++) {
      const p = at(f);
      expect(p.x).toBeGreaterThanOrEqual(prev.x); // x rises 100 -> 700
      expect(p.x).toBeLessThanOrEqual(to.x);
      expect(p.y).toBeLessThanOrEqual(prev.y); // y falls 800 -> 300
      expect(p.y).toBeGreaterThanOrEqual(to.y);
      expect(p.rotate).toBeGreaterThanOrEqual(prev.rotate);
      expect(p.rotate).toBeLessThanOrEqual(to.rotate);
      expect(p.scale).toBeLessThanOrEqual(to.scale);
      prev = p;
    }
  });

  it("does not overshoot going the other way either", () => {
    const back = (f: number) => hover(f, FPS, "h", { ...opt, from: to, to: from });
    for (let f = 0; f <= 30; f++) {
      expect(back(f).x).toBeLessThanOrEqual(to.x);
      expect(back(f).x).toBeGreaterThanOrEqual(from.x);
    }
  });

  it("arrives at rest: the last carry frames barely move", () => {
    const last = Math.hypot(at(30).x - at(29).x, at(30).y - at(29).y);
    const mid = Math.hypot(at(16).x - at(15).x, at(16).y - at(15).y);
    expect(last).toBeLessThan(mid * 0.05);
  });

  it("floats after arrival, within amp, and the float starts at rest (no jump)", () => {
    const after = Array.from({ length: FPS * 6 }, (_, i) => at(30 + i));
    expect(Math.max(...after.map((p) => Math.abs(p.x - to.x)))).toBeGreaterThan(1);
    for (const p of after) {
      expect(Math.abs(p.x - to.x)).toBeLessThanOrEqual(6 + 1e-9);
      expect(Math.abs(p.y - to.y)).toBeLessThanOrEqual(6 + 1e-9);
      expect(Math.abs(p.rotate - to.rotate)).toBeLessThanOrEqual(0.6 + 1e-9);
      expect(p.scale).toBe(1);
    }
    expect(Math.hypot(at(31).x - at(30).x, at(31).y - at(30).y)).toBeLessThan(0.5);
  });

  it("is pure and seeded: any frame alone, same seed same float, another seed another float", () => {
    expect(at(77)).toEqual(at(77));
    const forward = Array.from({ length: 5 }, (_, i) => at(60 + i));
    const backward = [4, 3, 2, 1, 0].map((i) => at(60 + i)).reverse();
    expect(forward).toEqual(backward);
    expect(at(77, "a")).not.toEqual(at(77, "b"));
  });
});
