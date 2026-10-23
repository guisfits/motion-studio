import type { EffectDescriptor } from "remotion";
import { halftone } from "@remotion/effects/halftone";
import { duotone } from "@remotion/effects/duotone";
import { paper } from "@remotion/effects/paper";

export type PrintLookOptions = {
  /** Halftone dot pitch in px at 1080p (catalogue: 6-10). Default 8. */
  readonly dotSpacing?: number;
  /** Halftone screen angle in degrees. Default 45. */
  readonly angle?: number;
  /** Ink colour: shadows map to it. Default a neutral near-black; the look's palette comes later. */
  readonly ink?: string;
  /** Paper colour: highlights map to it. Default a neutral warm off-white. */
  readonly paperColor?: string;
  /** Shaded paper colour (folds, fibre). Default a neutral warm grey-beige. */
  readonly paperShade?: string;
  /** Strength of the paper texture, 0..1. Default 0.35: a surface, not a pattern. */
  readonly paperAmount?: number;
  /** Seed of the generated paper (0..1000). */
  readonly paperSeed?: number;
};

/**
 * The print look as an `effects` stack, applied in order to a photo (`<Img effects={...}>`):
 * halftone (photos only, 45 deg screen, 8 px pitch) -> duotone (ink / paper) -> paper texture.
 * Technique defaults, deliberately palette-neutral.
 */
export const printLook = ({
  dotSpacing = 8,
  angle = 45,
  ink = "#1c1a17",
  paperColor = "#efe8d8",
  paperShade = "#cfc4ab",
  paperAmount = 0.35,
  paperSeed = 6,
}: PrintLookOptions = {}): EffectDescriptor<unknown>[] => [
  halftone({ shape: "circle", dotSize: dotSpacing, dotSpacing, rotation: angle, colorMode: "source", invert: true }),
  duotone({ darkColor: ink, lightColor: paperColor }),
  paper({ amount: paperAmount, seed: paperSeed, colorFront: paperShade, colorBack: paperColor }),
];
