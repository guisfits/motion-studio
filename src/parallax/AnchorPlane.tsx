import type { ReactNode } from "react";
import { AbsoluteFill } from "remotion";

export type AnchorPose = {
  /** Screen point (px) the anchor is put at. */
  px: number;
  py: number;
  /** Scale and roll (deg, counter-clockwise) around the anchor. */
  s: number;
  rot?: number;
  /** Anchor in the plane's own layout (px). */
  ax: number;
  ay: number;
};

/**
 * CSS transform that puts a plane's anchor (ax, ay) at screen (px, py), scaled by s and rolled
 * `rot` deg counter-clockwise around it. `unit` maps layout px to output px (a clone laid out in
 * the reference's 720 px renders at 1080 with unit 1.5).
 */
export const anchorTransform = ({ px, py, s, rot = 0, ax, ay }: AnchorPose, unit = 1): string =>
  `translate(${px * unit}px, ${py * unit}px) rotate(${-rot}deg) scale(${s}) translate(${-ax * unit}px, ${-ay * unit}px)`;

/**
 * A parallax plane driven by a measured anchor track (lion clone, S10): children are laid out once
 * in the plane's own composition and never know about the camera; each depth rate is one plane
 * whose pose comes from `monotoneKeys` tables.
 */
export const AnchorPlane = ({ unit = 1, children, ...pose }: AnchorPose & { unit?: number; children: ReactNode }) => (
  <AbsoluteFill style={{ transformOrigin: "0 0", transform: anchorTransform(pose, unit) }}>{children}</AbsoluteFill>
);
