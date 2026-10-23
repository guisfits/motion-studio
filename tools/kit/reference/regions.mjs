// Cuts one source image into several clippings: each region is a polygon in 0..1 of the image;
// its pixels go through the oven (torn edge, fibre rim, grain) and land as their own PNG, cropped
// to the shape plus the rim. ffmpeg does the decoding and encoding (raw RGBA over pipes).

import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { polyMask, fitSize, bake } from "./oven.mjs";

// The upright size of a picture: ffmpeg turns it by its EXIF/display-matrix rotation, but the
// stream size is the stored one, so the first frame's size is swapped for a quarter turn.
export function uprightSize(path) {
  const info = JSON.parse(
    execFileSync("ffprobe", [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-read_intervals",
      "%+#1",
      "-show_frames",
      "-show_entries",
      "frame=width,height:frame_side_data=rotation",
      "-of",
      "json",
      path,
    ]).toString(),
  ).frames[0];
  const turn = (info.side_data_list ?? []).find((d) => "rotation" in d)?.rotation ?? 0;
  const quarter = Math.abs(turn) % 180 === 90;
  return quarter ? [info.height, info.width] : [info.width, info.height];
}

// Reads a picture upright as RGBA, fitted to `max` px on its long side. `crop` ({x, y, w, h} in
// upright source px) is cut first, at full resolution, and only the crop is fitted.
export function readRGBA(path, max = 1600, crop = null) {
  const [w0, h0] = crop ? [crop.w, crop.h] : uprightSize(path);
  const [w, h] = fitSize(w0, h0, max);
  const cropFilter = crop ? `crop=${crop.w}:${crop.h}:${crop.x}:${crop.y},` : "";
  const buf = execFileSync(
    "ffmpeg",
    [
      "-loglevel",
      "error",
      "-i",
      path,
      "-vf",
      `${cropFilter}scale=${w}:${h}`,
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

// The source px rectangle a region needs: its polygon's bounds plus the rim pad, clamped to the
// picture. The pad is in output px, so it is scaled by the fit the crop will get. null when the
// polygon misses the picture.
function regionCrop(poly, W, H, pad, max) {
  const xs = poly.map(([u]) => u * W),
    ys = poly.map(([, v]) => v * H);
  const bx0 = Math.max(0, Math.floor(Math.min(...xs))),
    by0 = Math.max(0, Math.floor(Math.min(...ys)));
  const bx1 = Math.min(W, Math.ceil(Math.max(...xs))),
    by1 = Math.min(H, Math.ceil(Math.max(...ys)));
  if (bx1 <= bx0 || by1 <= by0) return null;
  const scale = Math.min(1, max / Math.max(bx1 - bx0, by1 - by0));
  const p = Math.ceil(pad / scale);
  const x = Math.max(0, bx0 - p),
    y = Math.max(0, by0 - p);
  return { x, y, w: Math.min(W, bx1 + p) - x, h: Math.min(H, by1 + p) - y };
}

// Each region is cropped from the source at full resolution and only then fitted to `max`, so a
// small detail of a big scan keeps its pixels (fitting the whole scan first would shrink it).
export function cutRegions(srcPath, entry, outDir, max = 1600) {
  const [W, H] = uprightSize(srcPath);
  const o = { seed: 1, rim: 7, depth: 9, ...(entry.oven ?? {}) };
  // bake() multiplies these: a hex string or a short array would turn the rim black, silently.
  if (o.paper !== undefined && !(Array.isArray(o.paper) && o.paper.length === 3 && o.paper.every(Number.isFinite)))
    throw new Error(`regions: ${entry.id} oven.paper must be [r, g, b] numbers`);
  if (o.grain !== undefined && !Number.isFinite(o.grain))
    throw new Error(`regions: ${entry.id} oven.grain must be a number`);
  const pad = o.rim + o.depth + 2;
  const seen = new Set();
  return entry.regions.map((r, i) => {
    const name = `${entry.id}-${r.id}`;
    // Two regions with one id would write the same PNG and manifest row; the second silently wins.
    if (seen.has(r.id)) throw new Error(`regions: ${name} is a duplicate region id`);
    seen.add(r.id);
    const ok = (pt) => Array.isArray(pt) && pt.length === 2 && pt.every(Number.isFinite);
    if (!Array.isArray(r.poly) || r.poly.length < 3 || !r.poly.every(ok))
      throw new Error(`regions: ${name} has a bad poly (need 3+ [u, v] points)`);
    const crop = regionCrop(r.poly, W, H, pad, max);
    if (!crop) throw new Error(`regions: ${name} is empty (check its poly)`);
    const { w, h, rgba } = readRGBA(srcPath, max, crop);
    const sx = w / crop.w,
      sy = h / crop.h;
    const poly = r.poly.map(([u, v]) => [(u * W - crop.x) * sx, (v * H - crop.y) * sy]);
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
      // Optional: bake() keeps its cream paper and default grain when these are absent.
      ...(o.paper && { paper: o.paper }),
      ...(o.grain !== undefined && { grain: o.grain }),
    });
    const path = join(outDir, `${name}.png`);
    writePNG(path, cw, ch, out);
    return path;
  });
}
