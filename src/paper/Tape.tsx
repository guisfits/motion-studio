import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { carryAt } from "./carry";

// Zig-zag ends: a torn strip, not a clean rectangle.
const STRIP_CLIP =
  "polygon(0% 12%,3% 0%,6% 14%,9% 2%,12% 10%,88% 10%,91% 0%,94% 14%,97% 2%,100% 12%,100% 88%,97% 100%,94% 86%,91% 98%,88% 90%,12% 90%,9% 100%,6% 86%,3% 98%,0% 88%)";

export type TapeProps = {
  /** Seconds before the strip starts moving: leave it 3-5 frames after the piece lands. */
  delay: number;
  /** Rotation in degrees (20-45 reads as masking tape). */
  rotate?: number;
  width?: number;
  height?: number;
  color?: string;
  /** Absolute placement of the strip's resting position. */
  style?: React.CSSProperties;
};

/**
 * A translucent tape strip. It enters by motion (dropped in from above, short travel, no
 * overshoot) and never appears in place; it starts fully above the frame.
 */
export const Tape: React.FC<TapeProps> = ({
  delay,
  rotate = -32,
  width = 220,
  height = 64,
  color = "#e8dcae",
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { remaining, lift } = carryAt(frame, fps, { delay, dur: 0.25, over: 0 });
  const top = typeof style?.top === "number" ? style.top : 0;
  // far enough above the frame that even a rotated strip starts fully outside it
  const travel = top + width;
  return (
    <div
      style={{
        position: "absolute",
        width,
        height,
        transform: `translateY(${-remaining * travel}px) rotate(${rotate}deg)`,
        filter: `drop-shadow(${1 + 6 * lift}px ${2 + 8 * lift}px ${2 + 5 * lift}px rgba(20,12,6,0.3))`,
        ...style,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          background: color,
          opacity: 0.75,
          clipPath: STRIP_CLIP,
        }}
      />
    </div>
  );
};
