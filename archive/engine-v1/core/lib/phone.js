// An iPhone built in the DOM layer, holding real app screenshots or screen recordings
// (makeClip from lib/clip.js; drive it with clip.at(s) in draw). Being DOM, the film can
// tilt it in 3D (CSS transforms set inside seek). Every screen is its own preloaded layer, so
// switching screens is an opacity/transform change, never an image load mid-render.
//
//   const phone = makePhone(stage, { width: 620, screens: [stage.img.reader, stage.img.lexicon] });
//   // in draw(t):
//   phone.el.style.transform = `translate(${x}px, ${y}px) rotateY(${ry}deg)`;
//   phone.show(1, a);            // screen 1 at opacity a, the others hidden behind
//   phone.scroll(0, px);         // scroll screen 0's content up by px (for long screenshots)

// iPhone 17 proportions (simulator screenshot 1206 × 2622 px, which already includes the
// status bar and the Dynamic Island, so the frame draws only the body and bezel).
const SCREEN_RATIO = 2622 / 1206;

// kind: "iphone" (default) or "android" (a Pixel-like body: thinner bezel, tighter corners).
// An Android body must hold Android takes (recorded on the emulator), never an iOS screen.
export function makePhone(
  stage,
  { width = 600, screens = [], dark = false, kind = "iphone", ratio = SCREEN_RATIO } = {},
) {
  const android = kind === "android";
  const bezel = Math.round(width * (android ? 0.026 : 0.034));
  const screenW = width - bezel * 2;
  const screenH = Math.round(screenW * ratio);
  const height = screenH + bezel * 2;
  const radius = Math.round(width * (android ? 0.11 : 0.165));

  const el = document.createElement("div");
  Object.assign(el.style, {
    position: "absolute",
    left: "0",
    top: "0",
    width: `${width}px`,
    height: `${height}px`,
    borderRadius: `${radius}px`,
    background: dark ? "#2b2a28" : "#1d1c1a",
    boxShadow:
      "0 2px 0 1px #4a4844 inset, 0 30px 60px -20px rgba(40,30,20,.45), 0 60px 120px -40px rgba(40,30,20,.35)",
    transformStyle: "preserve-3d",
    willChange: "auto",
  });
  const screen = document.createElement("div");
  Object.assign(screen.style, {
    position: "absolute",
    left: `${bezel}px`,
    top: `${bezel}px`,
    width: `${screenW}px`,
    height: `${screenH}px`,
    borderRadius: `${radius - bezel}px`,
    overflow: "hidden",
    background: "#000",
  });
  el.append(screen);

  const layers = screens.map((img, i) => {
    const layer = document.createElement("div");
    Object.assign(layer.style, {
      position: "absolute",
      inset: "0",
      opacity: i === 0 ? "1" : "0",
    });
    // A clip (lib/clip.js) is a live recording: use its element, it decodes per frame.
    const pic = img.el ?? img.cloneNode();
    // Screenshots are captured at the device's aspect; longer captures scroll inside the screen.
    Object.assign(pic.style, {
      position: "absolute",
      left: "0",
      top: "0",
      width: `${screenW}px`,
      height: "auto",
    });
    layer.append(pic);
    screen.append(layer);
    if (!img.el) stage.pending.push(pic.decode().catch(() => {}));
    return { layer, pic };
  });

  stage.dom.append(el);

  return {
    el,
    width,
    height,
    screenW,
    screenH,
    layers,
    // Screen i on top at opacity a, screen i - 1 fully visible under it, the rest hidden.
    show(i, a = 1) {
      layers.forEach((l, j) => {
        l.layer.style.opacity = j === i ? String(a) : j === i - 1 ? "1" : "0";
      });
      layers.forEach((l, j) => {
        l.layer.style.zIndex = String(j === i ? 2 : 1);
      });
    },
    // iOS navigation push from screen i - 1 to screen i at progress p (0..1): the new screen
    // slides in from the right over the old one, which parallax-slides a third to the left.
    // Two full screens never overlap translucently.
    push(i, p) {
      layers.forEach((l, j) => {
        const visible = j === i || (j === i - 1 && p < 1);
        l.layer.style.opacity = visible ? "1" : "0";
        l.layer.style.zIndex = String(j === i ? 2 : 1);
        l.layer.style.transform =
          j === i ? `translateX(${(1 - p) * 100}%)` : j === i - 1 ? `translateX(${-p * 33}%)` : "none";
        l.layer.style.boxShadow = j === i && p < 1 ? "-12px 0 24px -12px rgba(0,0,0,.35)" : "none";
      });
    },
    scroll(i, px) {
      layers[i].pic.style.transform = `translateY(${-px}px)`;
    },
  };
}

// A region of a screenshot as its own DOM element, for "exploded UI": crop a real panel off the
// phone and lift it toward the viewer. crop is in screenshot pixels; width is the on-stage width.
//
//   const card = makePanel(stage, stage.img.lexicon, { x: 0, y: 367, w: 1206, h: 518 }, { width: 640 });
//   // in draw(t): card.el.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateY(${ry}deg)`;
export function makePanel(stage, img, crop, { width = crop.w / 2, radius = 0, shadow = true } = {}) {
  const s = width / crop.w;
  const el = document.createElement("div");
  Object.assign(el.style, {
    position: "absolute",
    left: "0",
    top: "0",
    width: `${width}px`,
    height: `${crop.h * s}px`,
    overflow: "hidden",
    borderRadius: `${radius}px`,
    boxShadow: shadow
      ? "0 4px 8px -4px rgba(60,40,20,.18), 0 26px 50px -18px rgba(60,40,20,.32)"
      : "none",
    transformOrigin: "50% 50%",
  });
  const pic = img.cloneNode();
  Object.assign(pic.style, {
    position: "absolute",
    left: `${-crop.x * s}px`,
    top: `${-crop.y * s}px`,
    width: `${img.naturalWidth * s}px`,
    height: "auto",
  });
  el.append(pic);
  stage.dom.append(el);
  stage.pending.push(pic.decode().catch(() => {}));
  return { el, width, height: crop.h * s };
}
