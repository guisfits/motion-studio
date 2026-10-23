// Every gate threshold, once. Sources: Netflix/BBC subtitle guidance (captions), craft research
// (sync, frames, camera), research/editing-grammar.md (rhythm, caption type, punches), house loudness. Skills quote this file instead of restating numbers.
export const NORMS = Object.freeze({
  fps: 30,
  caption: Object.freeze({
    maxCps: 17,
    // Register A swaps caption chunks every 0.4-0.6 s (research/editing-grammar.md §7, §10); a
    // subtitle-guide 0.83 s would fail the pros' own rhythm. maxCps still guards long chunks (D66).
    minLegibleS: 0.5,
    maxWords: 4,
    legibleAlpha: 0.95,
    // Cap height as a fraction of frame height: register-A captions measure 2.5–3.5 % (grammar §7);
    // a word drawn bigger than 4.5 % is emphasis lettering, not a caption.
    capHeight: Object.freeze([0.025, 0.045]),
    // WCAG AA contrast of the caption text against the pixels behind it (craft §2.5).
    minContrast: 4.5,
  }),
  sync: Object.freeze({
    heroWindowFrames: [-3, 0],
    letteringToleranceFrames: 3,
    maxMarksPerSecond: 1,
    // How far the first beat may start after the first word, and the last end before the last.
    coverSlackS: 0.5,
    // ~ own: a word starting this close to a row's edge may belong to either row (S11); a quarter
    // second is the gap a narrator leaves between phrases.
    lineSlackS: 0.25,
  }),
  frames: Object.freeze({
    deadWindowS: 4,
    deadNoise: 0.003,
    // Pieces must cover 10 % of the frame: "one hero on a quiet ground" leaves 40–90 % empty in
    // finished pieces (grammar §6), so only a practically empty frame is red.
    minCoverage: 0.1,
    heroThird: [1 / 3, 2 / 3],
    // A hero counts as on screen only from this alpha (fades in and out do not).
    heroAlpha: 0.95,
    // ~ client (second film): an approved scene may open on the bare ground while its first piece
    // moves in; T5 does not read a scene's first 0.3 s when that piece is entering.
    entranceGraceS: 0.3,
    // ~ own: a piece "moves in" (T12) when, over its first 0.2 s, its box travels at least 2 % of
    // the frame width or changes size by 4 % (a drop from a hand's height scales by up to 12 %);
    // less is a pop and a settle. A box within 2 px of the frame edge touches it.
    entryWindowS: 0.2,
    entryTravel: 0.02,
    entryScale: 0.04,
    edgePx: 2,
  }),
  camera: Object.freeze({
    emphasisMinScaleDelta: 0.15,
    maxLinearRunFrames: 3,
    // A scale move of 2x or more is a punch: 3 % of pushes, a rare accent (grammar §12.2).
    punchMax: 2.0,
    maxPunches: 2,
    // ~ own: under 1 %/s of scale change the camera holds (the table's breathing peaks at 0.36 %/s),
    // so T8 does not read a held camera's drift as a linear move.
    holdRate: 0.01,
  }),
  // Register A's edit rhythm, p10–p90 over 165 pieces (grammar §10). An event is a picture change
  // (hero), a caption chunk change or a hard cut.
  rhythm: Object.freeze({
    events: Object.freeze(["hero", "caption", "shot"]),
    aslRange: Object.freeze([0.7, 2.1]),
    eventsPer10s: Object.freeze([4.7, 13.8]),
    wordsPerEvent: Object.freeze([2.1, 5.5]),
    // Last-5-s event rate at most this times the body rate (measured 0.53x, grammar §10).
    endSlowdown: 0.75,
    // Still holds of 4 s or more occur in 4 of 165 pieces (grammar §10).
    maxStillHoldS: 4,
    // ~ own: events this close read as one edit (a picture and its caption landing together).
    eventMergeS: 0.1,
    // ~ own: a hold is still when the scale moves under 2 % and the centre under 2 % of the width.
    stillTravel: 0.02,
  }),
  audio: Object.freeze({
    lufs: -14,
    lufsTol: 1,
    maxLra: 3,
    // research/sound-grammar.md §4.1, §7: the pros average 0.25 cues per 4 s, but 36 % of pieces have a
    // window of 2 (a riser plus its hit); p90 of the per-piece max window is 2. A cap of 1 would
    // fail a third of the pros (D65).
    maxSfxPer4s: 2,
    // The window maxSfxPer4s is counted over; two cues exactly this far apart are in different windows.
    sfxWindowS: 4,
    // ~ inferred: a cue this close to a spoken word already masks it, so the word's edges are widened by it.
    sfxWordMarginS: 0.05,
  }),
  // ~ client rule (2026-10-19, replaces 2026-10-17's 1-2 min): a 135 s story was "muito longo e
  // cansativo… perde o foco"; the story runs at most ~90 s, then 15-30 s of app and close.
  film: Object.freeze({ minS: 45, maxS: 90 }),
  // ~ client rule (AdScriptura, 2026-10-16): the story then ~30 s selling the product;
  // a film opts in by declaring sheet.app.t0.
  appSegment: Object.freeze({ minS: 15, maxS: 30 }),
  // ~ own: the client's animatic is a real draw(t) render, so a caption chunk (0.5 s and up) is seen
  // for at least 6 frames; the whole film then renders in a fraction of the draft's time.
  animatic: Object.freeze({ fps: 12, width: 540 }),
  voice: Object.freeze({
    // ASR character error rate a voice take may have before hand-off.
    maxCer: 0.03,
  }),
  // Other registers: a sheet declares `register` and the gates read normsFor(register). Only the
  // keys a register changes are listed; the rest is register A's (see normsFor).
  registers: Object.freeze({
    // ~ own: Moran + client 2026-10-17 ("instrutivos… não causar ansiedade"), refit on the first
    // instructive film (research/moran-cuts-zoom.md §5). Not measured on any piece.
    instructive: Object.freeze({
      film: Object.freeze({ minS: 60, maxS: 90 }),
      appSegment: Object.freeze({ minS: 15, maxS: 30 }),
      rhythm: Object.freeze({
        // An instructive scene is built on one hero, a piece at a time (Moran: the picture changes
        // by what lands on it), so a piece arriving is an edit event here. Counting it, rather
        // than refitting the ranges below on one film, keeps the ranges what they were set to
        // measure (a picture change every 1.4-3.8 s): on the second film (Arrependei-vos, client
        // 10/10) hero/caption/shot alone gave 22 events (4.9 s each, R1 red); with arrivals of
        // heroes, pieces and supports, 40 (2.7 s, 5.7 words each), inside the instructive ranges.
        // Lettering landing is not counted: with it the film reads 1.6 s and 3.4 words per event,
        // a word on the picture it explains is not a new picture.
        events: Object.freeze(["hero", "caption", "shot", "arrival"]),
        aslRange: Object.freeze([1.4, 3.8]),
        eventsPer10s: Object.freeze([2.6, 7.0]),
        wordsPerEvent: Object.freeze([3.5, 8.0]),
        maxStillHoldS: 6,
        // A settled hold after a definition, number or answer (inferred; no Moran lesson).
        restAfterKeyS: 1.0,
      }),
      camera: Object.freeze({
        emphasisMinScaleDelta: 0.12,
        // Average scale change per second over an emphasis move (A's push is ~10 %/s).
        maxPushRatePerS: 0.12,
        // An emphasis move spans at least this long (Moran: long eases of 1-2 s).
        minMoveS: 1.0,
        maxPunches: 1,
        // No camera shake, no flicker above 2 Hz, no flash train (animator tell 6).
        forbidShake: true,
      }),
    }),
  }),
});

// The norms a sheet's register is graded by: register A (the default, undefined) is NORMS itself;
// another register overlays its film, appSegment, rhythm and camera blocks key by key.
export function normsFor(register) {
  if (register === undefined || register === null || register === "A") return NORMS;
  const r = NORMS.registers[register];
  if (!r) throw new Error(`unknown register "${register}" (known: A, ${Object.keys(NORMS.registers).join(", ")})`);
  return Object.freeze({
    ...NORMS,
    film: r.film ?? NORMS.film,
    appSegment: r.appSegment ?? NORMS.appSegment,
    rhythm: Object.freeze({ ...NORMS.rhythm, ...r.rhythm }),
    camera: Object.freeze({ ...NORMS.camera, ...r.camera }),
  });
}
