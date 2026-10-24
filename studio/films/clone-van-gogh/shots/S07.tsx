import { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, cancelRender, continueRender, delayRender, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { CanvasTexture, DoubleSide, SRGBColorSpace } from "three";
import { EASE_IN, F, kf, useFonts47 } from "../lib/s04-07-kit";
import starryUrl from "../assets/pd/starry-night.jpg";
import rhoneUrl from "../assets/pd/rhone.jpg";
import wheatUrl from "../assets/pd/wheatfield.jpg";
import saintUrl from "../assets/pd/saint-remy.jpg";
import plateUrl from "../assets/gen/s07-plate-cut.png";

// Shot 7 (local 0 = scene frame 211 = breakdown f212): 1888 plate inside a ring of Roman numerals
// in real 3D; the camera dollies in while four framed paintings fly past at their own depths.

const NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
const VW = 1080;
const VH = 1920;
// Camera: vertical fov 40 deg; at distance D the frame shows (0.728 D) x (0.409 D) units.
const FOV = 40;
const D0 = 9;
const D1 = 5;
const RING_Y = 0.8;
const TILT = -1.0;
const RING_R = 1.45;
const GLYPH = 0.62;

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
  const b = Math.min(w, h) * 0.075;
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
  g.roundRect(150, 150, 724, 340, 14);
  g.fill();
  g.fillStyle = "#E8A21A";
  g.font = `400 300px "${F.lilita}"`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("1888", 512, 325);
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
      const [a, b, c, d, p] = await Promise.all([starryUrl, rhoneUrl, wheatUrl, saintUrl, plateUrl].map(loadImage));
      if (!alive) return;
      setAssets({
        sharp: NUMERALS.map((n) => numeralTexture(n, 0)),
        soft: NUMERALS.map((n) => numeralTexture(n, 9)),
        frames: [frameTexture(a, "rect", 512, 400), frameTexture(b, "round", 512, 512), frameTexture(c, "oval", 400, 640), frameTexture(d, "rect", 512, 400)],
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
  { sx: 0.22, sy: 0.12, w: 0.18, aspect: 400 / 512, z: -1.0 }, // starry night, rect, top-left
  { sx: 0.75, sy: 0.08, w: 0.14, aspect: 1, z: -2.0 }, // round medallion, top-right
  { sx: 0.18, sy: 0.78, w: 0.18, aspect: 640 / 400, z: 1.2 }, // tall oval, bottom-left
  { sx: 0.82, sy: 0.76, w: 0.18, aspect: 400 / 512, z: 0.3 }, // rect, bottom-right
];

const Scene: React.FC<{ f: number }> = ({ f }) => {
  const assets = useAssets();
  if (!assets) return null;
  const dist = kf(f, [[0, D0, EASE_IN], [8, D0 - 0.9], [22, D1]]);
  const roll = kf(f, [[0, 0], [22, 4]]);
  const ang = (-f * 4 * Math.PI) / 180;
  const visH = 2 * Math.tan((FOV / 2) * (Math.PI / 180));
  const visW = (visH * VW) / VH;

  return (
    <>
      <group position={[0, 0, 0]}>
        {/* ring */}
        <group position={[0, RING_Y, 0]} rotation={[TILT, 0, 0]}>
          <group rotation={[0, 0, ang]}>
            {NUMERALS.map((n, i) => {
              const th = (i / 12) * Math.PI * 2 + Math.PI / 2;
              const lx = RING_R * Math.cos(th);
              const ly = RING_R * Math.sin(th);
              // rotated + tilted position, to find how close to the camera it is
              const cx = lx * Math.cos(ang) - ly * Math.sin(ang);
              const cy = lx * Math.sin(ang) + ly * Math.cos(ang);
              const zw = cy * Math.sin(TILT);
              const yw = cy * Math.cos(TILT) + RING_Y;
              const dd = Math.hypot(cx, yw, dist - zw);
              const soft = Math.min(1, Math.max(0, (dist - 0.2 - dd) / 1.6 + 0.0));
              return (
                <group key={n} position={[lx, ly, 0]} rotation={[0, 0, th - Math.PI / 2]}>
                  <mesh>
                    <planeGeometry args={[GLYPH, GLYPH]} />
                    <meshBasicMaterial map={assets.sharp[i]} transparent opacity={1 - soft} alphaTest={0.02} side={DoubleSide} toneMapped={false} />
                  </mesh>
                  <mesh position={[0, 0, 0.001]}>
                    <planeGeometry args={[GLYPH, GLYPH]} />
                    <meshBasicMaterial map={assets.soft[i]} transparent opacity={soft} alphaTest={0.02} side={DoubleSide} toneMapped={false} />
                  </mesh>
                </group>
              );
            })}
          </group>
        </group>
        {/* 1888 plate at the ring centre */}
        <mesh position={[0, RING_Y, 0]}>
          <planeGeometry args={[(0.2 * visW * D0) * 1.0, (0.2 * visW * D0) * 0.625]} />
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
      <CameraRig dist={dist} roll={roll} />
    </>
  );
};

const CameraRig: React.FC<{ dist: number; roll: number }> = ({ dist, roll }) => {
  const camera = useThree((s) => s.camera);
  useMemo(() => {
    camera.position.set(0, 0, dist);
    camera.rotation.set(0, 0, (roll * Math.PI) / 180);
    camera.updateProjectionMatrix();
  }, [camera, dist, roll]);
  return null;
};

export const S07: React.FC = () => {
  useFonts47();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #2A2620 0%, #2A2620 62%, #4A3A28 100%)" }}>
      <ThreeCanvas width={VW} height={VH} camera={{ fov: FOV, position: [0, 0, D0], near: 0.1, far: 60 }}>
        <Scene f={f} />
      </ThreeCanvas>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};
