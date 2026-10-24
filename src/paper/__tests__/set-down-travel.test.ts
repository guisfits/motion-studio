import { describe, expect, it } from "vitest";
import { setDownTravel } from "../set-down-travel";

describe("setDownTravel", () => {
  it("keeps the frame-only travel when no sheet size is given", () => {
    expect(setDownTravel("left", 1920, 1080)).toBe(1920);
    expect(setDownTravel("top", 1920, 1080, { margin: 50 })).toBe(1130);
  });

  it("adds the sheet size along the travel axis so a large sheet clears the frame", () => {
    expect(setDownTravel("right", 1920, 1080, { size: [1000, 700] })).toBe(2920);
    expect(setDownTravel("bottom", 1920, 1080, { size: [1000, 700] })).toBe(1780);
  });

  it("still honours margin on top of the size", () => {
    expect(setDownTravel("left", 1920, 1080, { size: [600, 400], margin: 40 })).toBe(2560);
  });
});
