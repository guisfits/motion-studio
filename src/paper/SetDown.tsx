import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { carryAt, type CarryOptions } from "./carry";

export type Side = "top" | "bottom" | "left" | "right";

const DIR: Record<Side, [number, number]> = {
  top: [0, -1],
  bottom: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

export type SetDownProps = Partial<Omit<CarryOptions, "delay">> & {
  /** Seconds into the current sequence before the sheet starts moving. */
  delay: number;
  /** Frame side the sheet is carried in from; it starts fully outside the frame. */
  from?: Side;
  /** Final rotation in degrees. */
  rotate?: number;
  /** Extra off-frame margin in px so a large or rotated sheet clears the edge. */
  margin?: number;
  /** Resting-shadow strength 0..1 (0 = no shadow). */
  shadow?: number;
  /** Absolute placement of the sheet's resting position. */
  style?: React.CSSProperties;
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
  shadow = 1,
  dur,
  over,
  stepFps,
  style,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const { remaining, lift } = carryAt(frame, fps, { delay, dur, over, stepFps });
  const [dx, dy] = DIR[from];
  const travel = (dx !== 0 ? width : height) + margin;
  const tilt = Math.max(0, remaining) * 5 * (dx !== 0 ? dx : 1);
  const rest = 4 * shadow;
  return (
    <div
      style={{
        position: "absolute",
        transform: `translate(${dx * remaining * travel}px, ${dy * remaining * travel}px) rotate(${rotate + tilt}deg)`,
        filter:
          shadow > 0
            ? `drop-shadow(${rest + 14 * lift}px ${rest + 18 * lift}px ${3 + 10 * lift}px rgba(20,12,6,${0.36 * shadow}))`
            : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
