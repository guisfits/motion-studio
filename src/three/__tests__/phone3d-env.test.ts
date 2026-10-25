import { beforeEach, describe, expect, it, vi } from "vitest";

// Phone3D played as a clip: a new `screen` URL every frame, one `env` picture for the whole shot.
// The reflection environment (a blurred equirect, PMREM-prefiltered on the GPU) must be built
// once, not once per clip frame. React and the texture hook are stood in by hand: the hook keeps
// its real contract (a change of its key reloads every entry it holds, as fresh textures).

const rt = vi.hoisted(() => ({ memos: [] as { deps: unknown[]; value: unknown }[], mi: 0 }));
vi.mock("react", () => {
  const useMemo = (make: () => unknown, deps: unknown[]) => {
    const i = rt.mi++;
    const prev = rt.memos[i];
    if (prev && prev.deps.length === deps.length && prev.deps.every((d, k) => Object.is(d, deps[k]))) return prev.value;
    const value = make();
    rt.memos[i] = { deps, value };
    return value;
  };
  const useEffect = () => {};
  return { default: { useMemo, useEffect }, useMemo, useEffect };
});
vi.mock("react/jsx-runtime", () => ({ jsx: () => null, jsxs: () => null, Fragment: "fragment" }));
const three = vi.hoisted(() => ({ gl: {} })); // the renderer, stable across frames as in r3f
vi.mock("@react-three/fiber", () => ({ useThree: (pick: (s: { gl: object }) => unknown) => pick(three) }));

const loads = vi.hoisted(() => ({ slots: [] as { key: string; textures: unknown[] }[], si: 0, loaded: [] as string[] }));
vi.mock("../textures", async (importActual) => ({
  ...(await importActual<typeof import("../textures")>()),
  useImageTextures: (srcs: (string | undefined)[]) => {
    const i = loads.si++;
    const key = srcs.join("|");
    if (loads.slots[i]?.key !== key) {
      loads.loaded.push(...srcs.filter((s): s is string => Boolean(s)));
      loads.slots[i] = {
        key,
        textures: srcs.map((s) => (s ? { image: { width: 828, height: 1800 }, clone: () => ({ repeat: { set() {} }, offset: { set() {} }, dispose() {} }) } : null)),
      };
    }
    return loads.slots[i].textures;
  },
}));

const env = vi.hoisted(() => ({ built: 0 }));
vi.mock("../phone-env", () => ({ pictureEnvironment: () => (env.built++, { dispose() {} }) }));

import { Phone3D } from "../Phone3D";

const frame = (screen: string) => {
  rt.mi = 0;
  loads.si = 0;
  (Phone3D as (p: object) => unknown)({ screen, finish: { env: { src: "desk.jpg" } } });
};

beforeEach(() => {
  rt.memos = [];
  loads.slots = [];
  loads.loaded = [];
  env.built = 0;
});

describe("Phone3D playing a clip under one env picture", () => {
  it("builds the reflection environment once, however many screen frames pass", () => {
    for (let n = 1; n <= 5; n++) frame(`clip/${n}.jpg`);
    expect(env.built).toBe(1);
  });

  it("loads the env picture once and each screen frame once", () => {
    for (let n = 1; n <= 3; n++) frame(`clip/${n}.jpg`);
    expect(loads.loaded.filter((s) => s === "desk.jpg")).toHaveLength(1);
    expect(loads.loaded.filter((s) => s.startsWith("clip/"))).toEqual(["clip/1.jpg", "clip/2.jpg", "clip/3.jpg"]);
  });
});
