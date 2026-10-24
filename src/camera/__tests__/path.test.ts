import { describe, expect, it } from "vitest";
import { cameraAt, type CamKey } from "../path";

const keys: CamKey[] = [
  { frame: 0, x: 0, y: 0, zoom: 1 },
  { frame: 60, x: 400, y: 100, zoom: 1.1, rotate: 2 },
  { frame: 120, x: 400, y: 100, zoom: 1.1, rotate: 2, ease: "whip" },
  { frame: 180, x: 2000, y: 100, zoom: 1.1 },
];

describe("cameraAt", () => {
  it("is exact at key frames", () => {
    for (const k of keys) {
      const c = cameraAt(keys, k.frame);
      expect(c.x).toBeCloseTo(k.x, 9);
      expect(c.y).toBeCloseTo(k.y, 9);
      expect(c.zoom).toBeCloseTo(k.zoom, 9);
      expect(c.rotate).toBeCloseTo(k.rotate ?? 0, 9);
    }
  });

  it("moves monotonically between keys", () => {
    let prev = cameraAt(keys, 0).x;
    for (let f = 1; f <= 60; f++) {
      const x = cameraAt(keys, f).x;
      expect(x).toBeGreaterThanOrEqual(prev);
      prev = x;
    }
  });

  it("clamps before the first and after the last key", () => {
    expect(cameraAt(keys, -50)).toMatchObject({ x: 0, y: 0, zoom: 1, velocity: 0 });
    expect(cameraAt(keys, 9999)).toMatchObject({ x: 2000, zoom: 1.1, velocity: 0 });
  });

  it("has zero velocity on a hold and peaks mid-whip", () => {
    expect(cameraAt(keys, 90).velocity).toBe(0);
    const whip = Array.from({ length: 61 }, (_, i) => cameraAt(keys, 120 + i).velocity);
    const peak = Math.max(...whip);
    expect(peak).toBeGreaterThan(0);
    const at = whip.indexOf(peak);
    expect(at).toBeGreaterThan(0);
    expect(at).toBeLessThan(30);
  });

  it("whip travels faster than the default glide", () => {
    const pair = (ease?: CamKey["ease"]): CamKey[] => [
      { frame: 0, x: 0, y: 0, zoom: 1, ease },
      { frame: 90, x: 1000, y: 0, zoom: 1 },
    ];
    expect(cameraAt(pair("whip"), 8).x).toBeGreaterThan(cameraAt(pair(), 8).x);
  });

  it("stays finite at frame 18000 on a 2-key path and is pure per frame", () => {
    const two: CamKey[] = [
      { frame: 0, x: 0, y: 0, zoom: 1 },
      { frame: 90, x: 500, y: 200, zoom: 1.2 },
    ];
    const c = cameraAt(two, 18000);
    for (const v of Object.values(c)) expect(Number.isFinite(v)).toBe(true);
    expect(c.x).toBe(500);
    expect(cameraAt(two, 45)).toEqual(cameraAt(two, 45));
  });

  it("handles an empty and a single-key path", () => {
    expect(cameraAt([], 10).zoom).toBe(1);
    expect(cameraAt([keys[1]], 10)).toMatchObject({ x: 400, velocity: 0 });
  });
});

describe("cameraAt key order", () => {
  it("gives the same result for unsorted keys as for sorted ones, without mutating the input", () => {
    const shuffled = [keys[2], keys[0], keys[3], keys[1]];
    const snapshot = [...shuffled];
    for (const f of [-5, 0, 30, 60, 100, 150, 180, 250]) {
      expect(cameraAt(shuffled, f)).toEqual(cameraAt(keys, f));
    }
    expect(shuffled).toEqual(snapshot);
  });
});

describe("cameraAt velocity across a hard cut", () => {
  // A cut is two keys on one frame: the old pose, then the new one.
  const cut = (after: CamKey[]): CamKey[] => [
    { frame: 0, x: 0, y: 0, zoom: 1 },
    { frame: 30, x: 0, y: 0, zoom: 1 },
    { frame: 30, x: 1900, y: 0, zoom: 1 },
    ...after,
  ];

  it("is the pose of the new key at the cut frame, and the jump is not a speed", () => {
    const keys = cut([{ frame: 60, x: 1900, y: 0, zoom: 1 }]);
    expect(cameraAt(keys, 30)).toMatchObject({ x: 1900, velocity: 0 });
    expect(cameraAt(keys, 29).velocity).toBe(0);
    expect(cameraAt(keys, 31).velocity).toBe(0);
  });

  it("reads the cut frame's speed from the shot it starts, not from the jump", () => {
    const keys = cut([{ frame: 90, x: 2500, y: 0, zoom: 1 }]);
    const alone: CamKey[] = [
      { frame: 30, x: 1900, y: 0, zoom: 1 },
      { frame: 90, x: 2500, y: 0, zoom: 1 },
    ];
    // The shot's own opening speed is the half-frame step forward; never the 1900 px jump.
    expect(cameraAt(keys, 30).velocity).toBeLessThan(20);
    expect(cameraAt(keys, 30).velocity).toBeCloseTo(cameraAt(alone, 30.5).velocity, 0);
    // Away from the cut nothing changes.
    expect(cameraAt(keys, 45).velocity).toBe(cameraAt(alone, 45).velocity);
  });

  it("does not read the next cut's jump in the last frames of a shot", () => {
    const keys: CamKey[] = [
      { frame: 0, x: 0, y: 0, zoom: 1 },
      { frame: 30, x: 600, y: 0, zoom: 1 },
      { frame: 30, x: 5000, y: 0, zoom: 1 },
      { frame: 60, x: 5000, y: 0, zoom: 1 },
    ];
    const lead = cameraAt(keys, 29.75).velocity;
    expect(lead).toBeGreaterThan(0);
    expect(lead).toBeLessThan(50);
  });
});
