import { beforeEach, describe, expect, it, vi } from "vitest";

// A minimal stand-in for React's hooks: enough to run useImageTextures' lifecycle by hand
// (render, effect, cleanup on dep change or unmount) without a DOM or a renderer.
const rt = vi.hoisted(() => ({
  states: [] as unknown[],
  refs: [] as { current: unknown }[],
  effects: [] as { deps: unknown[]; run: () => (() => void) | void; cleanup?: () => void }[],
  si: 0,
  ri: 0,
  ei: 0,
  pendingEffects: [] as (() => void)[],
}));
vi.mock("react", () => ({
  useState: (init: unknown) => {
    const i = rt.si++;
    if (!(i in rt.states)) rt.states[i] = typeof init === "function" ? (init as () => unknown)() : init;
    return [rt.states[i], (v: unknown) => void (rt.states[i] = v)];
  },
  useRef: (init: unknown) => {
    const i = rt.ri++;
    if (!rt.refs[i]) rt.refs[i] = { current: init };
    return rt.refs[i];
  },
  useEffect: (run: () => (() => void) | void, deps: unknown[]) => {
    const i = rt.ei++;
    const prev = rt.effects[i];
    if (prev && prev.deps.every((d, k) => Object.is(d, deps[k]))) return;
    rt.pendingEffects.push(() => {
      prev?.cleanup?.();
      const slot = { deps, run, cleanup: undefined as (() => void) | undefined };
      slot.cleanup = run() || undefined;
      rt.effects[i] = slot;
    });
  },
}));

const loads = vi.hoisted(() => ({ done: [] as (() => void)[], fail: [] as ((e: Error) => void)[] }));
vi.mock("three", () => ({
  SRGBColorSpace: "srgb",
  Texture: class {},
  TextureLoader: class {
    load(_src: string, ok: (t: object) => void, _p: unknown, err: (e: Error) => void) {
      loads.done.push(() => ok({}));
      loads.fail.push(err);
    }
  },
}));

const holds = vi.hoisted(() => ({ open: new Set<number>(), next: 1, cancelled: [] as unknown[] }));
vi.mock("remotion", () => ({
  delayRender: () => {
    holds.open.add(holds.next);
    return holds.next++;
  },
  continueRender: (h: number) => void holds.open.delete(h),
  cancelRender: (e: unknown) => void holds.cancelled.push(e),
}));

import { useImageTextures } from "../textures";

// One React pass: run the hook, then flush the effects it scheduled.
const render = (srcs: string[]) => {
  rt.si = rt.ri = rt.ei = 0;
  const out = useImageTextures(srcs);
  rt.pendingEffects.splice(0).forEach((f) => f());
  return out;
};
const unmount = () => rt.effects.forEach((e) => e.cleanup?.());
const tick = () => new Promise((r) => setTimeout(r, 0));

beforeEach(() => {
  Object.assign(rt, { states: [], refs: [], effects: [], si: 0, ri: 0, ei: 0, pendingEffects: [] });
  loads.done.length = loads.fail.length = 0;
  holds.open.clear();
  holds.cancelled.length = 0;
});

describe("useImageTextures holds", () => {
  it("holds the render until every texture has loaded, then releases", async () => {
    render(["a.png", "b.png"]);
    expect(holds.open.size).toBe(1);
    loads.done.forEach((f) => f());
    await tick();
    expect(holds.open.size).toBe(0);
  });

  it("releases the hold when the component unmounts before the load finishes", () => {
    render(["a.png"]);
    expect(holds.open.size).toBe(1);
    unmount();
    expect(holds.open.size).toBe(0);
  });

  it("takes a fresh hold when the sources change, and releases it when they load", async () => {
    render(["a.png"]);
    loads.done.forEach((f) => f());
    await tick();
    expect(holds.open.size).toBe(0);
    loads.done.length = 0;
    render(["b.png"]);
    expect(holds.open.size).toBe(1);
    loads.done.forEach((f) => f());
    await tick();
    expect(holds.open.size).toBe(0);
  });

  it("cancels the render when a texture fails to load", async () => {
    render(["missing.png"]);
    loads.fail[0](new Error("404"));
    await tick();
    expect(holds.cancelled).toHaveLength(1);
  });

  it("does not cancel the render for a load that failed after unmount", async () => {
    render(["missing.png"]);
    unmount();
    loads.fail[0](new Error("404"));
    await tick();
    expect(holds.cancelled).toHaveLength(0);
  });
});
