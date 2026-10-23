// A hand scribble that follows a cut-out's silhouette: the outline of the image's alpha, pushed
// out by `offset` px, a little uneven (seeded), drawn a bit past one turn so the pen overlaps its
// start. Returns pt(u), u ∈ [0, 1] → [x, y] in the piece's own px (the image drawn `w` wide), ready
// for a stroke reveal.
//   const pt = outline(img, { w: 800, offset: 22, seed: 4 });
//   stroke(piece.el, { pt, tIn: V.at("Lutero") });
import { rng } from "../../../core/lib/motion.js";

export function outline(img, { w, offset = 20, n = 72, seed = 1, jitter = 0.35, turns = 1.08, threshold = 40 } = {}) {
  const S = 160; // sampling width: plenty for a hand line
  const sh = Math.max(1, Math.round((S * img.naturalHeight) / img.naturalWidth));
  const cv = document.createElement("canvas");
  cv.width = S;
  cv.height = sh;
  const g = cv.getContext("2d", { willReadFrequently: true });
  g.drawImage(img, 0, 0, S, sh);
  const a = g.getImageData(0, 0, S, sh).data;
  const solid = (x, y) => x >= 0 && y >= 0 && x < S && y < sh && a[(Math.floor(y) * S + Math.floor(x)) * 4 + 3] > threshold;
  // The centre of mass of the opaque pixels: rays from it find the silhouette's far edge.
  let cx = 0, cy = 0, cnt = 0;
  for (let y = 0; y < sh; y++) for (let x = 0; x < S; x++) if (solid(x, y)) (cx += x, cy += y, cnt++);
  if (!cnt) throw new Error("outline: the image has no opaque pixels");
  cx /= cnt;
  cy /= cnt;
  const k = w / S; // sample px → piece px
  const maxR = Math.hypot(S, sh);
  const r = rng(seed);
  const radii = Array.from({ length: n }, (_, i) => {
    const th = (i / n) * 2 * Math.PI;
    let far = 0;
    for (let d = 0; d < maxR; d += 0.5) if (solid(cx + d * Math.cos(th), cy + d * Math.sin(th))) far = d;
    return far * k + offset * (1 + jitter * (r() - 0.5) * 2);
  });
  // Smoothed (a hand does not follow every notch), closed.
  const sm = radii.map((_, i) => (radii[(i + n - 1) % n] + 2 * radii[i] + radii[(i + 1) % n]) / 4);
  const at = (f) => {
    const p = ((f % 1) + 1) % 1 * n, i = Math.floor(p), t = p - i;
    return sm[i] * (1 - t) + sm[(i + 1) % n] * t;
  };
  const [ox, oy] = [cx * k, cy * k];
  return (u) => {
    const f = u * turns - 0.25; // start at the top
    const th = f * 2 * Math.PI;
    const grow = 1 + 0.04 * u; // the overlapping pass runs a hair wider
    return [ox + at(f) * grow * Math.cos(th), oy + at(f) * grow * Math.sin(th)];
  };
}
