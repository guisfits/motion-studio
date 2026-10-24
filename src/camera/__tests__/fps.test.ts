import { describe, expect, it } from "vitest";
import { cameraAt, steppedCamFrame, viewAt, type CamKey } from "../path";

// A whip lands in 0.35 s whatever the composition rate: at 16 fps that is 5.6 frames, not 10.5.
const keys: CamKey[] = [
  { frame: 0, x: 0, y: 0, zoom: 1, ease: "whip" },
  { frame: 32, x: 1000, y: 0, zoom: 1 },
];

describe("camera at a composition rate other than 30 fps", () => {
  it("times eases in seconds at the given fps", () => {
    expect(cameraAt(keys, 6, 16).x).toBeCloseTo(1000, 6);
    expect(cameraAt(keys, 6).x).toBeLessThan(1000);
  });

  it("holds steps on the given clock: 8 poses a second at 16 fps = clean pairs", () => {
    expect([0, 1, 2, 3, 4, 5].map((f) => steppedCamFrame(keys, f, 8, 16))).toEqual([0, 0, 2, 2, 4, 4]);
  });

  it("viewAt passes the rate through", () => {
    const v = viewAt(keys, 6, { durationInFrames: 32, drift: 0, fps: 16 });
    expect(v.x).toBeCloseTo(1000, 6);
  });
});
