// Real scanned or photographed texture over the picture: paper fibre, print decay, dust, film
// scratches. Chris Moran's rule is that abstract noise looks uncanny and a real scan does not, so
// a texture here is always a picture file (or a frame sequence), blended the way craft-chrismoran
// §2 says, never drawn.
//
//   const paper = texture(stage, { src: "assets/paper.jpg", tile: true, ppcm: 118, seed: 3 });
//   const dust  = texture(stage, { src: "assets/dust", kind: "video", blend: "auto", seed: 9 });
//   stage.run((t) => { table.draw(t); paper.draw(t); dust.draw(t); fin.draw(t); });
//
// Layer order, bottom to top:  table (+ pieces)  ->  texture layers  ->  finish  ->  grain
// (the house outro on its own layer above all of it). Build the layers after the table and its
// pieces and before K.finish: finish wraps what is on the stage, so the texture is softened,
// fringed and weaved with everything else, and grain stays the last thing on the glass. A piece
// built after a texture lies above it, untextured: build the textured sheet first. One layer per
// band (fine grain, print/halftone, soft wash); two layers in one band turn to mud.
//
// Options:
//   src        a picture URL (kind "image"), or a frame sequence folder made by reference/clip.mjs
//              (kind "video": dust, film scratches; a <video> cannot be seeked frame-exactly)
//   blend      "auto" (default) | multiply | screen | darken | lighten | overlay | soft-light.
//              "auto" measures the texture's background (the peak of its luma histogram, centre
//              1024 px crop; first frame of a sequence): light -> multiply keeps the dark detail,
//              dark -> screen keeps the bright detail.
//   normalize  desaturate and set levels so the background sits at the blend's neutral: 50 % grey
//              for overlay/soft-light (default true there: un-normalised they shift the colours
//              underneath), white for multiply/darken, black for screen/lighten (default false: a
//              paper's own tint is wanted). Pass false for a texture already made neutral.
//   strength   1 = the texture as it is. It is a curve on the texture (about its neutral:
//              out = neutral + strength * (in - neutral), clipped), baked into a table filter, so
//              detail keeps its contrast; above 1 pushes (a second levels pass, clipping the
//              extremes). Opacity is never used: it fogs.
//   scale      screen pixels per texture pixel (default 1). Untiled, it zooms the cover fit (>= 1).
//   ppcm       the texture's own scan resolution (118 = a 300 dpi scan). With it, one texture
//              pixel is stage.pxPerCm / ppcm screen pixels, so every layer of the film shares one
//              physical scale; `scale` multiplies that. stage.pxPerCm defaults to PX_PER_CM.
//   tile       true repeats the picture at that size, never stretched. false (default) covers the
//              box at the picture's aspect ratio (centred), never stretched either.
//   wiggle     the ground breathes: it slides by a seeded +-wiggle px (default 2), held for a whole
//              step of `fps` (default 12). false = still. The layer is oversized so no edge shows.
//   seed       the wiggle's seed (give each layer its own so two never move in lockstep)
//   loop       video only: wrap around the sequence (default true) instead of holding the last frame
//   target     where it goes: omitted = the whole frame (on stage.dom); an element = laid over that
//              element, clipped to its box (a sheet's print band; blends with the sheet only when
//              the element forms a stacking context, as pieces do); { x, y, w, h, parent? } = a
//              box on `parent` (default stage.dom).
//
// Returns { draw(t), el, info }. `el` is the clipping box. `info` is filled once stage.run starts
// (the measuring is async and stage.pending waits for it): { blend, luma, normalize, tile: {w, h},
// filter } with `luma` the measured background (0..1) and `tile` the picture's size on screen.
// draw(t) sets everything from t alone (wiggle from floor(t * fps), a sequence frame from t).
import { rng, clamp } from "./motion.js";
import { clipFrame, clipUrl } from "./clip.js";

export const PX_PER_CM = 40;

const SVG_NS = "http://www.w3.org/2000/svg";
// The value a blend leaves the backdrop unchanged for.
const NEUTRAL = { multiply: 1, darken: 1, screen: 0, lighten: 0, overlay: 0.5, "soft-light": 0.5 };
const TABLE_STEPS = 256;

// The wiggle for time t, pure in the step index floor(t * fps): any t inside a step repaints it
// identically, and a seek lands on the same numbers whatever was drawn before. `wiggle` false/0
// is exactly still but the draw is still consumed, so switching it never reshuffles a seed.
export function textureFrame(t, { fps = 12, seed = 1, wiggle = 2 } = {}) {
  const px = wiggle === false || wiggle == null ? 0 : wiggle;
  if (typeof px !== "number" || !Number.isFinite(px) || px < 0)
    throw new Error(`texture: wiggle must be a positive number or false, got ${wiggle}`);
  if (!(fps > 0)) throw new Error(`texture: fps must be positive, got ${fps}`);
  const step = Math.floor(t * fps + 1e-6);
  const r = rng(Math.imul(step + 1, 0x9e3779b1) ^ Math.imul(seed | 0, 0x85ebca6b));
  r();
  const [x, y] = [r() * 2 - 1, r() * 2 - 1];
  return { step, dx: px ? x * px : 0, dy: px ? y * px : 0 };
}

