# Registration: the film contract and the trace

What the film draws is reported once, from the same constants and pure functions that draw it, so the gates measure meaning (captions, lettering, hero, zoom target) without reading pixels. Source ids: `[eng]` = engine code read for this file (`docs/film-contract.md`, `src/film/`, `tools/checks/norms.mjs`, `studio/films/example/`); `[tested]` = observed by running the gates or the engine's own functions; `~` = inference. Numbers are `NORMS` keys, never restated.

## 0. Read the contract before the first line

The contract is `docs/film-contract.md` (the film folder, `film.json`, `traceAt`, the item kinds, stages and gates) and the types in `src/film/types.ts`. The gates that read the trace are `src/film/trace-gates.ts` (T0-T8, T12) and `tools/checks/` (`picture.mjs`, `rhythm.mjs`, `legibility.mjs`, `sync.mjs`). A caption without `cap` or `color` is a red T10 or T11 at the draft. A role the checker does not know is a T0 and stops every other gate: read the `TraceRole` type again before the first line of a film. If this file and the engine disagree, the engine wins and the Director hears about it.

## 1. The film

A film is a folder `studio/films/<slug>/` (copy `studio/films/example/`, register `F-<Id>` in `studio/Root.tsx`):

| File | Holds |
|---|---|
| `film.json` | format, fps, duration, the paths of the sheet (`crew/sync-sheet.json`), manifest (`crew/manifest.json`) and word times (`voice/words.json`), film props. Import the three files as JSON; never copy a time into code or a second copy of them into `film.json` |
| `scene.ts` | geometry and timing both `Film.tsx` and `trace.ts` read: world boxes of the pieces, `CAMERA_KEYS`, caption chunks and metrics, frame landings; pure data, no images, fonts or React |
| `Film.tsx` | the composition, built from `src/` components |
| `trace.ts` | `traceAt(frame)`: pure, what the frame shows |
| `film.test.ts` | `runFilmGate({ dir, traceAt })` for `FILM_STAGE` (the generic runner `src/film/__tests__/stage-gate.test.ts` does the same by `FILM_DIR`) |

1. `Film.tsx` is pure per frame: every pose comes from `useCurrentFrame()` (or a prop derived from it). No timers, no CSS transitions or animations, no state kept between frames, no `Math.random` or `Date`; random numbers only from `random(seed)` of `remotion`. A component that must wait for a font or texture uses `delayRender` (the example loads its face this way; `skills/remotion/` covers it) `[eng]`.
2. Time comes from `voice/words.json`: `fromWords(words)` (`import words from "./voice/words.json"`) gives the spoken words as captions with `startMs`/`endMs`; a landing frame is `Math.round(s * film.fps)`. Assert at import that every derived frame is finite: `undefined + 12` is `NaN`, a `NaN` pose silently becomes "off screen" and the hero vanishes `[tested]`.
3. One set of numbers. Anything both files need is exported from `scene.ts`. A number typed in `trace.ts` and also in `Film.tsx` is a defect: the trace drifts from the picture and the gates pass a film nobody sees `[eng]`.
4. Cues: the sound role gets the landings from a pure `cues.ts` (`Cue = { at, sfx, gain? }` per sequence, flattened by `collectCues(blocks, fps)`, exported with `node tools/audio/cues-json.mjs <file.cues.ts> <EXPORT> out/cues.json`). Compute `at` from the same landing frames the picture uses, so the SFX and the picture share one timing source.
5. The camera is `<Camera keys={CAMERA_KEYS} drift={CAMERA_DRIFT}>` in `Film.tsx` and `viewAt(CAMERA_KEYS, frame, { durationInFrames, drift, fps })` in `trace.ts`: the same keys, the pose the component actually draws (drift folded in). `camera: cameraTrace(view, shotAt(CUT_FRAMES, frame))`; scale must be finite and > 0 or T0 stops the run. `shot` is how R1 to R3 see a hard cut as an event and how T7 avoids reading a cut's scale jump as a move; a hard cut without it is both a missed event and a false punch `[eng]`.
6. One clock. When the register asks for stepped motion (SKILL step 1) the pieces and the trace read `stepFrame(frame, fps, 12)` (a function of the frame, so it stays pure; the `Camera` stays smooth, `devices-rhythm-camera.md` 2): the gate sees the poses the viewer sees `[tested]`.

## 2. What to put in the trace

`traceAt(frame) => { items, camera }`. An item is `{ id, role, box: [x, y, w, h], alpha?, text?, cap?, color?, bleed? }`; skip an item (do not push it) when it is not drawn. Boxes are frame pixels (`W` x `H` from `layoutOf(format)`): the axis-aligned bounds of what is on the canvas after camera, rotation and entrance offset `[eng]`.

