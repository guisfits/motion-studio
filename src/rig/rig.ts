export type Part = {
  part: string;
  file: string;
  /** Hinge point inside the part's own image, in source px. */
  pivot: [number, number];
  parent?: string | null;
  /** Top-left of the part in the assembled figure at rest, in source px (default 0,0). */
  origin?: [number, number];
};

/** Degrees per part, clockwise, relative to the part's parent. */
export type Pose = Record<string, number>;

/**
 * Where a part's hinge lands in figure space and how far the part has turned in total.
 * `x, y` is the pivot's position (source px, figure origin), `rotate` the cumulative angle in degrees.
 * To draw: place the image's top-left at (x - pivot[0], y - pivot[1]) and rotate about its pivot.
 */
export type Placed = { x: number; y: number; rotate: number };

/** Throws naming every part that has no image URL in `images` (an <Img> with no source fails with no hint of which part). */
export function assertImages(parts: Part[], images: Record<string, string>): void {
  const missing = parts.filter((p) => !images[p.part]).map((p) => p.part);
  if (missing.length) throw new Error(`rig: no image for part${missing.length > 1 ? "s" : ""} ${missing.join(", ")}`);
}

// Degrees to radians.
const rad = (deg: number) => (deg * Math.PI) / 180;

/**
 * Forward kinematics for a cut-out rig. Each part turns about its own pivot by its pose angle, and
 * everything it carries (its children) turns with it: a child's pivot keeps its rest offset from
 * the parent's pivot, rotated by the parent's cumulative angle. Pure; a part missing from `pose`
 * rests at 0 and a pose key naming no part is ignored. Part order in the list does not matter.
 */
export function solve(parts: Part[], pose: Pose): Record<string, Placed> {
  const byName = new Map(parts.map((p) => [p.part, p]));
  for (const p of parts) {
    if (p.parent != null && !byName.has(p.parent)) throw new Error(`rig: ${p.part} has unknown parent ${p.parent}`);
    let q: Part = p;
    for (let n = 0; q.parent != null; q = byName.get(q.parent)!) {
      if (++n > parts.length) throw new Error(`rig: ${p.part} sits in a parent loop`);
    }
  }
  const rest = (p: Part): [number, number] => [(p.origin?.[0] ?? 0) + p.pivot[0], (p.origin?.[1] ?? 0) + p.pivot[1]];
  const done = new Map<string, Placed>();
  const place = (p: Part): Placed => {
    const known = done.get(p.part);
    if (known) return known;
    const own = pose[p.part] ?? 0;
    const [rx, ry] = rest(p);
    let placed: Placed;
    if (p.parent == null) {
      placed = { x: rx, y: ry, rotate: own };
    } else {
      const parent = byName.get(p.parent)!;
      const up = place(parent);
      const [px, py] = rest(parent);
      const a = rad(up.rotate);
      const dx = rx - px;
      const dy = ry - py;
      placed = {
        x: up.x + dx * Math.cos(a) - dy * Math.sin(a),
        y: up.y + dx * Math.sin(a) + dy * Math.cos(a),
        rotate: up.rotate + own,
      };
    }
    done.set(p.part, placed);
    return placed;
  };
  const out: Record<string, Placed> = {};
  for (const p of parts) out[p.part] = place(p);
  return out;
}
