# Pipeline: script → beat grid → shot list → build → critique loop → final mix

Without a script, a reference and a shot list, a model falls back to its default film: centred
text on a gradient, everything fading in, a logo at the end. Each step below exists to prevent it.

## Film folder (what `new-film.mjs` writes and the steps fill)

```
<film>/
  index.html        the film: draw(t)
  brief.md          logline, format, length, CTA, inspirations
  style_guide.md    every visual choice with its source (theme token, named inspiration)
  script.md         the script, beats table, sources, the one sentence to remember
  narration.json    lines for the voice engine (shape below)
  voice/            voice.wav + words.json (per-word times), written by the project's TTS step
  score.json        a code score (or music.plan.json / a supplied track)
  beats.json        the grid: { bpm, beats[], downbeats[], hits[] }
  shotlist.md       one row per shot
  cues.json         hand-written SFX cues (components emit the rest)
  review_log.md     critique rounds
  assets/           cut pieces, clip frames
  out/              renders, sheets, cues.auto.json (gitignored)
```

## 1. Script

Owned by the `explainer-script` skill (or the project overlay's script skill). Output that the
engine consumes:

```json
{
  "voice": "narrator-key",
  "start": 0.05,
  "gap": 0.3,
  "lines": [
    { "id": "hook", "text": "In 1930, almost nobody came.", "keys": ["1930"], "marks": { "nobody": "underline" } },
    { "id": "turn", "text": "But that was the point.", "pause": 0.6 }
  ]
}
```

The engine does not ship a TTS. A project step speaks `narration.json` and writes
`voice/voice.wav` plus `voice/words.json`:

```json
{ "dur": 48.2,
  "lines": [{ "id": "hook", "text": "...", "start": 0.05, "end": 2.3, "marks": { "nobody": "underline" } }],
  "words": [{ "w": "1930,", "start": 0.4, "end": 1.0, "line": "hook", "key": true }] }
```

Use a free draft voice for every iteration; a paid final voice only after the picture is approved.
Because both are timed by forced alignment into the same `words.json`, the film re-syncs itself.

## 2. Beat grid

| Situation | Do |
|---|---|
| No track | write `score.json`, run `audio/score.mjs` → `music.wav` + `beats.json` |
| Generated track | `audio/music.mjs` (plan or prompt, cached by request), then `beats.py` |
| Supplied track | `python <E>/core/audio/beats.py track.wav > beats.json`; keep the track as the music stem |
| Voice only, no music | still make a grid from the voice: beats = line starts in `words.json` |

Shots start on beats, big moments on downbeats; the voice still wins any conflict (a cut lands
on the word, not on the bar).

## 3. Shot list

Write it before building. Time every row on a word (`V.at`) or a beat (`B(i)`).

| t | words spoken | evidence / object on screen | largest element (% width) | camera (station · ease · roll) | entrance cause | text (caption chunk, hero word) | mark | SFX | move |
|---|---|---|---|---|---|---|---|---|---|

Checks before building: every row has a literal object for its noun; one accent mark at most;
one element ≥ 70 % of width or ≥ 35 % of area (scale contrast); the hook frame is a subject, not
a title card; nothing essential in the UI zones.

**Inspirations** lend grammar only (pacing, transitions, camera, structure), never palette,
type, content or logos. Pick 1–3, open them (not just the catalog row), and name in
`style_guide.md` which grammar comes from which. Studied references live in `inspirations/`;
`core/reference/inspiration.mjs <id> <url> --out <dir>` downloads one clip and builds a labelled
frame sheet (media stays local, never committed).

## 4. Build

`references/engine-api.md` for the API, `references/kit-and-cutouts.md` for material. Build in
this order: theme → stations and surfaces → pieces (with causes) → captions (`say`) → camera keys
→ cues. Stills first (`--stills beats`) to fix composition before any motion.

## 5. Critique loop

A round: make sheets → open every sheet → score → log the 3 worst problems with timestamps → fix →
re-render only those seconds (`--draft --from a --to b`) → next round. The style's critic owns
the rubric (`vox-critic` for editorial explainers). Round 1 may be stills; every later round
includes the draft video, contact sheet, phone sheet, a strip at each shot change and the
`--flat` report. Ship only after the critic's gate passes, then a fresh-eyes reviewer that never
saw the code agrees.

## 6. Final

```bash
node <E>/core/render.mjs <F> --sub 8                       # silent-9x16.mp4 + cues.auto.json
node <E>/core/audio/sfx.mjs <F>/out/cues.auto.json <F>/sfx.wav --dur <dur>
node <E>/core/audio/mix.mjs --video <F>/out/silent-9x16.mp4 --voice <F>/voice/voice.wav \
  --music <F>/music.wav --sfx <F>/sfx.wav --out <F>/out/final-9x16.mp4 --report
python <E>/core/audio/sync_check.py <F>/out/final-9x16.mp4 <cuts.json> --music <F>/music.wav
node <E>/core/critique/sheets.mjs <F>/out/final-9x16.mp4
```

Then a phone copy for whoever reviews on a phone:
`ffmpeg -i final-9x16.mp4 -vf scale=720:-2 -c:v libx264 -crf 26 -c:a aac -b:a 128k -movflags +faststart phone-9x16.mp4`.

## Long films (≥ 90 s or 16:9 chapters)

Write a director's brief (logline, references, look, beat sheet with timestamps, on-screen text
rules, deliverables) and an `ANIMATION_GUIDE.md` (shared helpers, type scale, how a scene is
written) before splitting chapters across workers, so every chapter is coded in one style. Gates:
stills → animatic draft → full pass → polish → sound → final.
