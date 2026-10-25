// A phone as data: a body (shape and parts) and a finish (materials), both style-free. `Phone3D`
// renders any of them; the engine ships no phone model, a caller (a house layer) brings its own
// table. Everything here is pure: numbers in, numbers out, no three.js, no DOM.
//
// Units. A body is written in ONE length unit of the caller's choosing (millimetres reads best:
// a spec sheet's 150 x 71.9 x 8.75). `Phone3D` scales the whole body so its width is the scene
// width it is given. The few fixed details a spec does not name (lens-ring thickness, the lift
// of the screen over the glass, a button's depth, the sheen) are authored for an 8.75-thick body
// and scale with `depth`, so a body in any unit keeps its proportions.

/** Thickness (in the body's unit) the fixed details were authored for. */
export const DETAIL_DEPTH = 8.75;

/** A camera lens on the back: ring, glass, core, centred at (x, y) of the rear module. */
export type PhoneLens = { x: number; y: number; ringRadius: number; glassRadius: number; coreRadius: number };

/** A small disc on the rear module: a flash, a depth sensor (`glass`), a microphone (`dark`). */
export type PhoneSensor = { x: number; y: number; radius: number; tone: "flash" | "glass" | "dark" };

/** The glass or colour-matched pane that covers the back, inset from the frame. */
export type PhonePane = {
  /** Gap between the pane and the frame at the sides. */
  inset: number;
  /** Gap from the body's top edge to the pane's top edge; default `inset`. */
  top?: number;
  /** Gap from the body's bottom edge to the pane's bottom edge; default `inset`. */
  bottom?: number;
  /** Top corner radius; default `cornerRadius - inset`. */
  radius?: number;
  /** Bottom corner radius; default `radius`. */
  bottomRadius?: number;
};

/**
 * The camera module raised on the back. `plateau` is a slab flush with the top of the body and
 * as wide as the frame (its top corners follow the body); `bar` is a pill across the back, at
 * `offsetTop` below the top edge. Lens, flash and sensor positions are in body axes, measured
 * from the module's centre: +x toward the right when the phone is seen from the front.
 */
export type PhoneRearModule = {
  kind: "plateau" | "bar";
  /** Module height along the body. */
  height: number;
  /** How far the module rises above the back face. */
  rise: number;
  /** Gap from the body's top edge to the module's top edge; a plateau is flush (0). */
  offsetTop?: number;
  /** Rounding of the module's rise; default half of `rise`. */
  bevel?: number;
  /** Bottom corner radius; the top one is the body's (plateau) or half the height (bar). */
  bottomRadius?: number;
  lenses: PhoneLens[];
  flash?: { x: number; y: number; radius: number };
  sensors?: PhoneSensor[];
  pane?: PhonePane;
};

/** A key on a side edge. `side` -1 is the left edge seen from the front, 1 the right. */
export type PhoneButton = {
  side: -1 | 1;
  /** Distance from the body's top edge to the key's centre. */
  top: number;
  length: number;
  /** A dark glassy key (a capture button) instead of the frame's metal; it sits flusher. */
  glass?: boolean;
};

/** A front camera hole drawn on the screen: centre `top` below the screen's top edge. */
export type PhonePunch = { radius: number; top: number };

export type PhoneBody = {
  /** Outline and thickness, outer faces included. */
  width: number;
  height: number;
  depth: number;
  /** Outline corner radius. */
  cornerRadius: number;
  /** Rounding of the frame's edge (bevel). */
  edgeBevel: number;
  /** The lit screen, centred on the front. */
  screen: { width: number; height: number; radius: number };
  /** A dark glass slab set this far inside the outline, standing `glassRise` proud of the frame. */
  glassInset?: number;
  glassRise?: number;
  /** Distance of the lit screen over the front surface (glass when there is one). */
  screenLift?: number;
  punch?: PhonePunch;
  rear?: PhoneRearModule;
  buttons?: PhoneButton[];
  /** Mesh quality of the outline's corners and of the bevel; raise both for close-ups. */
  curveSegments?: number;
  bevelSegments?: number;
};

/** A texture URL the body reflects (a photo of the ground, a room): blurred, then wrapped. */
export type PhoneEnvironment = { src: string; blur?: number; gain?: number };

export type PhoneFinish = {
  /** The frame (and, on the default body, the whole slab). */
  frame: string;
  roughness?: number;
  metalness?: number;
  /** A lacquer layer over the frame; 0 (default) is none. */
  clearcoat?: number;
  /** The back pane's colour (default: the frame's) and surface. */
  pane?: string;
  paneRoughness?: number;
  paneMetalness?: number;
  /** What the polished parts reflect; omitted, they use the scene's own environment. */
  env?: PhoneEnvironment;
  /** Multiplier on every reflection (default 1). */
  reflect?: number;
  /** Sheen laid over the screen: only the reflection, so the picture stays readable; 0 is none. */
  glare?: number;
};

