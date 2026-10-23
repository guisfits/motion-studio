# Technique catalogue — professional practice for the Remotion demos

Phase-1 research (2026-10-23): what professionals do per technique, with parameters at 30 fps, example videos, and what each demo must show. Every parameter carries a source URL or is marked house default ([H]). Example timestamps marked "verify"/"scrub" are unwatched.

**Baseline:** every demo is also held to the 10/10 Luther film, `research/baseline-arrependei-vos.md` (§3 per task). Where the catalogue (outside practice) and the baseline (our approved film) disagree, the baseline wins for look and feel; the catalogue fills what the film never used. The film is 9:16: carry over ratios, seconds, fps and spring constants, not pixels.

| # | Technique | Plan task | Baseline (baseline-arrependei-vos.md §3) |
|---|---|---|---|
| 1 | Camera travelling over a 2D world | 6 | Task 6 - camera |
| 2 | 2.5D multiplane parallax | 7 | Task 7 - parallax |
| — | Cutting and editing rhythm | 6, 10 | joins (Task 10) + pacing (row 27) |
| 3 | Voice-timed kinetic type | 9 | Task 9 - kinetic type + captions |
| 9 | Word timings and captions | 9 | Task 9 (no running captions in the film) |
| 4 | Diagrams and maps | 12 | Task 12 - diagrams |
| 5 | Paper motion | 8 | Task 8 - paper set-down / tape / tear |
| 6 | Transitions | 10 | Task 10 - transitions / joins |
| 7 | Texture and post | 11 | Task 11 - texture / grain |
| 11 | Cut-out puppet rig | 13 | Task 13 - puppet |
| 10 | Simple 3D object | 14 | Task 14 - 3D |
| 13 | Organic FX | 15 | Task 15 - organic FX |
| 8 | Sound design and mix | 16 | Task 16 - sound + mix |

## Catalogue: camera travel, 2.5D parallax, cutting rhythm

Scope: Remotion, 1920x1080, 30 fps. One 10-20 s demo per technique. Tags: [S: url] = sourced; [HD] = house default (our own starting value, tune by eye); [L: file] = local research, itself sourced there.
Honesty note: web sources gave principles, few numbers. Most frame counts below are [HD] derived from sourced principles. Example timestamps marked (verify) were not watched by this pass; scan before use.

Shared sources
- S1 https://www.premiumbeat.com/blog/replicating-vox-motion-graphic/ (Vox camera pull-back: 3D layers + camera, EasyEase, curve midpoint peaks on the edit point, blur much shorter than the move)
- S2 https://en.wikipedia.org/wiki/Multiplane_camera (up to 7 glass layers; "further from camera = slower"; opposite-direction layers create rotation)
- S3 https://www.remotion.dev/docs/spring (defaults mass 1, damping 10, stiffness 100, overshootClamping false; more damping = less bounce)
- S4 https://studiobinder.com/blog/walter-murch-rule-of-six (emotion > story > rhythm > eye trace > 2D plane > 3D space; sacrifice from the bottom)
- S5 https://www.lynda.com/After-Effects-tutorials/Use-3D-layers-multiplane-parallax/2876198/3133006-4.html (3D layers + camera for multiplane parallax)
- S6 https://nofilmschool.com/2017/10/editing-101-what-are-j-and-l-cuts-and-why-should-you-be-using-them (J/L = split edits; audio and picture change at different times)
- S7 https://origin-www.lynda.com/Photoshop-tutorials/Modifying-camera-paths/2810404/2235217-4.html (linear camera path -> ease out + ease in reads natural)
- L1 research/craft.md  L2 research/editing-grammar.md  L3 research/moran-cuts-zoom.md  L4 tutorials/zhylin-five-vox-tricks.md

---

### 1. Camera travelling over a 2D world

#### What pros do
- One parent camera (a single null / one transform on a "world" div) moves; art layers never move individually for the travel. Moran: move animated "on that null, not on each layer" [L: L3 Z1]. In Remotion: one `<World>` with `transform: translate() scale()` driven by one interpolated pose.
- Move between regions with a pull-out then push-in (zoom out to show the map, in to the target) instead of a straight pan, when regions are far apart: the wide beat tells the viewer where they are. Pull-out median 0.87, 115/165 reference pieces pull to <= 0.8 at least once [L: L2 section 5].
- Ease so the speed peak lands on the middle of the move (or on the edit point for a hidden cut); short blur only around the peak, "a lot shorter than the camera move" [S: S1].
- Calm explainers use long smooth bells (1-2 s); excitement uses spike curves. Do not mix in one film [L: L3 Z2/Z3].
- Never leave the table dead: 1-3% drift on holds; a dead 8 s hold is a named defect [L: L2 section 5].
- Move rides the narration: arrive on the noun, 0-3 frames before, never after [L: L1 2.x].

#### Parameters
| Item | Value | Source |
|---|---|---|
| Region-to-region travel (calm) | 45-60 frames (1.5-2.0 s) | Moran "1-2 s" [L: L3 Z2]; frames [HD] |
| Region-to-region travel (punchy) | 18-30 frames (0.6-1.0 s) | Moran spike ~1 s [L: L3 C6]; frames [HD] |
| Standard move curve | cubic-bezier(0.4, 0, 0.2, 1) (AE ~40% out / 80% in) | [L: L1 2.1], derived from Material motion |
| Punch/settle curve | cubic-bezier(0, 0, 0.2, 1); sharper (0.05, 0.7, 0.1, 1) | [L: L1 2.1] |
| Long bell (calm travel) | cubic-bezier(0.65, 0, 0.35, 1) (easeInOutCubic) | house default [HD]; S7 supports ease-out + ease-in |
| Spring alternative | damping 200 (no bounce) for travel; default 10 is bouncy, never for the camera | S3 for the knobs; value [HD] |
| Camera overshoot | 0% (maps, documents, a table settle without bounce) | [L: L1 2.2] |
| Push-in on a region | scale 1.0 -> 1.15 beat; 1.35-1.6 punch-in; 2.0+ single object | [L: L1 2.1] |
| Reference push-in | median 1.14 (1.05-1.48), shot 1.4 s | [L: L2 section 5] |
| Pull-out | 0.87 median; to 0.8-0.5 for a reveal | [L: L2 section 5] |
| Drift on hold | +4-8% scale over the shot, or 1-3% pan | [L: L3 Z4, recipes 4-8%] |
| Stacked-key trick | camera stage 0.4-0.5 s apart if one key is too snappy | [L: L3 Z2] |
| Blur on a fast move | 0 -> 4-6 px -> 0 over 12-18 frames, shorter than the move | S1; Moran Z8 [L: L3] |
| Hold on arrival | >= 20 frames (0.67 s) before the next move; reading plate 1.5-3 s | [HD]; [L: L1 captions 20 f] |
| Move direction across a cut | keep the vector (never right-drift into left-drift) | [L: L3 C5] |