| What | Role | Id | Box and fields | Read by |
|---|---|---|---|---|
| Caption chunk | `caption` | `cap-<n>`, unique per chunk, never reused for other text | `captionBox(words, size, { centerX, top, lineHeight, maxWidth })` = the text run (`maxWidth` = the width `RevealWords` is drawn in; a chunk that would wrap throws) (T11 samples the rendered pixels in it: the median luminance is the background, so the glyphs must be a minority of the box); `captionItem(id, text, box, { size, color, alpha })` fills `text` (the displayed words), `cap` (cap height in frame px as drawn) and `color` (`#rgb`, `#rrggbb` or `rgb()`). A face other than JetBrains Mono needs its own `metrics` | T1-T4, T10 (`cap`), T11 (`color`), R1 and R3 (chunk change = event) |
| Lettering | `lettering` | `<beat>-<word>` | the word's full final extents, from `scene.ts`; `text`; `bleed: true` only for a display word cropped by the frame on purpose | T4 (skipped when `bleed`) |
| Mark | `mark` | `<beat>-<word>-mark` | stroke bounds | role check; S6 reads the sheet |
| Hero | `hero` | the manifest asset id | bounds; alpha 1 while it moves in | T5, T6, H1, P1, R1 (hero change = event) |
| Support, other piece | `support`, `piece` | manifest asset id | bounds. A hero that a later sheet covers stays in the trace as a `support` with the same id (the example flips role at the next beat's start) | T5, P1 |
| Ground (paper, desk, disc, flat field, plate behind) | `ground` | `ground-<n>`, not a manifest id | full bounds | counted by nothing: excluded from T5 |
| Zoom target, one per row that names one | `target` | `<row id>-target`, e.g. `b07-target` | the named part's extents in frame px, projected by the same function as the picture (`projectBox` of the part's world box through `view`) | T9: from the row's first key word until the camera leaves for the next row it is in the trace and inside the safe box (`layoutOf(format).safe`) |
| Camera | `camera` | | `cameraTrace(view, shot)` = `{ scale, x, y, shot }` | T0, T7 (moves split at a change of `shot`), T8, R1 (`shot` change = event) |

Events for R1 to R3 are exactly three things: the first `hero` item on screen at alpha >= `NORMS.frames.heroAlpha` changes id; the `caption` item at alpha >= `NORMS.caption.legibleAlpha` changes id (a caption leaving is not an event, the next one arriving is); `camera.shot` changes. Frame 0 sets the first values and is not an event; events within `NORMS.rhythm.eventMergeS` of the last one are the same edit. Camera moves, supports entering, marks and flashes are not events. A row that repeats the previous hero id (a held plate, one prop per phrase, a crowd step) makes no hero event: its event is the caption chunk that starts in it, or a cut.

A film that closes on the project's house outro (an imported, pre-approved closing piece that puts nothing in the trace) declares its window in `film.json` as `house: [t0, t1]` (seconds; t1 is the film's end). T5-T9, R1-R4 and H1 then read the story only (it ends at t0, and R4's last 5 s are the story's); captions, legibility (T1-T4, T10, T11), P1 and the media gates still read the whole render. A malformed or non-closing window is a red T0 (`tools/checks/house.mjs`).

## 3. Rules that keep the component and the trace the same

1. The component and the trace share one function. A piece's pose is `setDownPose(frame - start, fps, W, H, carry)` in both: `SetDown` draws it, `trace.ts` projects it. A caption's alpha is `revealWord(frame, startMs, fps, enter)` in both. A parallel table of numbers drifts the first time a beat is retimed.
2. Skip the item when it is not on screen: before its start, after its exit, or fully outside the frame. T6 takes the first `hero` in the list, so a hero kept in the trace while the camera is elsewhere is reported "off the middle third" `[tested]`. Exactly one hero is on screen at a time.
3. A hero stays at alpha >= `NORMS.frames.heroAlpha` from its entrance on: it enters by position, rotation and scale, never by opacity. A fade-in counts as "no hero" for its whole length (T6) and can miss H1. A dissolve between heroes does the same: finish it before the key word's window (`NORMS.sync.heroWindowFrames`).
4. A caption's legible time counts only frames at alpha >= `NORMS.caption.legibleAlpha`, so fades come on top of the hold. T1 divides characters by that time. Give the chunk the alpha of its least opaque word (the example's `Math.min` over the words).
5. A ground is never traced as `piece` to lift coverage: T5 counts traced area, so that passes the gate and leaves the frame empty. Trace it as `ground` (T5 also skips a manifest asset whose `kind` or `treatment` is `ground`, but do not rely on it).
6. A deliberate bleed word (a display word cropped by the frame behind the subject, grammar §6 type interleaved) traces the part of its box that is inside the frame with `bleed: true`, which T4 skips. Never for a caption or small lettering.
7. One malformed item (wrong role, a box that is not four finite numbers, alpha outside 0-1) makes the gate return only T0.
8. `sampleTrace` asks three frames twice and refuses a trace that answers differently: no clock, no random, no state carried from an earlier call `[eng]`.
9. A trace box is checked against the ink once per film, after a render: measure one caption's pixels against its `box`, and lay one piece's box over its still (the self-check loop, SKILL step 4). A caption `fontSize` missing in the component, a padding that exists only in the CSS, a rotation the trace skipped: all pass every gate and all show here `[tested]`.

