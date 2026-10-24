import React from "react";
import { Img, useCurrentFrame, useVideoConfig } from "remotion";
import { stepFrame } from "../paper";
import { assertImages, solve, type Part, type Pose } from "./rig";

export type PuppetProps = {
  parts: Part[];
  /** Image URL per part name (ES-imported assets). */
  images: Record<string, string>;
  /** Pose at a frame; called with the stepped frame so the puppet moves on the pose clock. */
  poseAt: (frame: number) => Pose;
  /**
   * Poses per second (default 12: the held, paper-moved look). A film that moves in full-rate
   * motion (a spring that rings out, a limb that follows a camera) passes its own frame rate here,
   * or the puppet still jumps 12 times a second under smooth neighbours.
   */
  stepFps?: number;
  /** Size of the assembled figure in source px; the wrapper is this big, scaled by `scale`. */
  size: [number, number];
  scale?: number;
  style?: React.CSSProperties;
};

/**
 * A cut-out puppet: every part is an image hinged on its pivot, placed by `solve`. The pose is
 * sampled on the stepped clock (`stepFrame(frame, fps, 12)`), so the figure holds each pose and
 * jumps to the next, like paper moved by hand. Parts draw in list order (later on top).
 * Each part's `pivot` is the hinge inside its own image and `origin` is the image's top-left in the
 * figure (see `Part`); `stepFps` defaults to 12, so pass the film's rate for full-rate motion.
 */
export const Puppet: React.FC<PuppetProps> = ({ parts, images, poseAt, stepFps = 12, size, scale = 1, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  assertImages(parts, images);
  const placed = solve(parts, poseAt(stepFrame(frame, fps, stepFps)));
  return (
    <div style={{ position: "relative", width: size[0] * scale, height: size[1] * scale, ...style }}>
      {parts.map((p) => {
        const s = placed[p.part];
        return (
          <Img
            key={p.part}
            src={images[p.part]}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              transformOrigin: `${p.pivot[0]}px ${p.pivot[1]}px`,
              transform: `translate(${s.x * scale - p.pivot[0]}px, ${s.y * scale - p.pivot[1]}px) scale(${scale}) rotate(${s.rotate}deg)`,
            }}
          />
        );
      })}
    </div>
  );
};
