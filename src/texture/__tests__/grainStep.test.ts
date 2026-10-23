import { describe, expect, it } from "vitest";
import { grainSeed, grainStep } from "../grainStep";

describe("grainStep", () => {
  it("holds a deal for a whole step (24 fps grain on a 30 fps comp)", () => {
    // 30 fps comp, 24 fps grain: 5 frames out of 6 advance the step; none repeat a step more than twice.
    const steps = Array.from({ length: 30 }, (_, f) => grainStep(f, 30, 24));
    expect(steps[0]).toBe(0);
    expect(steps[29]).toBe(23);
    expect(new Set(steps).size).toBe(24);
  });

  it("on twos: 15 fps grain on a 30 fps comp repeats each deal for 2 frames", () => {
    expect([0, 1, 2, 3, 4, 5].map((f) => grainStep(f, 30, 15))).toEqual([0, 0, 1, 1, 2, 2]);
  });

  it("rejects non-positive rates", () => {
    expect(() => grainStep(0, 30, 0)).toThrow();
    expect(() => grainStep(0, 0, 24)).toThrow();
  });
});

describe("grainSeed", () => {
  it("is stable: same frame and seed, same output, at any frame count", () => {
    expect(grainSeed(18_000, 30, 24, 3)).toBe(grainSeed(18_000, 30, 24, 3));
  });
  it("re-deals on each step, not inside one", () => {
    expect(grainSeed(0, 30, 15)).toBe(grainSeed(1, 30, 15));
    expect(grainSeed(1, 30, 15)).not.toBe(grainSeed(2, 30, 15));
  });
  it("different layer seeds differ", () => {
    expect(grainSeed(10, 30, 24, 1)).not.toBe(grainSeed(10, 30, 24, 2));
  });
  it("stays in the shader range", () => {
    for (let f = 0; f < 200; f++) {
      const s = grainSeed(f, 30, 24, 7);
      expect(Number.isInteger(s) && s >= 0 && s < 10000).toBe(true);
    }
  });
});
