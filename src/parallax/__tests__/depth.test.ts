import { describe, expect, it } from "vitest";
import { layerOffset, blurFor } from "../depth";

const cam = { x: 800, y: 300, zoom: 1.5 };

describe("layerOffset", () => {
  it("depth 0 tracks the camera 1:1", () => {
    expect(layerOffset(0, cam)).toEqual({ x: 800, y: 300, scale: 1.5 });
  });

  it("larger depth moves less than the camera, monotonically", () => {
    const a = layerOffset(0.3, cam);
    const b = layerOffset(1, cam);
    expect(Math.abs(a.x)).toBeLessThan(800);
    expect(Math.abs(b.x)).toBeLessThan(Math.abs(a.x));
    expect(b.scale).toBeLessThan(a.scale);
    expect(b.scale).toBeGreaterThan(1);
  });

  it("negative depth moves more than the camera", () => {
    const f = layerOffset(-0.5, cam);
    expect(f.x).toBeGreaterThan(800);
    expect(f.y).toBeGreaterThan(300);
    expect(f.scale).toBeGreaterThan(1.5);
  });

  it("a plane far enough back freezes on the origin pose instead of moving against the camera", () => {
    const frozen = layerOffset(5, cam);
    expect(frozen).toEqual({ x: 0, y: 0, scale: 1 });
  });

  it("is measured from the origin pose, so every plane agrees at the start", () => {
    const origin = { x: 960, y: 540, zoom: 1 };
    for (const d of [-1, 0, 0.5, 1]) {
      expect(layerOffset(d, origin, origin)).toEqual({ x: 960, y: 540, scale: 1 });
    }
  });

  it("is deterministic and finite at huge frame-like inputs", () => {
    const far = { x: 1e6, y: -1e6, zoom: 3 };
    expect(layerOffset(0.7, far)).toEqual(layerOffset(0.7, far));
    expect(Number.isFinite(layerOffset(0.7, far).x)).toBe(true);
  });
});

describe("blurFor", () => {
  it("is zero at the focus plane and grows with distance either side", () => {
    expect(blurFor(0.5, 0.5, 8)).toBe(0);
    expect(blurFor(1, 0.5, 8)).toBeCloseTo(4);
    expect(blurFor(-0.5, 0.5, 8)).toBeCloseTo(8);
  });
});
