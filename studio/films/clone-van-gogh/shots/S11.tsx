import { AbsoluteFill, Img, useCurrentFrame } from "remotion";
import { Easing } from "remotion";
import { HEIGHT, WIDTH } from "../scene";
import { F_LORA, lerp, planeStyle, prog, useS0811Fonts, type Cam } from "../lib/s08-11-common";
import plateUrl from "../assets/gen/s10-keyhole-plate.png";
import frameUrl from "../assets/gen/s11-frame-cut.png";
import brushUrl from "../assets/gen/s11-brush-cut.png";
import paintingUrl from "../assets/pd/saint-remy.jpg";

// S11 (abs 348-374): the keyhole zoom-through (local 0-12) and the green mat with the framed asylum
// painting. The keyhole plate scales about the hole's centre on a geometric ramp while the mat scene
// behind it settles 0.8x -> 1x and defocuses -> sharp; from local 6 the plate splits into two halves
// that slide outward and fade. The mat is code (gradient + grid), the frame a cut-out with its magenta
// inside keyed out (lib/s08-11-post.py) so the painting shows through.

const HOLE = { x: 433, y: 781 }; // keyhole centre inside the 864x1536 plate
const HOLE_SCREEN = { x: WIDTH / 2, y: HEIGHT * 0.45 };

// plate scale per local frame (1 = 864 px wide): hole 21 % W at f0, 36 % W at f2, then past the frame
const PLATE_S = [0.8, 1.1, 1.47, 1.9, 2.4, 3.1, 4.0, 5.2, 6.8, 8.8, 11.5, 15, 20];
const plateScale = (f: number) => {
  const i = Math.min(PLATE_S.length - 1, Math.floor(f));
  const a = PLATE_S[i];
  const b = PLATE_S[Math.min(PLATE_S.length - 1, i + 1)];
  return a * (b / a) ** (f - i);
};

const cam = (f: number): Cam => {
  const t = prog(f, 12, 26, Easing.inOut(Easing.quad));
  return { x: lerp(540, 540 - 22, t), y: lerp(960, 960, t), zoom: lerp(1, 1.12, t), rotate: 0 };
};

type Brush = { x: number; y: number; rot: number; flip?: boolean; w?: number };
const BRUSHES: Brush[] = [
  { x: 20, y: 330, rot: 62, w: 820 },
  { x: 30, y: 1560, rot: -35, w: 880 },
  { x: 1070, y: 420, rot: 112, flip: true, w: 780 },
  { x: 1050, y: 1700, rot: -128, flip: true, w: 860 },
  { x: 940, y: 1780, rot: -68, w: 700 },
];

const Mat: React.FC<{ f: number }> = ({ f }) => {
  const c = cam(f);
  const frameTilt = lerp(1.5, -0.5, prog(f, 12, 26, Easing.linear));
  const FW = 700;
  const FH = 930;
  // rotated 90 deg: the landscape frame image becomes portrait; inner opening ~ 68 % x 72 % of it
  return (
    <>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, #46a85f 0%, #3a9a55 45%, #27793f 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(150,215,160,0.22) 2px, transparent 2px), linear-gradient(90deg, rgba(150,215,160,0.22) 2px, transparent 2px), linear-gradient(rgba(150,215,160,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(150,215,160,0.1) 1px, transparent 1px)",
          backgroundSize: "108px 108px, 108px 108px, 21.6px 21.6px, 21.6px 21.6px",
          backgroundPosition: `${-c.x * 0.2}px ${-c.y * 0.2}px`,
        }}
      />
      <div style={planeStyle(c, 1)}>
        <div
          style={{
            position: "absolute",
            left: 540 - FW / 2,
            top: 940 - FH / 2,
            width: FW,
            height: FH,
            transform: `rotate(${frameTilt}deg)`,
            filter: "drop-shadow(0 18px 22px rgba(0,0,0,0.45))",
          }}
        >
          <Img
            src={paintingUrl}
            style={{ position: "absolute", left: FW * 0.14, top: FH * 0.12, width: FW * 0.72, height: FH * 0.76, objectFit: "cover" }}
          />
          <Img
            src={frameUrl}
            style={{
              position: "absolute",
              left: (FW - FH) / 2,
              top: (FH - FW) / 2,
              width: FH,
              height: FW,
              transform: "rotate(90deg) scale(1.0)",
              objectFit: "fill",
            }}
          />
        </div>
      </div>
      <div style={planeStyle(c, 1.15)}>
        {BRUSHES.map((b, i) => (
          <Img
            key={i}
            src={brushUrl}
            style={{
              position: "absolute",
              left: b.x - (b.w ?? 800) / 2,
              top: b.y - ((b.w ?? 800) * 0.625) / 2,
              width: b.w ?? 800,
              transform: `rotate(${b.rot + Math.sin(f / 5 + i) * 1.5}deg) scaleX(${b.flip ? -1 : 1})`,
              filter: "drop-shadow(8px 12px 10px rgba(0,0,0,0.4))",
            }}
          />
        ))}
      </div>
      <Tag f={f} c={c} />
    </>
  );
};

