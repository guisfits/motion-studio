import { describe, expect, it } from "vitest";
import { assertImages, solve, type Part } from "../rig";
import { interpolatePose, interpolatePoseEased, POSES, type PoseKey } from "../poses";

// A three-link arm: shoulder (root) -> elbow -> wrist, 100 px apart, hanging down.
const parts: Part[] = [
  { part: "body", file: "b.png", pivot: [10, 10], parent: null, origin: [0, 0] },
  { part: "upper", file: "u.png", pivot: [5, 5], parent: "body", origin: [10, 10] },
  { part: "lower", file: "l.png", pivot: [5, 5], parent: "upper", origin: [10, 110] },
];
const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);

describe("solve", () => {
  it("puts every pivot at origin + pivot with no rotation in the zero pose", () => {
    const s = solve(parts, {});
    expect(s.body).toEqual({ x: 10, y: 10, rotate: 0 });
    expect(s.upper).toEqual({ x: 15, y: 15, rotate: 0 });
    expect(s.lower).toEqual({ x: 15, y: 115, rotate: 0 });
  });

  it("swings children around the parent pivot", () => {
    const s = solve(parts, { upper: 90 }); // clockwise: the hanging arm swings to the left
    expect(s.upper).toEqual({ x: 15, y: 15, rotate: 90 });
    expect(s.lower.x).toBeCloseTo(15 - 100, 6);
    expect(s.lower.y).toBeCloseTo(15, 6);
    expect(s.lower.rotate).toBe(90);
  });

  it("accumulates rotation down the chain", () => {
    const s = solve(parts, { body: 30, upper: 20, lower: 10 });
    expect(s.lower.rotate).toBe(60);
  });

  it("keeps a child's pivot at a fixed distance from its parent's pivot at any angle", () => {
    for (const a of [-170, -90, 0, 45, 135, 180]) {
      const s = solve(parts, { body: a * 0.5, upper: a });
      expect(dist(s.upper, s.lower)).toBeCloseTo(100, 6);
      expect(dist(s.body, s.upper)).toBeCloseTo(Math.hypot(5, 5), 6);
    }
  });

  it("ignores unknown parts in the pose", () => {
    expect(solve(parts, { tail: 40 })).toEqual(solve(parts, {}));
  });

  it("is pure and independent of part order", () => {
    const pose = { body: 12, upper: -40, lower: 77 };
    expect(solve(parts, pose)).toEqual(solve(parts, pose));
    expect(solve([...parts].reverse(), pose)).toEqual(solve(parts, pose));
  });

  it("rejects an unknown parent and a parent loop", () => {
    expect(() => solve([{ ...parts[1], parent: "ghost" }], {})).toThrow(/unknown parent/);
    expect(() =>
      solve(
        [
          { part: "a", file: "a", pivot: [0, 0], parent: "b" },
          { part: "b", file: "b", pivot: [0, 0], parent: "a" },
        ],
        {},
      ),
    ).toThrow(/loop/);
  });
});

describe("poses", () => {
  it("interpolates between keyed poses, holding before the first and after the last", () => {
    const keys = [
      { at: 10, pose: { upper_arm_r: 0 } },
      { at: 20, pose: { upper_arm_r: -100 } },
    ];
    expect(interpolatePose(keys, 0).upper_arm_r).toBe(0);
    expect(interpolatePose(keys, 15).upper_arm_r).toBeCloseTo(-50, 6);
    expect(interpolatePose(keys, 99).upper_arm_r).toBe(-100);
  });

  it("treats a part a key leaves out as its rest angle 0", () => {
    const keys: PoseKey[] = [
      { at: 0, pose: { head: 10 } },
      { at: 10, pose: {} },
    ];
    expect(interpolatePose(keys, 5).head).toBeCloseTo(5, 6);
  });

  it("travels from rest to a part that only the later key names", () => {
    const keys: PoseKey[] = [
      { at: 0, pose: {} },
      { at: 10, pose: { head: 10 } },
    ];
    expect(interpolatePose(keys, 5).head).toBeCloseTo(5, 6);
    expect(interpolatePose(keys, 0).head).toBeUndefined();
  });

  it("sorts unsorted keys and eases each leg with zero slope at the keys", () => {
    const keys: PoseKey[] = [
      { at: 10, pose: { head: 10 } },
      { at: 0, pose: { head: 0 } },
    ];
    expect(interpolatePose(keys, 5).head).toBeCloseTo(5, 6);
    expect(interpolatePoseEased(keys, 5).head).toBeCloseTo(5, 6);
    expect(interpolatePoseEased(keys, 1).head).toBeLessThan(interpolatePose(keys, 1).head);
    expect(interpolatePoseEased(keys, 9).head).toBeGreaterThan(interpolatePose(keys, 9).head);
  });

  it("returns an empty pose for no keys and holds a single key", () => {
    expect(interpolatePose([], 3)).toEqual({});
    expect(interpolatePoseEased([{ at: 2, pose: { head: 4 } }], 9)).toEqual({ head: 4 });
  });

  it("ships named poses", () => {
    expect(Object.keys(POSES)).toContain("rest");
    expect(Object.keys(POSES).length).toBeGreaterThan(3);
  });
});

describe("assertImages", () => {
  it("passes when every part has an image and names the parts that have none", () => {
    assertImages(parts, { body: "b", upper: "u", lower: "l" });
    expect(() => assertImages(parts, { body: "b", lower: "" })).toThrow(/parts upper, lower/);
    expect(() => assertImages(parts, { body: "b", upper: "u" })).toThrow(/part lower/);
  });
});
