// Node side of the film contract: reads a film folder, runs the stage's gates and writes the
// report. Kept out of src/index.ts because it reads files and runs ffmpeg; a film imports it from
// "motion-studio/film/gate" (or by relative path) in its film.test.ts only.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { summarize, toMarkdown, finding } from "../../tools/checks/report.mjs";
import { deadFrames as deadFramesJs, loudness as loudnessJs, sampleBox } from "../../tools/checks/media.mjs";
import { cuePre as cuePreJs } from "../../tools/audio/sfx.mjs";
import { checkMp4 as checkMp4Js } from "../../tools/checks/mp4.mjs";
import { checkFilm, type PixelSampler, type Scene, type SfxCue, type SoundInput } from "./check";
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

const deadFrames = deadFramesJs as (mp4: string) => Finding[];
const loudness = loudnessJs as (mp4: string) => { I: number; LRA: number; findings: Finding[] };
const cuePre = cuePreJs as (type: string) => number;

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
 * At `final` a missing render is red F2; at `draft` the render-based checks are skipped and the
 * report says so, so the gate can run before the first render.
 * At `final` it also reads the sound role's files (crew/sfx-cues.json, out/sfx.wav and its
 * sidecar) and the mixed cut (`mixed`): M1 dead frames, M2/M3 loudness, M4–M6 cues; a missing
 * mixed cut is red F2.
 */
export function runFilmGate({ dir, traceAt, stage = stageFromEnv(), write = !!process.env.FILM_STAGE, video, mixed }: RunFilmGateOptions): GateResult {
  const film = loadFilm(dir);
  const findings: Finding[] = [];
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
      trace: stage === "script" || stage === "sheet" ? undefined : sampleTrace(traceAt, film),
      scenes: scenes ? (JSON.parse(scenes) as Scene[]) : undefined,
      script: maybe(join(dir, "crew", "script.md")) ?? "",
      factCheck: JSON.parse(maybe(join(dir, "crew", "fact-check.json")) ?? "null"),
      length: film.length,
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
      else findings.push(finding("yellow", "F2", null, `no ${shown}: the render checks (V*, T11) were not run`));
    }
  }
  const summary = summarize(findings);
  const markdown = write ? writeChecks(dir, stage, findings) : `${toMarkdown(findings)}\n`;
  return { stage, findings, summary, markdown };
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
