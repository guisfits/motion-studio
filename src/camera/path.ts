import { DEFAULT_EASE, easeProgress, type CamEase } from "./presets";

/** A camera key in world pixels; `ease` shapes the leg that starts at this key. */
export type CamKey = { frame: number; x: number; y: number; zoom: number; rotate?: number; ease?: CamEase };

export type CamPose = { x: number; y: number; zoom: number; rotate: number };
export type CamState = CamPose & { velocity: number };

const FPS = 30;
// Screen-space weights for zoom and roll, from the engine's whoosh heuristic (core/lib/table.js).
const ZOOM_PX = 900;
const ROLL_PX = 14;

const keyPose = (k: CamKey): CamPose => ({ x: k.x, y: k.y, zoom: k.zoom, rotate: k.rotate ?? 0 });

/** Pose at `frame`: pure, clamped outside the keys, exact on them. */
function poseAt(keys: CamKey[], frame: number): CamPose {
  if (keys.length === 0) return { x: 0, y: 0, zoom: 1, rotate: 0 };
  if (frame <= keys[0].frame) return keyPose(keys[0]);
  const last = keys[keys.length - 1];
  if (frame >= last.frame) return keyPose(last);

  let i = 0;
  while (keys[i + 1].frame <= frame) i++;
  const a = keys[i];
  const b = keys[i + 1];
  const p = easeProgress(a.ease ?? DEFAULT_EASE, frame - a.frame, b.frame - a.frame, FPS);
  const pa = keyPose(a);
  const pb = keyPose(b);
  return {
    x: pa.x + (pb.x - pa.x) * p,
    y: pa.y + (pb.y - pa.y) * p,
    zoom: pa.zoom + (pb.zoom - pa.zoom) * p,
    rotate: pa.rotate + (pb.rotate - pa.rotate) * p,
  };
}

/**
 * Camera state at `frame`. `velocity` is screen-space px per frame (travel, plus weighted zoom
 * and roll), taken from the pose one frame either side; 0 on a hold and at the clamped ends.
 */
export function cameraAt(keys: CamKey[], frame: number): CamState {
  const pose = poseAt(keys, frame);
  const before = poseAt(keys, frame - 0.5);
  const after = poseAt(keys, frame + 0.5);
  const travel = Math.hypot(after.x - before.x, after.y - before.y) * pose.zoom;
  const velocity =
    travel + Math.abs(after.zoom - before.zoom) * ZOOM_PX + Math.abs(after.rotate - before.rotate) * ROLL_PX;
  return { ...pose, velocity };
}
