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
| 2 Crew | `film-director` (entry) and its specialists `film-writer`, `film-fact-checker`, `film-storyboard`, `film-art-director`, `film-archivist`, `film-animator`, `film-sound`, `film-reviewer` | the film's craft, hand-offs and gates (`core/checks/`) |
| 3 Project | the project's overlay skill | identity, audience, voice, outro, bridge lines; overrides where it says so |

**REQUIRED:** a film starts at `film-director`; it briefs each specialist. The old style skills are archived in `archive/skills/` (reference only).

## The pipeline

Never reorder it: each step is the input of the next.

| # | Step | Writes | Reference |
|---|---|---|---|
| 1 | Script: one question, hook, turn, payoff, CTA; voice draft timed per word | `crew/script.md`, `narration.json`, `voice/words.json` | **REQUIRED SUB-SKILL:** `film-writer` |
| 2 | Beat grid: score or track measured into beats | `beats.json`, `assets/music/music.wav` | `references/audio.md` |
| 3 | Sync sheet (the shot list) on the voice and the grid: words, evidence, largest element, camera, cause, SFX | `crew/sync-sheet.json` | `references/pipeline.md` |
| 4 | Build: stations, pieces, captions with `say`, cues | `index.html` | `references/engine-api.md`, `references/kit-and-cutouts.md` |
| 5 | Review with the client, part by part (below); the style's critic on demand | `crew/review.md` | `references/render-and-review.md`, the style's critic |
| 6 | Final: render → SFX → mix → sync check → sheets on the final MP4 | `out/silent-9x16.mp4`, `out/final-9x16.mp4` | `references/audio.md` |

## Iterating with a human client

Build and show the film **one part at a time** (a beat or a scene): a fast `--draft` (540p,
30 fps, free draft voice, rough mix) within minutes, the client's feedback, the next part in
parallel. Tests, docs, critique rounds and `--sub 8` never stand between the client and the
first look. The final (quality render, paid voice, final mix) runs only after the client says
it is good. Run the style's critic (a) when the client dislikes a part and cannot say why, to
name the problem and the fix, and (b) as the final reviewer after the client's OK, to fine-tune
timing, spacing, sync and mix without changing anything approved. A frame the client drew in a
design tool is reproduced exactly (`references/pipeline.md` → Designed frames).

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
- Nothing readable in the 9:16 platform UI zones: top 220 px, bottom 400 px, the sides 70 px each
  (the phone crops ~51), right rail x ≥ 915 from y 1000 (1080×1920). `stage.box` is the safe rectangle; the phone sheet shades the zones.
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
