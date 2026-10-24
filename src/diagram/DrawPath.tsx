import React from "react";
import { evolvePath } from "@remotion/paths";

export type DrawPathProps = {
  /** SVG path data. */
  d: string;
  /** 0..1: how much of the path is drawn. */
  progress: number;
  stroke?: string;
  width?: number;
  /** Round, butt or square end caps. */
  linecap?: "round" | "butt" | "square";
  /** Size of the SVG box; the path is in these coordinates. */
  size: [number, number];
  style?: React.CSSProperties;
};

/**
 * A line that writes itself on: `evolvePath` turns progress into a real-length dash, so the
 * stroke keeps its width under any scale (no non-scaling-stroke, which would break the dash).
 * An empty path draws nothing.
 */
export const DrawPath: React.FC<DrawPathProps> = ({
  d,
  progress,
  stroke = "#3a2a1c",
  width = 5,
  linecap = "round",
  size,
  style,
}) => {
  const p = Math.min(1, Math.max(0, progress));
  if (!d.trim()) return null;
  const evolved = evolvePath(p, d);
  return (
    <svg
      width={size[0]}
      height={size[1]}
      viewBox={`0 0 ${size[0]} ${size[1]}`}
      style={{ position: "absolute", left: 0, top: 0, overflow: "visible", ...style }}
    >
      {p > 0 ? (
        <path
          d={d}
          fill="none"
          stroke={stroke}
          strokeWidth={width}
          strokeLinecap={linecap}
          strokeLinejoin="round"
          strokeDasharray={evolved.strokeDasharray}
          strokeDashoffset={evolved.strokeDashoffset}
        />
      ) : null}
    </svg>
  );
};
