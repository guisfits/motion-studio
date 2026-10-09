// Minimal 16-bit PCM WAV writer and a seeded noise source shared by the synths.
import { writeFileSync } from "node:fs";

export const SR = 48000;

// channels: Float32Array[] (1 = mono, 2 = stereo), samples in [-1, 1] (clipped).
export function writeWav(path, channels, sr = SR) {
  const nch = channels.length;
  const n = channels[0].length;
  const b = Buffer.alloc(44 + n * nch * 2);
  b.write("RIFF", 0);
  b.writeUInt32LE(36 + n * nch * 2, 4);
  b.write("WAVEfmt ", 8);
  b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20);
  b.writeUInt16LE(nch, 22);
  b.writeUInt32LE(sr, 24);
  b.writeUInt32LE(sr * nch * 2, 28);
  b.writeUInt16LE(nch * 2, 32);
  b.writeUInt16LE(16, 34);
  b.write("data", 36);
  b.writeUInt32LE(n * nch * 2, 40);
  let o = 44;
  for (let i = 0; i < n; i++) {
    for (let c = 0; c < nch; c++) {
      b.writeInt16LE(
        Math.round(Math.max(-1, Math.min(1, channels[c][i])) * 32767),
        o,
      );
      o += 2;
    }
  }
  writeFileSync(path, b);
}

// Deterministic white noise in [-1, 1): an LCG, so every render sounds identical.
export function noiseSource(seed = 42) {
  let s = seed >>> 0;
  return () =>
    (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 2147483648 - 1;
}

// Peak-normalise in place to `peak` (leaves silence alone).
export function normalize(channels, peak = 0.89) {
  let m = 0;
  for (const ch of channels) for (const v of ch) m = Math.max(m, Math.abs(v));
  if (m === 0) return;
  const g = peak / m;
  for (const ch of channels) for (let i = 0; i < ch.length; i++) ch[i] *= g;
}
