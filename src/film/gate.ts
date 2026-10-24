// "motion-studio/film/gate": the Node side of the film contract (checkFilm, runFilmGate, …).
export { checkFilm, gateWords, type CheckFilmInput, type PixelSampler, type Scene } from "./check";
export { checkTrace } from "./trace-gates";
export { loadFilm, runFilmGate, stageFromEnv, writeChecks, type FilmJson, type GateResult, type LoadedFilm, type RunFilmGateOptions } from "./node";
