import { AbsoluteFill, Img } from "remotion";
import { ACCENT, Card, Plate, Prism, ramp, useRefFrame } from "../lib/kit";
import paperUrl from "../assets/pd/P25-paper-fine-ambientcg-Paper001.jpg";
import towerUrl from "../assets/pd/P01-victoria-tower-rijks.jpg";
import menUrl from "../assets/gen/P02b-tophat-row-cut.png";

// Shot 1 (reference f1-88, 0.00-3.63 s): 1a white card with the empty bar (f1-4); 1b the Parliament
// plate swings in like a turned card and tilts up (f5-36); 1c a second tower plate, a row of top-hat
// men rises from the bottom (f37-43), the camera pushes (+7.5 %, dx -5 %), and the men turn yellow one
// by one from the centre out on "to watch" (f61-79).

const TOWER_ASPECT = 1920 / 1005;
// Left half of the stereo card, inside its yellow mount.
const LEFT_HALF: [number, number, number, number] = [0.05, 0.08, 0.42, 0.8];
// Per-man tint start (breakdown 3: 4th man f63, 3rd and 5th f69-71, all by f73, full by f79), centre first.
const MAN_TINT_F = [73, 69, 63, 63, 71];
const TINT_LEN = 8;

const Men: React.FC<{ t: number }> = ({ t }) => {
  // Rise f37-43 from below the frame to a baseline at ~60 % (ease-out), then drift up with the push 1.3x.
  // The reference frames the men waist-up and big: about four of five fit across.
  const rise = ramp(t, 36, 42, 55, 0, "out");
  const drift = ramp(t, 42, 87, 0, -2.5);
  return (
    <div style={{ position: "absolute", left: "-22%", width: "144%", top: `${50 + rise + drift}%` }}>
      <Img src={menUrl} style={{ width: "100%", display: "block", filter: "url(#mono)" }} />
      {MAN_TINT_F.map((f, i) => {
        const k = ramp(t, f - 1, f - 1 + TINT_LEN, 0, 1);
        if (k <= 0) return null;
        // Each man is one fifth of the row; his slice of the tinted copy fades in.
        const clip = `inset(0 ${100 - (i + 1) * 20}% 0 ${i * 20}%)`;
        return <Img key={i} src={menUrl} style={{ position: "absolute", inset: 0, width: "100%", filter: "url(#accent)", opacity: k, clipPath: clip }} />;
      })}
    </div>
  );
};

export const B01: React.FC = () => {
  const t = useRefFrame();
  if (t < 4) {
    // 1a: white card; the turned Parliament card's grey corner waits bottom-right.
    return (
      <Card paper={paperUrl} tone="#E6E6E3">
        <div style={{ position: "absolute", right: "-30%", bottom: "-22%", width: "70%", height: "40%", backgroundColor: "#8d8d8a", transform: "rotate(-30deg)" }} />
        <Prism side="right" k={1} />
      </Card>
    );
  }
  if (t < 36) {
    // 1b: the card swings from -30 deg to flat around its bottom-right corner (f5-11), then tilts up.
    const rot = ramp(t, 4, 10, -30, 0, "out");
    return (
      <Card paper={paperUrl} tone="#E6E6E3">
        {/* The card covers the top ~72 % of the frame; its lower edge runs a little oblique. */}
        <AbsoluteFill style={{ transform: `rotate(${rot}deg)`, transformOrigin: "100% 72%", clipPath: "polygon(0 0, 100% 0, 100% 70%, 0 74%)" }}>
          <Plate src={towerUrl} aspect={TOWER_ASPECT} crop={LEFT_HALF} cam={{ s: [1.18, 1.18], y: [6, -4], f: [10, 35] }} />
        </AbsoluteFill>
        <Prism side="right" k={1} drift={ramp(t, 4, 35, 0, 4)} />
      </Card>
    );
  }
  // 1c: tower plate pushes in while the men rise and tint.
  return (
    <AbsoluteFill style={{ backgroundColor: ACCENT }}>
      <AbsoluteFill style={{ transform: `scale(${ramp(t, 36, 78, 1, 1.075)}) translateX(${ramp(t, 36, 78, 0, -5)}%)` }}>
        <Plate src={towerUrl} aspect={TOWER_ASPECT} crop={[0.12, 0.06, 0.3, 0.62]} />
        <Men t={t} />
      </AbsoluteFill>
      <Prism side="left" k={0.8} drift={ramp(t, 36, 87, 0, 5)} />
    </AbsoluteFill>
  );
};
