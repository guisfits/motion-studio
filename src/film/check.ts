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
import { checkTrace } from "./trace-gates";
import type { Box, Finding, Manifest, Sheet, Stage, Trace, WordsInput } from "./types";

/** (t, box) → rgb24 pixels of the rendered frame at t inside the box (tools/checks/media.mjs sampleBox). */
export type PixelSampler = (t: number, box: Box) => Uint8Array;

export type Scene = { n: number; rows: string[]; continues?: number };

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
  /** Replaces the register's film length norm (a spot or a test film). Reported as a yellow F1 note. */
  length?: { minS: number; maxS: number };
  /** Rendered pixels for T11 (contrast). Without it, T11 is not run and the report says so. */
  sampler?: PixelSampler;
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
 *   final    draft + the fact-check against the signed sheet
 * The fact-check gates the script and the final cut, never the stages between (client, 2026-10-16).
 */
export function checkFilm(input: CheckFilmInput): Finding[] {
  const { stage, sheet, manifest, scenes, length } = input;
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
  if (length) out.push(finding("yellow", "F1", null, `length norm overridden by film.json: ${length.minS}–${length.maxS} s (register: ${norms.film.minS}–${norms.film.maxS} s)`));

  if (stage === "sheet") return out;
  const { trace } = input;
  if (!trace) return [...out, finding("red", "T0", null, `stage ${stage} needs a trace (sampleTrace(traceAt, …))`)];
  out.push(
    ...checkTrace(trace, { manifest, norms }),
    ...checkPicture(trace, sheet, manifest, norms),
    ...checkRhythm(trace, words, { stage, norms, manifest }),
  );
  // Caption type is judged on the cut: T10 reads the trace, T11 the rendered frames.
  if (stage === "draft" || stage === "final") {
    out.push(...checkCapHeight(trace));
    if (input.sampler) out.push(...checkContrast(trace, input.sampler));
    else out.push(finding("yellow", "T11", null, "contrast not checked: no rendered out/silent.mp4 to read the pixels behind each caption"));
  }
  return out;
}
