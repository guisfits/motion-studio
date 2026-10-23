# __SLUG__

## The film in one line

<!-- Logline: what the viewer should feel at the end. Every decision is checked against it. -->

## Facts

| | |
|---|---|
| Duration | __DUR__ s |
| Formats | 9x16 (first), then 1x1 / 16x9 from the same timeline if asked |
| Destination | |
| Audience | |
| Message | |
| CTA | |
| Sound | synthesized score + SFX (score.json, cues.json) · or supplied track → beats.py |

## Reference

<!-- Frame, video or image folder in ./refs. What to take (palette, type, pacing, transitions)
     and what never to take (content, logos, characters). -->

## Constraints

- 

## Commands

```bash
# run from the served root (see core/server.mjs)
node __ENGINE_DIR__/core/audio/score.mjs __FILM__/score.json         # music.wav + beats.json
node __ENGINE_DIR__/core/server.mjs __FILM__                         # live preview
node __ENGINE_DIR__/core/render.mjs __FILM__ --stills beats          # one still per beat
node __ENGINE_DIR__/core/render.mjs __FILM__ --draft                 # fast pacing check
node __ENGINE_DIR__/core/render.mjs __FILM__                         # final silent render
node __ENGINE_DIR__/core/audio/sfx.mjs __FILM__/cues.json __FILM__/sfx.wav --dur __DUR__
node __ENGINE_DIR__/core/audio/mix.mjs --video __FILM__/out/silent-9x16.mp4 \
  --music __FILM__/music.wav --sfx __FILM__/sfx.wav \
  --out __FILM__/out/final-9x16.mp4
node __ENGINE_DIR__/core/critique/sheets.mjs __FILM__/out/final-9x16.mp4 --loop
```
