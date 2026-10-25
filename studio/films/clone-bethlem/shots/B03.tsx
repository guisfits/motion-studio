import { AbsoluteFill } from "remotion";
import { FONT, Plate, ramp, useRefFrame } from "../lib/kit";
import plateUrl from "../assets/pd/P04b-bethlem-entrance-facade.jpg";

// Shot 3 (reference f131-158, 5.42-6.54 s): the "Bethlem / Royal / Hospital," lockup is part of the
// picture. The whole plate and the title pull back together, 2.2x to 1.0x, ease-out (breakdown 6.1).
// "Royal" is yellow and giant (cropped by the frame at the start); "Bethlem" and "Hospital," are
// small and white. Hard cut on the first letter, no animation of the letters themselves.

export const PLATE_ASPECT = 1601 / 1174;
const YELLOW = "#E9E34C";

const Lockup: React.FC = () => {
  // Lines are placed by their vertical centre and left edge (measured on f157, % of the frame).
  const line = (cx: number, cy: number, size: number, weight: number, style: React.CSSProperties) => ({
    position: "absolute" as const, left: `${cx}%`, top: `${cy}%`, transform: "translateY(-50%)", fontFamily: FONT, lineHeight: 1,
    whiteSpace: "pre" as const, fontSize: size, fontWeight: weight, ...style,
  });
  const white = "rgba(244,244,238,0.92)";
  return (
    <AbsoluteFill>
      <div style={line(40, 21.7, 62, 500, { color: white })}>Bethlem</div>
      <div style={line(26, 25.5, 205, 600, { color: YELLOW, opacity: 0.92, letterSpacing: -6 })}>Royal</div>
      <div style={line(44, 31, 76, 500, { color: white })}>Hospital,</div>
    </AbsoluteFill>
  );
};

export const B03: React.FC = () => {
  const t = useRefFrame();
  const s = ramp(t, 0, 27, 2.2, 1, "out");
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#222" }}>
      <AbsoluteFill style={{ transform: `scale(${s})`, transformOrigin: "48.5% 36.8%" }}>
        {/* The reference plate is ~1.35x tighter than a full-height crop; its sky has no banner, so a grey sky patch hides it. */}
        <AbsoluteFill style={{ transform: "scale(1.35)", transformOrigin: "50% 34%" }}>
          <Plate src={plateUrl} aspect={PLATE_ASPECT} crop={[0.29, 0, 0.41, 1]} />
        </AbsoluteFill>
        <div style={{ position: "absolute", left: 0, right: 0, top: -400, height: 400 + 0.15 * 1920, background: "linear-gradient(#8a8a87 82%, rgba(138,138,135,0))" }} />
        <Lockup />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
