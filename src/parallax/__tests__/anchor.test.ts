import { describe, expect, it } from "vitest";
import { anchorTransform } from "../AnchorPlane";

describe("anchorTransform (a plane pinned by its anchor)", () => {
  it("puts the anchor at the screen point, then scales and rolls around it", () => {
    expect(anchorTransform({ px: 100, py: 200, s: 2, rot: 25, ax: 10, ay: 20 })).toBe(
      "translate(100px, 200px) rotate(-25deg) scale(2) translate(-10px, -20px)",
    );
  });
  it("maps layout px to output px with unit", () => {
    expect(anchorTransform({ px: 100, py: 0, s: 1, ax: 10, ay: 0 }, 1.5)).toBe(
      "translate(150px, 0px) rotate(0deg) scale(1) translate(-15px, 0px)",
    );
  });
});
