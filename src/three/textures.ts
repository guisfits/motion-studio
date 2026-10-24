import { useEffect, useRef, useState } from "react";
import { useThree } from "@react-three/fiber";
import { SRGBColorSpace, Texture, TextureLoader } from "three";
import { cancelRender, continueRender, delayRender } from "remotion";

/**
 * Loads image textures and holds the render (delayRender) until every one is ready and drawn, so
 * no frame is ever drawn with a blank map. Entries are null until loaded; the list length must
 * not change. While rendering, the canvas only redraws when the frame changes, so once the
 * textures are committed the hook advances it itself before it lets the frame go (a component
 * mounted mid-timeline would otherwise be captured empty). The first render holds from the start;
 * a later change of `srcs` takes a fresh hold, and unmounting while a load is pending releases it
 * (an abandoned hold would fail the render on Remotion's delayRender timeout). A texture that
 * cannot load cancels the render.
 */
export const useImageTextures = (srcs: (string | undefined)[]): (Texture | null)[] => {
  const key = srcs.join("|");
  const [textures, setTextures] = useState<(Texture | null)[]>(() => srcs.map(() => null));
  const [first] = useState(() => delayRender(`three textures: ${key}`));
  const advance = useThree((s) => s.advance);
  // The hold of the load in flight; null once that load has finished or been released.
  const held = useRef<number | null>(first);
  // The hold of a finished load, released once its textures have been drawn.
  const drawing = useRef<number | null>(null);

  useEffect(() => {
    let alive = true;
    const handle = held.current ?? delayRender(`three textures: ${key}`);
    held.current = handle;
    const loader = new TextureLoader();
    Promise.all(
      srcs.map(
        (src) =>
          new Promise<Texture | null>((resolve, reject) => {
            if (!src) return resolve(null);
            loader.load(
              src,
              (t) => {
                t.colorSpace = SRGBColorSpace;
                t.anisotropy = 8;
                resolve(t);
              },
              undefined,
              reject,
            );
          }),
      ),
    )
      .then((loaded) => {
        if (!alive) return;
        held.current = null;
        drawing.current = handle;
        setTextures(loaded);
      })
      .catch((e) => {
        if (alive) cancelRender(e);
      });
    return () => {
      alive = false;
      if (held.current === handle || drawing.current === handle) {
        held.current = drawing.current = null;
        continueRender(handle);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Runs after the loaded textures are committed to the scene: draw them, then release the frame.
  useEffect(() => {
    const handle = drawing.current;
    if (handle === null) return;
    drawing.current = null;
    advance(performance.now());
    continueRender(handle);
  }, [textures, advance]);

  return textures;
};

/** `src` when it is a non-empty URL, else throws naming the component and prop (a missing picture must fail the render, not draw nothing). */
export const requireSrc = (component: string, prop: string, src: string | undefined): string => {
  if (!src) throw new Error(`${component}: "${prop}" must be an image URL, got ${JSON.stringify(src)}`);
  return src;
};

/** Aspect (w/h) of a loaded image texture. */
export const textureAspect = (t: Texture): number => {
  const img = t.image as { width: number; height: number };
  return img.width / img.height;
};
