import { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, cancelRender, continueRender, delayRender, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { CanvasTexture, DoubleSide, SRGBColorSpace } from "three";
import { F, tab, useFonts47 } from "../lib/s04-07-kit";
import starryUrl from "../assets/pd/starry-night.jpg";
import rhoneUrl from "../assets/pd/rhone.jpg";
import wheatUrl from "../assets/pd/wheatfield.jpg";
import saintUrl from "../assets/pd/saint-remy.jpg";
import cafeUrl from "../assets/pd/cafe-terrace.jpg";
import irisUrl from "../assets/pd/irises.jpg";
import plateUrl from "../assets/gen/s07-plate-cut.png";

// Shot 7 (local 0 = scene frame 211 = breakdown f212): 1888 plate inside a ring of Roman numerals
// in real 3D; the camera dollies in while four framed paintings fly past at their own depths.

const NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
const VW = 1080;
const VH = 1920;
// Camera: vertical fov 40 deg; at distance D the frame shows (0.728 D) x (0.409 D) units.
const FOV = 40;
const D0 = 9;
// Camera: the reference's measured cumulative zoom per frame (S07, frames 211-233): a fast push that
// decelerates into a hold at ~1.4x, a small pull at f9-10, then the closing acceleration.
const ZOOM = [1, 1.108, 1.173, 1.246, 1.308, 1.349, 1.385, 1.407, 1.432, 1.419, 1.408, 1.415, 1.427, 1.434, 1.442, 1.45, 1.458, 1.467, 1.477, 1.492, 1.516, 1.544, 1.625];
// Camera roll (deg, cumulative) and sideways drift (px, cumulative) measured on the reference: a roll
// that builds to ~7.5 deg, and a small left-then-right drift.
const ROLL = [0, 0, 0.1, 0.3, 0.4, 0.5, 0.6, 1.3, 2.2, 3.2, 3.8, 3.7, 4.2, 4.6, 4.9, 5.3, 5.4, 5.7, 5.9, 6.1, 6.3, 6.4, 6.5];
const TX = [0, -4, -8, -9, -10, -12, -14, -4, 5, 16, 26, 36, 39, 42, 45, 47, 49, 50, 52, 54, 54, 55, 57];
// The plate/ring centre sits at screen (50 %, 55 %) at the start, depth z = 1.65 (it grows 1.9x while the camera zooms 1.63x).
const PLATE_Z = 1.65;
const PLATE_SCREEN_Y = 0.55;
const PLATE_W = 0.43; // fraction of the frame width at f0
const TILT = -0.5;
/** One spiral of numerals: 30 glyphs, three turns, radius growing from the plate outwards (as the reference, ~40 visible). */
const SPIRAL = Array.from({ length: 36 }, (_, i) => ({ n: i % 12, th: (i * Math.PI) / 6 + 0.4, r: 0.6 + i * 0.058 }));
const glyphSize = (r: number) => 0.42 + r * 0.1;

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = rej;
    im.src = src;
  });

const canvas = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
};

const tex = (c: HTMLCanvasElement) => {
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

const numeralTexture = (text: string, blur: number) => {
  const c = canvas(256, 256);
  const g = c.getContext("2d")!;
  g.filter = blur ? `blur(${blur}px)` : "none";
  g.fillStyle = "#F2F2EE";
  g.font = `700 150px "${F.cinzel}"`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.shadowColor = "rgba(0,0,0,0.5)";
  g.shadowBlur = 8;
  g.fillText(text, 128, 138);
  return tex(c);
};

const GOLD_A = "#E9C46A";
const GOLD_B = "#8A6420";

/** A gilt frame around a painting; `shape` clips the picture and the frame to a rect, oval or circle. */
const frameTexture = (img: HTMLImageElement, shape: "rect" | "oval" | "round", w: number, h: number) => {
  const c = canvas(w, h);
  const g = c.getContext("2d")!;
  const path = (inset: number) => {
    g.beginPath();
    if (shape === "rect") g.rect(inset, inset, w - 2 * inset, h - 2 * inset);
    else g.ellipse(w / 2, h / 2, w / 2 - inset, h / 2 - inset, 0, 0, Math.PI * 2);
  };
  const grad = g.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, GOLD_A);
  grad.addColorStop(0.5, GOLD_B);
  grad.addColorStop(1, GOLD_A);
  path(0);
  g.fillStyle = grad;
  g.fill();
  const b = Math.min(w, h) * 0.11;
  g.save();
  path(b);
  g.clip();
  const s = Math.max((w - 2 * b) / img.width, (h - 2 * b) / img.height);
  g.drawImage(img, w / 2 - (img.width * s) / 2, h / 2 - (img.height * s) / 2, img.width * s, img.height * s);
  g.restore();
  return tex(c);
};

