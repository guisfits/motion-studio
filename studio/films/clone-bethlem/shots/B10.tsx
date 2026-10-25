import { AbsoluteFill, Img } from "remotion";
import { ramp, useRefFrame } from "../lib/kit";
import { move, Stage, TintLayer } from "../lib/b10-12-stage";
import norrisUrl from "../assets/pd/P20-norris-cruikshank.jpg";
import wardUrl from "../assets/pd/P12-bedlam-chained-raving-mad-plate-V0049186.jpg";
import bowlUrl from "../assets/gen/P18b-bowl-cut.png";

// Shot 10 (reference f595-706): 10a chained patient (the Norris plate stands in), push 1.00 -> 1.20 with dx -10 %,
// and the accent tint wipes down the harness straps f607-625; 10b the beaten, women cradling a head (f649-664,
// static + drift); 10c the starved: patient bust pulling out 1.5 -> 1.0, a yellow bowl slides in at f667.
// Frame time t: breakdown f = t + 595.

const NORRIS_ASPECT = 1600 / 1902;
const WARD_ASPECT = 1600 / 1333;
// Head-and-harness framing: patient's head at ~30 % of the frame height, shoulders ~80 % of its width.
const PATIENT: [number, number, number, number] = [0.27, 0.2065, 0.409, 0.611];
const WOMEN: [number, number, number, number] = [0.745, 0.36, 0.225, 0.48];

// Harness pieces in source %, clipped as separate polygons so the shirt between them stays grey.
const STRAPS = [
  "polygon(39.5% 46%, 43.5% 46%, 44% 55%, 43% 57.5%, 39% 57.5%)",
  "polygon(52.5% 46%, 55.5% 46.5%, 56% 54%, 55.5% 57%, 52.5% 54%)",
  "polygon(35.5% 56.3%, 55.5% 56.3%, 55.5% 59.5%, 35.5% 59.5%)",
];

const Patient: React.FC<{ t: number }> = ({ t }) => {
  // Wipe front sweeps down the harness f607-625 (t 12-30); its bottom edge is a moving clip.
  const wipe = ramp(t, 12, 30, 45, 61);
  const cam = move(t, { f: [0, 53], s: [1, 1.2], x: [0, -10] });
  return (
    <Stage src={norrisUrl} aspect={NORRIS_ASPECT} crop={PATIENT} transform={cam.transform}>
      {() => (
        <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 0 ${100 - wipe}% 0)` }}>
          {STRAPS.map((c) => <TintLayer key={c} src={norrisUrl} clip={c} />)}
        </div>
      )}
    </Stage>
  );
};

const Starved: React.FC<{ t: number }> = ({ t }) => {
  // Pull-out 1.5 -> 1.0 over f665-706; y compensates so the head stays in the upper third while scaled.
  const cam = move(t, { f: [70, 111], s: [1.5, 1], y: [12, 0] });
  // Bowl lands on the lap at f667, sliding up from below (ease-out), tinted.
  const slide = ramp(t, 71, 76, 10, 0, "out");
  return (
    <Stage src={norrisUrl} aspect={NORRIS_ASPECT} crop={PATIENT} transform={cam.transform}>
      {() => (
        <div style={{ position: "absolute", left: "44%", top: `${57 + slide}%`, width: "7.5%", opacity: t >= 72 ? 1 : 0 }}>
          <Img src={bowlUrl} style={{ width: "100%", display: "block", filter: "url(#accent)" }} />
        </div>
      )}
    </Stage>
  );
};

export const B10: React.FC = () => {
  const t = useRefFrame();
  if (t < 54) return <Patient t={t} />;
  if (t < 70) {
    // Static plate with a tiny drift so it never sits dead still.
    const cam = move(t, { f: [54, 69], x: [0, -2] });
    return <AbsoluteFill><Stage src={wardUrl} aspect={WARD_ASPECT} crop={WOMEN} transform={cam.transform} /></AbsoluteFill>;
  }
  return <Starved t={t} />;
};
