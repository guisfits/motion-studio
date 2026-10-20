# Severity, scores, the verdict, and who owns a defect

## 1. Severity

| Icon | Meaning | Test |
| --- | --- | --- |
| 🔴 | Visible at first watch, or breaks the film's contract | A stranger notices it on the first pass at phone size, OR it breaks voice = picture = lettering, readability or finish, OR a deterministic gate in `crew/checks-*.md` is red |
| 🟠 | Craft: makes the film look cheap | Seen on the second look or in a strip; the film still reads |
| 🟡 | Polish | Only a professional would name it |

Always 🔴, whatever the dimension:

1. A placeholder on screen (grey or flat box, "PORTRAIT"-style label, missing-asset tile, lorem), any length (P1).
2. A spoken key noun with the picture of something else, or a lettering word the narrator never says (H1, S4, S5).
3. Text cut by the frame edge, or text over text (T4).
4. A caption legible for less than `NORMS.caption.minLegibleS`, over `NORMS.caption.maxCps`, or over `NORMS.caption.maxWords` words (T1, T2, T3). Observed in the render counts even if the checks missed it: say the checks missed it.
5. A caption you cannot read at the 360 px sheet (contrast, size, or sitting over a face or logo: `odd #3`).
6. Any frame, the last included, whose pieces cover less than `NORMS.frames.minCoverage` (T5; a frame at the limit passes). A single hero on a quiet ground with most of the frame empty is above it and is not a defect (grammar section 6).
7. A frozen window of `NORMS.frames.deadWindowS` or more (M1), or a hold of `NORMS.rhythm.maxStillHoldS` or more with no edit event and a still camera (R1's still hold, which the gate marks 🟠: the eye makes it 🔴).
8. A watermark, software UI or other production leftover (`odd #9`).
9. Every red finding of the checks files you were given, copied with its code. A gate is a floor, not a verdict.
10. Nothing is a pass by absence: a missing or stale checks file, a missing sync sheet, or a pass you could not do is a written gap, and the verdict cannot be APPROVED while it stands.

If a gate is green and the eye says broken, the eye wins and the gap is reported (`norm: none`). If a gate is red and the eye says fine, the gate stands (it is listed with the code) and the gap is reported: the Director owns changing a norm.

## 2. Scores

- Integer 1-10 per dimension, one line of evidence each, with a `t`.
- Start at 10 only if the dimension has no 🟠 and no 🟡 and you can name a moment you would show as a reference. Otherwise start at 9.
- Each 🟠 in the dimension: minus 1. Each 🟡: minus 0.5, rounded down.
- Any 🔴 in the dimension: at most 4.
- A suspected defect you could not frame-verify: do not score above 7; list it under "Unverified".
- A dimension you could not assess (sound with no way to hear, a stage where it does not apply): write `not heard`, `not seen` or `not assessed (reason)`, score 7 at most. For a stage where the rubric says it does not apply, the gate for that stage does not count it; for a stage where it applies, the gate fails until the Director supplies the evidence.
- Never average. The lowest score sets the film.

## 3. The verdict

Per stage (the Director names it):

- Animatic: **CLEAR** when zero 🔴 and every dimension that applies scores 8 or more; otherwise **NOT CLEAR**. It clears the animatic touchpoint, not the film.
- Draft: **APPROVED** needs the conditions below with D11 `not assessed (no mix)`; otherwise NOT APPROVED. It clears picture lock.
- Final: **APPROVED** only if all of: zero 🔴, every one of the twelve scores 8 or more, the inputs complete and fresh (render, sync sheet, the `checks-<stage>.md` files for the render's stage, each newer than the render and without a 🔴), all three passes done.

Otherwise **NOT APPROVED** (or **ESCALATE** after round 2). No "approved with notes", no "approved pending fixes". With only 🟡 left and every score 8 or more it is APPROVED and the 🟡 are listed.

Pressure is not evidence. "It is basically done", the deadline, the client waiting, "that was intentional" change nothing; only a changed render or new evidence moves a score. A claimed intent is written down and ignored: the viewer does not get the note. A request to "just say it is fine" gets the same review and, if it fails, the same verdict, politely. You never fix, suggest a fix or edit another role's artifact.

## 4. Rounds

- At most two fix rounds. Round 1 is the first review.
- Round 2: first move `crew/review.md` to `crew/review-round1.md`, then write a new `review.md` that begins with one line per round-1 defect: `closed`, `open` or `regressed`, verified in a frame at the same `t`. Then review the whole film again; a fix can break another dimension.
- After round 2, a film still failing is **ESCALATE** with the reason in one line. The Director takes it to the client. No round 3.

## 5. Naming the norm

The `norm` of a defect, in order of preference:

1. a `NORMS.*` key exactly as in `core/checks/norms.mjs`, never with a different number;
2. a gate code (below);
3. a grammar row: `odd #n` (grammar section 11), `grammar §x` for a device range;
4. a craft source: `tell n`, `craft §2.5`, a postmortem id `C3`/`K4`, `moran/<reel>`, with the rubric dimension (`D4`);
5. `none`: no gate or norm exists. Say what a check would measure; the Director decides whether to add one. Known gaps: hook strength, paper and texture, piece-motion feel, colour and type counts, ending hold length.

Gate codes: `S1` no hero, `S2` hero not in manifest, `S3` key off its word, `S4` lettering not in the line, `S5` lettering off its word or unspoken, `S6` two marks within a second, `S7` asset not usable, `S8` beats overlap or gap, `S9` beats do not cover the narration, `S10` one picture of a person in two scenes, `H1` hero not on screen at its key word, `P1` placeholder or unknown asset on screen, `T0` trace error, `T1` caption cps, `T2` caption legible time, `T3` caption words, `T4` text crosses the frame edge, `T5` coverage (ground excluded), `T6` hero off the middle third, `T7` emphasis move scale delta and punch cap, `T8` linear camera run, `T9` zoom target inside the safe box, `T10` caption cap height, `T11` caption contrast, `R1` average event length (red) and still hold (orange), `R2` events per 10 s, `R3` words per event, `R4` last 5 s slower than body, `M0` unreadable media, `M1` dead window, `M2` loudness, `M3` loudness range, `M4` SFX density, `M5` SFX cue span over a word (orange), `M6` SFX stem without its cue list, `F1` narration length, `F2` missing render.

Settled: grammar section 6 measures a single hero on a quiet ground with 40-90% of the frame empty, and `NORMS.frames.minCoverage` was set so such a frame passes T5; only a practically empty frame (pieces under the limit) is red. A T5 red is listed as-is; a quiet ground over the limit is never a row.

## 6. Who owns what (the Director routes; you only name)

| Defect class | Owner |
| --- | --- |
| Claim, fact, wording, opening line, kicker, narration length and speed | writer |
| Which picture for which word, hero/support, lettering word and time, beat length, breath-card placement, punch placement, final board | storyboard |
| Caption size, contrast, plate, safe zone; palette, accents, type voices, grounds, textures, tiling, end card, one-treatment rule, rim and torn-edge style | art director |
| Wrong or unrecognisable subject, placeholder, untreated photo, cut-out edge, rim, shadow, asset crop, unlicensed asset, footage that cannot survive the treatment | archivist |
| Camera, piece motion, arrival timing, draw-on and landing, caption timing and chunking, layout, clipped text, holds, events and cut density | animator |
| Loudness, SFX placement and count, music, ducking, voice intelligibility in the mix | sound |
| Pace (where the holds and cards go), register, hard cut vs dissolve, anything touching two roles, scope, a conflict between a gate and the eye | director |

When two roles could own it, name the first and write "and <second>". Never route a defect to yourself.
