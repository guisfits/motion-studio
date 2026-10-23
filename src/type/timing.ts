import type { Caption } from "@remotion/captions";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { wordStartS } from "../captions/useWordAt";

/** When a piece lands: `at` seconds, or the onset of `word` found in `captions`. */
export type Landing = { at?: number; word?: string; nth?: number; captions?: Caption[] };

export function landingS({ at, word, nth, captions }: Landing): number {
  if (typeof at === "number") return at;
  if (word !== undefined && captions) return wordStartS(captions, word, nth);
  throw new Error("type: give `at` (seconds) or `word` with `captions`");
}

const outCubic = Easing.out(Easing.cubic);

/**
 * 0..1 draw progress of an annotation. It starts `lead` frames before the word onset (house
 * default 3, narrated emphasis) and takes `dur` frames; held on twos when `onTwos` (12 poses/s
 * at 24 fps look). Pure in the frame: no state between frames.
 */
export function useDraw(landing: Landing, dur = 12, lead = 3, onTwos = true): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = Math.round(landingS(landing) * fps) - lead;
  const f = onTwos ? Math.floor(frame / 2) * 2 : frame;
  return interpolate(f, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: outCubic,
  });
}
