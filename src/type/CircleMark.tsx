import type { CSSProperties, ReactNode } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { circleMarkPath } from "./circle-path";
import { type Landing, drawProgress, landingS } from "./timing";

export type CircleMarkProps = Landing & {
  children?: ReactNode;
  color?: string;
  /** Frames the pen takes round (narrated emphasis 9-24). */
  dur?: number;
  lead?: number;
  seed?: string;
  strokeWidth?: string;
  /** Margin of the ellipse past the box, as a fraction of the box size. */
  pad?: number;
  style?: CSSProperties;
};

/**
 * Hand-drawn ellipse round its children (a word) or, with no children, round a box you size with
 * `style`: it writes on over `dur` frames, one slightly irregular lap.
 */
export const CircleMark: React.FC<CircleMarkProps> = ({
  children,
  color = "#b3261e",
  dur = 18,
  lead = 3,
  seed = "circle",
  strokeWidth = "0.06em",
  pad = 0.18,
  style,
  ...landing
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = drawProgress(frame, fps, landingS(landing), dur, lead, false);
  const d = circleMarkPath(seed, p);
  return (
    <span style={{ position: "relative", display: "inline-block", ...style }}>
      {children}
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          left: `${-pad * 100}%`,
          top: `${-pad * 100}%`,
          width: `${(1 + 2 * pad) * 100}%`,
          height: `${(1 + 2 * pad) * 100}%`,
          overflow: "visible",
          pointerEvents: "none",
        }}
      >
        {d && (
          <path d={d} fill="none" stroke={color} vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" style={{ strokeWidth }} />
        )}
      </svg>
    </span>
  );
};
