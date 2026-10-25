import { AbsoluteFill } from "remotion";
import { ACCENT, PAPER_GREY, ramp, useRefFrame } from "../lib/kit";
import { move, Stage, TintLayer, type Move } from "../lib/b10-12-stage";
import norrisUrl from "../assets/pd/P20-norris-cruikshank.jpg";

// Shot 12 (reference f759-920): 12a grey wall plate (f759-760), Norris slides in from the right (f761-767),
// push 1.00 -> 1.125 (f763-779) and on, a yellow disc grows on his face (f765-769) and leaves (f781-787);
// 12b fast accelerating push into the face (f823-840); 12c hard cut f841 to a 3x ankle crop with a yellow
// band drawing on; 12d pull-up from the chain/pole to wide, a yellow bar (the tinted pole) on the left f869-893.
// Frame time t: breakdown f = t + 759.

const ASPECT = 1600 / 1902;
const WIDE: [number, number, number, number] = [0.216, 0.048, 0.508, 0.76];
const ANKLE: [number, number, number, number] = [0.685, 0.59, 0.21, 0.314];
// The reference plate is a pale grey print; ours is darker, so lift it a little.
const LIFT = { filter: "brightness(1.3) contrast(0.85)" };
const FACE = { x: 47, y: 39 }; // source %
const POLE = "polygon(35% 3%, 39.5% 3%, 39.5% 44%, 35.5% 44%)";

// Wide-shot camera: slide-in, push 1.0 -> 1.125 (t 4-20), slow drift to t 63, then the fast push (t 64-81).
const wideCam = (t: number) => {
  const slide = ramp(t, 2, 8, 40, 0, "out");
  const slow = move(t, { f: [4, 63], s: [1, 1.3] });
  const fast: Move = { f: [64, 81], s: [1.3, 2.6], y: [0, 20], x: [0, -3], ease: "in" };
  const m = t < 64 ? slow : move(t, fast);
  return { s: m.s, transform: `translateX(${slide}%) ${m.transform}` };
};

const Disc: React.FC<{ t: number; s: number }> = ({ t, s }) => {
  // Radius in frame px: 15 -> ~20 % W at f765-769 (ease-out), shrinks and fades f781-787; source px = frame px / scale.
  const grow = ramp(t, 5, 10, 15, 216, "out");
  const leave = ramp(t, 22, 28, 1, 0);
  if (t < 6 || leave <= 0) return null;
  const r = (grow * (0.25 + 0.75 * leave)) / s;
  return <TintLayer src={norrisUrl} clip={`circle(${r}px at ${FACE.x}% ${FACE.y}%)`} opacity={0.95 * leave + 0.05} />;
};

export const B12: React.FC = () => {
  const t = useRefFrame();
  if (t < 82) {
    const cam = wideCam(t);
    return (
      <AbsoluteFill style={{ backgroundColor: PAPER_GREY }}>
        
        {t >= 2 ? (
          <Stage src={norrisUrl} aspect={ASPECT} crop={WIDE} transform={cam.transform} style={LIFT}>
            {() => <Disc t={t} s={cam.s} />}
          </Stage>
        ) : null}
      </AbsoluteFill>
    );
  }
  if (t < 106) {
    // Ankle at 3x, slow drift down; the band wipes on around it (closed band first, strap tail after).
    const cam = move(t, { f: [82, 105], s: [1, 1.06], y: [0, -4] });
    const draw = ramp(t, 82, 90, 0, 100, "out");
    return (
      <Stage src={norrisUrl} aspect={ASPECT} crop={ANKLE} transform={cam.transform}>
        {() => (
          <div style={{ position: "absolute", left: "74.2%", top: "73.6%", width: "7.4%", height: "3.4%", clipPath: `inset(0 ${100 - draw}% 0 0)` }}>
            <div style={{ position: "absolute", inset: 0, border: `16px solid ${ACCENT}`, borderRadius: "50%", mixBlendMode: "multiply", transform: "rotate(-6deg)" }} />
          </div>
        )}
      </Stage>
    );
  }
  // Pull-up from the chain (2.2x, head near the top) to the wide framing, ease-out over 56 f.
  const cam = move(t, { f: [106, 161], s: [2.2, 1], y: [-19, 0], ease: "out" });
  const bar = ramp(t, 110, 114, 0, 1) * ramp(t, 130, 134, 1, 0);
  return (
    <Stage src={norrisUrl} aspect={ASPECT} crop={WIDE} transform={cam.transform} style={LIFT}>
      {() => bar > 0 ? <TintLayer src={norrisUrl} clip={POLE} opacity={bar} /> : null}
    </Stage>
  );
};
