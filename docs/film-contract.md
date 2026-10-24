# The film contract

A film is data plus a pure trace. The data is the sync sheet (`crew/sync-sheet.json`, which `film.json` points to); `Film.tsx` draws it
with the technique components; `traceAt(frame)` says what each frame shows, from the same
constants, so the meaning gates in `tools/checks/` can read the film without a browser.
It replaces the archived HTML engine's `index.html` + `draw(t)` + `window.trace`
(`archive/engine-v1/README.md`).

## Folder

```
studio/films/<slug>/
  film.json     the clock, the paths of the paper below, and props (below)
  crew/sync-sheet.json  the sync sheet: the one copy, edited by the storyboard
  crew/manifest.json    the picture list: the one copy, edited by the art director and the archivist
  voice/words.json      word timings of the voice
  scene.ts      geometry and timing both Film.tsx and trace.ts read (pure data: no images, fonts or React)
  Film.tsx      the Remotion composition, built from src/ components
  trace.ts      traceAt(frame): pure, what the frame shows
  film.test.ts  samples the trace and runs the gates for FILM_STAGE (optional: the generic runner does the same)
  crew/         checks-<stage>.md / .json, written by the gate (plus optional script.md, fact-check.json, scenes.json, animation-notes.md)
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
| `sheet` | path `crew/sync-sheet.json` (default). `{ beats: [{ id, t: [t0, t1], says, hero: { asset }, key: [{ word, t }], lettering?, zoom?: { kind, target? } }], register?, app?: { t0 } }`, `tools/checks/sync.mjs` |
| `words` | word timings `{ words: [{ w, s, e }] }` (what `tools/captions/transcribe.mjs` writes; `{ w, start, end }` also accepted); path `voice/words.json` (default) |
| `manifest` | path `crew/manifest.json` (default). `{ assets: [{ id, kind, status, licence, source }] }`; hero/support/piece trace ids are asset ids |
| `house?` | `[t0, t1]` seconds: a closing house outro that puts nothing in the trace; picture and rhythm gates read the story only |
| `length?` | `{ minS, maxS }` replaces the register's length norm (a spot or test film). The report carries an **orange** F1 until `crew/animation-notes.md` has a line starting `length:` with the reason, then a yellow one; the director signs the reason (Q7, 2026-10-24) |
| anything else | film props (the example keeps its caption chunks in `captions`) |

**One source of truth for the paper.** `sheet`, `words` and `manifest` are paths: the crew edits
`crew/sync-sheet.json`, `crew/manifest.json` and `voice/words.json` and the gate, `Film.tsx`, `scene.ts` and
`trace.ts` read those files (a film imports them as JSON: `import sheet from "./crew/sync-sheet.json"`). Left out
of `film.json` each defaults to its crew file. An inline copy in `film.json` is still read, but while the crew
file also exists the gate is red F0 (two copies, the gate would read the stale one). Before `film.json` exists
(script and sheet stages) the gate assembles the film from the crew files alone; a missing file the stage reads is
red F0.

## traceAt

`traceAt(frame) => { items, camera? }`, pure in the frame (`sampleTrace` asks three frames twice and refuses a trace that answers differently). Boxes are `[x, y, w, h]` in frame px **after** the camera and any entrance offset (`projectBox`, `rotatedBox`, `setDownPose`).

| `role` | Means |
|---|---|
| `hero` / `support` / `piece` | a picture; `id` is its manifest asset id. One hero at a time; a hero that is covered becomes a `support` (same id) |
| `caption` | a subtitle chunk, `alpha` (legible from 0.95), `text`, `cap` (cap height in frame px), `color` (`#rgb`, `#rrggbb`, `rgb()`); helpers `captionBox` (one line; pass `maxWidth`, the box `RevealWords` is drawn in, and a chunk that would wrap throws), `captionItem` |
| `lettering` | display words; `bleed: true` for a word cropped by the edge on purpose |
| `mark` | a drawn mark (underline, circle) |
| `ground` | paper or ground under the pieces; never coverage |
| `target` | a beat's zoom target, id `<beat id>-target` (T9: inside the safe box) |

`camera: { scale, x, y, shot? }`: `cameraTrace(viewAt(keys, frame, …))`. `shot` must change at every hard cut (`shotAt(cutFrames, frame)`): the gates read the change as an edit event, not as a move. Entrances must be in the trace: T12 flags a piece that appears in place at full size.

## Stages and gates

`FILM_STAGE=<script|sheet|animatic|draft|final>` (the gate command below sets it); `checkFilm` (`src/film/check.ts`) selects:

