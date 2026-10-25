// Helper for B10-B12: a picture placed like kit Plate's `crop`, but with children living in the picture's own
// coordinates (percent of the source), so tints, discs and beams ride the camera with the plate.
import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Easing, Img, interpolate } from "remotion";
import { H, W } from "./kit";

export type Crop = [number, number, number, number];

/** Pixel box of the source when `crop` (x, y, w, h in 0..1) fills the 9:16 frame. */
export const boxOf = (crop: Crop, aspect: number) => {
  const [cx, cy, cw, ch] = crop;
  const scale = (cw * aspect) / ch > W / H ? H / (ch * (W / aspect)) : 1 / cw;
  const iw = W * scale;
  const ih = iw / aspect;
  return { iw, ih, left: W / 2 - (cx + cw / 2) * iw, top: H / 2 - (cy + ch / 2) * ih };
};

export type Move = { f: [number, number]; s?: [number, number]; x?: [number, number]; y?: [number, number]; ease?: "lin" | "in" | "out" };

const EASES = { lin: undefined, in: Easing.in(Easing.cubic), out: Easing.bezier(0.2, 0.7, 0.3, 1) };

/** Camera as one transform (translate in % of frame, then scale about the frame centre). */
export const move = (t: number, m: Move) => {
  const v = (p: [number, number] | undefined, d: number) =>
    p ? interpolate(t, m.f, p, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASES[m.ease ?? "lin"] }) : d;
  const s = v(m.s, 1);
  return { s, transform: `translate(${v(m.x, 0)}%, ${v(m.y, 0)}%) scale(${s})` };
};

/** Source picture (mono) with the camera `transform`; children are positioned in % of the source. */
export const Stage: React.FC<{
  src: string;
  aspect: number;
  crop: Crop;
  transform?: string;
  mono?: boolean;
  style?: CSSProperties;
  children?: (box: { iw: number; ih: number }) => ReactNode;
}> = ({ src, aspect, crop, transform, mono = true, style, children }) => {
  const { iw, ih, left, top } = boxOf(crop, aspect);
  return (
    <AbsoluteFill style={{ overflow: "hidden", ...style }}>
      <AbsoluteFill style={{ transform, transformOrigin: "50% 50%" }}>
        <div style={{ position: "absolute", left, top, width: iw, height: ih }}>
          <Img src={src} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", filter: mono ? "url(#mono)" : "none" }} />
          {children?.({ iw, ih })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** The source again, accent-graded and clipped to `clip` (css clip-path in source %), for tints. */
export const TintLayer: React.FC<{ src: string; clip: string; opacity?: number; blend?: CSSProperties["mixBlendMode"] }> = ({ src, clip, opacity = 1, blend }) => (
  <Img src={src} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", filter: "url(#accent)", clipPath: clip, opacity, mixBlendMode: blend }} />
);
