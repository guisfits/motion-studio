import { describe, expect, it } from "vitest";
import { ExtrudeGeometry, Shape } from "three";
import { slabGeometry } from "../phone-geometry";
import { DEFAULT_PHONE_FINISH, defaultPhoneBody, phoneLayout, resolveFinish, type PhoneBody } from "../phone-spec";

// The slab Phone3D drew before bodies existed, constants and all.
const legacySlab = (w: number, h: number, depth: number) => {
  const r = 0.34;
  const s = new Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  const g = new ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 5, curveSegments: 14 });
  g.translate(0, 0, -depth / 2);
  return g;
};

// A modern phone with a plateau and a bar-and-punch-hole phone, in millimetres.
const PLATEAU: PhoneBody = {
  width: 71.9,
  height: 150,
  depth: 8.75,
  cornerRadius: 12.6,
  edgeBevel: 1.6,
  glassInset: 0.9,
  screen: { width: 66.6, height: 144.2, radius: 10.3 },
  rear: {
    kind: "plateau",
    height: 46,
    rise: 1.3,
    bevel: 0.9,
    bottomRadius: 7,
    lenses: [{ x: 22.8, y: 9.4, ringRadius: 7.7, glassRadius: 6.3, coreRadius: 2.8 }],
    flash: { x: -24, y: 9, radius: 2.4 },
    sensors: [{ x: -14.5, y: 9, radius: 0.6, tone: "dark" }],
    pane: { inset: 3.4, top: 48.6, bottom: 3.4, radius: 3, bottomRadius: 9.2 },
  },
  buttons: [
    { side: -1, top: 30, length: 7 },
    { side: 1, top: 102, length: 18, glass: true },
  ],
};
const BAR: PhoneBody = {
  width: 72,
  height: 152.8,
  depth: 8.5,
  cornerRadius: 11.4,
  edgeBevel: 0.8,
  glassInset: 0.6,
  screen: { width: 66, height: 147.2, radius: 8.6 },
  punch: { radius: 1.55, top: 4.6 },
  rear: { kind: "bar", height: 25, rise: 1.4, offsetTop: 15.5, bevel: 0.6, lenses: [] },
};

describe("default body", () => {
  it("is today's slab: outline, thickness, corner, bevel and screen constants", () => {
    const b = defaultPhoneBody();
    expect(b.width).toBeCloseTo(2.28, 12);
    expect(b.height).toBeCloseTo(4.58, 12);
    expect(b.depth).toBeCloseTo(0.3, 12);
    expect(b.cornerRadius).toBeCloseTo(0.38, 12);
    expect(b.edgeBevel).toBe(0.04);
    expect(b.screen.width).toBeCloseTo(2.0, 12);
    expect(b.screen.height).toBeCloseTo(4.14, 12);
    expect(b.screen.radius).toBe(0.24);
    expect(b.glassInset).toBeUndefined();
    expect(b.rear).toBeUndefined();
    expect(b.buttons).toBeUndefined();
    expect(b.punch).toBeUndefined();
  });

  it("follows the size and depth props", () => {
    const b = defaultPhoneBody([3, 6], 0.4);
    expect(b.width).toBeCloseTo(3.08, 12);
    expect(b.screen.width).toBeCloseTo(2.8, 12);
    expect(b.screen.height).toBeCloseTo(5.64, 12);
    expect(b.depth).toBeCloseTo(0.48, 12);
  });

  it("puts the screen where it always was: 0.046 over the extrusion's mid-plane edge", () => {
    expect(phoneLayout(defaultPhoneBody()).screen.z).toBeCloseTo(0.11 + 0.046, 12);
  });

  it("lays out nothing but the shell and the screen", () => {
    const l = phoneLayout(defaultPhoneBody());
    expect(l.glass).toBeNull();
    expect(l.pane).toBeNull();
    expect(l.module).toBeNull();
    expect(l.punch).toBeNull();
    expect(l.buttons).toEqual([]);
  });

  it("builds the very vertices the legacy slab had", () => {
    const l = phoneLayout(defaultPhoneBody()).shell;
    const now = slabGeometry({ width: l.width, height: l.height, radius: l.radius, depth: l.depth, bevel: l.bevel, curveSegments: l.curveSegments, bevelSegments: l.bevelSegments });
    const was = legacySlab(2.2, 4.5, 0.22);
    const a = now.attributes.position.array;
    const b = was.attributes.position.array;
    expect(a.length).toBe(b.length);
    let worst = 0;
    for (let i = 0; i < a.length; i++) worst = Math.max(worst, Math.abs(a[i] - b[i]));
    expect(worst).toBeLessThan(1e-6);
  });
});

describe("default finish", () => {
  it("is the single dark slab material, no pane, no env, no glare", () => {
    expect(DEFAULT_PHONE_FINISH).toMatchObject({ frame: "#1c1b1a", roughness: 0.32, metalness: 0.55, clearcoat: 0, reflect: 1, glare: 0 });
    const f = resolveFinish();
    expect(f.frame).toBe("#1c1b1a");
    expect(f.pane).toBe("#1c1b1a");
    expect(f.env).toBeNull();
    expect(f.glare).toBe(0);
  });

  it("fills only what is missing", () => {
    const f = resolveFinish({ frame: "#222", pane: "#111", roughness: 0.2, env: { src: "ground.jpg" }, glare: 0.35 });
    expect(f).toMatchObject({ frame: "#222", pane: "#111", roughness: 0.2, metalness: 0.55, reflect: 1, glare: 0.35 });
    expect(f.env).toEqual({ src: "ground.jpg", blur: 12, gain: 1.5 });
  });
});

