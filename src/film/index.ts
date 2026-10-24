// The film contract (see docs/film-contract.md): what a film's traceAt returns and how it is
// sampled for the gates. Browser-safe; the gates themselves are in ./gate (Node).
export * from "./types";
export { FORMATS, layoutOf, type FilmFormat } from "./format";
export { cameraTrace, projectBox, rotatedBox, shiftBox, shotAt } from "./geometry";
export { captionBox, captionItem, MONO, REVEAL_GAP, type CaptionMetrics } from "./caption";
export { sampleTrace, type SampleOptions } from "./sample";
