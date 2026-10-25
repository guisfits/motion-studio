import { AbsoluteFill, Img } from "remotion";
import { H, Plate, W, ramp, useRefFrame } from "../lib/kit";
import paulsUrl from "../assets/pd/P23-st-pauls-north-wellcome.jpg";
import norrisUrl from "../assets/pd/P20-norris-cruikshank.jpg";
import rowUrl from "../assets/gen/P02b-tophat-row-cut.png";
import dandyUrl from "../assets/gen/P08b-dandy-cut.png";

// Shot 14 (reference f1003-1088, 41.75-45.3 s): 14a St Paul's with top-hat men in front, push
// 1.00 -> 1.275 (f1003-1031); 14b/14c cut-out swaps at f1033 and f1043 with the scale reset to ~1.1;
// 14d hard cut at f1053 to Norris again, almost static (breakdown 27-28).

const ROW_ASPECT = 1065 / 788;
const PAULS_ASPECT = 1600 / 1247;
const HAT_TOP = 0.27; // hat tops sit at ~27 % of the frame height

// One man cut out of the five-man row, centred at x (% of frame), by his fifth of the row.
const RowMan: React.FC<{ i: number; x: number; k?: number }> = ({ i, x, k = 3.3 }) => {
  const wrapW = W * k;
  const wrapH = wrapW / ROW_ASPECT;
  return (
    <div style={{ position: "absolute", width: wrapW, height: wrapH, left: (W * x) / 100 - (i + 0.5) * 0.2 * wrapW, top: H * HAT_TOP, clipPath: `inset(0 ${100 - (i + 1) * 20}% 0 ${i * 20}%)` }}>
      <Img src={rowUrl} style={{ width: "100%", display: "block", filter: "url(#mono)" }} />
    </div>
  );
};

const Dandy: React.FC<{ x: number }> = ({ x }) => {
  const w = W * 0.86;
  return <Img src={dandyUrl} style={{ position: "absolute", width: w, left: (W * x) / 100 - w / 2, top: H * HAT_TOP, filter: "url(#mono)" }} />;
};

const Paul: React.FC<{ s0: number; s1: number; f0: number; f1: number; t: number; px: number; children: React.ReactNode }> = ({ s0, s1, f0, f1, t, px, children }) => (
  <AbsoluteFill style={{ overflow: "hidden", background: "linear-gradient(#d6d6d3 0 55%, #7d7d7b 100%)" }}>
    <AbsoluteFill style={{ transform: `scale(${ramp(t, f0, f1, s0, s1)})`, transformOrigin: "40% 45%" }}>
      <Img src={paulsUrl} style={{ position: "absolute", width: W * 1.4, height: (W * 1.4) / PAULS_ASPECT, left: px, top: 0, filter: "url(#mono)" }} />
      {children}
    </AbsoluteFill>
  </AbsoluteFill>
);

export const B14: React.FC = () => {
  const t = useRefFrame(); // 0 = f1003
  if (t >= 50) {
    return (
      <Plate src={norrisUrl} aspect={1600 / 1902} crop={[0.36, 0.3, 0.22, 0.329]} cam={{ s: [1, 1.025], f: [50, 85] }} />
    );
  }
  if (t >= 40) {
    return (
      <Paul s0={1.1} s1={1.14} f0={40} f1={49} t={t} px={-W * 0.55}>
        <RowMan i={0} x={14} />
        <RowMan i={2} x={52} />
        <RowMan i={4} x={92} />
      </Paul>
    );
  }
  if (t >= 30) {
    return (
      <Paul s0={1.1} s1={1.14} f0={30} f1={39} t={t} px={-W * 0.35}>
        <Dandy x={26} />
        <RowMan i={3} x={80} />
      </Paul>
    );
  }
  return (
    <Paul s0={1} s1={1.275} f0={0} f1={28} t={t} px={-W * 0.12}>
      <RowMan i={1} x={14} />
      <RowMan i={2} x={52} />
      <RowMan i={3} x={90} />
    </Paul>
  );
};
