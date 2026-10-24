import { AbsoluteFill, Img, useCurrentFrame } from "remotion";
import wallUrl from "../assets/gen/a1214-wall.png";
import frameUrl from "../assets/gen/s11-frame-cut.png";
import starry from "../assets/pd/starry-night.jpg";
import { H, LILITA, W, useShotFonts } from "../lib/s12-16-kit";
import { Pillar } from "../lib/s12-16-pillar";
import { Rope } from "../lib/s12-14-rope";

// S14 (433-457): Starry Night in a gilt frame on a stone museum wall, red velvet rope on brass stanchions
// below, "THE STARRY NIGHT" typed between them. Measured on the reference (full-res frames, native px):
// frame box 940 x 756 centred at (540, 958); opening 664 x 500; rope hooks at x 80/960, y 1530, sag 280;
// text spans ~87 % W at y 1436. The camera sits still, then punches in over the last 9 frames to x1.10.

const FROM = 433;
// Horizontal slide of the camera as the whip pan lands (reference tx per local frame, native px; content
// starts shifted right and glides back, ease-out): offset[f] = what is still to travel after frame f.
const TX = [0, 95.3, 42.4, 31, 24.4, 19, 15.9, 14.5, 12.1, 10.2, 8.9, 7.3, 6.8, 5.1, 4.3, 2.5, 2, 2.2, 1.5, 0.7, 0.3, 0.3, 0, 0];
const PAN = TX.map((_, i) => TX.slice(i + 1).reduce((a, b) => a + b, 0));
// zoom step per local frame in % (out/measure/ref/frames.csv, frames 433-456)
const ZSTEP = [0, 0.0023, -0.0137, -0.0307, 0.0027, 0.0592, 0.0369, 0.0211, 0.0711, 0.077, 0.0379, 0.0164, 0.0126, 0.0289, 0.0522, 0.1773, 0.2339, 0.2619, 0.399, 0.5774, 0.7888, 1.1343, 1.7277, 4.5183];
const SCALE: number[] = ZSTEP.reduce<number[]>((acc, z, i) => [...acc, i === 0 ? 1 : acc[i - 1] * (1 + z / 100)], []);

// our frame art: box x 111-921, y 61-772 (810 x 711), opening x 224-807 / y 178-658 (583 x 480)
const FW = 1024;
const FH = 832;
const SX = 940 / 810;
const SY = 756 / 711;
const GoldFrame: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: 540 - (111 + 405) * SX,
      top: 958 - (61 + 355.5) * SY,
      width: FW,
      height: FH,
      transform: `scale(${SX}, ${SY})`,
      transformOrigin: "0 0",
    }}
  >
    <Img src={starry} style={{ position: "absolute", left: 214, top: 168, width: 600, height: 498, objectFit: "cover" }} />
    <Img src={frameUrl} style={{ position: "absolute", inset: 0, width: FW, height: FH, filter: "contrast(1.08) saturate(1.1)" }} />
  </div>
);

export const S14: React.FC = () => {
  useShotFonts();
  const frame = useCurrentFrame();
  const s = SCALE[Math.min(frame, SCALE.length - 1)];
  const textStyle: React.CSSProperties = {
    fontFamily: LILITA,
    fontSize: 80,
    letterSpacing: "0.07em",
    color: "#f0f0ee",
    textShadow: "0 -2px 0 #ffffff, 3px 4px 0 rgba(0,0,0,0.7)",
    whiteSpace: "pre",
  };
  // Reference: THE lands at local 4, STARRY fades in over local 6-9, NIGHT over 10-13 (letters blur-in).
  const words: [string, number][] = [["THE", 4], ["STARRY", 6], ["NIGHT", 10]];
  const title = (
    <span style={{ ...textStyle, display: "inline-block", transform: "scaleX(1.2)", transformOrigin: "50% 50%" }}>
      {words.map(([w, st], wi) => (
        <span key={w}>
          {wi ? " " : ""}
          {w.split("").map((c, i) => {
            const age = frame - (st + i * (wi === 0 ? 0.3 : 0.5));
            const o = Math.max(0, Math.min(1, age / 1.6));
            return (
              <span key={i} style={{ opacity: o, filter: `blur(${(1 - o) * 5}px)`, display: "inline-block", transform: `translateY(${(1 - o) * 8}px)` }}>{c}</span>
            );
          })}
        </span>
      ))}
    </span>
  );
  return (
    <AbsoluteFill style={{ background: "#6b6b5e", overflow: "hidden" }}>
      <AbsoluteFill style={{ transformOrigin: "50% 50%", transform: `scale(${s}) translateX(${PAN[Math.min(frame, PAN.length - 1)]}px)` }}>
        {[-1, 0].map((k) => (
          <Img key={k} src={wallUrl} style={{ position: "absolute", left: k * W, top: 0, width: W, height: H, transform: k ? "scaleX(-1)" : undefined, filter: "brightness(0.7) contrast(0.92) sepia(0.45) saturate(0.8) hue-rotate(-6deg)" }} />
        ))}
        {/* pool of gallery light on the wall behind the frame */}
        <div style={{ position: "absolute", left: 0, top: 380, width: W, height: 1200, background: "radial-gradient(ellipse 52% 50% at 50% 50%, rgba(255,236,190,0.16), rgba(0,0,0,0) 100%)" }} />
        {/* cast shadow of the frame, down and right */}
        <div style={{ position: "absolute", left: 540 - 470 + 26, top: 958 - 378 + 40, width: 940, height: 756, background: "rgba(0,0,0,0.62)", filter: "blur(22px)" }} />
        <GoldFrame />
        <div style={{ position: "absolute", left: 0, right: 0, top: 1436 - 64, textAlign: "center" }}>
          {title}
        </div>
        <Rope frame={frame} cx={W / 2} hookY={1520} />
        <div style={{ position: "absolute", left: 0, top: 1250, width: W, height: 670, background: "linear-gradient(180deg, rgba(0,0,0,0), rgba(10,8,4,0.38))", pointerEvents: "none" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 48%, rgba(0,0,0,0.3) 100%)" }} />
      <Pillar abs={FROM + frame} />
    </AbsoluteFill>
  );
};
