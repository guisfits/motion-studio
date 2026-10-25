import { AbsoluteFill } from "remotion";
import { Card, ACCENT, Piece, Plate, ramp, useRefFrame } from "../lib/kit";
import paperUrl from "../assets/pd/P25-paper-mottled-ambientcg-Paper003.jpg";
import hogarthUrl from "../assets/pd/P03-hogarth-bedlam-wellcome.jpg";
import crowdUrl from "../assets/pd/P12-bedlam-chained-raving-mad-plate-V0049186.jpg";
import ruffUrl from "../assets/gen/P11-ruff-man-cut.png";
import violinUrl from "../assets/gen/P13b-violin-cut.png";

// Shots 11-14 (reference f405-552, 16.83-22.96 s): 11 ruff man static, the yellow violin slides in from
// the right edge (f405-415); 12 jester in the paper cone (f417-436); 13 the fiddler, the same yellow
// violin swaying +-5 deg on a 1 s period, slow pull-out 1.0 -> 0.93 (f437-494); 14 onlookers, rack focus
// 25 px -> 0 (f495-499), push 1.0 -> 1.12, a small yellow tick at f517. Local t = reference frame - 405.
// Jester, fiddler and onlookers are crops of the Hogarth and "chained raving mad" plates (small source).

const HOG = 1600 / 1397;
const CROWD = 1600 / 1333;

export const B08: React.FC = () => {
  const t = useRefFrame();
  if (t < 12) {
    return (
      <Card paper={paperUrl} tone="#8d8d8a">
        <Piece src={ruffUrl} x={40} y={55} w={108} />
        <Piece src={violinUrl} x={ramp(t, 0, 10, 130, 86, "out")} y={46} w={46} tint={1} />
      </Card>
    );
  }
  if (t < 32) return <Plate src={hogarthUrl} aspect={HOG} crop={[0.865, 0.325, 0.12, 0.16]} />;
  if (t < 90) {
    // The pull-out widens the crop instead of scaling the layer, so it never runs off the plate.
    const s = ramp(t, 32, 89, 1, 0.93);
    const [cw, ch] = [0.2 / s, 0.33 / s];
    const sway = 5 * Math.sin(((t - 32) / 24) * 2 * Math.PI);
    return (
      <AbsoluteFill>
        <Plate src={hogarthUrl} aspect={HOG} crop={[0.835 - cw / 2, 0.565 - ch / 2, cw, ch]} />
        <div style={{ position: "absolute", inset: 0, transform: `scale(${s})` }}>
          <Piece src={violinUrl} x={30} y={42} w={50} tint={1} rot={sway} />
        </div>
      </AbsoluteFill>
    );
  }
  const tick = t >= 112;
  return (
    <AbsoluteFill style={{ transform: `scale(${ramp(t, 94, 147, 1, 1.12)})` }}>
      <Plate src={crowdUrl} aspect={CROWD} crop={[0.6, 0.18, 0.4, 0.55]} blur={ramp(t, 90, 94, 25, 0)} />
      {tick ? <div style={{ position: "absolute", left: "36%", top: "27%", width: 88, height: 16, backgroundColor: ACCENT, transform: "rotate(48deg)" }} /> : null}
    </AbsoluteFill>
  );
};
