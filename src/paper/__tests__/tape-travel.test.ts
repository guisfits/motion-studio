import { describe, expect, it } from "vitest";
import { tapeTravel } from "../tape-travel";

describe("tapeTravel", () => {
  it.each([-45, -32, 0, 30, 90])("parks the whole strip above the frame at rotation %i", (rot) => {
    const top = 80;
    const [w, h] = [240, 64];
    const r = (rot * Math.PI) / 180;
    const box = Math.abs(w * Math.sin(r)) + Math.abs(h * Math.cos(r));
    const lowestPoint = top + (h + box) / 2 - tapeTravel(top, w, h, rot);
    expect(lowestPoint).toBeLessThanOrEqual(0);
  });

  it("grows with the resting top so a lower strip still starts off-frame", () => {
    expect(tapeTravel(400, 220, 64, -32)).toBeGreaterThan(tapeTravel(80, 220, 64, -32));
  });
});