describe("phoneLayout", () => {
  it("scales the fixed details with the thickness", () => {
    expect(phoneLayout(PLATEAU).k).toBe(1);
    const half = phoneLayout({ ...PLATEAU, depth: PLATEAU.depth / 2 });
    expect(half.k).toBe(0.5);
    expect(half.buttons[0].out).toBeCloseTo(0.7, 12);
  });

  it("stands the front glass 0.15 proud and the screen and sheen just over it", () => {
    const l = phoneLayout(PLATEAU);
    expect(l.glass).not.toBeNull();
    expect(l.glass!.width).toBeCloseTo(71.9 - 1.8, 12);
    expect(l.glass!.radius).toBeCloseTo(12.6 - 0.9, 12);
    expect(l.glass!.z + l.glass!.depth / 2).toBeCloseTo(8.75 / 2 + 0.15, 12);
    expect(l.screen.z).toBeCloseTo(8.75 / 2 + 0.18, 12);
    expect(l.sheen.z).toBeGreaterThan(l.screen.z);
    expect(l.sheen.width).toBe(l.glass!.width);
  });

  it("places the plateau flush with the top, lenses in plateau space", () => {
    const m = phoneLayout(PLATEAU).module!;
    expect(m.kind).toBe("plateau");
    expect(m.y).toBeCloseTo(75 - 23, 12);
    expect(m.z).toBe(-8.75 / 2);
    expect(m.faceZ).toBeCloseTo(-1.3 - 0.5, 12);
    expect(m.lenses[0]).toMatchObject({ x: 22.8, y: 9.4 });
    expect(m.lenses[0].z).toBeCloseTo(m.faceZ - 0.8, 12);
    expect(m.slab.bottomRadius).toBe(7);
    expect(m.discs.map((d) => d.tone)).toEqual(["flash", "dark"]);
  });

  it("places the bar below the top edge as a pill", () => {
    const m = phoneLayout(BAR).module!;
    expect(m.kind).toBe("bar");
    expect(m.y).toBeCloseTo(152.8 / 2 - 15.5 - 12.5, 12);
    expect(m.slab.radius).toBe(12.5);
    expect(m.slab.width).toBeCloseTo(72 - 1.6, 12);
  });

  it("insets the back pane from the frame and the module", () => {
    const p = phoneLayout(PLATEAU).pane!;
    expect(p.width).toBeCloseTo(71.9 - 6.8, 12);
    expect(p.height).toBeCloseTo(150 - 48.6 - 3.4, 12);
    expect(p.y).toBeCloseTo((3.4 - 48.6) / 2, 12);
    expect(p.bottomRadius).toBe(9.2);
  });

  it("defaults a pane to the whole back, inset", () => {
    const p = phoneLayout({ ...BAR, rear: { ...BAR.rear!, pane: { inset: 1 } } }).pane!;
    expect(p.height).toBeCloseTo(152.8 - 2, 12);
    expect(p.y).toBe(0);
    expect(p.radius).toBeCloseTo(11.4 - 1, 12);
    expect(p.bottomRadius).toBe(p.radius);
  });

  it("puts keys on the edges, from the top, the glass one flusher", () => {
    const [left, right] = phoneLayout(PLATEAU).buttons;
    expect(left.x).toBeCloseTo(-71.9 / 2 + 0.15, 12);
    expect(left.y).toBeCloseTo(75 - 30, 12);
    expect(right.x).toBeCloseTo(71.9 / 2 - 0.35, 12);
    expect(right.glass).toBe(true);
    expect(right.out).toBeLessThan(left.out);
  });

  it("puts the punch hole on the screen, under its top edge", () => {
    const p = phoneLayout(BAR).punch!;
    expect(p.hole.y).toBeCloseTo(147.2 / 2 - 4.6, 12);
    expect(p.ring.radius).toBeCloseTo(1.55 * 1.35, 12);
    expect(p.hole.z).toBeGreaterThan(p.ring.z);
    expect(phoneLayout(PLATEAU).punch).toBeNull();
  });

  it("is a pure function of the body", () => {
    expect(phoneLayout(PLATEAU)).toEqual(phoneLayout(structuredClone(PLATEAU)));
  });
});

describe("slabGeometry", () => {
  it("measures its outer size, bevel included", () => {
    const g = slabGeometry({ width: 10, height: 20, radius: 3, depth: 2, bevel: 0.4 });
    g.computeBoundingBox();
    const { min, max } = g.boundingBox!;
    expect(max.x - min.x).toBeCloseTo(10, 5);
    expect(max.y - min.y).toBeCloseTo(20, 5);
    expect(max.z - min.z).toBeCloseTo(2, 5);
    expect((max.z + min.z) / 2).toBeCloseTo(0, 5);
  });
});
