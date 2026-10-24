import type { ReactNode } from "react";
import { HtmlInCanvas, useVideoConfig } from "remotion";
import { blur } from "@remotion/effects/blur";
import { chromaticAberration } from "@remotion/effects/chromatic-aberration";
import { contrast } from "@remotion/effects/contrast";
import { glow } from "@remotion/effects/glow";
import { radialProgressiveBlur } from "@remotion/effects/radial-progressive-blur";
import { saturation } from "@remotion/effects/saturation";
import { vignette } from "@remotion/effects/vignette";
import { whiteBalance } from "@remotion/effects/white-balance";

export type GradeProps = {
  /** Contrast amount (1 = unchanged). Start neutral: 1.18 overshot every shot of the S5 clone (motion-craft §4). */
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
  /** Overall softness in px (AI plates upscaled and compressed read soft; S5 clone measured 2-5x sharper). 0 off. */
  soften?: number;
  /** Lens falloff: sharp centre, blur growing to `px` at the edges from `start` (0..1 of the radius). 0 off. */
  edgeBlur?: { px: number; start?: number };
  children: ReactNode;
};

/**
 * The warm AI-collage reel look measured in S5 (the "Van Gogh" clone), as `<Grade {...GRADE_REEL}>`.
 * `Grade` itself is neutral; spread this preset first and override per shot.
 */
export const GRADE_REEL: Required<Omit<GradeProps, "children">> = {
  contrast: 1.0,
  saturation: 1.1,
  warmth: 0.12,
  bloom: { intensity: 0.22, radius: 24, threshold: 0.82 },
  aberration: 1.5,
  vignette: 0.15,
  soften: 0,
  edgeBlur: { px: 14, start: 0.35 },
};

/**
 * The film look as one GPU pass over everything inside: soften -> white balance -> contrast/saturation ->
 * bloom -> lens edge blur -> chromatic aberration -> vignette (@remotion/effects through HtmlInCanvas; renders need
 * `--gl=angle`, set in remotion.config.ts). Grain stays a separate overlay (`Grain`), stepped.
 * Every default is neutral, so a bare `<Grade>` changes nothing; a look comes from props or a preset (`GRADE_REEL`).
 */
export const Grade: React.FC<GradeProps> = ({
  contrast: c = 1.0,
  saturation: s = 1.0,
  warmth = 0,
  bloom = { intensity: 0 },
  aberration = 0,
  vignette: v = 0,
  soften = 0,
  edgeBlur = { px: 0 },
  children,
}) => {
  const { width, height } = useVideoConfig();
  return (
    <HtmlInCanvas
      width={width}
      height={height}
      effects={[
        blur({ radius: soften, disabled: soften === 0 }),
        whiteBalance({ temperature: warmth, disabled: warmth === 0 }),
        contrast({ amount: c }),
        saturation({ amount: s }),
        glow({ intensity: bloom.intensity, radius: bloom.radius, threshold: bloom.threshold, disabled: bloom.intensity === 0 }),
        radialProgressiveBlur({ start: edgeBlur.start ?? 0.35, startBlur: 0, endBlur: edgeBlur.px, disabled: edgeBlur.px === 0 }),
        chromaticAberration({ amount: aberration, disabled: aberration === 0 }),
        vignette({ amount: v, disabled: v === 0 }),
      ]}
    >
      {children}
    </HtmlInCanvas>
  );
};
