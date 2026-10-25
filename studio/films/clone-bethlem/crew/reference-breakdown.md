# Reference breakdown: c5 "Bethlem Royal" (50.4 s, 1080x1920, 24 fps container, ~14 unique frames/s, 1209 frames)

Source: `inspirations/clone-candidates/media/c5.mp4` (https://www.instagram.com/reel/Dd0qOzpqoYf/). Study only; no media is copied into git.
Scratch (local): `inspirations/clone-candidates/c5-work/` (frames in `c5-work/media/`, gitignored by the `inspirations/**/media/` rule). Voice words: `words.json` beside this file (whisper.cpp small.en via `tools/captions`, `-ml 1`; timings +-0.05 s, they come from the model, not from forced alignment).

Conventions
- Frame `f` is 1-based at the NATIVE 24 fps; time `t = (f-1)/24` s. Voice words as `word(s-e)` in seconds; frame = `floor(s*24)+1`.
- Percentages: x of width (1080), y of height (1920), top-left origin. `~` marks an estimate (visual, +-5 %). Everything else was measured on frames (frame diff = mean abs diff on 108x192 grayscale; band energy via FFT).
- Colours are measured with a picker (median of the pixel mask) on the named frame.

## 0. Header (section 1 of the brief)

| Item | Value |
|---|---|
| Duration | 50.375 s video, 50.34 s audio |
| Size | 1080x1920 (9:16) |
| Native fps | 24/1 (CFR) |
| Codec | VP9 video (4.05 Mb/s), AAC-LC 44.1 kHz stereo (74 kb/s) |
| Frames | 1209; **706 unique (58 %)**, 503 are exact holds (diff < 0.15) |
| Cadence | Mostly "on twos" with a 3-new-frame burst every 8-10 frames: pattern `N.N.N.NNN.N.N.N.NNN` (346 holds of 1 frame, 316 of 2, ~40 of 4-8 on blank/text cards). Effective 12-17 fps (14.0 average), per-second unique count 5-21. Grain, tint and every layer step together: the whole frame is one stepped image, so the grain "boils" at the same cadence as the motion (a held frame is bit-identical, grain included). |
| Clone rule | Render at 24 fps and quantise every animated value with `Math.floor(frame / 2) * 2` (twos). Optional: let every 4th-5th pair be a 3-frame step. Do not interpolate to 60 fps: that kills the cut-paper stutter. Static cards (blank paper, years card, cover) hold 4-8 frames per new image. |
| Loudness | -14.2 LUFS integrated, LRA 1.9 LU, true peak -1.2 dBFS |

Cut count: **37 boundaries after the first frame (38 segments)**: 24 hard cuts between distinct pictures, 9 crop-hops / cut-out swaps on one picture, 4 animated entries (title pull-back, text wall, year counter, page peel). Median segment 1.0 s (24 f); shortest 0.33 s (zoo crop-hops), longest 2.6 s (Norris wide, f759-822). Rhythm: one visual event every 1.36 s.

---

## 1. Cut table (section 2 of the brief)

`diff` is the strongest frame diff at the entry (0-100 scale). Voice words are those spoken inside the segment.

| # | Segment | Frames | Seconds | Len f / s | Entry | Voice inside |
|---|---|---|---|---|---|---|
| 1a | White paper card, empty yellow bar, grey shard bottom-right | f1-4 | 0.00-0.13 | 4 / 0.17 | start | In |
| 1b | Parliament plate unfolds (rotated card swings to full) | f5-36 | 0.17-1.46 | 32 / 1.33 | hard cut f5 (26), card unfold f5-11 | 1800s London, |
| 1c | Big Ben plate + top-hat men rise from bottom; coats turn yellow | f37-88 | 1.50-3.63 | 52 / 2.17 | cut-outs slide up f37-43 (diff 18-38) | people queued up on weekends to watch |
| 2a | Hogarth Bedlam plate, patients crop, white caption "mental patients" | f89-96 | 3.67-3.96 | 8 / 0.33 | hard cut f89 (48) | mental (3.34-3.74) patients |
| 2b | crop-hop: man at window | f97-106 | 4.00-4.38 | 10 / 0.42 | crop jump f97 (30) | patients like |
| 2c | crop-hop: barred window + hand | f107-116 | 4.42-4.79 | 10 / 0.42 | f107 (26) | zoo |
| 2d | crop-hop: woman with fan | f117-126 | 4.83-5.21 | 10 / 0.42 | f117 (35) | zoo animals. |
| 2e | crop-hop: fiddler | f127-130 | 5.25-5.38 | 4 / 0.17 | f127 (38) | animals. |
| 3 | "Bethlem Royal Hospital," yellow lockup over hospital engraving, pull-back | f131-158 | 5.42-6.54 | 28 / 1.17 | hard cut f131 (41) on the first letter | Bethlehem Royal Hospital, |
| 4 | Text wall (dark, 9 scrolling lines + white live line) | f159-224 | 6.58-9.29 | 66 / 2.75 | hard cut f159 (52) | London's only asylum for the mentally ill, |
| 5 | Grey card, two yellow bars, coin, "A penny to get in." | f225-256 | 9.33-10.63 | 32 / 1.33 | hard cut f225 (82) | a penny to get in. |
| 6 | Snowy Big Ben, crowd, slow push | f257-288 | 10.67-11.96 | 32 / 1.33 | hard cut f257 (46) | On Christmas and Easter, |
| 7 | Crowd close-up (lamp, holly wreath), pan | f289-324 | 12.00-13.46 | 36 / 1.50 | tight crop f289 (33), re-crop f301 (40) | the queues stretched around the block, |
| 8 | Regency couple + dandy (white ground) | f325-354 | 13.50-14.71 | 30 / 1.25 | hard cut f325 (65) | prostitutes and food |
| 9 | Woman with yoke, yellow pails | f355-368 | 14.75-15.29 | 14 / 0.58 | hard cut f355 (41) | merchants set |
| 10 | Woman with yellow basket | f369-404 | 15.33-16.79 | 36 / 1.50 | slide-over f369 (42) | up inside the wards. |
| 11 | Ruffed man, violin slides in from right edge | f405-416 | 16.83-17.29 | 12 / 0.50 | hard cut f405 (65) | Patients who |
| 12 | Jester in paper cone | f417-436 | 17.33-18.13 | 20 / 0.83 | hard cut f417 (42) | were particularly |
| 13 | Fiddler with newspaper hat, yellow violin | f437-494 | 18.17-20.54 | 58 / 2.42 | hard cut f437 (40) | entertaining became minor celebrities. |
| 14 | Crowd of onlookers, focus pull from blurred heads | f495-552 | 20.58-22.96 | 58 / 2.42 | hard cut f495 (36), defocus f495-499 | People came specifically to see them. |
| 15 | Blank card (door ghosted), two text lines | f553-594 | 23.00-24.71 | 42 / 1.75 | hard cut f553 (80) | Nobody thought twice about it. |
| 16 | Chained patient (turban), yellow harness | f595-648 | 24.75-26.96 | 54 / 2.25 | hard cut f595 (76) | Inside, patients were chained to walls, |
| 17 | Beaten: woman cradling a head | f649-664 | 27.00-27.63 | 16 / 0.67 | hard cut f649 (50) | beaten, |
| 18 | Starved: patient + yellow bowl, pull-out | f665-706 | 27.67-29.38 | 42 / 1.75 | hard cut f665 (44) | starved. It all changed |
| 19 | Policeman 1 (notebook), light beam | f707-730 | 29.42-30.38 | 24 / 1.00 | hard cut f707 (46) | when investigators |
| 20 | Policeman 2 (reads sheet) / lantern, swap | f731-758 | 30.42-31.54 | 28 / 1.17 | hard cut f731 (37), swap f747 | walked in and found |
| 21 | Norris wide on grey wall plate, yellow circle on face | f759-822 | 31.58-34.21 | 64 / 2.67 | wall frames f759-760, Norris slides in f761 (35) | James Norris, an American sailor who had been |
| 22 | Face close-up with chains, fast push | f823-840 | 34.25-34.96 | 18 / 0.75 | fast push (no cut, diff 19-34) | locked in a metal |
| 23 | Foot + yellow shackle | f841-864 | 35.00-35.96 | 24 / 1.00 | hard cut f841 (33) | harness bolted |
| 24 | Pull-up: chain on pole (yellow), then wide Norris | f865-920 | 36.00-38.29 | 56 / 2.33 | fast pull-up f865 (30) | to a wall for 12 years. The |
| 25 | Newspaper portrait page on pale ground | f921-976 | 38.33-40.63 | 56 / 2.33 | hard cut f921 (48) | images went across every newspaper in Britain. |
| 26 | Crowd holding yellow newspaper | f977-1002 | 40.67-41.71 | 26 / 1.08 | hard cut f977 (50), paper swings in f979 | The public was horrified, |
| 27a | St Paul's, men line (top hats) | f1003-1032 | 41.75-42.96 | 30 / 1.25 | hard cut f1003 (52) | the same public that had |
| 27b | swap to other men | f1033-1042 | 43.00-43.38 | 10 / 0.42 | cut-out swap f1033 (36) | been paying a penny |
| 27c | swap to grey-coat man | f1043-1052 | 43.42-43.79 | 10 / 0.42 | cut-out swap f1043 (37) | to walk |
| 28 | Norris again (bandaged), pull-out | f1053-1088 | 43.83-45.29 | 36 / 1.50 | hard cut f1053 (65) | past him for years. |
| 29 | Blank card: "It took another", year counter 1814-1852, "years" | f1089-1140 | 45.33-47.46 | 52 / 2.17 | hard cut f1089 (88, strongest cut) | It took another 38 years |
| 30 | Yellowed report cover, page peel, push-out, stamp | f1141-1209 | 47.50-50.34 | 69 / 2.88 | peel f1139-1146 (53) | before Bethlehem lost the right to operate without oversight. |

Picture follows word: every hard cut lands within 0-3 frames of the first syllable of the noun it shows (cuts f89 mental, f131 Bethlehem, f225 penny, f325 prostitutes, f355 merchants, f405 patients, f707 investigators, f731 walked, f759 James, f841 harness, f1053 past him, f1141 Bethlehem). Cut offsets vs the voice, where measurable: -3 to +8 frames (picture slightly before the word on 7 of 12).

---

## 2. Captions (section 3 of the brief)

Three caption modes, in order of use.

### 2.1 Default: typewriter text in a yellow bar (most of the film)
- Bar colour: **#FAF755** (median of 47,328 px on f1; mean 249,247,84; same on f1195/f1207). Flat fill, film grain overlays it (it is part of the picture, not above it). Corners square, no border, no shadow.
- Bar size: hugs the text. Height **88 px (4.6 % H)** with one line; width = text width + ~48 px padding each side (+-24 px). Measured examples: "without oversight." 474 px wide (f1205); "people" 350 px; empty first bar 392x118 px (f1, a taller blank).
- Position: horizontally centred (x centre 540); vertical centre **y ~ 957 px (49.8 % H)** for 95 % of the film, i.e. dead centre of the frame, over the picture's main subject. Exceptions (bar follows the picture): f761-808 on Norris the bar starts low (y 1192-1280 = 62-67 % H) and glides up to y 974-1018 (51 %) by f807 while the camera pushes in (f779-807); f1-f4 bar slightly low/tall (y 900-1018).
- Type: old-style serif with Garamond proportions (EB Garamond or Cormorant Garamond Medium), upright, dark ink (#1a1a14-ish) with grain over it. Size: x-height ~24 px, cap height ~36 px, **font size ~52 px = 4.8 % of width**. Letter-spaced normally, sentence case, punctuation kept ("London," "in." "ill.").
- Appearance: **typewriter reveal, whole-bar**, not word pops. The bar is on screen before and after the text. Letters appear at ~2 characters per 2 frames: "In" f5 -> "In 1" f11 -> "In 18" f13 -> "In 1800s" f19 (24 f for 8 characters). Longer phrases type in ~10-14 f ("people queued" f39 "peop" -> f45 complete).
- Bar growth: the bar stays the width of the full phrase the whole time (the text grows inside a fixed bar: "In 18" sits left-aligned inside a bar already as wide as "In 1800s" in f13). The bar is not resized during typing; it is replaced (new width, same y) when the phrase changes.
- Phrase change: hard swap in 1-2 frames (new bar width at same y), no wipe, no fade. Some phrase changes slide the bar (f747-757 bar glides left 458->152 px in 10 f then the shot changes; f761-769 bar slides in from the right 594->352 px over 8 f: ease-out).
- Words per bar: 2-4 (median 3): "In 1800s" / "London," / "people queued up" / "on weekends" / "to watch" / "a penny to get in." / "On Christmas" / "and Easter," / "the queues stretched" / "around the block." / "Prostitutes" (1, capitalised: the only single-word bar besides "Beaten." "Starved." "Inside,") / "specifically to see them." (4). Roughly one bar per 0.8-1.2 s.
- Empty-bar cue: on card segments the empty bar sits on screen 4-6 frames before text (f1-f4, f225-227, f1205+): the bar is a stable graphic that "waits" for words.
- Timing vs voice: bar text begins **0 to 3 frames after the first word starts** and completes about 1/3 into the phrase's voice duration, i.e. text runs ahead of the speaker. Examples: "In" f5 vs voice 0.02 s (f1) = +4 f; "London," complete by f25 (1.00 s) vs voice 0.93-1.44; "people" f39 (1.58 s) vs voice 1.44 = +3 f. Whole phrase is visible for ~0.4 s before its last word ends; next bar starts on the first syllable of the next phrase.
- Last bar: f1205-1209 goes empty (the text clears 0.15 s before the end).

### 2.2 White live line (zoo plate f89-130)
No bar. Lower-case-initial white Garamond, ~5.2 % W, soft grey shadow; centred at y ~ 50 %. Phrase swap "mental patients" -> "like zoo animals." at f99 (4 f before the voice says "like" at f103). Appears in full, no typing.

### 2.3 Text-wall caption (f159-f224): see section 7.

### 2.4 Title (f131-158): yellow lettering, no bar: see section 7.

---

## 3. Accent colour moves (section 4 of the brief)

The accent is **#FAF755** for the bar and the lettering. The tinted objects are the same hue run through a gradient map: black -> olive (#6B6B10) -> yellow (#FAF755) from the object's luminance (shadows stay dark olive, highlights go full yellow; hatching lines are kept). The tint always lands on the cut-out the voice is naming; the rest of the picture stays grey.

| Element | Entry frame | How | Duration on | Trigger word (voice) |
|---|---|---|---|---|
| Men's hats/coats/faces (f43-88) | ramp starts f61 (2.50 s), 4th coat first | gradient-map tint **ramps per man**, centre men first (f63 4th man, f69-71 3rd and 5th, f73 all 5), full by f79 (3.25 s); stays to the cut f88 | ramp 18 f (0.75 s), hold 9 f | "weekends" (2.35-2.88) -> peaks on "to watch" (2.88-3.34) |
| Yellow rectangle behind coin | f225 two stripes, f227 solid square 100 px, f231 coin appears and the square becomes a circle ring | the bar doubles as a halo around the coin | f225-256 | "a penny" (9.44) |
| Yoke buckets + yoke (woman 1) | f355 (cut) | cut-out arrives **already tinted** (flat yellow pails, outline yoke) | f355-368 | "merchants" (14.70) |
| Basket (woman 2) | f371 (slide-over) | arrives tinted, light yellow wicker | f371-404 | "inside the wards" (15.55) |
| Violin (f405-416, portrait) | enters from right edge f405, fully in by f415 | tinted cut-out slides in over 10 f | f405-416 | "Patients who were" |
| Violin (f437-494, fiddler) | f437 (cut) | cut-out is the same yellow violin, rotates/sways | f437-494 (2.4 s) | "particularly entertaining" (17.66-19.08) |
| Pointer/small object, crowd (f517-551) | f517 | a small yellow tick (the fiddler's bow tip) in the crowd | ~1.4 s | "specifically" |
| Harness (patient) | straps f607 (24.88 s) start, buckles f611, full f625 (25.96 s) | tint **wipes down the harness** over ~18 f | f607-648 | "patients were" (25.65) -> "chained" (25.90) |
| Bowl | f667 (cut, 2 f after "Starved" begins) | tinted cut-out slides in at bottom | f667-706 | "starved" (27.55) |
| Circle on Norris's face | f765 small disc (30 px) -> f769 full disc (~16 % W) | **circle grows from the face, multiply tint inside the disc, face stays visible**; 4 f ease-out | f765-779 | "James Norris," (31.61-32.48) |
| Circle exit | f781-787 | disc fades and shrinks to the face, tint leaves as the camera pushes away | 8 f | "an American" (32.62) |
| Shackle on ankle | f841 (cut) | yellow band **draws on** around the ankle (f841 closed band, f847 band with strap open) | f841-863 | "harness bolted" (35.00-35.88) |
| Chain / pole | f869-893 | a yellow vertical bar enters the left edge, rises with the pull-up, exits at f893 | 24 f | "to a wall for twelve years" |
| Newspaper | f979 (page swings in, tinted at once, full by f985) | the held sheet is a yellow cut-out, text hatching dark olive | f979-1002 | "was horrified" (41.01) |
| Bar, lettering of title, year numbers | n/a | the year digits on the counter are black, not yellow | n/a | n/a |

Not tinted: the hospital engraving, the cover (only the bar), Norris's face outside the circle, the policemen (the yellow-ness there is only the bar).

---

## 4. Picture treatment (section 5 of the brief)

- **Monochrome grade**: every picture is desaturated to a cool grey (measured R-B mean 7-11 levels on f300/610/880, i.e. near neutral). Luminance range compressed: mean luminance 111-147 (of 255), blacks lifted to ~#222, whites to ~#E5E5E5. The page is a "wet-plate / halftone print" feel. Blank cards are #DBDBD7 (f2: 217,221,219) to #E5E6E5 (f1110).
- **Grain**: heavy, uniform, monochrome noise on **everything including the bar and text**. Measured std on a flat blank region: 7.6 levels (f2), 7.1 (f1110), 11.5 on mid-grey (f570). Re-seeded at the picture cadence (new every 2 frames, held on holds). Implement as a 1080x1920 grey noise PNG, ~0.15 opacity, soft-light, offset randomly every `Math.floor(frame/2)`.
- **Prism / rainbow streak**: not a uniform chromatic aberration (measured global R/B offset 0 px). Instead a **localised rainbow fringe** along the lower-left and left edges of the picture plate on some frames (visible f610, f73): 40-60 px wide band of red/green/blue/violet gradient, 10-20 % opacity, positioned at the lower-left corner, drifting. Also ~2 px red/blue edge ghosting on cut-out outlines. Looks like a glass prism / lens leak overlay (screen blend) travelling slowly. Present on ~40 % of frames, mainly pictures of the ward and men.
- **Halation**: slight glow on the whites of the blank cards; no strong bloom.
- **Vignette**: mild. Measured centre 231.5 vs corners 225.1 on f1110 (-3 %); 217.9 vs 210.5 on f570 (-3.5 %). In picture frames corners are darker by ~10 % (multiply, radial 0.75-1.0).
- **Paper texture**: the card segments (f1-4, f225-256, f553-594, f1089-1140) are a pale mottled paper with a ghosted engraving behind: the hospital elevation (f1089) at ~12 % opacity, the barred door (f553) at ~15 % opacity. The report cover (f1141+) is real scanned yellowed paper (#B5AD7F average, stamp in black).
- **Cut-out edges**: people are cut cleanly along the outline (no feather), with no drop shadow; they sit flat on the plate. The cut outline reveals a faint 1-2 px white "keyline" in some shots (hats against the sky).
- **Layer depth**: two to three layers only. (1) Background plate (Parliament, snow Big Ben, grey wall, hospital elevation), (2) foreground cut-outs (men line, vendors, patients, policemen), (3) caption bar/text. The foreground layer moves 1.2-1.5x the plate speed (parallax) in shots 1c and 6-7.
- **Cadence** of the treatment: stepped on twos (see header).
- **Scale of detail**: pictures are scaled up 1.3-3x for the push-ins, so the engraving hatching is visible at 3-5 px line width; resolution of the source art must be >= 2000 px long side.

---

## 5. Camera and motion per shot (section 6 of the brief)

Measured by affine matching (scale s, shift) between the first and last frames of a shot where the correlation was >= 0.65 (marked M). Other values are visual (`~`). Easing: all pushes are close to linear with a slight ease-out at the end (stepped on twos, so ease reads as 2-frame jumps shrinking); no shake in the film (camera never jitters; the only "shake" is the 2-frame stepping).

| Shot | Frames | Motion | Values | Parallax |
|---|---|---|---|---|
| 1b Parliament | f5-36 | card unfold f5-11 (rotate ~-30 deg to 0, bottom edge polygon), then slow tilt-up | plate dy ~ -15 % H over 32 f (~0.5 % H/f) ~ | none |
| 1c Big Ben + men | f37-88 | men rise from y 100 % to ~60 % in 6 f (ease-out), then push | **M scale 1.00 -> 1.075 (+7.5 %) over 42 f, dx -5 % W**; men line moves 1.3x faster than the sky plate ~ | fg men vs sky: 1.3x ~ |
| 2 Hogarth crops | f89-130 | no motion inside crops; crops jump every 8-10 f | crop size ~ 60 % of the plate at each hop, each crop 1.1x larger than the last ~ | none |
| 3 Title | f131-158 | **pull-back**: plate 2.2x -> 1.0 | scale ~ 2.2 -> 1.0 over 28 f (M 1.15 over f133-157 on the lower plate only), title lockup shrinks from 100 % W (cropped) to 45 % W, centred at y 14-18 % | title scales with the plate |
| 4 Text wall | f159-224 | lines scroll horizontally | see section 7 | per-line |
| 5 Coin card | f225-256 | coin enters f231 and sits; micro push 1.00 -> 1.03 ~ | | |
| 6 Snowy Big Ben | f257-288 | push-in toward the crowd | scale ~ 1.0 -> 1.4 over 32 f (~1.2 %/f), dy -12 % H ~ (fit corr 0.38 only) | |
| 7 Crowd close | f289-324 | tight crop, pan left->right (lamp passes) | ~ dx +20 % W over 36 f, scale 1.0 -> 1.1 ~ | lamp post vs men 1.2x ~ |
| 8 Couple | f325-354 | slow push, couple rises | ~ 1.0 -> 1.08 | |
| 9 Yoke woman | f355-368 | slide right-to-left (woman centred by f361) | ~ dx -10 % W | cut-out vs plate 1.3x ~ |
| 10 Basket woman | f371-404 | **M push 1.00 -> 1.075, dx -5 % W** over 33 f | | |
| 11-12 | f405-436 | static portrait / jester, violin slide-in f405-415 (dx +25 % W) | | |
| 13 Fiddler | f437-494 | slow pull-out ~ 1.0 -> 0.93, violin sways (+-5 deg, 1 s period) ~ | | |
| 14 Crowd | f495-552 | rack focus f495-499 (blur 25 px -> 0), then push ~ 1.0 -> 1.12 | | |
| 16 Chained patient | f595-648 | **M push 1.00 -> 1.20, dx -10 % W** over 50 f (~0.4 %/f) | | wall vs figure ~1.1x |
| 17 Beaten | f649-664 | static + drift ~ | | |
| 18 Starved | f665-706 | **pull-out**: scale ~ 1.5 -> 1.0 (patient from head-and-shoulders to full) over 42 f ~ | | |
| 19 Policeman 1 | f707-730 | M-ish push 1.0 -> 1.15 ~ ; light beam rotates | | |
| 21 Norris wide | f759-822 | slide-in from right f761-767 (dx -40 % W, ease-out); **M push 1.00 -> 1.125 over f763-779**; then continuous push | | face circle moves with plate |
| 22 Face | f823-840 | fast push ~ 2.2x from the wide, 2-frame steps | scale 1.0 -> ~2.4 in 18 f ~ accelerating | |
| 23 Foot | f841-864 | cut to a ~3x crop on the ankle, slow drift down ~ | | |
| 24 Pull-up | f865-920 | pull-up/out from chain (3x) to wide (1.0), ease-out, 56 f | | pole (yellow) 1.3x |
| 25 Newspaper | f921-976 | **M push 1.0 -> 1.4** over 56 f (~0.7 %/f) | | |
| 27 St Paul's | f1003-1052 | **M push 1.00 -> 1.275 over f1003-1031**; swaps at f1033, f1043 reset scale to ~1.1 | | |
| 28 Norris 2 | f1053-1088 | M push 1.00 -> 1.025 (nearly static) | | |
| 29 Cards | f1089-1140 | static, ghosted engraving drifts up 1 % ~ | | |
| 30 Cover | f1141-1209 | **pull-out ~ 1.5 -> 1.0** over 69 f, ease-out, ~0.8 %/f at the start | stamp stays pinned to the paper | |

Pattern: every shot is a push or pull of 8-40 % over its length, almost always toward the subject; hard cuts reset the scale.

---

## 6. Transitions in detail (section 7 of the brief)

### 6.1 Giant-type title "Bethlem Royal Hospital," (f131-158, 5.42-6.54 s)
- Entry: hard cut f131 (diff 41) onto a **huge pre-composed lockup**; no animation of the letters themselves. The lockup is part of the camera move: the whole plate (hospital engraving) plus title scale together.
- Lockup (yellow #E9E34C-ish at 85 % over grain, no bar): "Bethlem" small (~11 % W cap height ~5 % H), "Royal" giant (cap height ~12 % H, ~100 % W at f131, cropped by the frame edge; letters overlap the engraving's spire), "Hospital," small and right-aligned under "Royal". Same Garamond-style serif, bold/semi-bold, tight leading (lines overlap by 15 %).
- Camera: pull-back from ~2.2x (title 105 % W, only "Royal" legible) to ~1.0 (title 45 % W, whole lockup at y 14-18 % H) over 28 f; ease-out (steps shrink); engraving tower reveals and the wide hospital elevation + hedged garden appears below (f139+).
- Text "Bethlem" is spelled this way on screen; the voice says "Bethlehem".
- Exit: hard cut f159 into the text wall (3 frames before "London's").

### 6.2 Scrolling text wall (f159-224, 6.58-9.29 s)
- Background: near-black (#1b1b19) with the Bethlem plate ghosted at 10 % (f159 shows "Royal" ghost for 2 frames: dissolve-from-title).
- 9 horizontal lines of the **upcoming script**, in dim grey Garamond (#6d6d6a at 60 %), size ~5.2 % W (56 px), line pitch 104 px (5.4 % H), rows y = 22 %, 28 %, 34 %, ... 74 %: "Beaten. Starved. It all changed when investigators / walked in and found James Norris, an American / sailor who had been locked in a metal harness / bolted to a wall for twelve years. The images went across ...".
- Scroll: each line moves horizontally at a different speed: roughly 2-4 % W per frame step, **alternating directions** (lines 1, 3, 5 right-to-left; 2, 4 left-to-right ~), so the wall looks like a loom. Steps on twos.
- The **live line** is white (#F3F3EE), the same size, on row y 49-52 %, with a dark shadow, and replaces the middle grey line; it reads the spoken words "London's only asylum for the mentally ill," in 4-word windows that slide with the speech (f159 "Lond", f165 "London's", f177 "'s only asy", f183 "n's only asylum", f195 "ylum for the", f207 "he mentally", f219 "he mentally ill."): i.e. a **single long string scrolling right-to-left past a fixed point**, character-synchronous with the voice (speed ~ 12 chars per second), not typewriter. 
- Exit: hard cut f225 to the blank card (diff 82, strongest of the film with f1089).
- Effect: the audience reads the next sentences in the wall while hearing the previous ones: foreshadows the horror lines (it is the only place the copy runs ahead of the voice by up to 25 s).

### 6.3 Blank-paper cards (f225-256, f553-594, f1089-1140)
- Card A (f225-256, "A penny to get in."): grey paper (#C9C9C6) with ghosted hospital elevation; two yellow stripes enter at f225 (the bar divided: 100x20 px top stripe and 100x20 px bar), f227 stripes become a square block (118 px), f229 "A" in the lower bar, f231 coin pops in the square (the block becomes a ring of yellow), text types "A penny to get in." f231-f253.
- Card B (f553-594, "Nobody thought twice about it."): pale paper, the barred door of the cell visible at 12 %, text in **plain black Garamond ~3.5 % W without a bar** (smaller than elsewhere: 38 px): "Nobody" (f556) -> "Nobody thought" -> "twice about it." replaced at f577. This is the quiet beat: the picture empties while the voice says what nobody did.
- Card C (f1089-1140, years): pale card (#E9E9E6), hospital elevation ghosted at 12 %, no bar. "It took another" (f1089-1100, small, 30 px) -> **year counter** f1101-1124: big numeral (**~7 % W, 76 px, Garamond semibold, black #222**) rolling from 1814 to 1852 (sampled every 3 f: 1816, 1819, 1827, 1830, 1838, 1841, 1848, 1852), stops at 1852 on f1122 (46.04 s) -> "years" (small, 24 px) appears under it at f1125. The counter finishes ~0.25 s before the voice says "38 years" (46.30-47.16).
- Cards use 4-8 frame holds between changes.

### 6.4 Page peel (f1139-1146, t 47.42-47.62)
- At f1139 the right edge of the card shows a dark diagonal sliver (the cover edge) at x 85-100 %; f1141 the **yellowed cover page sweeps in from lower-right to upper-left as a diagonal wipe with a curled corner** (the paper curls back showing its reverse, light cream triangle at the fold at f1143), fully covering by f1147. 8 frames, ease-in-out. The cover is then pulled back (scale 1.5 -> 1.0 by f1209) and the stamp ("MEDICAL SOCIETY OF LONDON") sits upper-right.
- The film ends on the report cover; the last caption "without oversight." clears at f1205. There is no outro card/logo.

---

## 7. Sound (section 8 of the brief)

Measured with ffmpeg ebur128 + FFT band energy (22.05 kHz mono mix, 23 ms windows). Voice and music cannot be separated cleanly (no stems).

- Loudness: **-14.2 LUFS integrated**, LRA 1.9 LU, true peak -1.2 dBFS. Voice RMS (mid) per 2 s: -15 to -18 dBFS; the entire track is heavily limited, nothing sticks out.
- Voice: continuous narration, 146 words in 50.2 s, first word at 0.02 s, last word ends 50.20 s. **No pause >= 0.3 s anywhere**; the longest gaps are 0.25 s (46.94-47.19 s after "years", before "Bethlehem", and the tail 50.11-50.36 s). Several 0.08-0.12 s breaths.
- Music bed: a low, wide-stereo ambient/drone, not a tune. Evidence: side-channel (L-R) energy stays at -22 to -28 dBFS (mid is -16) from 0 to 45.5 s, with side-channel spectral peaks at 70-100 Hz (D2-G2 range) and 127/164 Hz: a **dark pad / bowed-bass drone**, minor/ambiguous, no drums. Tempo: weak autocorrelation at 0.743 s (81 BPM) and 0.372 s (161 BPM); not an audible grid. Cuts are not on a grid (intervals 0.3-2.9 s), editing is voice-driven.
- Music bed ends: side-channel level falls from -25 dB to **-42 dB between 45.5 and 46.0 s** and stays at -37 to -42 dB until 49.4 s: the bed ducks/stops under "It took another 38 years ... before Bethlehem lost the right ..." (the years card and the page peel are almost voice-only); a short swell/hit at 49.5 s (side -22 dB, the sting under "oversight.").
- SFX (band change at each cut, window -0.05..+0.2 s vs -0.5..-0.1 s; sub = 30-110 Hz, mid = 110-500 Hz, hi = 4-10 kHz). Only sounds with change >= +9 dB are listed as probable; weaker is "undetectable under voice". Because voice is continuous, expect most SFX to be quiet "foley":

| Time | Frame | Sound (guess) | Evidence |
|---|---|---|---|
| 1.50 | f37 | low swoosh as men rise | sub +12, hi +6 |
| 4.00 | f97 | soft low thud at first crop-hop | sub +7 |
| 5.42 | f131 | tonal hit under the title | mid +7, sub +5 |
| 9.33 | f225 | quiet impact into the coin card | sub +3 (weak) |
| 10.67 | f257 | mid thump | mid +7 |
| 16.83 | f405 | click + short chord (violin enters) | mid +11, hi +9 |
| 24.75 | f595 | low drum / chain hit into "Inside," | mid +12, sub +7 |
| 27.00 | f649 | mid thud | mid +9 |
| 27.67 | f665 | click (bowl lands) | hi +8, sub +5 |
| 34.25 | f823 | bright whoosh (fast push into the face) | hi +16 |
| 35.00 | f841 | chain/low clank (shackle) | sub +10 |
| 40.67 | f977 | paper rustle | mid +6, hi +5 |
| 41.75 | f1003 | mid thud | mid +9 |
| 43.83 | f1053 | low hit | sub +9 |
| 45.33 | f1089 | mid pulse as the card opens | mid +11 |
| 47.5 | f1141 | page peel, paper slide | hi -7 (hidden by voice); not measurable |

Whooshes at the other cuts (f89, f159, f325, f707 ...) did not show in the bands: either absent or masked by speech. Low-flux transients (sub) at 4.04, 11.08, 14.35, 18.04, 25.61, 29.19, 30.23, 32.39, 34.95, 36.66, 39.13, 41.77 s; high-band transients at 6.18, 7.15, 8.48, 13.35, 15.79, 22.29, 24.43, 26.24, 27.52, 28.33, 29.33, 35.90, 37.99, 43.54, 45.40 s (these are mostly sibilants in the voice). No typing, no tick, no clock, no stamp sounds detected (the caption typing is silent or buried).
Clone advice: bed at -26 dB under voice (peaks -14 LUFS after limiting), a drone, 4-6 soft thuds/clicks timed to hard cuts at -18 dB, one paper-peel at 47.5 s, bed out under the final line.

---

## 8. Script and narration (section 9 of the brief)

Total 146 words, 50.2 s => **2.91 words/s average** (maximum 3.80 w/s on the consequence line). Voice f0 median ~150 Hz (10th-90th percentile 76-190 Hz by autocorrelation, octave errors possible; gender not determined by measurement; the delivery is steady and documentary). Level is flat (-16.4 to -18.3 dBFS RMS per beat, final beat 1.5 dB quieter).

### 8.1 Beats

| Beat | Time | Words | w/s | Text | Function |
|---|---|---|---|---|---|
| Hook | 0.02-5.44 | 15 | 2.76 | **In 1800s London, people queued up on weekends to watch mental patients like zoo animals.** | shock claim: a date, a place, a crowd, an image ("zoo animals") |
| Setup | 5.44-10.60 | 15 | 2.91 | Bethlehem Royal Hospital, London's only asylum for the mentally ill, a penny to get in. | name the place; the price |
| Spectacle (escalation) | 10.60-23.22 | 33 | 2.61 | On Christmas and Easter, the queues stretched around the block, prostitutes and food merchants set up inside the wards. Patients who were particularly entertaining became minor celebrities. People came specifically to see them. | festival crowds; commerce; "celebrities" (the cruel irony) |
| Turn | 23.22-24.64 | 5 | 3.52 | Nobody thought twice about it. | quiet beat; the moral hinge; picture goes blank |
| Horror | 24.64-28.33 | 8 | 2.17 | Inside, patients were chained to walls, beaten, starved. | three-beat list, one picture each; slowest delivery |
| Reveal | 28.33-37.68 | 29 | 3.10 | It all changed when investigators walked in and found James Norris, an American sailor who had been locked in a metal harness bolted to a wall for 12 years. | the name, the object, the number |
| Consequence | 37.68-45.32 | 27 | 3.53 | The images went across every newspaper in Britain. The public was horrified, the same public that had been paying a penny to walk past him for years. | irony callback to the penny (setup) |
| Close | 45.32-50.20 | 14 | 2.87 | It took another 38 years before Bethlehem lost the right to operate without oversight. | anticlimax: slow justice; ends on a bureaucratic fact |

### 8.2 Sentences (length / rate)

| Sentence | Time | Words | Duration | w/s |
|---|---|---|---|---|
| 1 hook | 0.02-5.44 | 15 | 5.42 | 2.77 |
| 2 setup | 5.44-10.60 | 15 | 5.16 | 2.91 |
| 3 queues | 10.60-16.80 | 19 | 6.20 | 3.06 |
| 4 celebrities | 16.80-20.96 | 8 | 4.16 | 1.92 (slowest: it lingers on "particularly entertaining") |
| 5 see them | 20.96-23.22 | 6 | 2.26 | 2.65 |
| 6 nobody | 23.22-24.64 | 5 | 1.42 | 3.52 |
| 7 list | 24.64-28.32 | 8 | 3.68 | 2.17 |
| 8 reveal | 28.34-37.68 | 29 | 9.34 | 3.10 |
| 9 newspapers | 37.68-40.32 | 8 | 2.64 | 3.03 |
| 10 public | 40.32-45.32 | 19 | 5.00 | 3.80 (fastest: it rushes toward "for years") |
| 11 close | 45.32-50.20 | 14 | 4.88 | 2.87 |

Sentence length pattern: long, long, long, short-slow (8 w), short (6), **very short (5)**, short list (8), long (29), short (8), long (19), medium (14). Rule: the shortest sentences carry the moral turns ("Nobody thought twice about it."; "Inside, patients were chained to walls, beaten, starved."). Each beat stays one sentence except the spectacle (three).

### 8.3 Pauses and delivery
- **No pause >= 0.3 s** in the whole read (longest 0.25 s at 46.94 s). The rhythm comes from the cuts and from the lengthened sentence-final words, not from silence. Words are stretched at sentence ends: "animals." 0.71 s (4.73-5.44), "Hospital," 0.53, "celebrities." 1.06 s (19.90-20.96, the longest word), "them." 0.50, "starved." 0.77 (27.55-28.32), "years." 0.64 (37.04-37.68) and 0.61 (44.71-45.32), "oversight." 0.76. Final words ending a beat are ~2x the average word duration (0.32 s).
- Emphasis words (slowed, stressed): "queued" "zoo animals" "penny" "celebrities" "particularly entertaining" "specifically" "chained" "beaten" "starved" "12 years" "same public" "38 years" "oversight". Numbers are stressed hardest ("12" 0.44 s for 2 characters; "38" 0.45 s, 0.225 s/char vs 0.07 average).
- Pace curve: 2.8 -> 2.9 -> 2.6 (hook/setup/spectacle), accelerates to 3.5 on "Nobody thought twice about it", **drops to 2.2 for the three horror words**, rises again to 3.1-3.8 through the reveal and the irony, settles to 2.9 for the close. Slow-down = emotional weight; speed-up = momentum into the next fact.
- Pitch (f0 percentile 90): 198 Hz hook, 172 setup, 232 spectacle (the peak, at "minor celebrities"), 173 turn, 168 horror (flat, grave), 180 reveal, 186 consequence, 198 close (rising final).

### 8.4 How the hook works (first 3 s)
1. 0.02 s: the first word is the year ("In 1800s London,") so the viewer places the story in time and space in 1.4 s.
2. 1.44-3.34: "people queued up on weekends to watch": an ordinary, almost pleasant activity (queue, weekends) with the people drawn as smart gentlemen in top hats, then tinted yellow on "to watch", the verb the film is about.
3. 3.34 (f89 cut, 3.67 s): "mental patients like zoo animals": the shocking object arrives last; the picture jumps from the top-hat gentlemen (viewers) to the Hogarth plate (the viewed) in the same beat as the word "mental", and the crop-hops (4 per second) mimic the gaze moving across cages. **The payoff word "zoo animals." lands at 5.4 s at the end of the hook**, so the hook is 5.4 s, not 3 s; the first 3 s promise "something weird happened in London" and hold the answer back. The frame-1 empty yellow bar waits for text: an open slot.
4. No music hit, no title card: the hook is a plain sentence with one tinted verb group.

### 8.5 Line-to-picture mapping (literal L / metaphor M / irony I)

| Words (time) | Picture | Type |
|---|---|---|
| In 1800s London (0.02-1.44) | Houses of Parliament plate | L (place signifier) |
| people queued up on weekends to watch (1.44-3.34) | row of top-hatted men, coats tint yellow on "watch" | L, with the tint = the gaze |
| mental patients like zoo animals (3.34-5.44) | Hogarth Bedlam plate crops | L (period source) |
| Bethlehem Royal Hospital (5.44-6.70) | hospital elevation + giant title | L |
| London's only asylum for the mentally ill (6.70-9.44) | text wall of the upcoming script | M (the words as a building / the "ward" of text) |
| a penny to get in (9.44-10.60) | coin in yellow ring | L |
| On Christmas and Easter (10.60-11.80) | snowy Big Ben + holly wreath | L |
| the queues stretched around the block (11.80-13.54) | crowd close, pan | L |
| prostitutes (13.54-14.32) | Regency couple with a dandy | L (coded, period caricature) |
| food merchants (14.32-15.20) | yoke with pails, then basket woman | L |
| patients who were particularly entertaining (16.80-19.08) | portrait man, jester in a cone, fiddler with a violin | L (the "entertainers") |
| became minor celebrities (19.08-20.96) | fiddler | I (he is a performer) |
| People came specifically to see them (20.96-23.22) | crowd of onlookers, focus pull | L |
| Nobody thought twice about it (23.22-24.64) | empty card with a barred door | M (absence) |
| chained to walls / beaten / starved (24.64-28.32) | harness patient / beaten woman / empty bowl | L, one object per word (yellow harness, yellow bowl) |
| investigators walked in and found (29.44-31.61) | two policemen | L (Victorian constables as "investigators") |
| James Norris, an American sailor (31.61-33.64) | Norris wide with a yellow circle on the face | L + highlight |
| locked in a metal harness bolted to a wall for 12 years (34.21-37.68) | face close-up, ankle shackle, chain to pole | L, three zoom steps |
| The images went across every newspaper in Britain (37.68-40.32) | engraved newspaper page with the Norris portrait | L |
| The public was horrified (40.32-41.68) | crowd with a yellow newspaper | L |
| the same public that had been paying a penny to walk past him (41.68-44.49) | top-hatted men with St Paul's, Norris again at "past him" | I (the men are the same kind of men as in the hook) |
| It took another 38 years (45.32-47.16) | card with the year counter 1814 -> 1852 | M (a number animating) |
| before Bethlehem lost the right to operate without oversight (47.44-50.20) | official report cover, stamp, peel | L (document as proof) |

The film keeps a "callback structure": top-hatted men (hook, 1.5 s) return at 41.75 s; the penny (10.6 s) returns at 43.2 s; Norris's face (31.6 s) returns at 43.83 s.

---

## 9. Picture list (section 10 of the brief)

Every distinct picture, with a suggested public-domain search phrase. All are 18th-19th century engravings, fashion plates or photographs; replace with your own composites (cut-outs on a plate). Owner rule: PD/CC0 only; `license=cc0,pdm` on Openverse.

| # | Used (frames) | Description (measured / read) | Suggested search phrase and source |
|---|---|---|---|
| P1 | f5-88 | Palace of Westminster, Victoria Tower, 1860s photograph / halftone, bright sky | "Houses of Parliament Victoria Tower 1860 photograph" - Wellcome Collection, Rijksmuseum, Wikimedia Commons PD |
| P2 | f37-88 | Row of 5 Victorian men in top hats, frock coats, cut out (fashion-plate style) | "gentleman fashion plate 1840 frock coat top hat" - Met Open Access, NYPL Digital, Rijksmuseum |
| P3 | f89-130 | Hogarth, "A Rake's Progress, plate 8, Bedlam": patients, window, woman with fan, fiddler | "Hogarth Rake's Progress Bedlam engraving" - Met, Rijksmuseum, Wellcome |
| P4 | f131-158, f1089 ghost | Bethlem Hospital Moorfields, front elevation and wide prospect with hedges, 18th-century engraving | "Bethlem Hospital Moorfields engraving 1750" - Wellcome Collection, Old Book Illustrations |
| P5 | f225-256 | Copper penny with Britannia (obverse), brown bronze, round | "1797 cartwheel penny" / "George III penny" - British Museum, Met, Openverse cc0 |
| P6 | f257-288 | Snowy Westminster, Big Ben tower, a crowd of top hats, Victorian winter engraving | "Doré London Westminster snow" - Gustave Doré "London: A Pilgrimage", Old Book Illustrations; "Illustrated London News Christmas 1860" |
| P7 | f289-324 | Close crop of the crowd: lamp post, holly wreath, men in coats | same plate as P6 (crop) or "Victorian street crowd lamp post engraving" |
| P8 | f325-354 | Regency couple, woman in a bonnet and a dandy with a top hat, white ground | "Regency fashion plate 1815 couple promenade" / "Cruikshank Tom and Jerry street" - Wellcome, Met |
| P9 | f355-368 | Street vendor woman with a shoulder yoke and two pails, ornate building behind | "Cries of London woman with yoke pails" - Rowlandson / Wheatley "Cries of London", Wellcome, Met |
| P10 | f371-404 | Woman with a wicker basket, palms and neoclassical building | "Cries of London basket seller" (same series) |
| P11 | f405-416 | Bald man with a ruff, hands clasped, in a vaulted room | "Hogarth Bedlam man with ruff" or "17th century portrait sitting man ruff engraving" |
| P12 | f417-436 | Jester / patient with paper cone hat marked with crosses, broom | "Hogarth Bedlam fool cone hat" (crop of P3) |
| P13 | f437-494 | Fiddler with newspaper hat, bare chest, patched breeches; violin cut out separately | "Hogarth Bedlam violinist" (crop of P3); "violin engraving 18th century" for the cut-out |
| P14 | f495-552 | Crowd of onlookers seen from behind, women in mob caps and men in hats, in front of a cell wall | "Rowlandson visiting Bedlam" / "Cruikshank visitors at Bedlam" - Wellcome Collection |
| P15 | f553-594 | Barred cell door in a stone wall (ghosted) | "Bethlem cell door engraving" / "prison door barred window engraving" - Wellcome |
| P16 | f595-648 | Seated patient in a turban with iron harness over a ward bed | "Bethlem patient iron harness engraving" - Wellcome (William Norris or "man chained at Bethlem 1814") |
| P17 | f649-664 | Women, one cradling another's head (the beaten) | "Bethlem ward women engraving 1815" (Wellcome) or Hogarth Bedlam woman detail |
| P18 | f665-706 | Patient bust, bowl on the ground (bowl cut out separately) | same plate as P16 (crop) and "bowl engraving" |
| P19 | f707-758 | Two Victorian police constables with a lantern, notebook and light beam | "Victorian police constable engraving Illustrated London News" / "Punch policeman" |
| P20 | f759-920, f1053-1088 | James Norris, seated, bandaged, iron collar and chain to a post, ankle shackle, 1814 | "James Norris Bethlem engraving 1814" - Wellcome Collection (George Arnald, "Portrait of William Norris") |
| P21 | f921-976 | Newspaper page "Portrait of William Norris" with the engraving inside the columns | "Portrait of William Norris newspaper 1815" - Wellcome / British Library |
| P22 | f977-1002 | Crowd of top-hatted men holding a newspaper sheet under a street lamp | "Victorian street newspaper readers engraving" - Old Book Illustrations; the held sheet = P21 skewed |
| P23 | f1003-1052 | Men with top hats, St Paul's Cathedral behind (cut-out line-ups) | "fashion plate 1840s St Paul's" / "Victorian gentlemen St Paul's Cathedral engraving" |
| P24 | f1141-1209 | Cover/title page: "Observations of the Governors ... Report of the Commissioners in Lunacy to the Secretary of State on Bethlem Hospital, 1852", yellowed paper, round stamp "Medical Society of London" | "Report Commissioners in Lunacy Bethlem Hospital 1852 title page" - Wellcome Collection, Internet Archive |
| P25 | all | Paper textures: pale mottled card (#DBDBD7), grey card (#C9C9C6), grain noise | Texturelabs "paper", ambientCG "Paper" (CC0) |

---

## 10. Hardest to clone (tell the crew)

1. **Cadence**: the stepped 12-17 fps cadence with grain stepping at the same rate (header).
2. **Typewriter in a persistent yellow bar** that waits empty, then types 2 chars per 2 f, position locked at y = 50 %.
3. **Gradient-map tint on a single cut-out the voice names**, per-element ramps (men), draw-ons (shackle, harness), growing circle (face).
4. **Picture changes on the noun**: 12 cuts land within 3 frames of the noun's first syllable; cut to word sync is the main craft.
5. **The text wall**: nine scrolling lines of the upcoming script with a white live line synced to the voice.
6. **Year counter** and the **page peel** into a real scanned cover.
7. **Audio**: bed ducks out under the last 4 s; no pause in the read.

## 11. Not measured / open

- Exact voice gender; the music's key and instruments (no stems; recommend `demucs`).
- Sub-frame easing curves (twos stepping hides them); parallax speeds are visual (`~`).
- Whether the caption bar width animates inside a phrase (appears fixed per phrase, see 2.1).
- Whisper word timings are model-derived (no forced alignment), and show no gaps between words, so pauses < 0.25 s are not resolved from `words.json`; they were taken from the audio envelope.
- Picture attributions (Hogarth, Cries of London, Doré, Arnald) are by visual identification; verify on the object's page before use.
