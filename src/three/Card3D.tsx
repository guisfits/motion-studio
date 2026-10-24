import React, { useMemo } from "react";
import { MeshStandardMaterial } from "three";
import { coverUV } from "./cover-uv";
import { requireSrc, textureAspect, useImageTextures } from "./textures";

export type Card3DProps = {
  /** Front face picture (URL from an ES import). */
  image: string;
  /** Back face picture; plain paper when omitted. */
  backImage?: string;
  /** Flip around the vertical axis, radians. */
  rotateY: number;
  /** 0 = off-frame at `from`, 1 = at `position` (eased by the caller). */
  progress?: number;
  /** Where the card travels in from, relative to `position`. */
  from?: [number, number, number];
  position?: [number, number, number];
  /** Extra tilt, radians. */
  rotateX?: number;
  rotateZ?: number;
  size?: [number, number];
  thickness?: number;
};

const PAPER = "#f1e9d6";

/** A paper card with real thickness: lit box, picture front and back, casts and receives shadow. */
export const Card3D: React.FC<Card3DProps> = ({
  image,
  backImage,
  rotateY,
  progress = 1,
  from = [0, 0, 0],
  position = [0, 0, 0],
  rotateX = 0,
  rotateZ = 0,
  size = [3, 4.2],
  thickness = 0.07,
}) => {
  const [front, back] = useImageTextures([requireSrc("Card3D", "image", image), backImage]);
  const [w, h] = size;

  const materials = useMemo(() => {
    const edge = new MeshStandardMaterial({ color: "#d9cfb6", roughness: 0.95 });
    const face = (tex: typeof front) => {
      const m = new MeshStandardMaterial({ color: tex ? "#ffffff" : PAPER, roughness: 0.9 });
      if (tex) {
        const t = tex.clone();
        t.needsUpdate = true;
        const uv = coverUV(textureAspect(tex), w / h);
        t.repeat.set(uv.repeatX, uv.repeatY);
        t.offset.set(uv.offsetX, uv.offsetY);
        m.map = t;
      }
      return m;
    };
    // BoxGeometry face order: +x, -x, +y, -y, +z (front), -z (back).
    return [edge, edge, edge, edge, face(front), face(back)];
  }, [front, back, w, h]);

  if (!front) return null;
  const p = 1 - progress;
  return (
    <group position={[position[0] + from[0] * p, position[1] + from[1] * p, position[2] + from[2] * p]}>
      <mesh rotation={[rotateX, rotateY, rotateZ]} material={materials} castShadow receiveShadow>
        <boxGeometry args={[w, h, thickness]} />
      </mesh>
    </group>
  );
};
