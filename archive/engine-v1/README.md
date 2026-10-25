> Frozen copy of the engine-v1 README (tag `engine-v1`). Paths are those of the old layout; the audio, kit, checks and critique tools now live in `tools/` (see `archive/README.md`).

# motion-studio

A code-rendered video engine. A film is an HTML page whose `draw(t)` paints the whole frame from
the time `t` alone; the renderer walks time with Playwright, captures each frame and encodes it with
ffmpeg. Same input, same frames, every run. No timeline editor, no After Effects, no Remotion.

It ships three layers:

| Layer | What it is | Where |
|-------|------------|-------|
| **core** | The video creation engine: stage and render, springs, layout and safe areas, the infinite table camera, voice-timed captions, sound (SFX library, thinning, synthesized score, mix), cut-out and recording tools, critique sheets | `core/` |
| **vox** | An editorial-collage style (Vox-like explainers): paper pieces placed by hand, hero words, rubric marks, typewriter, halftone, document zooms, routes | `styles/vox/` |
| **motion-graphics** | UI and product motion: masked kinetic type, counters, light rays, dust, engraving reveals | `styles/motion-graphics/` |

Your project keeps its own identity (colours, fonts, copy, sonic logo, assets) and injects it.

**Making a film** is the film crew's job: eight agent skills (`skills/film-director` first, then writer, storyboard, art director, archivist, animator, sound, reviewer), each with measured gates (`node core/checks/run.mjs <film> --stage sheet|animatic|draft|final`). Their rules come from measured evidence in `research/` (the editing grammar of 323 finished collage pieces, their sound) and teachers' lessons in `tutorials/`. A project plugs in its taste with one overlay skill named on a `Film style: <skill>` line in its `AGENTS.md`.

## Install

```bash
npm install                      # playwright 1.55.0
npx playwright install chromium  # once, if Playwright has no browser yet
node core/audio/fetch-sfx.mjs    # optional: the Mixkit sounds (see Sound)
```

Needs Node 20+ and ffmpeg/ffprobe on the PATH. `core/audio/beats.py` and `sync_check.py` need
Python with `requirements.txt` (numpy, librosa, soundfile). `core/reference/cutout.swift` runs on
macOS (Vision).

## Quick start

> The `examples/hello-collage` example and the `core/templates/film` template were deleted on the owner's order (2026-10-25); they live in git history. The commands below name them as they were.

```bash
node core/render.mjs examples/hello-collage --stills 1,4.5,8   # stills + contact sheet in out/
node core/server.mjs examples/hello-collage                    # live preview (space, ←/→, ?t=4.2)
node core/render.mjs examples/hello-collage --draft            # 540-wide 30 fps MP4
node core/animatic.mjs films/my-film                        # crew film: 12 fps draw(t) on the voice (+ house outro) + a one-still-per-beat sheet
node core/new-film.mjs films/my-film --dur 15                  # a new film from the template
```

## The film contract

```js
import { createStage } from "../../core/lib/stage.js";
const stage = await createStage({ dur: 9, formats: ["9x16"], images: { photo: "assets/photo.jpg" } });
stage.run((t) => { /* set EVERYTHING the frame shows from t */ });
```

- `draw(t)` is pure: no CSS transitions or animations, no timers, no state carried between calls,
  no `Math.random` (use `rng(seed)` from `core/lib/motion.js`).
