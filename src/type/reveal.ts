import { Easing, interpolate } from "remotion";

const outCubic = Easing.out(Easing.cubic);

export type WordReveal = {
  /** False until the word starts travelling in (it is `visibility: hidden` before that). */
  visible: boolean;
  /** 0..1 travel progress; 1 once the word has landed. */
  progress: number;
  /** 0..1; reaches 1 half way through the travel. */
  opacity: number;
};

/**
 * Where one `RevealWords` word is at `frame`: it travels in over `enter` frames and lands on the
 * frame its spoken onset (`startMs`) falls on. `RevealWords` draws from this and a film's
 * `traceAt` reads it for the caption's alpha.
 */
export const revealWord = (frame: number, startMs: number, fps: number, enter = 6): WordReveal => {
  const land = Math.round((startMs / 1000) * fps);
  const progress = interpolate(frame, [land - enter, land], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: outCubic,
  });
  return { visible: frame >= land - enter, progress, opacity: Math.min(1, progress * 2) };
};
