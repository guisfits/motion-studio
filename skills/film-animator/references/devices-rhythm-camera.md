# Devices: rhythm and camera

Device -> when -> how in this engine -> measured range -> tell and fix. Sections cite `research/editing-grammar.md` as `grammar §n`; ids like `hex/DUiOWpiCare` are pieces measured there (`grammar` header explains them). `[tested]` = computed with the engine's own functions while writing this file (`spring`, `EASE`, `stepped` in `core/lib/`); `[eng]` = engine code read; `~` = inference. Numbers that a gate checks are `NORMS` keys.

## Engine facts the devices rely on

- Camera keys: `table.camera([[t, { x, y, z, r, ease, cut }], ...])`. `ease` names `glide`, `move` or `whip`; any other name silently falls back to `move` `[eng table.pose]`. Each key adds its own spring, so overlapping keys stay continuous `[eng]`.
- A `cut: true` key resets the pose: at the cut frame the camera is exactly the key's values, a field the key omits keeps the previous resolved value, and later keys ease from the cut pose; the move that was in flight does not carry its remaining travel across (`core/lib/table.js`, test in `tests/table.test.mjs`). Key the cut at the pose you want. There is no compensation to add. A cut is silent and never blurred `[eng]`.
- Direction at a cut: the incoming shot starts moving in the outgoing shot's direction (pan right into pan right, push into push); a reversal across a hard cut is the jarring cut (`moran/DPcvDgNDNM4` 0:08-0:25).
- Single-key shapes `[tested]`:

| ease | reaches 95 % | within 1 % from | speed peaks at | overshoot |
|---|---|---|---|---|
| `glide` (k 48, d 13) | 0.62 s | 0.82 s | 0.15 s | 0 |
| `move` (k 95, d 17) | 0.40 s | 0.48 s | 0.11 s | 0.4 % |
| `whip` (k 260, d 30) | 0.26 s | 0.35 s | 0.07 s | 0 |

- Every single key peaks in the first quarter of its travel (24-27 % of the time to 95 %): the front-loaded "snap, then settle" shape. A mid-peak or longer move is two or three keys of the same ease, each carrying part of the travel `[tested]`:

| keys | offset | reaches 95 % | within 1 % from | speed peaks at |
|---|---|---|---|---|
| `glide` x2, half each | 0.25 s | 0.79 s | 1.00 s | 0.36 s |
| `glide` x2, half each | 0.40 s | 0.92 s | 1.14 s | 0.52 s |
| `glide` x2, half each | 0.50 s | 1.02 s | 1.24 s | 0.63 s |
| `move` x2, half each | 0.20 s | 0.54 s | 0.64 s | 0.28 s |

- The table breathes while it holds (`breathe`, default 1): about +-20 px, +-1.2 % scale, +-0.35 deg, peak rate 0.36 %/s (`NORMS.camera.holdRate` comment). That is the floor of never-static, not a camera move.
- `stepped(t, 12)` at `NORMS.fps` holds a pose for 3, 2, 2, 3, 2 frames: 2.5 on average `[tested]`.
- A time goes into `table.draw(t)` and the trace from one function `T(t)` (`registration.md` 1.5).

## 1. Rhythm

**Phrase-locked cut.** The edit lands on the spoken phrase (grammar §1, §10.1).
- Measured A: one edit event per 3.5 words (p10-p90 2.1-5.5 = `NORMS.rhythm.wordsPerEvent`); at most two cuts per phrase (`hex/DSA2Hs3k06k`); the word-speed variant (shot median 0.17-0.24 s) only for a run of names, numbers or hype (`hex/DUiOWpiCare`, `hex/DPgS8B7CZoY`).
- How: a `cut: true` camera key (and `camera.shot` bumped) or a new hero registered from the cut frame, on the onset of the word that names the new picture (`hex/DN-WcdHiZCs`). The hero is on screen inside `NORMS.sync.heroWindowFrames` of the key word (H1); put the cut on the last of those frames, not after.
- The phrase boundaries come from the sheet and `words.json`; you do not retime them. A beat the sheet cannot carry at this density goes back to the storyboard (SKILL Hand-off).
- Tell: the voice outruns the picture (`hex/DNDJyk8pizL`); the picture arrives after the noun. Fix: earlier cut, never a later caption.

