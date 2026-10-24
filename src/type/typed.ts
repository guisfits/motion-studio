import { stepFrame } from "../paper/step";
import { splitTiles } from "./tiles";

export type TypewriterSpec = {
  text: string;
  fps: number;
  /** Seconds the first character strikes. */
  startS: number;
  /** Characters per second. */
  cps?: number;
  /** Poses per second (12 reads as twos at 24 fps); omit for every frame. */
  stepFps?: number;
};

/** How many characters (graphemes: a letter and its accent count once) are struck at `frame`. */
export const typedCount = (frame: number, { text, fps, startS, cps = 12, stepFps }: TypewriterSpec): number => {
  const f = stepFps ? stepFrame(frame, fps, stepFps) : frame;
  const t = f / fps - startS;
  if (t < 0) return 0;
  return Math.min(splitTiles(text).length, Math.floor(t * cps) + 1);
};

/** The visible part of `text` after `count` graphemes. */
export const typedText = (text: string, count: number): string => splitTiles(text).slice(0, count).join("");

/** Frame the last character shows (on its held pose when stepped), for a film's trace. */
export const typedDoneFrame = (spec: TypewriterSpec): number => {
  const { text, fps, startS, cps = 12 } = spec;
  const n = splitTiles(text).length;
  let f = Math.max(0, Math.ceil((startS + (n - 1) / cps) * fps - 1e-9));
  while (typedCount(f, spec) < n) f++;
  return f;
};

/** Caret is solid while typing and blinks at 2 Hz after the last character. */
export const caretVisible = (frame: number, spec: TypewriterSpec): boolean => {
  const n = splitTiles(spec.text).length;
  if (typedCount(frame, spec) < n) return true;
  return Math.floor(((frame - typedDoneFrame(spec)) / spec.fps) * 2) % 2 === 0;
};
