import { AbsoluteFill, Img, interpolate, useCurrentFrame } from "remotion";
import galleryUrl from "../assets/gen/a1214-gallery.png";
import plinthUrl from "../assets/gen/a1214-plinth-cut.png";
import vgUrl from "../assets/gen/s12-vg-full-cut.png";
import cafe from "../assets/pd/saint-remy.jpg";
import { bounce, drift, throwIn } from "../../../../src/physics";
import { H, W } from "../lib/s12-16-kit";
import { S12_ANCHOR_Y, s12Scale } from "../lib/s12-14-cam";

// S12 (375-400): painted man on a stone plinth in a revolving painted rotunda. The reference is an AI
// video clip; here: a gallery plate that turns slowly (parallax: far wall slow, near edge bands fast and
// blurred), dark spotlight wedges hanging from the top, a plinth + glowing floor ring, the cut-out figure,
// and one painting canvas that is thrown out from behind the right edge, unfolds in 3D and ends big and
// tilted in front of his body. Camera = measured push about the point whose height barely moves.

const FPS = 16;
const CX = W / 2;
const AY = S12_ANCHOR_Y;

/** Screen transform of a world layer: scale s^depth about the anchor, plus a world shift. */
const layer = (s: number, depth: number, dx = 0, dy = 0): React.CSSProperties => ({
  position: "absolute",
  left: 0,
  top: 0,
  width: W,
  height: H,
  transformOrigin: `${CX}px ${AY}px`,
  transform: `translate(${dx}px, ${dy}px) scale(${s ** depth})`,
});

