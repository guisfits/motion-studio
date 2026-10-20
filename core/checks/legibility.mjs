// Caption legibility on the drawn frame: cap height against the frame (T10, grammar §7) and WCAG
// contrast of the text colour against the pixels behind it (T11, craft §2.5). A caption item
// carries `cap` (cap height in frame px, as drawn) and `color` (its text colour, CSS #rgb,
// #rrggbb or rgb()). Only frames at alpha >= NORMS.caption.legibleAlpha are judged.
import { NORMS } from "./norms.mjs";
import { finding } from "./report.mjs";

// WCAG 2 relative luminance of an sRGB colour [r, g, b] in 0–255.
export function luminance([r, g, b]) {
  const lin = (c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export const contrastRatio = (a, b) =>
  (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

// [r, g, b] of a CSS colour, or null when it is not one we can read.
function parseColor(c) {
  if (typeof c !== "string") return null;
  let m = c.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (m) {
    const h = m[1].length === 3 ? [...m[1]].map((d) => d + d).join("") : m[1];
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  }
  m = c.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  return m ? m.slice(1, 4).map(Number) : null;
}

// Each caption id with its legible frames, in order of first appearance.
function legibleCaptions(trace) {
  const caps = new Map();
  for (const f of trace.frames ?? [])
    for (const it of f.items ?? [])
      if (it?.role === "caption" && (it.alpha ?? 1) >= NORMS.caption.legibleAlpha) {
        if (!caps.has(it.id)) caps.set(it.id, []);
        caps.get(it.id).push({ t: f.t, it });
      }
  return caps;
}

export function checkCapHeight(trace) {
  const out = [];
  const [lo, hi] = NORMS.caption.capHeight;
  for (const [id, seen] of legibleCaptions(trace)) {
    const caps = seen.map((s) => s.it.cap);
    if (!caps.every((c) => Number.isFinite(c) && c > 0)) {
      out.push(finding("red", "T10", seen[0].t, `caption ${id} registers no cap height (trace field cap)`));
      continue;
    }
    const pct = (v) => `${((100 * v) / trace.H).toFixed(1)} %`;
    const [min, max] = [Math.min(...caps), Math.max(...caps)];
    if (min / trace.H < lo - 1e-9)
      out.push(finding("red", "T10", seen[0].t, `caption ${id} cap height ${pct(min)} of the frame (≥ ${100 * lo} %)`));
    else if (max / trace.H > hi + 1e-9)
      out.push(finding("orange", "T10", seen[0].t, `caption ${id} cap height ${pct(max)} of the frame (≤ ${100 * hi} %): lettering, not a caption`));
  }
  return out;
}

// `sample(t, box)` returns the rgb24 pixels of the frame at t inside box (see media.sampleBox).
// The background is the median luminance of the box: the glyphs are a minority of its pixels.
export function checkContrast(trace, sample) {
  const out = [];
  for (const [id, seen] of legibleCaptions(trace)) {
    const { t, it } = seen[Math.floor(seen.length / 2)];
    const text = parseColor(it.color);
    if (!text) {
      out.push(finding("red", "T11", t, `caption ${id} registers no text colour (trace field color)`));
      continue;
    }
    const px = sample(t, it.box);
    const lums = [];
    for (let i = 0; i + 2 < px.length; i += 3) lums.push(luminance([px[i], px[i + 1], px[i + 2]]));
    if (!lums.length) continue; // nothing of the box is on the frame: T4 reports it
    lums.sort((a, b) => a - b);
    const ratio = contrastRatio(luminance(text), lums[Math.floor(lums.length / 2)]);
    if (ratio < NORMS.caption.minContrast)
      out.push(
        finding("red", "T11", t, `caption ${id} "${it.text}" contrast ${ratio.toFixed(1)}:1 against what is behind it (≥ ${NORMS.caption.minContrast}:1)`),
      );
  }
  return out;
}
