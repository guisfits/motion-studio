import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { CarryOptions } from "./carry";
import { setDownPose, type Side } from "./set-down-pose";

export type { Side } from "./set-down-pose";

export type SetDownProps = Partial<Omit<CarryOptions, "delay">> & {
  /** Seconds into the current sequence before the sheet starts moving. */
  delay: number;
  /** Frame side the sheet is carried in from; it starts fully outside the frame. */
  from?: Side;
  /** Final rotation in degrees. */
  rotate?: number;
  /** The sheet's [width, height] in px: travel then always clears the frame, wherever it rests. */
  size?: [number, number];
  /** Extra off-frame margin in px so a large or rotated sheet clears the edge. */
  margin?: number;
  /** Resting-shadow strength 0..1 (0 = no shadow). */
  shadow?: number;
  /** Absolute placement of the sheet's resting position. */
  style?: Omit<React.CSSProperties, "transform" | "filter">;
  children: React.ReactNode;
};

/**
 * A sheet carried in from outside the frame and set down on the desk (baseline `carryIn`):
 * cubic ease-out travel in `dur` s, a damped overshoot `over*exp(-14s)*sin(24s)`, the shadow
 * lifting while it flies and flattening as it lands. Motion steps on the `stepFps` clock
 * (12 poses/s) while the rest of the frame stays smooth.
 */
export const SetDown: React.FC<SetDownProps> = ({
  delay,
  from = "top",
  rotate = 0,
  margin = 0,
  size,
  shadow = 1,
  dur,
  over,
  stepFps,
  style,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const pose = setDownPose(frame, fps, width, height, { delay, from, rotate, margin, size, dur, over, stepFps });
  const { lift } = pose;
  const rest = 4 * shadow;
  return (
    <div
      style={{
        position: "absolute",
        ...style,
        transform: `translate(${pose.dx}px, ${pose.dy}px) rotate(${pose.rotate}deg)`,
        filter:
          shadow > 0
            ? `drop-shadow(${rest + 14 * lift}px ${rest + 18 * lift}px ${3 + 10 * lift}px rgba(20,12,6,${0.36 * shadow}))`
            : undefined,
      }}
    >
      {children}
    </div>
  );
};
