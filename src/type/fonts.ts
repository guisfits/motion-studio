import { loadFont } from "@remotion/fonts";

export const FONT_MONO = "JetBrains Mono";
export const FONT_FRAKTUR = "UnifrakturCook";

/** Loads a bundled face and resolves when it is ready; wrap in delayRender in the caller. */
export function loadFace(family: string, url: string, weight?: string): Promise<void> {
  return loadFont({ family, url, weight });
}
