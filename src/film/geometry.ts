import type { Box, TraceCamera } from "./types";
import type { CamPose } from "../camera/path";

const rad = (deg: number) => (deg * Math.PI) / 180;

/** The axis-aligned box that holds `box` rotated by `deg` degrees about its own centre (CSS `rotate`). */
export function rotatedBox([x, y, w, h]: Box, deg: number): Box {
  if (deg === 0) return [x, y, w, h];
  const [c, s] = [Math.cos(rad(deg)), Math.sin(rad(deg))];
  const bw = Math.abs(w * c) + Math.abs(h * s);
  const bh = Math.abs(w * s) + Math.abs(h * c);
  return [x + w / 2 - bw / 2, y + h / 2 - bh / 2, bw, bh];
}

export const shiftBox = ([x, y, w, h]: Box, dx: number, dy: number): Box => [x + dx, y + dy, w, h];

/**
 * A world-space box as the viewer sees it through the camera: the box of the `Camera` transform
 * `translate(W/2, H/2) rotate(r) scale(z) translate(-x, -y)` applied to its corners.
 */
export function projectBox(box: Box, view: CamPose, W: number, H: number): Box {
  const [x, y, w, h] = box;
  const [c, s] = [Math.cos(rad(view.rotate)), Math.sin(rad(view.rotate))];
  const pts = [
    [x, y],
    [x + w, y],
    [x, y + h],
    [x + w, y + h],
  ].map(([px, py]) => {
    const [dx, dy] = [(px - view.x) * view.zoom, (py - view.y) * view.zoom];
    return [W / 2 + dx * c - dy * s, H / 2 + dx * s + dy * c];
  });
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const [x0, y0] = [Math.min(...xs), Math.min(...ys)];
  return [x0, y0, Math.max(...xs) - x0, Math.max(...ys) - y0];
}

/** The `camera` field of a trace frame for a camera pose. `shot` counts the hard cuts so far. */
export const cameraTrace = (view: CamPose, shot?: number | string): TraceCamera => ({
  scale: view.zoom,
  x: view.x,
  y: view.y,
  ...(shot === undefined ? {} : { shot }),
});

/** The shot number at `frame`: how many hard cuts (frames where the picture changes) are at or before it. */
export const shotAt = (cutFrames: number[], frame: number): number => cutFrames.filter((f) => f <= frame).length;
