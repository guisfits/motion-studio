// Browser side of a film. createStage() builds the #stage (a canvas plus a DOM layer), loads
// the theme's fonts and the film's images, then run(draw) registers window.seek(t) for the
// renderer and, in a normal browser, a live looping preview with scrubbing.
//
// The render contract: draw(t) must set EVERYTHING the frame shows from t alone. No CSS
// transitions or animations, no timers, no state carried between calls, no Math.random.

import { layout } from "./layout.js";
import { theme } from "./theme.js";

const params = new URLSearchParams(location.search);
const rendering = navigator.webdriver || params.has("render");

function injectFontFaces() {
  const css = theme().fonts.map(
    (f) =>
      `@font-face{font-family:"${f.family}";font-style:${f.style};font-weight:400;` +
      `src:url(${f.url});${f.range ? `unicode-range:${f.range};` : ""}}`,
  ).join("\n");
  const style = document.createElement("style");
  style.textContent = css;
  document.head.append(style);
}

async function loadFonts() {
  // document.fonts.load only fetches faces some text needs; ask for each family/style
  // explicitly (with a Greek sample) so canvas text never falls back on frame 0.
  await Promise.all(
    theme().fonts.map((f) =>
      document.fonts.load(`${f.style} 400 32px "${f.family}"`, "Aaλ"),
    ),
  );
  await document.fonts.ready;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () =>
      img.decode().then(
        () => resolve(img),
        () => resolve(img),
      );
    img.onerror = () => reject(new Error(`image failed to load: ${src}`));
    img.src = src;
  });
}

// opts: { dur, formats = ['9x16'], images = { name: 'assets/x.png' }, background }
export async function createStage(opts) {
  const formats = opts.formats ?? ["9x16"];
  const format = params.get("format") ?? formats[0];
  if (!formats.includes(format))
    throw new Error(`film does not support format ${format}`);
  const L = layout(format);

  injectFontFaces();
  document.documentElement.style.background = "#111";
  document.body.style.margin = "0";

  const root = document.createElement("div");
  root.id = "stage";
  Object.assign(root.style, {
    position: "relative",
    width: `${L.W}px`,
    height: `${L.H}px`,
    overflow: "hidden",
    background: opts.background ?? theme().colors.ground,
    transformOrigin: "0 0",
  });
  const canvas = document.createElement("canvas");
  canvas.width = L.W;
  canvas.height = L.H;
  Object.assign(canvas.style, { position: "absolute", inset: "0" });
  root.append(canvas);
  // DOM layer above the canvas, for elements that need CSS (3D transforms, real text layout).
  const dom = document.createElement("div");
  Object.assign(dom.style, {
    position: "absolute",
    inset: "0",
    perspective: "2400px",
  });
  root.append(dom);
  document.body.append(root);

  const entries = Object.entries(opts.images ?? {});
  const [, imgs] = await Promise.all([
    loadFonts(),
    Promise.all(entries.map(([, src]) => loadImage(src))),
  ]);
  const img = Object.fromEntries(entries.map(([name], i) => [name, imgs[i]]));

  const stage = {
    ...L,
    dur: opts.dur,
    root,
    dom,
    canvas,
    g: canvas.getContext("2d"),
    img,
    rendering,
    // Helpers that clone images into the DOM push their decode() here; run() waits for all of
    // them so no frame ever paints an image that is still decoding.
    pending: [],
    // Per-frame waits (a recording's frame decoding): seek resolves only after all of them.
    frameWaits: [],
    waitFor(promise) {
      stage.frameWaits.push(promise);
    },
    // Register the film. draw(t) paints frame t; it is called with t in [0, dur).
    async run(draw) {
      await Promise.all(stage.pending);
      window.seek = async (t) => {
        draw(t);
        await Promise.all(stage.frameWaits.splice(0));
        return true;
      };
      window.FILM = { dur: opts.dur, format, formats, W: L.W, H: L.H };
      window.ready = true;
      if (!rendering) livePreview(stage, draw);
    },
  };
  return stage;
}

// Normal-browser preview: fits the stage to the window, loops, space pauses,
// ←/→ step 1 frame (shift: 1 s), the timecode shows under the stage.
function livePreview(stage, draw) {
  const fit = () => {
    const s = Math.min(
      (innerWidth - 32) / stage.W,
      (innerHeight - 64) / stage.H,
    );
    stage.root.style.transform = `scale(${s})`;
    stage.root.style.margin = "16px";
    document.body.style.height = `${stage.H * s + 64}px`;
  };
  fit();
  addEventListener("resize", fit);
  const tc = document.createElement("div");
  Object.assign(tc.style, {
    position: "fixed",
    left: "16px",
    bottom: "12px",
    color: "#ccc",
    font: "13px ui-monospace, monospace",
  });
  document.body.append(tc);
  let t = Number(params.get("t") ?? 0),
    paused = params.has("t"),
    last = performance.now();
  addEventListener("keydown", (e) => {
    if (e.code === "Space") paused = !paused;
    if (e.code === "ArrowRight") {
      paused = true;
      t += e.shiftKey ? 1 : 1 / 60;
    }
    if (e.code === "ArrowLeft") {
      paused = true;
      t -= e.shiftKey ? 1 : 1 / 60;
    }
  });
  (function loop(now) {
    if (!paused) t += (now - last) / 1000;
    last = now;
    t = ((t % stage.dur) + stage.dur) % stage.dur;
    draw(t);
    tc.textContent = `${t.toFixed(3)}s / ${stage.dur}s  ${stage.format}  ${paused ? "⏸" : "▶"}  space · ←/→ · shift`;
    requestAnimationFrame(loop);
  })(performance.now());
}
