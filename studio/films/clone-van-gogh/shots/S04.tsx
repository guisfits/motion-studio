import { AbsoluteFill, Img, useCurrentFrame } from "remotion";
import { F, H, Sprite, W, kf, rnd, tab, useFonts47 } from "../lib/s04-07-kit";
import { bounce } from "../../../../src/physics";
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

// Camera = the reference's measured cumulative scale per frame (frames.csv, S04): a hard push 1 -> 1.47
// (1.19 in the first step, then decaying), a hard cut to the head at 2.22 that settles to 2.54, and the
// wide frame again for the vertical-smear exit. K maps the reference's figure size onto our cut-out.
const K = 0.76;
const CUM = [
  1, 1.19, 1.252, 1.292, 1.321, 1.343, 1.359, 1.373, 1.384, 1.391, 1.396, 1.401, 1.405, 1.404, 1.406, 1.409, 1.41, 1.412, 1.417, 1.42, 1.425, 1.434, 1.446, 1.468,
  2.217, 2.371, 2.425, 2.458, 2.479, 2.495, 2.507, 2.515, 2.522, 2.525, 2.528, 2.531, 2.534, 2.537, 2.54, 2.541, 2.543, 2.501, 2.277,
];
const K2 = 0.72; // the head close-up reads smaller than the wide scale predicts (the reference head is ~0.27 W)
const Z_WIDE_END = K * CUM[PUNCH - 1];

// Rest poses read off the reference at the end of the push (screen px at that zoom), turned into world
// px by the zoom they were read at: centre x, y; width; rotation. Sizes vary a lot: two huge corner clocks.
const CLOCKS_SCREEN = [
  { x: 0.9 * W, y: 0.03 * H, w: 0.34 * W, r: -10, ph: 0 },
  { x: 0.1 * W, y: 0.3 * H, w: 0.22 * W, r: 6, ph: 1.3 },
  { x: 0.34 * W, y: 0.09 * H, w: 0.1 * W, r: 15, ph: 2.1 },
  { x: 0.82 * W, y: 0.4 * H, w: 0.11 * W, r: -6, ph: 0.7 },
  { x: 0.12 * W, y: 0.86 * H, w: 0.4 * W, r: 6, ph: 2.9 },
  { x: 0.9 * W, y: 0.72 * H, w: 0.22 * W, r: -10, ph: 1.9 },
  { x: 0.5 * W, y: 0.98 * H, w: 0.17 * W, r: 4, ph: 3.4 },
  { x: 0.08 * W, y: 0.62 * H, w: 0.13 * W, r: -8, ph: 0.4 },
];
const CLOCKS = CLOCKS_SCREEN.map((c) => ({ ...c, x: W / 2 + (c.x - W / 2) / Z_WIDE_END, y: H / 2 + (c.y - H / 2) / Z_WIDE_END, w: c.w / Z_WIDE_END }));

export const camS04 = (f: number) => {
  if (f < PUNCH) return { zoom: K * tab(CUM, f), cx: W / 2, cy: H / 2 };
  // head close-up: head centre at 45 % of the frame height
  const zoom = K2 * tab(CUM, f);
  return { zoom, cx: HEAD_X, cy: HEAD_Y + (0.08 * H) / zoom };
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
export const S04Scene: React.FC<{ f: number; exit?: boolean }> = ({ f, exit = false }) => {
  useFonts47();
  // exit: the reference cuts to the wide frame (figure small, text smeared) for the frame before the zoom blur
  const cam = exit ? { zoom: K * 1.25, cx: W / 2, cy: H / 2 } : camS04(f);
  const punched = f >= PUNCH;

  // Skull lift: cap + hair rise 55 world px over 14 frames from local 25 (ref f131-146).
  const lb = bounce(f - PUNCH - 1, 16, { hz: 1.7, damping: 0.5 });
  const lift = 58 * lb;
  const brainUp = 30 * lb;
  const capClip = `inset(0 0 ${((FIG_H - (CAP_Y - FIG_TOP)) / FIG_H) * 100}% 0)`;
  const bodyClip = `inset(${((CAP_Y - FIG_TOP) / FIG_H) * 100}% 0 0 0)`;

  const textShown = Math.floor(kf(f, [[0, 0], [1, 1], [2, 2], [3, 3], [4, 5], [5, 6], [6, 7], [7, 8]]));
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
        {CLOCKS.map((c, i) => (
          <Sprite key={i} src={clockUrl} x={c.x + 3 * Math.sin(f * 0.2 + c.ph)} y={c.y + 6 * Math.sin(f * 0.22 + c.ph)} w={c.w * 1.6} rot={c.r + 0.4 * Math.sin(f * 0.15 + c.ph + rnd(i))} style={{ filter: `sepia(0.45) brightness(0.62) contrast(1.15) blur(${c.w > 0.2 * W ? 1.6 : 0.6}px)` }} />
        ))}
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

