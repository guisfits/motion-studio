import { describe, expect, it } from "vitest";
import { BLUR_SAMPLES, shutterAngleFor, shutterAt } from "../blur";
import { cameraAt, type CamKey } from "../path";

describe("shutterAngleFor", () => {
  it("scales with velocity and caps at the ceiling", () => {
    expect(shutterAngleFor(0)).toBe(0);
    expect(shutterAngleFor(10)).toBeCloseTo(22, 9);
    expect(shutterAngleFor(10_000)).toBe(120);
  });
});

describe("shutterAt", () => {
  it("is the plain velocity shutter away from any cut", () => {
    const keys: CamKey[] = [
      { frame: 0, x: 0, y: 0, zoom: 1 },
      { frame: 90, x: 1000, y: 0, zoom: 1 },
    ];
    for (const f of [0, 10, 45, 80, 120]) {
      expect(shutterAt(keys, f)).toBe(shutterAngleFor(cameraAt(keys, f).velocity));
    }
    expect(shutterAt(keys, 45)).toBeGreaterThan(1);
  });

  describe("at a hard cut (two keys on one frame)", () => {
    // Whip into the cut, then a slow glide out of it.
    const keys: CamKey[] = [
      { frame: 0, x: 0, y: 0, zoom: 1, ease: "whip" },
      { frame: 20, x: 800, y: 0, zoom: 1 },
      { frame: 30, x: 800, y: 0, zoom: 1 },
      { frame: 30, x: 3000, y: 0, zoom: 1 },
      { frame: 120, x: 3100, y: 0, zoom: 1 },
    ];

    it("keeps the cut frame clean: no smear from the jump, only the new shot's own speed", () => {
      expect(cameraAt(keys, 30).x).toBe(3000);
      expect(shutterAt(keys, 30)).toBeLessThan(1);
    });

    it("leaves the shots either side of the cut as they were", () => {
      expect(shutterAt(keys, 8)).toBeGreaterThan(1);
      expect(shutterAt(keys, 29)).toBe(0);
      expect(shutterAt(keys, 31)).toBe(shutterAngleFor(cameraAt(keys, 31).velocity));
    });
  });

  describe("when the shutter would straddle a cut", () => {
    // CameraMotionBlur renders frame f from sample frames in (f + 1 - w, f + 1 - w / samples],
    // w = shutterAngle / 360. A cut at 29.8 sits inside frame 29's window while 29 itself is
    // still the whip arriving at the old pose: blurring it would mix both shots.
    const keys: CamKey[] = [
      { frame: 20, x: 0, y: 0, zoom: 1, ease: "whip" },
      { frame: 29.8, x: 4000, y: 0, zoom: 1 },
      { frame: 29.8, x: 9000, y: 0, zoom: 1 },
      { frame: 90, x: 9000, y: 0, zoom: 1 },
    ];

    it("has a shutter at frame 29 wide enough to reach the cut (so the guard is what turns it off)", () => {
      // The window's lower edge, 30 - w, must be below 29.8: w > 0.2, i.e. over 72 degrees.
      expect(shutterAngleFor(cameraAt(keys, 29).velocity)).toBeGreaterThan(72);
    });

    it("turns blur off on that frame", () => {
      expect(shutterAt(keys, 29)).toBe(0);
    });

    it("never lets any sample window of any frame contain both sides of a cut", () => {
      const cutFrame = 29.8;
      for (let f = 0; f <= 60; f++) {
        const w = shutterAt(keys, f) / 360;
        if (w === 0) continue;
        const lo = f + 1 - w;
        const hi = f + 1 - w / BLUR_SAMPLES;
        expect(lo < cutFrame && cutFrame <= hi, `frame ${f}`).toBe(false);
      }
    });
  });
});