const plateTexture = (plate: HTMLImageElement) => {
  const c = canvas(1024, 640);
  const g = c.getContext("2d")!;
  g.drawImage(plate, 0, 0);
  g.fillStyle = "#2A1C0C";
  g.beginPath();
  g.roundRect(120, 120, 784, 400, 14);
  g.fill();
  g.fillStyle = "#E8A21A";
  g.font = `400 330px "${F.lilita}"`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("1888", 512, 330);
  return tex(c);
};

type Assets = {
  sharp: CanvasTexture[];
  soft: CanvasTexture[];
  frames: CanvasTexture[];
  plate: CanvasTexture;
};

/** Builds every texture once (fonts must be in), holding the render until the canvas has drawn them. */
const useAssets = (): Assets | null => {
  const advance = useThree((s) => s.advance);
  const [assets, setAssets] = useState<Assets | null>(null);
  const [hold] = useState(() => delayRender("s07 textures"));
  useEffect(() => {
    let alive = true;
    (async () => {
      await document.fonts.load(`700 150px "${F.cinzel}"`);
      await document.fonts.load(`400 300px "${F.lilita}"`);
      const [a, b, c, d, e, g, p] = await Promise.all([starryUrl, rhoneUrl, wheatUrl, saintUrl, cafeUrl, irisUrl, plateUrl].map(loadImage));
      if (!alive) return;
      setAssets({
        sharp: NUMERALS.map((n) => numeralTexture(n, 0)),
        soft: NUMERALS.map((n) => numeralTexture(n, 9)),
        frames: [frameTexture(a, "rect", 512, 400), frameTexture(b, "round", 512, 512), frameTexture(d, "oval", 400, 640), frameTexture(g, "rect", 512, 400), frameTexture(e, "rect", 400, 512), frameTexture(c, "rect", 512, 400)],
        plate: plateTexture(p),
      });
    })().catch((e) => cancelRender(e));
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    if (!assets) return;
    advance(performance.now());
    continueRender(hold);
  }, [assets, advance, hold]);
  return assets;
};

// Painting frames: screen position at the start (fractions of the frame), width fraction, depth z.
const FRAMES = [
  { sx: 0.31, sy: 0.29, w: 0.24, aspect: 512 / 400, z: 0.54 }, // starry night, rect, top-left
  { sx: 0.72, sy: 0.19, w: 0.2, aspect: 1, z: -3.2 }, // round medallion, top-right (far)
  { sx: 0.27, sy: 0.69, w: 0.27, aspect: 400 / 640, z: 2.85 }, // tall oval, bottom-left (nearest: grows 2.3x)
  { sx: 0.75, sy: 0.68, w: 0.31, aspect: 512 / 400, z: 0.54 }, // rect, bottom-right
  { sx: 0.62, sy: 0.95, w: 0.1, aspect: 400 / 512, z: -3.0 }, // cafe terrace, small, far
  { sx: 0.4, sy: 1.02, w: 0.12, aspect: 512 / 400, z: -1.5 }, // irises, bottom
];

