import type React from "react";
import { Solid, interpolate, useCurrentFrame } from "remotion";
import { fractalNoise } from "@remotion/effects/fractal-noise";

export type SmokeProps = {
  /** Size of the smoke field in px; it is placed by `style`. */
  readonly width: number;
  readonly height: number;
  /** Seed of the noise; the same seed always drifts the same smoke. */
  readonly seed?: number;
  /** Frame the smoke starts to thicken, relative to the enclosing sequence. */
  readonly start?: number;
  /** Frames it takes to reach full density. */
  readonly rise?: number;
  /** Peak opacity of the smoke, 0..1. */
  readonly density?: number;
  /** Size of the largest smoke billows in px. */
  readonly scale?: number;
  readonly style?: React.CSSProperties;
};

/**
 * Smoke drifting up through its field: `fractalNoise()` with the contrast pushed so only the
 * billows stay bright, evolving slowly while its offset rises and sways, screened over whatever
 * lies below (put it in front of a cut-out on a dark ground). A vertical mask thins it toward the
 * top and the sides so it never shows a rectangle. Frame-driven and seeded.
 */
export const Smoke: React.FC<SmokeProps> = ({ width, height, seed = 7, start = 0, rise = 45, density = 0.7, scale = 150, style }) => {
  const frame = useCurrentFrame();
  const env = interpolate(frame, [start, start + rise], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (env <= 0) return null;
  const mask = "radial-gradient(ellipse 60% 62% at 50% 55%, #000 55%, transparent 100%)";
  return (
    <Solid
      width={width}
      height={height}
      color="#808080"
      effects={[
        fractalNoise({
          fractalType: "turbulent-basic",
          scale,
          complexity: 6,
          contrast: 2.8,
          brightness: -0.5,
          subInfluence: 0.55,
          evolution: frame * 1.3,
          offsetX: Math.sin(frame / 55) * 70,
          offsetY: frame * 2.4,
          seed,
        }),
      ]}
      style={{ position: "absolute", mixBlendMode: "screen", opacity: env * density, WebkitMaskImage: mask, maskImage: mask, ...style }}
    />
  );
};
