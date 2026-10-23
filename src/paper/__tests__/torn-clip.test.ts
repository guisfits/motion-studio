import { describe, expect, it } from "vitest";
import { tornClip, tornSplitClips } from "../torn-clip";

const points = (poly: string) => {
  const m = poly.match(/^polygon\((.*)\)$/);
  expect(m).not.toBeNull();
  return m![1].split(",").map((p) => p.trim().split(/\s+/).map((v) => parseFloat(v)));
};

describe("tornClip", () => {
  it("returns the same string for the same seed, another for another seed", () => {
    expect(tornClip("s")).toBe(tornClip("s"));
    expect(tornClip("s")).not.toBe(tornClip("t"));
  });

  it("is a closed polygon: enough points, and the ring ends next to where it starts", () => {
    const pts = points(tornClip("closed"));
    expect(pts.length).toBeGreaterThan(20);
    const [first, last] = [pts[0], pts[pts.length - 1]];
    expect(Math.hypot(first[0] - last[0], first[1] - last[1])).toBeLessThan(10);
  });

  it("keeps every point within 0-100%", () => {
    for (const seed of ["a", "b", "c", "d"]) {
      for (const [x, y] of points(tornClip(seed, 3, 30))) {
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThanOrEqual(100);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(100);
      }
    }
  });
});

describe("tornSplitClips", () => {
  it("is deterministic and the two halves share the ragged line", () => {
    const a = tornSplitClips("split");
    expect(a).toEqual(tornSplitClips("split"));
    const top = points(a.top);
    const bottom = points(a.bottom);
    const shared = top.filter((p) => bottom.some((q) => q[0] === p[0] && q[1] === p[1]));
    expect(shared.length).toBeGreaterThan(10);
  });

  it("walks each half as a simple ring: the top half returns along the rip, the bottom half runs along it", () => {
    const a = tornSplitClips("ring");
    const xs = (poly: string, from: number, to?: number) => points(poly).slice(from, to).map((p) => p[0]);
    const nonIncreasing = (v: number[]) => v.every((x, i) => i === 0 || x <= v[i - 1]);
    const nonDecreasing = (v: number[]) => v.every((x, i) => i === 0 || x >= v[i - 1]);
    // top: 0% 0%, 100% 0%, then the rip from right to left
    expect(nonIncreasing(xs(a.top, 2))).toBe(true);
    // bottom: the rip from left to right, then 100% 100%, 0% 100%
    expect(nonDecreasing(xs(a.bottom, 0, -2))).toBe(true);
  });

  it("keeps all points within 0-100%", () => {
    const a = tornSplitClips("split2", 40, 4);
    for (const [x, y] of [...points(a.top), ...points(a.bottom)]) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(100);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(100);
    }
  });
});
