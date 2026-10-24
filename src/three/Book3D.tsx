import React, { useMemo } from "react";
import { MeshStandardMaterial } from "three";
import { clamp01 } from "../shared/math";
import { coverUV } from "./cover-uv";
import { requireSrc, textureAspect, useImageTextures } from "./textures";

export type Book3DProps = {
  /** Cover picture (outside face of the front board). */
  cover: string;
  /** Page pictures, two per leaf (front, back); missing ones stay blank paper. */
  pages?: string[];
  /** 0 closed .. 1 open with the first leaves fanned out. */
  progress: number;
  /** Extra leaf turn, 0..1, applied on top of the opening (flips the next leaves in order). */
  turn?: number;
  rotateY?: number;
  rotateX?: number;
  rotateZ?: number;
  position?: [number, number, number];
  from?: [number, number, number];
  /** Entrance 0..1 from `from` to `position`. */
  enter?: number;
  size?: [number, number];
};

const LEAVES = 8;
const FLIPPED_WHEN_OPEN = 3;
// The last leaf stays down so the back board never shows during the extra turn.
const TURNABLE = LEAVES - FLIPPED_WHEN_OPEN - 1;
// Smoothstep: 0..1 easing with zero slope at both ends.
const easeInOut = (t: number) => t * t * (3 - 2 * t);

/** Hinge angle of leaf i (radians, 0 = lying on the right, PI = lying on the left). */
export const leafAngle = (i: number, progress: number, turn: number): number => {
  const start = 0.3 + i * 0.1;
  const open = easeInOut(clamp01((progress - start) / 0.28)) * (i < FLIPPED_WHEN_OPEN ? 1 : 0);
  // The extra turn flips the next leaves in order, each over its own slice, and only once the
  // book is open (the last leaf that opening flips has landed): a closed book turns nothing.
  const opened = easeInOut(clamp01((progress - (0.3 + (FLIPPED_WHEN_OPEN - 1) * 0.1)) / 0.28));
  const extra = easeInOut(clamp01(turn * TURNABLE - (i - FLIPPED_WHEN_OPEN))) * opened;
  const flipped = i < FLIPPED_WHEN_OPEN ? open : extra;
  return Math.PI * (0.96 - i * 0.02) * flipped;
};

/** A book that opens: the front board hinges on the spine, leaves fan and flip over. */
export const Book3D: React.FC<Book3DProps> = ({
  cover,
  pages = [],
  progress,
  turn = 0,
  rotateY = 0,
  rotateX = 0,
  rotateZ = 0,
  position = [0, 0, 0],
  from = [0, 0, 0],
  enter = 1,
  size = [3.2, 4.4],
}) => {
  const [w, h] = size;
  const T = 0.5;
  const board = 0.07;
  const gap = T / (LEAVES + 1);
  const srcs = [requireSrc("Book3D", "cover", cover), ...Array.from({ length: LEAVES * 2 }, (_, i) => (pages.length ? pages[i % pages.length] : undefined))];
  const [coverTex, ...pageTex] = useImageTextures(srcs);

  const mats = useMemo(() => {
    const cloth = new MeshStandardMaterial({ color: "#5b3a29", roughness: 0.85 });
    const paper = new MeshStandardMaterial({ color: "#efe6d0", roughness: 0.95 });
    const faceOf = (tex: typeof coverTex, boxAspect: number, base: string) => {
      const m = new MeshStandardMaterial({ color: tex ? "#ffffff" : base, roughness: 0.88 });
      if (tex) {
        const t = tex.clone();
        t.needsUpdate = true;
        const uv = coverUV(textureAspect(tex), boxAspect);
        t.repeat.set(uv.repeatX, uv.repeatY);
        t.offset.set(uv.offsetX, uv.offsetY);
        m.map = t;
      }
      return m;
    };
    const leaves = Array.from({ length: LEAVES }, (_, i) => [
      paper,
      paper,
      paper,
      paper,
      faceOf(pageTex[i * 2], (w - 0.12) / (h - 0.12), "#efe6d0"),
      faceOf(pageTex[i * 2 + 1], (w - 0.12) / (h - 0.12), "#e8dec6"),
    ]);
    const frontBoard = [cloth, cloth, cloth, cloth, faceOf(coverTex, w / h, "#5b3a29"), paper];
    return { cloth, paper, leaves, frontBoard };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coverTex, ...pageTex, w, h]);

  if (!coverTex) return null;
  const e = 1 - enter;
  const coverAngle = Math.PI * 0.97 * easeInOut(clamp01(progress / 0.4));
  // Re-centre as it opens so the spread stays around the origin.
  const shiftX = (w / 2) * easeInOut(clamp01(progress / 0.4));
  return (
    <group position={[position[0] + from[0] * e, position[1] + from[1] * e, position[2] + from[2] * e]}>
      <group rotation={[rotateX, rotateY, rotateZ]}>
        <group position={[shiftX, 0, 0]}>
          <group position={[-w / 2, 0, 0]}>
            <mesh position={[w / 2, 0, -T / 2 - board / 2]} material={mats.cloth} castShadow receiveShadow>
              <boxGeometry args={[w, h, board]} />
            </mesh>
            <mesh position={[-board / 2, 0, 0]} material={mats.cloth} castShadow>
              <boxGeometry args={[board, h, T + board * 2]} />
            </mesh>
            {mats.leaves.map((m, i) => (
              <group key={i} rotation={[0, -leafAngle(i, progress, turn), 0]}>
                <mesh
                  position={[(w - 0.1) / 2, 0, -T / 2 + gap * (LEAVES - i)]}
                  material={m}
                  castShadow
                  receiveShadow
                >
                  <boxGeometry args={[w - 0.12, h - 0.12, 0.012]} />
                </mesh>
              </group>
            ))}
            <group rotation={[0, -coverAngle, 0]}>
              <mesh position={[w / 2, 0, T / 2 + board / 2]} material={mats.frontBoard} castShadow receiveShadow>
                <boxGeometry args={[w, h, board]} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};