## 4. Projecting a piece to frame pixels

`Camera` draws `translate(W/2, H/2) rotate(r) scale(z) translate(-x, -y)` over world coordinates (px on the table; the frame shows the world at zoom 1 centred on the camera's `x`, `y`). The trace applies the same transform with the helpers, in this order:

```ts
const view = viewAt(CAMERA_KEYS, frame, { durationInFrames: DURATION, drift: CAMERA_DRIFT, fps: FPS });
const pose = setDownPose(frame - p.start, FPS, W, H, p.carry);          // entrance offset and tilt
const world = rotatedBox(shiftBox(p.rest, pose.dx, pose.dy), pose.rotate);
const box = projectBox(world, view, W, H);                              // frame px, after the camera
```

Name each zoom target part in `scene.ts` as a world box inside its piece (`PARTS["portrait-a.eyes"] = [x, y, w, h]`), and build both the `<row id>-target` item and the number you read by eye on a still from that one entry through the same `projectBox`. A piece's corners are its centre plus half-extents rotated by its current rotation, plus its entrance offset, all from the same pose. Screen-space layers (captions above the camera) are already in frame pixels: `captionBox` takes `centerX` and `top` in frame px.

## 5. Reading the gates

The trace is sampled at every frame over the whole film, so `traceAt` must be cheap and pure. Most codes report only their first occurrence (T5 once per film, T6 once per second or hero, T4 per id): after a fix, re-run until clean, one red can hide several `[tested]`. Report files: `crew/checks-<stage>.md` (+ `.json`).

| Code | Usual cause | Fix |
|---|---|---|
| T0 | NaN or non-finite box, role the checker does not know, camera scale 0 | assert finite in `scene.ts`; re-read `TraceRole` |
| T1, T2 | chunk too long for its hold, or hold counted from the start of the fade | lengthen the hold or split the chunk (`devices-type-data-life.md` 1) |
| T3 | more than `NORMS.caption.maxWords` words | re-chunk |
| T4 | lettering or caption crosses a frame edge while traced | retire it before the camera leaves; move it inside the safe box |
| T5 | too few traced pieces on screen: frame 0 before the hero enters, a cut frame with pieces still flying in, a long lateral move before a cut, the closing pull-out | seat pieces earlier, move less, add earlier beats' pieces to the closing collage |
| T6 | no hero on screen for a second, or its centre outside `NORMS.frames.heroThird` | hero seated from the beat start, a stale trace item, lateral move |
| T7 | a row whose `zoom.kind` is `push-in` or `pull-out` moves under `NORMS.camera.emphasisMinScaleDelta` inside one shot; or more than `NORMS.camera.maxPunches` rows reach `NORMS.camera.punchMax` | enlarge the move, or send the row back to be `drift`; budget the punches (a deep pull-out counts) |
| T8 | a linear stretch of scale in a move; steps under `NORMS.camera.holdRate` per second (the breathing) are a hold | ease the move (`EASES`); a drift above the hold rate is a move |
| T9 | the row's `<row id>-target` is not in the trace at its first key word, or leaves the safe box before the row ends | reframe or land the move earlier (`worked-examples.md` 2) |
| T10, T11 | caption `cap` outside `NORMS.caption.capHeight` (or missing); `color` against the pixels behind `box` under `NORMS.caption.minContrast` (or missing); T11 needs the stage's render (`out/draft-<format>.mp4` at draft, `out/silent-<format>.mp4` at final) | size, plate and colour are the style bible's; move the caption to a quiet area (grammar §7) |
| T12 | a piece appears in place at full size: the trace shows its rest box on the entrance frames | trace the live pose (`setDownPose`) during entrance and exit |
| R1, R2, R3, R4 | event count or spacing outside `NORMS.rhythm`; R1 also reports a still hold (no event, camera still) of `NORMS.rhythm.maxStillHoldS` | `templates.md` 1 |
| H1 | the hero is not on screen at alpha >= `NORMS.frames.heroAlpha` inside the window of its first key word | seat it earlier |
| P1 | a hero, support or piece id that is not a `ready`, licensed manifest asset | never invent ids; ask the Director |
