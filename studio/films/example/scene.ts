// The geometry and timing Film.tsx draws with and trace.ts reports: one set of numbers, read by
// both. Change a number here and the picture and its trace move together; never copy one into
// either file. Pure data (no images, no fonts, no React) so the gate can import it in Node.
import type { Caption } from "@remotion/captions";
import { fromWords } from "../../../src/captions/fromWords";
import { layoutOf, type Box } from "../../../src/film";
import { DEFAULT_DRIFT, type CamKey } from "../../../src/camera/path";
import type { SetDownPoseOptions } from "../../../src/paper/set-down-pose";
import film from "./film.json";
import sheet from "./crew/sync-sheet.json";
import voice from "./voice/words.json";

export const FPS = film.fps;
export const DURATION = film.durationInFrames;
export const { W, H } = layoutOf(film.format as "9x16");

export const GROUND = "#ece4d4";
export const INK = "#1d1a16";
export const SHEET_PAPER = "#f6f0e2";
export const SHEET_PAD = 14;

/** World boxes (px on the table; the frame is the world at zoom 1 centred on the camera). */
const REST: Record<string, { box: Box; rotate: number }> = {
  moses: { box: [240, 489, 600, 762], rotate: -1.5 },
  map: { box: [160, 608, 760, 525], rotate: 2 },
};

export type Piece = {
  id: string;
  /** Frame the sheet's sequence starts on: the start of its beat. */
  start: number;
  /** Frame the next beat's sheet starts; until then this piece is the hero, after it a support. */
  heroUntil: number;
  rest: Box;
  carry: SetDownPoseOptions;
};

export const PIECES: Piece[] = sheet.beats.map((b, i, beats) => {
  const id = b.hero.asset;
  const { box, rotate } = REST[id];
  return {
    id,
    start: Math.round(b.t[0] * FPS),
    heroUntil: i + 1 < beats.length ? Math.round(beats[i + 1].t[0] * FPS) : Infinity,
    rest: box,
    carry: { delay: 0, from: i === 0 ? "top" : "bottom", rotate, size: [box[2], box[3]] },
  };
});

// Beat 1 pushes in on the first sheet; beat 2 pulls out as the second one lands.
const CENTER_X = 540;
const CENTER_Y = 870;
export const CAMERA_KEYS: CamKey[] = [
  { frame: 0, x: CENTER_X, y: CENTER_Y, zoom: 1 },
  { frame: 85, x: CENTER_X, y: CENTER_Y, zoom: 1.2 },
  { frame: 95, x: CENTER_X, y: CENTER_Y, zoom: 1.2 },
  { frame: 170, x: CENTER_X, y: CENTER_Y, zoom: 1 },
];
export const CAMERA_DRIFT = DEFAULT_DRIFT;

/** Caption type: JetBrains Mono, centred on the format's safe box, below the sheets. */
const SAFE = layoutOf(film.format as "9x16").safe;
export const CAPTION = {
  size: 68,
  lineHeight: 1.3,
  top: 1432,
  centerX: SAFE[0] + SAFE[2] / 2,
  width: SAFE[2],
  enter: 6,
  holdS: 0.5,
  weight: 600,
};

export type Chunk = { id: string; text: string; words: Caption[]; from: number; to: number };

const spoken = fromWords(voice);
const landOf = (c: Caption) => Math.round((c.startMs / 1000) * FPS);

/** Each caption chunk is on screen from its first word's travel until the next chunk (or a hold after its last word). */
export const CHUNKS: Chunk[] = film.captions.map((c, i, all) => {
  const words = spoken.slice(c.words[0], c.words[1] + 1);
  const from = landOf(words[0]) - CAPTION.enter;
  const next = all[i + 1] ? landOf(spoken[all[i + 1].words[0]]) - CAPTION.enter : DURATION;
  const held = Math.round((words[words.length - 1].endMs / 1000 + CAPTION.holdS) * FPS);
  return { id: c.id, text: words.map((w) => w.text.trim()).join(" "), words, from, to: Math.min(next, held) };
});
