import type { ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { cameraAt, type CamKey } from "../camera";
import { blurFor, layerOffset } from "./depth";

export type MultiplaneLayer = {
  /** 0 = camera plane, 1 = far background, negative = foreground. */
  depth: number;
  children: ReactNode;
  /** Blur radius in px; overrides the depth-of-field value when set. */
  blur?: number;
};

export type MultiplaneProps = {
  camKeys: CamKey[];
  layers: MultiplaneLayer[];
  /** Depth held in focus; planes blur by their distance from it. */
  focus?: number;
  /** Blur px per unit of depth away from `focus`. 0 = no depth of field. */
  dof?: number;
  /** Smear fast camera moves with @remotion/motion-blur. */
  motionBlur?: boolean;
};

const BLUR_GAIN = 2.2;
const BLUR_MAX_ANGLE = 120;
const BLUR_SAMPLES = 12;

// Planes read the frame themselves: CameraMotionBlur re-renders its children at sub-frame offsets.
const Planes: React.FC<Omit<MultiplaneProps, "motionBlur">> = ({ camKeys, layers, focus = 0, dof = 0 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cam = cameraAt(camKeys, frame);
  const origin = cameraAt(camKeys, camKeys[0]?.frame ?? 0);
  return (
    <AbsoluteFill>
      {layers.map((layer, i) => {
        const p = layerOffset(layer.depth, cam, origin);
        const blur = layer.blur ?? blurFor(layer.depth, focus, dof);
        return (
          <AbsoluteFill
            key={i}
            style={{
              transformOrigin: "0 0",
              transform: `translate(${width / 2}px, ${height / 2}px) scale(${p.scale}) translate(${-p.x}px, ${-p.y}px)`,
              // Blur is set in screen px, so divide out the plane's scale.
              filter: blur > 0.05 ? `blur(${blur / p.scale}px)` : undefined,
            }}
          >
            {layer.children}
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

/**
 * Layers each following the camera by depth. They are positioned in the same world pixels as
 * `camKeys`, measured from the first key: with the first key centred on the frame (960, 540 at
 * 1920x1080, zoom 1) a layer is authored in plain frame pixels.
 */
export const Multiplane: React.FC<MultiplaneProps> = ({ motionBlur = false, ...rest }) => {
  const frame = useCurrentFrame();
  const angle = Math.min(BLUR_MAX_ANGLE, cameraAt(rest.camKeys, frame).velocity * BLUR_GAIN);
  const planes = <Planes {...rest} />;
  if (!motionBlur || angle < 1) return <AbsoluteFill style={{ overflow: "hidden" }}>{planes}</AbsoluteFill>;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <CameraMotionBlur shutterAngle={angle} samples={BLUR_SAMPLES}>
        {planes}
      </CameraMotionBlur>
    </AbsoluteFill>
  );
};
