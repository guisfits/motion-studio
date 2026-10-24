// checkFilm: which gates a stage runs, over a sampled trace and the film's paper. Pure (no files,
// no processes): the vitest harness in node.ts reads the film's files and calls this. Ported from
// the stage logic of archive/engine-v1/core/checks/run.mjs; the gates themselves are the ones in
// tools/checks/ and are never copied.
import { normsFor } from "../../tools/checks/norms.mjs";
import { finding } from "../../tools/checks/report.mjs";
import { checkSyncSheet } from "../../tools/checks/sync.mjs";
import { checkOnePersonPicture } from "../../tools/checks/scenes.mjs";
import { checkPicture } from "../../tools/checks/picture.mjs";
import { checkRhythm } from "../../tools/checks/rhythm.mjs";
import { checkCapHeight, checkContrast } from "../../tools/checks/legibility.mjs";
import { checkFacts } from "../../tools/checks/facts.mjs";
import { checkCues, checkSfxFiles } from "../../tools/checks/cues.mjs";
import { judgeLoudness } from "../../tools/checks/media.mjs";
import { checkTrace } from "./trace-gates";
import type { Box, Finding, Manifest, Sheet, Stage, Trace, WordsInput } from "./types";

/** (t, box) → rgb24 pixels of the rendered frame at t inside the box (tools/checks/media.mjs sampleBox). */
export type PixelSampler = (t: number, box: Box) => Uint8Array;

export type Scene = { n: number; rows: string[]; continues?: number };

// tools/checks is plain JS with defaulted options; these are the shapes checkSound uses.
const sfxFiles = checkSfxFiles as (a: { hasStem: boolean; hasCues: boolean; sidecar: unknown; cueSha256: string | null }) => Finding[];
const cueGate = checkCues as (cues: SfxCue[], words: unknown, o: { preOf?: (type: string) => number }) => Finding[];

/** One line of crew/sfx-cues.json (tools/audio/sfx.mjs): `t` is when the sound is heard. */
export type SfxCue = { t: number; type: string; gain?: number; len?: number };

/**
 * What the `final` stage reads of the mix. Files are read by node.ts; this is their content.
 *   cues      crew/sfx-cues.json parsed, or null when the film has none
 *   cueSha256 sha256 of that file's bytes (null without it)
 *   hasStem   out/sfx.wav exists
 *   sidecar   out/sfx.wav.cues.json parsed, or null when missing or unreadable
 *   loudness  integrated loudness (LUFS) and range (LU) of the mixed file; undefined when there is none
 *   preOf     seconds a cue of that type is heard before its `t` (tools/audio/sfx.mjs cuePre)
 */
export type SoundInput = {
  cues: SfxCue[] | null;
  cueSha256: string | null;
  hasStem: boolean;
  sidecar: { sha256?: string; cues?: SfxCue[] } | null;
  loudness?: { I: number; LRA: number };
  preOf?: (type: string) => number;
};

export type CheckFilmInput = {
  stage: Stage;
  sheet: Sheet;
  manifest: Manifest;
  words: WordsInput;
  /** The sampled trace; required for every stage except `script` and `sheet`. */
  trace?: Trace;
  /** crew/scenes.json: when present, S10 (one picture of a person per scene) is checked. */
  scenes?: Scene[];
  /** crew/script.md and crew/fact-check.json, for the fact-check (X1–X3). */
  script?: string;
  factCheck?: unknown;
  /** Replaces the register's film length norm (a spot or a test film). Reported as an orange F1 until `lengthReason` is given, then yellow. */
  length?: { minS: number; maxS: number };
  /** Why the film overrides the length (a `length:` line of crew/animation-notes.md): with it the F1 note is yellow, else orange. */
  lengthReason?: string;
  /** Rendered pixels for T11 (contrast). Without it, T11 is not run and the report says so. */
  sampler?: PixelSampler;
  /** The sound role's files and the mix reading, for the `final` stage (M2–M6). Ignored before it. */
  sound?: SoundInput;
};

/** The gate shape `{w, start, end}` of word timings given as `{w, s, e}` or `{w, start, end}`. */
export function gateWords(input: WordsInput): { words: { w: string; start: number; end: number }[] } {
  return {
    words: (input?.words ?? []).map((x) => ({ w: x.w, start: (x.start ?? x.s) as number, end: (x.end ?? x.e) as number })),
  };
}

