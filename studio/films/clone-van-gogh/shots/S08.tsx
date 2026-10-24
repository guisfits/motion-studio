import { AbsoluteFill, Img, useCurrentFrame } from "remotion";
import { Puppet } from "../../../../src/rig";
import { bounce } from "../../../../src/physics";
import { F_MONTSERRAT, useS0811Fonts } from "../lib/s08-11-common";
import { figureParts } from "../lib/s08-figure";
import { joint, sway, type Beat } from "../lib/s08-rig";
import { PARTS as GP } from "../lib/s08b-gauguin-parts";
import { PARTS as VP } from "../lib/s08b-vg-parts";
import studioUrl from "../assets/gen/s08b-studio-ext.png";
import gTorso from "../assets/gen/s08b-gauguin-torso.png";
import gUaL from "../assets/gen/s08b-gauguin-ua_l.png";
import gFaL from "../assets/gen/s08b-gauguin-fa_l.png";
import gUaR from "../assets/gen/s08b-gauguin-ua_r.png";
import gFaR from "../assets/gen/s08b-gauguin-fa_r.png";
import vTorso from "../assets/gen/s08b-vg-torso.png";
import vUaL from "../assets/gen/s08b-vg-ua_l.png";
import vFaL from "../assets/gen/s08b-vg-fa_l.png";
import vUaR from "../assets/gen/s08b-vg-ua_r.png";
import vFaR from "../assets/gen/s08b-vg-fa_r.png";

// S08 (abs 234-288): Gauguin and Van Gogh argue in the studio. The reference is an AI video clip;
// here both men are jointed cut-outs (torso hinged at the hip, shoulder + elbow per arm) standing in
// one studio world. The camera is the measured path of the reference (per-frame scale and pan of
// motion-measure): a push to ~1.2, a pan back left onto Gauguin as his tag lands, then a pan right
// that reveals Van Gogh and a late push. Arm beats sit on the voice ("violent" f239, "argument"
// f247, "Paul" f262, "Gauguin" f266, "mutilated" f278) and ring out with spring overshoot.

const FPS = 16;
const W = 1080;
const H = 1920;
// measured camera, f234..f288 (scale, content shift in screen px)
const CS = [1, 1.049, 1.073, 1.101, 1.125, 1.146, 1.158, 1.166, 1.174, 1.181, 1.188, 1.196, 1.204, 1.207, 1.209, 1.212, 1.216, 1.218, 1.221, 1.222, 1.225, 1.226, 1.227, 1.229, 1.235, 1.251, 1.278, 1.271, 1.27, 1.269, 1.267, 1.267, 1.266, 1.267, 1.266, 1.268, 1.276, 1.285, 1.287, 1.29, 1.289, 1.292, 1.295, 1.301, 1.3, 1.304, 1.304, 1.31, 1.316, 1.326, 1.339, 1.359, 1.391, 1.433, 1.48];
const CX = [0, 0, -2, -1, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 3, 4, 7, 12, 20, 29, 45, 92, 173, 196, 210, 218, 224, 227, 228, 227, 223, 216, 204, 187, 157, 106, 51, -7, -44, -70, -91, -107, -121, -135, -145, -153, -160, -166, -171, -174, -181];
const CY = [0, 0, 0, -30, -52, -73, -73, -72, -71, -71, -73, -74, -76, -76, -76, -77, -78, -79, -80, -81, -80, -80, -81, -81, -81, -80, -82, -83, -83, -83, -83, -82, -83, -83, -83, -83, -83, -83, -82, -84, -85, -86, -86, -87, -86, -87, -87, -87, -87, -87, -86, -87, -87, -90, -96];
const at = (t: number[], f: number) => {
  const i = Math.max(0, Math.min(t.length - 1, f));
  const a = Math.floor(i);
  return t[a] + (t[Math.min(t.length - 1, a + 1)] - t[a]) * (i - a);
};

const K = 1.15; // cut-out px -> world px
const G_LEFT = -121;
const G_TOP = 430;
const V_LEFT = 340;
const V_TOP = 520;

const gParts = figureParts(GP, [384, 780], ["l", "r"], (n) => n);
const vParts = figureParts(VP, [384, 800], ["l", "r"], (n) => n);
const gImages = { torso: gTorso, ua_l: gUaL, fa_l: gFaL, ua_r: gUaR, fa_r: gFaR };
const vImages = { torso: vTorso, ua_l: vUaL, fa_l: vFaL, ua_r: vUaR, fa_r: vFaR };

const b = (at: number, to: number, hz = 2.8, damping = 0.3): Beat => ({ at, to, hz, damping });
// an arm that rests bent in toward the body: every beat is offset by its rest angle
const off = (beats: Beat[], d: number): Beat[] => beats.map((x) => ({ ...x, to: x.to + d }));