#### Example videos
- Vox Borders, "How this border transformed a subcontinent" https://www.youtube.com/watch?v=r5Ps1TZXAN8 - map zooms from continent to border; scan the first 2 min (verify).
- Vox, "How we got to 10 million subs" https://www.youtube.com/watch?v=axSh2T0uzYY - timeline/table moves (verify).
- Vox camera pull-back transition, replicated at 0:14 of the Vox video cited in S1 (source gives the timestamp, not the URL of the video).
- Zhylin breakdown of Vox, 42-45 s: zooms, slides, match cuts "heavily used" (https://www.instagram.com/reel/Da8teWQSXqu/ [L: L4]).

#### What our demo must show
1. One table with at least 4 labelled regions; the camera visits 3 of them using only a single camera pose (check: no layer has its own position animation during travel).
2. At least one travel via pull-out then push-in, and one direct pan; the speed graph is bell-shaped (peak-to-mean speed > 1.5, no linear segment > 3 frames).
3. Zero overshoot on the camera; arrival eased, content stable for >= 20 frames before the next move.
4. Short blur (<= 12 frames) only at the peak of the longest move.
5. Holds are alive (1-3% drift), never frozen.

---

### 2. 2.5D multiplane parallax

#### What pros do
- Separate the picture into 3-7 planes (sky/far, mid, subject, foreground) and move one camera; closer planes shift more. Disney multiplane used up to seven glass planes; speed falls with distance [S: S2].
- In AE: 3D layers with real Z, a camera, small dolly or pan; a "single flat layer" Ken Burns does not read as depth [S: S5; L: L1 2.1].
- Add depth cues besides shift: foreground blur or soft shadow, atmospheric tint on far planes, a blurred foreground passer-by or cloud as a natural wipe (~0.25 s) [L: L2 section 5 "Layered parallax"].
- Opposite-direction motion of foreground vs background gives a rotating feel; use sparingly [S: S2].
- Keep it slow and subtle: Moran "slowly dolly or pan the camera so the planes shift" (x 683 -> 1102 over the shot) [L: L3 Z5]. Reference: three layers at zoom 1.09 [L: L2 `ee/DdI5hwFuoI6`].
- Cut-out grain: paper edges, shadows per plane that differ with lift (identical shadows = fail) [L: L1 table].

#### Parameters
| Item | Value | Source |
|---|---|---|
| Planes | 3-4 for a demo; max 7 | [L: L1 2.1] 3-4; S2 max 7 |
| Speed vs depth | shift proportional to 1/distance (twice as far = half the shift) | S2 principle; formula [HD] |
| Layer speed multipliers (4 planes) | far 0.3x, mid 0.6x, subject 1.0x, foreground 1.4-1.6x | far/mid/subject [L: L1 2.1]; foreground [HD] |
| Camera travel for parallax | pan 80-160 px at the subject plane, or dolly scale 1.00 -> 1.09 | [L: L2 1.09 zoom]; px [HD] |
| Duration | 90-150 frames (3-5 s) for a visible but calm shift | [HD]; Moran "slow" |
| Easing | cubic-bezier(0.4, 0, 0.2, 1) or easeInOutSine-like; no bounce | [L: L1 2.1], [HD] |
| Perspective model | Z-depth + scale compensation: `scale = zRef / z`, translate = camera.x * (1 - 1/depth) [HD]; or Remotion `perspective` CSS on parent with translateZ |  S5 for concept; code [HD] |
| Foreground blur | 2-4 px on plane >= 1.4x; far plane tint +10% haze | [HD]; blur framing seen `ee/Dbp5HyyOmsR` [L: L2] |
| Foreground wipe pass | cloud/passer-by crossing in ~7-8 frames (0.25 s) | [L: L2 `hex/DbC_1tFCI3K`] |
| Overlap/edge safety | each plane oversized by max shift + 5% so no edge shows | [HD] |

#### Example videos
- Disney, The Old Mill (1937) multiplane test (S2 names it; search YouTube for the clip, verify).
- Vox/Netflix "Explained" trailer https://www.youtube.com/watch?v=LtCZJI_6np8 (24 s, scan for layered cut-outs; verify).
- Moran DZsDDmvtNJP 0:31-0:37, parallax on separated planes [L: L3 Z5].
- Reference pieces in L2: `ee/DdI5hwFuoI6` (3 layers, zoom 1.09), `hex/DakK_n7igAJ` (two-speed clouds), `hex/DZ1_nI7iEd8` (clouds in front and behind).

#### What our demo must show
1. At least 4 planes with distinct measured speeds; far/near speed ratio >= 3 (check by tracking two features across frames).
2. Depth is readable without the move: scale ordering, one blur or haze cue, and per-plane shadow differing.
3. Camera move is slow (>= 90 frames) and eased; no plane edge ever visible.
4. A still frame of the first and last frame side-by-side shows relative displacement of near vs far (mid planes in between, monotonic).
5. One optional counter-direction moment or foreground pass, clearly not the default.

---

### 3. Cutting and editing rhythm (cut length, J/L, match, cut vs move)

#### What pros do
- Cut on the sentence; picture changes where the voice names the new thing. Reference collage explainers: one edit event per ~3.5 words (2.1-5.5), shot median 0.75 s, narration ~3 words/s [L: L2 section 1].
- Burst then hold: a run of 0.13-0.5 s flicks resolves in one 2-6 s hold on the point; ending slows to 0.53x the body rate [L: L2].
- Hook is in the line and picture, not faster cutting: first 3 s cut at body rate [L: L2].
- Calm teaching registers cut every 3-6 s and let the edit be seen; avoid jarring still-frame cuts and direction reversals [L: L3 section 1].
- Cut on motion: cut at the fastest point of the move; both shots share direction [L: L3 C1-C5; Moran DaDhDFjAysT].
- Murch's order: emotion > story > rhythm > eye trace > screen plane > 3D space; give up the lower items first [S: S4]. Use as the review checklist.
- J/L cuts (split edits): audio of the next shot starts before its picture (J) or the previous audio runs over the new picture (L); editors prefer them to dissolves for continuity [S: S6]. In our films: the VO phrase is the audio spine, so the picture change should lead or trail the voice by a few frames, not sit exactly on it.
- Match cut on shape (circle, prop) with the shape centred +-5% [L: L1 2.1; L2 section 6].
- Move or cut? Move the camera when the next idea is in the same space (a region on the same table); cut when the idea is a new space or time; use match cut or paper wipe between scenes [L: L2 "Hard cut on the sentence" crew note].
- Dissolve = time passing; reserve one long dissolve for the payoff [L: L2 section 6].

#### Parameters
| Item | Value | Source |
|---|---|---|
| Phrase-locked cut rate | 1 edit / 3.5 words; ~0.85 events/s at 3 wps | [L: L2 section 1] |
| Shot length, fast explainer | median 0.75 s (22 frames); range 0.17-2.4 s | [L: L2] |
| Shot length, calm instructive | 3-6 s (90-180 frames) | [L: L3 section 1] |
| Burst flick | 4-15 frames; then hold 60-180 frames | [L: L2 0.13 s + 2-6 s holds] |
| Longest shot per piece | ~4.6 s (138 frames) | [L: L2] |
| Last 5 s | 0.53x body cut rate | [L: L2] |
| Picture arrival vs word | 0 to -3 frames (never late) | [L: L1 2.7] |
| J/L offset (picture vs voice) | picture leads voice by 3-6 frames (0.1-0.2 s) for a J feel; trails by 6-12 frames for an L tail | principle S6; frames [HD] |
| Flash frame over cut | 2-4 frames white/glow; singly | [L: L2 section 6] |
| Smear frame on swap | 1-4 frames, new shot born settled | [L: L2 section 6] |
| Dissolve | 0.4-2.5 s (12-75 frames), rare; payoff 2.7 s | [L: L2 section 6] |
| Cut at peak | eased move, cut on frame of max speed | S1; [L: L3 C3] |
| Scene join (AdScriptura) | animated paper transition between scenes; hard cut only inside a scene | [L: L2 crew note 2026-10-19] |
| Caption/plate min read | >= 20 frames after full legibility | [L: L1 captions] |
| Overshoot on pop pieces | ~8-15% then settle 4-6 frames (light pieces only) | [L: L1 2.2; L2 `pin/349991`] |

#### Example videos
- Zhylin, 5 Vox tricks reel https://www.instagram.com/reel/Da8teWQSXqu/ : 71 cut events/62 s, burst at 45.5-47.9, ~1.7 s avg outside bursts [L: L4].
- Vox "How we got to 10 million subs" https://www.youtube.com/watch?v=axSh2T0uzYY (study cut rate; verify).
- Vox Earworm #6 https://www.youtube.com/watch?v=58nPEe-TU-w (music-led rhythm, verify).
- Moran DOb0h6VCSpM 0:02-0:24 cut on action, DaDhDFjAysT 0:09-0:22 cutting the curve [L: L3].
- Estelle Caswell on making Earworm https://www.youtube.com/watch?v=aPwi5rNKpMk (process, pacing talk).

#### What our demo must show
1. 15-20 s, 6-10 cuts with a visible rhythm map: fast phrase-locked cuts, one burst (>= 3 flicks) resolving into a >= 60-frame hold, slower last 5 s.
2. Every cut lands 0 to -3 frames from a spoken-word marker (use a placeholder VO/click track).
3. One J-style split (picture leads voice 3-6 frames) and one L-style trail, shown on a timeline strip.
4. One match cut (shape centred +-5%) and one camera move used instead of a cut for a same-space jump.
5. No cut on a dead still frame; no direction reversal across a cut.

---

### Open items for the caller
- Real numbers are scarce on the web: parallax depth ratios and J/L frame offsets are [HD]; confirm by A/B in the demos.
- Example timestamps marked (verify) need a viewing pass. A clip-level pass of the Vox Borders video (r5Ps1TZXAN8) would give true camera timings.
- Material easing page and easings.net did not return bezier values to the fetcher; values used come from craft.md.

## Catalogue: type, captions, diagrams (techniques 3, 9, 4)

Remotion, 30 fps, 1920x1080. Sources: local `research/craft.md` (cited as craft §), `tutorials/zhylin-five-vox-tricks.md`, web pages listed in each section. "house default" = our own number, not sourced. Frame counts @30 fps; craft.md numbers given @24 are converted.

Source key:
- [R1] https://www.remotion.dev/docs/text-highlights (rough-notation defaults, via craft §2.6)
- [R2] https://www.remotion.dev/docs/captions/create-tiktok-style-captions (fetched 2026-10-23)
- [R3] https://www.remotion.dev/docs/paths/evolve-path (fetched)
- [R4] https://www.remotion.dev/docs/paths/get-point-at-length (fetched)
- [N] https://partnerhelp.netflixstudios.com/hc/en-us/articles/215758617 (min 5/6 s, max 7 s, 2 lines)
- [B] https://clevercast.com/bbc-subtitling-guidelines (160-180 wpm, ~0.3 s/word floor, 68% frame width; third-party summary of BBC, not the BBC page itself)
- [M] https://md-subs.com/blog/tis1-reading-speed (short captions need more time; busy picture, caps, italics slow reading)
- [P] https://www.premiumbeat.com/blog/replicating-vox-motion-graphic/ (12 fps graphics, stepped mask reveals, ease peaks at the cut)
- [PM] https://www.premiumbeat.com/blog/animated-map-after-effects-video-tutorial (route = pen path + Trim Paths, start/end labels, camera)
- [AE] https://helpx.adobe.com/after-effects/desktop/animating-text/text-animation-examples/examples-resources-text-animation.html (range selector Offset animated from negative to 100% reveals characters/words)

Honesty notes: BBC's own page and Johnny Harris / Vox "how we make maps" breakdowns were not reachable; AE ease/frame numbers for text animators were not found in any source (marked house default). Example video timestamps below are only given where we measured them locally; others are "unverified, scrub to find".

---

### 3. Voice-timed kinetic type (word reveal, highlighter, strike-through, ransom-note)

#### What pros do
- One idea per card, words arrive on the spoken word, not before the sentence starts. Zhylin/Vox chapter cards: "visualize" then "EVERYTHING" builds, one word per ~0.5 s with a tick per word (local zhylin 4-5.5 s).
- Emphasis is a single device per film: one colour or one weight (craft §2.5). Highlighter = one word, the claim-carrying one (craft §2.6).
- Words reveal with a stepped, slightly jagged mask or a short pop (not a slow fade); paper/collage films run type on twos (12 poses/s) to match the cut-out feel [P].
- Highlighter sits behind the text, offset slightly low, left-to-right, hand-wobble; strike-through draws over the word, then the replacement word arrives at an offset (the "correction" beat).
- Ransom-note letters: each letter its own cut-out tile (varied font, size, paper, rotation +/-6 deg, shared baseline jitter), popped in 1-2 frames apart so it reads as typed-by-hand, not as a wave.
- Text is timed from the waveform/word timestamps, never from the timeline grid (craft §2.7, sync [17] in craft sources).

#### Parameters
| Parameter | Value | Source |
|---|---|---|
| Arrival (end of entrance ease) vs spoken word onset | 0 to -3 frames (early OK, late not) | craft §2.7 (own) |
| Word entrance length | 6-9 frames (200-300 ms); under 6 frames reads as flicker | craft §2.3 conversion of NN/g hint; house default |
| Entrance easing | out-cubic / `bezier(0.05,0.7,0.1,1)`; overshoot 8-10% only for light "sticker" type | craft sources (Material emphasized, secondary); house default |
| Stagger between words in a phrase | 2-4 frames, or the actual word-timestamp gap if voice-timed | craft §2.3 |
| Total reveal of a phrase | <= 60% of the phrase duration | craft §2.5 (own) |
| Chapter-card word cadence | 15 frames (0.5 s) per word | local zhylin tutorial 4-5.5 s (measured) |
| Highlighter sweep (library default) | 25 frames (0.83 s); alpha ~0.6; padding ~20 px | [R1] |
| Highlighter sweep (narrated emphasis) | 9-18 frames (0.3-0.6 s), start ~3 frames before the word, finish as the word ends | craft §2.6 (own) |
| Underline / strike-through draw | 21 frames library default; narrated 8-15 frames; stroke 12-14 px at 1080p, 3 passes | [R1] + craft §2.6 |
| Annotation removal | fade/clear within <= 8 frames before the next caption lands | craft §2.6 |
| Active annotations at once | max 1 per second | craft §2.6 |
| Ransom letter stagger | 1-2 frames per letter, rotation +/-6 deg, scale 0.9-1.15 | house default |
| Stepped (on twos) look for the reveal mask | render mask progress held for 2 frames | [P] + house default |
| Font size: card word | 160-260 px (cap height ~8-14% of 1080) | house default |
| Font size: inline emphasised word in a sentence | 1.15-1.3x the body size | house default |
| Body caption cap-height | >= 4% of frame height (>= 43 px at 1080; craft's "77 px" is for 1920 tall) | craft §2.5 |

#### Example videos
- Zhylin "five Vox tricks" reel https://www.instagram.com/reel/Da8teWQSXqu/ : 4-5.5 s "visualize / EVERYTHING" word build with tick; 15-18 s "use / motion design / to explain / IDEAS"; 26-28 s "Constant / Motion" (all measured, local note).
- Vox "Earworm" / explainer end cards: three-word type cards on dark textured ground (local vox-design-practice §Earworm; video IDs in that file, e.g. https://www.youtube.com/watch?v=axSh2T0uzYY, unverified which ID, scrub to the last 20 s).
- Remotion highlight demo https://www.remotion.dev/docs/text-highlights : reference for the rough-notation sweep.
- Adobe range-selector reference [AE]: how a per-character/word reveal is built in AE (concept for the ransom/stagger).

#### What our demo must show
1. A 12-15 word sentence, each word arriving within 0 to -3 frames of its timestamp; show the timestamp overlay in debug mode.
2. One highlighter sweep of 9-18 frames on the keyword, behind the text, finishing with the word; then a strike-through on a second word and its replacement arriving 6-10 frames later.
3. A ransom-note word of 6+ letters with mixed paper tiles, 1-2 frame stagger, no letter outside the frame.
4. "misericórdia" (and "ressurreição") at card size: widest line <= 90% of frame width, accents not clipped by the mask/tile (auto-shrink font to fit), highlighter wraps the whole word.
5. Only one annotation active at any moment; reveal total <= 60% of phrase.

---

### 9. Word timings and captions (forced alignment to on-screen captions)

#### What pros do
- Word timings come from forced alignment of the *known script* to the narration (Whisper/whisper.cpp word timestamps or an aligner), then are snapped: each word `fromMs`/`toMs`, with a leading space per token so page breaks work [R2].
- Group words into short "pages" (2-5 words for social, up to 2 lines for long form); on a held picture the caption chunk is the motion, swapping every ~0.4-0.6 s (local editing-grammar §"Caption as the motion", measured: chunks 2-5 words, swaps 0.4-0.6 s).
- Active-word highlight inside the page (colour or plate) by comparing the frame time with token `fromMs`/`toMs` [R2].
- Fixed position (lower third) and constant style across the film; key word sometimes on a black plate (local zhylin note, captions 2-4 words, bold white sans, burned in).
- Respect reading speed: caps/italics/script and busy backgrounds need more time [M]; short chunks need an extra ~0.25 s [M + craft §2.5].
- Never place captions in platform UI zones on 9:16 (top ~250 px, bottom ~420 px at 1080x1920) (craft §2.5).

#### Parameters
| Parameter | Value | Source |
|---|---|---|
| Reading speed | 160-180 wpm = 0.33-0.375 s/word; floor ~0.3 s/word | [B] |
| Max CPS | 20 adult, 17 children; plan <= 15 over busy pictures | craft §2.5 (cites Netflix [N]-family guidance) |
| Chars per line | 42 (Netflix-style); BBC online = 68% of a 16:9 frame width (~38 chars) | craft §2.5, [B] |
| Max lines | 2 (1 line of 2-5 words for social) | [N], [B] |
| Min on-screen time | 5/6 s = 25 frames @30 (20 frames @24) | [N] |
| Max on-screen time | 7 s (aim <= 3 s per social chunk) | [N], craft §2.5 |
| 4-word caption | >= 1.2 s = 36 frames | [B] |
| Min gap between events | 1.5 s only for BBC speech pauses; for chunk swaps, no gap needed, cut hard or 2-frame crossfade | [B]; house default |
| Entrance / hold / exit | 6-10 / >= 24 (after full opacity) / 4-6 frames | craft §2.5 (own), converted |
| `combineTokensWithinMilliseconds` | no documented default; use 1200 ms for long form, 500-800 ms for social | [R2] (example 1200); house default |
| `breakOnSilenceAfterMilliseconds` | 0 = word-by-word pages; 300 ms for pause-aware breaks | [R2] |
| Highlight lag/lead vs audio | switch active token at `fromMs` minus 1-2 frames | house default (ear tolerates early, not late; craft §2.7) |
| Font size (long form, 1080p) | 54-64 px for 1-2 lines, cap-height >= 4% of height; social chunk 90-130 px | craft §2.5 + house default |
| Text box width | <= 68% of frame width (1306 px) long form; social <= 80% (1536 px) | [B], craft |
| Contrast | plate or >= 6 px outline on collage backgrounds | craft §2.5 |

#### Example videos
- Zhylin reel https://www.instagram.com/reel/Da8teWQSXqu/ : burned-in 2-4-word captions, every word, constant lower-third position, key word on black plate (local analysis, whole reel).
- Remotion TikTok-captions API page [R2]: reference implementation of pages/tokens (not a video).
- Netflix timed-text rules [N] and BBC summary [B]: reference for limits.
- Vox hex-register pieces in our `research/editing-grammar.md` (hex/DY_8VpvCpeO, hex/DbnDiSLCtax, hex/Dd0qOzpqoYf): measured 2-5-word chunks swapping every 0.4-0.6 s.

#### What our demo must show
1. Real forced-alignment JSON (Whisper words) feeding `createTikTokStyleCaptions`, with the active word highlighted at token start minus <= 2 frames.
2. Three modes side by side or in sequence: long-form (<= 2 lines, <= 42 chars), social chunk (2-5 words), word-by-word pop.
3. A built-in check overlay: per page CPS <= 17 and visible time >= 25 frames, flagged red otherwise.
4. "misericórdia" and a 20+ char pt-BR line wrap/shrink inside the 68% box, accents not clipped, no horizontal overflow.
5. Captions stay clear of the 9:16 UI zones in the social variant and have plate/outline contrast over a busy collage.

---

### 4. Diagrams and maps (line draw-on, arrows, labels, routes, timelines)

#### What pros do
- Draw on with a path trim: the route/line is an SVG path whose stroke is revealed by progress 0 to 1; label and start/end marker land as the line reaches them [PM, R3].
- The camera follows or frames the route: slow scale 3-6% drift on map shots (craft §2.2), or a zoom-out reveal built from a shape mask scaled up (Adobe forum thread about Johnny Harris's map reveal; mechanism unverified: https://community.adobe.com/t5/after-effects-discussions/how-does-johnny-harris-do-this-mask-reveal-animation-in-after-effects/td-p/15191636).
- Vox maps: one place highlighted per beat, ~0.5 s per country in a list; each with one big number or label (local zhylin 35-39.5 s). Maps used as the stage for a whole film in register C (local editing-grammar).
- Arrows are drawn like the lines (stem then head), pointed at a thing named in the same breath; labels sit on paper plates, never directly on the busy map.
- Timelines: a rule draws left to right; ticks and dates pop on the year as spoken, previous labels dim.
- Stepped motion (12 fps feel) on the line gives the hand-drawn paper character [P]; heavy things (maps, documents) settle without bounce (craft §2.3).

#### Parameters
| Parameter | Value | Source |
|---|---|---|
| Draw-on API | `evolvePath(progress, d)` -> `strokeDasharray`, `strokeDashoffset`; progress 0 hidden, 1 full; <0 grows from end | [R3] |
| Point on route for marker/plane/arrow head | `getPointAtLength(d, getLength(d) * p)` (returns null past the end in Remotion 5) | [R4] |
| Arrowhead orientation | angle from two points at p and p+0.01 (no tangent doc fetched) | house default |
| Short arrow / underline draw | 12-21 frames (0.4-0.7 s) | [R1], craft §2.6 |
| Route line draw | speed-based: 200-400 px/s on screen, i.e. 1.5-4 s for a 600-1200 px route, ease in-out (cubic 0.4,0,0.2,1), final 10% slower | house default |
| Long route/border draw | cap at 4 s; narrator word at the destination lands on the line's arrival frame (0 to -3 frames) | craft §2.7 + house default |
| Stroke width at 1080p | 6-10 px route, 3-4 px diagram edges; rough passes 2-3 | [R1] (10 px, 3 passes) + house default |
| Place highlight per list item | 15 frames (0.5 s) each | local zhylin 35-39.5 s |
| Label entrance | 6-9 frames, starts when the line is ~80% drawn; stagger 2-4 frames | craft §2.3 |
| Map camera drift | 3-6% scale over the shot | craft §2.2 |
| Step the draw | hold progress 2 frames (twos), width jitter +/-1 px | [P] + house default |
| Timeline tick spacing | proportional to date; ticks pop on spoken year within 0 to -3 frames | house default |
| Label font | 36-48 px on 1080p, >= 4% cap-height rule (craft §2.5) for key labels | craft |

#### Example videos
- Vox Borders: India and Pakistan https://www.youtube.com/watch?v=58nPEe-TU-w (ID from local vox-design-practice list; which ID is which not verified) : chapter "Drawing the border" after ~1 min; scrub there for the line-on-map explanation.
- Zhylin reel https://www.instagram.com/reel/Da8teWQSXqu/ : 18-21 s "Maps. Newspapers. Diagrams." (1 s each), 22.5-24.5 s white arrow drawn on documents, 35-39.5 s map highlight of 5 countries at 0.5 s each (measured).
- PremiumBeat animated-map tutorial [PM]: Pen path + Trim Paths + labels + camera, the exact recipe.
- Vox/Johnny Harris/RealLifeLore map videos: unverified timestamps, scrub for any border or route draw-on; none opened.

#### What our demo must show
1. A route drawn with `evolvePath` over 60-90 frames, eased, with a moving marker positioned by `getPointAtLength` and a label that lands as the line arrives.
2. Two arrows (stem draws, then head) pointing at labelled things; labels on paper plates with 6-9 frame entrance.
3. A timeline of 4-5 dated points drawing left to right, each date popping on its spoken year (0 to -3 frames).
4. Map shot with slow 3-6% camera drift and a country/region highlight at 15 frames per item.
5. Place name "Jerusalém" / "misericórdia"-length labels with accents stay inside the plate (shrink-to-fit), never overflow or clip.

## Catalogue: paper motion, transitions, texture, puppet rig, 3D object, organic FX

Cluster of techniques 5, 6, 7, 11, 10, 13 for the Remotion technique library (30 fps, 1920x1080).
Research date 2026-10-23. Local inputs: `research/craft.md` ([c#] = its source numbers),
`research/second-film-postmortem.md` (E3, E5, R3, R5), `tutorials/zhylin-five-vox-tricks.md`.

Tags: **[S]** = sourced (URL given). **[H]** = house default (own judgment or craft.md, not independently
verified; tune against the demo). **[?]** = could not be confirmed on the web in this pass.

Honesty note: the open web has very few numeric breakdowns of paper-collage animation. Most Vox-style tutorials
are paid (Motion Nerds on Gumroad) and their video pages could not be fetched. Numbers marked [H] are starting
values to calibrate by eye against the reference frames, not facts. Video timestamps below are given only where
a source stated them; other entries say "scrub" and the demo author must log timestamps in the demo notes.

Frame conversion used throughout: 30 fps, so 1 frame = 33.3 ms; "on twos" = new pose every 2 frames (15 poses/s);
"on threes" = every 3 frames (10/s). The pros' 12 fps is not an integer divisor of 30; see Section 5 decision.

---

### 5. Paper motion: set-down, tape, tear, stepped look, wiggle/boil

#### What pros do
- Stop-motion cut-out is animated on twos by default; threes for stylised jitter; fours+ deliberately choppy. Mix them [c9]
  https://publish.obsidian.md/mister-chad/animation/animating+on+the+ones%2C+two%2C+and+threes
- Vox-style motion graphics are rendered at 12 fps inside a 24 fps edit, which creates the stutter; the camera/edit
  stays smooth, only the paper pieces step. https://www.premiumbeat.com/blog/replicating-vox-motion-graphic/
- The stepped boil is made in AE by `posterizeTime(n)` placed before `wiggle(freq, amp)`; a lower n is more stepped.
  https://aejuice.com/blog/posterize-time-and-wiggle-expression ; https://community.adobe.com/questions-529/wiggle-expression-with-stepped-not-smooth-interpolation-29357
- Plain wiggle returns to origin (jitters around the rest point); a piece that must hold a new position needs a
  hold-then-offset approach, not raw wiggle. https://community.adobe.com/questions-529/trying-to-create-a-wiggle-effect-that-stays-where-it-moves-to-instead-of-always-bouncing-back-49005
- Paper illusion breaks without shadows, single-piece characters, clean vector edges, 24 fps. Keep 3-4 depth layers [c11]
  https://pexo.ai/tutorial/how-to-make-a-paper-animation
- Gilliam's cut-outs: photos cut out, layered under glass, moved by hand frame by frame; chosen because it is the
  quickest, cheapest animation he knew. https://makezine.com/article/craft/how-to_cut-out_animation_with/

#### Parameters
| Parameter | Value | Source |
|---|---|---|
| Step rate for piece motion | 2 frames (15 poses/s); 3 frames (10/s) for boil accents | [H] from [c9]; 12 fps pros per premiumbeat |
| Cut-out simple movement | 8-12 fps | https://darkskiesfilm.com/how-to-do-cut-out-animation/ [c10] |
| Wiggle (stop-motion tutorial) | `wiggle(30,10)` on position/rotation in a Motion Array stop-motion tutorial (freq 30 is a very fast jitter, so posterized) | https://motionarray.com/learn/after-effects/stop-motion-style-animation-in-after-effects/ |
| Boil for demo | frequency 3-4 changes/s (every 8-10 frames), amplitude 1-2 px position, 0.3-0.6 deg rotation | [H] |
| Set-down entry | start fully outside frame, travel 12-18 frames, ease-out, rotation lands within +-1.5 deg of final | [H]; entrance min 6-8 frames @24 = 8-10 @30 [c14] |
| Settle overshoot | overshoot 8-10 % of travel, settle in 5-8 frames (4-6 @24 scaled) | [H] [c12] |
| Shadow resting | offset 4 px, blur 3 px, opacity 0.30-0.40, single light angle (e.g. down-right) for whole film | [H] (craft.md, own) |
| Shadow lifted/in flight | offset 14 px, blur 10 px; shrinks back to resting during the last 4-6 frames | [H] |
| Tape | semi-transparent strip (opacity ~0.75), rotated 20-45 deg, torn zig-zag ends, appears 3-5 frames AFTER the piece lands | [H] |
| Tear | rip edge is a separate ragged piece starting 1 frame after the tear mask; paper halves rotate +9 deg and -6 deg and exit in about 50-60 frames in the Noble Desktop rig (fps unstated) | https://blog.nobledesktop.com/learn/after-effects/paper-rip-transition |
| Stepped mask reveal | mask grows frame by frame jaggedly, skipping a few frames; text mask offset a few frames later | https://www.premiumbeat.com/blog/replicating-vox-motion-graphic/ |
| House rule: no pop-ins | first visible frame must touch the frame edge or be covered by another piece | postmortem E5/R5/H-1 (local) |

Decision flag for the build: 30 fps cannot hold exact 12 fps. Use holds of 2 frames (15 fps) as default and
3 frames (10 fps) for "slower" feel; do not time-warp. [H]

#### Example videos
1. Terry Gilliam, "Do-It-Yourself Animation Show" (BBC, 1974): https://www.youtube.com/watch?v=LaG_EiFX7a0 (link from a
   secondary blog; availability unchecked; scrub for the cut-out build and the "Cannibal Baby" demo).
   https://www.cartoonbrew.com/how-to/terry-gilliam-teaches-cut-out-animation-47142.html
2. Motion Nerds, "How To Animate Elements Like VOX": https://youtu.be/EhUihTV_ULQ (scrub; timestamps [?]).
3. Motion Nerds, "How To Animate A Scene Like Vox": https://youtu.be/BFWteSoiWWQ (scrub; timestamps [?]).
4. Premiumbeat, replicating Vox graphics: 12 fps text/graphics and camera transition at 0:14 in its embedded video
   (timestamp quoted by the article): https://www.premiumbeat.com/blog/replicating-vox-motion-graphic/
5. Ben Marriott paper-cutout look (shape wiggle + posterize): https://lesterbanks.com/2020/02/an-easy-way-to-get-a-paper-cutout-stop-motion-look-in-ae/

#### What our demo must show
- A piece enters from outside the frame, with no pop-in on any frame (frame-stepped audit passes).
- The piece overshoots and settles, and its shadow grows while lifted and shrinks on landing.
- Motion visibly steps (new pose every 2 frames) while the background camera stays smooth.
- A tape strip lands after the piece; a tear rips a second piece with a ragged edge.
- One idle piece boils (+-1-2 px, +-0.5 deg every ~8 frames) while holding still.

---

### 6. Transitions between scenes

#### What pros do
- Vox transitions are seamless: zooms, slides, match cuts on shapes, a white ring wipe, whoosh only on the
  transition (about 1 SFX per 6 s). Zhylin reel 42-45 s, local `tutorials/zhylin-five-vox-tricks.md`.
- Camera-transition recipe: two pre-edited sequences as 3D layers, camera pulls back through the edit point, EasyEase
  curve peaking at the cut, short blur keyed on an adjustment layer that is much shorter than the camera move.
  https://www.premiumbeat.com/blog/replicating-vox-motion-graphic/
- Torn-paper wipe: ragged pen mask on a precomp, matte hides the jump, two paper halves rotate away, mesh warp
  adds depth; a curl on the tear sells 3D. https://blog.nobledesktop.com/learn/after-effects/paper-rip-transition ;
  Kevin Snyder curl tutorial via https://lesterbanks.com/?p=29821
- No hard cuts between scenes for this client: join duration 0.15-0.3 s (postmortem E3/R3, local).
- Remotion: `<TransitionSeries>` puts `Transition` between `Sequence`s; both scenes render during the overlap, so
  total duration = sum(sequences) - sum(transitions). Transition may not be longer than either neighbour; no two
  transitions adjacent. `Overlay` renders on the cut without changing timing (light leaks).
  https://www.remotion.dev/docs/transitions/transitionseries

#### Parameters
| Parameter | Value | Source |
|---|---|---|
| Join length | 5-9 frames (0.15-0.3 s) | house rule, postmortem R3 |
| Torn-paper wipe length | 12-18 frames (0.4-0.6 s); a very fast variant is 5 frames | [H]; 5-frame figure from https://invideo.io/blog/how-to-create-paper-tear-transitions-with-ai/ (AI-generated article, weak) |
| Spring timing sample | `springTiming({config:{damping:200}})` = 23 frames @30 | https://www.remotion.dev/docs/transitions/transitionseries |
| Duration math example | 40 + 60 with 30-frame transition = 70 | same |
| Blur at the edit point | peaks on the cut, 3-6 frames total, shorter than the move | premiumbeat (shape), frame counts [H] |
| Whoosh | one per transition, never on a voice gap | Zhylin reel (local) |
| Chapter stamp card | 1.5-2.5 s, same card each chapter | Zhylin reel (local) |
| Presentations available | `slide`, `fade`, `wipe`, custom (clockWipe, flip, iris exist in the package; list page did not render) | https://www.remotion.dev/docs/transitions/presentations |

Build note: a torn-paper wipe is a custom presentation (`TransitionPresentation`,
https://www.remotion.dev/docs/transitions/presentations/custom). The desk already holds a spike on tear effects
(commit 81343d42c9) which should decide this before a bespoke wipe.

#### Example videos
1. Zhylin reel (local study, 24 fps): ring wipe 42-45 s, chapter cards at 4, 15, 26, 40, 47.5 s.
2. Premiumbeat Vox graphics article, camera transition at 0:14 of its video.
3. Noble Desktop paper rip: https://blog.nobledesktop.com/learn/after-effects/paper-rip-transition (timecodes in the page:
   rotation keys at frames 10 and 12, position at 1:00 and 1:02).
4. Gilliam cut-out show (see section 5, link 1): scrub for slide-in/exits between pieces.
5. Motion Nerds hand-collage and rolling-paper tutorials: https://youtu.be/8fOIX4A-rr4 and
   https://motionnerds.gumroad.com/l/egjzc (timestamps [?]).

#### What our demo must show
- Three scenes joined by three different joins: torn-paper wipe, slide-in (new scene pushes old), page turn or curl.
- No join is a hard cut; no join longer than 18 frames; the total duration matches the TransitionSeries math.
- Old scene content is covered by the new paper (no fade-through-black).
- Whoosh placed on each join (audio marker present in the timeline).

---

### 7. Texture and post: grain, halftone, duotone, light leaks, motion blur, paper

#### What pros do
- Animate the grain (static grain reads as a dirty plate). Blend Overlay for film feel; Linear Light is another common
  choice. https://www.wevideo.com/blog/how-to-use-film-grain ; https://forum.doom9.org/archive/index.php/t-184830.html
- Grain size is relative to the format; finer on large formats. https://digitalproduction.com/2013/04/22/darf-es-ein-bisschen-grain-sein/
- Motion background in Vox style: 5-6 textures in one comp, 2-3 swapped in per second. premiumbeat (above).
- Lens look: quick chromatic aberration (slight RGB split), Gaussian blur 3.5 on an adjustment layer, circular mask
  subtracted with feather 50 so only edges soften. premiumbeat (above), timestamp 8:54 of its video.
- All photos share the cut-out treatment: same grain, edge, shadow, limited palette; one untreated photo kills the
  illusion [c11] https://pexo.ai/tutorial/how-to-make-a-paper-animation
- Motion blur from the camera: shutter angle 180 deg = 1/48 s exposure at 24 fps; 90 and 180 are the common film
  values. https://www.remotion.dev/docs/motion-blur/camera-motion-blur ; https://www.studiobinder.com/blog/what-is-the-180-degree-shutter-rule/
- Remotion `@remotion/effects` ships `blur({radius})` (e.g. 40) and `createEffect()` for custom 2D/WebGL2/WebGPU
  effects (4.0.464+); the list page did not render, so check `/docs/effects/api` for the rest.
  https://www.remotion.dev/docs/effects

#### Parameters
| Parameter | Value | Source |
|---|---|---|
| `CameraMotionBlur` shutterAngle | default 180; use 90 for lighter blur; blur drops at higher fps | https://www.remotion.dev/docs/motion-blur/camera-motion-blur |
| `CameraMotionBlur` samples | default 10, docs recommend 5-10; destructive to colour so keep low | same |
| Children of blur | must be absolutely positioned (`AbsoluteFill`) | same |
| Grain opacity | 6-12 % Overlay on the whole frame; heavier (15-20 %) only on dark title grounds | [H]; one source suggests ~35 % for a 35 mm plate overlay: https://www.wevideo.com/blog/how-to-use-film-grain |
| Grain animation rate | new grain every 2 frames (on twos) so it matches the paper | [H] |
| Grain size | 1-1.5 px at 1080p; same on photos and paper | [H] |
| Halftone | dot pitch 6-10 px at 1080p, 45 deg screen angle, applied to photos only before duotone | [H] |
| Duotone | map shadows to the ink colour, highlights to the paper colour; one pair per film (AdScriptura palette) | [H] |
| Light leak | `Overlay` on the transition cut, 10-20 frames, screen blend, 20-35 % opacity | [H]; mechanism: https://www.remotion.dev/docs/transitions/transitionseries |
| Chromatic aberration / blur | RGB offset 1-3 px at edges; Gaussian 3.5; mask feather 50 | https://www.premiumbeat.com/blog/replicating-vox-motion-graphic/ |
| Paper texture | 2-3 distinct textures swapped per second behind scenes | premiumbeat |
| Export | 1080 px or more wide; verify the encoder is not smoothing grain (CRF low, 1080p H.264) | [c11] / [H] |
| Motion-blur gotcha | the default client-side renderer lacks mix-blend-mode, which CameraMotionBlur needs | Remotion doc above |

#### Example videos
1. Premiumbeat Vox graphics tutorial: camera transition 0:14, motion background 1:39, lens effect 8:54.
   https://www.premiumbeat.com/blog/replicating-vox-motion-graphic/ (video itself embedded; confirm timestamps on watch).
2. AEJuice collage tutorial: https://aejuice.com/blog/how-to-make-a-video-collage-in-after-effects (scrub).
3. Tuts+ collage animation: https://photography.tutsplus.com/articles/collage-animation-in-after-effects--cms-93666 (scrub).
4. Motion Nerds "Viral videos like Vox": https://youtu.be/3nVtduyO08s (timestamps [?]).
5. Zhylin reel (local), dark grainy cards in vox-design-practice.md line 94.

#### What our demo must show
- A split or A/B of the same scene with and without grain, halftone, duotone (toggle visible).
- Photo and paper share one grain; zoom 200 % on an edge shows fibre/roughness, not a clean vector line.
- A camera move with `CameraMotionBlur` at 180 deg / 10 samples vs 0, and blur shorter than the move.
- A light leak laid on a join through `TransitionSeries.Overlay`.
- Grain steps on twos (not smooth noise) and does not flicker when the render is paused on a frame.

---

### 11. Cut-out puppet rig (head, torso, arms, pivots)

#### What pros do
- Separate every moving part: head, torso, upper arm, forearm, hand, thigh, shin; one-piece figures can only slide
  or rotate. [c11] https://darkskiesfilm.com/how-to-do-cut-out-animation/
- Pivot (anchor) at the joint, not the part's centre; build the rig in a neutral straight-down pose. Duik Angela
  rigs separated layers with IK/FK and connectors; see https://rxlaboratorio.org/books/duik-angela-user-guide/ and
  https://www.skillshare.com/en/classes/complete-beginners-guide-on-duik-angela-rigging/1473176362
- Parent chain: torso -> head and shoulders; shoulder -> forearm -> hand; drive the root with a null for travel.
  https://photography.tutsplus.com/articles/collage-animation-in-after-effects--cms-93666 (null-driven collage)
- Keep several mouth/hand variants and swap them (sprite swap), not morph. [c10]
- Gilliam: heads and limbs from photographs, jointed, moved a little each frame under glass; gestures are
  small and abrupt (on twos or threes). https://makezine.com/article/craft/how-to_cut-out_animation_with/
- Overlap and delay down the chain: head lags torso by 2-4 frames, hand lags forearm by 2-3 frames. [H] (principle in [c10])
- Shadow separation keeps layers readable: soft shadow under every layer. [c11]

#### Parameters
| Parameter | Value | Source |
|---|---|---|
| Joint rotation ranges | head +-12 deg, torso +-6 deg, upper arm -30..+120 deg, forearm 0..+130 deg (one direction), hand +-25 deg, thigh -25..+45 deg, shin 0..-60 deg | [H] ([?] no published numeric limits found; Duik exposes limits per controller in its guide) |
| Pose rate | on twos 15 poses/s; 8-12 fps style per cut-out basics | [c10] https://darkskiesfilm.com/how-to-do-cut-out-animation/ |
| Hold between poses | 6-12 frames for a gesture, ease in/out at ends | [H] |
| Mouth swaps | 3-5 shapes (closed, open, wide, O, smile), swap every 2-4 frames, tied to audio | [H] |
| Follow-through lag | head 2-4 frames behind torso; hand 2-3 behind forearm | [H] |
| Bobbing walk | torso rises 6-10 px per step, step every 8-12 frames | [H] |
| Joint overlap | keep 10-20 % overlap between parts so no gap opens at max angle | [H] |

#### Example videos
1. Gilliam 1974 show: https://www.youtube.com/watch?v=LaG_EiFX7a0 (scrub; the jointed figure demo).
2. Duik Angela official course: https://en.tuto.com/after-effects/official-course-duik-angela,184861.html (chapters Connections, Advanced Arm).
3. RxLaboratorio robot tutorial (2.5D head rotation with Connector): https://rxlaboratorio.org/product/tuto-robot/
4. Motion Nerds hand collage animation: https://youtu.be/8fOIX4A-rr4 (timestamps [?]).
5. Ben Marriott paper cutout project: https://benmarriott.gumroad.com/l/NDtPol

#### What our demo must show
- A figure of at least 7 parts (head, torso, 2 upper arms, 2 forearms, hand variants) with visible pivots at joints.
- A wave and a nod: forearm rotates around the elbow, head around the neck, no gap or detached edge at any frame.
- Parent-child behaviour: moving the torso carries head and arms; arms keep their own swing with a 2-4 frame lag.
- Stepped on twos and with shadows under each part; one mouth swap tied to a voice line.
- A debug overlay frame showing pivot points and ranges (for checking only).

---

### 10. Simple 3D object (phone or book) inside a 2D collage

#### What pros do
- Keep the 3D object to one clean prop with paper treatment around it: drop shadow on the paper, same grain on top of
  the render, same palette. Pure CG against paper breaks the illusion. [c11] [H]
- Remotion route: `@remotion/three` `ThreeCanvas` in react-three-fiber; animate from `useCurrentFrame()`, never
  `useFrame()`; render with the `angle` GL renderer. https://www.remotion.dev/docs/three ; https://www.remotion.dev/docs/three/three-canvas (the
  latter returned 404 when fetched, so cite the former)
- Video on a surface: `useVideoTexture()`, and `useOffthreadVideoTexture()` for exact frames in the final render.
  https://www.remotion.dev/docs/three (reported via search result; verify on the page)
- Official starter exists: a 3D phone with a swappable video inside (colour, size, thickness, corner radius props).
  Verify on remotion.dev showcase before use. [?]
- Gotchas: `<Sequence>` inside `ThreeCanvas` needs `layout="none"`; config `Config.setChromiumOpenGlRenderer('angle')`
  for CLI and `chromiumOptions: {gl: 'angle'}` for server-side renders. https://www.remotion.dev/docs/three
- Cheaper alternative if rendering is heavy: CSS 3D transforms (`rotateY`, `perspective`) on a layered DOM book or phone
  (thickness faked with stacked layers). [H]

#### Parameters
| Parameter | Value | Source |
|---|---|---|
| Renderer flag | `angle` OpenGL | https://www.remotion.dev/docs/three |
| Animation driver | `useCurrentFrame()` only | same |
| Camera FOV | 25-35 deg (long lens, low distortion, reads as "mounted on paper") | [H] |
| Turn-in reveal | rotate Y from 70 deg to 12 deg over 24-30 frames, ease-out, overshoot 4 deg | [H] |
| Idle sway | +-3 deg Y, +-1.5 deg X, period 90-120 frames, stepped on twos to match the paper | [H] |
| Shadow on paper | blurred ellipse under the object, offset 10-16 px, blur 12 px, opacity 0.35, moves with tilt | [H] |
| Book thickness | spine 24-40 px; page edges show as paper-white lines | [H] |
| Sample budget | motion blur samples 5 (3D is already expensive) | [H] with CameraMotionBlur doc |
| Grain over render | same grain overlay as 2D pieces, applied after the 3D layer | [H] |

#### Example videos
1. Remotion docs, 3D guide and phone starter: https://www.remotion.dev/docs/three (scrub the demo).
2. Remotion best-practices rule file for 3D: https://cdn.jsdelivr.net/npm/claude-code-skills@0.5.0/data/skills/remotion-best-practices/rules/3d.md
3. Local skill: `.agents/skills/remotion-*` (3D rule file, check before building).
4. Vox-style product shots in collage (scrub Motion Nerds "Scene like Vox"): https://youtu.be/BFWteSoiWWQ [?].

#### What our demo must show
- A phone or book that turns from edge-on to facing camera with perspective and a shadow cast onto the paper below.
- A video or page image mapped on its face and sharp on the frame where it settles.
- The 3D layer carries the same grain and palette as the 2D collage; a neighbouring paper piece overlaps it.
- Render finishes with the `angle` renderer, no `useFrame` usage, timing tied to frame number (deterministic on rerender).
- It stays under a stated render time budget (measure and record in the demo notes).

---

### 13. Organic FX: smoke, water, ink bleed

#### What pros do
- Smoke: Fractal Noise on a solid, animate Evolution, add contrast, then Turbulent Displace for swirl; use as a
  luma matte or Screen overlay. https://www.filmbro.com/blogs/tutorials/how-to-fake-atmospheric-smoke-animation-effects-in-adobe-after-effects-using-fractal-noise ;
  https://blog.motionarray.com/learn/after-effects/smoke-effects-in-after-effects/ ; https://pixelbakery.com/education/tutorials/smoke-effect-using-wave-warp
- Ink bleed: procedural, adapted from Photoshop displacement stack (blur + threshold + displacement); animate the
  threshold to grow the bleed. Ben Marriott technique via https://lesterbanks.com/?p=55610 (title/section as listed in search, verify).
- Old-paper and ink on paper: fractal noise paper texture and roughen-edges ink in two layers with different blend
  modes. https://creativecow.net/?p=30855
- Water: no clear sourced workflow found [?]; practical route is a displacement map (animated fractal noise) over a
  blue/duotone plate plus a wave-warp, with the surface steppped on twos so it reads as cut paper.
- In a paper film, organic FX must also step on twos/threes and be given the paper treatment (grain, duotone),
  or they look like a different film. [H] [c11]
- Remotion implementation: SVG `feTurbulence` + `feDisplacementMap` driven by `useCurrentFrame()`, CSS `mask`
  and `mix-blend-mode`; or a canvas/WebGL custom effect via `createEffect()`.
  https://www.remotion.dev/docs/effects (custom effects API; available 4.0.464+)

#### Parameters
| Parameter | Value | Source |
|---|---|---|
| Smoke noise | fractal noise, scale ~200-400 %, complexity 5-6, evolve ~120 deg/s, contrast high; no numeric values on the page | structure from https://www.filmbro.com/blogs/tutorials/how-to-fake-atmospheric-smoke-animation-effects-in-adobe-after-effects-using-fractal-noise (values [H]) |
| Smoke look | opacity 25-45 %, Screen or Overlay, 2 layers moving at different speeds, rising 40-80 px/s | [H] |
| Ink bleed growth | 24-48 frames to reach full spread, ease-out; threshold 0.35 -> 0.6 | [H] |
| Displacement amount | 8-25 px for bleed edge; 4-10 px for water ripple | [H] |
| Step rate | evolve noise on twos (15 fps) | [H] |
| Water | ripple speed 0.5-1 cycle/s, amplitude 6 px, two layers offset | [H] |
| Cost control | pre-render the noise to a short loop (45-90 frames) and reuse | [H] |

#### Example videos
1. Filmbro smoke tutorial: https://www.filmbro.com/blogs/tutorials/how-to-fake-atmospheric-smoke-animation-effects-in-adobe-after-effects-using-fractal-noise (scrub).
2. Motion Array atmospheric smoke: https://blog.motionarray.com/learn/after-effects/smoke-effects-in-after-effects/ (scrub).
3. AEJuice smoke text reveal: https://aejuice.com/blog/how-to-create-a-smoke-text-effect-in-after-effects/
4. Pixel Bakery smoke with Wave Warp: https://pixelbakery.com/education/tutorials/smoke-effect-using-wave-warp
5. Ben Marriott ink bleed: https://lesterbanks.com/?p=55610

#### What our demo must show
- Smoke rising behind a paper piece, in paper grain/duotone, stepping on twos, not smooth CG.
- Ink bleeding out from a word or stamp, growing over ~1 s and leaving a ragged edge.
- A water surface with ripples visibly displacing a paper piece reflected or seen through it.
- Every effect is deterministic from frame number (no `Math.random` at render time).

---

### Open questions / flagged items
1. Rotation limits (Section 11) and grain/halftone values (Section 7) are house defaults; no authoritative public numbers found.
2. Video timestamps were stated by a source only for Premiumbeat (0:14, 1:39, 8:54) and the Noble Desktop timecodes; all others need a scrub.
3. `@remotion/effects` full API (list of effects) and the `@remotion/transitions` presentation list did not render; check `/docs/effects/api` and `/docs/transitions/presentations` before building.
4. The Remotion three-canvas subpage returned 404; the Remotion 3D phone starter claim is from a search summary.

## Technique 8: Sound design and mix

Scope: SFX cues synced to picture, layering, music bed, ducking, room tone, loudness. Web research 2026-10-23. Platforms publish few official numbers; entries marked "secondary" come from blogs or tool docs, not platform specs.

### What pros do

- **Voice is the anchor, everything else is measured against it.** Mix dialogue first, then bed, then SFX; the bed sits well under the voice, SFX peak near the voice only for short hits. Local evidence: 165 pro social pieces, bed floor 12.1 dB under voice (p10-p90 7.1-18.7), voice at -17.4 dBFS (`sound-grammar.md` section 3).
- **Fixed low bed far more often than sidechain.** 98% of the pro pieces carry a steady bed through pauses; only ~15% release it by 3 dB or more in pauses. Ducking is a safety net, not the main tool.
- **Sound lands on the contact, not on the file start.** Align the transient (the "anchor") of the recording to the visual hit; trim lead-in silence. Tens of milliseconds matter (Krotos, sound-to-picture guide).
- **Few cues, chosen to carry the picture.** Only ~2% of picture events carry a salient cue in the pro set; cut-synced SFX are the exception. Thin runs of repeats (one key tick per run, a burst for long runs).
- **Layer with a purpose, 2-4 layers.** One layer for identity (the real object), one for timing/movement, one for weight (sub or low thump), one for air (high transient). Do not add layers "to look sophisticated" (Krotos, film sound design guide).
- **Whoosh before impact, then a beat of space.** A whoosh that builds into the hit, optionally a short silence just before the hit, adds weight (Krotos, same guide). Whoosh transient or peak lands on the hit.
- **Room tone / bed never goes digitally silent mid-piece.** Pro pieces keep a floor above -50 dBFS across pauses (98%); digital silence mid-piece is a defect (15% of pieces show one, mostly at the render end). Fill gaps with room tone or paper-room air so cuts do not "drop out".
- **Close with intent.** Bed holds to the cut (44%) or fades 0.2-0.5 s (46%); no long music tail after the last word (4%).
- **Master last, to a platform target with headroom.** Loudness-normalise the final mux, then verify true peak after the AAC encode.

### Concrete parameters

| Parameter | Value | Source |
|---|---|---|
| Integrated loudness, YouTube / Shorts / Reels / TikTok | -14 LUFS (louder is turned down; YouTube does not boost quieter) | secondary: https://youlean.co/?p=30813 ; https://opus.pro/blog/best-loudness-normalizers |
| Pro social pieces measured | median -14.1 LUFS, 96% within ±1 LU, LRA median 2.5 LU | local: `research/sound-grammar.md` section 2 |
| Short-form "competitive" alternative | about -13 LUFS (not a platform rule) | secondary: https://www.boyamic.com/blogs/wireless-mic-gain-for-youtube-tiktok |
| True-peak ceiling | -1 dBTP (secondary); our core uses -1.5 dBTP so AAC re-encode stays under -1 | secondary: https://youlean.co/?p=30813 ; house default `tools/audio/mix.mjs` TP_TARGET |
| Long-form / narrative streaming reference | dialogue-gated -27 LKFS ±2 LU, true peak -2 dBTP (M&E / print master QC threshold -1 dBTP) | https://backlothelp.netflix.com/hc/en-us/articles/360001794307-Netflix-Sound-Mix-Specifications-Best-Practices-v1-5 ; https://backlothelp.netflix.com/hc/en-us/articles/360050414014 (reference only: not a social target) |
| VO level in the mix | about -17 dBFS RMS in speech (-19.7 to -16.8) before master normalisation | local: sound-grammar section 3 |
| Bed under VO (fixed) | 12 dB under speech (range 7-19) | local measurement, sound-grammar section 3; house default MUSIC_FIXED_BELOW_VOICE = 12 |
| Duck depth (sidechain) | tutorials 6-12 dB; tool default -20 dB max reduction | https://www.capcut.com/create/audio-ducking-for-clear-dialogue-in-video ; https://composer-docs.vindral.com/operators/operators-sidechain-ducking.html |
| Duck attack | 10 ms default (hard); 30-80 ms creator range; 50-200 ms softer | same two sources |
| Duck release | 200 ms default; 250-700 ms creator range; 500-1500 ms bridges natural pauses; 1-2 s for heavy documentary ducking | same two sources + Logic course https://www.lynda.com/Logic-Pro-tutorials/Keying-gates-compressors-andor-ducking/85998/96060-4.html |
| Our core defaults | bed -12 dB + 8 dB duck = -20 dB under speech; SFX sidechain attack 5 ms; ~250 ms release | house default `tools/audio/mix.mjs` lines 8-25, 62-65, 123 |
| A/V sync window (audio early / late) | +40 ms / -60 ms end-to-end (broadcast), about 1 frame early / 2 frames late at 30 fps | https://tech.ebu.ch/publications/r037 ; viewer detectability +45 / -125 ms (ITU-R BT.1359, via https://en.wikipedia.org/wiki/Audio-to-video_synchronization) |
| SFX lead vs visual hit | no sourced frame count exists; transient on the contact frame (offset 0 ±1 frame). Whoosh swell may start 3-8 frames earlier so its peak lands on the hit | transient on hit: https://krotos.studio/blog/sound-to-picture ; frame counts are house default |
| Local sync gate | ≥80% of picture events show an attack within ±50 ms | house default `tools/audio/sync_check.py` |
| SFX layers per hit | 2-4 (identity, movement, weight, air) | https://krotos.studio/blog/film-sound-design ; counts are house default |
| SFX cue density | about 2% of picture events carry a cue in pro social pieces; hits near the voice peak at -3.3 dB vs narration level (p10-p90 -11 to +4) | local: sound-grammar section 4 |
| Fade-out | 0.2-0.5 s or hold to the cut; bed silent by the closing line | local: sound-grammar section 3; house default `--fade-out 0.8` |
| Room tone floor | above -50 dBFS across pauses; no digital silence (below -60 dBFS for 0.3 s) mid-piece | local: sound-grammar; floor level house default |

Gaps in sourcing: no official YouTube/Meta/TikTok loudness page was found in this pass; the -14 / -1 figures are consensus from secondary sources and our own 165-piece measurement. No paper-Foley-specific source was found; paper layering below is house default.

House default paper-cue recipes (not sourced): slide = soft paper scrape 150-400 ms + low thud at landing; tape = short rip then 1 press click; tear = two layers, a slow fibre rip plus a high crisp snap on the separation frame; page turn = air whoosh then a flat flap on contact; word pop = one 60-120 ms pop on the word's first frame, level 8-12 dB under the voice peak.

### Example videos

Timestamps were not verified by listening (no audio access in this pass); treat as places to inspect, then confirm by ear.

1. Vox, "Explained" / Vox YouTube explainers, e.g. https://www.youtube.com/@Vox : study the paper/collage cuts with bed 10-14 dB under VO and sparse hits on graphic entrances. Timestamps: pick the first 0:00-1:00 after the cold open and log every cue.
2. Kurzgesagt, https://www.youtube.com/@kurzgesagt : cue-per-motion layering and a bed that stays constant under VO; inspect 0:00-0:45 for whoosh-into-impact on title cards.
3. Our own pro social corpus references from `research/sound-grammar.md`: `hex/DUQRqS2icUB` 53-63 s (noise riser 57.5-59.8 s), `ee/DaAV2R5IuSi` 2-12 s (bed entry 9.3 s, riser from 26.3 s), `hex/DXEP5DogtTK` (bed released in pauses). These are the only ones with measured timestamps.
4. Netflix mix spec page (loudness reference, not a video): https://backlothelp.netflix.com/hc/en-us/articles/360001794307-Netflix-Sound-Mix-Specifications-Best-Practices-v1-5

Open: the caller should replace 1-2 with specific, listened-to timestamps before the demo is judged.

### What our demo must show

Run `ffmpeg -i demo.mp4 -af ebur128=peak=true -f null -` and the checks below.

1. Integrated loudness -14 LUFS ±1 LU, true peak at or below -1 dBTP, LRA at or below 3 LU.
2. Bed 12 ±3 dB under speech: `astats` RMS of voice-active windows minus pause windows (>=0.5 s) within 9-15 dB; pause floor above -50 dBFS, no window below -60 dBFS for 0.3 s before the final fade.
3. Duck proof: with ducking on, bed RMS under speech is at least 6 dB lower than the same bed in a pause window of the same track, with recovery inside 1.5 s of the last word (momentary loudness, 400 ms windows).
4. Each visible paper action (slide, tape, tear, page, word pop) has an onset within -1 / +2 frames (-33 / +67 ms at 30 fps) of the contact frame: run `tools/audio/sync_check.py`, pass rate at or above 80%, ideally 100% for the demo's cue list.
5. Layered hit proof: one tear or slam shows at least 2 distinct spectral bands (side 4-10 kHz plus mid 30-120 Hz) rising together at the contact frame.

### Gap vs our tools/audio tool

- Covered: two-pass loudnorm to -14 LUFS, TP -1.5, sidechain duck (bed -12 + 8 dB), SFX sidechain attack 5 ms, anchor-aligned SFX, thinning, `sync_check.py`, fade-out.
- Missing: room-tone / paper-air generator or bed-fill stem (nothing prevents digital silence mid-piece).
- Missing: layered cue definitions (cue = several samples with per-layer gain/offset); library maps one action to one recording.
- Missing: whoosh-lead helper (swell peak placed on the hit, start derived from length), and a cue lead option in frames.
- Missing: LRA/true-peak assertion as a gate with exit code (only report); no post-AAC true-peak recheck.
- Missing: ducking release is fixed near 250 ms; documentary pauses want 500-1500 ms selectable per film (`--duck-release`).
- Missing: Remotion-side wiring: cues exported from component frame numbers (`<Sequence>`/frame to seconds at 30 fps), so the mix reads the same timeline as the render.
