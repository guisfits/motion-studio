import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import selfPortrait from "../assets/pd/self-portrait.jpg";
import wheat from "../assets/pd/wheatfield.jpg";
import saint from "../assets/pd/saint-remy.jpg";
import cafe from "../assets/pd/cafe-terrace.jpg";
import { H, LILITA, PopText, useShotFonts, W } from "../lib/s12-16-kit";
import { Clapper, Dome, EyeMark, Piece, type PieceSpec, Silhouette, Waveform } from "../lib/s12-16-puzzle";

// S15 (457-492): four jigsaw pieces on graph paper. 457-474 the group sits small and drifts; at
// local 18 (abs 475) it punches to full size and slow-pushes to ~1.06. Captions: small pair of
// lines before the punch, large "HAS A STRUCTURE" after.

const SPECS: PieceSpec[] = [
  { id: "hook", label: "HOOK", col: 0, row: 0, base: "#2a52a0", dark: "#13284f", img: selfPortrait, imgPos: "xMidYMid slice", extra: <EyeMark /> },
  { id: "context", label: "CONTEXT", col: 1, row: 0, base: "#3f8a45", dark: "#1b4420", img: wheat, imgPos: "xMidYMid slice", extra: <Dome /> },
  { id: "buildup", label: "BUILDUP", col: 0, row: 1, base: "#b5622b", dark: "#5a2810", img: saint, imgPos: "xMidYMid slice", extra: <><Waveform /><Clapper /></> },
  { id: "payoff", label: "PAYOFF", col: 1, row: 1, base: "#c4203a", dark: "#5a0a18", img: cafe, imgPos: "xMidYMid slice", extra: <Silhouette /> },
];

// Cell edge (px) before / after the punch; centres stay put (pitch 507 x 384), the pieces grow ~1.4x.
const CELL_SMALL = 255;
const CELL_BIG = 360;
const PITCH: [number, number] = [507, 384];
const PUNCH = 18;

const Paper: React.FC = () => (
  <AbsoluteFill
    style={{
      background: "radial-gradient(ellipse at 50% 45%, rgba(255,255,255,0.18), transparent 60%), repeating-linear-gradient(0deg, transparent 0 53px, rgba(120,150,145,0.55) 53px 54px), repeating-linear-gradient(90deg, transparent 0 53px, rgba(120,150,145,0.55) 53px 54px), #d9dbd6",
      boxShadow: "inset 0 0 220px rgba(40,50,50,0.45)",
    }}
  />
);

export const S15: React.FC = () => {
  useShotFonts();
  const frame = useCurrentFrame();
  const big = frame >= PUNCH;
  const k = big ? interpolate(frame, [PUNCH, 34], [1.0, 1.06], { extrapolateRight: "clamp" }) : 1;
  const cell = big ? CELL_BIG : CELL_SMALL + frame * 0.4;
  const drift = big ? 0 : frame * 1.5;
  const capSmall = { fontFamily: LILITA, fontSize: 76, color: "#fff", textShadow: "3px 4px 0 #4a4f52", WebkitTextStroke: "1px rgba(30,30,30,0.6)" };
  const capBig = { fontFamily: LILITA, fontSize: 115, color: "#fff", textShadow: "4px 6px 0 #4a4f52", WebkitTextStroke: "2px rgba(30,30,30,0.7)" };
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Paper />
      <div style={{ position: "absolute", left: W * 0.515 + drift, top: H * 0.5, width: 0, height: 0, transform: `scale(${k})`, transformOrigin: "0 0" }}>
        {SPECS.map((s) => <Piece key={s.id} spec={s} size={cell} pitch={PITCH} />)}
      </div>
      {!big && (
        <div style={{ position: "absolute", left: 0, right: 0, top: H * 0.32 - 40, textAlign: "center" }}>
          <PopText text="EVERY GREAT EDIT" frame={frame} start={2} per={0.5} style={capSmall} />
        </div>
      )}
      {big && (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: H * 0.21 - 60, textAlign: "center" }}>
            <PopText text="EVERY GREAT EDIT" frame={frame + 99} start={0} per={0.5} style={capBig} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: H * 0.72 - 60, textAlign: "center" }}>
            <PopText text="HAS A STRUCTURE" frame={frame} start={PUNCH} per={0.45} style={capBig} />
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
