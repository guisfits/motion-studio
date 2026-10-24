import { AbsoluteFill, Img, interpolate, useCurrentFrame } from "remotion";
import deskUrl from "../assets/gen/s16-desk.png";
import folderUrl from "../assets/gen/s16-folder-cut.png";
import cafe from "../assets/pd/cafe-terrace.jpg";
import { CircleMark } from "../../../../src/type";
import { Cam, camAt, easeOut, H, ORBITRON, useShotFonts, W } from "../lib/s12-16-kit";

// S16 (492-554): walnut desk, manila folder that pops in with three plain "Ae" tiles, a red
// hand-drawn circle, then "{EARNEDITS.COM}" typed in over the folder. Internal benchmark only.

const URL_TEXT = "EARNEDITS.COM";
const CAM = [
  { f: 0, s: 1.0, x: 0.5, y: 0.5 },
  { f: 61, s: 1.04, x: 0.5, y: 0.5 },
];

const AeTile: React.FC<{ x: number; rot: number; lift: number }> = ({ x, rot, lift }) => (
  <div style={{ position: "absolute", left: x, top: -lift, width: 170, height: 170, borderRadius: 18, background: "linear-gradient(160deg,#2a2a96,#14145c)", boxShadow: "0 8px 18px rgba(0,0,0,0.5)", transform: `rotate(${rot}deg)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <span style={{ fontFamily: "Arial, Helvetica, sans-serif", fontWeight: 700, fontSize: 96, color: "#c9c9ff", letterSpacing: "-0.04em" }}>Ae</span>
  </div>
);

export const S16: React.FC = () => {
  useShotFonts();
  const frame = useCurrentFrame();
  const cam = camAt(CAM, frame);
  // folder pop: 11 % W -> 44 % W by local 6, 3 % overshoot, plus a 1 % pulse at the landing
  const t = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" });
  const sc = 0.25 + 0.75 * easeOut(t) + (frame >= 5 && frame <= 8 ? 0.03 * Math.sin(((frame - 5) / 3) * Math.PI) : 0);
  const cy = interpolate(frame, [0, 6], [0.53, 0.45], { extrapolateRight: "clamp" });
  const lift = interpolate(frame, [4, 11], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const n = Math.min(URL_TEXT.length, Math.max(0, Math.floor((frame - 29) / 1.75) + 1));
  const typing = frame >= 29;
  return (
    <AbsoluteFill style={{ background: "#5a2c18", overflow: "hidden" }}>
      <Cam cam={cam}>
        <Img src={deskUrl} style={{ position: "absolute", inset: 0, width: W, height: H, objectFit: "cover" }} />
        <div style={{ position: "absolute", left: -40, top: 20, width: 330, height: 260, transform: "rotate(-15deg)", padding: 18, boxSizing: "border-box", background: "linear-gradient(135deg,#d8b45a,#8c6120)", boxShadow: "8px 14px 20px rgba(0,0,0,0.5)" }}>
          <Img src={cafe} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div style={{ position: "absolute", left: W / 2, top: H * cy, transform: `translate(-50%,-50%) scale(${sc})`, width: W * 0.641, height: W * 0.641 * 0.8125 }}>
          <div style={{ position: "absolute", left: "17%", top: "12%", width: "76%", height: 0 }}>
            <AeTile x={0} rot={-8} lift={lift * 0.8} />
            <AeTile x={140} rot={0} lift={lift} />
            <AeTile x={280} rot={8} lift={lift * 0.8} />
          </div>
          <Img src={folderUrl} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", filter: "drop-shadow(0 12px 14px rgba(0,0,0,0.45))" }} />
        </div>
        {frame >= 10 && (
          <div style={{ position: "absolute", left: W / 2 - W * 0.26, top: H * 0.43 - H * 0.15, width: W * 0.52, height: H * 0.3 }}>
            <CircleMark at={1} lead={3} dur={10} color="#e02020" strokeWidth="9px" pad={0} seed="earn-folder" style={{ width: "100%", height: "100%", display: "block" }} />
          </div>
        )}
        {typing && (
          <div style={{ position: "absolute", left: 0, right: 0, top: H * 0.46 - 62, textAlign: "center", fontFamily: ORBITRON, fontWeight: 900, fontSize: 90, color: "#f2f2f2", textShadow: "2px 3px 0 rgba(0,0,0,0.7)", WebkitTextStroke: "3px rgba(10,10,10,0.85)", paintOrder: "stroke fill", whiteSpace: "nowrap" }}>
            <span style={{ color: "#27d13a" }}>{"{"}</span>
            {URL_TEXT.slice(0, n)}
            <span style={{ color: "#fff" }}>{"}"}</span>
          </div>
        )}
      </Cam>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 40% 35%, transparent 40%, rgba(0,0,0,0.5) 100%)" }} />
    </AbsoluteFill>
  );
};
