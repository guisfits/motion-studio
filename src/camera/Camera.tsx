import type { ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { cameraAt, type CamKey } from "./path";

export type CameraProps = {
  keys: CamKey[];
  /** Smear fast moves with @remotion/motion-blur, scaled by camera velocity. Costs `samples` renders. */
  blur?: boolean;
  /** Slow zoom breathing across the whole composition, as a fraction (baseline: 0.02-0.03). 0 = off. */
  drift?: number;
  children: ReactNode;
};

// shutterAngle (degrees) per px/frame of camera velocity, and its ceiling: a whip smears but
// never melts the frame into a wash.
const BLUR_GAIN = 2.2;
const BLUR_MAX_ANGLE = 120;
const BLUR_SAMPLES = 16;

// The world reads the frame itself: CameraMotionBlur re-renders its children at sub-frame
// offsets, so a transform computed outside it would be the same in every sample (no smear).
const World: React.FC<Omit<CameraProps, "blur">> = ({ keys, drift = 0.02, children }) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const cam = cameraAt(keys, frame);
  const zoom = cam.zoom * (1 + drift * (frame / Math.max(1, durationInFrames)));
  return (
    <AbsoluteFill
      style={{
        transformOrigin: "0 0",
        transform: `translate(${width / 2}px, ${height / 2}px) rotate(${cam.rotate}deg) scale(${zoom}) translate(${-cam.x}px, ${-cam.y}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/**
 * Children live in world coordinates (px on the table); the frame shows 1920x1080 of it at zoom 1,
 * centred on the camera's (x, y). Never stepped, never shaken.
 */
export const Camera: React.FC<CameraProps> = ({ keys, blur = false, drift = 0.02, children }) => {
  const frame = useCurrentFrame();
  const world = (
    <World keys={keys} drift={drift}>
      {children}
    </World>
  );
  const shutterAngle = Math.min(BLUR_MAX_ANGLE, cam(keys, frame) * BLUR_GAIN);
  // Below one degree the smear is invisible: skip the extra sample renders on holds and glides.
  if (!blur || shutterAngle < 1) return <AbsoluteFill style={{ overflow: "hidden" }}>{world}</AbsoluteFill>;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <CameraMotionBlur shutterAngle={shutterAngle} samples={BLUR_SAMPLES}>
        {world}
      </CameraMotionBlur>
    </AbsoluteFill>
  );
};

const cam = (keys: CamKey[], frame: number) => cameraAt(keys, frame).velocity;