- Build DOM once, outside `draw`; `draw` only sets styles.
- Formats: `9x16` (1080×1920, Reels safe area), `1x1`, `16x9`. Compose inside `stage.box`.
- `window.CUES = [...]` (components' `cues()`) makes the renderer write `out/cues.auto.json`, the
  film's sound cue list.
- Optional trace for the quality gates: `window.trace = (t) => Item[]` with
  `Item = {id, role, text?, box:[x,y,w,h], alpha}` (frame px; `role` is `caption`, `lettering`,
  `hero`, `support`, `mark` or `piece`; `alpha` in 0–1, 1 when absent), and
  `window.camera = (t) => ({scale, x, y})`. The `id` of a `hero`, `support` or `piece` item is its
  asset id in `crew/manifest.json`: the gates check that each beat's hero is on screen at its key
  word and that nothing unlicensed or placeholder is (`core/checks/picture.mjs`).
  `makeTrace()` in `core/lib/trace.js` gives `add(id, role, fn)` and `install()`; `fn(t)` returns
  `{box, alpha, text}` or `null` when off screen. A film that sets `FILM.W`/`FILM.H` has its boxes
  measured against that frame size.
  - `caption` items also carry `cap` (cap height of the text in frame px, as drawn; T10) and
    `color` (the text colour, `#rgb`, `#rrggbb` or `rgb()`; T11 reads it against the median of
    the rendered pixels inside the box).
  - `target`: a beat's zoom target part, id `<beat id>-target`, box = the part in frame px,
    registered from the beat's first key word until the camera leaves for the next beat (T9: it
    must stay inside the format's safe box).
  - `bleed: true` on a `lettering` item: a display word cropped by the frame edge on purpose;
    T4 (text crosses the frame edge) skips it. A `caption` is never exempt. T4 also skips text
    while it slides in or out across the edge (moving, before it first fits or after it last fits).
  - Entrances: a `hero`, `support` or `piece` box must follow the piece's entrance (offset, scale,
    rotation), not its rest pose. T12 (orange) reads each piece's first visible frame: it must touch
    the frame edge, move or scale in over 0.2 s, fade in, come in on a cut (`shot` change) or frame
    0, or be uncovered by a piece that moves off it; otherwise it is a pop-in, or a trace that
    leaves the entrance out. Lettering and marks are typed or drawn in place and are not read.
  - `ground`: a ground or paper under the pieces; never counts as coverage (T5). A manifest
    asset with `kind` or `treatment` `ground` does not count either, whatever its role. T5 does
    not read a scene's first 0.3 s (from frame 0 or a cut) when its first piece arrives entering.
  - `camera(t).shot`: optional; any value that changes at each hard cut (e.g. the number of
    `cut: true` keys at or before t). R1–R4 count a change as an edit event and T7 does not read
    a cut as a move.
  - Edit events (R1–R4, `core/checks/rhythm.mjs`) are read from the trace: the legible hero's
    id, the legible caption's id and `shot`; a register whose `rhythm.events` lists `arrival`
    (instructive) also counts each hero, support or piece legible for the first time.
  - `FILM.house = [t0, t1]` (seconds, t1 = the film's end): a film that closes on the project's
    house outro, which puts nothing in the trace, declares its window. T5–T9, R1–R4 and H1 read
    the story only (it ends at t0, so R4's last 5 s are the story's); T1–T4, T10, T11, P1 and the
    media gates keep reading the whole render. A malformed or non-closing window is red T0
    (`core/checks/house.mjs`).

## Theme

The engine has a neutral look; a film sets its own before `createStage` (fonts load there):

```js
import { setTheme } from "../../core/lib/theme.js";
setTheme({
  colors: { ground: "#f6f1e7", ink: "#1d1a17", accent: "#0b6e4f", accentWash: "#cfeadf" },
  families: { display: '"My Display", serif', body: '"My Text", serif' },
  fonts: [{ family: "My Display", style: "normal", url: "/brand/fonts/MyDisplay.woff2" }],
});
```

Colours: `ground ground2 ink ink2 ink3 rule ruleSoft accent accentInk accentWash night night2
nightInk nightInk2 nightRule nightAccent glow`. Families: `display serif body mono typewriter
script hand`. `fonts` replaces the list (spread `theme().fonts` to keep the bundled Special Elite,
Pinyon Script and Homemade Apple); a face takes `weight` (default 400) for real medium/bold cuts. `textures.paper` is the ground texture (a procedural grain by
default).

## Serving root

Films import the engine by URL, so a static server serves one root directory. `render.mjs`,
`server.mjs`, `new-film.mjs` and `kit.mjs` resolve it as: `--root DIR`, else `$MOTION_ROOT`, else
the git top level of the film, else this checkout. Mount the engine anywhere inside your project
(a git submodule at `vendor/motion-studio/`, say) and your films import
`/vendor/motion-studio/core/lib/stage.js`; `new-film.mjs` writes those paths for you.

## Narration

`core/lib/voice.js` times captions from `voice/words.json`, word timings from any TTS plus a
forced aligner (or written by hand, as in the example):

```json
{
  "lines": [{ "id": "hook", "text": "Every frame...", "start": 0.6, "end": 2.6, "marks": { "time": "underline" } }],
  "words": [{ "w": "Every", "start": 0.6, "end": 0.85, "line": "hook", "key": false }]
}
```

`V.at("word")` gives when a word is said; `say(stage, V, { line, screen: true })` writes the line
word by word on its spoken frames (key words big, marks drawn as they are said).

## Sound

| Tool | Does |
|------|------|
| `core/audio/sfx.mjs cues.json sfx.wav` | Renders a cue list from the recorded library, thinned so it never turns to noise |
| `core/audio/score.mjs score.json` | Synthesizes music and its beat grid (`music.wav`, `beats.json`) |
| `core/audio/music.mjs plan.json` | ElevenLabs Music, cached per request; reads `ELEVENLABS_API_KEY` from the environment only |
| `core/audio/mix.mjs --video ... --out ...` | Balances music, SFX and voice around the speech, -14 LUFS, muxes onto the render |
| `core/audio/beats.py`, `sync_check.py` | Beat grid of a supplied track; checks cuts against it |

The library (`core/audio/sfx-library.json`) maps actions (`paper-place`, `stamp`, `whoosh`, `key`,
...) to recordings. CC0 Freesound files are committed; Mixkit files are not redistributable, so
`node core/audio/fetch-sfx.mjs` downloads and processes them into the gitignored
`core/audio/sfx/fetched/`. An action with no file on disk falls back to a synthesized voice, so a
film always renders. Add a project library (its own sounds, its sonic logo as the `logo`
signature cue) with `--library my/sfx-library.json` or `MOTION_SFX_LIBRARY` (colon-separated);
its files live in `<json dir>/sfx/`.

## Tools

- `core/kit.mjs` builds a collage kit from a `catalog.json` (`--kit DIR`, or `$MOTION_KIT`):
  fetches sources, cuts pieces with `core/reference/cutout.swift`, draws contact sheets.
- `core/reference/clip.mjs` turns a screen recording into a frame sequence `core/lib/clip.js` plays
  frame-exactly.
- `core/reference/inspiration.mjs` downloads a reference clip into frames and a sheet to study
  (`--out inspirations/<register>`, `vox-collage` or `motion-graphics`; keep the media local).
- `core/critique/sheets.mjs video.mp4` draws contact, phone-size, strip and loop sheets, with the
  Reels safe-zone guides; `--flat` reports stretches of bare ground.

## Repository

```
core/        engine: lib/, audio/, critique/, reference/, fonts/, templates/, render/server/new-film/kit
styles/      style layers: vox/, motion-graphics/ (each lib/)
skills/      agent skills: motion-engine, and the film crew (start at skills/film-director)
archive/     retired skills, reference only (archive/README.md)
examples/    (hello-collage deleted, in git history)
research/    the evidence the crew cites: editing-grammar, sound-grammar, craft, crew-roles, postmortem (research/README.md)
tutorials/   teachers' lessons (Chris Moran 52 reels → lessons.jsonl; Denys Zhylin); caches local
inspirations/ finished pieces by register: vox-collage/ (incl. collage-study, 323 measured), motion-graphics/; caches local
tests/       node --test suites and fixture films
```

## Tests

```bash
npm test          # node --test tests
```

The suites render fixture films in headless Chromium, so a full run takes a few minutes. Fixture
pictures are generated by `tests/_assets.mjs`; the beat test runs when `.venv/bin/python` (or
`$MOTION_PYTHON`) has librosa.

## Licence

MIT for the code (`LICENSE`). Fonts and sounds keep their own licences: see `CREDITS.md`.
