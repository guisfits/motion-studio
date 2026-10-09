# @chrismoran__ (159K): 12 reels studied (2026-10-09)

Method: yt-dlp download (all 12 ok), frames at 2 fps (local, not committed), cuts via
`ffmpeg scene>0.25` with detections <0.7 s apart merged into one shot, EBU R128, per-50 ms RMS split by
speech segments (mlx whisper large-v3-turbo transcripts), onset count (+9 dB in 50 ms).
All clips 1080x1920, 30 fps (a few 23.976). Reel id = `cm-<lowercased code>`.

## Per-reel table

| Reel | Dur | Hook (0-3 s) | Structure (line of reasoning) | Learns | CTA | Shots / avg / longest | Look |
|---|---|---|---|---|---|---|---|
| DdoVHX5gfP- (I♥NY, "rebus") | 39 s | "Look at this iconic design... technically it's not that good" over the logo, arrow drawn to it | Show logo → name the trick (rebus) → 4 examples (Safari, Google, Nike, IBM) → how: scale+align as typography → talking head recap | Weave images/icons into words | none (ends on face) | 21 / 1.9 s / 6.2 s | Light grey paper then black; huge hero object; blue serif/sans words with inline icons; thumbs/arrow stickers |
| DdKZ5oBpPCW (photos cinematic) | 46 s | "If photos feel flat, this makes them cinematic" on B/W photo + red arrow, Adobe St badge | Hook → sponsor line → try dust overlay → try shadow overlay (better) → license → keyframe drift → before/after | Shadow overlay + slow keyframe | "Check out Adobe Stock panel" (sponsored) | 20 / 2.3 s / 6.7 s | Single archival photo as ground; screen recordings in Premiere; presenter cutaways |
| Dc1ShYsplyF (collage layering) | 50 s | "Collage style is all about layering" + pink phone, "ALL ABOUT LAYERING" | Claim → problem (perfect collage looks awful) → 3 tips: tint paper, fragment photos, texture variance → each shown on a new collage | 3 craft tips | none | 22 / 2.3 s / 5.1 s | The most collage-like: paper scraps, cut-outs, halftone, torn plates, serif italic key words, green disc |
| Dcm63HBAHzT (vintage TV frame) | 50 s | "Fastest way to make footage feel documentary" in a TV frame, "Documentary" in serif accent | Hook → sponsor → why framing works → search stock in Premiere → filter/preview → license → RGB split + texture | Put footage inside an old TV | "Give Adobe Stock a try" | 23 / 2.2 s / 5.3 s | Dark ground, TV frame, serif key word (olive), screen recordings |
| DcTljpCgNNJ (map animation) | 37 s | "Map animations can turn this into this" (before/after in 3 s) | Before→after → 5 steps in order: clean map, shapes, overlay, burn reveal, texture+clouds | Map doc-style recipe | none | 22 / 1.7 s / 11.3 s (screen-rec hold) | Real map tiles, coloured regions, serif italic "Animations" + hand arrow |
| DcBhNhOg5kR (texture scale, quarter) | 46 s | "This texture feels tactile, this one feels off... same texture, difference is scale" | Paradox → problem (too large) → tile → "quarter trick" → remove quarter, believable | Scale texture vs real object | none | 16 / 2.9 s / 8.4 s | Teal paper ground, huge cropped TACTILE word, hand-drawn circle/arrows, coin cut-out |
| DbJSUGZpvzL (stolen texture) | 38 s | "This texture feels retro; remove it and it loses that feel" | Hook → story (70s magazine, thrift) → scan → high-pass → overlay+levels → chromatic aberration → "tiny imperfections" | Authentic texture workflow | none | 24 / 1.6 s / 3.8 s | Red ground, huge cropped TEXTURE, car cut-out, serif italic, tape plate |
| DbBSCjjgbTw (blend modes) | 49 s | "Texturing makes great design feel real" + giant TEXTURING, "THIS IS BAD" recolours | Thesis → rule per type (white bg → darken, black → lighten) → overlay needs normalization → levels → "look how much cleaner" | Which blend mode, normalize first | none | 23 / 2.1 s / 3.8 s | Colour-flip grounds, UI popups as sets, serif label plates, 6% to 50% number |
| Da3YpRipHuF (gate weave) | 41 s | "Look at this Apollo 11 photo. Look closer. Notice that tiny movement?" | Odd observation → remove it, looks dead → history (film gate weave) → recipe 2 wiggles → free preset | Gate weave + flicker | "grab it in my bio" (free preset) | 13 / 3.2 s / 8.3 s | Single hero photo, "Vox" giant word behind, red arrow, film-window crops |
| Dafr0KjAkve (page turn) | 43 s | "Look at today's NYT. No, the next page. See that turning effect?" | Observation → why it feels real → CC Page Turn → fold radius → posterize 8 fps → why tactile | Page-turn + 8 fps stepping | none (cut on "And now.") | 22 / 2.0 s / 6.5 s | Maroon/wood grounds, real newspaper, red scribble, arrow |
| DaQeqljgc7y (screen treatment) | 42 s | "Look at this clip. See it? Not the dunk. The vintage TV treatment" | Hook → take it away (before/after) → 3 steps (scan lines, solid, travelling shape, colour cast) → stack | CRT treatment recipe | none | 22 / 1.9 s / 4.3 s | TV frame, Jordan clip, "low quality" red plate, serif+sans "Screen Treatments" |
| DaNlGAcgYsD (3 Vox effects) | 43 s | "Three editing effects Vox uses all the time" + big pink 3 | Promise (3) → cursor → counters → radio waves → kit CTA | 3 AE effects | "comment KIT" (tool waitlist) | 23 / 1.9 s / 5.6 s | Dark grey + pink accent, numbered chips 1-2-3, demo sets per effect |

