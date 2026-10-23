import { describe, expect, it } from "vitest";
import { shutterAngleFor } from "../blur";

describe("shutterAngleFor", () => {
  it("scales with velocity and caps at the ceiling", () => {
    expect(shutterAngleFor(0)).toBe(0);
    expect(shutterAngleFor(10)).toBeCloseTo(22, 9);
    expect(shutterAngleFor(10_000)).toBe(120);
  });
});
