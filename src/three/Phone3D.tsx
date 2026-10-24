import React, { useEffect, useMemo } from "react";
import { CanvasTexture, ExtrudeGeometry, Shape, ShapeGeometry, SRGBColorSpace } from "three";
import { coverUV } from "./cover-uv";
import { requireSrc, textureAspect, useImageTextures } from "./textures";

/** Draws the screen on a 2D canvas (UI mock-ups); call again via `drawKey` to animate. */
export type PhoneScreenDraw = (ctx: CanvasRenderingContext2D, width: number, height: number) => void;

export type Phone3DProps = {
  /** An image URL (ES import) or a canvas draw function. A React node cannot be a texture. */
  screen: string | PhoneScreenDraw;
  /** Changes whenever a draw function must repaint (pass the frame or a derived value). */
  drawKey?: number;
  rotateY?: number;
  rotateX?: number;
  rotateZ?: number;
  progress?: number;
  from?: [number, number, number];
  position?: [number, number, number];
  /** Image screens: zoom and pan (-1..1) inside the picture. */
  screenZoom?: number;
  screenPan?: [number, number];
  size?: [number, number];
  depth?: number;
};

const roundedRect = (w: number, h: number, r: number): Shape => {
  const s = new Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
};

/** Rounded-rect geometry whose UVs span 0..1 across the box, so a map covers it exactly. */
const screenGeometry = (w: number, h: number, r: number) => {
  const g = new ShapeGeometry(roundedRect(w, h, r), 12);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / h + 0.5);
  return g;
};

/** A generic, brand-free phone slab: rounded bevelled body, black bezel, lit screen. */
export const Phone3D: React.FC<Phone3DProps> = ({
  screen,
  drawKey = 0,
  rotateY = 0,
  rotateX = 0,
  rotateZ = 0,
  progress = 1,
  from = [0, 0, 0],
  position = [0, 0, 0],
  screenZoom = 1,
  screenPan = [0, 0],
  size = [2.2, 4.5],
  depth = 0.22,
}) => {
  const [w, h] = size;
  const isDraw = typeof screen === "function";
  const [imgTex] = useImageTextures([isDraw ? undefined : requireSrc("Phone3D", "screen", screen)]);
  const sw = w - 0.2;
  const sh = h - 0.36;

  const body = useMemo(() => {
    const g = new ExtrudeGeometry(roundedRect(w, h, 0.34), {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.04,
      bevelSegments: 5,
      curveSegments: 14,
    });
    g.translate(0, 0, -depth / 2);
    return g;
  }, [w, h, depth]);
  const glass = useMemo(() => screenGeometry(sw, sh, 0.24), [sw, sh]);

  const canvasTex = useMemo(() => {
    if (!isDraw) return null;
    const c = document.createElement("canvas");
    c.width = 540;
    c.height = Math.round((540 * sh) / sw);
    const t = new CanvasTexture(c);
    t.colorSpace = SRGBColorSpace;
    return t;
  }, [isDraw, sw, sh]);

  useEffect(() => {
    if (!canvasTex || typeof screen !== "function") return;
    const c = canvasTex.image as HTMLCanvasElement;
    // Cleared first, so a repaint is a pure function of the draw call, never of the last frame.
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, c.width, c.height);
    screen(ctx, c.width, c.height);
    canvasTex.needsUpdate = true;
  }, [canvasTex, screen, drawKey]);

  const imageMap = useMemo(() => {
    if (!imgTex) return null;
    const t = imgTex.clone();
    t.needsUpdate = true;
    const uv = coverUV(textureAspect(imgTex), sw / sh, screenZoom, screenPan[0], screenPan[1]);
    t.repeat.set(uv.repeatX, uv.repeatY);
    t.offset.set(uv.offsetX, uv.offsetY);
    return t;
  }, [imgTex, sw, sh, screenZoom, screenPan[0], screenPan[1]]);

  const map = isDraw ? canvasTex : imageMap;
  if (!map) return null;
  const p = 1 - progress;
  return (
    <group position={[position[0] + from[0] * p, position[1] + from[1] * p, position[2] + from[2] * p]}>
      <group rotation={[rotateX, rotateY, rotateZ]}>
        <mesh geometry={body} castShadow receiveShadow>
          <meshStandardMaterial color="#1c1b1a" metalness={0.55} roughness={0.32} />
        </mesh>
        <mesh geometry={glass} position={[0, 0, depth / 2 + 0.046]}>
          <meshBasicMaterial map={map} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
};