const quote = (u) => `url("${String(u).replaceAll('"', "%22")}")`;

function load(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => img.decode().then(() => resolve(img), () => resolve(img));
    img.onerror = () => reject(new Error(`texture: image failed to load: ${src}`));
    img.src = src;
  });
}

// The texture's background: the peak of its luma histogram (smoothed over +-3 bins), read from
// the centre 1024 px at native resolution (a downscale would average halftone dots into grey).
function backgroundLuma(img, src) {
  const [nw, nh] = [img.naturalWidth, img.naturalHeight];
  const [w, h] = [Math.min(nw, 1024), Math.min(nh, 1024)];
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d", { willReadFrequently: true });
  g.drawImage(img, (nw - w) / 2, (nh - h) / 2, w, h, 0, 0, w, h);
  let d;
  try {
    d = g.getImageData(0, 0, w, h).data;
  } catch {
    throw new Error(`texture: cannot read the pixels of ${src} (serve it from the film's own origin to use blend "auto" or normalize)`);
  }
  const hist = new Float64Array(TABLE_STEPS);
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 128) continue;
    hist[Math.round(0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2])]++;
  }
  // The smoothed histogram finds the crowd; the exact peak is the fullest bin inside it, so a
  // texture with one flat background value lands exactly on it, not up to 3 bins off.
  let best = 0;
  let crowd = TABLE_STEPS - 1;
  for (let b = 0; b < TABLE_STEPS; b++) {
    let sum = 0;
    for (let k = -3; k <= 3; k++) sum += hist[clamp(b + k, 0, TABLE_STEPS - 1)];
    if (sum > best) [best, crowd] = [sum, b];
  }
  let peak = crowd;
  for (let b = Math.max(0, crowd - 3); b <= Math.min(TABLE_STEPS - 1, crowd + 3); b++) if (hist[b] > hist[peak]) peak = b;
  return clamp(peak / 255, 0.02, 0.98);
}

// The tone curve as a 257-entry table: levels that put the background at the neutral (when
// normalizing), then strength about the neutral. null when it would change nothing.
function toneTable({ neutral, strength, peak, normalize }) {
  if (!normalize && strength === 1) return null;
  const fix = !normalize
    ? (x) => x
    : neutral === 1
      ? (x) => x / peak
      : neutral === 0
        ? (x) => (x - peak) / (1 - peak)
        : (x) => x ** (Math.log(0.5) / Math.log(peak)); // gamma: black and white stay, the peak goes to 50 %
  return Array.from({ length: TABLE_STEPS + 1 }, (_, i) =>
    clamp(neutral + strength * (clamp(fix(i / TABLE_STEPS)) - neutral)).toFixed(4),
  ).join(" ");
}

let textures = 0;

