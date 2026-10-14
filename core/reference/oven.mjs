// The paper oven: turns a cut shape into a piece of torn paper, once, at build time. Pure
// functions on RGBA / alpha buffers (no I/O): a value-noise fbm, a polygon rasteriser, an edge
// torn by displacing the alpha with that noise, a rougher white fibre rim outside the tear (the
// paper's core showing where it ripped), and a grain over the ink. regions.mjs does the I/O.

const hash = (x, y, s) => {
  let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};
const smooth = (t) => t * t * (3 - 2 * t);
function vnoise(x, y, s) {
  const xi = Math.floor(x),
    yi = Math.floor(y),
    xf = smooth(x - xi),
    yf = smooth(y - yi);
  const a = hash(xi, yi, s),
    b = hash(xi + 1, yi, s),
    c = hash(xi, yi + 1, s),
    d = hash(xi + 1, yi + 1, s);
  return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
}
export function fbm(x, y, seed, octaves = 4) {
  let v = 0,
    amp = 0.5,
    f = 1,
    norm = 0;
  for (let o = 0; o < octaves; o++) {
    v += amp * vnoise(x * f, y * f, seed + o * 31);
    norm += amp;
    amp *= 0.5;
    f *= 2;
  }
  return v / norm;
}

// Even-odd scanline fill at pixel centres; points outside the image are fine (clamped by the loop).
export function polyMask(w, h, poly) {
  const m = new Uint8Array(w * h);
  const n = poly.length;
  for (let y = 0; y < h; y++) {
    const cy = y + 0.5,
      xs = [];
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const [xi, yi] = poly[i],
        [xj, yj] = poly[j];
      if (yi > cy !== yj > cy)
        xs.push(xi + ((cy - yi) / (yj - yi)) * (xj - xi));
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const a = Math.max(0, Math.ceil(xs[k] - 0.5)),
        b = Math.min(w - 1, Math.floor(xs[k + 1] - 0.5));
      for (let x = a; x <= b; x++) m[y * w + x] = 255;
    }
  }
  return m;
}

const at = (a, w, h, x, y) =>
  x < 0 || y < 0 || x >= w || y >= h ? 0 : a[(y | 0) * w + (x | 0)];

export function tornAlpha(
  alpha,
  w,
  h,
  { seed, depth = 9, freq = 0.035 },
) {
  const out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const dx = (fbm(x * freq, y * freq, seed) - 0.5) * 2 * depth;
      const dy = (fbm(x * freq + 91, y * freq + 37, seed) - 0.5) * 2 * depth;
      out[y * w + x] = at(alpha, w, h, Math.round(x + dx), Math.round(y + dy));
    }
  return out;
}

export function fibreRim(alpha, w, h, { width = 7, seed }) {
  const out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (alpha[y * w + x] > 127) continue;
      const reach = width * (0.45 + 0.55 * fbm(x * 0.15, y * 0.15, seed + 7)); // fibres: uneven width
      let hit = false;
      const r = Math.ceil(reach);
      for (let j = -r; j <= r && !hit; j++)
        for (let i = -r; i <= r && !hit; i++)
          if (
            i * i + j * j <= reach * reach &&
            at(alpha, w, h, x + i, y + j) > 127
          )
            hit = true;
      if (hit) out[y * w + x] = 255;
    }
  return out;
}

export function fitSize(w, h, max = 1600) {
  const s = Math.min(1, max / Math.max(w, h));
  return [Math.max(1, Math.round(w * s)), Math.max(1, Math.round(h * s))];
}

export function bake(
  rgba,
  w,
  h,
  {
    alpha,
    seed = 1,
    paper = [244, 239, 228],
    grain = 0.06,
    rim = 7,
    depth = 9,
  },
) {
  const body = tornAlpha(alpha, w, h, { seed, depth });
  const fib = fibreRim(body, w, h, { width: rim, seed });
  const out = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const g = 1 + (hash(i % w, (i / w) | 0, seed + 3) - 0.5) * 2 * grain;
    const o = i * 4;
    if (body[i] > 127) {
      out[o] = rgba[o] * g;
      out[o + 1] = rgba[o + 1] * g;
      out[o + 2] = rgba[o + 2] * g;
      out[o + 3] = 255;
    } else if (fib[i]) {
      out[o] = paper[0] * g;
      out[o + 1] = paper[1] * g;
      out[o + 2] = paper[2] * g;
      out[o + 3] = 235;
    }
  }
  return out;
}