// Gauguin (image space, mirrored on screen): the pointing arm (l) jabs at Van Gogh, the open hand (r) pleads.
const G_UA_L = [b(3, 5), b(9, -9), b(15, 7), b(21, -6), b(27, 9), b(33, -4), b(40, 8), b(46, -5)];
const G_FA_L = [b(4, -10), b(10, 6), b(16, -12), b(22, 4), b(28, -14), b(34, 2), b(41, -10), b(47, 4)];
const G_UA_R = off([b(6, -16, 2.4), b(14, 8, 2.4), b(24, -14, 2.4), b(32, 10, 2.4), b(43, -12, 2.4)], 16);
const G_FA_R = off([b(7, 22, 2.4), b(15, -8, 2.4), b(25, 20, 2.4), b(33, -6, 2.4), b(44, 18, 2.4)], 24);
// Van Gogh: the near hand (l) answers, the far hand (r) opens wide.
const V_UA_L = [b(10, -12), b(18, 8), b(28, -14), b(38, 10), b(46, -12), b(52, 4)];
const V_FA_L = [b(11, 16), b(19, -10), b(29, 18), b(39, -8), b(47, 14), b(53, -2)];
const V_UA_R = off([b(13, 14, 2.4), b(23, -10, 2.4), b(34, 16, 2.4), b(44, -8, 2.4)], 22);
const V_FA_R = off([b(14, -16, 2.4), b(24, 8, 2.4), b(35, -18, 2.4), b(45, 8, 2.4)], 26);

export const S08: React.FC = () => {
  useS0811Fonts();
  const f = useCurrentFrame();
  const S = at(CS, f);
  const tx = at(CX, f);
  const ty = at(CY, f);
  const plane = (d: number) =>
    `translate(${tx * d}px, ${ty * d}px) translate(${W / 2}px, ${H / 2}px) scale(${S ** d}) translate(${-W / 2}px, ${-H / 2}px)`;

  // whole-figure body: lean at the hip + weight shift, on their own clocks
  const gLean = joint(f, FPS, 0, [b(3, 3, 2, 0.4), b(27, 5, 2, 0.4)]) + sway(f, FPS, 1.1, 0.7);
  const gShift = 6 * Math.sin(f * 0.37) + 80 * bounce(f - 20, FPS, { hz: 1.6, damping: 0.5 });
  const vLean = joint(f, FPS, 0, [b(30, -4, 1.6, 0.45)]) + sway(f, FPS, 1.3, 0.55, 2);
  const vShift = -100 * bounce(f - 26, FPS, { hz: 1.4, damping: 0.5 }) + 5 * Math.sin(f * 0.43 + 1);

  const gPose = {
    torso: gLean,
    ua_l: joint(f, FPS, 0, G_UA_L),
    fa_l: joint(f, FPS, 0, G_FA_L),
    ua_r: joint(f, FPS, 16, G_UA_R),
    fa_r: joint(f, FPS, 24, G_FA_R),
  };
  const vPose = {
    torso: vLean,
    ua_l: joint(f, FPS, 0, V_UA_L),
    fa_l: joint(f, FPS, 0, V_FA_L),
    ua_r: joint(f, FPS, 22, V_UA_R),
    fa_r: joint(f, FPS, 26, V_FA_R),
  };

  // tag: lands f25 (pop 1.2 -> 1 in 2 f), wipes in over 10 f, rides Gauguin's head
  const tagT = f - 25;
  const tagPop = 1.2 - 0.2 * Math.min(1, Math.max(0, tagT / 2));
  const tagWipe = Math.min(1, Math.max(0, (tagT + 1) / 10));
  const headX = G_LEFT + (768 - 445) * K + gShift + gLean * 8;
  const headY = G_TOP + 170 * K;

  return (
    <AbsoluteFill style={{ background: "#2a1612", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, transformOrigin: "0 0", transform: plane(0.9) }}>
        <Img src={studioUrl} style={{ position: "absolute", left: -260, top: 0, width: W + 260, height: H }} />
      </div>
      <div style={{ position: "absolute", inset: 0, transformOrigin: "0 0", transform: plane(1) }}>
        <div style={{ position: "absolute", left: G_LEFT + gShift, top: G_TOP, width: 768 * K, height: 1344 * K, transform: "scaleX(-1)" }}>
          <Puppet parts={gParts} images={gImages} poseAt={() => gPose} stepFps={FPS} size={[768, 1344]} scale={K} />
        </div>
        <div style={{ position: "absolute", left: V_LEFT + vShift, top: V_TOP, width: 768 * K, height: 1344 * K }}>
          <Puppet parts={vParts} images={vImages} poseAt={() => vPose} stepFps={FPS} size={[768, 1344]} scale={K} />
        </div>
        {tagT >= 0 && (
          <div
            style={{
              position: "absolute",
              left: headX - 140,
              top: headY - 58,
              width: 280,
              height: 44,
              transform: `rotate(1deg) scale(${tagPop})`,
              clipPath: `inset(0 ${(1 - tagWipe) * 100}% 0 0)`,
              background: "#D9C82B",
              color: "#2A2C1C",
              fontFamily: `"${F_MONTSERRAT}", sans-serif`,
              fontWeight: 800,
              fontSize: 27,
              letterSpacing: 1,
              lineHeight: "44px",
              textAlign: "center",
              whiteSpace: "nowrap",
            }}
          >
            PAUL GAUGUIN
          </div>
        )}
      </div>
      <div style={{ position: "absolute", inset: 0, transformOrigin: "0 0", transform: plane(1.1), clipPath: "polygon(0 66%, 18% 66.5%, 38% 73%, 37% 100%, 0 100%)" }}>
        <Img src={studioUrl} style={{ position: "absolute", left: -260, top: 0, width: W + 260, height: H }} />
      </div>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.35) 100%)" }} />
    </AbsoluteFill>
  );
};
