// Geometry and timing for the dry-run film: read by Film.tsx and trace.ts, never copied into them.
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
export const { W, H, safe: SAFE } = layoutOf(film.format as "9x16");
const sec = (s: number) => Math.round(s * FPS);

export const GROUND = "#d9c9a8";
export const INK = "#1d1a16";
export const SHEET_PAPER = "#f6f0e2";
export const SHEET_PAD = 14;

export type Piece = {
  id: string;
  /** Frame the sheet starts travelling in. */
  start: number;
  /** Frame it stops being the hero (Infinity = never a hero or still hero). */
  heroFrom: number;
  heroUntil: number;
  rest: Box;
  carry: SetDownPoseOptions;
  shadow: number;
};

// Map sheet: 1500 px wide, the image fills it inside the pad (image 2000x1382).
const MAP_W = 1500;
const MAP_INNER_W = MAP_W - 2 * SHEET_PAD;
const MAP_SCALE = MAP_INNER_W / 2000;
const MAP_H = Math.round(1382 * MAP_SCALE) + 2 * SHEET_PAD;
const MAP_BOX: Box = [-210, Math.round(H / 2 - MAP_H / 2), MAP_W, MAP_H];

/** The city (Rome on the Ortelius sheet), world px, from its pixel in the 2000x1382 image. */
export const CITY: [number, number] = [
  MAP_BOX[0] + SHEET_PAD + 1215 * MAP_SCALE,
  MAP_BOX[1] + SHEET_PAD + 440 * MAP_SCALE,
];

// Town view dropped on the city: 1700x1274 image, 330 px wide inside the pad.
const TOWN_INNER_W = 330;
const TOWN_W = TOWN_INNER_W + 2 * SHEET_PAD;
const TOWN_H = Math.round((TOWN_INNER_W * 1274) / 1700) + 2 * SHEET_PAD;
const TOWN_BOX: Box = [Math.round(CITY[0] - TOWN_W / 2), Math.round(CITY[1] - TOWN_H / 2), TOWN_W, TOWN_H];

const T_TOWN = sec(4.2);
const T_WORDS = sec(sheet.beats[1].t[0]);

const smooth = (dur: number): Pick<SetDownPoseOptions, "dur" | "stepFps"> => ({ dur, stepFps: 30 });

export const PIECES: Piece[] = [
  {
    id: "page-gutenberg-1455",
    start: 0,
    heroFrom: Infinity,
    heroUntil: Infinity,
    rest: [-170, 30, 760, 1068],
    carry: { delay: 0, from: "left", rotate: -4, size: [760, 1068], ...smooth(0.7) },
    shadow: 0.8,
  },
  {
    id: "print-durer-1498",
    start: 0,
    heroFrom: Infinity,
    heroUntil: Infinity,
    rest: [470, 1260, 700, 992],
    carry: { delay: 0.1, from: "right", rotate: 5, size: [700, 992], ...smooth(0.85) },
    shadow: 0.7,
  },
  {
    id: "map-ortelius-1572",
    start: 0,
    heroFrom: 0,
    heroUntil: T_TOWN,
    rest: MAP_BOX,
    carry: { delay: 0.25, from: "top", rotate: 1.5, size: [MAP_BOX[2], MAP_BOX[3]], ...smooth(0.7) },
    shadow: 1,
  },
  {
    id: "town-merian-1644",
    start: T_TOWN,
    heroFrom: T_TOWN,
    heroUntil: Infinity,
    rest: TOWN_BOX,
    carry: { delay: 0, from: "top", rotate: 2, size: [TOWN_W, TOWN_H], ...smooth(0.6) },
    shadow: 1,
  },
];

export const GROUND_BOX: Box = [0, 0, W, H];

/** The part the zoom lands on: the town view, in world px. */
export const PARTS: Record<string, Box> = { "town-merian-1644.view": TOWN_BOX };

// Beat 1: the camera pushes over the map toward the city, a hard cut (two keys on one frame, the
// move continuing in the same direction) lands closer, then it settles on the town view.
const TRAVEL_FROM = sec(1.3);
const CUT = sec(2.9);
const CLOSE_ZOOM = 1.85;
// The safe box is centred 48 px left of the frame (right rail), so the camera sits right of the city.
const SHIFT_X = 24;
export const CAMERA_KEYS: CamKey[] = [
  { frame: 0, x: 540, y: 960, zoom: 0.72 },
  { frame: TRAVEL_FROM, x: 540, y: 960, zoom: 0.72, ease: "glide" },
  { frame: CUT, x: (540 + CITY[0]) / 2 + 60, y: (960 + CITY[1]) / 2 + 40, zoom: 1.35 },
  { frame: CUT, x: CITY[0] + SHIFT_X, y: CITY[1], zoom: CLOSE_ZOOM, ease: "glide" },
  { frame: DURATION - 1, x: CITY[0] + SHIFT_X, y: CITY[1], zoom: 2.0 },
];
export const CAMERA_DRIFT = DEFAULT_DRIFT;
export const CUT_FRAMES: number[] = [CUT];

/** Caption type: JetBrains Mono, centred on the safe box, in the lower third. */
export const CAPTION = {
  size: 84,
  lineHeight: 1.3,
  top: 1380,
  centerX: SAFE[0] + SAFE[2] / 2,
  width: SAFE[2],
  enter: 6,
  holdS: 0.9,
  weight: 700,
};
/** Paper strip the caption sits on, so it reads over any picture (screen space). */
export const PLATE: Box = [SAFE[0] - 20, CAPTION.top - 10, SAFE[2] + 40, Math.round(CAPTION.size * CAPTION.lineHeight) + 20];

export type Chunk = { id: string; text: string; words: Caption[]; from: number; to: number };

const spoken = fromWords(voice);
const landOf = (c: Caption) => Math.round((c.startMs / 1000) * FPS);

export const CHUNKS: Chunk[] = film.captions.map((c, i, all) => {
  const words = spoken.slice(c.words[0], c.words[1] + 1);
  const from = landOf(words[0]) - CAPTION.enter;
  const next = all[i + 1] ? landOf(spoken[all[i + 1].words[0]]) - CAPTION.enter : DURATION;
  const held = Math.round((words[words.length - 1].endMs / 1000 + CAPTION.holdS) * FPS);
  return { id: c.id, text: words.map((w) => w.text.trim()).join(" "), words, from, to: Math.min(next, held) };
});

export const PLATE_FROM = CHUNKS[0].from;
export const PLATE_TO = CHUNKS[CHUNKS.length - 1].to;

for (const v of [T_TOWN, T_WORDS, TRAVEL_FROM, CUT, ...CITY, ...TOWN_BOX, PLATE_FROM, PLATE_TO]) {
  if (!Number.isFinite(v)) throw new Error("dry-run scene: a derived number is not finite");
}
