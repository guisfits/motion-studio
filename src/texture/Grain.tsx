import type React from "react";
import { Solid, useCurrentFrame, useVideoConfig } from "remotion";
import { blur } from "@remotion/effects/blur";
import { noise } from "@remotion/effects/noise";
import { grainSeed } from "./grainStep";

export type GrainProps = {
  /** Strength of the noise, 0..1. Baseline film grain is 0.06 over every layer. */
  readonly opacity?: number;
  /** Layer seed: give each grain layer its own so two never deal the same noise. */
  readonly seed?: number;
  /** Noise re-deals per second. Baseline: 24 (a film-grain step). */
  readonly stepFps?: number;
  /** Grain clump size in px (a blur over the noise). 0 = single-pixel noise. Video-compressed grain, as
   * in downloaded reels, is soft and clumpy (~1-1.5 px); single-pixel noise reads 2-5x sharper (S5). */
  readonly size?: number;
  /** CSS blend with what lies below. "overlay" is the film-grain feel. */
  readonly blendMode?: React.CSSProperties["mixBlendMode"];
};

/**
 * Film grain over everything beneath it: a mid-grey `<Solid>` run through `@remotion/effects`
 * `noise()`, re-seeded per step so it is frame-driven and reproducible (no Math.random, a paused
 * frame shows the same grain every render). Needs WebGL (angle renderer, see remotion.config.ts).
 * Place it last in the composition, above all layers.
 */
export const Grain: React.FC<GrainProps> = ({ opacity = 0.06, seed = 0, stepFps = 24, size = 0, blendMode = "overlay" }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  return (
    <Solid
      width={width}
      height={height}
      color="#808080"
      effects={[noise({ amount: opacity, seed: grainSeed(frame, fps, stepFps, seed) }), blur({ radius: size, disabled: size === 0 })]}
      style={{ position: "absolute", inset: 0, mixBlendMode: blendMode, pointerEvents: "none" }}
    />
  );
};
