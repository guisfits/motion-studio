# Moran on cuts, zoom and calm pacing: what he says, what the crew says, what to change

Scope: client note 2026-10-17, "go deep on cuts and zoom" and "calm pacing for instructive videos"
(60-120 s story + ~30 s app, viewer relaxed, not anxious). Sources: `tutorials/chrismoran/lessons.jsonl`
(ids are `reel t`, cited as `moran/<reel>`), `recipes.md`, `reels-1..4.md`. Crew side read: `skills/film-animator/SKILL.md`
(step 7, tell 4), `references/devices-rhythm-camera.md`, `skills/film-director/references/pace-playbook.md`,
`research/editing-grammar.md` §1, §10, §12, `tools/checks/norms.mjs`. Nothing was edited.

> Superseded scope (client, 2026-10-19): the story is ≤ ~90 s + 15–30 s app with a lively voice, not 60–120 s calm (`research/second-film-postmortem.md` R1). The camera findings below still stand.

## 0. Honest limits of the source

- Moran says **very little** about cuts and zoom. Three reels carry all of it: `DOb0h6VCSpM` (cut on action, 31 s),
  `DaDhDFjAysT` (cutting the curve, ~40 s), `DPcvDgNDNM4` (cut at the curve peak, 33 s); zoom lives in `DLQ4Wp9pqv3`,
  `DZFqNzwAqVa`, `DZsDDmvtNJP`, `DdKZ5oBpPCW`, `DLdy8b5JpHC`. Several lessons say "values not stated".
- He has **no lesson on pacing for teaching vs ads, on rest, or on anxious viewing**. Every reel is a 30-48 s social
  tutorial with a hook. Calm-pacing rules below are marked **(inferred)** where they combine his smooth-ease and
  slow-zoom statements with the marimba lesson; none is a Moran quote.
- His own films are the "ad / documentary-social" register the crew already measured (register A, grammar §0). The
  instructive register is a **new target**, not something Moran or the 165 measured pieces cover.

## 1. Moran's rules on cuts

| # | Rule | Lesson id and quote (<=15 words) | For a narrated paper-collage explainer |
|---|---|---|---|
| C1 | Cut while something moves; the eye follows the mover. | `moran/DOb0h6VCSpM 0:02-0:15` "a cut dropped mid-motion goes unnoticed" | Useful only when the picture changes **off** a voice boundary (caption-only beat, mid-phrase swap). Where the cut sits on a phrase boundary the voice covers it (grammar §12 row 1 still holds). |
| C2 | A cut on a still frame is jarring. | `moran/DOb0h6VCSpM 0:21-0:24` "A cut on a still frame calls attention to itself." | For calm films this is partly right: a hard cut with nothing moving, on a quiet voice, can pop. Cheap fix: the outgoing shot is already drifting (never-static still) and the incoming hero is already settling; no new device. |
| C3 | Cut at the **fastest point of the move** ("cutting the curve"). | `moran/DaDhDFjAysT 0:17-0:22` "make the cut there" (peak ~1500 %/sec, ~1 s into the move) | Engine already has `cutAtPeak` (`core/lib/motion.js`). Applies to `into-frame` and push-then-cut joins. At calm speeds the peak is low, so the cut is easier to see: use it for the 1-3 emphasis joins, not for every cut. |
| C4 | Both shots share the same motion across the cut. | `moran/DaDhDFjAysT 0:13-0:17` "share exactly the same movement" (image 2 parented to image 1) | The next shot starts at the outgoing shot's pose and direction: same-direction continuation. Matters more than speed for smoothness. |
| C5 | Momentum direction continues across the cut. | `moran/DPcvDgNDNM4 0:08-0:25` "momentum flows straight into the card's rotation in the same direction" | Rule for `join: "match"` and flash/paper-wipe joins: the incoming move keeps the outgoing vector. Never cut a rightward drift into a leftward one. |
| C6 | Scale pair for the cut: 111 % -> 153 % with ~97 % ease influence. | `moran/DaDhDFjAysT 0:09-0:14` "strong ease so the move has a sharp speed peak" | This is the **fast** (ad) recipe: spike curve, ~1 s. It is the opposite of a calm move (see Z3). Do not import it into the instructive register. |
| C7 | Cut-ins as a camera null jump. | `recipes.md` L174, "Foux Camera": scale 103 -> 403 % in one frame | A hard cut-in, 4x. Out of scale for calm films. Counts as a punch under T7. |
| C8 | Flash frames bridge a memory/scene change. | `moran/DMDyGp6Jwwx 0:30-0:34` "a flash reads as a memory cut" | Time-jump join only. No numbers. Never a train in a calm film (see Z8). |

