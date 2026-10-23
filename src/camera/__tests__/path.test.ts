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
