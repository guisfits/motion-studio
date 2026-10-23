import { describe, expect, it } from "vitest";
import { carryAt } from "../carry";

const opts = { delay: 1, dur: 0.5, over: 0.04, stepFps: 30 };

describe("carryAt", () => {
  it("is fully outside (remaining 1) before the delay: nothing pops in", () => {
    expect(carryAt(0, 30, opts).remaining).toBe(1);
    expect(carryAt(29, 30, opts).remaining).toBe(1);
  });

  it("travels monotonically to the landing point, then overshoots and settles", () => {
    const land = Math.round((1 + 0.5) * 30);
    let prev = 1;
    for (let f = 30; f <= land; f++) {
      const r = carryAt(f, 30, opts).remaining;
      expect(r).toBeLessThanOrEqual(prev + 1e-9);
      prev = r;
    }
    expect(carryAt(land, 30, opts).remaining).toBeCloseTo(0, 5);
    const after = Array.from({ length: 20 }, (_, i) => carryAt(land + i, 30, opts).remaining);
    expect(Math.min(...after)).toBeLessThan(0);
    expect(Math.min(...after)).toBeGreaterThan(-0.04);
    expect(Math.abs(carryAt(land + 40, 30, opts).remaining)).toBeLessThan(1e-3);
  });

  it("lifts the shadow in flight and flattens it on landing", () => {
    expect(carryAt(33, 30, opts).lift).toBeGreaterThan(0.3);
    expect(carryAt(30 * 3, 30, opts).lift).toBe(0);
  });

  it("with over 0 never goes past the target", () => {
    for (let f = 0; f < 120; f++) {
      expect(carryAt(f, 30, { ...opts, over: 0 }).remaining).toBeGreaterThanOrEqual(0);
    }
  });
});
