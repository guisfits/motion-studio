export type HeroEnter = "stamp" | "slide";

export type HeroWordPose = {
  /** 0..1 */
  opacity: number;
  scaleX: number;
  scaleY: number;
  /** Extra shift along the edge axis, as a fraction of the word width (+ = toward the off-frame side). */
  slide: number;
};

const clamp = (v: number) => Math.min(1, Math.max(0, v));

const FALL_S = 0.12;
const SLIDE_OMEGA = Math.sqrt(110); // old spring k=110, d~19: near critical, no overshoot

/**
 * Pure pose of the hero word `sinceS` seconds after its key word. Before 0 it is not there
 * (opacity 0); `stamp` falls from 1.35x onto the paper in 0.12 s with a short squash and recoil,
 * `slide` comes in from its edge on a critically damped spring and lands without bounce.
 */
export const heroWordPose = (sinceS: number, enter: HeroEnter = "stamp"): HeroWordPose => {
  if (enter === "stamp") {
    const fall = clamp(sinceS / FALL_S);
    const after = Math.max(0, sinceS - FALL_S);
    const knock = Math.exp(-14 * after) * Math.sin(38 * after);
    const scale = 1 + 0.35 * (1 - fall * fall) - 0.03 * knock;
    return {
      opacity: clamp(sinceS / 0.06),
      scaleX: scale,
      scaleY: scale + 0.04 * knock,
      slide: 0,
    };
  }
  const t = Math.max(0, sinceS);
  const settled = 1 - (1 + SLIDE_OMEGA * t) * Math.exp(-SLIDE_OMEGA * t);
  return { opacity: sinceS < 0 ? 0 : 1, scaleX: 1, scaleY: 1, slide: 1 - settled };
};
