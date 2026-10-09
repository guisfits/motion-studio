// Music synthesized in code from a small score, plus the beat grid it was written on, so the
// picture and the sound share one timeline (no track to license, nothing to measure).
//
//   node core/audio/score.mjs <film-dir>/score.json [--out <film-dir>]
//   → <out>/music.wav and <out>/beats.json
//
// score.json:
//   { "bpm": 84, "bars": 6, "chords": ["Dm", "Bb", "F", "C"],        one chord per bar, cycling
//     "voices": { "organ": {}, "strings": { "from": 2 }, "bell": { "gain": 0.8 },
//                 "bass": {}, "piano": { "from": 1, "to": 5 }, "kick": { "from": 4 } },
//     "tail": 2 }                                                      seconds of ring-out
// Voices: organ, strings, bass, bell (downbeats), piano (arpeggio on beats), kick (beats 1 and 3).
// from/to are bar indexes [from, to); gain scales the voice's default level.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { SR, writeWav, normalize } from "./wav.mjs";

const TAU = 2 * Math.PI;
const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const QUALITY = {
  "": [0, 4, 7],
  m: [0, 3, 7],
  maj7: [0, 4, 7, 11],
  m7: [0, 3, 7, 10],
  7: [0, 4, 7, 10],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
};

export function parseChord(name) {
  const m = /^([A-G])([#b]?)(maj7|m7|sus2|sus4|m|7|)$/.exec(name);
  if (!m)
    throw new Error(
      `cannot spell chord "${name}" (root A-G, optional #/b, quality ${Object.keys(
        QUALITY,
      )
        .map((q) => q || "major")
        .join("/")})`,
    );
  const root =
    (PC[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0) + 12) % 12;
  return { root, intervals: QUALITY[m[3]] };
}

const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);
// Put a pitch class inside [lo, lo + 12).
const place = (pc, lo) => lo + ((((pc - lo) % 12) + 12) % 12);

// Attack/release envelope for a note held from 0 to len (seconds), evaluated at t.
const env = (t, len, a, r) =>
  t < 0 ? 0 : t < a ? t / a : t < len ? 1 : t < len + r ? 1 - (t - len) / r : 0;

function addNote(L, R, start, len, fn, pan = 0) {
  const i0 = Math.max(0, Math.round(start * SR));
  const n = Math.min(L.length - i0, Math.ceil(len * SR));
  const gl = Math.cos(((pan + 1) * Math.PI) / 4);
  const gr = Math.sin(((pan + 1) * Math.PI) / 4);
  for (let i = 0; i < n; i++) {
    const v = fn(i / SR);
    L[i0 + i] += v * gl;
    R[i0 + i] += v * gr;
  }
}

const VOICES = {
  organ(ctx, bar, chord, g) {
    const len = ctx.barLen;
    for (const iv of chord.intervals) {
      const f = hz(place(chord.root + iv, 55));
      const parts = [
        [1, 1],
        [2, 0.5],
        [3, 0.22],
        [4, 0.16],
        [6, 0.07],
        [8, 0.04],
      ];
      addNote(ctx.L, ctx.R, bar * len, len + 0.4, (t) => {
        let s = 0;
        for (const [p, a] of parts) s += a * Math.sin(TAU * f * p * t);
        return (
          s *
          env(t, len, 0.12, 0.35) *
          (1 + 0.04 * Math.sin(TAU * 5.5 * t)) *
          0.09 *
          g
        );
      });
    }
  },
  strings(ctx, bar, chord, g) {
    const len = ctx.barLen;
    const tones = chord.intervals.map((iv) => place(chord.root + iv, 57));
    tones.push(tones[0] + 12);
    for (const m of tones) {
      for (const [cents, pan] of [
        [-7, -0.6],
        [0, 0],
        [7, 0.6],
      ]) {
        const f = hz(m) * 2 ** (cents / 1200);
        addNote(
          ctx.L,
          ctx.R,
          bar * len,
          len + 0.9,
          (t) => {
            let s = 0;
            for (let h = 1; h <= 8; h++)
              s += (Math.sin(TAU * f * h * t) / h) * Math.exp(-h * 0.18);
            return s * env(t, len, 0.8, 0.9) * 0.022 * g;
          },
          pan,
        );
      }
    }
  },
  bass(ctx, bar, chord, g) {
    const f = hz(place(chord.root, 36));
    addNote(
      ctx.L,
      ctx.R,
      bar * ctx.barLen,
      ctx.barLen + 0.3,
      (t) =>
        (Math.sin(TAU * f * t) + 0.3 * Math.sin(TAU * 2 * f * t)) *
        env(t, ctx.barLen, 0.02, 0.3) *
        (0.6 + 0.4 * Math.exp(-t * 3)) *
        0.22 *
        g,
    );
  },
  bell(ctx, bar, chord, g) {
    const top = chord.intervals[chord.intervals.length - 1];
    const f = hz(Math.min(88, place(chord.root + top, 76)));
    const t0 = bar * ctx.barLen;
    ctx.hits.push(t0);
    addNote(
      ctx.L,
      ctx.R,
      t0,
      3,
      (t) =>
        [1, 2.76, 5.4, 8.93].reduce(
          (s, p, i) =>
            s +
            (Math.sin(TAU * f * p * t) * Math.exp(-t * (1.5 + i * 1.6))) /
              (i + 1),
          0,
        ) *
        0.09 *
        g,
      0.25,
    );
  },
  piano(ctx, bar, chord, g) {
    const tones = chord.intervals
      .slice(0, 3)
      .map((iv) => place(chord.root + iv, 60));
    const pattern = [tones[0], tones[2] ?? tones[1], tones[1], tones[0] + 12];
    pattern.forEach((m, beat) => {
      const f = hz(m);
      addNote(
        ctx.L,
        ctx.R,
        bar * ctx.barLen + beat * ctx.beatLen,
        1.8,
        (t) => {
          let s = 0;
          for (let h = 1; h <= 6; h++)
            s +=
              (Math.sin(TAU * f * h * t) / h ** 1.5) * Math.exp(-t * (2 + h));
          return s * Math.min(1, t / 0.004) * 0.1 * g;
        },
        -0.2 + 0.13 * beat,
      );
    });
  },
  kick(ctx, bar, _chord, g) {
    for (const beat of [0, 2]) {
      const t0 = bar * ctx.barLen + beat * ctx.beatLen;
      ctx.hits.push(t0);
      addNote(
        ctx.L,
        ctx.R,
        t0,
        0.6,
        (t) =>
          Math.sin(TAU * (50 * t + (60 / 9) * (1 - Math.exp(-9 * t)))) *
          Math.exp(-t * 7) *
          0.5 *
          g,
      );
    }
  },
};

// Small Schroeder/Freeverb-style room so the synths do not sound bone dry.
function reverb(x, wet = 0.22, seedOffset = 0) {
  const scale = SR / 44100;
  const combs = [1557, 1617, 1491, 1422].map((d) =>
    Math.round((d + seedOffset) * scale),
  );
  const out = new Float32Array(x.length);
  for (const d of combs) {
    const buf = new Float32Array(d);
    let idx = 0,
      low = 0;
    for (let i = 0; i < x.length; i++) {
      const y = buf[idx];
      low = y * 0.75 + low * 0.25;
      buf[idx] = x[i] + low * 0.8;
      out[i] += y * 0.25;
      idx = (idx + 1) % d;
    }
  }
  for (const d of [556, 441].map((v) => Math.round((v + seedOffset) * scale))) {
    const buf = new Float32Array(d);
    let idx = 0;
    for (let i = 0; i < out.length; i++) {
      const b = buf[idx];
      const y = -out[i] + b;
      buf[idx] = out[i] + b * 0.5;
      out[i] = y;
      idx = (idx + 1) % d;
    }
  }
  for (let i = 0; i < x.length; i++) out[i] = x[i] * (1 - wet) + out[i] * wet;
  return out;
}

export function renderScore(score) {
  const { bpm, bars, chords, voices } = score;
  if (!bpm || !bars || !chords?.length || !voices)
    throw new Error("score needs bpm, bars, chords and voices");
  const parsed = chords.map(parseChord);
  for (const v of Object.keys(voices))
    if (!VOICES[v])
      throw new Error(
        `unknown voice "${v}" (valid: ${Object.keys(VOICES).join(", ")})`,
      );
  const beatLen = 60 / bpm;
  const barLen = beatLen * 4;
  const dur = bars * barLen + (score.tail ?? 2);
  const n = Math.round(dur * SR);
  const ctx = {
    L: new Float32Array(n),
    R: new Float32Array(n),
    beatLen,
    barLen,
    hits: [],
  };
  for (const [name, cfg] of Object.entries(voices)) {
    const from = cfg.from ?? 0;
    const to = cfg.to ?? bars;
    for (let bar = from; bar < Math.min(to, bars); bar++)
      VOICES[name](ctx, bar, parsed[bar % parsed.length], cfg.gain ?? 1);
  }
  const L = reverb(ctx.L, score.reverb ?? 0.22, 0);
  const R = reverb(ctx.R, score.reverb ?? 0.22, 23);
  normalize([L, R]);
  const round = (t) => Math.round(t * 1000) / 1000;
  const beats = Array.from({ length: bars * 4 }, (_, i) => round(i * beatLen));
  return {
    channels: [L, R],
    grid: {
      bpm,
      beats,
      downbeats: beats.filter((_, i) => i % 4 === 0),
      hits: [...new Set(ctx.hits.map(round))].sort((a, b) => a - b),
      duration: round(dur),
      source: "score",
    },
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const path = process.argv[2];
  if (!path) {
    console.error("usage: node score.mjs score.json [--out dir]");
    process.exit(2);
  }
  const i = process.argv.indexOf("--out");
  const out = i > 0 ? process.argv[i + 1] : dirname(path);
  try {
    const { channels, grid } = renderScore(
      JSON.parse(readFileSync(path, "utf8")),
    );
    writeWav(join(out, "music.wav"), channels);
    writeFileSync(
      join(out, "beats.json"),
      `${JSON.stringify(grid, null, 1)}\n`,
    );
    console.log(
      `score: ${grid.bpm} BPM, ${grid.beats.length} beats, ${grid.duration}s → ${out}/music.wav + beats.json`,
    );
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
