// Cuts one source image into several clippings: each region is a polygon in 0..1 of the image;
// its pixels go through the oven (torn edge, fibre rim, grain) and land as their own PNG, cropped
// to the shape plus the rim. ffmpeg does the decoding and encoding (raw RGBA over pipes).

import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { polyMask, fitSize, bake } from "./oven.mjs";

export function readRGBA(path, max = 1600) {
  const probe = execFileSync("ffprobe", [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=width,height",
    "-of",
    "csv=p=0",
    path,
  ])
    .toString()
    .trim();
  const [w0, h0] = probe.split(",").map(Number);
  const [w, h] = fitSize(w0, h0, max);
  const buf = execFileSync(
    "ffmpeg",
    [
      "-loglevel",
      "error",
      "-i",
      path,
      "-vf",
      `scale=${w}:${h}`,
      "-f",
      "rawvideo",
      "-pix_fmt",
      "rgba",
      "-",
    ],
    { maxBuffer: w * h * 4 + 1024 },
  );
  return {
    w,
    h,
    rgba: new Uint8ClampedArray(buf.buffer, buf.byteOffset, buf.length),
  };
}

export function writePNG(path, w, h, rgba) {
  execFileSync(
    "ffmpeg",
    [
      "-loglevel",
      "error",
      "-y",
      "-f",
      "rawvideo",
      "-pix_fmt",
      "rgba",
      "-s",
      `${w}x${h}`,
      "-i",
      "-",
      path,
    ],
    { input: Buffer.from(rgba.buffer, rgba.byteOffset, rgba.length) },
  );
}

export function cutRegions(srcPath, entry, outDir) {
  const { w, h, rgba } = readRGBA(srcPath);
  const o = { seed: 1, rim: 7, depth: 9, ...(entry.oven ?? {}) };
  const pad = o.rim + o.depth + 2;
  return entry.regions.map((r, i) => {
    const name = `${entry.id}-${r.id}`;
    const poly = r.poly.map(([u, v]) => [u * w, v * h]);
    const mask = polyMask(w, h, poly);
    // A source with its own transparency (a cut-out PNG) keeps it: the polygon only narrows it.
    // An opaque scan (JPEG) is all 255 here, so the polygon alone is its alpha.
    for (let k = 0; k < mask.length; k++)
      if (rgba[k * 4 + 3] <= 127) mask[k] = 0;
    let x0 = w,
      y0 = h,
      x1 = -1,
      y1 = -1;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++)
        if (mask[y * w + x]) {
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
        }
    if (x1 < 0) throw new Error(`regions: ${name} is empty (check its poly)`);
    const cx0 = Math.max(0, x0 - pad),
      cy0 = Math.max(0, y0 - pad);
    const cw = Math.min(w, x1 + pad + 1) - cx0,
      ch = Math.min(h, y1 + pad + 1) - cy0;
    const sub = new Uint8ClampedArray(cw * ch * 4),
      subA = new Uint8Array(cw * ch);
    for (let y = 0; y < ch; y++)
      for (let x = 0; x < cw; x++) {
        const s = (y + cy0) * w + (x + cx0),
          d = y * cw + x;
        sub.set(rgba.subarray(s * 4, s * 4 + 4), d * 4);
        subA[d] = mask[s];
      }
    const out = bake(sub, cw, ch, {
      alpha: subA,
      seed: o.seed + i,
      rim: o.rim,
      depth: o.depth,
    });
    const path = join(outDir, `${name}.png`);
    writePNG(path, cw, ch, out);
    return path;
  });
}
