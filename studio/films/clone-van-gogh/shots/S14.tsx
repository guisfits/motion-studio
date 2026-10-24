import { AbsoluteFill, Img, useCurrentFrame } from "remotion";
import brickUrl from "../assets/gen/s14-brick.png";
import ropeUrl from "../assets/gen/s14-rope-cut.png";
import starry from "../assets/pd/starry-night.jpg";
import { Cam, camAt, easeOut, H, LILITA, PopText, useShotFonts, W } from "../lib/s12-16-kit";
import { Pillar } from "../lib/s12-16-pillar";

// S14 (433-457): Starry Night hung in a gallery, velvet rope below, caption typed. The pillar of
// the sweep is still on the first frames (it cuts under the bar).

const FROM = 433;
const CAM = [
  { f: 0, s: 1.0, x: 0.5, y: 0.5 },
  { f: 24, s: 1.2, x: 0.5, y: 0.5 },
];

const GoldFrame: React.FC = () => (
  <div style={{ position: "absolute", left: W * 0.14, top: H * 0.5 - 380, width: W * 0.72, height: 760, padding: 38, boxSizing: "border-box", background: "linear-gradient(135deg,#f0cd6a,#b6842b 40%,#e2b650 60%,#8c6120)", borderRadius: 14, boxShadow: "0 30px 60px rgba(0,0,0,0.7), inset 0 0 0 6px rgba(90,58,10,0.6)" }}>
    <Img src={starry} style={{ width: "100%", height: "100%", objectFit: "cover", boxShadow: "inset 0 0 0 3px #3a2810" }} />
  </div>
);

export const S14: React.FC = () => {
  useShotFonts();
  const frame = useCurrentFrame();
  const cam = camAt(CAM, frame, easeOut);
  const sway = Math.sin(frame * 0.5) * 1;
  const style = { fontFamily: LILITA, fontSize: 84, color: "#fff", textShadow: "3px 4px 0 rgba(0,0,0,0.65)", whiteSpace: "pre" as const };
  return (
    <AbsoluteFill style={{ background: "#6b6b5e", overflow: "hidden" }}>
      <Cam cam={cam}>
        <Img src={brickUrl} style={{ position: "absolute", left: -40, top: -40, width: W + 80, height: H + 80, objectFit: "cover" }} />
        <div style={{ position: "absolute", left: W * 0.05, top: H * 0.12, width: W * 0.9, height: 700, background: "radial-gradient(ellipse at 50% 50%, rgba(255,240,200,0.28), transparent 70%)" }} />
        <GoldFrame />
      </Cam>
        <div style={{ position: "absolute", left: 0, top: H * 0.74, width: W, height: 340, transform: `rotate(${sway}deg)`, transformOrigin: "50% 0" }}>
          <Img src={ropeUrl} style={{ width: "100%", height: "100%", objectFit: "fill" }} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: H * 0.75 - 50, textAlign: "center" }}>
          <PopText text="THE STARRY NIGHT" frame={frame} start={3} per={0.8} style={{ ...style, fontSize: 72 + frame * 0.9 }} />
        </div>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 35%, rgba(0,0,0,0.6) 100%)" }} />
      <Pillar abs={FROM + frame} />
    </AbsoluteFill>
  );
};
