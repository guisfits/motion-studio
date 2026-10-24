import type { ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { BLUR_MIN_ANGLE, BLUR_SAMPLES, shutterAt } from "./blur";
import { DEFAULT_DRIFT, viewAt, type CamKey } from "./path";

export type CameraProps = {
  keys: CamKey[];
  /** Smear fast moves with @remotion/motion-blur, scaled by camera velocity. Costs `samples` renders. */
  blur?: boolean;
  /** Slow zoom breathing across the whole composition, as a fraction (baseline: 0.02-0.03). 0 = off. */
  drift?: number;
  /** Move in held steps of this many poses per second (e.g. 12), like paper nudged by hand. Off when unset; no motion blur while on. */
  stepFps?: number;
  children: ReactNode;
};

// The world reads the frame itself: CameraMotionBlur re-renders its children at sub-frame
// offsets, so a transform computed outside it would be the same in every sample (no smear).
const World: React.FC<Omit<CameraProps, "blur">> = ({ keys, drift = DEFAULT_DRIFT, stepFps, children }) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames, fps } = useVideoConfig();
  const cam = viewAt(keys, frame, { durationInFrames, drift, stepFps, fps });
  return (
    <AbsoluteFill
      style={{
        transformOrigin: "0 0",
        transform: `translate(${width / 2}px, ${height / 2}px) rotate(${cam.rotate}deg) scale(${cam.zoom}) translate(${-cam.x}px, ${-cam.y}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/**
 * Children live in world coordinates (px on the table); the frame shows 1920x1080 of it at zoom 1,
 * centred on the camera's (x, y). Smooth unless `stepFps` is given; never shaken.
 */
export const Camera: React.FC<CameraProps> = ({ keys, blur = false, drift = DEFAULT_DRIFT, stepFps, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const world = (
    <World keys={keys} drift={drift} stepFps={stepFps}>
      {children}
    </World>
  );
  const shutterAngle = shutterAt(keys, frame, BLUR_SAMPLES, stepFps, fps);
  if (!blur || shutterAngle < BLUR_MIN_ANGLE) return <AbsoluteFill style={{ overflow: "hidden" }}>{world}</AbsoluteFill>;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <CameraMotionBlur shutterAngle={shutterAngle} samples={BLUR_SAMPLES}>
        {world}
      </CameraMotionBlur>
    </AbsoluteFill>
  );
};
