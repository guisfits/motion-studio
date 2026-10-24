import type { Pose } from "./rig";

/**
 * Named poses for assets/cut/puppet.json (degrees, clockwise). `_l` is the arm on the viewer's
 * left: it swings outward with a positive angle, `_r` with a negative one.
 */
export const POSES: Record<string, Pose> = {
  rest: { upper_arm_l: 4, upper_arm_r: -4 },
  armsOut: { upper_arm_l: 50, upper_arm_r: -50, lower_arm_l: 6, lower_arm_r: -6 },
  waveUp: { upper_arm_r: -140, lower_arm_r: -28, head: -4 },
  waveIn: { upper_arm_r: -140, lower_arm_r: 28, head: -4 },
  point: { upper_arm_l: 82, lower_arm_l: 2, head: 8, torso: 2 },
  pointR: { upper_arm_r: -82, lower_arm_r: -2, head: -8, torso: -2 },
  nodDown: { head: 9 },
  nodUp: { head: -5 },
};

export type PoseKey = { at: number; pose: Pose };

/**
 * Linear blend between keyed poses; `at` is any monotone clock (frames or seconds). Before the
 * first key the first pose holds and after the last the last holds. A part a key leaves out counts
 * as 0 (rest) there, so an arm named in one key travels back to rest in the next that omits it.
 */
export function interpolatePose(keys: PoseKey[], t: number): Pose {
  if (keys.length === 0) return {};
  const sorted = [...keys].sort((a, b) => a.at - b.at);
  if (t <= sorted[0].at) return { ...sorted[0].pose };
  const last = sorted[sorted.length - 1];
  if (t >= last.at) return { ...last.pose };
  let i = 0;
  while (sorted[i + 1].at <= t) i++;
  const a = sorted[i];
  const b = sorted[i + 1];
  const p = (t - a.at) / (b.at - a.at);
  const out: Pose = {};
  for (const name of new Set([...Object.keys(a.pose), ...Object.keys(b.pose)])) {
    const from = a.pose[name] ?? 0;
    out[name] = from + ((b.pose[name] ?? 0) - from) * p;
  }
  return out;
}

/** Smoothstep-eased version of `interpolatePose`: each leg eases in and out like a hand-moved puppet. */
export function interpolatePoseEased(keys: PoseKey[], t: number): Pose {
  if (keys.length < 2) return interpolatePose(keys, t);
  const sorted = [...keys].sort((a, b) => a.at - b.at);
  if (t <= sorted[0].at || t >= sorted[sorted.length - 1].at) return interpolatePose(sorted, t);
  let i = 0;
  while (sorted[i + 1].at <= t) i++;
  const p = (t - sorted[i].at) / (sorted[i + 1].at - sorted[i].at);
  const e = p * p * (3 - 2 * p);
  return interpolatePose(sorted, sorted[i].at + e * (sorted[i + 1].at - sorted[i].at));
}
