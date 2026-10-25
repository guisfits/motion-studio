import { AbsoluteFill } from "remotion";
import { ramp, useRefFrame } from "../lib/kit";
import { move, Stage } from "../lib/b10-12-stage";
import constablesUrl from "../assets/gen/P19-constables.png";

// Shot 11 (reference f707-758): 11a constable 1 with the notebook, a soft light beam rotating out of his hand,
// push 1.0 -> 1.15 (f707-730); hard cut f731 to constable 2 reading the sheet; swap f747 to the lantern man.
// The caption bar is film-level. Frame time t: breakdown f = t + 707.

const ASPECT = 1088 / 1920;
const NOTEBOOK: [number, number, number, number] = [0.36, 0.0, 0.64, 0.645];
const SHEET: [number, number, number, number] = [0.4, 0.04, 0.58, 0.584];
const LANTERN: [number, number, number, number] = [0.0, 0.06, 0.58, 0.584];

/** Screen-blended soft cone out of (x, y) in source %, `angle` deg clockwise from pointing right. */
const Beam: React.FC<{ x: number; y: number; angle: number; k: number; iw: number }> = ({ x, y, angle, k, iw }) => (
  <div style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: 0, height: 0, mixBlendMode: "screen", opacity: k }}>
    <div
      style={{
        position: "absolute", left: 0, top: -iw * 0.16, width: iw * 0.85, height: iw * 0.32, transformOrigin: "0 50%", transform: `rotate(${angle}deg)`,
        clipPath: "polygon(0 49%, 100% 8%, 100% 92%, 0 51%)",
        background: "linear-gradient(90deg, rgba(255,255,235,0.95), rgba(255,255,235,0.35) 55%, rgba(255,255,235,0))", filter: "blur(10px)",
      }}
    />
  </div>
);

// The reference wall is a mid grey; the plate is pale paper, so a multiply veil brings it down.
const Veil: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill>{children}<AbsoluteFill style={{ backgroundColor: "rgb(175,175,178)", mixBlendMode: "multiply" }} /></AbsoluteFill>
);

export const B11: React.FC = () => {
  const t = useRefFrame();
  if (t < 24) {
    const cam = move(t, { f: [0, 23], s: [1, 1.15] });
    return (
      <Veil><Stage src={constablesUrl} aspect={ASPECT} crop={NOTEBOOK} transform={cam.transform}>
        {({ iw }) => <Beam x={58} y={41} angle={ramp(t, 0, 23, 12, 52)} k={ramp(t, 0, 4, 0, 0.9)} iw={iw} />}
      </Stage></Veil>
    );
  }
  if (t < 40) {
    const cam = move(t, { f: [24, 39], s: [1, 1.06] });
    return <Veil><Stage src={constablesUrl} aspect={ASPECT} crop={SHEET} transform={cam.transform} /></Veil>;
  }
  const cam = move(t, { f: [40, 51], s: [1, 1.06] });
  return <Veil><Stage src={constablesUrl} aspect={ASPECT} crop={LANTERN} transform={cam.transform} /></Veil>;
};