export function texture(
  stage,
  {
    src,
    kind = "image",
    blend = "auto",
    normalize,
    strength = 1,
    scale = 1,
    ppcm,
    tile = false,
    wiggle = 2,
    fps = 12,
    seed = 1,
    loop = true,
    target,
  } = {},
) {
  if (typeof src !== "string" || !src) throw new Error("texture: src is required");
  if (kind !== "image" && kind !== "video") throw new Error(`texture: kind must be "image" or "video", got ${kind}`);
  if (blend !== "auto" && !(blend in NEUTRAL))
    throw new Error(`texture: blend must be auto, ${Object.keys(NEUTRAL).join(", ")}; got ${blend}`);
  if (!(strength >= 0) || !Number.isFinite(strength)) throw new Error(`texture: strength must be 0 or more, got ${strength}`);
  if (!(scale > 0)) throw new Error(`texture: scale must be positive, got ${scale}`);
  if (ppcm != null && !(ppcm > 0)) throw new Error(`texture: ppcm must be positive, got ${ppcm}`);
  if (!tile && scale < 1) throw new Error(`texture: an untiled texture covers the box, so scale below 1 would leave it bare (got ${scale}); use tile: true`);
  textureFrame(0, { fps, seed, wiggle }); // validates wiggle and fps now, not at the first draw

  // The box and where it lives.
  let host = stage.dom;
  let box = { x: 0, y: 0, w: stage.W, h: stage.H };
  if (target instanceof HTMLElement) {
    host = target;
    box = { x: 0, y: 0, w: target.offsetWidth, h: target.offsetHeight };
  } else if (target) {
    host = target.parent ?? stage.dom;
    box = { x: target.x, y: target.y, w: target.w, h: target.h };
  }
  if (![box.x, box.y, box.w, box.h].every(Number.isFinite) || !(box.w > 0) || !(box.h > 0))
    throw new Error(`texture: the target has no size (${box.w} x ${box.h}); build it after the element is laid out`);

  const margin = Math.ceil(wiggle || 0); // room for the slide, so the layer's edge never shows
  const wrap = document.createElement("div");
  Object.assign(wrap.style, {
    position: "absolute",
    left: `${box.x}px`,
    top: `${box.y}px`,
    width: `${box.w}px`,
    height: `${box.h}px`,
    overflow: "hidden",
    pointerEvents: "none",
  });
  const inner = document.createElement("div");
  Object.assign(inner.style, {
    position: "absolute",
    left: `${-margin}px`,
    top: `${-margin}px`,
    width: `${box.w + 2 * margin}px`,
    height: `${box.h + 2 * margin}px`,
    backgroundRepeat: tile ? "repeat" : "no-repeat",
  });
  wrap.append(inner);
  host.append(wrap);

  const info = { blend: blend === "auto" ? null : blend, luma: null, normalize: false, tile: null, filter: null };
  const id = `texture${++textures}`;
  let meta = null;
  let shown = -1;
  let wanted = -1;

  const first = kind === "video" ? clipUrl(src, 0) : src;
  stage.pending.push(
    (async () => {
      if (kind === "video") {
        const r = await fetch(`${src}/clip.json`);
        if (!r.ok) throw new Error(`texture: clip missing: ${src}/clip.json (run reference/clip.mjs)`);
        meta = await r.json();
      }
      const img = await load(first);
      const [nw, nh] = [img.naturalWidth, img.naturalHeight];
      const wantsPixels = blend === "auto" || normalize === true || (normalize === undefined && NEUTRAL[blend] === 0.5);
      const luma = wantsPixels ? backgroundLuma(img, first) : null;
      const chosen = blend === "auto" ? (luma > 0.5 ? "multiply" : "screen") : blend;
      const neutral = NEUTRAL[chosen];
      const norm = normalize ?? neutral === 0.5;
      Object.assign(info, { blend: chosen, luma, normalize: !!norm });
      wrap.style.mixBlendMode = chosen;

      // Strength and levels: one filter on the layer, a table curve after the desaturation.
      const table = toneTable({ neutral, strength, peak: luma, normalize: norm });
      if (table || norm) {
        const svg = document.createElementNS(SVG_NS, "svg");
        Object.assign(svg.style, { position: "absolute", width: "0", height: "0" });
        const f = (c) => `<feFunc${c} type="table" tableValues="${table}"/>`;
        svg.innerHTML = `<filter id="${id}" color-interpolation-filters="sRGB">
          ${norm ? `<feColorMatrix type="saturate" values="0"/>` : ""}
          ${table ? `<feComponentTransfer>${f("R")}${f("G")}${f("B")}</feComponentTransfer>` : ""}</filter>`;
        wrap.append(svg);
        inner.style.filter = `url(#${id})`;
        info.filter = id;
      }

      // Size on screen: physical (ppcm), tiled; or covering the box at the picture's aspect.
      const [bw, bh] = [box.w + 2 * margin, box.h + 2 * margin];
      const k = tile ? (ppcm ? (stage.pxPerCm ?? PX_PER_CM) / ppcm : 1) * scale : Math.max(bw / nw, bh / nh) * scale;
      const [tw, th] = [nw * k, nh * k];
      info.tile = { w: tw, h: th };
      inner.style.backgroundSize = `${tw}px ${th}px`;
      // A tile starts at the box's own corner; a cover picture is centred.
      inner.style.backgroundPosition = tile ? `${margin}px ${margin}px` : `${(bw - tw) / 2}px ${(bh - th) / 2}px`;
      inner.style.backgroundImage = quote(first);
      if (kind === "video") shown = 0;
    })(),
  );

  // A sequence frame: preloaded and decoded before the frame is captured, applied only if it is
  // still the one wanted (out-of-order seeks in a live preview cannot overwrite a newer frame).
  function showFrame(i) {
    wanted = i;
    if (i === shown) return;
    const url = clipUrl(src, i);
    const img = new Image();
    img.src = url;
    stage.waitFor(
      img.decode().catch(() => {}).then(() => {
        if (wanted !== i) return;
        inner.style.backgroundImage = quote(url);
        shown = i;
      }),
    );
  }

  return {
    el: wrap,
    info,
    draw(t) {
      const f = textureFrame(t, { fps, seed, wiggle });
      inner.style.transform = f.dx || f.dy ? `translate(${f.dx}px, ${f.dy}px)` : "";
      if (kind === "video") showFrame(clipFrame(meta, t, loop));
    },
  };
}
