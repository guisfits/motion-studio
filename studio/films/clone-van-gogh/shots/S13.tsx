import { AbsoluteFill, Img, useCurrentFrame } from "remotion";
import { Puppet, solve } from "../../../../src/rig";
import courtUrl from "../assets/gen/s13b-court.png";
import easelUrl from "../assets/gen/s13b-easel-starry.png";
import torsoUrl from "../assets/gen/s13b-painter-torso.png";
import uaUrl from "../assets/gen/s13b-painter-ua_r.png";
import faUrl from "../assets/gen/s13b-painter-fa_r.png";
import { bigType, PopText, useShotFonts, W, H } from "../lib/s12-16-kit";
import { Pillar } from "../lib/s12-16-pillar";
import { figureParts } from "../lib/s08-figure";
import { PARTS } from "../lib/s13b-painter-parts";
import { Dab, strokeAngles, STROKE_F } from "../lib/s13-brush";

// S13 (400-433): Van Gogh paints Starry Night at an easel in a gothic court. The reference is an AI
// video clip; here the painter is a cut-out whose brush arm (shoulder + elbow, brush in the hand) is
// a rig part running a ~2.6 Hz stroke cycle with spring follow-through and wet-paint dabs where the
// brush lands, on a court plate. The camera is the reference's measured zoom path (1 -> 1.45)
// about the point (85 %, 57 %) of the frame, which is also what shifts the pair left as it grows.
// The type sits in the same world, so it grows with the push and the pillar sweep (S12-16 pillar)
// takes over at the end.

const FROM = 400;
const FPS = 16;
const CS = [1, 1.041, 1.077, 1.102, 1.118, 1.134, 1.147, 1.158, 1.167, 1.175, 1.181, 1.187, 1.192, 1.198, 1.204, 1.213, 1.223, 1.245, 1.286, 1.331, 1.362, 1.379, 1.388, 1.397, 1.402, 1.411, 1.417, 1.421, 1.426, 1.431, 1.435, 1.44, 1.447];
const camS = (f: number) => {
  const i = Math.max(0, Math.min(CS.length - 1, f));
  const a = Math.floor(i);
  return CS[a] + (CS[Math.min(CS.length - 1, a + 1)] - CS[a]) * (i - a);
};

const K = 0.69;
const P_LEFT = 185;
const P_TOP = 697;
const parts = figureParts(PARTS, [240, 760], ["r"], (n) => n);
const images = { torso: torsoUrl, ua_r: uaUrl, fa_r: faUrl };
// the brush tip in the forearm's own image, relative to its elbow hinge (px of the cut)
const TIP_FROM_ELBOW: [number, number] = [735 - 475, 271 - 435];
const REST_UA = 35; // upper arm hangs forward-down, forearm lifts: the bent painting pose
const REST_FA = -60;

export const S13: React.FC = () => {
  useShotFonts();
  const f = useCurrentFrame();
  const S = camS(f);
  const a = strokeAngles(f, FPS);
  const breathe = 0.7 * Math.sin(f * 0.5) + 0.4 * Math.sin(f * 1.3);
  const pose = { torso: breathe + 0.6 * a.dab, ua_r: REST_UA + a.ua, fa_r: REST_FA + a.fa };
  const placed = solve(parts, pose).fa_r;
  const ang = (placed.rotate * Math.PI) / 180;
  const BRUSH_TIP = {
    x: P_LEFT + K * (placed.x + TIP_FROM_ELBOW[0] * Math.cos(ang) - TIP_FROM_ELBOW[1] * Math.sin(ang)),
    y: P_TOP + K * (placed.y + TIP_FROM_ELBOW[0] * Math.sin(ang) + TIP_FROM_ELBOW[1] * Math.cos(ang)),
  };
  const title = bigType(150);
  const k = Math.floor(f / STROKE_F);
  const t = f - k * STROKE_F;
  const dabs = [k, k - 1].filter((n) => n >= 0).map((n) => ({
    n,
    t: f - n * STROKE_F - 1,
    x: BRUSH_TIP.x + 4 + ((n * 13) % 14),
    y: BRUSH_TIP.y + (((n * 29) % 90) - 40),
    hue: n % 3 === 0 ? "#f3d54a" : n % 3 === 1 ? "#5d8fe0" : "#cfe6ff",
  }));
  void t;

  return (
    <AbsoluteFill style={{ background: "#7fa7de", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, transformOrigin: `${W * 0.85}px ${H * 0.57}px`, transform: `scale(${S})` }}>
        <Img src={courtUrl} style={{ position: "absolute", left: 0, top: 140 + f * 0.2, width: W, height: H }} />
        <div style={{ position: "absolute", left: 0, top: 0, width: W, height: 160, background: "linear-gradient(#6f9bd8, #7fa7de)" }} />
        {/* contact shadows */}
        <div style={{ position: "absolute", left: 120, top: 1570, width: 330, height: 50, borderRadius: "50%", background: "rgba(10,30,5,0.45)", filter: "blur(10px)" }} />
        <div style={{ position: "absolute", left: 560, top: 1540, width: 300, height: 40, borderRadius: "50%", background: "rgba(10,30,5,0.4)", filter: "blur(10px)" }} />
        <Img src={easelUrl} style={{ position: "absolute", left: 504, top: 561, width: 768 * 0.52, height: 1344 * 0.76 }} />
        {dabs.map((d) => (
          <Dab key={d.n} x={d.x} y={d.y} t={d.t} hue={d.hue} />
        ))}
        <div style={{ position: "absolute", left: P_LEFT, top: P_TOP }}>
          <Puppet parts={parts} images={images} poseAt={() => pose} stepFps={FPS} size={[768, 1344]} scale={K} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: H * 0.1, textAlign: "center", ...title }}>
          <div style={{ height: 134 }}>
            <PopText text="HIS" frame={f} start={0} style={title} />
            {" "}
            <PopText text="OWN" frame={f} start={2} per={1} style={title} />
          </div>
          <div style={{ height: 134 }}>
            <PopText text="STRUGGLES" frame={f} start={3.5} per={0.55} style={title} />
          </div>
        </div>
      </div>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.25) 100%)" }} />
      <Pillar abs={FROM + f} />
    </AbsoluteFill>
  );
};
