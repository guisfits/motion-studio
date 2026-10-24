import type { ReactNode } from "react";
import { HtmlInCanvas, useVideoConfig } from "remotion";
import { chromaticAberration } from "@remotion/effects/chromatic-aberration";
import { contrast } from "@remotion/effects/contrast";
import { glow } from "@remotion/effects/glow";
import { radialProgressiveBlur } from "@remotion/effects/radial-progressive-blur";
import { saturation } from "@remotion/effects/saturation";
import { vignette } from "@remotion/effects/vignette";
import { whiteBalance } from "@remotion/effects/white-balance";

export type GradeProps = {
  /** Contrast amount (effect default 1 = unchanged; the collage reels sit around 1.15-1.25). */
  contrast?: number;
  saturation?: number;
  /** White-balance temperature: > 0 warm. */
  warmth?: number;
  /** Highlight halation/bloom: 0 off. Threshold 0..1 picks what glows. */
  bloom?: { intensity: number; radius?: number; threshold?: number };
  /** Chromatic aberration in px-ish amount; spike it on impacts. 0 off. */
  aberration?: number;
  /** Vignette amount 0..1. */
  vignette?: number;
  /** Lens falloff: sharp centre, blur growing to `px` at the edges from `start` (0..1 of the radius). 0 off. */
  edgeBlur?: { px: number; start?: number };
  children: ReactNode;
};

/**
 * The film look as one GPU pass over everything inside: white balance -> contrast/saturation ->
 * bloom -> lens edge blur -> chromatic aberration -> vignette (@remotion/effects through HtmlInCanvas; renders need
 * `--gl=angle`, set in remotion.config.ts). Grain stays a separate overlay (`Grain`), stepped.
 */
export const Grade: React.FC<GradeProps> = ({
  contrast: c = 1.18,
  saturation: s = 1.1,
  warmth = 0.12,
  bloom = { intensity: 0.35, radius: 24, threshold: 0.72 },
  aberration = 1.5,
  vignette: v = 0.35,
  edgeBlur = { px: 8, start: 0.45 },
  children,
}) => {
  const { width, height } = useVideoConfig();
  return (
    <HtmlInCanvas
      width={width}
      height={height}
      effects={[
        whiteBalance({ temperature: warmth, disabled: warmth === 0 }),
        contrast({ amount: c }),
        saturation({ amount: s }),
        glow({ intensity: bloom.intensity, radius: bloom.radius, threshold: bloom.threshold, disabled: bloom.intensity === 0 }),
        radialProgressiveBlur({ start: edgeBlur.start ?? 0.45, startBlur: 0, endBlur: edgeBlur.px, disabled: edgeBlur.px === 0 }),
        chromaticAberration({ amount: aberration, disabled: aberration === 0 }),
        vignette({ amount: v, disabled: v === 0 }),
      ]}
    >
      {children}
    </HtmlInCanvas>
  );
};