| Stage | Gates |
|---|---|
| `script` | fact-check only: X1–X3 |
| `sheet` | S1–S11 sync sheet, S10 one picture of a person per scene (with `crew/scenes.json`), F1 length |
| `animatic` | sheet + trace: T0–T9, T12, H1, P1, R1–R3 |
| `draft` | sheet + trace with R1, R2, R4; T10 caption cap height; T11 contrast and the mp4 checks (V0–V3) on the draft render `out/draft-<format>.mp4`; missing render: red F2 under `FILM_STAGE=draft`, yellow otherwise |
| `final` | draft on the silent master `out/silent-<format>.mp4` + X1–X4 against the signed sheet + the sound gates below; a missing render or mixed cut is red F2 |

The trace gates T0–T8 and T12 are `src/film/trace-gates.ts` (ported from the old `trace.mjs`); every other gate is `tools/checks/` and is never copied.

**Contrast (T11) needs pixels.** Decision: it reads the stage's render with `sampleBox` (any `--scale`: boxes are in format px and are cropped by ratio): at `draft` the draft render `out/draft-<format>.mp4` (else `out/draft.mp4`), at `final` the silent master `out/silent-<format>.mp4` (else `out/silent.mp4`), rendered after picture lock. The draft gate never reads the silent master: one from an earlier cut would be judged in place of the draft. A missing render is red F2 at `final` and under the gate command at `draft` (`FILM_STAGE=draft`, Q6, 2026-10-24); in a plain `npx vitest run` (no `FILM_STAGE`) the draft gate still runs without it, reports a yellow F2 and T11 note, and passes, so the tests do not need a render. The same render gets the mp4 checks V0–V3 (`checkMp4`: duration, black, frozen ≥ `MP4.frozenS`). A stale render is caught by its length (`checkMp4` against `durationInFrames / fps`), not by its look: render again after every change to `Film.tsx`.

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
# The generic gate: any stage, any folder (absolute, or relative to the studio checkout), no film.test.ts needed.
FILM_DIR=<film dir> FILM_STAGE=<stage> npx vitest run src/film/__tests__/stage-gate.test.ts
# Per film, for a film that lives in studio/films/ and has a film.test.ts: the same gate.
FILM_STAGE=draft npx vitest run studio/films/<slug>      # fails on any red, writes crew/checks-draft.md
tools/render.sh F-<Id> studio/films/<slug>/out/draft-9x16.mp4 --gl=angle --scale=0.5 # draft render (render lock)
tools/render.sh F-<Id> studio/films/<slug>/out/silent-9x16.mp4 --gl=angle            # silent master, final size, after picture lock
node tools/checks/run-mp4.mjs studio/films/<slug>/out/draft-9x16.mp4                 # duration, black, frozen, loudness
node tools/critique/sheets.mjs studio/films/<slug>/out/draft-9x16.mp4                # contact + phone sheets in out/
```

Without `FILM_STAGE`, `npx vitest run` runs the `draft` gate and writes nothing (the generic runner refuses to run without it).

**The generic runner** (`src/film/__tests__/stage-gate.test.ts`, `runStageGate` in `src/film/node.ts`) is skipped
unless `FILM_DIR` is set. It works for a folder anywhere on disk, e.g. a host project's `media/video-short/films/<slug>/`,
at the first stage: `script` needs `crew/script.md` + `crew/fact-check.json`; `sheet` needs `crew/sync-sheet.json`,
`crew/manifest.json`, `voice/words.json` (a film without `film.json` is gated on the register's length); `animatic`
and later need `film.json` (id, format, fps, durationInFrames) and `<FILM_DIR>/trace.ts` exporting `traceAt`, which the
runner imports; without it the stage is red T0. It writes `crew/checks-<stage>.md` and `.json`. A per-film
`film.test.ts` stays valid: it calls `runFilmGate({ dir, traceAt })`, the function the runner calls.

## Self-check loop

Before returning a film: render → contact sheet → **look at it** (the picture is what the gates do not judge: composition, taste, whether a caption is where the trace says) → fix → re-render → gate → only then return. A green gate on an unseen render is not done.

API: `src/index.ts` exports the browser-safe part (`TraceItem`, `Trace`, `TraceAt`, `sampleTrace`, `projectBox`, `rotatedBox`, `shiftBox`, `cameraTrace`, `shotAt`, `captionBox`, `captionItem`, `layoutOf`, `FORMATS`); the gates (`checkFilm`, `runFilmGate`, `runStageGate`, `readFilm`, `loadFilm`, `writeChecks`, `stageFromEnv`, `checkTrace`) are `motion-studio/film/gate` (`src/film/gate.ts`), Node only, for `film.test.ts` and the runner.
