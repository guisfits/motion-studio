import { AbsoluteFill, Img, interpolate, useCurrentFrame } from "remotion";
import landUrl from "../assets/gen/s12-land.png";
import vgUrl from "../assets/gen/s12-vg-full-cut.png";
import starry from "../assets/pd/starry-night.jpg";
import cafe from "../assets/pd/cafe-terrace.jpg";
import sunflowers from "../assets/pd/sunflowers.jpg";
import irises from "../assets/pd/irises.jpg";
import { Cam, camAt, easeOut, H, W } from "../lib/s12-16-kit";

// S12 (375-400): painted man on a plinth in a revolving painted gallery. The reference is an AI
// video clip; here it is layers: a scrolling painted wall in three depth bands (the "rotation"),
// a spotlight cone, a code-drawn plinth with a rim glow, the cut-out figure, and a torn painting
// (cut from the public-domain set) that peels off at the figure's flank and tilts over his legs.

const CAM = [
  { f: 0, s: 1.0, x: 0.5, y: 0.52 },
  { f: 24, s: 1.45, x: 0.5, y: 0.5 },
];

const Wall: React.FC<{ frame: number }> = ({ frame }) => {
  // Three bands move at different speeds: the near bands slide faster than the far wall, like a
  // cylinder turning. Tiles repeat the generated landscape and the PD paintings.
  const tiles = [landUrl, starry, cafe, landUrl, irises, sunflowers, landUrl, starry];
  const band = (speed: number, top: number, height: number, dim: number, flip: boolean) => {
    const shift = -frame * speed;
    return (
      <div style={{ position: "absolute", left: 0, top, width: W, height, overflow: "hidden", filter: `brightness(${dim}) saturate(1.15)` }}>
        <div style={{ position: "absolute", left: shift - 300, top: 0, height: "100%", display: "flex", gap: 14 }}>
          {tiles.map((u, i) => (
            <Img key={i} src={u} style={{ height: "100%", width: height * (i % 3 === 0 ? 0.56 : 0.9), objectFit: "cover", transform: flip && i % 2 ? "scaleX(-1)" : undefined }} />
          ))}
        </div>
      </div>
    );
  };
  return (
    <AbsoluteFill style={{ background: "#2a2218" }}>
      {band(14, -60, 1100, 0.85, false)}
      {band(26, 480, 760, 1.0, true)}
      {/* dark brown cylinder edges */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, #2a2218 0%, rgba(42,34,24,0) 22%, rgba(42,34,24,0) 78%, #2a2218 100%)" }} />
    </AbsoluteFill>
  );
};

const Plinth: React.FC = () => (
  <div style={{ position: "absolute", left: 40, right: 40, top: H * 0.78, height: H * 0.3 }}>
    <div style={{ position: "absolute", inset: "0 0 0 0", borderRadius: "50% 50% 0 0 / 14% 14% 0 0", background: "repeating-linear-gradient(0deg, #6a6c5a 0 54px, #4f5144 54px 58px), #6a6c5a" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: -50, height: 110, borderRadius: "50%", background: "radial-gradient(ellipse at 50% 50%, #7b7d69 0%, #6a6c5a 60%, #3d3f33 100%)", boxShadow: "0 -14px 46px 10px rgba(217,181,58,0.65)" }} />
    <div style={{ position: "absolute", left: 20, right: 20, top: -64, height: 30, borderRadius: "50%", background: "#d9b53a", filter: "blur(16px)", opacity: 0.8 }} />
  </div>
);

// A torn piece of painting, given as polygon points (percent), flying in screen-ish world space.
const Fragment: React.FC<{ src: string; x: number; y: number; w: number; h: number; rot: number; poly: string; shade?: number }> = ({ src, x, y, w, h, rot, poly, shade = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, transform: `rotate(${rot}deg)`, filter: `drop-shadow(0 18px 24px rgba(0,0,0,0.6)) brightness(${shade})` }}>
    <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover", clipPath: `polygon(${poly})` }} />
  </div>
);

export const S12: React.FC = () => {
  const frame = useCurrentFrame();
  const cam = camAt(CAM, frame, easeOut);

  // The canvas: starts as a coat flap at the figure's right (x 70 %), unfolds, tilts down to 25 deg.
  const t = interpolate(frame, [2, 23], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cx = interpolate(t, [0, 1], [0.7 * W, 0.58 * W]);
  const cy = interpolate(t, [0, 1], [0.58 * H, 0.64 * H]);
  const cs = interpolate(t, [0, 1], [0.35, 1.25]);
  const rot = interpolate(t, [0, 0.5, 1], [60, 35, 22]);
  const canvasOn = frame >= 2;

  const beam = (k: number) => 0.28 + 0.1 * Math.sin((frame - 10) * 0.9 + k);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Cam cam={cam}>
        <Wall frame={frame} />
        <Plinth />
        <Img src={vgUrl} style={{ position: "absolute", left: W / 2 - 321, top: 393, width: 643, height: 1125, filter: "saturate(1.45) contrast(1.12) drop-shadow(0 20px 30px rgba(0,0,0,0.6))" }} />
        {canvasOn && (
          <div style={{ position: "absolute", left: cx, top: cy, width: 620, height: 520, marginLeft: -310, marginTop: -260, transform: `scale(${cs}) rotate(${rot}deg)` }}>
            <Fragment src={cafe} x={0} y={0} w={620} h={520} rot={0} poly="3% 6%, 97% 0%, 100% 94%, 4% 100%" />
          </div>
        )}
        {frame >= 7 && (
          <>
            <Fragment src={starry} x={W * (1.15 - frame * 0.04)} y={H * (0.1 + frame * 0.012)} w={380} h={300} rot={-20 + frame * 6} poly="0% 12%, 88% 0%, 100% 70%, 30% 100%" />
            <Fragment src={irises} x={W * (1.3 - frame * 0.045)} y={H * 0.62} w={300} h={240} rot={14 - frame * 4} poly="8% 0%, 100% 18%, 80% 100%, 0% 76%" shade={0.8} />
          </>
        )}
      </Cam>
      {/* spotlight cone from the top centre, pulsing at f10-20 */}
      <AbsoluteFill style={{ background: `conic-gradient(from 180deg at 50% -4%, transparent 0deg, rgba(240,210,110,${beam(0)}) 14deg, transparent 28deg, transparent 332deg, rgba(240,210,110,${beam(2)}) 346deg, transparent 360deg)`, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 36% 60% at 50% 50%, rgba(255,226,140,0.22), transparent 100%)", mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(10,8,20,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};
