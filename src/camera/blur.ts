import { cameraAt, cutFrames, DEFAULT_FPS, type CamKey } from "./path";

// shutterAngle (degrees) per px/frame of camera velocity, and its ceiling: a whip smears but
// never melts the frame into a wash.
const BLUR_GAIN = 2.2;
const BLUR_MAX_ANGLE = 120;
/** Sub-frame renders `Camera` asks `CameraMotionBlur` for. */
export const BLUR_SAMPLES = 16;
// Below one degree the smear is invisible: skip the extra sample renders on holds and glides.
export const BLUR_MIN_ANGLE = 1;

/** Motion-blur shutter angle (degrees) for a camera velocity in px/frame. */
export const shutterAngleFor = (velocity: number): number => Math.min(BLUR_MAX_ANGLE, velocity * BLUR_GAIN);

/**
 * Shutter angle (degrees) `Camera` blurs frame `frame` with; 0 means no blur at all.
 *
 * A hard cut must never be smeared across two shots. `cameraAt` already keeps the jump out of
 * the velocity; this guards the other half: `CameraMotionBlur` draws frame f from the sample
 * frames in (f + 1 - w, f + 1 - w / samples] (w = shutterAngle / 360, @remotion/motion-blur
 * 4.0.538), so when a cut falls inside that span some samples show the old shot and some the
 * new one. Such a frame is drawn sharp.
 */
export function shutterAt(
  keys: CamKey[],
  frame: number,
  samples = BLUR_SAMPLES,
  stepFps?: number,
  fps: number = DEFAULT_FPS,
): number {
  if (stepFps) return 0; // held poses are not smeared
  const angle = shutterAngleFor(cameraAt(keys, frame, fps).velocity);
  const w = angle / 360;
  const first = frame + 1 - w;
  const last = frame + 1 - w / samples;
  return cutFrames(keys).some((cut) => first < cut && cut <= last) ? 0 : angle;
}
