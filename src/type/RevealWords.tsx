import type { Caption } from "@remotion/captions";
import type { CSSProperties, ReactNode } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { revealWord } from "./reveal";

export type RevealWordsProps = {
  captions: Caption[];
  size: number;
  /** Frames a word takes to travel in; it lands on the frame its word is spoken. */
  enter?: number;
  /** Replace a word's plain text (to wrap it in Highlight, Strike, ...). */
  renderWord?: (caption: Caption, index: number) => ReactNode | undefined;
  style?: CSSProperties;
};

/** Voice-timed line: every word travels up from below and lands on its spoken onset. */
export const RevealWords: React.FC<RevealWordsProps> = ({ captions, size, enter = 6, renderWord, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", columnGap: size * 0.3, rowGap: size * 0.25, ...style }}>
      {captions.map((c, i) => {
        const r = revealWord(frame, c.startMs, fps, enter);
        return (
          <span
            key={`${i}-${c.startMs}`}
            style={{
              display: "inline-block",
              visibility: r.visible ? "visible" : "hidden",
              transform: `translateY(${(1 - r.progress) * size * 1.2}px)`,
              opacity: r.opacity,
            }}
          >
            {renderWord?.(c, i) ?? c.text.trim()}
          </span>
        );
      })}
    </div>
  );
};
