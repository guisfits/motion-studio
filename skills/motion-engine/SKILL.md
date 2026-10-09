---
name: motion-engine
description: Use when making, changing, re-timing, re-sounding or re-rendering any video with the motion-studio engine (Reels, Shorts, TikTok, explainers, product films, title cards, stings), when a film folder holds an index.html that paints draw(t), or when asked how to render, preview, caption, mix or review a code-rendered film.
---

# Motion engine

A film is a **pure function of time**: `index.html` paints any frame from `t`, and the engine
seeks, screenshots and encodes it (Playwright + ffmpeg). Nothing depends on a clock, so the same
command gives the same frames. The prompt is 10 % of the result; the harness and the review loop
are the other 90 %.

This skill is level 1 (the apparatus). The look comes from a style skill (level 2) and the
identity from a project overlay (level 3):

| Level | Skill | Decides |
|---|---|---|
| 1 Engine | `motion-engine` (this) | how to render, time, sound and review anything |
| 2 Style | `vox-style-animation`, `explainer-script`, `vox-critic`, `motion-graphics` | grammar: pacing, type, camera, mix norms |
| 3 Project | the project's overlay skill | identity, audience, voice, outro, bridge lines; overrides where it says so |

**REQUIRED:** load one style skill before designing a single frame.

## The pipeline

Never reorder it: each step is the input of the next.

| # | Step | Writes | Reference |
|---|---|---|---|
| 1 | Script: one question, hook, turn, payoff, CTA; voice draft timed per word | `script.md`, `narration.json`, `voice/words.json` | **REQUIRED SUB-SKILL:** `explainer-script` |
| 2 | Beat grid: score or track measured into beats | `beats.json`, `music.wav` | `references/audio.md` |
| 3 | Shot list on the voice and the grid: words, evidence, largest element, camera, cause, SFX | `shotlist.md` | `references/pipeline.md` |
| 4 | Build: stations, pieces, captions with `say`, cues | `index.html` | `references/engine-api.md`, `references/kit-and-cutouts.md` |
| 5 | Critique loop: stills → draft → sheets → score → fix only those seconds | `review_log.md` | `references/render-and-review.md`, the style's critic |
| 6 | Final: render → SFX → mix → sync check → sheets on the final MP4 | `out/final-9x16.mp4` | `references/audio.md` |

## Quick reference

`<E>` is where the engine is checked out; `<F>` is the film folder.

```bash
node <E>/core/new-film.mjs <F> --dur 50                  # film from the template
node <E>/core/server.mjs <F>                             # live preview URL
node <E>/core/render.mjs <F> --stills beats              # one still per beat + labelled sheet
node <E>/core/render.mjs <F> --draft [--from 4 --to 7]   # 540 wide, 30 fps, fast
node <E>/core/render.mjs <F> [--format 9x16|1x1|16x9|all] [--sub 8]   # final, 60 fps
node <E>/core/critique/sheets.mjs <F>/out/draft-9x16.mp4 --strip 4.2,7.8 [--flat]
node <E>/core/audio/sfx.mjs <F>/out/cues.auto.json <F>/sfx.wav --dur 50
node <E>/core/audio/mix.mjs --video <F>/out/silent-9x16.mp4 --voice <F>/voice/voice.wav \
  --music <F>/music.wav --sfx <F>/sfx.wav --out <F>/out/final-9x16.mp4 --report
```

## Non-negotiables (engine level)

- Every visible motion is a closed-form spring (`spring`, `track`); no CSS transitions, no
  `Math.random` (`rng(seed)`), no state carried between frames. Build DOM once, `draw` only sets styles.
- Time from the voice (`V.at(word)`) or the grid (`B(i)`), never hard-coded seconds the voice decides.
- Components emit their own sound cues at the frame a thing is **seen to land**; the thinner and
  the mix decide what is heard. The voice leads; -14 LUFS integrated, true peak -1 dBTP.
- Nothing readable in the 9:16 platform UI zones: top 220 px, bottom 400 px, right rail 140 px
  from y 1100 (1080×1920). `stage.box` is the safe rectangle; the phone sheet shades the zones.
- Judge sheets, not code. No final render inside the critique loop; re-render only the seconds a
  fix touched.

## Common mistakes

| Mistake | Fix |
|---|---|
| A camera key timed on the word it must land on | a key is when the spring **starts**: `move` lands ~0.7 s later, `whip` ~0.35 s |
| Whips ghost as double images | the table blurs camera travel; render whip films with `--sub 8` |
| Captions cropped by a roll or zoom | `say(..., { screen: true })` pins them above the camera |
| Cue offsets guessed by hand (`+0.24`) | derive with `landsAt` / `springReach`; they follow the spring |
| Two renders differ | state leaked between frames: a counter, `Math.random`, a CSS transition, an undecoded image |
