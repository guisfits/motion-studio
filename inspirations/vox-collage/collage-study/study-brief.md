# Brief: study finished collage / paper / magazine animations for editing and composition

These are finished pieces (not tutorials) in the editorial-collage register the client wants: paper,
magazine cut-outs, Vox-style explainers. We are building a code-rendered film engine and its crew
skills from zero. Learn from these pieces: **how they are edited** (camera, angles, cuts, rhythm,
transitions, how elements enter and leave) and **how they are composed** so the collage never looks
odd (layers, scale, depth, negative space, type, colour, texture). Describe what you see, measured;
no taste words without the evidence behind them.

## Per video (`<work>/<id>/`)

- `shots.json` — machine measures: `shot_list` (start, dur, `camera` = push-in / pull-out / pan /
  rotate / drift / hold, `zoom` ratio, `pan_px360`, `rot_deg`, `peak_at` = where the move is fastest
  0–1, `stepped` = posterized motion), `asl`, `cuts_per_10s`, `soft_transitions`. A "cut" here is any
  picture event: a real cut, a punch-in, an element swap. Classify each from the strips.
- `cuts/cut-NN.jpg` — frames −2, −1, +0, +1 around each event. Open up to 12, spread over the video.
- `shots/shot-NN.jpg` — first | middle | last frame of a shot. Open up to 8.
- `sheet.jpg` — 2 fps contact sheet: look at it first, whole.
- `<media>/<id>.info.json` (`jq -r .description,.title`) — caption, may name the topic.

## Per still image (Pinterest stills, when your list has them)

Open the image; note composition only (see "composition" below).

## Output

Append to `<out>/study-<batch>.jsonl`, one JSON per finding:

```json
{"src":"<id>","kind":"video|image","t":"3.2-4.0","area":"transition",
 "finding":"Punch-in as a cut: from the group to the flag in one frame, scale ×2.3, no motion blur",
 "measure":{"zoom":2.3,"frames":1},"why_it_works":"keeps one world, resets attention on the key object",
 "use_when":"the line names one object inside a busy scene","confidence":"high"}
```

`area`, one of: `rhythm` (shot length, event rate, holds, beat sync), `camera` (moves, angles, easing,
speed curve, parallax, framing), `transition` (cut types, punch-ins, swaps, wipes, tears, match cuts,
whips), `entrance-exit` (how pieces appear and leave: pop, slide, stepped, scale, mask reveal),
`motion` (piece motion inside a shot: boil, jitter, stagger, overshoot), `composition` (layers,
hierarchy, scale contrast, negative space, framing, depth, where the eye goes), `type` (type choice,
size, placement, highlight/underline/callout, how text animates), `colour-texture` (palette, accent
use, paper, halftone, grain, shadows, edges), `cutout` (cut-out quality, edges, outlines, B&W vs colour
photos), `odd` (anything that looks wrong or cheap, and the fix the better pieces use).

Rules:
1. 4–10 findings per video, 1–3 per still. Every finding has a measure or a frame reference.
2. Prefer findings that repeat across pieces; say "also in <ids>" when you see the same device again.
3. End each video with `{"src":"<id>","done":true,"asl":…,"events_per_10s":…,"style":"<5 words>"}`.
4. English; describe, never copy text from the pieces beyond a few words.

Return (≤ 8 lines): items done; the 5 devices you saw most often, with counts.
