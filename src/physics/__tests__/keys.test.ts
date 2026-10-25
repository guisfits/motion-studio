import { describe, expect, it } from "vitest";
import { linearKeys, monotoneKeys, type Key } from "../keys";

// The lion clone's head curve (S10): up, a plateau, then down.
const HEAD: Key[] = [
  [5, 892],
  [45, 682],
  [60, 682],
  [105, 1114],
];

describe("monotoneKeys (measured keyframe tables as smooth motion)", () => {
  it("passes through every key and clamps outside the table", () => {
    for (const [f, v] of HEAD) expect(monotoneKeys(f, HEAD)).toBeCloseTo(v, 6);
    expect(monotoneKeys(0, HEAD)).toBe(892);
    expect(monotoneKeys(200, HEAD)).toBe(1114);
  });
  it("never overshoots a neighbouring key", () => {
    for (let f = 5; f <= 105; f += 0.25) {
      const v = monotoneKeys(f, HEAD);
      expect(v).toBeGreaterThanOrEqual(682 - 1e-9);
      expect(v).toBeLessThanOrEqual(1114 + 1e-9);
    }
  });
  it("holds a plateau flat between equal keys", () => {
    for (let f = 45; f <= 60; f++) expect(monotoneKeys(f, HEAD)).toBeCloseTo(682, 9);
  });
  it("has no velocity kink at an inner key (left and right slopes agree)", () => {
    const ks: Key[] = [
      [0, 0],
      [10, 4],
      [20, 10],
    ];
    const left = monotoneKeys(10, ks) - monotoneKeys(9.999, ks);
    const right = monotoneKeys(10.001, ks) - monotoneKeys(10, ks);
    expect(left).toBeCloseTo(right, 4);
  });
  it("returns the only value of a one-key table", () => {
    expect(monotoneKeys(3, [[0, 7]])).toBe(7);
  });
});

describe("linearKeys", () => {
  it("interpolates straight and clamps", () => {
    const ks: Key[] = [
      [0, 0],
      [10, 1],
    ];
    expect(linearKeys(5, ks)).toBe(0.5);
    expect(linearKeys(-1, ks)).toBe(0);
    expect(linearKeys(11, ks)).toBe(1);
  });
});
