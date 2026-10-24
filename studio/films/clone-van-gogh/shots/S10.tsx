import { AbsoluteFill, Img, useCurrentFrame } from "remotion";
import { Easing } from "remotion";
import { HEIGHT, WIDTH } from "../scene";
import {
  F_LILITA,
  F_POPPINS,
  lerp,
  planeStyle,
  prog,
  useS0811Fonts,
  type Cam,
} from "../lib/s08-11-common";
import corridorUrl from "../assets/gen/s10-corridor.png";
import manUrl from "../assets/gen/s10-vg-back-cut.png";

// S10 (abs 317-347): Van Gogh from behind walks away down a corridor; the reference is an AI clip,
// rebuilt as: corridor plate (far, slow parallax), a wooden door that swings open (CSS 3D),
// the cut-out man (shrinks, drifts right, bobs and sways like a walk), the four words, a rack-focus
// blur in the last frames. LATER sits between wall and man for its first frames, then in front.

const K = 1.05;
const MAN_W = 768 * K;
const MAN_H = 1344 * K;
const FEET = { x: 390 * K, y: 1270 * K }; // pivot of the walk, inside the man image

const cam = (f: number): Cam => {
  const t = prog(f, 0, 30, Easing.inOut(Easing.quad));
  return { x: lerp(540, 540 + 22, t), y: lerp(960, 1000, t), zoom: lerp(1, 1.12, t), rotate: 0 };
};

type WordSpec = { text: string; at: number; per: number; x: number; y: number; size: number; font: string; weight?: number; opacity?: number };

const WORDS: WordSpec[] = [
  { text: "LATER", at: 1, per: 1, x: 0.53, y: 0.5, size: 250, font: F_LILITA, opacity: 0.92 },
  { text: "VOLUNTARILY", at: 15, per: 0.65, x: 0.36, y: 0.5, size: 64, font: F_POPPINS },
  { text: "ENTERED", at: 23, per: 0.5, x: 0.67, y: 0.3, size: 130, font: F_LILITA },
  { text: "THE", at: 27, per: 0.5, x: 0.285, y: 0.375, size: 120, font: F_LILITA },
];

// letters appear one by one (fade over 1.5 frames); LATER fades out f11-15
const Word: React.FC<{ w: WordSpec; f: number }> = ({ w, f }) => {
  const out = w.text === "LATER" ? 1 - prog(f, 11, 15, Easing.linear) : 1;
  return (
    <div
      style={{
        position: "absolute",
        left: w.x * WIDTH,
        top: w.y * HEIGHT,
        transform: "translate(-50%, -50%)",
        whiteSpace: "nowrap",
        fontFamily: `"${w.font}", sans-serif`,
        fontWeight: w.weight ?? 400,
        fontSize: w.size,
        lineHeight: 1,
        color: "#fff",
        textShadow: "0 4px 18px rgba(0,0,0,0.45)",
        opacity: out * (w.opacity ?? 1),
      }}
    >
      {[...w.text].map((ch, i) => {
        const a = Math.min(1, Math.max(0, (f - w.at - i * w.per) / 1.5));
        return (
          <span key={i} style={{ opacity: a }}>
            {ch}
          </span>
        );
      })}
    </div>
  );
};

export const S10: React.FC = () => {
  useS0811Fonts();
  const f = useCurrentFrame();
  const c = cam(f);

  // door: closed at f0 (fills the left of the frame), swings away by f9, stays as a dark sliver
  const door = prog(f, 0, 9, Easing.inOut(Easing.cubic));
  // walk: cx drifts right, shrinks about his feet; step bounce 8-frame cycle, sway 16-frame cycle
  const cx = lerp(0.3, 0.45, prog(f, 0, 10, Easing.out(Easing.cubic))) + prog(f, 10, 30, Easing.linear) * 0.05;
  const scale = lerp(1.0, 0.84, prog(f, 0, 30, Easing.linear));
  const bounce = Math.abs(Math.sin((f / 8) * Math.PI)) * -14;
  const sway = Math.sin((f / 16) * Math.PI * 2) * 1.4;
  const manX = cx * WIDTH - 410 * K;
  const manY = 342;

  // rack focus into the keyhole: the whole shot defocuses over the last 3 frames
  const blur = f >= 28 ? [0, 0, 4, 9, 14][Math.min(4, f - 26)] ?? 0 : 0;
  const manBehindText = f < 5;

  const man = (
    <div style={planeStyle(c, 1)}>
      <Img
        src={manUrl}
        style={{
          position: "absolute",
          left: manX,
          top: manY + bounce,
          width: MAN_W,
          height: MAN_H,
          transformOrigin: `${FEET.x}px ${FEET.y}px`,
          transform: `scale(${scale}) rotate(${sway}deg)`,
          filter: "brightness(0.82) contrast(1.05)",
        }}
      />
    </div>
  );
  const words = WORDS.filter((w) => f >= w.at).map((w) => <Word key={w.text} w={w} f={f} />);

  return (
    <AbsoluteFill style={{ background: "#14120d", overflow: "hidden" }}>
      <AbsoluteFill style={{ filter: blur ? `blur(${blur}px)` : undefined }}>
        <div style={planeStyle(c, 0.6)}>
          <Img
            src={corridorUrl}
            style={{ position: "absolute", left: -238, top: -922, width: 1642, height: 2918, filter: "blur(2px) brightness(0.9)" }}
          />
        </div>
        <div style={{ ...planeStyle(c, 1), perspective: 1500 }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 580,
              height: HEIGHT,
              transformOrigin: "0 50%",
              transform: `rotateY(${door * 82}deg)`,
              background:
                "repeating-linear-gradient(90deg, #3b2d1b 0px, #3b2d1b 96px, #20180d 98px, #3b2d1b 102px)",
              boxShadow: "inset 0 0 120px rgba(0,0,0,0.8)",
            }}
          />
        </div>
        {manBehindText ? (
          <>
            {words}
            {man}
          </>
        ) : (
          <>
            {man}
            {words}
          </>
        )}
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.6) 100%)" }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
