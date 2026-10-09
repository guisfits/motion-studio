// Narration-driven timing and captions: a narrated film puts every word on screen on the frame
// it is spoken. The film never hard-codes a second the voice decides: it asks the voice
// (voice/words.json, word timings from any TTS + aligner; format in the README), so a draft
// voice and the final voice both sync with no edit.
//
//   const V = await loadVoice("voice/words.json");
//   const tPreacher = V.at("preacher");          // when a word is said (first match)
//   const { start, end } = V.line("intro");   // a whole line
//   const cap = say(stage, V, { line: "intro", x: box.x, y: 240, w: 900 });
//   // in draw(t): cap.draw(t);

import { spring, SPRINGS, progress, rng } from "./motion.js";
import { theme } from "./theme.js";
const C = () => theme().colors;
const F = () => theme().families;

const css = (s) => s.replaceAll('"', "'");
const norm = (s) =>
  s
    .normalize("NFC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "");

export async function loadVoice(path = "voice/words.json") {
  const r = await fetch(path);
  if (!r.ok)
    throw new Error(`${path} missing: generate the narration's word timings (see README, "Narration")`);
  const data = await r.json();
  const V = {
    ...data,
    // When `word` is said: { line } narrows the search, nth picks a later occurrence.
    at(word, { line, nth = 0, end = false } = {}) {
      const hits = data.words.filter(
        (w) => norm(w.w) === norm(word) && (!line || w.line === line),
      );
      if (!hits[nth])
        throw new Error(
          `voice: "${word}"${line ? ` in ${line}` : ""} is not in the narration`,
        );
      return end ? hits[nth].end : hits[nth].start;
    },
    line(id) {
      const l = data.lines.find((x) => x.id === id);
      if (!l) throw new Error(`voice: no line "${id}"`);
      return l;
    },
    words(id) {
      return data.words.filter((w) => w.line === id);
    },
  };
  return V;
}

// One narrated line as on-screen type: the caption IS part of the composition, never a bar.
// Key words (words.json "keys") are set big (the display face, or written by the pen when
// keyStyle: "hand", in sync with the voice saying them); the others small in the body face.
// Every word enters on its spoken frame; the line sinks out at `tOut` (default: just before
// the next line starts, or 0.5 s after its own end).
// x, y, w: the box it flows in. accent: key words in the accent colour.
//
// marks: { "<word>": "circle" | "underline" | "highlight" | "strike" } puts a hand mark on a
// word of this line (matched like V.at: case and punctuation ignored, first occurrence). The
// same map may come from the voice data (words.json lines[i].marks, read as
// V.lines[i].marks); the option wins per word. highlight sweeps in behind the word as it starts
// being written; circle, underline and strike are pen strokes drawn right after the word ends,
// and a struck word dims. say(...).cues() lists their sounds ("marker" / "pen") for the film's
// window.CUES.
//
// screen: true (rolls and zooms crop world-space captions) puts the line in a
// fixed overlay above the table and everything else (screenOverlay), inside the format's safe
// box: x/y/w default to stage.box and are clamped into it, the type shrinks until the line fits
// the box's width, and the block is lifted if it would run past the box's foot. The line is
// still written word by word on its spoken frames, with its marks. Lead (non-key) words are
// set at leadScale × size, never under 60 px at 1080 wide (0.55 on screen; world-space keeps
// its old 0.46 unless leadScale is given). Without screen the line lives wherever it is built
// (inside table.add it rides the camera, as before).
export function say(
  stage,
  V,
  {
    line,
    x,
    y,
    w = 900,
    size = 120,
    night = false,
    accent = false,
    keyStyle = "display",
    tOut,
    align = "left",
    marks,
    screen = false,
    leadScale,
  },
) {
  const parent = screen ? screenOverlay(stage) : stage.dom;
  const safe = stage.box ?? { x: 0, y: 0, w: stage.W, h: stage.H };
  if (screen) {
    x = Math.min(Math.max(x ?? safe.x, safe.x), safe.x + safe.w - 200);
    y = Math.max(y ?? safe.y, safe.y);
    w = Math.min(w, safe.x + safe.w - x);
  }
  const words = V.words(line);
  const l = V.line(line);
  const markMap = { ...l.marks, ...marks };
  const next = V.lines[V.lines.findIndex((v) => v.id === line) + 1];
  const out = tOut ?? (next ? next.start - 0.12 : l.end + 0.5);
  const fg = night ? C().nightInk : C().ink;
  const box = document.createElement("div");
  Object.assign(box.style, {
    position: "absolute",
    left: "0",
    top: "0",
    width: `${w}px`,
    transform: `translate(${x}px, ${y}px)`,
    textAlign: align,
    lineHeight: "1.02",
  });
  const ratio = leadScale ?? (screen ? 0.55 : 0.46);
  // The floor only binds when the caller asked for the new legibility (screen or leadScale).
  const floor = screen || leadScale != null ? (60 * stage.W) / 1080 : 0;
  const smallOf = (sz) => Math.max(sz * ratio, floor);
  const spans = words.map((wd) => {
    const s = document.createElement("span");
    const hand = wd.key && keyStyle === "hand";
    Object.assign(s.style, {
      display: "inline-block",
      color:
        wd.key && (accent || hand)
          ? hand
            ? C().accentInk
            : night ? C().nightAccent : C().accent
          : fg,
      verticalAlign: "baseline",
      whiteSpace: "nowrap",
    });
    s.textContent = wd.w.replace(/[.,;:!?]+$/, "");
    box.append(s);
    return { s, wd, hand };
  });
  const setSize = (sz) => {
    for (const { s, wd, hand } of spans) {
      const face = wd.key ? (hand ? (F().script ?? F().serif) : F().display) : F().body;
      const px = wd.key ? (hand ? sz * 0.62 : sz) : smallOf(sz);
      s.style.marginRight = `${(wd.key ? sz : smallOf(sz)) * 0.24}px`;
      s.style.font = `${hand && !F().script ? "italic " : ""}400 ${px}px/1.05 ${css(face)}`;
    }
  };
  setSize(size);
  parent.append(box);
  if (screen) {
    // Fit: no word may stick out of the box's width, and the block must end above the box's foot.
    const fits = () => spans.every(({ s }) => s.offsetLeft + s.offsetWidth <= w + 1);
    while (!fits() && size > 40) setSize((size *= 0.94));
    const foot = safe.y + safe.h;
    if (y + box.offsetHeight > foot) y = Math.max(safe.y, foot - box.offsetHeight);
  }
  const handMarks = buildMarks(box, spans, markMap, line, night);
  return {
    box,
    end: out,
    // Where the line sits (after the screen fit): the box's top-left and the key size used.
    x,
    y,
    size,
    cues: () => handMarks.cues,
    draw(t) {
      // Exit: the line is wiped away (erased left to right in 0.22 s), never faded to a ghost
      // that lingers over a camera whip (fresh-eyes review, 2026-10-09).
      const l = progress(t, out, out + 0.22);
      box.style.visibility =
        t >= words[0].start - 0.05 && l < 1 ? "visible" : "hidden";
      box.style.transform = `translate(${x}px, ${y}px)`;
      box.style.opacity = "1";
      box.style.clipPath = l > 0 ? `inset(-40% -10% -40% ${l * 110}%)` : "none";
      // Letters are written or appear gradually: each word is revealed left to right
      // over the time it takes to say it (at least a beat of the eye), never popped whole.
      for (const { s, wd } of spans) {
        const p = progress(t, wd.start - 0.02, Math.max(wd.end, wd.start + 0.18));
        s.style.clipPath = `inset(-30% ${100 - p * 100}% -30% 0)`;
      }
      handMarks.draw(t);
    },
  };
}

// The screen overlay: one fixed layer per stage, above the stage's DOM layer (so above the table,
// a closing card and anything built later), never moved by a camera.
export function screenOverlay(stage) {
  if (!stage.screen) {
    const el = document.createElement("div");
    Object.assign(el.style, { position: "absolute", inset: "0", pointerEvents: "none", zIndex: "5" });
    (stage.root ?? stage.dom).append(el);
    stage.screen = el;
  }
  return stage.screen;
}

// ── Hand marks on words ──────────────────────────────────────────────────────────────────────

const MARK_KINDS = ["circle", "underline", "highlight", "strike"];
const PEN_SECONDS = 0.45; // word end → stroke complete
const MARKER_SECONDS = 0.4; // highlight sweep
const SVG_NS = "http://www.w3.org/2000/svg";

// A stable integer from a string, to seed each mark's jitter (never Math.random).
const seedOf = (str) => {
  let h = 2166136261;
  for (const c of str) h = Math.imul(h ^ c.codePointAt(0), 16777619);
  return h | 0;
};

const pathOf = (pts) =>
  pts.map(([x, y], i) => `${i ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");

// The geometry of one pen mark around/through a word's box r = { x, y, w, h } (caption px).
function penPath(kind, r, rand) {
  const j = (a) => (rand() - 0.5) * 2 * a;
  if (kind === "circle") {
    // A loose ellipse drawn clockwise from the upper left, closing past its own start: the
    // radius grows along the stroke so the overshoot lands outside where the pen began.
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;
    const rx = r.w / 2 + Math.max(16, r.h * 0.2);
    const ry = r.h * 0.6;
    const a0 = -Math.PI * (0.72 + rand() * 0.1);
    const sweep = Math.PI * 2 * 1.1;
    const tilt = -0.05 + j(0.02);
    const wob = rand() * Math.PI * 2;
    const pts = [];
    const n = 120;
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      const a = a0 + sweep * u;
      const k = 1 + 0.09 * u + 0.03 * Math.sin(2 * a + wob) + j(0.008);
      const ex = rx * k * Math.cos(a);
      const ey = ry * k * Math.sin(a);
      pts.push([cx + ex * Math.cos(tilt) - ey * Math.sin(tilt), cy + ex * Math.sin(tilt) + ey * Math.cos(tilt)]);
    }
    return pathOf(pts);
  }
  const pad = Math.max(6, r.h * 0.08);
  const x0 = r.x - pad;
  const x1 = r.x + r.w + pad;
  if (kind === "underline") {
    // Slightly wavy: a slow sine plus a drift, like a ruler-less pen line.
    const y = r.y + r.h * 0.98;
    const amp = Math.max(1.5, r.h * 0.02);
    const phase = rand() * Math.PI * 2;
    const drift = j(r.h * 0.015);
    const n = 28;
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      pts.push([x0 + (x1 - x0) * u, y + drift * u + amp * Math.sin(u * Math.PI * 3 + phase)]);
    }
    return pathOf(pts);
  }
  // strike: a straight-ish line through the x-height, a hair of tilt and wobble.
  const y = r.y + r.h * 0.6 + j(r.h * 0.02);
  const tilt = j(r.h * 0.04);
  return pathOf([
    [x0, y - tilt],
    [x0 + (x1 - x0) * 0.35, y - tilt * 0.3 + j(r.h * 0.01)],
    [x0 + (x1 - x0) * 0.7, y + tilt * 0.3 + j(r.h * 0.01)],
    [x1, y + tilt],
  ]);
}

// Marks for the words of one caption box. Geometry is measured lazily on the first draw (the
// fonts are loaded by then, so offsetLeft/Top/Width/Height are the same on every run) and the
// SVG layers live inside the box, so the marks move, sink and fade with the caption.
function buildMarks(box, spans, markMap, lineId, night = false) {
  const items = Object.entries(markMap).map(([key, kind]) => {
    if (!MARK_KINDS.includes(kind))
      throw new Error(`voice: mark "${kind}" on "${key}" in ${lineId} is not one of ${MARK_KINDS.join(", ")}`);
    const at = spans.findIndex(({ wd }) => norm(wd.w) === norm(key));
    if (at < 0) throw new Error(`voice: marked word "${key}" is not in ${lineId}`);
    const { wd } = spans[at];
    const pen = kind !== "highlight";
    return { key, kind, at, wd, pen, tStart: pen ? wd.end : wd.start };
  });
  const cues = items
    .map((m) => ({ t: m.tStart, type: m.pen ? "pen" : "marker" }))
    .sort((a, b) => a.t - b.t);
  let built = null;

  const layer = (zIndex) => {
    const svg = document.createElementNS(SVG_NS, "svg");
    Object.assign(svg.style, {
      position: "absolute",
      left: "0",
      top: "0",
      width: "100%",
      height: "100%",
      overflow: "visible",
      pointerEvents: "none",
      zIndex,
    });
    box.append(svg);
    return svg;
  };

  const build = () => {
    // Highlights sit in their own layer behind the text; pen strokes lie over it.
    const behind = layer("-1");
    const above = layer("1");
    return items.map((m) => {
      const { s } = spans[m.at];
      const r = { x: s.offsetLeft, y: s.offsetTop, w: s.offsetWidth, h: s.offsetHeight };
      const rand = rng(seedOf(`${lineId}:${m.key}:${m.kind}`));
      if (!m.pen) {
        const pad = r.h * 0.06;
        const rect = document.createElementNS(SVG_NS, "rect");
        const hh = r.h * 0.78;
        const rot = -0.8 + (rand() - 0.5) * 0.6;
        rect.setAttribute("x", String(r.x - pad));
        rect.setAttribute("y", String(r.y + r.h * 0.14));
        rect.setAttribute("height", String(hh));
        rect.setAttribute("rx", "3");
        rect.setAttribute("width", "0");
        rect.setAttribute(
          "transform",
          `rotate(${rot.toFixed(2)} ${r.x + r.w / 2} ${r.y + r.h / 2})`,
        );
        // Night captions: a wash multiplied into a dark ground vanishes; use a translucent rubric.
        Object.assign(rect.style, night ? { fill: C().nightAccent, opacity: "0.45" } : { fill: C().accentWash, mixBlendMode: "multiply" });
        behind.append(rect);
        return { ...m, rect, fullW: r.w + pad * 2 };
      }
      const path = document.createElementNS(SVG_NS, "path");
      path.setAttribute("d", penPath(m.kind, r, rand));
      Object.assign(path.style, {
        fill: "none",
        stroke: night ? C().nightAccent : C().accent,
        strokeWidth: String(Math.min(10, Math.max(3, r.h * 0.055))),
        strokeLinecap: "round",
        strokeLinejoin: "round",
      });
      above.append(path);
      const len = path.getTotalLength();
      path.style.strokeDasharray = String(len);
      path.style.strokeDashoffset = String(len);
      return { ...m, path, len };
    });
  };

  return {
    cues,
    draw(t) {
      if (!items.length) return;
      built ??= build();
      for (const m of built) {
        if (!m.pen) {
          const p = progress(t, m.tStart, m.tStart + MARKER_SECONDS);
          m.rect.setAttribute("width", String(m.fullW * (1 - (1 - p) ** 2)));
          continue;
        }
        const e = spring(t - m.tStart, SPRINGS.default.k, SPRINGS.default.d);
        m.path.style.strokeDashoffset = String(m.len * (1 - e));
        if (m.kind === "strike") {
          // The struck word steps back as the line lands.
          const dim = spring(t - m.tStart - 0.3, SPRINGS.default.k, SPRINGS.default.d);
          spans[m.at].s.style.opacity = String(1 - 0.45 * dim);
        }
      }
    },
  };
}
