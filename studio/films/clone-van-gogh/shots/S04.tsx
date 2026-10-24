import { AbsoluteFill, Img, useCurrentFrame } from "remotion";
import { EASE_OUT, F, H, Sprite, W, kf, rnd, useFonts47 } from "../lib/s04-07-kit";
import wallUrl from "../assets/gen/s04-wall.png";
import clockUrl from "../assets/gen/s04-clock-cut.png";
import figUrl from "../assets/gen/s04-vg-vines-cut.png";
import brainUrl from "../assets/gen/s04-brain-cut.png";

// Shot 4a/4b (local 0 = scene frame 105). Breakdown f106..148 -> local 0..42; the radial blur
// out is drawn by S05 on top of the last frames.

/** Figure placement: the cut-out's alpha box (x 181-646, y 69-1296 of 768x1344) at 80 % H. */
const FIG_SCALE = 1.252;
const FIG_LEFT = 23;
const FIG_TOP = 9.6;
const FIG_W = 768 * FIG_SCALE;
const FIG_H = 1344 * FIG_SCALE;
/** Cap line (forehead) and head centre, in world px. */
const CAP_Y = FIG_TOP + 150 * FIG_SCALE;
const HEAD_X = FIG_LEFT + 410 * FIG_SCALE;
const HEAD_Y = FIG_TOP + 190 * FIG_SCALE;
const HEAD_W = 155 * FIG_SCALE;

const PUNCH = 24;

// Rest poses read off the reference (centre x, y in world px at zoom 1; width; rotation).
const CLOCKS = [
  { x: 0.84 * W, y: 0.06 * H, w: 0.36 * W, r: -12, ph: 0 },
  { x: 0.12 * W, y: 0.32 * H, w: 0.23 * W, r: 8, ph: 1.3 },
  { x: 0.36 * W, y: 0.11 * H, w: 0.12 * W, r: 15, ph: 2.1 },
  { x: 0.78 * W, y: 0.41 * H, w: 0.12 * W, r: -6, ph: 0.7 },
  { x: 0.14 * W, y: 0.86 * H, w: 0.42 * W, r: 6, ph: 2.9 },
  { x: 0.88 * W, y: 0.72 * H, w: 0.23 * W, r: -10, ph: 1.9 },
  { x: 0.45 * W, y: 0.97 * H, w: 0.2 * W, r: 4, ph: 3.4 },
];

export const camS04 = (f: number) => {
  if (f < PUNCH) {
    return { zoom: kf(f, [[0, 0.64, EASE_OUT], [7, 1.0], [PUNCH - 1, 1.04]]), cx: W / 2, cy: H / 2 };
  }
  return { zoom: kf(f, [[PUNCH, 2.3], [42, 2.45]]), cx: HEAD_X + 12, cy: HEAD_Y - 40 };
};

const GuideText: React.FC<{ text: string; shown: number; size: number; opacityLast: number }> = ({ text, shown, size, opacityLast }) => {
  const cap = size * 0.7;
  return (
    <div style={{ position: "relative", display: "inline-block", fontFamily: `"${F.cinzel}"`, fontSize: size, letterSpacing: size * 0.06, color: "#EFE9D6", lineHeight: 1, whiteSpace: "pre", textShadow: "0 0 10px rgba(255,255,255,0.35)" }}>
      {text.split("").map((c, i) => (
        <span key={i} style={{ opacity: i < shown - 1 ? 1 : i === shown - 1 ? opacityLast : 0 }}>{c}</span>
      ))}
      <svg style={{ position: "absolute", left: -size * 0.15, top: 0, width: "120%", height: "100%", overflow: "visible", pointerEvents: "none" }}>
        {[0.2, 0.2 + 0.7].map((t, i) => (
          <line key={i} x1="0" x2="100%" y1={size * t + (i ? size * 0.07 : 0)} y2={size * t + (i ? size * 0.07 : 0)} stroke="rgba(220,220,215,0.55)" strokeWidth="1.5" opacity={shown > 0 ? 1 : 0} />
        ))}
        {[0.05, 0.25, 0.45, 0.65, 0.85].map((t, i) => (
          <line key={i} x1={`${t * 100}%`} x2={`${t * 100}%`} y1={size * 0.12} y2={size * 0.3} stroke="rgba(220,220,215,0.5)" strokeWidth="1.5" opacity={shown > 0 ? 1 : 0} />
        ))}
      </svg>
      <span style={{ display: "none" }}>{cap}</span>
    </div>
  );
};

