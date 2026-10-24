# The film contract

A film is data plus a pure trace. The data (`film.json`) is the sync sheet; `Film.tsx` draws it
with the technique components; `traceAt(frame)` says what each frame shows, from the same
constants, so the meaning gates in `tools/checks/` can read the film without a browser.
It replaces the archived HTML engine's `index.html` + `draw(t)` + `window.trace`
(`archive/engine-v1/README.md`).

## Folder

```
studio/films/<slug>/
  film.json     the sync sheet and props (below)
  scene.ts      geometry and timing both Film.tsx and trace.ts read (pure data: no images, fonts or React)
  Film.tsx      the Remotion composition, built from src/ components
  trace.ts      traceAt(frame): pure, what the frame shows
  film.test.ts  samples the trace and runs the gates for FILM_STAGE
  crew/         checks-<stage>.md / .json, written by the gate (plus optional script.md, fact-check.json, scenes.json)
  out/          renders and sheets (gitignored)
```

Register the composition in `studio/Root.tsx` as `F-<Id>` (size from the film's `format`).
`studio/films/example/` is the reference film: copy it.

**One set of numbers.** `trace.ts` and `Film.tsx` read the same constants (`scene.ts`, `film.json`)
and the same pure functions the components draw from (`viewAt`, `setDownPose`, `revealWord`,
`captionBox`). Never write a number into one that is also in the other: a trace that drifts from
the picture passes gates for a film nobody sees. After a render, check one frame against its trace
(measure the pixels of a caption against its `box`); the example's caption box matches the
rendered ink to within 6 px.

## film.json

| Field | Meaning |
|---|---|
| `id` | composition id is `F-<id>` |
| `format` | `9x16` (1080×1920, Reels safe box), `1x1`, `16x9` (`src/film/format.ts`) |
| `fps`, `durationInFrames` | the composition's clock; the trace is sampled at every frame |
| `sheet` | `{ beats: [{ id, t: [t0, t1], says, hero: { asset }, key: [{ word, t }], lettering?, zoom?: { kind, target? } }], register?, app?: { t0 } }`, the old `crew/sync-sheet.json` (`tools/checks/sync.mjs`) |
| `words` | word timings `{ words: [{ w, s, e }] }` (what `tools/captions/transcribe.mjs` writes; `{ w, start, end }` also accepted), inline or a path relative to the film |
| `manifest` | `{ assets: [{ id, kind, status, licence, source }] }`, inline or a path; hero/support/piece trace ids are asset ids |
| `house?` | `[t0, t1]` seconds: a closing house outro that puts nothing in the trace; picture and rhythm gates read the story only |
| `length?` | `{ minS, maxS }` replaces the register's length norm (a spot or test film); the report carries a yellow F1 note |
| anything else | film props (the example keeps its caption chunks in `captions`) |

## traceAt

`traceAt(frame) => { items, camera? }`, pure in the frame (`sampleTrace` asks three frames twice and refuses a trace that answers differently). Boxes are `[x, y, w, h]` in frame px **after** the camera and any entrance offset (`projectBox`, `rotatedBox`, `setDownPose`).

| `role` | Means |
|---|---|
| `hero` / `support` / `piece` | a picture; `id` is its manifest asset id. One hero at a time; a hero that is covered becomes a `support` (same id) |
| `caption` | a subtitle chunk, `alpha` (legible from 0.95), `text`, `cap` (cap height in frame px), `color` (`#rgb`, `#rrggbb`, `rgb()`); helpers `captionBox`, `captionItem` |
| `lettering` | display words; `bleed: true` for a word cropped by the edge on purpose |
| `mark` | a drawn mark (underline, circle) |
| `ground` | paper or ground under the pieces; never coverage |
| `target` | a beat's zoom target, id `<beat id>-target` (T9: inside the safe box) |

`camera: { scale, x, y, shot? }`: `cameraTrace(viewAt(keys, frame, …))`. `shot` must change at every hard cut (`shotAt(cutFrames, frame)`): the gates read the change as an edit event, not as a move. Entrances must be in the trace: T12 flags a piece that appears in place at full size.

## Stages and gates

`FILM_STAGE=<script|sheet|animatic|draft|final>`; `checkFilm` (`src/film/check.ts`) selects:

| Stage | Gates |
|---|---|
| `script` | fact-check only: X1–X3 |
| `sheet` | S1–S11 sync sheet, S10 one picture of a person per scene (with `crew/scenes.json`), F1 length |
| `animatic` | sheet + trace: T0–T9, T12, H1, P1, R1–R3 |
| `draft` | sheet + trace with R1, R2, R4; T10 caption cap height; T11 contrast and the mp4 checks when `out/silent.mp4` exists |
| `final` | draft + X1–X4 against the signed sheet + the sound gates below; a missing render or mixed cut is red F2 |

The trace gates T0–T8 and T12 are `src/film/trace-gates.ts` (ported from the old `trace.mjs`); every other gate is `tools/checks/` and is never copied.

**Contrast (T11) needs pixels.** Decision: it reads the rendered `out/silent.mp4` (any `--scale`: boxes are in format px and are cropped by ratio) with `sampleBox`, at `draft` and `final`. With no render at `draft` the gate still runs, reports a yellow T11 and F2 note, and passes; at `final` a missing render is red. A stale render is caught by its length (`checkMp4` against `durationInFrames / fps`), not by its look: render again after every change to `Film.tsx`.

**Sound (`final` only, M0–M6).** The gate reads the sound role's files: `crew/sfx-cues.json` (`{t,type,gain,len}`, `t` = when heard), `out/sfx.wav` with its sidecar `out/sfx.wav.cues.json` (written by `tools/audio/sfx.mjs`), `voice/words.json` (the film's `words`), and the mixed cut `out/final-<format>.mp4` (else `out/final.mp4`; override with `runFilmGate({ mixed })`). Same codes and severities as the old engine:

