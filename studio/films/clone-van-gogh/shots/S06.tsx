import { AbsoluteFill, Img, useCurrentFrame } from "remotion";
import { F, GradText, H, Sprite, W, kf, tab, typed, useFonts47 } from "../lib/s04-07-kit";
import velvetUrl from "../assets/gen/a47-velvet.png";
import ornUrl from "../assets/gen/a47-orn-cut.png";
import brainUrl from "../assets/gen/a47-brain-top-cut.png";
import { throwIn } from "../../../../src/physics";

// Shot 6a/6b (local 0 = scene frame 181 = breakdown f182). Hard punch at local 16 (f197).
// Measured on the reference (motion-measure S06): the brain is THROWN in from the top-left and spins
// ~436 deg (positive steps, so it winds from -436 up to rest) while it lands (steps 161, 73, 53, 42, 34, 28, 24, 20 deg/f), and the velvet + ornaments
// whip sideways ~600 px on the first frame and decay to rest in ~5 frames. Then a static hold,
// a hard punch (x1.25 in one step) that settles, and a push that accelerates into the cut.
const PUNCH = 16;
const FPS = 16;
const BRAIN_ALPHA = 0.72; // visible fraction of the brain cut-out's width
const BRAIN_W = (0.6 * W) / BRAIN_ALPHA;
const ORN_W = 1 / 0.79;

// Camera cumulative scale per frame (reference frames 181-210).
const ZOOM = [1, 1.003, 1.002, 1.001, 1, 1.001, 1.001, 1.001, 1, 1, 1.002, 1.003, 1.005, 1.007, 1.009, 1.012, 1.018, 1.275, 1.308, 1.323, 1.331, 1.339, 1.344, 1.35, 1.356, 1.366, 1.379, 1.396, 1.421, 1.458, 1.564];
// Sideways whip of the whole set (px, content moves left) and its roll (deg), decaying to rest.
const WHIP_X = [800, 350, 170, 70, 30, 12, 4, 0];
const WHIP_ROT = [9, 5, 3, 1.6, 0.8, 0.3, 0, 0];

// Copper heart-ornaments: big one bottom-left with the eye, smaller ones at the right and top-left edges.
const ORNS = [
  { x: 0.3, y: 0.78, w: 0.68, r: 0, flip: false },
  { x: 1.02, y: 0.84, w: 0.3, r: -10, flip: true },
  { x: 0.0, y: 0.1, w: 0.26, r: 20, flip: false },
  { x: 1.0, y: 0.5, w: 0.2, r: 12, flip: true },
];

export const S06: React.FC = () => {
  useFonts47();
  const f = useCurrentFrame();
  const throwFrames = 3;
  // Thrown in from the top-left (the match cut with S05's falling brain), spinning 436 deg down to rest.
  const pose = throwIn(f, FPS, {
    from: { x: 0.12 * W, y: -0.02 * H, rotate: -436, scale: 1 },
    to: { x: 0.5 * W, y: 0.41 * H, rotate: 0, scale: 1 },
    frames: throwFrames,
    arc: 60,
    damping: 0.55,
  });
  const zoom = tab(ZOOM, f);
  const whipX = tab(WHIP_X, f);
  const whipR = tab(WHIP_ROT, f);
  const drift = (n: number) => 0.004 * H * Math.sin(f * 0.4 + n);

  const boxIn = f >= PUNCH;
  const boxScale = kf(f, [[PUNCH, 0.6], [PUNCH + 1, 1]]);
  const label = typed("REMAIN\nDEBATED", f, [[PUNCH, 0], [PUNCH + 1, 2], [PUNCH + 2, 4], [PUNCH + 5, 10], [PUNCH + 8, 14]]);

  return (
    <AbsoluteFill style={{ background: "#3B0A18", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "50% 50%" }}>
        <AbsoluteFill style={{ transform: `translateX(${whipX}px) rotate(${whipR}deg)`, filter: whipX > 20 ? `blur(${Math.min(8, whipX / 60)}px)` : undefined }}>
        <Img src={velvetUrl} style={{ position: "absolute", left: -0.8 * W, top: 0, width: 2.6 * W, height: H, objectFit: "cover", filter: "brightness(0.78) saturate(0.85) contrast(0.9)" }} />
        {ORNS.map((o, i) => (
          <Sprite key={i} src={ornUrl} x={o.x * W + 14 * Math.sin(f * 0.17 + i)} y={o.y * H + drift(i * 2)} w={o.w * W * ORN_W} rot={o.r + 3 * Math.sin(f * 0.13 + i)} flip={o.flip} style={{ filter: "drop-shadow(0 14px 16px rgba(0,0,0,0.55)) blur(2.4px) saturate(0.7) sepia(0.25) brightness(0.95)" }} />
        ))}
        </AbsoluteFill>
        <div style={{ position: "absolute", left: 0, width: W, top: 0.335 * H - 50 }}>
          <GradText text={typed("THOUGH THE", f, [[0, 0], [1, 1], [2, 3], [4, 6], [7, 10]])} size={100} top="#FFFFFF" bottom="#B4B4B4" />
        </div>
        <Sprite src={brainUrl} x={pose.x} y={pose.y} w={BRAIN_W * pose.scale} rot={pose.rotate} style={{ filter: "drop-shadow(0 18px 22px rgba(0,0,0,0.55)) brightness(0.72) saturate(0.8) contrast(0.92) blur(0.9px)" }} />
        <div style={{ position: "absolute", left: 0, width: W, top: 0.635 * H - 70 }}>
          <GradText text={typed("EXACT", f, [[3, 0], [4, 2], [5, 3], [7, 4], [8, 5]])} size={137} top="#FFFFFF" bottom="#A8A8A8" />
        </div>
        <div style={{ position: "absolute", left: 0, width: W, top: 0.69 * H - 20 }}>
          <GradText text={typed("DIAGNOSES", f, [[5, 0], [10, 9]])} size={74} top="#FFFFFF" bottom="#A8A8A8" />
        </div>
        {boxIn && (
          <div
            style={{
              position: "absolute",
              left: 0.5 * W - 0.15 * W,
              top: 0.52 * H - 0.035 * H,
              width: 0.3 * W,
              height: 0.07 * H,
              background: "#F5F5F0",
              borderRadius: 6,
              transform: `scale(${boxScale})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 18px rgba(0,0,0,0.45)",
            }}
          >
            <div style={{ fontFamily: `"${F.lilita}"`, fontSize: 60, lineHeight: 0.95, color: "#E4B924", whiteSpace: "pre", textAlign: "center" }}>{label}<span style={{ opacity: 0 }}>{"REMAIN\nDEBATED".slice(label.length)}</span></div>
          </div>
        )}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.45) 100%)" }} />
    </AbsoluteFill>
  );
};
