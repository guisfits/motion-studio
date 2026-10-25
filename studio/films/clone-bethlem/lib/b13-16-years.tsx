import { AbsoluteFill, Img } from "remotion";
import { FONT, H, W, ramp } from "./kit";
import paperUrl from "../assets/pd/P25-paper-mottled-ambientcg-Paper003.jpg";
import facadeUrl from "../assets/pd/P04b-bethlem-entrance-facade.jpg";

// The years card (breakdown 6.3 card C) as a function of B15-local time, so B16's page peel can paint
// it underneath without B15 running. Sizes are measured off the reference frames (the breakdown's
// px figures are for a half-size frame).
const Line: React.FC<{ y: number; size: number; weight?: number; children: React.ReactNode }> = ({ y, size, weight = 400, children }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: H * y, textAlign: "center", fontFamily: FONT, fontSize: size, fontWeight: weight, color: "#2c2c2a", fontVariantNumeric: "lining-nums tabular-nums", transform: "translateY(-50%)" }}>
    {children}
  </div>
);

export const YearsCard: React.FC<{ t: number }> = ({ t }) => {
  const year = Math.round(ramp(t, 12, 33, 1814, 1852));
  return (
    <AbsoluteFill style={{ backgroundColor: "#E9E9E6" }}>
      <Img src={paperUrl} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", mixBlendMode: "multiply", opacity: 0.12 }} />
      {/* The hospital's central block, ghosted at 12 %, drifting up ~1 %. */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.12, transform: `translateY(${ramp(t, 0, 52, 0, -1)}%)` }}>
        {/* The central pavilion (x 0.41-0.59 of the plate) fills the frame width. */}
        <Img src={facadeUrl} style={{ position: "absolute", maxWidth: "none", width: W / 0.18, left: -0.41 * (W / 0.18), top: -0.12 * (W / 0.18) / (1601 / 1174), filter: "url(#mono)" }} />
      </div>
      {t < 12 ? <Line y={0.49} size={56}>It took another</Line> : <Line y={0.49} size={140} weight={450}>{year}</Line>}
      {t >= 36 ? <Line y={0.545} size={75}>years</Line> : null}
    </AbsoluteFill>
  );
};
