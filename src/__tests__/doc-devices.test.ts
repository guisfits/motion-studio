import { describe, expect, it } from "vitest";
import { cameraAt } from "../camera";
import { docZoomKeys, docZoomPose, pageBox, type DocZoomGeometry } from "../devices";
import { heroWordPose } from "../devices";
import { steppedProgress, tornWipe, tornWipePose } from "../transitions";
import { turnAt } from "../three";
import { leafAngle } from "../three";

const g: DocZoomGeometry = { x: 100, y: 50, size: [800, 1200], rect: { x: 0.2, y: 0.4, w: 0.5, h: 0.1 }, fill: 0.8 };
const t = { pushFrom: 30, pushTo: 90 };

describe("docZoomKeys", () => {
  it("holds the whole page wide (<= 70% of the frame) until the push starts", () => {
    const pose = cameraAt(docZoomKeys(g, t), 10);
    expect(pose).toMatchObject({ x: 100, y: 50 });
    expect(800 * pose.zoom).toBeLessThanOrEqual(1920 * 0.7 + 1e-6);
    expect(1200 * pose.zoom).toBeLessThanOrEqual(1080 * 0.8 + 1e-6);
  });

  it("ends centred on the quote, which fills `fill` of the frame width", () => {
    const end = cameraAt(docZoomKeys(g, t), 120);
    expect(end.x).toBeCloseTo(100 + (0.2 + 0.25 - 0.5) * 800);
    expect(end.y).toBeCloseTo(50 + (0.4 + 0.05 - 0.5) * 1200);
    expect(end.zoom * 0.5 * 800).toBeCloseTo(0.8 * 1920);
  });

  it("zooms monotonically during the push", () => {
    let last = 0;
    for (let f = 30; f <= 90; f += 5) {
      const z = docZoomPose(g, t, f, 150).zoom;
      expect(z).toBeGreaterThanOrEqual(last);
      last = z;
    }
  });

  it("maps page fractions to world px", () => {
    expect(pageBox(g, { x: 0, y: 0, w: 1, h: 0.5 })).toEqual({ left: -300, top: -550, width: 800, height: 600 });
  });
});

describe("heroWordPose", () => {
  it("is absent before the key word and fully there after", () => {
    expect(heroWordPose(-0.1, "stamp").opacity).toBe(0);
    const s = heroWordPose(1, "stamp");
    expect(s.opacity).toBe(1);
    expect(s.scaleX).toBeCloseTo(1, 3);
  });

  it("stamp falls from a larger scale", () => {
    expect(heroWordPose(0.01, "stamp").scaleX).toBeGreaterThan(1.3);
    expect(heroWordPose(0.12, "stamp").scaleX).toBeCloseTo(1, 1);
  });

  it("slide starts off its edge, never overshoots, lands at rest", () => {
    expect(heroWordPose(0, "slide").slide).toBeCloseTo(1);
    // spring: zero velocity at release, so it barely moves in the first frame
    expect(heroWordPose(0.02, "slide").slide).toBeGreaterThan(0.97);
    let last = 1;
    for (let s = 0; s < 1.5; s += 0.05) {
      const v = heroWordPose(s, "slide").slide;
      expect(v).toBeLessThanOrEqual(last + 1e-9);
      expect(v).toBeGreaterThanOrEqual(0);
      last = v;
    }
    expect(heroWordPose(2, "slide").slide).toBeLessThan(0.001);
  });
});

describe("stepped tear", () => {
  it("is unchanged without stepFps", () => {
    expect(steppedProgress(0.37, 22, 30)).toBe(0.37);
  });

  it("holds poses on the 12 fps clock (30 fps: 3,2,3,2 frames) and keeps the ends exact", () => {
    const p = (f: number) => steppedProgress(f / 20, 20, 30, 12);
    expect(p(0)).toBe(0);
    expect(p(20)).toBe(1);
    expect(p(3)).toBe(p(4));
    expect(p(5)).not.toBe(p(4));
    const poses = new Set(Array.from({ length: 19 }, (_, i) => p(i + 1)));
    expect(poses.size).toBeLessThan(10);
  });

  it("starts whole and ends gone on a transition that is not on a pose edge", () => {
    for (const dur of [21, 22, 23]) {
      expect(steppedProgress(0, dur, 30, 12)).toBe(0);
      expect(steppedProgress(1, dur, 30, 12)).toBe(1);
    }
  });

  it("is carried by the presentation's props", () => {
    expect(tornWipe({ stepFps: 12 }).props.stepFps).toBe(12);
    expect(tornWipe().props.stepFps).toBeUndefined();
  });

  it("never runs ahead of the smooth progress", () => {
    for (let f = 1; f < 20; f++) expect(steppedProgress(f / 20, 20, 30, 12)).toBeLessThanOrEqual(f / 20 + 1e-9);
    expect(tornWipePose(steppedProgress(0.5, 20, 30, 12), "left", 1920, 1080).bite).toBeGreaterThan(0);
  });
});

describe("stepped page turn", () => {
  const turn = (f: number) => f / 200;
  it("a plain number or no stepFps is unchanged", () => {
    expect(turnAt(0.4, 13, 30, 8)).toBe(0.4);
    expect(turnAt(turn, 13, 30)).toBe(turn(13));
  });

  it("holds the leaf for a whole pose at 8 fps (30 fps: poses start at 0,4,8,11...) then jumps", () => {
    expect(turnAt(turn, 4, 30, 8)).toBe(turnAt(turn, 6, 30, 8));
    expect(turnAt(turn, 7, 30, 8)).toBe(turnAt(turn, 4, 30, 8));
    expect(turnAt(turn, 8, 30, 8)).toBeGreaterThan(turnAt(turn, 7, 30, 8));
    expect(turnAt(turn, 59, 30, 8)).toBeLessThanOrEqual(turn(59));
  });

  it("the held pose is a real leaf angle that differs between poses", () => {
    const a = leafAngle(3, 1, turnAt(turn, 20, 30, 8));
    const b = leafAngle(3, 1, turnAt(turn, 27, 30, 8));
    expect(b).toBeGreaterThan(a);
  });
});