/**
 * The findings of one stage.
 *   script   fact-check only (X1–X3), signed before any voice, sheet or picture exists
 *   sheet    the paper: sync sheet (S*), one-person-per-scene (S10), length (F1)
 *   animatic sheet + trace (T*, H1, P1, R1–R3)
 *   draft    sheet + trace (R1, R2, R4) + caption type (T10) and, with `sampler`, contrast (T11)
 *   final    draft + the fact-check against the signed sheet + the sound: SFX cues against the
 *            narration (M4, M5), the stem traced to its cue list (M6), loudness of the mix (M2, M3)
 * The fact-check gates the script and the final cut, never the stages between (client, 2026-10-16).
 */
export function checkFilm(input: CheckFilmInput): Finding[] {
  const { stage, sheet, manifest, scenes, length, lengthReason } = input;
  const out: Finding[] = [];
  const facts = (s: Sheet | null) => checkFacts({ script: input.script ?? "", factCheck: input.factCheck, sheet: s });
  if (stage === "script") return facts(null);

  const words = gateWords(input.words);
  out.push(...checkSyncSheet(sheet, words, manifest), ...checkOnePersonPicture(sheet, manifest, scenes));
  if (stage === "final") out.push(...facts(sheet));

  // The sheet's register (default A) picks the norms the length, rhythm and camera gates read.
  const norms = normsFor(sheet.register);
  const end = words.words.at(-1)?.end ?? 0;
  // A film that closes on a product segment (`sheet.app.t0`) is measured in two parts: the story
  // up to t0 against norms.film, the segment after it against norms.appSegment.
  const appT0 = sheet.app?.t0;
  const spans: [string, number, { minS: number; maxS: number }][] = appT0
    ? [
        ["story", appT0, length ?? norms.film],
        ["app segment", end - appT0, norms.appSegment],
      ]
    : [["narration", end, length ?? norms.film]];
  for (const [name, len, norm] of spans)
    if (len < norm.minS || len > norm.maxS)
      out.push(finding("red", "F1", null, `${name} is ${len.toFixed(1)} s (${norm.minS}–${norm.maxS})`));
  if (length) {
    const said = `length norm overridden by film.json: ${length.minS}–${length.maxS} s (register: ${norms.film.minS}–${norms.film.maxS} s)`;
    if (lengthReason?.trim()) out.push(finding("yellow", "F1", null, `${said}; reason in crew/animation-notes.md`));
    else out.push(finding("orange", "F1", null, `${said}; add a \`length: <reason>\` line to crew/animation-notes.md`));
  }

  if (stage === "sheet") return out;
  const { trace } = input;
  if (!trace) return [...out, finding("red", "T0", null, `stage ${stage} needs a trace: the film folder's trace.ts must export traceAt (sampleTrace(traceAt, …))`)];
  out.push(
    ...checkTrace(trace, { manifest, norms }),
    ...checkPicture(trace, sheet, manifest, norms),
    ...checkRhythm(trace, words, { stage, norms, manifest }),
  );
  // Caption type is judged on the cut: T10 reads the trace, T11 the rendered frames.
  if (stage === "draft" || stage === "final") {
    out.push(...checkCapHeight(trace));
    if (input.sampler) out.push(...checkContrast(trace, input.sampler));
    else out.push(finding("yellow", "T11", null, "contrast not checked: no render to read the pixels behind each caption"));
  }
  if (stage === "final") out.push(...checkSound(input.sound, words));
  return out;
}

/**
 * The sound gates of the final stage, ported from the old run.mjs. A film may have no SFX: no cue
 * file and no stem is no finding; a stem alone is M6. M4/M5 read the cues the stem was rendered
 * from (the sidecar, after thinning) and fall back to the cue file when there is no usable sidecar.
 */
function checkSound(sound: SoundInput | undefined, words: ReturnType<typeof gateWords>): Finding[] {
  if (!sound) return [finding("yellow", "M2", null, "sound not checked: no `sound` input (cues, stem, mixed file) was given")];
  const { cues, cueSha256, hasStem, sidecar, loudness, preOf } = sound;
  const out: Finding[] = sfxFiles({ hasStem, hasCues: cues !== null, sidecar, cueSha256 });
  if (cues !== null) out.push(...cueGate(Array.isArray(sidecar?.cues) ? sidecar.cues : cues, words, { preOf }));
  if (loudness) out.push(...judgeLoudness(loudness));
  else out.push(finding("yellow", "M2", null, "loudness not checked: no mixed file to measure"));
  return out;
}
