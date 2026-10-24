import type React from "react";
import { Easing, Solid, interpolate, useCurrentFrame } from "remotion";
import { fractalNoise } from "@remotion/effects/fractal-noise";

export type InkSpreadProps = {
  /** Size of the ink field in px; it is placed by `style`. */
  readonly width: number;
  readonly height: number;
  /** Frame the bloom starts, relative to the enclosing sequence. */
  readonly start: number;
  /** Frames the bloom takes to reach full size. */
  readonly duration: number;
  /** Seed of the blot shapes. */
  readonly seed?: number;
  /** Pixel size of the blot shapes; larger = fewer, rounder lobes. */
  readonly scale?: number;
  readonly style?: React.CSSProperties;
};

/**
 * Ink blooming organically from the middle of its field. A high-contrast `fractalNoise()` blot
 * pattern is multiplied onto the sheet; the pattern's brightness sinks with the bloom, so the
 * dark lobes swell and merge (a threshold walking through the noise, not a circle wipe), and a
 * soft elliptical mask keeps the stain centred and grows with it. Pure in the frame.
 */
export const InkSpread: React.FC<InkSpreadProps> = ({ width, height, start, duration, seed = 4, scale = 220, style }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  if (p <= 0) return null;
  const q = 0.3 + p * 0.62;
  const rx = width * 0.5 * q;
  const ry = height * 0.52 * q;
  const mask = `radial-gradient(ellipse ${rx}px ${ry}px at 50% 50%, #000 70%, transparent 100%)`;
  return (
    <Solid
      width={width}
      height={height}
      color="#808080"
      effects={[
        fractalNoise({
          fractalType: "turbulent-smooth",
          scale,
          complexity: 5,
          contrast: 9,
          brightness: 1.6 - p * 5.6,
          subInfluence: 0.62,
          evolution: frame * 0.6,
          seed,
        }),
      ]}
      style={{ position: "absolute", mixBlendMode: "multiply", WebkitMaskImage: mask, maskImage: mask, ...style }}
    />
  );
};
