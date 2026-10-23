# Pipeline: brief → script and voice → sync sheet → look and pictures → animatic → draft and master → sound → review

Without a script, a reference and a sync sheet, a model falls back to its default film: centred
text on a gradient, everything fading in, a logo at the end. Each step below exists to prevent it.
The flow, its gates and the order of roles belong to `film-director`
(`skills/film-director/SKILL.md`); this page keeps the engine facts each step relies on.

## Film folder (what the crew's steps fill)

```
<film>/
  index.html           the film: draw(t), window.trace, window.camera, window.CUES (film-animator)
  narration.json       lines for the voice engine (shape below) (film-writer)
  voice/               voice.wav + words.json (per-word times), written by the project's TTS step
  crew/
    brief.md           the client-approved brief (film-director)
    research.md        sourced facts (film-writer)
    script.md          the script, beats table, the one sentence to remember (film-writer)
    cer.md             ASR check of the take (film-writer)
    sync-sheet.json    one row per beat: hero, supports, lettering, marks, zoom (film-storyboard)
    style-bible.md     every visual choice with its source (film-art-director)
    manifest.json      one row per picture: created by the art director, provenance filled by the archivist
    assets-notes.md    search trail per asset (film-archivist)
    animation-notes.md camera and motion intent per beat (film-animator)
    sfx-cues.json      SFX cue list; sound.md has the reason per cue (film-sound)
    checks-<stage>.md  gate reports (+ .json), written by `core/checks/run.mjs` for sheet|animatic|draft|final
    review.md          ranked defects per round (film-reviewer)
  assets/              cut pieces, grounds, sources/, music/ (film-archivist, film-sound)
  out/                 animatic, draft, master (silent), sfx.wav, final, stills, cues.auto.json (gitignored)
  score.json, beats.json   optional music grid for film-sound (a code score or a measured track)
```

## 1. Script and voice

Owned by the `film-writer` skill (`crew/research.md`, `crew/script.md`, `crew/cer.md`). Output that the
engine consumes, `narration.json` at the film root:

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

## 2. Beat grid (optional music grid, `film-sound`)

| Situation | Do |
|---|---|
| No track | write `score.json`, run `audio/score.mjs` → `music.wav` (kept as `assets/music/music.wav`) + `beats.json` |
| Generated track | `audio/music.mjs` (plan or prompt, cached by request), then `beats.py` |
| Supplied track | `python <E>/core/audio/beats.py track.wav > beats.json`; keep the track as the music stem |
| Voice only, no music | still make a grid from the voice: beats = line starts in `words.json` |

Shots start on beats, big moments on downbeats; the voice still wins any conflict (a cut lands
on the word, not on the bar).

## 3. Sync sheet

`film-storyboard` writes `crew/sync-sheet.json`: one row per beat, timed on words (`words.json`), with
the hero and support pictures, the lettered key word, marks and the camera move
(`skills/film-storyboard/references/sync-sheet-fields.md`). It is the shot list; there is no separate
`shotlist.md`. The sheet gate (`node core/checks/run.mjs <film> --stage sheet`) reads it.

Checks before building: every row has a literal object for its noun; one accent mark at most;
one element ≥ 70 % of width or ≥ 35 % of area (scale contrast); the hook frame is a subject, not
a title card; nothing essential in the UI zones.

**Inspirations** are the visual target: a film matches their look (composition, density, finish,
texture, type treatment, colour balance) and their grammar (pacing, transitions, camera, structure);
the project's theme supplies colour tokens and type, and no author's pixels, logos or copy are lifted.
Pick 1–3, open them (not just the catalog row), and name in `crew/style-bible.md` what comes from which. Studied references live in `inspirations/` (`vox-collage/`, `motion-graphics/`);
`core/reference/inspiration.mjs <id> <url> --out <dir>` downloads one clip and builds a labelled
frame sheet (media stays local, never committed).

## 4. Build and animatic

Owned by `film-animator`: the layout first, `node core/animatic.mjs <F>` → `out/animatic-9x16.mp4`
(`--stage animatic`), the client sees it, then motion and montage → `out/draft-9x16.mp4`
(`--stage draft`, picture lock). `references/engine-api.md` for the API, `references/kit-and-cutouts.md` for material. Build in
this order: theme → stations and surfaces → pieces (with causes) → captions (`say`) → camera keys
→ cues. Stills first (`--stills beats`) to fix composition before any motion.

## 5. Review loop

A round: make sheets → open every sheet → score → log the 3 worst problems with timestamps → fix →
re-render only those seconds (`--draft --from a --to b`) → next round. The style's critic owns
the rubric (`film-reviewer`, ranked defects in `crew/review.md`, at most two fix rounds). Round 1 may be stills; every later round
includes the draft video, contact sheet, phone sheet, a strip at each shot change and the
`--flat` report. Ship only after the critic's gate passes, then a fresh-eyes reviewer that never
saw the code agrees.

## 6. Final

After picture lock the animator renders the silent full-quality master; the sound role mixes onto it
(`film-sound`). Gate: `node core/checks/run.mjs <F> --stage final`.

```bash
node <E>/core/render.mjs <F> --sub 8                       # out/silent-9x16.mp4 + out/cues.auto.json (the event times sound reads)
node <E>/core/audio/sfx.mjs <F>/crew/sfx-cues.json <F>/out/sfx.wav --dur <dur>
node <E>/core/audio/mix.mjs --video <F>/out/silent-9x16.mp4 --voice <F>/voice/voice.wav \
  --music <F>/assets/music/music.wav --sfx <F>/out/sfx.wav --out <F>/out/final-9x16.mp4 --report
python <E>/core/audio/sync_check.py <F>/out/final-9x16.mp4 <cuts.json> --music <F>/assets/music/music.wav
node <E>/core/critique/sheets.mjs <F>/out/final-9x16.mp4
```

Then a phone copy for whoever reviews on a phone:
`ffmpeg -i final-9x16.mp4 -vf scale=720:-2 -c:v libx264 -crf 26 -c:a aac -b:a 128k -movflags +faststart phone-9x16.mp4`.

## Long films (≥ 90 s or 16:9 chapters)

Write a director's brief (logline, references, look, beat sheet with timestamps, on-screen text
rules, deliverables) and an `ANIMATION_GUIDE.md` (shared helpers, type scale, how a scene is
written) before splitting chapters across workers, so every chapter is coded in one style. Gates:
stills → animatic draft → full pass → polish → sound → final.

## Designed frames (from a design tool)

When the client draws a frame (e.g. a Claude Design canvas at half size, 540×960):

- The drawing is the source of truth. Reproduce every element's position, size, rotation, stacking
  order and styling ×2; no readability-driven offsets without asking — raise the concern, keep
  the drawing.
- Resolve nesting: an element inside a rotated sheet gets its frame position by carrying its
  centre round the sheet's centre and summing rotations. Inherited styles count (e.g. a design
  system's body line-height).
- Verify by rendering the drawing itself at full size and comparing it side by side (and as a
  diff) with the film's still at the same moment; fix every difference.
- The client edits the drawing between your reads: re-read it right before porting and never
  overwrite a newer save.
- A storyboard of beats is best drawn as ONE final frame whose groups are gated by beat; each
  beat board shows the same frame up to that beat, so moving a piece once updates every beat.
