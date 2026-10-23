import type { CSSProperties, ReactNode } from "react";
import { random } from "remotion";
import { type Landing, useDraw } from "./timing";

export type HighlightProps = Landing & {
  children: ReactNode;
  color?: string;
  /** Sweep length in frames (narrated emphasis 9-18). */
  dur?: number;
  seed?: string;
  style?: CSSProperties;
};

/** Marker sweep behind one word: left to right, a touch low, a seeded hand tilt. */
export const Highlight: React.FC<HighlightProps> = ({
  children,
  color = "rgba(255, 214, 10, 0.6)",
  dur = 12,
  seed = "highlight",
  style,
  ...landing
}) => {
  const p = useDraw(landing, dur);
  const tilt = (random(`${seed}-tilt`) - 0.5) * 2.4;
  const reach = 1 + random(`${seed}-reach`) * 0.04;
  return (
    <span style={{ position: "relative", display: "inline-block", padding: "0 0.16em", lineHeight: 1.15, ...style }}>
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: "0.02em",
          height: "0.6em",
          background: color,
          borderRadius: "0.08em",
          transformOrigin: "0% 50%",
          transform: `rotate(${tilt}deg) scaleX(${p * reach})`,
          zIndex: 0,
        }}
      />
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
    </span>
  );
};
