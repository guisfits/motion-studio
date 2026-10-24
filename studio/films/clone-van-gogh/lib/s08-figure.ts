import type { Part } from "../../../../src/rig";

type Cut = { origin: readonly [number, number]; pivot: readonly [number, number] };

/**
 * Rig parts of a figure cut by lib/s08-cut-arms.py: the torso hinges at the hip (so leaning moves
 * everything), each arm is a shoulder joint (`ua_<side>`) carrying an elbow joint (`fa_<side>`).
 * List order is draw order: forearms land on top of their upper arms.
 */
export function figureParts(cuts: Record<string, Cut>, hip: [number, number], sides: string[], file: (name: string) => string): Part[] {
  const t = cuts.torso;
  const parts: Part[] = [{ part: "torso", file: file("torso"), pivot: hip, parent: null, origin: [t.origin[0], t.origin[1]] }];
  for (const s of sides) {
    const u = cuts[`ua_${s}`];
    const f = cuts[`fa_${s}`];
    parts.push({ part: `ua_${s}`, file: file(`ua_${s}`), pivot: [u.pivot[0], u.pivot[1]], parent: "torso", origin: [u.origin[0], u.origin[1]] });
    parts.push({ part: `fa_${s}`, file: file(`fa_${s}`), pivot: [f.pivot[0], f.pivot[1]], parent: `ua_${s}`, origin: [f.origin[0], f.origin[1]] });
  }
  return parts;
}
