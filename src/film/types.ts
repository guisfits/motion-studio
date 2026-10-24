// The film contract's data shapes. `TraceItem`/`Trace` are what the meaning gates in
// tools/checks read; the sheet, manifest and words shapes are what tools/checks/sync.mjs reads.

/** [x, y, w, h] in frame px. */
export type Box = [number, number, number, number];

/**
 * What an item is to the gates. `hero`, `support` and `piece` ids are asset ids in the manifest;
 * `ground` is a ground or paper under the pieces (never coverage); `target` is a beat's zoom
 * target part (id `<beat id>-target`).
 */
export type TraceRole = "caption" | "lettering" | "hero" | "support" | "mark" | "piece" | "ground" | "target";

export type TraceItem = {
  id: string;
  role: TraceRole;
  /** Where it is drawn, in frame px, after the camera and any entrance offset or scale. */
  box: Box;
  /** 0..1; 1 when absent. */
  alpha?: number;
  text?: string;
  /** Caption only: cap height of the text in frame px, as drawn (T10). */
  cap?: number;
  /** Caption only: text colour as `#rgb`, `#rrggbb` or `rgb()` (T11). */
  color?: string;
  /** Lettering only: a display word cropped by the frame edge on purpose (T4 skips it). */
  bleed?: boolean;
};

export type TraceCamera = {
  /** Screen scale of the world (the camera's zoom, drift included). */
  scale: number;
  x: number;
  y: number;
  /** Changes value at each hard cut: the gates read a change as an edit event, not as a move. */
  shot?: number | string;
};

/** What one frame shows: the return value of a film's `traceAt(frame)`. */
export type FrameTrace = { items: TraceItem[]; camera?: TraceCamera | null };

/** A film's trace function. Pure in the frame: same frame in, same trace out. */
export type TraceAt = (frame: number) => FrameTrace;

export type TraceFrame = { t: number; items: TraceItem[]; camera: TraceCamera | null };

/** The sampled trace the gates read. */
export type Trace = {
  W: number;
  H: number;
  /** Seconds. */
  dur: number;
  fps: number;
  /** The format's safe box. */
  safe: Box;
  /** [t0, t1] of a closing house outro that puts nothing in the trace (see tools/checks/house.mjs). */
  house?: [number, number];
  frames: TraceFrame[];
};

export type Severity = "red" | "orange" | "yellow";
export type Finding = { severity: Severity; code: string; t: number | null; msg: string };

export const STAGES = ["script", "sheet", "animatic", "draft", "final"] as const;
export type Stage = (typeof STAGES)[number];

export type Beat = {
  id: string;
  t: [number, number];
  says: string;
  hero?: { asset?: string };
  key?: { word: string; t: number }[];
  lettering?: { text: string; says?: string; lands: number; mark?: boolean }[];
  zoom?: { kind?: string; target?: string };
};

/** The sync sheet: crew/sync-sheet.json of the old engine, now `sheet` in film.json. */
export type Sheet = {
  beats: Beat[];
  register?: string;
  app?: { t0?: number };
};

export type ManifestAsset = {
  id: string;
  kind?: string;
  treatment?: string;
  status?: string;
  licence?: string;
  source?: string;
  [k: string]: unknown;
};
export type Manifest = { assets: ManifestAsset[] };

/** Word timings: the transcribe shape `{w, s, e}` (seconds) or the gate shape `{w, start, end}`. */
export type SpokenWord = { w: string; s?: number; e?: number; start?: number; end?: number };
export type WordsInput = { words: SpokenWord[] };
