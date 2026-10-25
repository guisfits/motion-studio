import { CanvasTexture, EquirectangularReflectionMapping, PMREMGenerator, SRGBColorSpace, type Texture, type WebGLRenderer } from "three";

/**
 * An environment from a 2D picture (the scene's ground, a room): the picture, blurred and
 * mirrored into a 2:1 equirect so it wraps, then prefiltered, so polished edges pick up its
 * tones. Needs a DOM canvas; call it from the render, never at import time.
 */
export const pictureEnvironment = (gl: WebGLRenderer, texture: Texture, { blur, gain }: { blur: number; gain: number }): Texture => {
  const img = texture.image as { naturalWidth?: number; naturalHeight?: number; width: number; height: number };
  const iw = img.naturalWidth ?? img.width;
  const ih = img.naturalHeight ?? img.height;
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const g = c.getContext("2d")!;
  g.filter = `blur(${blur}px) brightness(${gain}) saturate(1.1)`;
  const s = Math.max(512 / iw, 512 / ih);
  const w = iw * s;
  const h = ih * s;
  g.drawImage(img as CanvasImageSource, (512 - w) / 2, (512 - h) / 2, w, h);
  g.save();
  g.translate(1024, 0);
  g.scale(-1, 1);
  g.drawImage(img as CanvasImageSource, (512 - w) / 2, (512 - h) / 2, w, h);
  g.restore();
  const equirect = new CanvasTexture(c);
  equirect.mapping = EquirectangularReflectionMapping;
  equirect.colorSpace = SRGBColorSpace;
  const pmrem = new PMREMGenerator(gl);
  const env = pmrem.fromEquirectangular(equirect).texture;
  pmrem.dispose();
  equirect.dispose();
  return env;
};