// The slab `Phone3D` drew before bodies existed. `size` and `depth` were the extrusion's own
// rectangle; the bevel (0.04) swelled it outward, so the outer faces are 0.08 larger.
const LEGACY_BEVEL = 0.04;
const LEGACY_CORNER = 0.34;
const LEGACY_SCREEN_INSET: [number, number] = [0.2, 0.36];
const LEGACY_SCREEN_RADIUS = 0.24;
const LEGACY_SCREEN_LIFT = 0.006;

/** Today's generic slab, from the `size` and `depth` props, as a body. */
export const defaultPhoneBody = (size: [number, number] = [2.2, 4.5], depth = 0.22): PhoneBody => ({
  width: size[0] + 2 * LEGACY_BEVEL,
  height: size[1] + 2 * LEGACY_BEVEL,
  depth: depth + 2 * LEGACY_BEVEL,
  cornerRadius: LEGACY_CORNER + LEGACY_BEVEL,
  edgeBevel: LEGACY_BEVEL,
  screen: { width: size[0] - LEGACY_SCREEN_INSET[0], height: size[1] - LEGACY_SCREEN_INSET[1], radius: LEGACY_SCREEN_RADIUS },
  screenLift: LEGACY_SCREEN_LIFT,
  curveSegments: 14,
  bevelSegments: 5,
});

/** Today's single dark slab material. */
export const DEFAULT_PHONE_FINISH: Required<Pick<PhoneFinish, "frame" | "roughness" | "metalness" | "clearcoat" | "reflect" | "glare">> = {
  frame: "#1c1b1a",
  roughness: 0.32,
  metalness: 0.55,
  clearcoat: 0,
  reflect: 1,
  glare: 0,
};

export type ResolvedFinish = {
  frame: string;
  roughness: number;
  metalness: number;
  clearcoat: number;
  pane: string;
  paneRoughness: number;
  paneMetalness: number;
  env: Required<PhoneEnvironment> | null;
  reflect: number;
  glare: number;
};

/** A finish with every default filled in. */
export const resolveFinish = (finish?: PhoneFinish): ResolvedFinish => {
  const d = DEFAULT_PHONE_FINISH;
  const frame = finish?.frame ?? d.frame;
  return {
    frame,
    roughness: finish?.roughness ?? d.roughness,
    metalness: finish?.metalness ?? d.metalness,
    clearcoat: finish?.clearcoat ?? d.clearcoat,
    pane: finish?.pane ?? frame,
    paneRoughness: finish?.paneRoughness ?? 0.5,
    paneMetalness: finish?.paneMetalness ?? 0.15,
    env: finish?.env ? { src: finish.env.src, blur: finish.env.blur ?? 12, gain: finish.env.gain ?? 1.5 } : null,
    reflect: finish?.reflect ?? d.reflect,
    glare: finish?.glare ?? d.glare,
  };
};

type Rect = { width: number; height: number; radius: number; bottomRadius: number };
type At<T> = T & { x: number; y: number; z: number };

export type PhoneLayout = {
  /** Scale of the fixed details: `depth / DETAIL_DEPTH`. */
  k: number;
  shell: { width: number; height: number; depth: number; radius: number; bevel: number; curveSegments: number; bevelSegments: number };
  /** Front glass slab, when the body has a `glassInset`. */
  glass: At<Rect & { depth: number; bevel: number }> | null;
  screen: At<{ width: number; height: number; radius: number }>;
  /** Where the sheen lies: over the glass slab, else over the screen. */
  sheen: At<{ width: number; height: number; radius: number }>;
  punch: { ring: At<{ radius: number; height: number }>; hole: At<{ radius: number; height: number }> } | null;
  pane: At<Rect & { depth: number; bevel: number }> | null;
  module: {
    kind: "plateau" | "bar";
    /** Module origin: x 0, y centre of the module, z the back face. */
    y: number;
    z: number;
    /** The module's own slab, in module space. */
    slab: At<Rect & { depth: number; bevel: number }>;
    /** z of the module's outer face, in module space. */
    faceZ: number;
    lenses: At<PhoneLens & { ringHeight: number; glassHeight: number; coreHeight: number }>[];
    discs: At<{ radius: number; height: number; tone: PhoneSensor["tone"] }>[];
  } | null;
  buttons: At<{ length: number; out: number; thick: number; radius: number; glass: boolean }>[];
};