Takeaway: Moran's cut rules are **about hiding the edit**. That is a goal for an ad that cuts every 1.2 s. In an
instructive film with a cut every 3-6 s, the edit is allowed to be seen; what must be avoided is the **jarring**
cut (C2) and the direction reversal (C5).

## 2. Moran's rules on zoom, push and punch

| # | Rule | Id and quote (<=15 words) | Numbers | For us |
|---|---|---|---|---|
| Z1 | One parent "Zoom" null holds the camera move; art layers are parented to it. | `moran/DLQ4Wp9pqv3 0:04-0:21` "animated on that null, not on each layer" | scale/position on one null | Already the engine design (`table.camera`). Nothing to add. |
| Z2 | Moves use **long** eases. | `moran/DLQ4Wp9pqv3 0:12-0:17` "long smooth eases read calm and polished" | 1-2 s; one smooth bell, slow start and slow end | The only explicit "calm" statement in the corpus. Our `glide` reaches 95 % in 0.62 s and is front-loaded (peak 0.15 s, devices table), so a **single key is shorter and snappier than his bell**. A 1-2 s bell needs stacked `glide` keys 0.4-0.5 s apart (reach 0.92-1.02 s) or a new ease. |
| Z3 | The spike curve (fast middle, long flat tails) is for excitement. | `moran/DPcvDgNDNM4 0:03-0:08` "quick motion creates excitement" | influence ~90 %+ | Moran himself separates "calm bell" (Z2) from "excitement spike" (Z3). The instructive register wants Z2 only. Grammar §12 row 4 mixed them. |
| Z4 | Slow zoom on a still, "like a physical photo being filmed". | `moran/DZFqNzwAqVa 0:16-0:20` "slow zooms so it feels like a physical photo being filmed" | 108 % -> 115 % (about +7 %), on a Zoom null | A drift-class move: ~7 % over the shot's life. Duration not stated; recipes say 4-8 % (reels-3 L136). |
| Z5 | Slow dolly/pan for parallax on separated planes. | `moran/DZsDDmvtNJP 0:31-0:37` "slowly dolly or pan the camera so the planes shift" | x 683 -> 1102 over the shot; speed "slow" | Layered parallax; slow only. |
| Z6 | Drift the light, not the picture. | `moran/DdKZ5oBpPCW 0:34-0:38` "slow Position keyframe so the light gently drifts" | Multiply shadow plate, slow | A calm alternative to a camera move for depth: moves the shadow, not the frame. |
| Z7 | Punch in/out ~2x to extend a scene, "always timing the change on motion". | `moran/DOb0h6VCSpM 0:24-0:31` "punches in and out of scenes a lot" | 1x <-> 2x; reels-2 build: 1.0 -> ~1.15 across the cut | His "a lot" is what grammar §12 row 2 contradicts (3 % of pushes). His own build note (1.15) is already the crew's ordinary push. |
| Z8 | Focus-hunt blur belongs on a zoom or fast move. | `moran/DLdy8b5JpHC 0:17-0:21` "motion masks the effect and sells camera realism" | Blur 0 -> 4 -> 6 -> 0 px; recipes 0->8->18->5->0 over 18 f; zoom 100 -> 200 %, 30 f, influence 80 % | Short, attached to a fast zoom (0.5-0.8 s). Skip on calm pushes; blur-in-and-out is itself a flutter. |
| Z9 | Shake / wiggle is a style tool, not default. | `moran/DMtlFlxJ6sg caption` "choppy handheld look of the ad" (wiggle on 3D camera); `moran/DO60IqNif6o` preset includes "Subtle Camera Shake" | wiggle values not stated | The opposite of calm. Forbidden in the instructive register; allowed in ad register. |
| Z10 | "Subtle" and "do not overcook" is repeated for every finishing layer. | `moran/DMWEwQRp6aD 0:12-0:22` "keep it light, eyes notice more than we think" | grain ~0.5; vignette subtle | General restraint rule. Supports a low cap on stacked movement per frame (move + flicker + shake + glow wiggle). |