const Scene: React.FC<{ f: number }> = ({ f }) => {
  const assets = useAssets();
  if (!assets) return null;
  const dist = D0 / tab(ZOOM, f);
  const roll = tab(ROLL, f);
  const camX = (-tab(TX, f) / VW) * (2 * Math.tan((FOV / 2) * (Math.PI / 180)) * VW / VH) * dist;
  const ang = (-f * 4 * Math.PI) / 180;
  const visH = 2 * Math.tan((FOV / 2) * (Math.PI / 180));
  const visW = (visH * VW) / VH;

  return (
    <>
      <group position={[0, 0, 0]}>
        {/* spiral of numerals */}
        <group position={[0, (0.5 - PLATE_SCREEN_Y) * visH * (D0 - PLATE_Z), PLATE_Z]} rotation={[TILT, 0, 0]}>
          <group rotation={[0, 0, ang]}>
            {SPIRAL.map((it, i) => {
              const lx = it.r * Math.cos(it.th);
              const ly = it.r * Math.sin(it.th);
              const cx = lx * Math.cos(ang) - ly * Math.sin(ang);
              const cy = lx * Math.sin(ang) + ly * Math.cos(ang);
              const zw = cy * Math.sin(TILT) + PLATE_Z;
              const yw = cy * Math.cos(TILT) + (0.5 - PLATE_SCREEN_Y) * visH * (D0 - PLATE_Z);
              const dd = Math.hypot(cx, yw, dist - zw);
              const soft = Math.min(1, Math.max(0, (dist - dd - 2.2) / 2.0));
              const gs = glyphSize(it.r);
              return (
                <group key={i} position={[lx, ly, 0]} rotation={[0, 0, it.th - Math.PI / 2]}>
                  <mesh>
                    <planeGeometry args={[gs, gs]} />
                    <meshBasicMaterial map={assets.sharp[it.n]} transparent opacity={1 - soft} alphaTest={0.02} side={DoubleSide} toneMapped={false} />
                  </mesh>
                  <mesh position={[0, 0, 0.001]}>
                    <planeGeometry args={[gs, gs]} />
                    <meshBasicMaterial map={assets.soft[it.n]} transparent opacity={soft} alphaTest={0.02} side={DoubleSide} toneMapped={false} />
                  </mesh>
                </group>
              );
            })}
          </group>
        </group>
        {/* 1888 plate at the ring centre */}
        <mesh position={[0, (0.5 - PLATE_SCREEN_Y) * visH * (D0 - PLATE_Z), PLATE_Z]}>
          <planeGeometry args={[PLATE_W * visW * (D0 - PLATE_Z), PLATE_W * visW * (D0 - PLATE_Z) * 0.625]} />
          <meshBasicMaterial map={assets.plate} transparent alphaTest={0.02} toneMapped={false} />
        </mesh>
        {/* paintings */}
        {FRAMES.map((fr, i) => {
          const k = (D0 - fr.z) / D0;
          const w = fr.w * visW * D0 * k;
          return (
            <mesh key={i} position={[(fr.sx - 0.5) * visW * D0 * k, (0.5 - fr.sy) * visH * D0 * k, fr.z]}>
              <planeGeometry args={[w, w / fr.aspect]} />
              <meshBasicMaterial map={assets.frames[i]} transparent alphaTest={0.02} toneMapped={false} />
            </mesh>
          );
        })}
      </group>
      <CameraRig dist={dist} roll={roll} x={camX} />
    </>
  );
};

const CameraRig: React.FC<{ dist: number; roll: number; x: number }> = ({ dist, roll, x }) => {
  const camera = useThree((s) => s.camera);
  useMemo(() => {
    camera.position.set(x, 0, dist);
    camera.rotation.set(0, 0, (roll * Math.PI) / 180);
    camera.updateProjectionMatrix();
  }, [camera, dist, roll, x]);
  return null;
};

export const S07: React.FC = () => {
  useFonts47();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #26221c 0%, #2c261e 66%, #4a3a28 76%, #3a2c1c 100%)" }}>
      <ThreeCanvas width={VW} height={VH} camera={{ fov: FOV, position: [0, 0, D0], near: 0.1, far: 60 }}>
        <Scene f={f} />
      </ThreeCanvas>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};