// the chartreuse caption: its bar draws left to right (local 4-7), the text types on local 6-11
const TEXT = "Saint-Rémy asylum";
const Tag: React.FC<{ f: number; c: Cam }> = ({ f }) => {
  if (f < 4) return null;
  const bar = prog(f, 4, 7, Easing.linear);
  const typed = Math.round(prog(f, 6, 11, Easing.linear) * TEXT.length);
  const rot = lerp(-3, 1, prog(f, 4, 26, Easing.linear));
  const drift = prog(f, 12, 26, Easing.linear) * -22;
  return (
    <div
      style={{
        position: "absolute",
        left: 190 + drift,
        top: 596,
        width: 340,
        height: 76,
        transform: `rotate(${rot}deg)`,
        transformOrigin: "0 50%",
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: "#D6D82A", clipPath: `inset(0 ${(1 - bar) * 100}% 0 0)`, boxShadow: "0 6px 12px rgba(0,0,0,0.3)" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          paddingLeft: 18,
          lineHeight: "76px",
          fontFamily: `"${F_LORA}", serif`,
          fontWeight: 500,
          fontSize: 36,
          color: "#2E3A12",
          whiteSpace: "nowrap",
        }}
      >
        {TEXT.slice(0, typed)}
      </div>
    </div>
  );
};

export const S11: React.FC = () => {
  useS0811Fonts();
  const f = useCurrentFrame();

  const settle = prog(f, 0, 12, Easing.out(Easing.cubic));
  const sceneScale = lerp(0.8, 1, settle);
  const sceneBlur = lerp(12, 0, prog(f, 0, 10, Easing.linear));
  const s = plateScale(f);
  const split = prog(f, 6, 10, Easing.in(Easing.quad));
  const plateOn = f < 12;

  const plate = (clip: string, dx: number) => (
    <Img
      src={plateUrl}
      style={{
        position: "absolute",
        left: HOLE_SCREEN.x - HOLE.x,
        top: HOLE_SCREEN.y - HOLE.y,
        width: 864,
        height: 1536,
        transformOrigin: `${HOLE.x}px ${HOLE.y}px`,
        transform: `translateX(${dx}px) scale(${s})`,
        clipPath: clip,
        filter: f < 3 ? `blur(${lerp(10, 2, f / 3)}px)` : undefined,
        opacity: 1 - prog(f, 9, 12, Easing.linear),
      }}
    />
  );

  return (
    <AbsoluteFill style={{ background: "#2b8a48", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${sceneScale})`, filter: sceneBlur > 0.3 ? `blur(${sceneBlur}px)` : undefined }}>
        <Mat f={f} />
      </AbsoluteFill>
      {plateOn && (
        <AbsoluteFill style={{ background: f < 2 ? "#3a3126" : "transparent", opacity: f < 2 ? 1 : 0 }} />
      )}
      {plateOn && (
        <AbsoluteFill>
          {plate(`inset(0 ${(1 - 433 / 864) * 100}% 0 0)`, -split * 700)}
          {plate(`inset(0 0 0 ${(433 / 864) * 100}%)`, split * 700)}
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.3) 100%)" }} />
    </AbsoluteFill>
  );
};
