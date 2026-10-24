// Cut-out puppet rigs on a film page: a picture split into hinged paper parts (made by
// reference/rig.mjs). The rig is a pure function of its angles, like everything a film draws: the
// same angles always give the same pose, in any order.
//
//   const rig = await loadRig("assets/rigs/pauwels-teses/rig.json");   // or stage.pending.push(...)
//   // in draw(t):
//   drawRig(stage.dom, rig, { angles: stepPose(t, KEYS), x: 540, y: 900, scale: 0.8, origin: [pivotX, pivotY] });
//
// Angles are degrees, positive clockwise, per part, relative to the part's parent: turning a
// parent carries its children along, each hinged about its own pivot (a point in source px).

export const clamp01 = (x) => Math.min(1, Math.max(0, x));

// 2D affine matrices as [a, b, c, d, e, f], the same order as CSS matrix() and canvas setTransform.
export const IDENTITY = [1, 0, 0, 1, 0, 0];
export const multiply = (m, n) => [
  m[0] * n[0] + m[2] * n[1],
  m[1] * n[0] + m[3] * n[1],
  m[0] * n[2] + m[2] * n[3],
  m[1] * n[2] + m[3] * n[3],
  m[0] * n[4] + m[2] * n[5] + m[4],
  m[1] * n[4] + m[3] * n[5] + m[5],
];
export const translate = (x, y) => [1, 0, 0, 1, x, y];
export const scaling = (s) => [s, 0, 0, s, 0, 0];
export function rotation(deg) {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r),
    s = Math.sin(r);
  return [c, s, -s, c, 0, 0];
}
// Turn by `deg` about the point (px, py).
export const rotateAbout = (deg, px, py) => multiply(translate(px, py), multiply(rotation(deg), translate(-px, -py)));
export const apply = (m, [x, y]) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];

// Validates a rig.json and indexes it. Parents must exist and may not form a loop; a part may be
// listed before its parent (the order in the file is only the tie-break for z).
export function checkRig(rig) {
  if (!rig || !Array.isArray(rig.parts) || rig.parts.length === 0) throw new Error("rig: no parts");
  const byName = new Map();
  for (const p of rig.parts) {
    if (byName.has(p.name)) throw new Error(`rig: duplicate part ${p.name}`);
    byName.set(p.name, p);
  }
  for (const p of rig.parts) {
    if (p.parent != null && !byName.has(p.parent)) throw new Error(`rig: ${p.name} has unknown parent ${p.parent}`);
    for (let q = p, n = 0; q.parent != null; q = byName.get(q.parent))
      if (++n > rig.parts.length) throw new Error(`rig: ${p.name} sits in a parent loop`);
  }
  return byName;
}

// The matrix of every part for a pose: rotate about the pivot, then whatever the parent did.
// A part's own matrix maps its image's top-left corner (at rest, source px) to the stage, so the
// element is drawn at left/top 0 with transform-origin 0 0. `x, y` is where the source point
// `origin` lands on the stage, after `scale`; both default to the source's own top-left.
export function poseMatrices(rig, angles = {}, { x = 0, y = 0, scale = 1, origin = [0, 0] } = {}) {
  const byName = checkRig(rig);
  const base = multiply(translate(x, y), multiply(scaling(scale), translate(-origin[0], -origin[1])));
  const memo = new Map();
  const world = (p) => {
    if (memo.has(p.name)) return memo.get(p.name);
    const up = p.parent == null ? base : world(byName.get(p.parent));
    const m = multiply(up, rotateAbout(angles[p.name] ?? 0, p.pivot[0], p.pivot[1]));
    memo.set(p.name, m);
    return m;
  };
  return rig.parts.map((p, i) => ({ part: p, order: i, matrix: multiply(world(p), translate(p.x, p.y)) }));
}

// Drawing order: z ascending, the file's order breaks ties (a later part sits on top).
export const drawOrder = (poses) => [...poses].sort((a, b) => (a.part.z ?? 0) - (b.part.z ?? 0) || a.order - b.order);

export const cssMatrix = (m) => `matrix(${m.map((v) => +v.toFixed(5)).join(",")})`;

