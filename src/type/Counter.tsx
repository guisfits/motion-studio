import type { CSSProperties } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { counterStart, counterValue, formatCount } from "./count";
import { FONT_MONO } from "./fonts";
import { type Landing, landingS } from "./timing";

export type CounterProps = Landing & {
  from?: number;
  to: number;
  /** Frames the count takes; it ends on the landing (word onset). */
  dur?: number;
  steps?: number;
  /** Poses per second; 12 by default, `0` for every frame. */
  stepFps?: number;
  decimals?: number;
  /** BCP 47 locale of the thousands and decimal separators. */
  locale?: string;
  prefix?: string;
  suffix?: string;
  style?: CSSProperties;
};

/** A number that clicks up to its value and lands on the spoken word; tabular digits never jitter. */
export const Counter: React.FC<CounterProps> = ({
  from = 0,
  to,
  dur = 36,
  steps,
  stepFps = 12,
  decimals = 0,
  locale = "pt-BR",
  prefix = "",
  suffix = "",
  style,
  ...landing
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = counterStart(landingS(landing), fps, dur);
  const v = counterValue(frame, { from, to, start, dur, steps, stepFps: stepFps || undefined, fps, decimals });
  return (
    <span style={{ fontFamily: FONT_MONO, fontVariantNumeric: "tabular-nums", whiteSpace: "pre", ...style }}>
      {prefix}
      {formatCount(v, locale, decimals)}
      {suffix}
    </span>
  );
};
