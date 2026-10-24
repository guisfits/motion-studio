// Node side of the film contract: reads a film folder, runs the stage's gates and writes the
// report. Kept out of src/index.ts because it reads files and runs ffmpeg; a film imports it from
// "motion-studio/film/gate" (or by relative path) in its film.test.ts only.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, isAbsolute, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { summarize, toMarkdown, finding } from "../../tools/checks/report.mjs";
import { deadFrames as deadFramesJs, loudness as loudnessJs, sampleBox } from "../../tools/checks/media.mjs";
import { cuePre as cuePreJs } from "../../tools/audio/sfx.mjs";
import { checkMp4 as checkMp4Js } from "../../tools/checks/mp4.mjs";
import { checkFilm, type PixelSampler, type Scene, type SfxCue, type SoundInput } from "./check";
import { layoutOf, type FilmFormat } from "./format";
import { sampleTrace } from "./sample";
import { STAGES, type Finding, type Manifest, type Sheet, type Stage, type TraceAt, type WordsInput } from "./types";

/**
 * film.json. `sheet`, `words` and `manifest` are a path relative to the film folder (the crew
 * edits that one file) or inline. Left out, each defaults to its crew file (`FILM_FILES`).
 */
export type FilmJson = {
  id: string;
  format: FilmFormat;
  fps: number;
  durationInFrames: number;
  sheet?: Sheet | string;
  words?: WordsInput | string;
  manifest?: Manifest | string;
  /** [t0, t1] seconds: a closing house outro that puts nothing in the trace. */
  house?: [number, number];
  /** Replaces the register's film length norm: a spot, a short, a test film. Reported as orange until `crew/animation-notes.md` gives the reason. */
  length?: { minS: number; maxS: number };
};

export type LoadedFilm = Omit<FilmJson, "sheet" | "words" | "manifest"> & { sheet: Sheet; words: WordsInput; manifest: Manifest };

/** Where each part of the paper lives when film.json does not say (and before film.json exists). */
export const FILM_FILES = { sheet: "crew/sync-sheet.json", manifest: "crew/manifest.json", words: "voice/words.json" } as const;

// tools/checks is plain JS with defaulted options; this is the shape the runner uses.
const checkMp4 = checkMp4Js as (mp4: string, o: { min?: number; max?: number; audio?: boolean }) => { findings: Finding[] };

const deadFrames = deadFramesJs as (mp4: string) => Finding[];
const loudness = loudnessJs as (mp4: string) => { I: number; LRA: number; findings: Finding[] };
const cuePre = cuePreJs as (type: string) => number;

const readJson = (p: string) => JSON.parse(readFileSync(p, "utf8"));
const maybe = (p: string) => (existsSync(p) ? readFileSync(p, "utf8") : null);

export type FilmSource = {
  film: LoadedFilm;
  /** Paper the stage needs that is not there (paths relative to the film folder). */
  missing: string[];
  /** Parts held twice: inline in film.json and again as a crew file. */
  twice: string[];
};

const EMPTY = { sheet: { beats: [] }, words: { words: [] }, manifest: { assets: [] } } as const;
const PARTS = ["sheet", "manifest", "words"] as const;

/**
 * Reads a film folder for `stage`. `film.json` is read when present; else the film is assembled
 * from `crew/sync-sheet.json`, `crew/manifest.json` and `voice/words.json`, which is all the
 * `script` and `sheet` stages need (no clock, no trace). One source of truth: film.json refers
 * to the crew files by path, and a part held inline while its crew file also exists is reported
 * in `twice`. `script` needs none of the three (the fact-check reads crew/script.md).
 */
