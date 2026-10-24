import { useEffect, useState } from "react";
import { SRGBColorSpace, Texture, TextureLoader } from "three";
import { cancelRender, continueRender, delayRender } from "remotion";

/**
 * Loads image textures and holds the render (delayRender) until every one is ready, so no frame
 * is ever drawn with a blank map. Entries are null until loaded; the list length must not change.
 */
export const useImageTextures = (srcs: (string | undefined)[]): (Texture | null)[] => {
  const key = srcs.join("|");
  const [textures, setTextures] = useState<(Texture | null)[]>(() => srcs.map(() => null));
  const [handle] = useState(() => delayRender(`three textures: ${key}`));

  useEffect(() => {
    let alive = true;
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
        setTextures(loaded);
        continueRender(handle);
      })
      .catch((e) => cancelRender(e));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

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
