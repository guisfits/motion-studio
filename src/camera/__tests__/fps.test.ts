import { describe, expect, it } from "vitest";
import { cameraAt, steppedCamFrame, viewAt, type CamKey } from "../path";
import { cutAtPeak } from "../devices";
import { docZoomKeys, docZoomPose } from "../../devices/doc-zoom";

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

describe("camera helpers a trace calls follow the same rate", () => {
  // A "move" leg travels in 0.7 s: 11.2 frames at 16 fps, 21 at 30. Its fastest point moves with it.
  const move: CamKey[] = [
    { frame: 0, x: 0, y: 0, zoom: 1, ease: "move" },
    { frame: 40, x: 1000, y: 0, zoom: 1 },
  ];
  it("cutAtPeak finds the peak on the given clock", () => {
    expect(cutAtPeak(move, 0, 40)).toBe(11); // 30 fps: mid-travel of 21 frames
    expect(cutAtPeak(move, 0, 40, { fps: 16 })).toBe(6); // 16 fps: mid-travel of 11.2 frames
  });
  it("docZoomPose reads the camera at the given rate, as DocZoom's Camera does", () => {
    const g = { x: 500, y: 500, size: [800, 1000] as [number, number], rect: { x: 0.1, y: 0.4, w: 0.6, h: 0.1 } };
    const t = { pushFrom: 10, pushTo: 60 };
    const keys = docZoomKeys(g, t);
    expect(docZoomPose(g, t, 18, 90, 0, 16).zoom).toBeCloseTo(viewAt(keys, 18, { durationInFrames: 90, drift: 0, fps: 16 }).zoom, 9);
  });
});
