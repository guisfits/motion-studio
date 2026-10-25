// Helpers shared by shots B06-B09: a feathered crop of a found plate placed by its centre, with an
// optional tinted sub-rectangle (the kit's Piece needs a transparent cut-out; the found plates are not).
import type { CSSProperties } from "react";
import { Img } from "remotion";

type Rect = [number, number, number, number];

/**
 * A region of a source plate (crop = x, y, w, h in 0..1 of the source) placed by its centre
 * (cx, cy in % of frame) at a width w in % of frame width. `feather` softens its edge (px, or an
 * ellipse falloff) so the plate melts into the ground. `tintRect` (l, t, r, b of the crop, 0..1)
 * shows the accent gradient map only inside that rectangle, at `tint` strength.
 */
export const Region: React.FC<{
  src: string; aspect: number; crop: Rect; cx: number; cy: number; w: number;
  feather?: number; ellipse?: boolean; blend?: CSSProperties["mixBlendMode"];
  tint?: number; tintRect?: Rect; mono?: boolean; grade?: string; rot?: number; style?: CSSProperties;
}> = ({ src, aspect, crop, cx, cy, w, feather = 0, ellipse, blend, tint = 0, tintRect, mono = true, grade = "", rot = 0, style }) => {
  const [x, y, cw, ch] = crop;
  const img: CSSProperties = { position: "absolute", width: `${100 / cw}%`, left: `${(-x / cw) * 100}%`, top: `${(-y / ch) * 100}%` };
  const f = feather;
  const edge = ellipse
    ? { maskImage: "radial-gradient(ellipse 78% 72% at 50% 50%, #000 58%, transparent 100%)", WebkitMaskImage: "radial-gradient(ellipse 78% 72% at 50% 50%, #000 58%, transparent 100%)" }
    : f
      ? {
          maskImage: `linear-gradient(to right, transparent, #000 ${f}px, #000 calc(100% - ${f}px), transparent), linear-gradient(to bottom, transparent, #000 ${f}px, #000 calc(100% - ${f}px), transparent)`,
          maskComposite: "intersect",
          WebkitMaskImage: `linear-gradient(to right, transparent, #000 ${f}px, #000 calc(100% - ${f}px), transparent), linear-gradient(to bottom, transparent, #000 ${f}px, #000 calc(100% - ${f}px), transparent)`,
          WebkitMaskComposite: "source-in",
        }
      : {};
  const clip = tintRect ? `inset(${tintRect[1] * 100}% ${(1 - tintRect[2]) * 100}% ${(1 - tintRect[3]) * 100}% ${tintRect[0] * 100}%)` : undefined;
  return (
    <div
      style={{
        position: "absolute", left: `${cx}%`, top: `${cy}%`, width: `${w}%`, aspectRatio: `${(cw * aspect) / ch}`,
        transform: `translate(-50%, -50%) rotate(${rot}deg)`, overflow: "hidden", mixBlendMode: blend, ...edge, ...style,
      }}
    >
      <Img src={src} style={{ ...img, filter: `${mono ? "url(#mono)" : ""} ${grade}`.trim() || "none" }} />
      {tint > 0 ? (
        // The clip belongs on a box the size of the crop: on the oversized image it would be measured against the whole plate.
        <div style={{ position: "absolute", inset: 0, clipPath: clip, opacity: tint }}>
          <Img src={src} style={{ ...img, filter: "url(#accent)" }} />
        </div>
      ) : null}
    </div>
  );
};

/** Light print ground for the cut-out beats (B07): near-white paper, a touch darker at the top. */
export const whiteGround: CSSProperties = { background: "linear-gradient(#DADAD7 0%, #ECECEA 45%, #F2F2F0 100%)" };