Not stated by Moran, so unsupported by the corpus: hold after a zoom, zoom frequency per minute, scale amount for a
"calm push", a maximum speed. Everything on those is crew inference or grammar-measured (register A).

## 3. Pacing for teaching vs ads, rest, breathing room

What Moran actually says (all indirect):

- **Calm = smooth and long**: Z2 above ("calm and polished", 1-2 s eases). Only direct use of "calm".
- **Music that does not compete**: `moran/DLnuz5ZJ6Ys 0:19-0:31` "Neutral emotion keeps focus on information" (marimba, below ~1 kHz, voice band left free).
  This is the one lesson written for an *explainer*: neutral bed, voice on top, information first.
- **Hook with a gap, then a roadmap**: reels open with a 2-6 s hook ("why?" beat, `moran/DLTLw1DpgwE 0:00-0:07` "The question beat resets attention") and a step list. Useful as a pacing device: a deliberate pause as a question.
- **Zoom/blur as punctuation, motion as cover** (C1, Z7). No lesson on holds, silence, rests, or how long a viewer can look at a picture.

What this means. Moran's corpus is an ad/social register where retention is the goal ("keeps the viewer engaged",
Z7). For a 60-120 s instructive film the goal is the opposite: keep the viewer *comfortable*. Derived rules **(inferred)**:

1. Choose motion by purpose: **emphasis** = a gentle push to the named detail; **life** = a slow drift; **nothing else**. Fast curves (C6, Z3), flicker at 15/s (`moran/DMWEwQRp6aD 0:22-0:28`), shake (Z9) and flash trains are ad tools.
2. Move *slow and long*, rest *long*: Z2 bell 1-2 s, then hold on a settled frame so the caption/label is read before anything else moves.
3. Rest follows information: the pause after a definition, a number, an answer. Moran's only equivalent is the one-line hook/CTA beats; the crew's paper breath card (pace-playbook) already fills this role.
4. One thing moving at a time: Moran's own "only one text animation at a time" (`moran/DLTLw1DpgwE`) generalises to camera + entrance + lettering. Grammar §12 row 5 kept this as partial.
5. Never reverse direction across a cut (C5) and never stack a punch on a punch.

## 4. Rule -> crew today -> gap -> proposed edit