export function readFilm(dir: string, stage: Stage): FilmSource {
  const filmPath = join(dir, "film.json");
  const hasFilm = existsSync(filmPath);
  const json = (hasFilm ? readJson(filmPath) : {}) as Partial<FilmJson>;
  const needsPaper = stage !== "script";
  const missing: string[] = [];
  const twice: string[] = [];
  const parts: Record<string, unknown> = {};
  for (const k of PARTS) {
    const v = json[k] ?? FILM_FILES[k];
    if (typeof v !== "string") {
      parts[k] = v;
      if (existsSync(resolve(dir, FILM_FILES[k]))) twice.push(k);
    } else if (existsSync(resolve(dir, v))) parts[k] = readJson(resolve(dir, v));
    else {
      parts[k] = EMPTY[k];
      if (needsPaper) missing.push(v);
    }
  }
  // From `animatic` on the clock (fps, length, format) is film.json's; `sheet` and `script` have no use for it.
  if (!hasFilm && stage !== "script" && stage !== "sheet") missing.push("film.json");
  const film = {
    id: basename(resolve(dir)),
    format: "9x16" as FilmFormat,
    fps: 30,
    durationInFrames: 0,
    ...json,
    ...parts,
  } as LoadedFilm;
  return { film, missing, twice };
}

/** `readFilm` that throws when the stage's paper is missing. */
export function loadFilm(dir: string, stage: Stage = "draft"): LoadedFilm {
  const { film, missing } = readFilm(dir, stage);
  if (missing.length) throw new Error(`${dir}: missing ${missing.join(", ")}`);
  return film;
}

/** The stage to gate: `FILM_STAGE`, else `fallback`. An unknown value stops the run. */
export function stageFromEnv(fallback: Stage = "draft", env: Record<string, string | undefined> = process.env): Stage {
  const v = env.FILM_STAGE;
  if (v === undefined || v === "") return fallback;
  if (!(STAGES as readonly string[]).includes(v)) throw new Error(`FILM_STAGE must be one of ${STAGES.join("|")}, got "${v}"`);
  return v as Stage;
}

/** crew/checks-<stage>.md and .json: deterministic, so an unchanged film leaves no diff. */
export function writeChecks(dir: string, stage: Stage, findings: Finding[]): string {
  const s = summarize(findings);
  mkdirSync(join(dir, "crew"), { recursive: true });
  writeFileSync(join(dir, "crew", `checks-${stage}.json`), JSON.stringify({ stage, summary: s, findings }, null, 1) + "\n");
  const md = `# Checks — ${stage}\n\n${s.pass ? "PASS" : "FAIL"} — 🔴 ${s.red} 🟠 ${s.orange} 🟡 ${s.yellow}\n\n${toMarkdown(findings) || "✅ no findings"}\n`;
  writeFileSync(join(dir, "crew", `checks-${stage}.md`), md);
  return md;
}

export type GateResult = { stage: Stage; findings: Finding[]; summary: ReturnType<typeof summarize>; markdown: string };

export type RunFilmGateOptions = {
  /** The film folder (studio/films/<slug>, or any folder: a host project's films/<slug>). */
  dir: string;
  /** The film's trace. Without it the stages that read a trace (animatic, draft, final) are red T0. */
  traceAt?: TraceAt;
  stage?: Stage;
  /** Write crew/checks-<stage>.{md,json}. Default: only when FILM_STAGE is set (the gate command). */
  write?: boolean;
  /**
   * A missing draft render is red F2 (else yellow: the gate may run before the first render).
   * Default: red when `FILM_STAGE=draft` is set, the gate command; yellow in a plain `vitest run`.
   */
  requireRender?: boolean;
  /**
   * The render the cut gates read. Default: at `draft` the draft render (`<dir>/out/draft-<format>.mp4`,
   * else `<dir>/out/draft.mp4`); at `final` the silent master (`out/silent-<format>.mp4`, else `out/silent.mp4`).
   */
  video?: string;
  /** The mixed cut the `final` sound gates read. Default `<dir>/out/final-<format>.mp4`, else `<dir>/out/final.mp4`. */
  mixed?: string;
};

