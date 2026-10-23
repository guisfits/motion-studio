import type { Caption } from "@remotion/captions";
import type { CSSProperties, ReactNode } from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export type RevealWordsProps = {
  captions: Caption[];
  size: number;
  /** Frames a word takes to travel in; it lands on the frame its word is spoken. */
  enter?: number;
  /** Replace a word's plain text (to wrap it in Highlight, Strike, ...). */
  renderWord?: (caption: Caption, index: number) => ReactNode | undefined;
  style?: CSSProperties;
};

const outCubic = Easing.out(Easing.cubic);

/** Voice-timed line: every word travels up from below and lands on its spoken onset. */
export const RevealWords: React.FC<RevealWordsProps> = ({ captions, size, enter = 6, renderWord, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", columnGap: size * 0.3, rowGap: size * 0.25, ...style }}>
      {captions.map((c, i) => {
        const land = Math.round((c.startMs / 1000) * fps);
        const p = interpolate(frame, [land - enter, land], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: outCubic,
        });
        return (
          <span
            key={`${i}-${c.startMs}`}
            style={{
              display: "inline-block",
              visibility: frame < land - enter ? "hidden" : "visible",
              transform: `translateY(${(1 - p) * size * 1.2}px)`,
              opacity: Math.min(1, p * 2),
            }}
          >
            {renderWord?.(c, i) ?? c.text.trim()}
          </span>
        );
      })}
    </div>
  );
};
