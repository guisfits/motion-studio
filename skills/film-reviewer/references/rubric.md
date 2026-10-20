# Rubric: twelve dimensions, the odd-tell table, and what is not a defect

Built from `research/editing-grammar.md` (measured: section 10 rhythm model, section 11 odd tells, section 12 rulings) + `research/first-film-postmortem.md` (C = coarse, K = craft) + `research/craft.md` section 3 (`tell n`) + the visible Moran fake-tells. Gate codes and `NORMS` keys are in `severity-routing.md`. Measured ranges are register A (narrated 9:16 collage explainer, grammar section 0); they are what your eye is calibrated to. Quote `NORMS` keys for the gate values, never a different number.

How to score: integer 1-10 per dimension with one line of evidence and a `t`. A 10 has zero 🟠 and 🟡 in the dimension and one moment you would show as a reference. A 5 is a film a stranger watches to the end without trust. Caps and arithmetic: `severity-routing.md` section 2.

Cite as: `odd #n` = grammar section 11 row n; `grammar §x` = section; `tell n` = craft section 3; `C1`, `K3` = postmortem; `moran/<reel>`.

## Stages (the Director names the stage; the checks file is that stage's)

| Dimension | Animatic | Draft | Final |
| --- | --- | --- | --- |
| D1-D6, D12 | scored | scored | scored |
| D7 Camera | positions and targets only (T9) | scored | scored |
| D8 Motion, D9 Material | `not assessed (layout only)` | scored | scored |
| D10 Colour and register | scored | scored | scored |
| D11 Sound | `not assessed (no mix)` | `not assessed (no mix)` | scored; no mix = 🔴 |

An animatic review cannot reach APPROVED for the film; it clears the animatic gate (`severity-routing.md` section 3).

---

## D1 Hook and opening

- 10: the first line is a complete claim or question spoken from the first word; the picture is the thing it names; something moves in the first second; the first 3 s are cut at the film's body rate, not faster (`grammar §1` opening-line formula: ratio 1.03). A stranger can say what the film promises after 3 s.
- 5: the board is already built and nothing happens; a greeting, a logo or black; the claim arrives late.
- Tells: tell 16 (no hook in 1.5 s), `K10`, throat-clearing ("did you know").
- Gates/norms: none measure it (say so when it fails). `NORMS.frames.deadWindowS` only catches a freeze.
- See: `hook.png` (first 1.5 s at 4 per second). Would I stop for frame 1 and frame 6?
- Owner: writer (the line), storyboard (hero of beat 1), animator (motion in second 1).

## D2 Voice = picture = lettering

- 10: every key noun has its hero on screen from `NORMS.sync.heroWindowFrames` frames before the word to the word (never after); the picture is the thing named, a named person is a recognisable portrait of that person; a new noun, place, person or number gets a new picture, a continuing clause changes the caption only (`grammar §10.2`); the held picture covers the whole clause. The sheet's rows are the plan: about one row per 4.5 spoken words (grammar section 10), `join` is `cut` unless the row sits at a time jump, chapter turn or payoff, and `device` names what the row builds (`breath-card`, `word-card`, `crowd`, `evidence-board`...): the render must show that device.
- 5: pictures are on topic but late; a generic stand-in carries a specific noun; a caption is needed to know who it is.
- Tells: tell 3, tell 4, `C3`; a shot with no noun in the line under it (`zhylin.md` 1).
- Gates/norms: H1, S2, S3, S5, `NORMS.sync.heroWindowFrames`, `NORMS.frames.heroAlpha`.
- See: the 5-frame strip at every `key` (`watching.md`); cover the caption: would I draw this picture from the word alone? A picture of a different concept is worse than a plain card.
- Owner: storyboard (row/hero), archivist (wrong or unrecognisable asset), animator (arrival).

## D3 Rhythm (the measured model)

- 10: an edit event (picture change, caption chunk change, cut) about every 1.2 s; average event length inside `NORMS.rhythm.aslRange` (R1), events per 10 s inside `NORMS.rhythm.eventsPer10s` in every window except the last 5 s (R2), spoken words per event inside `NORMS.rhythm.wordsPerEvent` (R3); bursts of sub-second events resolve into a hold on the point (the key number, the conclusion: grammar section 1 burst, then hold); a breath card every 10-20 s; no still hold of `NORMS.rhythm.maxStillHoldS` or more; soft transitions rare and only at a time jump, chapter turn or payoff (grammar section 3: median 0.28 per 10 s, none in 75 of 165 pieces); flash trains only on an intensity beat.
- 5: one density all the way (a machine-gun film or a slideshow); a dissolve on every change (rows with `join: dissolve` that mark no time jump, chapter turn or payoff); an explanatory sentence under a montage burst, or a long hold under a list (`zhylin.md` 2); fast cuts in the first 3 s to fake a hook.
- Tells: `odd #8` dead hold; `tell 6` all moves one duration; `zhylin.md` 2.
- Gates/norms: R1, R2 (animatic, draft, final), R3 (animatic only), R4 is D12, M1.
- See: the 1 fps sheets: count changes per 10 s; `watching.md` section 4 measures cut times from the render; the longest hold; every dissolve and what it marks.
- Owner: storyboard (beat length, cards), animator (events, micro-motion), director (pace, where the holds go).