/**
 * One stage of the gate over one film: loads film.json, samples `traceAt`, runs `checkFilm`, and
 * (draft, final) reads the stage's render for contrast (T11) and the mp4 checks (V*): the draft
 * render (picture lock) at `draft`, the silent master rendered after the lock at `final`.
 * At `final` a missing render is red F2; at `draft` it is red under the gate command
 * (`FILM_STAGE=draft`, `requireRender`) and yellow in a plain run, which skips the render-based
 * checks and says so, so the tests can run before the first render.
 * At `final` it also reads the sound role's files (crew/sfx-cues.json, out/sfx.wav and its
 * sidecar) and the mixed cut (`mixed`): M1 dead frames, M2/M3 loudness, M4–M6 cues; a missing
 * mixed cut is red F2.
 */
export function runFilmGate({
  dir,
  traceAt,
  stage = stageFromEnv(),
  write = !!process.env.FILM_STAGE,
  requireRender = process.env.FILM_STAGE === "draft",
  video,
  mixed,
}: RunFilmGateOptions): GateResult {
  const { film, missing, twice } = readFilm(dir, stage);
  const findings: Finding[] = [];
  const paper = [
    ...missing.map((m) => finding("red", "F0", null, `missing ${m}: the ${stage} gate reads it`)),
    ...twice.map((k) => finding("red", "F0", null, `${k} is in film.json and in ${FILM_FILES[k as keyof typeof FILM_FILES]}: keep one copy (film.json holds the path)`)),
  ];
  if (paper.length) return report(dir, stage, paper, write);
  const cut = stage === "draft" || stage === "final";
  // The silent master only exists after picture lock, so the draft gate never reads it: a stale
  // master from an earlier cut would be judged in place of the draft.
  const render = stage === "draft" ? "draft" : "silent";
  const named = join(dir, "out", `${render}-${film.format}.mp4`);
  const mp4 = video ?? [named, join(dir, "out", `${render}.mp4`)].find(existsSync) ?? named;
  const haveMp4 = cut && existsSync(mp4);
  let sampler: PixelSampler | undefined;
  if (haveMp4) {
    const { W, H } = layoutOf(film.format);
    sampler = sampleBox(mp4, W, H);
  }
  const scenes = maybe(join(dir, "crew", "scenes.json"));
  const mix = stage === "final" ? readSound(dir, film.format, mixed) : undefined;
  findings.push(
    ...checkFilm({
      stage,
      sheet: film.sheet,
      manifest: film.manifest,
      words: film.words,
      trace: stage === "script" || stage === "sheet" || !traceAt ? undefined : sampleTrace(traceAt, film),
      scenes: scenes ? (JSON.parse(scenes) as Scene[]) : undefined,
      script: maybe(join(dir, "crew", "script.md")) ?? "",
      factCheck: JSON.parse(maybe(join(dir, "crew", "fact-check.json")) ?? "null"),
      length: film.length,
      lengthReason: lengthReason(maybe(join(dir, "crew", "animation-notes.md"))),
      sampler,
      sound: mix?.sound,
    }),
  );
  if (mix) findings.push(...mix.findings);
  if (cut) {
    if (haveMp4) {
      // The render must be the film's length (a stale file from an older cut is caught here).
      const secs = film.durationInFrames / film.fps;
      findings.push(...checkMp4(mp4, { min: secs - 0.2, max: secs + 0.2 }).findings);
    } else {
      // Relative to the film folder, so the committed report does not carry a machine path.
      const shown = relative(dir, mp4);
      if (stage === "final") findings.push(finding("red", "F2", null, `missing ${shown}`));
      else if (requireRender) findings.push(finding("red", "F2", null, `missing ${shown}`));
      else findings.push(finding("yellow", "F2", null, `no ${shown}: the render checks (V*, T11) were not run`));
    }
  }
  return report(dir, stage, findings, write);
}

function report(dir: string, stage: Stage, findings: Finding[], write: boolean): GateResult {
  const summary = summarize(findings);
  const markdown = write ? writeChecks(dir, stage, findings) : `${toMarkdown(findings)}\n`;
  return { stage, findings, summary, markdown };
}

/** The reason for a length override: the first `length: <reason>` line of crew/animation-notes.md. */
export function lengthReason(notes: string | null): string | undefined {
  return notes?.match(/^length:[ \t]*(\S.*)$/im)?.[1].trim();
}

