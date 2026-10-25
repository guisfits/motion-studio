import { CylinderGeometry, ExtrudeGeometry, Shape, ShapeGeometry, type BufferGeometry } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/** Outline of a w x h rectangle centred on the origin; the top corners and the bottom ones each have a radius. */
export const roundedRect = (w: number, h: number, rTop: number, rBottom = rTop): Shape => {
  const s = new Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + rBottom, y);
  s.lineTo(x + w - rBottom, y);
  s.absarc(x + w - rBottom, y + rBottom, rBottom, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - rTop);
  s.absarc(x + w - rTop, y + h - rTop, rTop, 0, Math.PI / 2, false);
  s.lineTo(x + rTop, y + h);
  s.absarc(x + rTop, y + h - rTop, rTop, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + rBottom);
  s.absarc(x + rBottom, y + rBottom, rBottom, Math.PI, Math.PI * 1.5, false);
  return s;
};

export type SlabSpec = {
  width: number;
  height: number;
  radius: number;
  bottomRadius?: number;
  depth: number;
  bevel: number;
  curveSegments?: number;
  bevelSegments?: number;
};

/**
 * A rounded-rect slab with a rounded edge, centred on z = 0. `width`, `height`, `radius` and
 * `depth` are the OUTER size: the bevel grows outward from the extruded outline, so the outline
 * is shrunk by it first.
 */
export const slabGeometry = (s: SlabSpec): ExtrudeGeometry => {
  const b = s.bevel;
  const g = new ExtrudeGeometry(roundedRect(s.width - 2 * b, s.height - 2 * b, s.radius - b, (s.bottomRadius ?? s.radius) - b), {
    depth: s.depth - 2 * b,
    bevelEnabled: true,
    bevelThickness: b,
    bevelSize: b,
    bevelSegments: s.bevelSegments ?? 5,
    curveSegments: s.curveSegments ?? 14,
  });
  g.translate(0, 0, -(s.depth - 2 * b) / 2);
  return g;
};

/** Flat rounded-rect geometry whose UVs span 0..1 across the box, so a map covers it exactly. */
export const flatRectGeometry = (w: number, h: number, r: number): ShapeGeometry => {
  const g = new ShapeGeometry(roundedRect(w, h, r), 12);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / h + 0.5);
  return g;
};

/** A disc standing on its face (axis along z), for lenses, flashes and the punch hole. */
export const discGeometry = (radius: number, height: number, segments = 64): BufferGeometry => {
  const g = new CylinderGeometry(radius, radius, height, segments);
  g.rotateX(Math.PI / 2);
  return g;
};

/** A side key: a rounded box, `out` deep across the edge, `length` along it, `thick` through the body. */
export const buttonGeometry = (out: number, length: number, thick: number, radius: number): BufferGeometry =>
  new RoundedBoxGeometry(out, length, thick, 3, radius);
