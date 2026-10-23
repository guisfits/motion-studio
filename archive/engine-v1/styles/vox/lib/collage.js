// Collage pieces: real references cut out (reference/cutout.swift) and moved like paper on a
// table. Grammar from editorial collage (Vox explainers, Lawrence Jordan, Stacey Steers); the
// look (grounds, accent, type) comes from the theme.
//
//   const figure = makeCutout(stage, img.portrait, { width: 520 });
//   // in draw(t): figure.place(x, y, { rot: -3, lift: spring(...) });
//
//   const bust = makeSlices(stage, [img.engraving, img.statue, img.painting], { width, height });
//   // in draw(t): bust.set([t - 0.0, t - 0.15, t - 0.3], { from: W });

import { spring, SPRINGS, stepped as step } from "../../../core/lib/motion.js";

// A cut piece lying on the ground. lift (0..1) raises it: the shadow grows and softens, as when
// a hand picks a paper up. The PNG already carries its paper border (cutout --border).
export function makeCutout(stage, img, { width = img.naturalWidth / 2 } = {}) {
  const height = (img.naturalHeight / img.naturalWidth) * width;
  const el = img.cloneNode();
  Object.assign(el.style, {
    position: "absolute",
    left: "0",
    top: "0",
    width: `${width}px`,
    height: `${height}px`,
    transformOrigin: "50% 50%",
  });
  stage.dom.append(el);
  stage.pending.push(el.decode().catch(() => {}));
  return {
    el,
    width,
    height,
    // (x, y) is the piece's centre in stage pixels.
    place(x, y, { rot = 0, scale = 1, lift = 0, opacity = 1 } = {}) {
      const s = scale * (1 + 0.03 * lift);
      el.style.transform = `translate(${x - width / 2}px, ${y - height / 2}px) rotate(${rot}deg) scale(${s})`;
      el.style.opacity = String(opacity);
      const d = 2 + 22 * lift;
      el.style.filter =
        `drop-shadow(0 ${1 + lift * 2}px ${1 + lift}px rgba(30,20,10,.35)) ` +
        `drop-shadow(0 ${d}px ${d * 1.4}px rgba(30,20,10,${0.18 + 0.12 * lift}))`;
    },
  };
}

// One composite figure cut into horizontal bands, each band from a different source (the same
// subject as engraving, statue, painting). Sources are drawn at the same size, so the bands line
// up into one figure once every band has slid home.
export function makeSlices(stage, imgs, { width, height, bands = imgs.length, gap = 0 } = {}) {
  const el = document.createElement("div");
  Object.assign(el.style, { position: "absolute", left: "0", top: "0", width: `${width}px`, height: `${height}px` });
  const bandH = height / bands;
  const strips = Array.from({ length: bands }, (_, i) => {
    const strip = document.createElement("div");
    Object.assign(strip.style, {
      position: "absolute",
      left: "0",
      top: `${i * bandH + gap / 2}px`,
      width: `${width}px`,
      height: `${bandH - gap}px`,
      overflow: "hidden",
    });
    const pic = imgs[i % imgs.length].cloneNode();
    Object.assign(pic.style, {
      position: "absolute",
      left: "0",
      top: `${-i * bandH - gap / 2}px`,
      width: `${width}px`,
      height: `${height}px`,
      objectFit: "cover",
    });
    strip.append(pic);
    el.append(strip);
    stage.pending.push(pic.decode().catch(() => {}));
    return strip;
  });
  stage.dom.append(el);
  return {
    el,
    strips,
    // ts[i]: time since band i started. Bands slide in from alternating sides on a snappy spring;
    // stepped: hold each pose on a stop-motion grid (fps), like paper moved by hand.
    set(ts, { from = width, k = SPRINGS.snappy.k, d = SPRINGS.snappy.d, stepped = 0 } = {}) {
      strips.forEach((s, i) => {
        const t = stepped ? step(ts[i], stepped) : ts[i];
        const x = (i % 2 ? -1 : 1) * from * (1 - spring(t, k, d));
        s.style.transform = `translateX(${x}px)`;
      });
    },
  };
}