/** Every placed part of a body, as plain numbers (z = 0 is the body's mid-plane, +z the front). */
export const phoneLayout = (body: PhoneBody): PhoneLayout => {
  const k = body.depth / DETAIL_DEPTH;
  const { width: w, height: h, depth, cornerRadius: r, edgeBevel: edge } = body;
  const slabOf = (rect: { width: number; height: number; radius: number; bottomRadius?: number }) => ({
    ...rect,
    bottomRadius: rect.bottomRadius ?? rect.radius,
  });

  let glass: PhoneLayout["glass"] = null;
  let frontZ = depth / 2;
  if (body.glassInset && body.glassInset > 0) {
    const gi = body.glassInset;
    const rise = body.glassRise ?? 0.15 * k;
    const thickness = 0.5 * k;
    glass = {
      ...slabOf({ width: w - 2 * gi, height: h - 2 * gi, radius: r - gi }),
      depth: thickness,
      bevel: 0.2 * k,
      x: 0,
      y: 0,
      z: depth / 2 + rise - thickness / 2,
    };
    frontZ = depth / 2 + rise;
  }
  const screenZ = frontZ + (body.screenLift ?? 0.03 * k);
  const screen = { ...body.screen, x: 0, y: 0, z: screenZ };
  const sheen = glass
    ? { width: glass.width, height: glass.height, radius: glass.radius, x: 0, y: 0, z: screenZ + 0.03 * k }
    : { ...body.screen, x: 0, y: 0, z: screenZ + 0.03 * k };

  const punch = body.punch
    ? (() => {
        const y = body.screen.height / 2 - body.punch.top;
        return {
          ring: { radius: body.punch.radius * 1.35, height: 0.1 * k, x: 0, y, z: screenZ + 0.05 * k },
          hole: { radius: body.punch.radius, height: 0.1 * k, x: 0, y, z: screenZ + 0.07 * k },
        };
      })()
    : null;

  const backZ = -depth / 2;
  const rear = body.rear;
  let pane: PhoneLayout["pane"] = null;
  let module: PhoneLayout["module"] = null;
  if (rear) {
    if (rear.pane) {
      const p = rear.pane;
      const top = p.top ?? p.inset;
      const bottom = p.bottom ?? p.inset;
      const radius = p.radius ?? r - p.inset;
      pane = {
        width: w - 2 * p.inset,
        height: h - top - bottom,
        radius,
        bottomRadius: p.bottomRadius ?? radius,
        depth: 0.4 * k,
        bevel: 0.15 * k,
        x: 0,
        y: (bottom - top) / 2,
        z: backZ + 0.1 * k,
      };
    }
    const top = rear.offsetTop ?? 0;
    const bevel = rear.bevel ?? rear.rise / 2;
    const slabDepth = rear.rise * 2 + k;
    const faceZ = -rear.rise - 0.5 * k;
    const moduleSlab =
      rear.kind === "plateau"
        ? {
            // Half buried in the body, so the plateau reads as one piece with the frame.
            width: w - 2 * edge,
            height: rear.height - edge,
            radius: r - edge,
            bottomRadius: rear.bottomRadius ?? r - edge,
            x: 0,
            y: edge / 2 - 0.5 * k,
            z: 0,
            depth: slabDepth,
            bevel,
          }
        : {
            width: w - 2 * edge,
            height: rear.height,
            radius: rear.height / 2,
            bottomRadius: rear.bottomRadius ?? rear.height / 2,
            x: 0,
            y: 0,
            z: 0,
            depth: slabDepth,
            bevel,
          };
    const discs: NonNullable<PhoneLayout["module"]>["discs"] = [];
    if (rear.flash) discs.push({ radius: rear.flash.radius, height: 0.6 * k, tone: "flash", x: rear.flash.x, y: rear.flash.y, z: faceZ - 0.2 * k });
    for (const s of rear.sensors ?? []) {
      const dark = s.tone === "dark";
      discs.push({ radius: s.radius, height: (dark ? 0.4 : 0.6) * k, tone: s.tone, x: s.x, y: s.y, z: faceZ - (dark ? 0.15 : 0.2) * k });
    }
    module = {
      kind: rear.kind,
      y: h / 2 - top - rear.height / 2,
      z: backZ,
      slab: moduleSlab,
      faceZ,
      lenses: rear.lenses.map((l) => ({
        ...l,
        ringHeight: 1.8 * k,
        glassHeight: 1.84 * k,
        coreHeight: 1.88 * k,
        z: faceZ - 0.8 * k,
      })),
      discs,
    };
  }

  const buttons = (body.buttons ?? []).map((b) => {
    const glassKey = b.glass === true;
    const inset = (glassKey ? 0.35 : 0.15) * k;
    return {
      length: b.length,
      out: (glassKey ? 1.0 : 1.4) * k,
      thick: 3.0 * k,
      radius: 0.5 * k,
      glass: glassKey,
      x: b.side * (w / 2) - b.side * inset,
      y: h / 2 - b.top,
      z: 0,
    };
  });

  return {
    k,
    shell: {
      width: w,
      height: h,
      depth,
      radius: r,
      bevel: edge,
      curveSegments: body.curveSegments ?? 14,
      bevelSegments: body.bevelSegments ?? 5,
    },
    glass,
    screen,
    sheen,
    punch,
    pane,
    module,
    buttons,
  };
};