## Sound (measured)

| Reel | LUFS-I | LRA | Speech coverage | Non-speech gaps | Onsets /10 s |
|---|---|---|---|---|---|
| 12 reels | -14.1 to -14.7 (all ~-14.3) | 2.3-4.6 LU | 90-100 % of runtime | 0-2.4 s total; where measurable -48/-51 dB = digital silence in 5 of 8 | 8-20 (all inside speech; they are consonants) |

- Narration is wall to wall, one take of a presenter (his voice), consistent level (speech mean about -20 dBFS RMS,
  p95 -10). Within the speech stretches no sustained music bed is detectable; gaps fall to near silence
  (-48 dB) in DbBSCjjgbTw, DcBhNhOg5kR, DdKZ5oBpPCW. Few gaps carry anything (DcTljpCgNNJ -21 dB, Dcm63 -28 dB: tails).
- I could not separate SFX from voice by signal alone; listening proxies (onset count, nothing in the gaps) say
  SFX are absent or tucked far under the voice. No evidence of any hit that masks speech. Treat as
  "voice-led, practically no SFX, no music" (the opposite of the common "racket" failure: dense SFX at voice level).
- Endings: none has an outro card. Speech runs to the last 0.1-1 s (last 3 s RMS -18 to -35 dB), then cuts. CTA
  is spoken in the last 3-4 s ("grab it in my bio", "comment kit"), never a logo card. 5 of 12 have no CTA.

## What makes these good (measurable norms)

1. Length 37-50 s (median 43 s). One idea, reasoned in steps.
2. Shot length: average 1.6-3.2 s (median 2.0 s), longest hold 3.8-11 s; only the 1-2 screen-recording holds exceed 6 s. Many shots are the same scene with a changing overlay, not a new image.
3. Hook in the first 3 s = an odd/visible thing + a command to look ("Look at this", "Look closer", "See it?"), 6 of 12; the other 6 state a paradox or promise. The subject is on frame 0, voice starts at 0.0 s.
4. Hook object is the subject for the whole first beat (0-5 s), with ONE hand-drawn red arrow/circle on it; no second accent.
5. Structure pattern (11 of 12): hook → "take it away / before-after" or paradox → name the technique → 2-5 steps in order, one step ≈ 5-8 s → recap/result → optional CTA. Always show the result before and after.
6. Captions: 1-4 words (avg 2.4) per phrase, small white caps, centred in a dark rounded box at ~82 % height, same place every time; they follow the speech word by word; at most one line.
7. Hero words are separate from captions: 1-2 per scene, huge, cropped by the edge, in a serif/condensed with one accent colour, on screen 3-8 s; key word in serif italic with an accent.
8. One accent colour per reel (pink, teal, red, olive), grounds change by reel but stay flat/grainy paper, never a gradient.
9. Real UI/process footage is a first-class shot: ~40-50 % of runtime is screen recording with cursor, each held 1.5-4 s, captions underneath still readable.
10. Presenter talking-head cutaways at 3-4 s long, 2-4 per reel, as a pace reset (not a collage shot).
11. Sound: -14 LUFS integrated, LRA 2-4 LU; voice only, no music bed, SFX nil to sparse under the voice; ≥0.1 s silent gaps only at the very end.
12. Ending: the last voice line carries the CTA (≤4 s), then a hard cut; no outro card, no logo, 0 s of "silent" tail. The lesson for any outro: the voice stays and nothing new piles up.
13. Motion vocabulary is small: arrow draw, circle draw, scribble, cut-out slides in, popup menu, number tick; ≤2 moves per scene. Everything else holds.
14. Scene = one clear thing: ≤3 elements on screen at once (hero, caption, one annotation).

## Rules to adopt (for the Vox critic)

- Fail if length < 40 s or if there is no explicit "remove it / before-after" beat.
- Fail if any caption > 4 words or any frame has > 1 accent annotation.
- Fail if average shot < 1.6 s or a station repeats the same move > 2 times.
- Fail if the key proof (product UI, page, number) is held < 2.5 s or covered by a caption.
- Warn if SFX count > 1 per 4 s or any SFX is not ≥ 6 dB under the voice (the engine default is stricter: 12 dB plus a duck); integrated loudness must be -14 ±1 LUFS.
- Warn if the last voice line is not the CTA or if the outro adds > 3 new elements in its first second.
