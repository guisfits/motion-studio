import { stepFrame } from "../paper/step";
import { DEFAULT_EASE, easeProgress, type CamEase } from "./presets";

/**
 * A camera key in world pixels; `ease` shapes the leg that starts at this key. Keys are expected
 * in ascending `frame` order; `cameraAt` sorts a copy defensively, so unsorted input is safe.
 */
export type CamKey = { frame: number; x: number; y: number; zoom: number; rotate?: number; ease?: CamEase };

export type CamPose = { x: number; y: number; zoom: number; rotate: number };
export type CamState = CamPose & { velocity: number };

/** The rate camera keys are timed at when a caller gives none (the studio's demos). */
export const DEFAULT_FPS = 30;
// Screen-space weights for zoom and roll, from the engine's whoosh heuristic (archive/engine-v1/core/lib/table.js).
const ZOOM_PX = 900;
const ROLL_PX = 14;

const keyPose = (k: CamKey): CamPose => ({ x: k.x, y: k.y, zoom: k.zoom, rotate: k.rotate ?? 0 });

/** Pose at `frame`: pure, clamped outside the keys, exact on them. */
function poseAt(keys: CamKey[], frame: number, fps: number): CamPose {
  if (keys.length === 0) return { x: 0, y: 0, zoom: 1, rotate: 0 };
  if (frame <= keys[0].frame) return keyPose(keys[0]);
  const last = keys[keys.length - 1];
  if (frame >= last.frame) return keyPose(last);

  let i = 0;
  while (keys[i + 1].frame <= frame) i++;
  const a = keys[i];
  const b = keys[i + 1];
  const p = easeProgress(a.ease ?? DEFAULT_EASE, frame - a.frame, b.frame - a.frame, fps);
  const pa = keyPose(a);
  const pb = keyPose(b);
  return {
    x: pa.x + (pb.x - pa.x) * p,
    y: pa.y + (pb.y - pa.y) * p,
    zoom: pa.zoom + (pb.zoom - pa.zoom) * p,
    rotate: pa.rotate + (pb.rotate - pa.rotate) * p,
  };
}

/** Frames where the camera hard-cuts: two keys on one frame (the old pose, then the new one). */
export function cutFrames(keys: CamKey[]): number[] {
  const frames = keys.map((k) => k.frame).sort((a, b) => a - b);
  return [...new Set(frames.filter((f, i) => i > 0 && f === frames[i - 1]))];
}

// Just short of a cut: the pose a shot ends on, since `poseAt` at the cut frame itself is the next shot's.
const CUT_EPSILON = 1e-6;

/**
 * Camera state at `frame`. `velocity` is screen-space px per frame (travel, plus weighted zoom
 * and roll), measured over the half frame either side; 0 on a hold and at the clamped ends.
 * A hard cut (two keys on one frame) is a jump, not a speed: the measurement never reaches
 * across one, so the cut frame reports the new shot's own speed and the last frames of a shot
 * never see the next cut coming.
 */
export function cameraAt(keys: CamKey[], frame: number, fps: number = DEFAULT_FPS): CamState {
  keys = [...keys].sort((a, b) => a.frame - b.frame);
  const pose = poseAt(keys, frame, fps);

  let shotStart = -Infinity;
  let shotEnd = Infinity;
  for (const cut of cutFrames(keys)) {
    if (cut <= frame) shotStart = Math.max(shotStart, cut);
    else shotEnd = Math.min(shotEnd, cut);
  }
  const from = Math.max(frame - 0.5, shotStart);
  const to = Math.min(frame + 0.5, shotEnd - CUT_EPSILON);
  const span = to - from;
  if (!(span > 0)) return { ...pose, velocity: 0 };
  const before = poseAt(keys, from, fps);
  const after = poseAt(keys, to, fps);

  const travel = (Math.hypot(after.x - before.x, after.y - before.y) * pose.zoom) / span;
  const velocity =
    travel +
    (Math.abs(after.zoom - before.zoom) * ZOOM_PX + Math.abs(after.rotate - before.rotate) * ROLL_PX) / span;
  return { ...pose, velocity };
}

/**
 * The frame the camera is read at when it moves in held steps (`stepFps` poses per second, off
 * when unset). A hard cut is never held across: from the cut frame on, the new shot shows at once.
 */
export function steppedCamFrame(keys: CamKey[], frame: number, stepFps?: number, fps: number = DEFAULT_FPS): number {
  if (!stepFps) return frame;
  const held = stepFrame(frame, fps, stepFps);
  const cut = cutFrames(keys).filter((c) => c <= frame);
  return cut.length ? Math.max(held, ...cut) : held;
}

/** Slow zoom breathing across the whole composition, as a fraction of the zoom (baseline 0.02-0.03). */
export const DEFAULT_DRIFT = 0.02;

/**
 * The pose the `Camera` actually draws at `frame`: `cameraAt`'s pose with the drift folded into
 * the zoom. `Camera` and a film's `traceAt` both read this one function, so the trace can never
 * describe a different camera than the one on screen.
 */
export function viewAt(
  keys: CamKey[],
  frame: number,
  {
    durationInFrames,
    drift = DEFAULT_DRIFT,
    stepFps,
    fps = DEFAULT_FPS,
  }: { durationInFrames: number; drift?: number; stepFps?: number; fps?: number },
): CamPose {
  const f = steppedCamFrame(keys, frame, stepFps, fps);
  const { x, y, zoom, rotate } = cameraAt(keys, f, fps);
  return { x, y, zoom: zoom * (1 + drift * (f / Math.max(1, durationInFrames))), rotate };
}
