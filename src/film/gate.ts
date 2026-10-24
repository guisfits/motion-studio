// "motion-studio/film/gate": the Node side of the film contract (checkFilm, runFilmGate, …).
export { checkFilm, gateWords, type CheckFilmInput, type PixelSampler, type Scene, type SfxCue, type SoundInput } from "./check";
export { checkTrace } from "./trace-gates";
export {
  FILM_FILES,
  lengthReason,
  loadFilm,
  readFilm,
  runFilmGate,
  runStageGate,
  stageFromEnv,
  writeChecks,
  type FilmJson,
  type FilmSource,
  type GateResult,
  type LoadedFilm,
  type RunFilmGateOptions,
} from "./node";
