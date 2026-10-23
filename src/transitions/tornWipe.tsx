import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";
import { Torn, tornClip } from "../paper";

export type TornWipeDirection = "up" | "left";

export type TornWipeOptions = {
  direction?: TornWipeDirection;
  seed?: string;
};

type TornWipeProps = { direction: TornWipeDirection; seed: string };

export type TornWipePose = {
  /** Translation of the exiting sheet in px. */
  x: number;
  y: number;
  /** Tilt in degrees. */
  rotate: number;
  /** Torn-edge bite in % of the side, grows in from 0 so the sheet starts as a clean full frame. */
  bite: number;
  /** 0..1 strength of the cast shadow on the scene underneath. */
  shadow: number;
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export const smootherstep = (t: number): number => {
  const x = clamp01(t);
  return x * x * x * (x * (x * 6 - 15) + 10);
};

const MAX_BITE = 2.2;
const BITE_RAMP = 0.12;
const TILT = { left: -8, up: 5 } as const;
// The baseline sheet was smaller than the frame; a full-frame scene must travel a whole frame
// plus the tilt overhang to leave it.
const OVERSHOOT = { left: 1.2, up: 1.25 } as const;

/**
 * Pure pose of the exiting sheet at transition `progress` (0..1, linear in; eased inside).
 * 0 = untouched full frame (only the exiting scene shows); 1 = gone, only the entering scene.
 */
export const tornWipePose = (
  progress: number,
  direction: TornWipeDirection,
  width: number,
  height: number,
): TornWipePose => {
  const e = smootherstep(progress);
  const travel = direction === "left" ? width * OVERSHOOT.left : height * OVERSHOOT.up;
  const lead = clamp01(progress / BITE_RAMP);
  const tail = clamp01((1 - progress) / BITE_RAMP);
  return {
    x: direction === "left" ? 0 - travel * e : 0,
    y: direction === "up" ? 0 - travel * e : 0,
    rotate: 0 + TILT[direction] * e,
    bite: MAX_BITE * smootherstep(lead),
    shadow: 0.55 * Math.min(smootherstep(lead), smootherstep(tail)),
  };
};

const TornWipePresentation: React.FC<
  TransitionPresentationComponentProps<TornWipeProps>
> = ({ children, presentationProgress, presentationDirection, passedProps }) => {
  const { width, height } = useVideoConfig();

  // The entering scene is the untouched desk underneath.
  if (presentationDirection === "entering") {
    return <AbsoluteFill style={{ zIndex: 0 }}>{children}</AbsoluteFill>;
  }

  const pose = tornWipePose(presentationProgress, passedProps.direction, width, height);
  const clip = tornClip(passedProps.seed, pose.bite);
  return (
    <AbsoluteFill
      style={{
        zIndex: 1,
        transform: `translate(${pose.x}px, ${pose.y}px) rotate(${pose.rotate}deg)`,
        filter: `drop-shadow(0 14px 28px rgba(20,12,6,${pose.shadow.toFixed(3)}))`,
      }}
    >
      <Torn
        seed={passedProps.seed}
        clip={clip}
        fibre={pose.bite > 0.05 ? undefined : null}
        style={{ width: "100%", height: "100%" }}
      >
        {children}
      </Torn>
    </AbsoluteFill>
  );
};

/**
 * Baseline paper join as a `TransitionPresentation`: the outgoing sheet gets a torn edge and is
 * pulled off (left: -8 deg, up: +5 deg), casting a shadow on the incoming scene. Pair with
 * `linearTiming` (~22 frames at 30 fps = the baseline 0.75 s); the smootherstep is applied here.
 */
export const tornWipe = (
  opts: TornWipeOptions = {},
): TransitionPresentation<TornWipeProps> => ({
  component: TornWipePresentation,
  props: { direction: opts.direction ?? "left", seed: opts.seed ?? "tornwipe" },
});