## D4 Captions

- 10: each caption fully legible for at least `NORMS.caption.minLegibleS`, at most `NORMS.caption.maxCps` characters per second and `NORMS.caption.maxWords` words; cap height inside `NORMS.caption.capHeight` (T10), contrast at least `NORMS.caption.minContrast` against the pixels behind it (T11); on a quiet area (sky, wall, paper, dark mid-tone), never over faces, eyes or logos; chunk changes in place at a fixed position; one emphasis style.
- 5: readable on a second try; chunks swap before the last word is read; low-contrast over a busy shot; a caption across a face.
- Tells: `odd #3`, tell 1, tell 2, tell 13, `C2`; `moran/DL24UePpHWN` caption-style rulings are in the "not a defect" list below.
- Gates/norms: T1, T2, T3, T10, T11 (T10 and T11 only exist at draft).
- See: the 360 px sheet; sound-off pass. If you cannot read it at 360 px without zooming, it fails regardless of the number.
- Owner: art director (size, contrast, plate, zone), animator (timing, chunking).

## D5 Lettering, type and annotation

- 10: every lettered word is spoken in that beat and lands within `NORMS.sync.letteringToleranceFrames` of the word; at most `NORMS.sync.maxMarksPerSecond` mark per second; marks draw on (a stroke, a highlighter swipe, a typed line), never fade in fully formed (`grammar §5` draw-on markup); one stressed word grows per line (`grammar §7` key-word size jump); every label is tied to its object by a leader line or an arrow (`odd #10`); at most the type voices and accents the style bible allows; text never clipped, never over text; two text layers may coexist only with distinct roles (`grammar §12` #5).
- 5: decorative lettering on a word not said; thin uniform vector ovals; marks fade in; labels floating at the frame edge; five type voices.
- Tells: tell 12, tell 14, `odd #10`, `K5`, `K6`, `K8`, `C4`; `moran/DLTLw1DpgwE`; pure #000/#FFF text is untested (not a defect, `grammar §12` #8).
- Gates/norms: S4, S5, S6, T4.
- See: strip at each `lettering.lands` (-4..+8 frames); count type voices on the whole-film sheet against `style-bible.md`.
- Owner: storyboard (which word, when), animator (draw-on and landing), art director (type voices, sizes).

## D6 Composition and focal point

- 10: one dominant item per beat with its centroid in `NORMS.frames.heroThird` (T6); the eye lands on the hero first (squint test); an empty area on purpose, not weight spread evenly (`odd #2`: 10-20% empty in a dense layout; 40-90% empty around a single hero on a quiet ground, grammar section 6); depth layers (smaller behind); nothing that matters under a UI zone; crops on purpose (a face keeps its eyes); the lower half is used by something (a caption on a quiet area counts).
- 5: equal-weight clippings with even gaps and no empty area; the picture lives in the top half and the lower 40% is dead; a face cropped at the forehead and held large.
- Tells: `odd #2`, `odd #7` (overlap or crop held too long), tell 15 (coverage), `K3`, `C5`, `C7`.
- Gates/norms: T4, T5, T6. A quiet ground (one hero, most of the frame empty) passes T5: only pieces covering less than `NORMS.frames.minCoverage` are red (`severity-routing.md` section 1, item 6).
- See: any frame of the sheet, squinting; the last frame at full size.
- Owner: storyboard (hero/support), art director (ground, stage), archivist (crop of an asset), animator (layout).

## D7 Camera

- 10: most shots move a little (never-static still: a push, pan or drift for the whole life, or a held camera in a fast montage where the cut is the move); every emphasis move changes scale by at least `NORMS.camera.emphasisMinScaleDelta` on its own (T7); a punch (scale at least `NORMS.camera.punchMax`, sheet `zoom.kind: punch-in`) is a rare accent, at most two per film (T7), on the named detail; `into-frame` ends on a frame that is the next scene; the zoom target box is inside the frame with its safe margin at the end of each move (T9); no linear run over `NORMS.camera.maxLinearRunFrames` frames (T8); a punch lands on the word that names the detail; a pull-out reveals the context; a cut during a move does not carry the old move on (the cut key resets it).
- 5: gentle linear drifts that end on a half-built board and hard-cut; no move reason; targets cut by the frame edge; strobing on fast moves; a push on a word that is not stressed.
- Tells: tell 5, tell 6, tell 7, `K1`; `odd #7` crop.
- Gates/norms: T7, T8, T9.
- See: frames at the start, middle and end of each move; at the fastest point two consecutive frames: an edge that jumps ~40 px with no smear along the axis strobes.
- Owner: animator (move), storyboard (where the punch goes), art director (what is in the target box).

## D8 Motion of pieces (draft and final)

- 10: arrivals decelerate and are visible long enough to read; pieces from off-frame carry a small rotation toward rest; light pieces may overshoot, heavy paper settles (snap, then settle); grouped items stagger instead of arriving as one block; pieces do not all stop on the same frame; a held picture has idle life; contact shadows follow the lift; stepped motion is allowed, not required (`grammar §12` #3).
- 5: pieces fade or scale in at 30 fps smoothness, like slides; one duration for everything; stop-sync; a held image frozen.
- Tells: tell 9, `K2`, `odd #8`.
- Gates/norms: none (T8 covers camera only). Report `no norm`.
- See: a strip every 2 frames across one arrival; do rotation and speed change; do all pieces stop together.
- Owner: animator.

## D9 Material: cut-out, paper, texture (draft and final; needs full resolution)

- 10: a visible rim or contact shadow where parts touch, constant rim width across the set, torn or cut edges with fibre where paper is torn; one grain over all layers; photos toned into the palette; every source (stock, plates, footage) wears the same treatment; low-res footage is stepped, halftoned or covered, used for one beat; generated plates share one grade and stay short; no tiled-ground repeat visible in a pan.
- 5: clean vector edges with no shadow; one untreated photo; plates that drift in style; a watermark; software UI left in.
- Tells: `odd #1` pasted cut-out, `odd #5`, `odd #6`, `odd #9`, tell 10, tell 11, `K4`; Moran-only (technique, judge only what you can see): texture strength by opacity (`moran/DL24UePpHWN`), two textures in one band (`moran/DNuJS_oWoxM`), overcooked grain (`moran/DMWEwQRp6aD`), a texture scaled down until the frame shows its edge (`moran/DcBhNhOg5kR`), crisp edges reading digital (`moran/DUEIdzuCUgn`).
- Gates/norms: P1 (placeholders and unknown assets). Everything else `no norm`.
- See: crop an edge at 200% from the full-size frame (`watching.md`); a ground across a long pan; the corner of a plate.
- Owner: archivist (edge, rim, shadow, treatment), art director (grounds, textures, tiling, one-treatment rule), animator (shadow lift).

## D10 Colour, register and consistency

- 10: one colour world per scene, one saturated accent per beat with one meaning (not stamps, ovals and dates alike); grounds change by design at structural turns (palette flip marks a turn, grammar section 3) not by hard cut between unrelated flat fields; at most two object styles in the film, each with its own colour world and a card between (`odd #4`); flat colour fields carry grain (`grammar §12` #6); the style bible's limits (accents, type voices, caption spec) hold.
- 5: each act another flat colour; the accent on everything; a dark UI outro or a sepia-and-sans last three shots; emoji next to 3D props.
- Tells: `odd #4`, `K4`, `K7`, `K8`, `K9`.
- Gates/norms: none; count against `crew/style-bible.md`.
- See: the whole-film sheet: colour of each act; list every type voice; count accents.
- Owner: art director.

## D11 Sound (final only)

- 10: integrated loudness `NORMS.audio.lufs` within `NORMS.audio.lufsTol`, range at most `NORMS.audio.maxLra`; at most `NORMS.audio.maxSfxPer4s` cues per `NORMS.audio.sfxWindowS`; a cue over a word only where it serves the word (M5 is orange: the pros put cues on speech in 12 % of pieces, `research/sound-grammar.md` §4.5); cue transients on the motion apex (not more than 2 frames after); voice intelligible in the mix; music out of the voice's way. Thresholds measured in `research/sound-grammar.md` §7.
- 5: a whoosh on every move; one sample repeating; music competing with the voice; SFX masking a key word.
- Tells: tell 17, `zhylin.md` 6.
- Gates/norms: M2, M3, M4, M5, M6 (final only).
- See: picture-off pass (`watching.md` section 3). What needs an ear and you cannot hear: `not heard`, cap 7.
- Owner: sound.

## D12 Ending

- 10: the last 5 s are slower than the body (`NORMS.rhythm.endSlowdown`, gate R4: measured 0.53x, last shot ~2 s); the last composition holds long enough to read and covers at least `NORMS.frames.minCoverage`; the last line stays legible for `NORMS.caption.minLegibleS`; it closes on the opening device (bookend) or a quiet card; a call to action, if any, lives in the film's own world; the last move resolves, no blur.
- 5: a blurred smear, then a row of tiny thumbnails on a tiled ground; a template end card; a call to action that breaks the register (dark UI, cream page); a hard stop with no hold; the kicker adds a new fact.
- Tells: tell 15, `C6`, `K9`, `odd #4` (CTA break).
- Gates/norms: R4, T5 on the last frame.
- See: `end.png` (last 3 s at 4 per second), then the last frame full size; count seconds from the final move's end to the end.
- Owner: animator (move, hold), storyboard (final board), art director (end card), writer (kicker line).

---

## Cross-cutting: always 🔴

A placeholder or unknown asset shown at any length (P1: a flat box, "PORTRAIT"-style label, missing-asset tile, lorem); a production leftover (watermark, software UI: `odd #9`); text cut by the frame edge or over text (T4); a key noun with the wrong picture (H1); a caption you cannot read at 360 px; a still hold over `NORMS.rhythm.maxStillHoldS` under the voice (M1); every 🔴 in the checks files.

## The odd-tell table (grammar section 11) as a checklist

| # | Tell | Default | Where to look |
| --- | --- | --- | --- |
| 1 | Pasted cut-out: no rim or contact shadow, clean straight edge, grain, resolution or temperature unlike its neighbours | 🟠 (🔴 if every cut-out) | D9, 200% crop of an edge |
| 2 | No focal point: equal weight, even gaps, no empty area | 🟠 (🔴 with T6) | D6 |
| 3 | Unreadable type: small, low contrast, over faces, bright sky or a logo | 🔴 | D4, 360 px |
| 4 | Register or style break without a separator (dark UI outro, sepia switch, emoji against 3D) | 🟠 (🔴 at the end card) | D10, D12 |
| 5 | Low-res or mismatched footage shown raw | 🟠 | D9 |
| 6 | Generated plates drift in style | 🟠 | D9 |
| 7 | Overlap or frame-crop held too long | 🟠 (🔴 if text is clipped) | D6, D7 |
| 8 | Dead hold | 🔴 over the gate, 🟠 under it | D3, M1 |
| 9 | Production leftovers (watermark, software UI) | 🔴 | cross-cutting |
| 10 | Floating labels with no tie to their object | 🟠 | D5 |

## Not a defect (grammar section 12 rulings; do not flag)

| Looks like a flaw | Verdict | Source |
| --- | --- | --- |
| A cut while the camera is still, or a cut with no motion to follow | fine: the voice covers the cut in narrated collage | `grammar §12` #1 |
| One or two 2x punches | fine as a rare accent (`NORMS.camera.punchMax`, max 2 per film); a habit is T7 | `grammar §12` #2 |
| No 12 fps stepping | fine: a house style of one source, 91 of 165 pieces | `grammar §12` #3 |
| A front-loaded ease-out (fastest in the first quarter) | the most common single shape; only linear is a defect (T8) | `grammar §12` #4 |
| A big stressed word over a small running caption | fine: distinct roles | `grammar §12` #5 |
| A flat colour ground | fine when it carries grain; vector-clean flat fields on a whole act is D10 | `grammar §12` #6 |
| A small lowercase serif caption with no box instead of uppercase in a pill | fine: register-dependent; judge legibility only | `grammar §12` #7 |
| Pure black or white grounds | untested: not a defect on its own | `grammar §12` #8 |
| Caption cap height near 3% of frame height | the measured register-A caption; the old ">= 4%" is retired in favour of `NORMS.caption.capHeight` | `grammar §7`, §12 |
| A hook not cut faster than the body | correct: the opening 3 s are at the body rate | `grammar §10` |
| A dissolve at a time jump, chapter turn or payoff | fine; a dissolve on an ordinary cut is D3 | `grammar §3` |
| A fast flick run under a list of names | fine; the same under reasoning is D3 | `grammar §1`, `zhylin.md` 2 |

Moran-only tells are technique you can judge only from the pixels; a texture-strength or blend-mode choice you cannot see is `unverified`, not a finding.