/** The whole shot as a pure function of its local frame (S05 re-draws it for the zoom-blur join). */
export const S04Scene: React.FC<{ f: number }> = ({ f }) => {
  useFonts47();
  const cam = camS04(f);
  const punched = f >= PUNCH;

  // Skull lift: cap + hair rise 55 world px over 14 frames from local 25 (ref f131-146).
  const lift = kf(f, [[PUNCH + 1, 0], [PUNCH + 15, 58, EASE_OUT]]);
  const brainUp = kf(f, [[PUNCH + 1, 0], [PUNCH + 15, 30, EASE_OUT]]);
  const capClip = `inset(0 0 ${((FIG_H - (CAP_Y - FIG_TOP)) / FIG_H) * 100}% 0)`;
  const bodyClip = `inset(${((CAP_Y - FIG_TOP) / FIG_H) * 100}% 0 0 0)`;

  const textShown = Math.floor(kf(f, [[0, 0], [1, 1], [2, 2], [7, 6], [14, 8]]));
  const textSize = 128;

  return (
    <AbsoluteFill style={{ background: "#1c1a14", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transformOrigin: "0 0",
          transform: `translate(${W / 2}px, ${H / 2}px) scale(${cam.zoom}) translate(${-cam.cx}px, ${-cam.cy}px)`,
        }}
      >
        <Img src={wallUrl} style={{ position: "absolute", left: -W * 0.9, top: -H * 0.4, width: W * 2.8, height: H * 1.8, objectFit: "cover" }} />
        {CLOCKS.map((c, i) => {
          const settle = kf(f, [[0, 0], [8, 1, EASE_OUT]]);
          const sx = W / 2 + (c.x - W / 2) * (0.45 + 0.55 * settle);
          const sy = H / 2 + (c.y - H / 2) * (0.45 + 0.55 * settle);
          return (
            <Sprite key={i} src={clockUrl} x={sx} y={sy + 7 * Math.sin(f * 0.22 + c.ph)} w={c.w * 1.25 * (0.6 + 0.4 * settle)} rot={c.r + 2.5 * Math.sin(f * 0.15 + c.ph + rnd(i))} />
          );
        })}
        {/* body (below the cap line), brain, cap */}
        <Img src={figUrl} style={{ position: "absolute", left: FIG_LEFT, top: FIG_TOP, width: FIG_W, height: FIG_H, clipPath: bodyClip, filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.5))" }} />
        {punched && (
          <Sprite
            src={brainUrl}
            x={HEAD_X}
            y={CAP_Y - 8 - brainUp - HEAD_W * 0.15}
            w={HEAD_W * 1.55}
            opacity={f >= PUNCH + 1 ? 1 : 0}
          />
        )}
        <Img src={figUrl} style={{ position: "absolute", left: FIG_LEFT, top: FIG_TOP - lift, width: FIG_W, height: FIG_H, clipPath: capClip }} />
        {punched && (
          <div style={{ position: "absolute", left: HEAD_X - HEAD_W * 0.62, top: CAP_Y - 6, width: HEAD_W * 1.24, height: 12, borderRadius: "50%", border: "3px solid #E0D43A", boxSizing: "border-box" }} />
        )}
      </AbsoluteFill>
      {/* VAN GOGH: mid-frame while wide, huge and cropped at the bottom after the punch */}
      <div
        style={{
          position: "absolute",
          left: 0,
          width: W,
          top: punched ? H * 0.9 : H * 0.47 - textSize / 2,
          display: "flex",
          justifyContent: "center",
          transform: `scale(${punched ? kf(f, [[PUNCH, 2.6], [42, 2.8]]) : 1})`,
          transformOrigin: "50% 0%",
        }}
      >
        <GuideText text="VAN GOGH" shown={punched ? 8 : textShown} size={textSize} opacityLast={0.6} />
      </div>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.5) 100%)" }} />
    </AbsoluteFill>
  );
};

export const S04: React.FC = () => {
  const f = useCurrentFrame();
  return <S04Scene f={f} />;
};

