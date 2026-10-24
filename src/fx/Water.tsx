import type React from "react";
import { Img, interpolate, useCurrentFrame } from "remotion";
import { turbulentDisplace } from "@remotion/effects/turbulent-displace";
import { wave } from "@remotion/effects/wave";

export type WaterProps = {
  /** The engraving (imported asset URL). */
  readonly src: string;
  /** Size of the visible window in px. */
  readonly width: number;
  readonly height: number;
  /** Where the picture sits inside the window (px, may be negative: it crops the engraving). */
  readonly image: { readonly left: number; readonly top: number; readonly width: number; readonly height: number };
  /** Optional CSS clip-path keeping the ripple to the sea; the rest of the window stays still. */
  readonly clipPath?: string;
  /** Frame the ripples start to grow, relative to the enclosing sequence. */
  readonly start?: number;
  /** Frames the swell takes to reach full strength. */
  readonly rise?: number;
  /** Ripple strength multiplier; 1 is the baseline. */
  readonly strength?: number;
  readonly seed?: number;
  readonly style?: React.CSSProperties;
};

const Plate: React.FC<{ src: string; image: WaterProps["image"]; effects?: React.ComponentProps<typeof Img>["effects"] }> = ({ src, image, effects }) => (
  <Img src={src} effects={effects} style={{ position: "absolute", ...image }} />
);

/**
 * Ripple over an engraved sea: `wave()` rolls fine swell lines across the plate while
 * `turbulentDisplace()` wobbles it organically, both phase-driven by the frame and ramped up from
 * still. The calm plate stays underneath and the rippled copy is clipped to `clipPath`, so only the
 * water moves, not the land.
 */
export const Water: React.FC<WaterProps> = ({ src, width, height, image, clipPath, start = 0, rise = 40, strength = 1, seed = 3, style }) => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [start, start + rise], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * strength;
  const effects = [
    wave({ direction: "vertical", amplitude: 9 * k, wavelength: 46, phase: frame * 0.2 }),
    turbulentDisplace({ displacement: "turbulent-smoother", amount: 34 * k, size: 70, complexity: 2, evolution: frame * 4, seed, pinning: "none" }),
  ];
  return (
    <div style={{ position: "absolute", width, height, overflow: "hidden", ...style }}>
      <Plate src={src} image={image} />
      <div style={{ position: "absolute", inset: 0, clipPath }}>
        <Plate src={src} image={image} effects={effects} />
      </div>
    </div>
  );
};
