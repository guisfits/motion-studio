import { describe, expect, it } from "vitest";
import { wiggle } from "../wiggle";

describe("wiggle", () => {
  it("is stable per seed and frame", () => {
    expect(wiggle("a", 17, 30, 2)).toEqual(wiggle("a", 17, 30, 2));
  });

  it("is bounded by amp on every channel", () => {
    for (let f = 0; f < 900; f++) {
      const w = wiggle("bound", f, 30, 3);
      expect(Math.abs(w.x)).toBeLessThanOrEqual(3);
      expect(Math.abs(w.y)).toBeLessThanOrEqual(3);
      expect(Math.abs(w.rotate)).toBeLessThanOrEqual(3);
    }
  });

  it("is zero for amp 0", () => {
    expect(wiggle("a", 5, 30, 0)).toEqual({ x: 0, y: 0, rotate: 0 });
  });

  it("differs across seeds", () => {
    const a = Array.from({ length: 30 }, (_, f) => wiggle("one", f, 30, 2).x);
    const b = Array.from({ length: 30 }, (_, f) => wiggle("two", f, 30, 2).x);
    expect(a).not.toEqual(b);
  });

  it("holds its pose through a step and changes between steps", () => {
    expect(wiggle("h", 0, 30, 2)).toEqual(wiggle("h", 2, 30, 2));
    expect(wiggle("h", 0, 30, 2)).not.toEqual(wiggle("h", 3, 30, 2));
  });
});
