import type { CSSProperties } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_MONO } from "./fonts";
import { type Landing, landingS } from "./timing";
import { caretVisible, typedCount, typedText } from "./typed";
import { splitTiles } from "./tiles";

export type TypewriterProps = Landing & {
  text: string;
  /** Characters per second. */
  cps?: number;
  /** Poses per second; `0` types on every frame. */
  stepFps?: number;
  caret?: boolean;
  style?: CSSProperties;
};

/**
 * Per-character reveal at a set cadence; the first character strikes on the landing. The unstruck
 * rest is laid out but invisible, so the line never reflows while it types.
 */
export const Typewriter: React.FC<TypewriterProps> = ({ text, cps = 12, stepFps = 0, caret = true, style, ...landing }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const spec = { text, fps, startS: landingS(landing), cps, stepFps: stepFps || undefined };
  const n = typedCount(frame, spec);
  const rest = splitTiles(text).slice(n).join("");
  return (
    <span style={{ fontFamily: FONT_MONO, whiteSpace: "pre-wrap", ...style }}>
      {typedText(text, n)}
      {caret && (
        <span aria-hidden style={{ display: "inline-block", width: "0.55em", marginRight: "-0.55em", opacity: n > 0 && caretVisible(frame, spec) ? 1 : 0 }}>
          {"▌"}
        </span>
      )}
      <span style={{ visibility: "hidden" }}>{rest}</span>
    </span>
  );
};
