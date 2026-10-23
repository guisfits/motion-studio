import { type CSSProperties, type ReactNode, useId } from "react";
import { random } from "remotion";
import { type Landing, useDraw } from "./timing";

export type StrokeProps = Landing & {
  children: ReactNode;
  color?: string;
  dur?: number;
  seed?: string;
  /** Vertical position of the line inside the word box, 0 top .. 1 bottom. */
  y: number;
  /** Hand-drawn passes over the word. */
  passes?: number;
  strokeWidth?: string;
  style?: CSSProperties;
};

/** Shared engine of Strike and Underline: seeded jittery passes drawn left to right in sequence. */
export const Stroke: React.FC<StrokeProps> = ({
  children,
  color = "#b3261e",
  dur = 12,
  seed = "stroke",
  y,
  passes = 3,
  strokeWidth = "0.07em",
  style,
  ...landing
}) => {
  const p = useDraw(landing, dur);
  const clipBase = `stroke-${useId().replace(/:/g, "")}`;
  const W = 100;
  const H = 40;
  return (
    <span style={{ position: "relative", display: "inline-block", ...style }}>
      <span style={{ position: "relative", zIndex: 0 }}>{children}</span>
      <svg
        aria-hidden
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          left: "-4%",
          width: "108%",
          top: `${y * 100}%`,
          height: "0.5em",
          transform: "translateY(-50%)",
          overflow: "visible",
          zIndex: 1,
        }}
      >
        {Array.from({ length: passes }, (_, i) => {
          const j = (k: string) => (random(`${seed}-${i}-${k}`) - 0.5) * 8;
          const yy = H / 2 + (i - (passes - 1) / 2) * 11;
          const d = `M 0 ${yy + j("a")} Q ${W * 0.35} ${yy + j("b")} ${W * 0.65} ${yy + j("c")} T ${W} ${yy + j("d")}`;
          const slice = 1 / passes;
          // Passes overlap in time: each starts 70% of a slice after the previous one.
          const local = Math.min(Math.max((p - i * slice * 0.7) / (slice + 0.3), 0), 1);
          // Revealed by a growing clip, not a dash offset: with non-scaling-stroke Chromium measures
          // dashes in screen px and ignores pathLength, so a dash write-on repeats in pieces.
          const clipId = `${clipBase}-${i}`;
          return (
            <g key={i}>
              <clipPath id={clipId}>
                <rect x={-W} y={-H} width={W + local * W * 1.1} height={H * 3} />
              </clipPath>
              <path
                d={d}
                clipPath={`url(#${clipId})`}
                opacity={local > 0 ? 1 : 0}
                fill="none"
                stroke={color}
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                style={{ strokeWidth }}
              />
            </g>
          );
        })}
      </svg>
    </span>
  );
};
