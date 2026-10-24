import { Easing, interpolate } from "remotion";
import { stepFrame } from "../paper/step";

const outCubic = Easing.out(Easing.cubic);

export type CounterSpec = {
  from?: number;
  to: number;
  /** Frame the count starts; it reaches `to` at `start + dur`. */
  start: number;
  dur: number;
  /** Discrete values shown on the way (the odometer clicks); the last one is exactly `to`. */
  steps?: number;
  /** Poses per second (12 reads as twos at 24 fps). Omit for every frame. */
  stepFps?: number;
  fps: number;
  /** Fraction digits the value is rounded to. */
  decimals?: number;
};

/**
 * The number a `Counter` shows at `frame`: it eases out from `from` to `to` in `steps` clicks, so a
 * tick is a visible jump and the value lands exactly on `to`. Pure: a film's `trace.ts` reads it too.
 */
/** The frame a `Counter` starts counting: `dur` frames before its landing, so a trace reads the same start the component draws. */
export const counterStart = (landS: number, fps: number, dur: number): number => Math.round(landS * fps) - dur;

export const counterValue = (frame: number, spec: CounterSpec): number => {
  const { from = 0, to, start, dur, steps = 14, stepFps, fps, decimals = 0 } = spec;
  const f = stepFps ? stepFrame(frame, fps, stepFps) : frame;
  const eased = interpolate(f, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: outCubic,
  });
  const k = eased >= 1 ? 1 : Math.floor(eased * steps) / steps;
  const v = from + (to - from) * k;
  const m = 10 ** decimals;
  return Math.round(v * m) / m;
};

/** Locale-formatted number: pt-BR gives `1.234.567,5`; `decimals` fixes the fraction digits. */
export const formatCount = (value: number, locale = "pt-BR", decimals = 0): string =>
  new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: true,
  }).format(value);
