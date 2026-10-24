import { AbsoluteFill, useCurrentFrame } from "remotion";
import { throwIn } from "../../../../src/physics";
import selfPortrait from "../assets/pd/self-portrait.jpg";
import wheat from "../assets/pd/wheatfield.jpg";
import saint from "../assets/pd/saint-remy.jpg";
import cafe from "../assets/pd/cafe-terrace.jpg";
import { H, LILITA, PopText, useShotFonts, W } from "../lib/s12-16-kit";
import { Clapper, Dome, EyeMark, Piece, type PieceSpec, Silhouette, Waveform } from "../lib/s12-16-puzzle";

// S15 (457-492), rebuilt from the 12-frame reference strips. Pieces start small and spread, then
// converge and grow over ~10 frames (exponential settle, measured zoom 1.09 -> 0.88). "EVERY GREAT
// EDIT" types in at ~5 chars/frame on local 3-5. At local 18 (abs 475) the WHOLE scene (paper grid,
// pieces, both captions) takes one hard punch-in of x1.345 (cum. zoom 0.896 -> 1.205, no push after;
// the breakdown's "slow push to 1.06" is wrong) and "HAS A STRUCTURE" types in at ~2 chars/frame.

const SPECS: PieceSpec[] = [
  { id: "hook", label: "HOOK", col: 0, row: 0, base: "#2a52a0", dark: "#13284f", img: selfPortrait, imgPos: "xMidYMid slice", extra: <EyeMark /> },
  { id: "context", label: "CONTEXT", col: 1, row: 0, base: "#3f8a45", dark: "#1b4420", img: wheat, imgPos: "xMidYMid slice", extra: <Dome /> },
  { id: "buildup", label: "BUILDUP", col: 0, row: 1, base: "#b5622b", dark: "#5a2810", img: saint, imgPos: "xMidYMid slice", extra: <><Waveform /><Clapper /></> },
  { id: "payoff", label: "PAYOFF", col: 1, row: 1, base: "#c4203a", dark: "#5a0a18", img: cafe, imgPos: "xMidYMid slice", extra: <Silhouette /> },
];

const FPS = 16;
const CAM_CUM = [
  1.0, 1.056, 1.088, 1.029, 0.991, 0.964, 0.941, 0.919, 0.903, 0.89, 0.88, 0.876, 0.874, 0.875, 0.877, 0.88, 0.885, 0.896, 1.09, 1.149, 1.17, 1.184, 1.192,
  1.197, 1.199, 1.201, 1.201, 1.202, 1.203, 1.205, 1.205, 1.205, 1.204, 1.203, 1.203,
];
const camZ = (f: number) => CAM_CUM[Math.max(0, Math.min(CAM_CUM.length - 1, Math.round(f)))] / CAM_CUM[17];
// Settled geometry in the small state (the punch multiplies everything by PUNCH_ZOOM about ORIGIN).
const CELL = 290;
// reference pieces are wider than tall (~1.25:1): the square SVG cell is squashed in y
const Y_SQUASH = 0.8;
const PITCH: [number, number] = [390, 300];
const ORIGIN: [number, number] = [W * 0.515, H * 0.49];

const Paper: React.FC = () => (
  <div
    style={{
      position: "absolute", left: -3000, top: -4000, width: 6000, height: 8000,
      background: "repeating-linear-gradient(0deg, transparent 0 39px, rgba(52,92,86,0.78) 39px 40px), repeating-linear-gradient(90deg, transparent 0 39px, rgba(52,92,86,0.78) 39px 40px), #9a9e98",
    }}
  />
);

// Each piece is thrown in from further out (pitch x1.41 / x1.2), smaller and skewed, and lands in 4
// frames; the rest of the first-10-frames settle is the camera (CAM_CUM).
const FROM_SPREAD: [number, number] = [1.41, 1.2];
const FROM_ROT: Record<string, number> = { hook: 5, context: -4, buildup: -4, payoff: 5 };

const Flying: React.FC<{ spec: PieceSpec; frame: number }> = ({ spec, frame }) => {
  const cx = (spec.col - 0.5) * PITCH[0];
  const cy = (spec.row - 0.5) * PITCH[1];
  const pose = throwIn(frame, FPS, {
    from: { x: cx * FROM_SPREAD[0], y: cy * FROM_SPREAD[1], rotate: FROM_ROT[spec.id], scale: 0.92 },
    to: { x: cx, y: cy, rotate: 0, scale: 1 },
    frames: 4,
    damping: 0.6,
  });
  // the piece is built around the group origin; move it as a whole about its own centre
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0, transformOrigin: `${cx}px ${cy}px`, transform: `translate(${pose.x - cx}px, ${pose.y - cy}px) rotate(${pose.rotate}deg) scale(${pose.scale})` }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0, transformOrigin: "0 0", transform: `scaleY(${Y_SQUASH})` }}>
        <Piece spec={spec} size={CELL} pitch={[PITCH[0], PITCH[1] / Y_SQUASH]} />
      </div>
    </div>
  );
};

const capStyle: React.CSSProperties = { fontFamily: LILITA, fontSize: 88, color: "#fff", textShadow: "3px 4px 0 #2f3437", WebkitTextStroke: "2px #14181a", paintOrder: "stroke fill", whiteSpace: "nowrap" };

export const S15: React.FC = () => {
  useShotFonts();
  const frame = useCurrentFrame();
  // measured camera path of the reference shot (cumulative scale per frame, motion-measure): a settle
  // from a cut-in zoom, a slow creep, then the hard punch at local 18; z = 1 is the small settled state.
  const z = camZ(frame);
  const smear = Math.min(5, Math.abs(z - camZ(frame - 1)) * 14);
  const zoom = z;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#9a9e98" }}>
      <div style={{ position: "absolute", left: ORIGIN[0], top: ORIGIN[1], width: 0, height: 0, transformOrigin: "0 0", transform: `scale(${zoom})`, filter: smear > 0.3 ? `blur(${smear.toFixed(2)}px)` : undefined }}>
        <div style={{ filter: "blur(5px)" }}><Paper /></div>
        <div style={{ position: "absolute", left: -3000, top: -4000, width: 6000, height: 8000, WebkitMaskImage: "radial-gradient(ellipse 460px 560px at 3000px 4000px, #000 30%, transparent 100%)", maskImage: "radial-gradient(ellipse 460px 560px at 3000px 4000px, #000 30%, transparent 100%)" }}><div style={{ position: "absolute", inset: 0, filter: "blur(1.6px)" }}><Paper /></div></div>
        {SPECS.map((s) => <Flying key={s.id} spec={s} frame={frame} />)}
        <div style={{ position: "absolute", left: -16 - 600, width: 1200, top: -384 - 50, textAlign: "center" }}>
          <PopText text="EVERY GREAT EDIT" frame={frame} start={2.6} per={0.2} style={capStyle} />
        </div>
        <div style={{ position: "absolute", left: -16 - 600, width: 1200, top: 346 - 50, textAlign: "center" }}>
          <PopText text="HAS A STRUCTURE" frame={frame} start={16.8} per={0.3} style={capStyle} />
        </div>
      </div>
      {/* the film's Grade vignette darkens the corners; this lifts the paper there so it falls off like the reference */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 48%, transparent 30%, rgba(150,155,148,0.5) 100%)", mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};