| Rule | Crew says today | Gap / conflict | Proposed exact edit |
|---|---|---|---|
| C2 cut on stillness is jarring | `pace-playbook.md` L76: "Moran 'cut on action' (§12.1): contradicted for narrated collage; the voice covers the cut." | Over-broad: true for voice-led phrase cuts at ad pace, not for a slow cut on a quiet instructive line. Nothing says outgoing/incoming pictures must be moving. | `pace-playbook.md` L76, replace with: `Moran "cut on action" (§12.1): contradicted for fast narrated collage, the voice covers the cut; in the instructive register a cut still needs both pictures in motion (drift or settle, never a dead hold), so the edit is not announced (moran/DOb0h6VCSpM 0:21-0:24).` |
| C4, C5 same direction across a cut | Absent. `devices-rhythm-camera.md` L8 only says a cut key resets the pose. | No rule about the pose/vector at the cut. | `devices-rhythm-camera.md`, after L8 add: `- Direction at a cut: the incoming shot starts moving in the outgoing shot's direction (pan right into pan right, push into push); a reversal across a hard cut is the jarring cut (moran/DPcvDgNDNM4 0:08-0:25).` |
| C3 cut at the curve peak | L89 of the same file covers `cutAtPeak` for late-peak moves. | Fine; tied only to "late peak". | No edit. Optional: in SKILL step 9 add `(cutAtPeak for into-frame and push joins)`. |
| Z2 long smooth ease 1-2 s | `SKILL.md` L56 step 7 lists devices, no duration. Grammar §12 row 4 "Partial". `glide` single key is 0.62 s and front-loaded. | No instructive-register ease; the long bell is only reachable by stacking keys. Z2 is "calm", but the crew treats it as contradicted. | `devices-rhythm-camera.md` L90 (after "Tell: every move the same shape"), add: `- Calm register (NORMS.registers.instructive): emphasis moves are a bell of 1-2 s (two stacked glide keys 0.4-0.5 s apart, reach 0.92-1.02 s); no whip, no spike (moran/DLQ4Wp9pqv3 0:12-0:17 vs DPcvDgNDNM4 0:03-0:08).` |
| Z3 spike = excitement | `devices-rhythm-camera.md` "Snap, then settle" is the default for every film. | Default is the fast shape; Moran labels it excitement. | Same file, "Snap, then settle", How: append `In the instructive register a snap is limited to the one emphasis row per beat; the default is the stacked glide.` |
| Z4 slow zoom +7 % | "Never-static still" (L66-69) says 1-3 % drift, holdRate 1 %/s. | 7 % is above the drift in the file (1-3 %) but below T7 push (15 %). No class between. | `devices-rhythm-camera.md` L69 (Tell/Fix): change `Fix: 1-3 % drift or an idle loop` to `Fix: 1-3 % drift, up to ~7 % over the shot on a held plate (moran/DZFqNzwAqVa 0:16-0:20), or an idle loop`. |
| Z7 punch "a lot" | `pace-playbook.md` L77, `SKILL.md` L79 tell 4, `NORMS.camera.maxPunches: 2`. | Fine for ads. Instructive film of 60-120 s with 2 punches is still too many for "relaxed". | See section 5: `maxPunches` 1 in the instructive register. No skill text change beyond the register pointer. |
| Z8 focus hunt on fast zoom | Not in the camera devices (only in `skills/_shared/moran.md`, focus hunt). | Needs a rule that it is off in calm films. | `devices-rhythm-camera.md` "Punch-in to the named detail" How: append `Focus-hunt blur only with a punch (>= NORMS.camera.punchMax); never on a push under it.` |
| Z9 shake/wiggle | Not stated. | Could be copied from Moran's "Mixed Media Treatment" preset. | `SKILL.md` L79 (tells), add as tell 6: `**Anxious motion** (moran/DMtlFlxJ6sg, DO60IqNif6o): camera shake, wiggle(12,2) gate weave on the camera, flicker above 2 Hz, flash trains. Off in the instructive register; the paper breathes, the camera does not shake.` |
| Teach vs ad pacing | `pace-playbook.md` L11-15: registers A/B/C by aspect and narration; all gates calibrated for A. | No register for **instructive pace**. A 16:9 or 9:16 film at 2.4 w/s with 4 s pictures fails R1/R2 (below 4.7 events/10 s). | `pace-playbook.md` Register table (L11-15), add a row: `\| **A-i** instructive narrated explainer \| the brief says "instructive" or "calm", 60-120 s story + ~30 s app \| NORMS.registers.instructive replaces NORMS.rhythm and the camera caps; the cuts follow the phrase, not the word \|`. |
| Rest / breath | `pace-playbook.md` L34-39: breath card every 10-20 s, 0.8-1.5 s. | Fine as a floor. For instructive, rest after each definition/number, 1.0-2.0 s. | L38 "Measured" add: `Instructive register: a settled hold of >= 1.0 s after every definition, number or answer (inferred; no Moran lesson).` |
| Film length | `norms.mjs` L73-75: `film: { minS: 45, maxS: 120 }` (client 2026-10-17). | Brief asks 60-120 s. Floor 45 allows a rushed film. | See section 5. |
| Grammar §12 | Rows 1, 2, 4 flatten Moran into "contradicted". | They are right for register A but hide two things: C2 is partly true, Z2/Z3 are two different things. | `editing-grammar.md` §12 row 1 Verdict: append `; in a calm register Moran's still-frame cut is the right test`; row 4 Verdict: append `; Moran's long bell (Z2) is the calm shape, his spike (Z3) the excitement shape`. |