const Canvas: React.FC<{ f: number }> = ({ f }) => {
  if (f < 2) return null;
  // A: thrown out from behind the right edge (local 2 -> 8), lands hovering at his right hip.
  const a = throwIn(f - 2, FPS, {
    from: { x: 1090, y: 560, rotate: 8, scale: 0.22 },
    to: { x: 740, y: 930, rotate: 24, scale: 1 },
    frames: 6,
    arc: 90,
    damping: 0.5,
  });
  // B: drifts left across his legs and narrows (8 -> 14): seen nearly edge-on, ~330 px wide.
  const tb = interpolate(f, [8, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sb = tb * tb * (3 - 2 * tb);
  // C: pulled up and across his body, large and steep (14 -> 24), a spring that overshoots a little.
  const c = bounce(f - 14, FPS, { hz: 0.95, damping: 0.75 });
  const wob = drift(f, FPS, "s12-canvas", { amp: 14, hz: 0.9 });
  let x = a.x + (420 - 740) * sb;
  let y = a.y + (1040 - 930) * sb;
  let rot = a.rotate + (16 - 24) * sb;
  let w = 560 * a.scale * (1 - 0.41 * sb);
  if (f >= 14) {
    x += (650 - 420) * c;
    y += (770 - 1040) * c;
    rot += (52 - 16) * c;
    w *= 1 + 1.05 * c;
  }
  x += wob.x * 0.5;
  y += wob.y * 0.5;
  rot += wob.rotate * 4;
  const h = w * 0.78;
  // unfold: edge-on at first, nearly flat by local 8, a lean of 14 deg after
  const unfold = interpolate(bounce(f - 2, FPS, { hz: 1.7, damping: 0.5 }), [0, 1], [78, 16]);
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, transform: `rotate(${rot}deg) perspective(900px) rotateY(${unfold}deg)`, filter: "drop-shadow(0 24px 30px rgba(0,0,0,0.65))" }}>
      <Img src={cafe} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "sepia(0.5) saturate(0.9) brightness(0.8) contrast(1.15)", border: "6px solid #3a2616", boxSizing: "border-box" }} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(105deg, rgba(0,0,0,${0.15 + unfold / 160}) 0%, rgba(255,230,160,0.12) 55%, rgba(0,0,0,0.25) 100%)` }} />
    </div>
  );
};

const Wedge: React.FC<{ x: number; w: number; len: number; o: number }> = ({ x, w, len, o }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: -20, width: w, height: len, background: "linear-gradient(180deg, rgba(34,24,14,0.92), rgba(34,24,14,0.55) 70%, rgba(34,24,14,0))", clipPath: "polygon(30% 0, 70% 0, 100% 100%, 0 100%)", opacity: o, filter: "blur(10px)" }} />
);

export const S12: React.FC = () => {
  const f = useCurrentFrame();
  const s = s12Scale(f);
  // the rotunda turns: far wall drifts left, near bands faster
  const turn = f * 5.5;
  const sway = drift(f, FPS, "s12-vg", { amp: 3, hz: 0.5 });

  const plinthW = 861 * 0.871;
  const plinthTop = 1380 - 78 * 0.871;
  return (
    <AbsoluteFill style={{ background: "#120c06", overflow: "hidden" }}>
      {/* far wall: plate at 1.3x, depth 0.55 */}
      <div style={layer(s, 0.55, -turn)}>
        <Img src={galleryUrl} style={{ position: "absolute", left: -260, top: -520, width: W * 1.5, height: H * 1.5, filter: "brightness(1.15) saturate(0.55) sepia(0.3) contrast(1.05)" }} />
      </div>
      {/* near wall bands at the edges: same plate, huge, blurred, faster */}
      {[0, 1].map((side) => (
        <div key={side} style={{ ...layer(s, 1.25, side ? -turn * 2.2 : -turn * 2.2), WebkitMaskImage: `linear-gradient(${side ? 270 : 90}deg, #000 0%, rgba(0,0,0,0.85) 8%, transparent 20%)`, filter: "blur(9px) brightness(0.3) saturate(0.6) sepia(0.3)" }}>
          <Img src={galleryUrl} style={{ position: "absolute", left: side ? -1250 : -480, top: -900, width: W * 2.6, height: H * 2.6 }} />
        </div>
      ))}
      {/* light pool around the figure, dark rim */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 46% 44% at 50% 38%, rgba(255,236,170,0.4), rgba(0,0,0,0) 70%), radial-gradient(ellipse 62% 70% at 50% 46%, rgba(0,0,0,0) 38%, rgba(18,10,4,0.55) 100%)" }} />
      {/* spotlight wedges (dark shafts) turning with the wall */}
      <div style={layer(s, 0.8)}>
        {[0.06, 0.24, 0.5, 0.78, 0.95].map((x, i) => (
          <Wedge key={i} x={x * W - turn * (0.9 + i * 0.12) + i * 40} w={150 + i * 12} len={H * 0.42} o={0.95} />
        ))}
      </div>
      {/* floor ring, plinth, figure */}
      <div style={layer(s, 1)}>
        <div style={{ position: "absolute", left: CX - 500, top: 1320, width: 1000, height: 170, borderRadius: "50%", background: "radial-gradient(ellipse at 50% 50%, #cfa826 0%, #a98418 55%, rgba(120,90,10,0) 100%)", filter: "blur(12px)", opacity: 0.95 }} />
        <div style={{ position: "absolute", left: CX - (81 + 430.5) * 0.871, top: plinthTop, width: 1024 * 0.871, height: 768 * 0.871 }}>
          <Img src={plinthUrl} style={{ width: "100%", height: "100%", filter: "brightness(0.62) contrast(1.15) saturate(0.7) sepia(0.4)" }} />
        </div>
        {/* body continues below the frame edge */}
        <div style={{ position: "absolute", left: CX - plinthW / 2 + 28, top: plinthTop + 707 * 0.871 - 90, width: plinthW - 56, height: 800, background: "repeating-linear-gradient(0deg, #4a5246 0 58px, #394035 58px 62px)", filter: "brightness(0.8)" }} />
        <div style={{ position: "absolute", left: CX - 150, top: 1385, width: 300, height: 50, borderRadius: "50%", background: "rgba(10,8,4,0.55)", filter: "blur(10px)" }} />
        <Img
          src={vgUrl}
          style={{ position: "absolute", left: 196 + sway.x, top: 372 + sway.y, width: 768 * 0.871, height: 1344 * 0.871, transform: `rotate(${sway.rotate}deg) scaleX(1.1)`, transformOrigin: "50% 100%", filter: "saturate(0.95) contrast(1.15) brightness(0.88) hue-rotate(-14deg) drop-shadow(0 16px 24px rgba(0,0,0,0.55))" }}
        />
      </div>
      <Canvas f={f} />
      <AbsoluteFill style={{ background: "rgba(255,160,50,0.07)", mixBlendMode: "soft-light" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(10,6,2,0.28) 100%)" }} />
    </AbsoluteFill>
  );
};
