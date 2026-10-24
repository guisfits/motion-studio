import { AbsoluteFill, Img, useCurrentFrame } from "remotion";
import courtUrl from "../assets/gen/s13-court.png";
import painterUrl from "../assets/gen/s13-vg-easel-cut.png";
import { bigType, Cam, camAt, H, PopText, useShotFonts, W } from "../lib/s12-16-kit";
import { Pillar } from "../lib/s12-16-pillar";

// S13 (400-433): painter at an easel in a gothic court. Reference: AI video of a painter's arm.
// Here: the generated painter cut-out is rocked at the hip and its brush hand is a code-drawn
// brush that dabs the canvas (a Starry Night print laid over the generated easel canvas).
// Constant-velocity push 1.0 -> 1.4 panning toward the easel; type lives in the world so it grows.

const FROM = 400;
const CAM = [
  { f: 0, s: 1.0, x: 0.5, y: 0.5 },
  { f: 32, s: 1.4, x: 0.62, y: 0.45 },
];

export const S13: React.FC = () => {
  useShotFonts();
  const frame = useCurrentFrame();
  const cam = camAt(CAM, frame);
  // 16 fps painting loop: body leans in and out, stroke every 4 frames.
  const phase = (frame % 6) / 6;
  const lean = Math.sin(phase * Math.PI * 2) * 1.6;
  const horizon = frame * 0.2;
  const title = bigType(150);
  return (
    <AbsoluteFill style={{ background: "#8db4e6", overflow: "hidden" }}>
      <Cam cam={cam}>
        <Img src={courtUrl} style={{ position: "absolute", left: -120, top: -40 + horizon, width: W + 240, height: H + 80, objectFit: "cover" }} />
        <div style={{ position: "absolute", left: -209, top: 192, width: 1280, height: 1280, transform: `scaleX(-1) rotate(${-lean * 0.4}deg)`, transformOrigin: "50% 100%" }}>
          <Img src={painterUrl} style={{ width: "100%", height: "100%" }} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: H * 0.1, textAlign: "center", ...title }}>
          <div style={{ height: 134 }}>
            <PopText text="HIS" frame={frame} start={0} style={title} />
            {" "}
            <PopText text="OWN" frame={frame} start={2} per={1} style={title} />
          </div>
          <div style={{ height: 134, marginTop: 0 }}>
            <PopText text="STRUGGLES" frame={frame} start={3.5} per={0.55} style={title} />
          </div>
        </div>
      </Cam>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.25) 100%)" }} />
      <Pillar abs={FROM + frame} />
    </AbsoluteFill>
  );
};
