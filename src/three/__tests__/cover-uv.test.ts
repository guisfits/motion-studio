import { describe, expect, it } from "vitest";
import { coverUV } from "../cover-uv";

describe("coverUV", () => {
  it("crops the width of an image wider than the box and centres it", () => {
    const uv = coverUV(2, 1);
    expect(uv.repeatX).toBeCloseTo(0.5);
    expect(uv.repeatY).toBe(1);
    expect(uv.offsetX).toBeCloseTo(0.25);
    expect(uv.offsetY).toBe(0);
  });

  it("crops the height of a taller image", () => {
    const uv = coverUV(0.5, 1);
    expect(uv.repeatX).toBe(1);
    expect(uv.repeatY).toBeCloseTo(0.5);
    expect(uv.offsetY).toBeCloseTo(0.25);
  });

  it("zooms in and pans to the edges without leaving the image", () => {
    const top = coverUV(1, 1, 2, -1, -1);
    const bottom = coverUV(1, 1, 2, 1, 1);
    expect(top.repeatX).toBeCloseTo(0.5);
    expect(top.offsetX).toBe(0);
    expect(bottom.offsetX).toBeCloseTo(0.5);
    expect(bottom.offsetY + bottom.repeatY).toBeCloseTo(1);
  });
});
