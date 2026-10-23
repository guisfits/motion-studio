import { describe, expect, it } from "vitest";
import { stepFrame } from "../step";

describe("stepFrame", () => {
  it("holds for fps/stepFps frames, then jumps (exact ratio)", () => {
    const held = Array.from({ length: 8 }, (_, f) => stepFrame(f, 24, 12));
    expect(held).toEqual([0, 0, 2, 2, 4, 4, 6, 6]);
  });

  it("keeps a true 12 fps clock at 30 fps with 3,2 holds", () => {
    const held = Array.from({ length: 10 }, (_, f) => stepFrame(f, 30, 12));
    expect(held).toEqual([0, 0, 0, 3, 3, 5, 5, 5, 8, 8]);
  });

  it("holds two frames at 15 steps/s on 30 fps", () => {
    const held = Array.from({ length: 6 }, (_, f) => stepFrame(f, 30, 15));
    expect(held).toEqual([0, 0, 2, 2, 4, 4]);
  });

  it("never runs ahead of the real frame, and is pure", () => {
    for (let f = 0; f < 600; f++) {
      expect(stepFrame(f, 30)).toBeLessThanOrEqual(f);
      expect(stepFrame(f, 30)).toBe(stepFrame(f, 30));
    }
  });

  it("defaults to 12 steps per second", () => {
    expect(stepFrame(30, 30)).toBe(stepFrame(30, 30, 12));
  });
});
