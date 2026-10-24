import { describe, expect, it } from "vitest";
import { cameraAt, cutAtPeak, cutFrames, shutterAt, steppedCamFrame, viewAt, zoomThrough, type CamKey } from "..";

const leg: CamKey[] = [
  { frame: 0, x: 0, y: 0, zoom: 1 },
  { frame: 60, x: 600, y: 0, zoom: 1 },
];

describe("stepped camera", () => {
  it("holds poses: 30 fps on 12 steps repeats the pose 3,2,3,2", () => {
    const xs = Array.from({ length: 10 }, (_, f) => viewAt(leg, f, { durationInFrames: 60, drift: 0, stepFps: 12 }).x);
    expect(xs[0]).toBe(xs[1]);
    expect(xs[3]).toBe(xs[4]);
    expect(new Set(xs).size).toBe(4);
    expect(xs[2]).not.toBe(xs[3]);
  });

  it("is off by default (smooth) and by stepFps >= fps", () => {
    const a = viewAt(leg, 7, { durationInFrames: 60, drift: 0 });
    expect(a.x).toBe(cameraAt(leg, 7).x);
    expect(steppedCamFrame(leg, 7, 30)).toBe(7);
  });

  it("never holds the old shot across a hard cut", () => {
    const cut: CamKey[] = [
      { frame: 0, x: 0, y: 0, zoom: 1 },
      { frame: 31, x: 0, y: 0, zoom: 1 },
      { frame: 31, x: 900, y: 0, zoom: 1 },
      { frame: 90, x: 900, y: 0, zoom: 1 },
    ];
    expect(cutFrames(cut)).toEqual([31]);
    expect(viewAt(cut, 31, { durationInFrames: 90, drift: 0, stepFps: 12 }).x).toBe(900);
    expect(viewAt(cut, 30, { durationInFrames: 90, drift: 0, stepFps: 12 }).x).toBe(0);
  });

  it("draws no motion blur", () => {
    const fast: CamKey[] = [
      { frame: 0, x: 0, y: 0, zoom: 1, ease: "whip" },
      { frame: 30, x: 3000, y: 0, zoom: 1 },
    ];
    expect(shutterAt(fast, 5)).toBeGreaterThan(0);
    expect(shutterAt(fast, 5, 16, 12)).toBe(0);
  });
});

describe("linear ease", () => {
  it("moves at constant speed over the whole leg, between frames too", () => {
    const keys: CamKey[] = [
      { frame: 10, x: 0, y: 0, zoom: 1, ease: "linear" },
      { frame: 50, x: 400, y: 0, zoom: 1 },
    ];
    for (const f of [10, 10.25, 20, 30.5, 49.75, 50]) expect(cameraAt(keys, f).x).toBeCloseTo(((f - 10) / 40) * 400, 9);
    expect(cameraAt(keys, 20).velocity).toBeCloseTo(cameraAt(keys, 40).velocity, 9);
  });
});

describe("cutAtPeak", () => {
  it("finds the middle of a symmetric glide", () => {
    expect(cutAtPeak(leg, 0, 60)).toBe(30);
  });

  it("finds the fastest frame of a travel inside a longer leg", () => {
    const moveKeys: CamKey[] = [
      { frame: 0, x: 0, y: 0, zoom: 1, ease: "move" },
      { frame: 90, x: 600, y: 0, zoom: 1 },
    ];
    const peak = cutAtPeak(moveKeys, 0, 90);
    const speeds = Array.from({ length: 91 }, (_, f) => cameraAt(moveKeys, f).velocity);
    expect(speeds[peak]).toBeGreaterThanOrEqual(Math.max(...speeds) * 0.99);
    expect(peak).toBeLessThan(15); // a 0.7 s travel (21 frames) peaks near frame 10, not at 45
  });
});

describe("zoomThrough", () => {
  const dive = zoomThrough({ at: 30, dur: 30, from: { x: 960, y: 540 }, target: { x: 1200, y: 400 }, next: { x: 5000, y: 5000 }, depth: 10 });

  it("starts on the outgoing camera and lands on the next shot's pose", () => {
    expect(cameraAt(dive.keys, 30)).toMatchObject({ x: 960, y: 540, zoom: 1 });
    const end = cameraAt(dive.keys, dive.endFrame);
    expect(end.x).toBeCloseTo(5000, 6);
    expect(end.y).toBeCloseTo(5000, 6);
    expect(end.zoom).toBeCloseTo(1, 9);
  });

  it("cuts once, at the fastest point of the scale move, and the picture does not jump on screen", () => {
    expect(cutFrames(dive.keys)).toEqual([dive.cutFrame]);
    expect(dive.cutFrame).toBe(45);
    const old = cameraAt(dive.keys, dive.cutFrame - 1e-6);
    const now = cameraAt(dive.keys, dive.cutFrame);
    expect(old.zoom).toBeCloseTo(Math.sqrt(10), 3); // outgoing shot is mid-dive
    expect(now.zoom).toBeCloseTo(old.zoom / 10, 3); // the incoming rides the same move from 1/depth
  });

  it("accelerates into the cut: scale speed grows up to it", () => {
    const logz = (f: number) => Math.log(cameraAt(dive.keys, f).zoom);
    expect(logz(36) - logz(33)).toBeGreaterThan(logz(33) - logz(30));
  });

  it("keeps the dived point gliding to the frame centre", () => {
    const near = cameraAt(dive.keys, dive.cutFrame - 1);
    const far = cameraAt(dive.keys, 31);
    const gap = (c: { x: number; y: number }) => Math.hypot(c.x - 1200, c.y - 400);
    expect(gap(near)).toBeLessThan(gap(far));
  });
});
