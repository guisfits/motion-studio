// Atmosphere pieces for motion-graphics films: light rays, dust in a beam, an engraving cut
// line by line. Built once outside draw(t); each returns setters or draws that take t or progress.

import { theme } from "../../../core/lib/theme.js";
import { rng } from "../../../core/lib/motion.js";
const C = () => theme().colors;

// A rose of light rays, drawn on canvas around (cx, cy), in the theme's glow colour.
export function drawRays(
  g,
  cx,
  cy,
  { alpha = 1, angle = 0, count = 24, length = 1100, color = C().glow } = {},
) {
  if (alpha <= 0.01) return;
  g.save();
  g.translate(cx, cy);
  // The gradient lives in the translated space, so it is centred on the rays' origin.
  const grad = g.createRadialGradient(0, 0, 40, 0, 0, length * 0.9);
  grad.addColorStop(0, `color-mix(in srgb, ${color} 30%, transparent)`);
  grad.addColorStop(1, `color-mix(in srgb, ${color} 0%, transparent)`);
  g.globalAlpha = alpha;
  g.fillStyle = grad;
  g.rotate(angle);
  for (let r = 0; r < count; r++) {
    g.rotate((Math.PI * 2) / count);
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(length, -5);
    g.lineTo(length, 5);
    g.closePath();
    g.fill();
  }
  g.restore();
}

// Dust motes drifting in a light beam. Positions are a closed-form
// function of t: each mote drifts on its own slow sine path, wrapping inside the box.
export function makeDust({ count = 140, seed = 5 } = {}) {
  const r = rng(seed);
  const motes = Array.from({ length: count }, () => ({
    x: r(),
    y: r(),
    size: 1.2 + r() * 2.8,
    speed: 0.008 + r() * 0.02,
    phase: r() * Math.PI * 2,
    amp: 0.01 + r() * 0.03,
    a: 0.25 + r() * 0.6,
  }));
  return function draw(
    g,
    t,
    { x, y, w, h, alpha = 1, color = "#f2e6c9" },
  ) {
    if (alpha <= 0.01) return;
    g.save();
    g.fillStyle = color;
    for (const m of motes) {
      const px =
        x + ((((m.x + Math.sin(t * 0.6 + m.phase) * m.amp) % 1) + 1) % 1) * w;
      const py = y + ((((m.y - t * m.speed) % 1) + 1) % 1) * h;
      g.globalAlpha = alpha * m.a * (0.6 + 0.4 * Math.sin(t * 1.7 + m.phase));
      g.beginPath();
      g.arc(px, py, m.size, 0, Math.PI * 2);
      g.fill();
    }
    g.restore();
  };
}

// An engraving cut line by line: draws img into a canvas through diagonal hatch strokes whose
// width grows from 0 to full as `p` sweeps from the bottom up (the burin's pass), so the picture
// appears the way a woodcut or copper plate is cut. Returns { canvas, set(p) }.
export function makeEngraving(
  parent,
  img,
  w,
  h,
  {
    spacing = 7,
    angle = -0.5,
    filter = "grayscale(1) sepia(0.35) contrast(1.06) brightness(0.98)",
  } = {},
) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  Object.assign(canvas.style, {
    position: "absolute",
    left: "0",
    top: "0",
    width: `${w}px`,
    height: `${h}px`,
  });
  parent.append(canvas);
  const c = canvas.getContext("2d");
  // object-fit: cover
  const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * s,
    dh = img.naturalHeight * s;
  const diag = Math.hypot(w, h);
  return {
    canvas,
    set(p, zoom = 1) {
      c.clearRect(0, 0, w, h);
      if (p <= 0) return;
      c.save();
      if (p < 1) {
        // The hatch mask: line i (counted along the plate) reaches full width once the sweep passes it.
        c.beginPath();
        c.translate(w / 2, h / 2);
        c.rotate(angle);
        const n = Math.ceil((diag * 2) / spacing);
        for (let i = 0; i < n; i++) {
          const along = i / n; // 0 = top-left end of the plate, 1 = bottom-right
          const local = Math.min(
            1,
            Math.max(0, (p * 1.35 - (1 - along) * 0.35) / 1),
          );
          const lw = spacing * local;
          if (lw > 0.05) c.rect(-diag, -diag + i * spacing, diag * 2, lw);
        }
        c.rotate(-angle);
        c.translate(-w / 2, -h / 2);
        c.clip();
      }
      c.filter = filter;
      c.translate(w / 2, h / 2);
      c.scale(zoom, zoom);
      c.drawImage(img, -dw / 2, -dh / 2, dw, dh);
      c.restore();
    },
  };
}