/**
 * The generic gate command (`FILM_DIR=<film> FILM_STAGE=<stage> npx vitest run
 * src/film/__tests__/stage-gate.test.ts`): gates any folder, from the first stage on. `FILM_DIR` is
 * absolute or relative to the working directory; the folder needs only the paper its stage reads
 * (see `readFilm`). From `animatic` it imports `<dir>/trace.ts` (a `traceAt` export); a trace
 * stage without it is red T0. Writes `crew/checks-<stage>.{md,json}`.
 */
export async function runStageGate(opts: { dir?: string; stage?: Stage; env?: Record<string, string | undefined>; traceAt?: TraceAt } = {}): Promise<GateResult> {
  const env = opts.env ?? process.env;
  const given = opts.dir ?? env.FILM_DIR;
  if (!given) throw new Error("FILM_DIR is not set: the film folder to gate");
  const dir = isAbsolute(given) ? given : resolve(process.cwd(), given);
  if (!existsSync(dir)) throw new Error(`FILM_DIR ${dir} does not exist`);
  if (!opts.stage && !env.FILM_STAGE) throw new Error(`FILM_STAGE is not set: one of ${STAGES.join("|")}`);
  const stage = opts.stage ?? stageFromEnv("draft", env);
  const traceAt = opts.traceAt ?? (stage === "script" || stage === "sheet" ? undefined : await importTraceAt(dir));
  return runFilmGate({ dir, traceAt, stage, write: true, requireRender: stage === "draft" });
}

/** `<dir>/trace.ts`'s `traceAt` (named or default export); undefined when the folder has no trace.ts. */
async function importTraceAt(dir: string): Promise<TraceAt | undefined> {
  const file = join(dir, "trace.ts");
  if (!existsSync(file)) return undefined;
  const mod = await import(/* @vite-ignore */ pathToFileURL(file).href);
  const fn = mod.traceAt ?? mod.default;
  if (typeof fn !== "function") throw new Error(`${file} must export traceAt(frame)`);
  return fn as TraceAt;
}

/**
 * The sound role's files for the `final` gates, plus the findings that come from reading the mixed
 * cut itself (F2 when missing; M0/M1 from ffmpeg). Without crew/sfx-cues.json `cues` is null: a film
 * may have no SFX. A sidecar that is not JSON counts as missing, which the gate reports as M6.
 */
function readSound(dir: string, format: FilmFormat, mixed?: string): { sound: SoundInput; findings: Finding[] } {
  const cuesPath = join(dir, "crew", "sfx-cues.json");
  const cuesBytes = existsSync(cuesPath) ? readFileSync(cuesPath) : null;
  let sidecar: SoundInput["sidecar"] = null;
  const sidecarRaw = maybe(join(dir, "out", "sfx.wav.cues.json"));
  try {
    sidecar = sidecarRaw ? JSON.parse(sidecarRaw) : null;
  } catch {
    sidecar = null;
  }
  const sound: SoundInput = {
    cues: cuesBytes ? (JSON.parse(cuesBytes.toString("utf8")) as SfxCue[]) : null,
    cueSha256: cuesBytes ? createHash("sha256").update(cuesBytes).digest("hex") : null,
    hasStem: existsSync(join(dir, "out", "sfx.wav")),
    sidecar,
    preOf: cuePre,
  };
  const findings: Finding[] = [];
  const mp4 = mixed ?? [join(dir, "out", `final-${format}.mp4`), join(dir, "out", "final.mp4")].find(existsSync) ?? join(dir, "out", `final-${format}.mp4`);
  if (!existsSync(mp4)) {
    findings.push(finding("red", "F2", null, `missing ${relative(dir, mp4)}`));
  } else {
    const l = loudness(mp4);
    if (l.findings.some((x) => x.code === "M0")) findings.push(...l.findings);
    else {
      sound.loudness = { I: l.I, LRA: l.LRA };
      findings.push(...deadFrames(mp4));
    }
  }
  return { sound, findings };
}
