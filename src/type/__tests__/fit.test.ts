import { describe, expect, it } from "vitest";
import { fitSize } from "../fit";

// layout-utils measures in a DOM canvas, which node tests lack: the math takes an injected
// measure fn. This one models a proportional face, width = 0.62 * size per character.
const measure = (text: string, _family: string, size: number) => text.length * 0.62 * size;

describe("fitSize", () => {
  it("shrinks MISERICÓRDIAS to fit 600 px", () => {
    const size = fitSize("MISERICÓRDIAS", "x", 600, 400, measure);
    expect(size).toBeLessThan(400);
    expect(measure("MISERICÓRDIAS", "x", size)).toBeLessThanOrEqual(600);
    expect(measure("MISERICÓRDIAS", "x", size + 1)).toBeGreaterThan(600);
  });

  it("keeps maxSize when the text already fits", () => {
    expect(fitSize("Nínive", "x", 2000, 120, measure)).toBe(120);
  });

  it("handles a 14-char accented word inside a fixed width", () => {
    const size = fitSize("RESSURREIÇÃO!!", "x", 500, 300, measure);
    expect(measure("RESSURREIÇÃO!!", "x", size)).toBeLessThanOrEqual(500);
  });

  it("returns 0 for empty text or no room", () => {
    expect(fitSize("", "x", 600, 100, measure)).toBe(0);
    expect(fitSize("abc", "x", 0, 100, measure)).toBe(0);
  });

  it("walks down when the linear estimate overshoots (side bearings are not proportional)", () => {
    // 0.6 * size per char plus a fixed 30 px: the 100 px probe over-estimates, 74 px measures 607 px.
    const padded = (text: string, _family: string, size: number) => text.length * 0.6 * size + 30;
    const size = fitSize("MISERICÓRDIAS", "x", 600, 400, padded);
    expect(padded("MISERICÓRDIAS", "x", size)).toBeLessThanOrEqual(600);
    expect(padded("MISERICÓRDIAS", "x", size + 1)).toBeGreaterThan(600);
  });
});
