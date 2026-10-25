import React, { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { CanvasTexture, MeshBasicMaterial, MeshPhysicalMaterial, MeshStandardMaterial, AdditiveBlending, SRGBColorSpace, type Texture } from "three";
import { coverUV } from "./cover-uv";
import { buttonGeometry, discGeometry, flatRectGeometry, slabGeometry } from "./phone-geometry";
import { pictureEnvironment } from "./phone-env";
import { defaultPhoneBody, phoneLayout, resolveFinish, type PhoneBody, type PhoneFinish } from "./phone-spec";
import { requireSrc, textureAspect, useImageTextures } from "./textures";

/** Draws the screen on a 2D canvas (UI mock-ups); call again via `drawKey` to animate. */
export type PhoneScreenDraw = (ctx: CanvasRenderingContext2D, width: number, height: number) => void;

export type Phone3DProps = {
  /** An image URL (ES import) or a canvas draw function. A React node cannot be a texture. */
  screen: string | PhoneScreenDraw;
  /** Changes whenever a draw function must repaint (pass the frame or a derived value). */
  drawKey?: number;
  rotateY?: number;
  rotateX?: number;
  rotateZ?: number;
  progress?: number;
  from?: [number, number, number];
  position?: [number, number, number];
  /** Image screens: zoom and pan (-1..1) inside the picture. */
  screenZoom?: number;
  screenPan?: [number, number];
  /**
   * Without `body`: the generic slab's width and height in scene units. With `body`: only
   * `size[0]` counts, the phone's outer width in scene units (its height follows the body).
   */
  size?: [number, number];
  /** Without `body`: the generic slab's thickness; ignored when `body` is given. */
  depth?: number;
  /** Any phone model, in its own unit (see `PhoneBody`); omitted, the generic slab. */
  body?: PhoneBody;
  /** Frame, back and reflection materials; omitted, the generic dark slab material. */
  finish?: PhoneFinish;
};

/** Every material of a phone, built from one finish; the polished ones share the environment. */
const phoneMaterials = (finish: ReturnType<typeof resolveFinish>, envMap: Texture | null) => {
  const frame =
    finish.clearcoat > 0
      ? new MeshPhysicalMaterial({
          color: finish.frame,
          metalness: finish.metalness,
          roughness: finish.roughness,
          clearcoat: finish.clearcoat,
          clearcoatRoughness: 0.35,
        })
      : new MeshStandardMaterial({ color: finish.frame, metalness: finish.metalness, roughness: finish.roughness });
  const glass = new MeshPhysicalMaterial({ color: "#020203", metalness: 0, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.03 });
  const pane = new MeshPhysicalMaterial({ color: finish.pane, metalness: finish.paneMetalness, roughness: finish.paneRoughness });
  const lensGlass = new MeshPhysicalMaterial({ color: "#06070a", metalness: 0.3, roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.02 });
  const lensCore = new MeshPhysicalMaterial({ color: "#121b2e", metalness: 0.7, roughness: 0.12 });
  const ring = new MeshPhysicalMaterial({ color: "#3a3a3e", metalness: 1, roughness: 0.18 });
  const inlay = new MeshPhysicalMaterial({ color: "#0c0c0e", metalness: 0.4, roughness: 0.1, clearcoat: 1 });
  const flash = new MeshStandardMaterial({ color: "#e6dfcb", roughness: 0.35 });
  const dark = new MeshStandardMaterial({ color: "#09090a", roughness: 0.6 });
  const punchRing = new MeshBasicMaterial({ color: "#0b0c10" });
  const punchHole = new MeshBasicMaterial({ color: "#000000" });
  // Black and additive: only the environment's reflection is added over the picture.
  const sheen = new MeshStandardMaterial({
    color: "#000000",
    roughness: 0.08,
    metalness: 0,
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  for (const m of [frame, glass, pane, lensGlass, lensCore, ring, inlay]) {
    m.envMapIntensity = finish.reflect;
    if (envMap) m.envMap = envMap;
  }
  sheen.envMapIntensity = finish.glare * finish.reflect;
  if (envMap) sheen.envMap = envMap;
  return { frame, glass, pane, lensGlass, lensCore, ring, inlay, flash, dark, punchRing, punchHole, sheen };
};

/** A phone of any model: rounded bevelled body, lit screen, and, when the body says so, glass, back, camera module, keys, punch hole and reflections. Brand-free: the look comes from `body` and `finish`. */
export const Phone3D: React.FC<Phone3DProps> = ({
  screen,
  drawKey = 0,
  rotateY = 0,
  rotateX = 0,
  rotateZ = 0,
  progress = 1,
  from = [0, 0, 0],
  position = [0, 0, 0],
  screenZoom = 1,
  screenPan = [0, 0],
  size = [2.2, 4.5],
  depth = 0.22,
  body: bodyProp,
  finish: finishProp,
}) => {
  const isDraw = typeof screen === "function";
  const finish = resolveFinish(finishProp);
  // Two holds, not one: a clip passes a new screen URL every frame, and one shared key would
  // reload the env picture and rebuild its prefiltered environment with every frame.
  const [imgTex] = useImageTextures([isDraw ? undefined : requireSrc("Phone3D", "screen", screen)]);
  const [envTex] = useImageTextures([finish.env?.src]);
  const gl = useThree((s) => s.gl);

  // Stable keys: a caller builds `body` and `finish` literals every frame.
  const bodyKey = JSON.stringify(bodyProp ?? [size, depth]);
  const layout = useMemo(() => phoneLayout(bodyProp ?? defaultPhoneBody(size, depth)), [bodyKey]);
  const unit = bodyProp ? size[0] / bodyProp.width : 1;
  const sw = layout.screen.width;
  const sh = layout.screen.height;

  const geo = useMemo(() => {
    const L = layout;
    const slab = (s: Parameters<typeof slabGeometry>[0]) => slabGeometry(s);
    return {
      shell: slab({ width: L.shell.width, height: L.shell.height, radius: L.shell.radius, depth: L.shell.depth, bevel: L.shell.bevel, curveSegments: L.shell.curveSegments, bevelSegments: L.shell.bevelSegments }),
      glass: L.glass && slab(L.glass),
      screen: flatRectGeometry(sw, sh, L.screen.radius),
      sheen: flatRectGeometry(L.sheen.width, L.sheen.height, L.sheen.radius),
      punchRing: L.punch && discGeometry(L.punch.ring.radius, L.punch.ring.height, 48),
      punchHole: L.punch && discGeometry(L.punch.hole.radius, L.punch.hole.height, 48),
      pane: L.pane && slab(L.pane),
      module: L.module && slab(L.module.slab),
      buttons: L.buttons.map((b) => buttonGeometry(b.out, b.length, b.thick, b.radius)),
    };
  }, [layout, sw, sh]);

  const moduleGeo = useMemo(() => {
    const m = layout.module;
    if (!m) return null;
    return {
      lenses: m.lenses.map((l) => ({
        ring: discGeometry(l.ringRadius, l.ringHeight),
        glass: discGeometry(l.glassRadius, l.glassHeight),
        core: discGeometry(l.coreRadius, l.coreHeight, 48),
      })),
      discs: m.discs.map((d) => discGeometry(d.radius, d.height, d.tone === "dark" ? 16 : 32)),
    };
  }, [layout]);

  const envKey = finish.env ? `${finish.env.blur}|${finish.env.gain}` : "";
  const envMap = useMemo(
    () => (envTex && finish.env ? pictureEnvironment(gl, envTex, finish.env) : null),
    [envTex, envKey, gl],
  );
  useEffect(() => () => envMap?.dispose(), [envMap]);
  const finishKey = JSON.stringify({ ...finish, env: null });
  const mat = useMemo(() => phoneMaterials(finish, envMap), [finishKey, envMap]);
  useEffect(() => () => Object.values(mat).forEach((m) => m.dispose()), [mat]);

  const canvasTex = useMemo(() => {
    if (!isDraw) return null;
    const c = document.createElement("canvas");
    c.width = 540;
    c.height = Math.round((540 * sh) / sw);
    const t = new CanvasTexture(c);
    t.colorSpace = SRGBColorSpace;
    return t;
  }, [isDraw, sw, sh]);

  useEffect(() => {
    if (!canvasTex || typeof screen !== "function") return;
    const c = canvasTex.image as HTMLCanvasElement;
    // Cleared first, so a repaint is a pure function of the draw call, never of the last frame.
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, c.width, c.height);
    screen(ctx, c.width, c.height);
    canvasTex.needsUpdate = true;
  }, [canvasTex, screen, drawKey]);

  const imageMap = useMemo(() => {
    if (!imgTex) return null;
    const t = imgTex.clone();
    t.needsUpdate = true;
    const uv = coverUV(textureAspect(imgTex), sw / sh, screenZoom, screenPan[0], screenPan[1]);
    t.repeat.set(uv.repeatX, uv.repeatY);
    t.offset.set(uv.offsetX, uv.offsetY);
    return t;
  }, [imgTex, sw, sh, screenZoom, screenPan[0], screenPan[1]]);
  // Each clone is its own GPU texture: free the last frame's when the screen moves on.
  useEffect(() => () => imageMap?.dispose(), [imageMap]);

  const map = isDraw ? canvasTex : imageMap;
  if (!map) return null;
  const p = 1 - progress;
  const L = layout;
  const at = (o: { x: number; y: number; z: number }): [number, number, number] => [o.x, o.y, o.z];
  const discMat = (tone: "flash" | "glass" | "dark") => (tone === "flash" ? mat.flash : tone === "glass" ? mat.lensGlass : mat.dark);
  return (
    <group position={[position[0] + from[0] * p, position[1] + from[1] * p, position[2] + from[2] * p]}>
      <group rotation={[rotateX, rotateY, rotateZ]} scale={unit}>
        <mesh geometry={geo.shell} material={mat.frame} castShadow receiveShadow />
        {geo.glass && L.glass && <mesh geometry={geo.glass} material={mat.glass} position={at(L.glass)} />}
        {geo.pane && L.pane && <mesh geometry={geo.pane} material={mat.pane} position={at(L.pane)} castShadow />}
        {L.module && moduleGeo && geo.module && (
          <group position={[0, L.module.y, L.module.z]}>
            <mesh geometry={geo.module} material={mat.frame} position={at(L.module.slab)} castShadow />
            {L.module.lenses.map((l, i) => (
              <group key={i} position={at(l)}>
                <mesh geometry={moduleGeo.lenses[i].ring} material={mat.ring} />
                <mesh geometry={moduleGeo.lenses[i].glass} material={mat.lensGlass} />
                <mesh geometry={moduleGeo.lenses[i].core} material={mat.lensCore} />
              </group>
            ))}
            {L.module.discs.map((d, i) => (
              <mesh key={`d${i}`} geometry={moduleGeo.discs[i]} material={discMat(d.tone)} position={at(d)} />
            ))}
          </group>
        )}
        {L.buttons.map((b, i) => (
          <mesh key={`b${i}`} geometry={geo.buttons[i]} material={b.glass ? mat.inlay : mat.frame} position={at(b)} />
        ))}
        <mesh geometry={geo.screen} position={at(L.screen)}>
          <meshBasicMaterial map={map} toneMapped={false} />
        </mesh>
        {finish.glare > 0 && <mesh geometry={geo.sheen} material={mat.sheen} position={at(L.sheen)} />}
        {geo.punchRing && geo.punchHole && L.punch && (
          <>
            <mesh geometry={geo.punchRing} material={mat.punchRing} position={at(L.punch.ring)} />
            <mesh geometry={geo.punchHole} material={mat.punchHole} position={at(L.punch.hole)} />
          </>
        )}
      </group>
    </group>
  );
};