## 5. Proposed instructive register (NORMS)

Reasoning, from what exists:

- The gates (R1-R4, T7) are fitted to the 165 pieces: median 48 s, 3.0 w/s, 8.3 events/10 s, ASL 1.17 s. A 60-120 s film
  that must relax the viewer cannot cut every 1.2 s; at the same density 100 s would be ~83 events. R1 (ASL 0.7-2.1 s)
  and R2 (>= 4.7 events/10 s) would flag a calm film red/orange for being calm.
- Narration for teaching in pt-BR is slower than the 3.0 w/s median. I propose a design speed of ~2.4-2.6 w/s
  (inferred; the pro `ee` sub-set, a business explainer, is 2.6 w/s with 6.9 events/10 s, ASL 1.40 s, the closest
  measured cousin; register C averages 0.96 s ASL but is footage-led).
- Events must still follow the phrase (phrase-locked, grammar §10.1). The instructive register changes **how many
  nouns get their own picture**, not the lock: one picture per clause instead of per noun; caption-chunk swaps inside
  it carry the phrase. This keeps H1 untouched.
- Camera: the instructive register has one emphasis move per beat at most, always a bell (Z2), no whip, no shake.

Numbers (all `~ own` unless a source is given; intended as a **separate frozen block**, not an edit of A):

```js
// ~ client rule (2026-10-17) + own: instructive narrated explainer, 60-120 s story.
registers: Object.freeze({
  instructive: Object.freeze({
    film: Object.freeze({ minS: 60, maxS: 120 }),
    appSegment: Object.freeze({ minS: 25, maxS: 40 }),     // ~30 s; same as NORMS.appSegment bar, tighter floor
    rhythm: Object.freeze({
      aslRange: Object.freeze([1.4, 3.8]),                  // s per edit event; A is [0.7, 2.1]
      eventsPer10s: Object.freeze([2.6, 7.0]),              // A [4.7, 13.8]; ee p10 is 4.7 so this is below every measured piece
      wordsPerEvent: Object.freeze([3.5, 8.0]),             // A [2.1, 5.5]; at 2.5 w/s = 1.4-3.2 s per event
      endSlowdown: 0.75,                                    // unchanged
      maxStillHoldS: 6,                                     // A 4; only with idle life or caption swaps inside
      restAfterKeyS: 1.0,                                   // new: settled hold after a definition, number or answer
    }),
    camera: Object.freeze({
      emphasisMinScaleDelta: 0.12,                          // A 0.15; gentler push still counts as a push
      maxPushRatePerS: 0.12,                                // new: |dscale/dt|/scale, emphasis moves; A's median push is x1.14/1.4 s = ~10 %/s
      minMoveS: 1.0,                                        // new: an emphasis move spans >= 1 s (Moran 1-2 s)
      maxPunches: 1,                                        // A 2
      punchMax: 2.0,                                        // unchanged
      forbidShake: true,                                    // new: no camera wiggle/shake, no flicker > 2 Hz, no flash train
      holdRate: 0.01,                                       // unchanged
      maxLinearRunFrames: 3,                                // unchanged
    }),
  }),
}),
```

Why each value:

