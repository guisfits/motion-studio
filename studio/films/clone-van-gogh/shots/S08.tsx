import { AbsoluteFill, Img, useCurrentFrame } from "remotion";
import { HEIGHT } from "../scene";
import { F_MONTSERRAT, lerp, planeStyle, prog, useS0811Fonts, type Cam } from "../lib/s08-11-common";
import { cameraAt, type CamKey } from "../../../../src/camera";
import { FPS } from "../scene";
import studioUrl from "../assets/gen/s08-studio.png";
import gauguinUrl from "../assets/gen/s08-gauguin-cut.png";
import vgUrl from "../assets/gen/s08-vg-cut.png";

// S08 (abs 234-288): Gauguin argument. The reference is an AI video clip; AI video is banned here,
// so it is rebuilt as layers: studio plate (far), Gauguin and Van Gogh as separate cut-outs that
// lean, sway and jab on their own clocks, and the camera push 1.0 -> 1.9 of the breakdown
// (wide on both, then onto Van Gogh). The yellow PAUL GAUGUIN tag rides on Gauguin's head.

const K = 1.22; // cut-out px -> world px (figure ~1500 px tall at zoom 1)
const G = { left: -252, top: 606, headX: 330, headTop: 69 }; // Gauguin image placement (world), head in image px
const V = { left: 140, top: 637 };
const IMG_W = 768 * K;
const IMG_H = 1344 * K;

// camera keys (world px at zoom 1; the frame shows 1080x1920 of it)
const KEYS: CamKey[] = [
  { frame: 0, x: 540, y: 1000, zoom: 1.0, ease: "glide" },
  { frame: 25, x: 330, y: 1060, zoom: 1.4, ease: "glide" },
  { frame: 36, x: 470, y: 1090, zoom: 1.6, ease: "glide" },
  { frame: 54, x: 619, y: 1134, zoom: 1.9 },
];

const cam = (f: number): Cam => {
  const c = cameraAt(KEYS, f, FPS);
  return { x: c.x, y: c.y, zoom: c.zoom, rotate: 0 };
};

export const S08: React.FC = () => {
  useS0811Fonts();
  const f = useCurrentFrame();
  const c = cam(f);

  // gestures: each figure turns about its feet, jabs along its facing, breathes; clocks differ so they do not lock
  const gRot = 1.6 * Math.sin(f * 0.62) + 1.1 * Math.sin(f * 1.7 + 1);
  const gJab = Math.max(0, Math.sin(f * 0.62 + 0.4)) ** 2 * 26;
  const gBob = 5 * Math.sin(f * 1.1);
  const vRot = -1.8 * Math.sin(f * 0.5 + 2) - 1.0 * Math.sin(f * 1.4);
  const vLean = prog(f, 20, 54) * -40; // he leans in toward Gauguin as the camera arrives
  const vBob = 6 * Math.sin(f * 0.95 + 1);

  // the tag: wipes in from f25 (pop 1.2 -> 1 in 2 frames), text revealed left to right over 10 frames
  const tagT = f - 25;
  const tagOn = tagT >= 0;
  const tagPop = lerp(1.2, 1, Math.min(1, Math.max(0, tagT / 2)));
  const tagWipe = Math.min(1, Math.max(0, (tagT + 1) / 10));

  return (
    <AbsoluteFill style={{ background: "#2a1612", overflow: "hidden" }}>
      <div style={planeStyle(c, 0.8)}>
        <Img
          src={studioUrl}
          style={{ position: "absolute", left: -260, top: 0, width: 1600, height: 1920, objectFit: "cover" }}
        />
      </div>
      <div style={planeStyle(c, 1)}>
        {/* Gauguin, behind Van Gogh */}
        <div
          style={{
            position: "absolute",
            left: G.left + gJab,
            top: G.top + gBob,
            width: IMG_W,
            height: IMG_H,
            transformOrigin: `${330 * K}px ${1000 * K}px`,
            transform: `rotate(${gRot}deg)`,
          }}
        >
          <Img src={gauguinUrl} style={{ position: "absolute", inset: 0, width: IMG_W, height: IMG_H }} />
          {tagOn && (
            <div
              style={{
                position: "absolute",
                left: G.headX * K - 130,
                top: G.headTop * K - 70,
                width: 260,
                height: 44,
                transform: `rotate(${-gRot + 1}deg) scale(${tagPop})`,
                clipPath: `inset(0 ${(1 - tagWipe) * 100}% 0 0)`,
                background: "#D9C82B",
                color: "#2A2C1C",
                fontFamily: `"${F_MONTSERRAT}", sans-serif`,
                fontWeight: 800,
                fontSize: 27,
                letterSpacing: 1,
                lineHeight: "44px",
                textAlign: "center",
                whiteSpace: "nowrap",
              }}
            >
              PAUL GAUGUIN
            </div>
          )}
        </div>
        {/* Van Gogh, in front */}
        <Img
          src={vgUrl}
          style={{
            position: "absolute",
            left: V.left + vLean,
            top: V.top + vBob,
            width: IMG_W,
            height: IMG_H,
            transformOrigin: `${496 * K}px ${1000 * K}px`,
            transform: `rotate(${vRot}deg)`,
          }}
        />
      </div>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.35) 100%)" }} />
      <div style={{ position: "absolute", left: 0, top: HEIGHT, width: 0, height: 0 }} />
    </AbsoluteFill>
  );
};
