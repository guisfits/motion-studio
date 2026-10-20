# Brief: extract every lesson from Chris Moran's tutorial reels

Chris Moran (`@chrismoran__`) is a professional motion designer who teaches the Vox-style editorial
collage look in After Effects. His reels are **tutorials**: mostly him talking, with short demos. We
learn the technique — every step, setting, number and reason — and later turn it into skills for a
code-rendered engine (HTML/canvas/SVG + ffmpeg; no After Effects). Technical detail and attention to
detail are the point: a lesson without its numbers or its "why" is half a lesson.

## Input (per reel, under `W=<work dir>/<id>/`)

- `transcript.srt` — whisper (small model): times + text. Known mishearings: "Box" = **Vox**,
  "Trim Pals" = Trim Paths, "after fx" = After Effects; fix them silently. Read the whole file.
- `sheet.jpg` — 1 frame per second, 6 across: look at it once to see the demo.
- `frames/scene-NN.jpg` — frames at scene changes. Open only the ones that show a demo result or an
  After Effects panel with values (at most 8 per reel); read any number on screen.
- `duration.txt`, and `<media>/<id>.info.json` (caption: `jq -r .description`) — the caption often
  lists the steps or the effect names.

## Output

Append one JSON object per lesson, one per line, to `<out>/lessons-<batch>.jsonl`:

```json
{"reel":"DLShlJxRXZe","t":"0:04-0:20","title":"Focus vignette that steers the eye",
 "teaches":"A moving darkened area tells the viewer where to look.",
 "how":["radial gradient layer, blend Multiply","adjustment layer + Compound Blur, blur layer = the gradient","animate the gradient centre to the subject"],
 "numbers":{"blur":"not stated"},"why":"focus manipulation, as Vox maps do",
 "category":"camera-focus","role":"animator","also":["art-director"],
 "build":"canvas radial-gradient mask + blur pass on world layer, centre keyed to the zoom target",
 "evidence":"transcript 0:04-0:20; scene-03 shows the panel","confidence":"high"}
```

Rules:
1. **Every** teachable thing is its own lesson: a technique, a setting, a rule of thumb, a warning ("this looks fake when…"), a pacing or hook device, a sound choice, a workflow tip. A reel usually holds 2–8.
2. `numbers`: every value he says or shows (percent, px, fps, frames, dB, seconds, blend mode names, effect parameter names and values). "not stated" when he gives none — never invent.
3. `why`: his reason, in one line, when he gives one (or the visible effect when he does not).
4. `category`: exactly one id from the taxonomy below. `role`: the crew role that executes it (one); `also`: others that must know.
5. `build`: one line on how our engine would do it (canvas/SVG/CSS filter/ffmpeg/shader), or "n/a".
6. The reel's own structure (his hook, his before/after reveal, his CTA) is also a lesson, category `direction-hook` or `direction-structure` — he is a teacher of retention too.
7. Sponsor reads, "link in bio", personal stories: skip (one line `{"reel":…, "skip":"sponsor"}`).
8. English. Do not copy his words beyond 15 words per quote; paraphrase.
9. When done with a reel, append `{"reel":"<id>","done":true,"lessons":N,"duration":S}`.

## Taxonomy (mind-map nodes: `category` ids)

| id | Node |
|---|---|
| `direction-hook` | Hook and first seconds: how he grabs attention |
| `direction-structure` | Structure, pacing, retention, before/after reveals, CTA |
| `script-voice` | What he says and how: wording, rhythm, narration |
| `composition` | Layout, hierarchy, framing, focus, negative space |
| `camera-focus` | Camera moves, zoom, punch-in, parallax, focus pulls, vignettes that steer the eye |
| `motion-pieces` | How pieces move: jitter, boil, stop-motion frame rate, entrances, easing, overshoot |
| `transitions` | Page turns, tears, ink, wipes, match cuts, cuts on action |
| `paper-texture` | Scans, paper, grain, blend modes, texture scale, halftone, dust, relief |
| `colour-grade` | Palette, tints, black/white levels, grading, chromatic aberration |
| `film-treatment` | Gate weave, flicker, CRT/screen/TV treatments, film look, vintage frames |
| `cutout-collage` | Cut-outs, edges, layering, fragmenting photos, collage composition |
| `type-lettering` | Type choice, text animation, callouts, highlights, arrows, annotations |
| `maps-data` | Maps, counters, charts, data graphics |
| `sound` | SFX, foley, music, mix |
| `workflow-tools` | AE workflow, presets, plugins, render tips (also map to our engine in `build`) |
| `fake-tells` | What makes it look fake or amateur, and the fix |

## Batch

Your reels: the ids listed in the task. Process them in order; do not open other reels. Return
≤ 6 lines: reels done, lessons per reel (min/max), anything unreadable.