| Key | Value | Reason |
|---|---|---|
| `film.minS/maxS` | 60 / 120 | The brief. Current `NORMS.film` is 45-120 with a client comment ("instructive films take their time"); the floor 45 lets a hurried cut through. The 60 s floor also applies only to this register so ad films keep 45-90. |
| `appSegment` | 25-40 | ~30 s target. Current 20-40 allows a 20 s app section, which is too short to show the product at calm pace. |
| `rhythm.aslRange` | 1.4-3.8 | Calm film's average edit every ~2.5 s. Floor 1.4 is the `ee` median, ceiling keeps it from becoming a slideshow (R2 low end still bites). |
| `rhythm.eventsPer10s` | 2.6-7.0 | 100 s -> 26-70 events instead of 47-138. Fits 2.5 w/s * 10 s = 25 words / 3.5-8 words per event = 3-7 events. |
| `wordsPerEvent` | 3.5-8.0 | A median is 3.5; the instructive median becomes ~5. Picture per clause, caption chunks inside. |
| `maxStillHoldS` | 6 | Longest A shot p90 is 7.8 s, median 4.6 s; the instructive hold is longer, but never frozen (M1/deadWindow stays 4 s because the idle life / drift counts as change). |
| `restAfterKeyS` | 1.0 | Inferred (no Moran source); a number or definition must be read before the next event. A gate can check: no event inside 1.0 s after a row tagged `device: "hold"` or `key`. |
| `camera.maxPushRatePerS` | 0.12 | A's ordinary push x1.14 in 1.4 s is ~10 %/s of scale; calm is the same size over >= 1 s. It is the clearest numeric difference from Moran's C6 (111 -> 153 % in ~1 s, spike). |
| `camera.maxPunches` | 1 | A punch is the one "this matters" beat; in a 100 s film at most one before the close. |
| `camera.forbidShake` | true | Z9 and the choppy-handheld lesson are the anxious tools. Check: no camera key with `wiggle` field (engine has none today, so cheap to enforce in `archive/engine-v1/core/checks/trace.mjs` by flagging a frame-to-frame camera-position reversal over 3 consecutive frames). |

Implementation notes (engine side, outside this file's task, listed for the director to schedule):

1. `tools/checks/rhythm.mjs` L17 reads `const R = NORMS.rhythm` at import; `picture.mjs` L66-73 and `trace.mjs` L264-279 read `NORMS.camera`; `run.mjs` L80-87 reads `NORMS.film` and `NORMS.appSegment`. To use a register block the checks need a `norms` argument chosen from `sheet.register` (default `"A"`). Without that change the instructive film is graded by A's gates.
2. A new sheet field `register: "instructive"` (storyboard owns the sheet) drives the choice; the brief line `Register: A-i` (pace-playbook L17 pattern) is the human side.
3. Gates that stay A-calibrated regardless: H1, S-gates, T9, T10/T11, M0/M1, audio.
4. Document the new block's source lines as `~ client rule` / `~ own`, as the existing norms comments do, so reviewers see they are not measured.

Files and exact lines to touch when approved (do not edit now):

- `tools/checks/norms.mjs` L35-44 (camera), L45-59 (rhythm), L73-78 (film, appSegment) -> add `registers.instructive` block; keep A.
- `tools/checks/rhythm.mjs` L17, L71; `tools/checks/picture.mjs` L66-73; `archive/engine-v1/core/checks/run.mjs` L80-87 -> read norms by register.
- `skills/film-director/references/pace-playbook.md` L11-15 (register table), L38, L76.
- `skills/film-animator/SKILL.md` L56 (step 7: add `In the instructive register: bell eases of 1-2 s (NORMS.registers.instructive.camera), one emphasis per beat, no shake`), L79 (add tell 6).
- `skills/film-animator/references/devices-rhythm-camera.md` after L8, L69, L83, L90.
- `research/editing-grammar.md` §12 rows 1, 4.

## 6. Open questions for the director

1. Register switch: one `register` field on the sheet (recommended) vs. a CLI flag. Recommendation: the sheet field, so the trace and the report page agree.
2. Do we keep the A-register lower bounds (R1 low = fastest allowed cut) in the instructive register? Recommendation: yes for `wordsPerEvent` high end only; no rule against *too slow* beyond R2 low and the 6 s hold, because "too slow" is a content problem the reviewer catches.
3. Should the 12 fps stepped camera stay on in instructive films? Moran pairs smooth long eases with stepped frames (`DLQ4Wp9pqv3`: "calm ... against the stepped frame rate"); step the pieces, keep the camera on ones. Recommendation: camera on ones, pieces stepped, as the art director's style bible decides.
4. Moran does not support a number for "calm"; all numbers in section 5 are `~ own` and unvalidated. Recommendation: run one instructive pilot film, measure its actual events/10 s and push rates, then fit the block to it before locking.
