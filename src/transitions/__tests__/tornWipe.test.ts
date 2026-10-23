import { describe, expect, it } from "vitest";
import { smootherstep, tornWipePose } from "../tornWipe";

const W = 1920;
const H = 1080;

describe("tornWipePose", () => {
  for (const direction of ["left", "up"] as const) {
    it(`${direction}: at progress 0 the exiting sheet covers the frame untouched`, () => {
      const p = tornWipePose(0, direction, W, H);
      expect(p).toMatchObject({ x: 0, y: 0, rotate: 0, bite: 0, shadow: 0 });
    });

    it(`${direction}: at progress 1 the exiting sheet is fully off-frame`, () => {
      const p = tornWipePose(1, direction, W, H);
      const dist = direction === "left" ? -p.x : -p.y;
      expect(dist).toBeGreaterThanOrEqual(direction === "left" ? W : H);
      expect(p.shadow).toBe(0);
    });

    it(`${direction}: travel is monotonic`, () => {
      let last = 0;
      for (let i = 1; i <= 20; i++) {
        const p = tornWipePose(i / 20, direction, W, H);
        const dist = direction === "left" ? -p.x : -p.y;
        expect(dist).toBeGreaterThanOrEqual(last);
        last = dist;
      }
    });
  }

  it("left tilts -8 deg and up tilts +5 deg at the end (baseline join)", () => {
    expect(tornWipePose(1, "left", W, H).rotate).toBeCloseTo(-8);
    expect(tornWipePose(1, "up", W, H).rotate).toBeCloseTo(5);
  });

  it("smootherstep is 0/1 at the ends and 0.5 at the middle", () => {
    expect(smootherstep(0)).toBe(0);
    expect(smootherstep(1)).toBe(1);
    expect(smootherstep(0.5)).toBeCloseTo(0.5);
  });
});