// Loads rig.json and every part picture. Part files are resolved next to the rig.json. With a
// stage, the load is also queued in stage.pending so the first frame never paints a missing part.
export function loadRig(url, stage) {
  const dir = url.slice(0, url.lastIndexOf("/") + 1);
  const job = fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`rig missing: ${url} (run reference/rig.mjs)`);
      return r.json();
    })
    .then(async (rig) => {
      checkRig(rig);
      await Promise.all(
        rig.parts.map(
          (p) =>
            new Promise((resolve, reject) => {
              const img = new Image();
              p.url = dir + p.file;
              img.onload = () => img.decode().then(resolve, resolve);
              img.onerror = () => reject(new Error(`rig part failed to load: ${p.url}`));
              img.src = p.url;
              p.img = img;
            }),
        ),
      );
      return rig;
    });
  stage?.pending.push(job);
  return job;
}

// Draws a pose into a canvas context (clear it first) or a DOM container (the parts are created
// once per container and only moved afterwards). A part the rig marks `hidden` (closed eyelids) is
// drawn only while `opts.show` lists its name. Returns the poses it drew.
export function drawRig(target, rig, opts = {}) {
  const poses = poseMatrices(rig, opts.angles, opts);
  if (typeof target.drawImage === "function") {
    for (const { part, matrix } of drawOrder(poses)) {
      if (!isShown(part, opts.show)) continue;
      target.save();
      target.setTransform(...matrix);
      target.drawImage(part.img, 0, 0, part.w, part.h);
      target.restore();
    }
    return poses;
  }
  const els = (rigElements.get(target) ?? new Map()).get(rig) ?? mountRig(target, rig);
  drawOrder(poses).forEach(({ part, matrix }, i) => {
    const el = els.get(part.name);
    el.style.transform = cssMatrix(matrix);
    el.style.zIndex = String(i);
    el.style.display = isShown(part, opts.show) ? "block" : "none";
  });
  return poses;
}

const isShown = (part, show) => !part.hidden || (show ?? []).includes(part.name);

const rigElements = new WeakMap();
function mountRig(container, rig) {
  const els = new Map();
  for (const part of rig.parts) {
    const el = new Image();
    el.src = part.url ?? part.img?.src;
    Object.assign(el.style, {
      position: "absolute",
      left: "0",
      top: "0",
      width: `${part.w}px`,
      height: `${part.h}px`,
      transformOrigin: "0 0",
      display: "block",
    });
    container.append(el);
    els.set(part.name, el);
  }
  const forTarget = rigElements.get(container) ?? new Map();
  forTarget.set(rig, els);
  rigElements.set(container, forTarget);
  return els;
}

// ---- Stepped poses -------------------------------------------------------------------------

export const EASES = {
  linear: (p) => p,
  in: (p) => p * p,
  out: (p) => 1 - (1 - p) * (1 - p),
  inOut: (p) => (p < 0.5 ? 2 * p * p : 1 - 2 * (1 - p) * (1 - p)),
};

// Snaps a time down to the pose grid: a puppet is moved a few times a second, not continuously.
export const quantize = (t, fps = 12) => Math.floor(t * fps + 1e-6) / fps;

// Keyframes [{ t, angles: { part: deg } }] to the angles at time t. Between keys the pose is HELD
// (the previous key shows until the next one's time), which gives the pose-swap feel of paper cut
// by hand; time is snapped to `fps` first. A part a key leaves out keeps its last angle (0 before
// any). With `ease` ("linear" | "in" | "out" | "inOut" or a function p => p) the angles travel from
// one key to the next instead, but still in `fps` steps.
export function stepPose(t, keys, fps = 12, { ease } = {}) {
  if (!Array.isArray(keys) || keys.length === 0) throw new Error("stepPose: no keys");
  const fn = typeof ease === "function" ? ease : ease ? EASES[ease] : null;
  if (ease && !fn) throw new Error(`stepPose: unknown ease ${ease}`);
  const sorted = [...keys].sort((a, b) => a.t - b.t);
  const full = [];
  const carry = {};
  for (const k of sorted) {
    Object.assign(carry, k.angles ?? {});
    full.push({ t: k.t, angles: { ...carry } });
  }
  const q = quantize(t, fps);
  let i = full.length - 1;
  while (i > 0 && full[i].t > q + 1e-9) i--;
  const a = full[i];
  const b = full[i + 1];
  if (!fn || !b || q < a.t) return { ...a.angles };
  const p = fn(clamp01((q - a.t) / (b.t - a.t)));
  const out = {};
  for (const name of new Set([...Object.keys(a.angles), ...Object.keys(b.angles)])) {
    const from = a.angles[name] ?? 0,
      to = b.angles[name] ?? 0;
    out[name] = from + (to - from) * p;
  }
  return out;
}