**Caption as the motion.** On a held plate, face or engraving the caption chunk changes and the picture does not (grammar §1).
- Measured A: ~20 % of cuts keep the picture (6-51 %, heuristic); the picture under it lasts 2-4 s (`hex/DY_8VpvCpeO`), up to 9.25 s on a talking head (`hex/DcO003cvlUI`, register C); 1-2 label swaps per engraving (`hex/Dd0qOzpqoYf`).
- How: the chunk replaces in place at a fixed position (`hex/DbnDiSLCtax`, `hex/Dbxj93xiCqg`); each swap is a caption event for R1-R3. Chunking and timing: `devices-type-data-life.md` 1. The chunk swap is the whole motion: nothing else needs to move on that beat except the never-static drift.
- Reading time and the measured swap rate meet: examples swap every 0.4-0.6 s (`hex/Dd0qOzpqoYf`), and `NORMS.caption.minLegibleS` sits inside that band; `NORMS.caption.maxCps` still lengthens a chunk of long words. A sentence delivered one word per card is a lettering/word-card beat (grammar §7 one word per card, ~0.3-0.4 s per word), registered as `lettering`.
- Tell: tiny low-contrast caption over a moving face (`hex/DcO003cvlUI`). Fix: the caption moves to a quiet area or gets a plate (the art director's caption system).
- Merging: a picture and its caption landing within `NORMS.rhythm.eventMergeS` count as one event. To count two, separate them by more than that; to avoid doubling, land them together.

**Count in steps.** A number or date advances in steps on one spot, then holds (grammar §1).
- Measured: three swaps of 0.3-0.4 s (`hex/DeBjyarCfFn`, register C: `$` -> `$17.` -> `$17.8 million`); a counter run of ~1.5 s (`hex/DXy2ea_ib-P`, `hex/DZmh9k_C2cp` 0 -> 532); years at ~0.3 s each, then a 2-3 s hold; ~8 ticks/s for an altimeter (`hex/Da44fBhCbJd`).
- How: `K.counter(...)` with `face: "type"` or `"odometer"` (fast, then each last step seen; the sequence of values is the writer's, in the sheet); put the number on an object (`ee/DZXDJ8AuAiU` flip board, `hex/Dc3B4rcCH18` placard); monospaced digits so they do not jitter (`moran/DaNlGAcgYsD`). The run ends on the spoken number's onset or just after; the final value holds >= `NORMS.caption.minLegibleS`.
- Tell: the number swaps instead of counting, or the digits jitter in width. Fix: steps from the writer's sequence, tabular figures.

**Flash train.** A run of 0.13-0.17 s white or glow frames on an intensity beat (grammar §1).
- Measured: 5-9 flashes of 0.13-0.17 s (`hex/DTC-mtEiT3S`); 4 in the first 1.9 s (`hex/DPBpZK4CbYi`); 32/165 pieces have >= 3 flashes at <= 0.2 s; the median piece has none.
- How: an overlay on the screen layer, alpha pulses of 4-5 frames at `NORMS.fps`, not camera cuts: pulses are not events for R1-R2, and the picture underneath changes at most once per train. `moran/DMDyGp6Jwwx` (a brightness spike over 4-8 frames centred on the cut).
- Budget `~`: one train per film at the beat the sheet marks as intensity (a climax, a threat word, the hook). A train on a sober topic is the odd register.

**Burst, then hold on the point.** A run of sub-second events resolves into one long hold (grammar §1).
- Measured: 8-12 clips in 4-5 s then 6 s (`hex/DcG_IX3P3vI`); five 0.13 s shots then 2 s (`ee/DZuVqDpO0Um`); longest shot per piece 4.6 s (2.9-7.8).
- How: the hold is a held picture with caption-as-the-motion and idle life (`devices-type-data-life.md` 4), never a frozen frame; it stays under `NORMS.rhythm.maxStillHoldS` of identical picture, and any 10 s window still carries `NORMS.rhythm.eventsPer10s` events (R2), so the caption chunks inside the hold are what keep the window legal.

**Decelerating ending.** The last 5 s cut at about half the body rate, last shot ~2.2 s (grammar §1, §10.5).
- Gate: R4, last-5-s event rate <= `NORMS.rhythm.endSlowdown` x body rate (measured 0.53x).
- How: fewer, longer pictures; the closing composition held ~2 s (`hex/DXUEoamgkj5`); bookend on the opening framing (`ee/DcJM47zIj-t`). A pull-out finale needs its collage built first (section 2, pull-out reveal).
- Tell: the CTA breaks the register (`pin/350009`, `ee/DcD4mcfIgey`). Fix: the CTA as a prop scene in the film's world; the director owns the call.

## 2. Camera

**Never-static still.** Every still carries a small push, pan or drift for its whole life (grammar §2).
- Measured A: camera mix by shots: hold 25 %, pan 23 %, drift 18 %, push-in 12 %, pull-out 11 %, rotate 10 %; 144/165 pieces move on >= 50 % of shots; push median x1.14 (1.05-1.48); push shot 1.4 s (0.4-3.4); pan shot 1.3 s (0.3-3.5); findings 1-10 % moves on paper, x1.01-1.09 on archival stills, x1.15-1.18 over 2 s.
- How: the table's breathing is the floor. Every picture held longer than ~1.5 s also gets a keyed move from the sheet's `zoom.kind` (`push-in`, `punch-in`, `pull-out`, `pan`, `tilt`, `drift`, `into-frame`; roll through `r`; `static` is the payoff row only, and still carries the breathing). A `drift` is a slow single key kept under `NORMS.camera.holdRate`, so T8 reads it as a hold. Exception, the fast montage: the camera holds and the cut is the move (`hex/DXUEoamgkj5`, 39 holds; `hex/DUiOWpiCare` zoom <= 1.12): 26 % of A shots have no camera move, and the voice covers the cut (grammar §12.1).
- Tell: a dead hold (`pin/349989`, 8 identical seconds). Fix: 1-3 % drift, up to ~7 % over the shot on a held plate (`moran/DZFqNzwAqVa` 0:16-0:20), or an idle loop; a still is a slideshow (`moran/DZsDDmvtNJP`).

**Stepped (12 fps) motion.** Camera and piece moves play on twos (grammar §2, §12.3).
- Measured A: median 30 % of shots stepped; >= 25 % stepped in 91/165 pieces (hex 63/106, ee 23/51, ee median 9 %): a house style of the archival-paper explainer, not the genre rule.
- When: the register or the style bible asks for it. The evidence for it: archival stills and low-resolution footage (`hex/DQepYZ4CfSt` 45/69 "hides upscaling"), generated plates (`hex/Dbc-vIXCCqe` 32/36 "hides AI softness"), paper pieces (`ee/DZXDJ8AuAiU`). Without the ask, stay on ones.
- How: one clock `T(t) = stepped(t, 12)` for the camera and the pieces (`registration.md` 1.5). `K.piece` and `K.clipping` already step their hand moves on 12 fps (`stepped: true` or an fps on a corner slide); page turns run at 8 fps (`moran/Dafr0KjAkve`); jitter snaps rather than glides (`moran/DQsNA9RCcs_`: 6 px, 2 moves/s). Captions and lettering text stay on the voice's clock; their write-on stroke steps.
- Tell: a stepped camera on a smooth ink-clean vector film, or half the pieces stepped and half not. Fix: one clock for the whole film.

**Punch-in to the named detail.** A push of x1.5 to x4 lands on the detail at the word that names it (grammar §2; the storyboard names the detail, you make the move).
- Measured A: 72/165 pieces contain a push >= x1.5; 29/165 a push >= x2.0, which is 3 % of push-ins: an accent. Findings: x2.9 on the ticket on the line that names it (`hex/DcapWBnCHCh`); ~x1.5 to the eyes on "lost the left eye" (`hex/DZmh9k_C2cp`); x2.02 into a watch dial (`hex/DPwBS-mCRuS`).
- Gates: T7 reads each sheet row whose `zoom.kind` is `push-in` or `pull-out`: inside one shot the scale must change by >= `NORMS.camera.emphasisMinScaleDelta`; a row that reaches `NORMS.camera.punchMax` counts as a punch, whatever its kind, and more than `NORMS.camera.maxPunches` per film is T7. A hard cut is never a move only if the camera reports a new `shot` at the cut (`registration.md` 1.4). Moran punches 1x <-> 2x "a lot" (`moran/DOb0h6VCSpM`); the evidence rules that a rare accent (grammar §12.2). T9: from the row's first key word to the row's end its `<row id>-target` box is registered and inside `stage.box`.
- How: centre the camera on the target part, `station.view(lx, ly, { z })`. Two cases, both ruled by T9 (the target is inside `stage.box` from the row's first key word to the row's end):
  - the key word falls inside a plate already on screen: the move lands (95 %) by the key word, `start = key.t - reach` with the reach from the table above (`glide` 0.62 s, `move` 0.40 s, `whip` 0.26 s); this is also the picture-before-the-noun rule (craft §2.7);
  - the row opens with a cut onto its hero: the new station is composed so the target is already inside `stage.box` on the cut frame, and the push starts at the cut and lands about one reach later, while the chunk is read (snap-settle below).
  Either way, read `partAt` at `key.t` and at the row's end; never assume. A `punch-in` row is the x2 accent: whip or stacked `glide`, at most `NORMS.camera.maxPunches` in the film. Focus-hunt blur only with a punch (>= `NORMS.camera.punchMax`); never on a push under it.
- Tell: a push that ends on the wrong part of the picture (postmortem C7, K1). Fix: reframe at once (`worked-examples.md` 2).
- Range: the measured ordinary push is x1.14, under the T7 bar. A row the sheet marks `push-in` is an emphasis move and is built at >= x1.15, one point over the measured median (the storyboard playbook calls x1.14 the ordinary push); a gentler x1.05-1.13 move belongs on a `drift` row. A `drift` stays slow: under `NORMS.camera.holdRate` per second T8 reads it as a hold.

**Snap, then settle.** The move is fastest in its first frames and eases out so the caption is read on a settled picture (grammar §2).
- Measured A, moves >= 0.5 s: 45 % peak in the first quarter, 33 % in the middle half, 23 % in the last quarter; per piece, the median move peaks mid-shot in 109/165 and early in 52. Findings: median peak at 0.06 of the move (`hex/Dd0qOzpqoYf`), 0.07 (`hex/DdTK_skvNta`), 0.12 (`hex/DbnDiSLCtax`); near-symmetric 0.41 (`hex/Dbc-vIXCCqe`); late, accelerating into the cut (`pin/350033`).
- How: one key is already snap-settle (peaks at 24-27 % of its travel, so the picture is settled while the chunk is read). A mid-peak is two keys of the same ease 0.25-0.5 s apart; a late peak (a move that accelerates into a cut) is a whip key whose cut lands at its peak: `cutAtPeak(curve, t0, t1)` from `core/lib/motion.js` returns that time; pass `Math.log(z)` for scale so a zoom reads as a ratio. Moran's long 1-2 s eases and spike-shaped speed graph (`moran/DLQ4Wp9pqv3`, `moran/DPcvDgNDNM4`) are the stacked-key and the whip cases (grammar §12.4: front-loaded is the most common single shape, mid-peak is common too). In the instructive register a snap is limited to the one emphasis row per beat; the default is the stacked glide.
- Tell: every move the same shape and length. Fix: choose per beat by what the caption must do: snap for a read, mid-peak for a travel, late for a cut.
- Calm register (`NORMS.registers.instructive`): emphasis moves are a bell of 1-2 s (two stacked glide keys 0.4-0.5 s apart, reach 0.92-1.02 s); no whip, no spike (`moran/DLQ4Wp9pqv3` 0:12-0:17 vs `DPcvDgNDNM4` 0:03-0:08). T7 holds an emphasis row there to `camera.maxPushRatePerS` (average scale change per second) and `camera.minMoveS`.

**Pull-out reveal.** From a detail to its context, a face to the room, to the closing wide (grammar §2).
- Measured A: pull-out zoom median 0.87 (0.67-0.95); 115/165 pieces pull to <= 0.8 at least once; closing wide 0.926 (`pin/349959`, C); close-up proof then pull-out to the phone 0.61 (`ee/DZuVqDpO0Um`); zoom-out that makes room for each new card (`ee/DaU3XslOTOa`).
- How: scale from ~1.0 to the pull value on a `glide` or stacked `glide`; every piece the pull reveals is already seated and registered before the move starts (a piece not in the frame cannot be revealed). On the last beat the revealed set is the earlier beats' heroes and supports, registered as `piece` with their manifest ids; coverage stays >= `NORMS.frames.minCoverage` on every frame including the last (T5); `ground` is excluded from that count.
- Tell: a pull-out that ends on empty ground, a smear or a half-built board (postmortem C6). Fix: build the collage first; end on a composed frame held ~2 s; the last spoken word lands on the apex of the move.

**Into the screen or frame.** The camera pushes through a screen, window or picture frame until it is the next scene (grammar §2); sheet `zoom.kind: "into-frame"`, target `<hero>.screen`, `.frame` or `.window`, and the next row's hero is what the screen showed.
- Measured: dolly into a phone screen (`ee/DUGJjUEjO_I`); into a laptop in ~0.5 s (`ee/DUZvCOriq0d`); x4 into a monitor (`pin/350010`); gold frame grows 0.25 -> 1.2 in ~1.5 s and the person steps out (`ee/Da2XkSfOy7h`).
- How: `K.zoomThrough(stage, { from, to, x, y, z, tIn, dur })` dives into the point (x, y) of the outgoing shot and hands the same eased scale to the incoming shot, cutting where the move is fastest; the outgoing shot must lie above the incoming one in the DOM; the incoming shot is best a table `view`. Keep the shape centred (+-5 % of the frame, craft §2.1).

**Layered parallax.** Foreground layers move faster than the plate (grammar §2).
- Measured: three layers at zoom 1.09 (`ee/DdI5hwFuoI6`); two-speed clouds (`hex/DakK_n7igAJ`); a blurred passer-by as a natural wipe, ~0.25 s (`hex/DbC_1tFCI3K`); foreground blur framing the hero (`ee/Dbp5HyyOmsR`).
- How: the table is one plane, so parallax is a per-layer offset added in `draw`: layer offset = camera travel x factor, 1.0 for the plate and more for the foreground (1.3-1.8 `~`), lower contrast at the back (`moran/DMtlFlxJ6sg`). The archivist supplies the split planes (`moran/DZsDDmvtNJP`, `moran/DQu3nYiCepd`). Two or three layers, on a slow dolly of one move; a registered box follows the layer's drawn position.

**Vertical move on a tall subject.** Tilt or pan along a tall subject so 9:16 needs no crop (grammar §2): a facade with a climber (`hex/DUQRqS2icUB`), a rope down to a cage in 3 s with ease-out (`hex/DeTi33ICNIC`), a tilt to a skyline (`hex/DcapWBnCHCh`). How: `tilt` as a `glide` y-travel; the subject's top and bottom parts are both inside the frame at their words (T9 per part, or two beats).
