import { AbsoluteFill, Img, useCurrentFrame } from "remotion";
import { EASE_OUT, F, GradText, H, Sprite, W, kf, typed, useFonts47 } from "../lib/s04-07-kit";
import velvetUrl from "../assets/gen/s06-velvet.png";
import ornUrl from "../assets/gen/s06-ornament-cut.png";
import brainUrl from "../assets/gen/s05-brain-gold-cut.png";

// Shot 6a/6b (local 0 = scene frame 181 = breakdown f182). Hard punch at local 16 (f198).
const PUNCH = 16;
const BRAIN_W = 0.5 * W * (832 / 641);
const ORN_W = 832 / 665;

// Gilt scrollwork ornaments, as the reference: big one bottom-left, smaller bottom-right, corners top-left and mid-right.
const ORNS = [
  { x: 0.22, y: 0.88, w: 0.64, r: -6, flip: false },
  { x: 0.99, y: 0.9, w: 0.42, r: -22, flip: true },
  { x: 0.0, y: 0.1, w: 0.32, r: 30, flip: false },
  { x: 1.0, y: 0.52, w: 0.22, r: 15, flip: true },
];

export const S06: React.FC = () => {
  useFonts47();
  const f = useCurrentFrame();
  // Match cut: the brain enters at the top where S05's fell out (x 45 %).
  const by = kf(f, [[0, -0.08 * H], [7, 0.4 * H, EASE_OUT], [8, 0.415 * H], [10, 0.4 * H]]);
  const bx = kf(f, [[0, 0.45 * W], [8, 0.5 * W]]);
  const brot = kf(f, [[0, 25], [7, 0, EASE_OUT]]);
  const zoom = f < PUNCH ? 1 : kf(f, [[PUNCH, 1.35], [29, 1.45]]);
  const drift = (n: number) => 0.01 * H * Math.sin(f * 0.4 + n);

  const boxIn = f >= PUNCH;
  const boxScale = kf(f, [[PUNCH, 0.6], [PUNCH + 1, 1]]);
  const label = typed("REMAIN\nDEBATED", f, [[PUNCH, 0], [PUNCH + 1, 2], [PUNCH + 2, 4], [PUNCH + 5, 10], [PUNCH + 8, 14]]);

  return (
    <AbsoluteFill style={{ background: "#3B0A18", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "50% 50%" }}>
        <Img src={velvetUrl} style={{ position: "absolute", inset: 0, width: W, height: H, objectFit: "cover" }} />
        {ORNS.map((o, i) => (
          <Sprite key={i} src={ornUrl} x={o.x * W + 14 * Math.sin(f * 0.17 + i)} y={o.y * H + drift(i * 2)} w={o.w * W * ORN_W} rot={o.r + 3 * Math.sin(f * 0.13 + i)} flip={o.flip} style={{ filter: "drop-shadow(0 14px 16px rgba(0,0,0,0.55)) saturate(1.1)" }} />
        ))}
        <div style={{ position: "absolute", left: 0, width: W, top: 0.3 * H - 50 }}>
          <GradText text={typed("THOUGH THE", f, [[0, 0], [4, 10]])} size={100} top="#FFFFFF" bottom="#B4B4B4" />
        </div>
        <Sprite src={brainUrl} x={bx} y={by} w={BRAIN_W} rot={brot} style={{ filter: "drop-shadow(0 18px 22px rgba(0,0,0,0.55))" }} />
        <div style={{ position: "absolute", left: 0, width: W, top: 0.77 * H - 70 }}>
          <GradText text={typed("EXACT", f, [[4, 0], [6, 3], [8, 5]])} size={137} top="#FFFFFF" bottom="#A8A8A8" />
        </div>
        <div style={{ position: "absolute", left: 0, width: W, top: 0.805 * H + 12 }}>
          <GradText text={typed("DIAGNOSES", f, [[8, 0], [14, 9]])} size={74} top="#FFFFFF" bottom="#A8A8A8" />
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
