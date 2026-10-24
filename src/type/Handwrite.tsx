import type { CSSProperties } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_FRAKTUR } from "./fonts";
import { handwriteMask, handwriteProgress } from "./write";
import { type Landing, landingS } from "./timing";

export type HandwriteProps = Landing & {
  /** One entry per line of the note; each line is written left to right in turn. */
  lines: string[];
  /** Seconds the whole note takes. Default 0.12 s per character, at least 0.8 s. */
  dur?: number;
  color?: string;
  /** Poses per second; `0` writes on every frame. */
  stepFps?: number;
  /** Tilt of the baseline in degrees. */
  tilt?: number;
  style?: CSSProperties;
};

/**
 * Script text written on as if by a pen, for marginalia: a growing mask sweeps each line left to
 * right (never a dash offset). The face comes from `style.fontFamily` (default the bundled
 * blackletter); load it with `loadFace` first.
 */
export const Handwrite: React.FC<HandwriteProps> = ({
  lines,
  dur,
  color = "#7a1f18",
  stepFps = 0,
  tilt = -2,
  style,
  ...landing
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chars = lines.reduce((n, l) => n + l.length, 0);
  const spec = { fps, startS: landingS(landing), durS: dur ?? Math.max(0.8, chars * 0.12), lines: lines.length, stepFps: stepFps || undefined };
  return (
    <div
      style={{
        fontFamily: FONT_FRAKTUR,
        color,
        lineHeight: 1.25,
        whiteSpace: "pre",
        transform: `rotate(${tilt}deg)`,
        transformOrigin: "0% 50%",
        ...style,
      }}
    >
      {lines.map((line, i) => {
        const mask = handwriteMask(handwriteProgress(frame, i, spec));
        return (
          <div key={i} style={{ WebkitMaskImage: mask, maskImage: mask, width: "max-content" }}>
            {line}
          </div>
        );
      })}
    </div>
  );
};