| Code | Severity | Means |
|---|---|---|
| `F2` | red | the mixed cut is missing |
| `M0` | red | ffmpeg could not read the mixed cut |
| `M1` | red | nothing moves for ≥ `NORMS.frames.deadWindowS` in the mixed cut |
| `M2` | red | integrated loudness outside `NORMS.audio.lufs` ± `lufsTol` (an unreadable value is red too) |
| `M3` | orange | loudness range above `NORMS.audio.maxLra` |
| `M4` | red | more cues in a `sfxWindowS` window than `maxSfxPer4s` |
| `M5` | orange | a cue's span (lead-in `cuePre`, `len`, margin) overlaps a spoken word: a judgment for the reviewer |
| `M6` | red | `out/sfx.wav` without `crew/sfx-cues.json`, without its sidecar, or with a sidecar hashed from another cue file |

A film may have no SFX: no cue file and no stem is no finding. M4/M5 read the cues the stem was rendered from (the sidecar, after thinning) and fall back to the cue file. The pure part is `checkFilm({ stage: "final", sound })` (`SoundInput`); `runFilmGate` reads the files and measures the mix. Without a mixed cut the gate adds a yellow M2 note beside the red F2. `node tools/checks/run-mp4.mjs <mp4> --audio` still checks the file alone.

## Commands

```bash
FILM_STAGE=draft npx vitest run studio/films/<slug>      # the gate; fails on any red, writes crew/checks-draft.md
tools/render.sh F-<Id> studio/films/<slug>/out/silent.mp4 --gl=angle             # final-size render (render lock)
tools/render.sh F-<Id> studio/films/<slug>/out/silent.mp4 --gl=angle --scale=0.5 # draft render
node tools/checks/run-mp4.mjs studio/films/<slug>/out/silent.mp4                 # duration, black, frozen, loudness
node tools/critique/sheets.mjs studio/films/<slug>/out/silent.mp4                # contact + phone sheets in out/
```

Without `FILM_STAGE`, `npx vitest run` runs the `draft` gate and writes nothing.

## Self-check loop

Before returning a film: render → contact sheet → **look at it** (the picture is what the gates do not judge: composition, taste, whether a caption is where the trace says) → fix → re-render → gate → only then return. A green gate on an unseen render is not done.

API: `src/index.ts` exports the browser-safe part (`TraceItem`, `Trace`, `TraceAt`, `sampleTrace`, `projectBox`, `rotatedBox`, `shiftBox`, `cameraTrace`, `shotAt`, `captionBox`, `captionItem`, `layoutOf`, `FORMATS`); the gates (`checkFilm`, `runFilmGate`, `loadFilm`, `writeChecks`, `stageFromEnv`, `checkTrace`) are `motion-studio/film/gate` (`src/film/gate.ts`), Node only, for `film.test.ts`.
