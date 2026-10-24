// Node side of the film contract: reads a film folder, runs the stage's gates and writes the
// report. Kept out of src/index.ts because it reads files and runs ffmpeg; a film imports it from
// "motion-studio/film/gate" (or by relative path) in its film.test.ts only.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { summarize, toMarkdown, finding } from "../../tools/checks/report.mjs";
import { sampleBox } from "../../tools/checks/media.mjs";
import { checkMp4 as checkMp4Js } from "../../tools/checks/mp4.mjs";
import { checkFilm, type PixelSampler, type Scene } from "./check";
import { layoutOf, type FilmFormat } from "./format";
import { sampleTrace } from "./sample";
import { STAGES, type Finding, type Manifest, type Sheet, type Stage, type TraceAt, type WordsInput } from "./types";

/** film.json. `words` and `manifest` are inline, or a path relative to the film folder. */
export type FilmJson = {
  id: string;
  format: FilmFormat;
  fps: number;
  durationInFrames: number;
  sheet: Sheet;
  words: WordsInput | string;
  manifest: Manifest | string;
  /** [t0, t1] seconds: a closing house outro that puts nothing in the trace. */
  house?: [number, number];
  /** Replaces the register's film length norm: a spot, a short, a test film. Reported as yellow. */
  length?: { minS: number; maxS: number };
};

export type LoadedFilm = Omit<FilmJson, "words" | "manifest"> & { words: WordsInput; manifest: Manifest };

// tools/checks is plain JS with defaulted options; this is the shape the runner uses.
const checkMp4 = checkMp4Js as (mp4: string, o: { min?: number; max?: number; audio?: boolean }) => { findings: Finding[] };

const readJson = (p: string) => JSON.parse(readFileSync(p, "utf8"));
const maybe = (p: string) => (existsSync(p) ? readFileSync(p, "utf8") : null);

/** Reads `<dir>/film.json`, following `words` / `manifest` paths. */
export function loadFilm(dir: string): LoadedFilm {
  const film = readJson(join(dir, "film.json")) as FilmJson;
  const follow = <T>(v: T | string): T => (typeof v === "string" ? readJson(resolve(dir, v)) : v);
  return { ...film, words: follow(film.words), manifest: follow(film.manifest) };
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
  /** The film folder (studio/films/<slug>). */
  dir: string;
  traceAt: TraceAt;
  stage?: Stage;
  /** Write crew/checks-<stage>.{md,json}. Default: only when FILM_STAGE is set (the gate command). */
  write?: boolean;
  /** The render the cut gates read. Default `<dir>/out/silent.mp4`. */
  video?: string;
};

/**
 * One stage of the gate over one film: loads film.json, samples `traceAt`, runs `checkFilm`, and
 * (draft, final) reads the render in `out/silent.mp4` for contrast (T11) and the mp4 checks (V*).
 * At `final` a missing render is red F2; at `draft` the render-based checks are skipped and the
 * report says so, so the gate can run before the first render.
 */
export function runFilmGate({ dir, traceAt, stage = stageFromEnv(), write = !!process.env.FILM_STAGE, video }: RunFilmGateOptions): GateResult {
  const film = loadFilm(dir);
  const findings: Finding[] = [];
  const cut = stage === "draft" || stage === "final";
  const mp4 = video ?? join(dir, "out", "silent.mp4");
  const haveMp4 = cut && existsSync(mp4);
  let sampler: PixelSampler | undefined;
  if (haveMp4) {
    const { W, H } = layoutOf(film.format);
    sampler = sampleBox(mp4, W, H);
  }
  const scenes = maybe(join(dir, "crew", "scenes.json"));
  findings.push(
    ...checkFilm({
      stage,
      sheet: film.sheet,
      manifest: film.manifest,
      words: film.words,
      trace: stage === "script" || stage === "sheet" ? undefined : sampleTrace(traceAt, film),
      scenes: scenes ? (JSON.parse(scenes) as Scene[]) : undefined,
      script: maybe(join(dir, "crew", "script.md")) ?? "",
      factCheck: JSON.parse(maybe(join(dir, "crew", "fact-check.json")) ?? "null"),
      length: film.length,
      sampler,
    }),
  );
  if (cut) {
    if (haveMp4) {
      // The render must be the film's length (a stale file from an older cut is caught here).
      const secs = film.durationInFrames / film.fps;
      findings.push(...checkMp4(mp4, { min: secs - 0.2, max: secs + 0.2 }).findings);
    } else {
      // Relative to the film folder, so the committed report does not carry a machine path.
      const shown = relative(dir, mp4);
      if (stage === "final") findings.push(finding("red", "F2", null, `missing ${shown}`));
      else findings.push(finding("yellow", "F2", null, `no ${shown}: the render checks (V*, T11) were not run`));
    }
  }
  const summary = summarize(findings);
  const markdown = write ? writeChecks(dir, stage, findings) : `${toMarkdown(findings)}\n`;
  return { stage, findings, summary, markdown };
}
