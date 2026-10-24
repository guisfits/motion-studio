# Devices: rhythm and camera

Device -> when -> how in this engine -> measured range -> tell and fix. Sections cite `research/editing-grammar.md` as `grammar §n`; ids like `hex/DUiOWpiCare` are pieces measured there (`grammar` header explains them). `[tested]` = computed with the engine's own functions (`cameraAt`, `easeProgress`, `stepFrame` in `src/camera/`, `src/paper/`); `[eng]` = engine code read; `~` = inference. Numbers that a gate checks are `NORMS` keys.

## Engine facts the devices rely on

- Camera keys: `CamKey = { frame, x, y, zoom, rotate?, ease? }` in `scene.ts`, in world px; `<Camera keys>` draws them and `viewAt(keys, frame, { durationInFrames, drift })` gives the pose the trace projects through `[eng src/camera/path.ts]`.
- A key's `ease` shapes the **leg that starts at that key** and ends at the next key; `glide` (default), `move`, `whip` (any other name does not type-check). Each leg moves with `smootherstep` (a symmetric bell: speed peaks at the middle of the travel at 1.875 x the average, zero at both ends) `[tested]`:

| ease | travel inside the leg | reaches 95 % of the leg's change | within 1 % | speed peaks at |
|---|---|---|---|---|
| `glide` | the whole leg (a 1.5 s leg = a 1.5 s bell) | 0.81 x leg length | 0.90 x leg length | 0.50 x leg length |
| `move` | 0.7 s from the leg's first frame, then holds | 0.57 s | 0.63 s | 0.35 s |
| `whip` | 0.35 s from the leg's first frame, then holds | 0.28 s | 0.32 s | 0.18 s |

  There is no spring and no carry-over between legs: each leg starts and ends at rest, so a mid-travel dip in speed between two stacked legs is real; for one smooth bell use one longer `glide` leg. The leg length is `next key frame - this key frame`; put the next key where the move should be settled, and the picture holds there.
- **Hard cut = two keys on the same frame**: the old pose, then the new pose (`{frame: 699, …old}`, `{frame: 699, …new}`). At that frame the camera is exactly the new key, later legs ease from it, and the move in flight does not carry travel across `[tested]`. Add the frame to `CUT_FRAMES` in `scene.ts` so `trace.ts` reports `shotAt(CUT_FRAMES, frame)` as `camera.shot` (SKILL step 7; `registration.md` 1.5). The cut frame has a huge `velocity` (`cameraAt`): with `<Camera blur>` that frame would smear, and a cut must never be blurred, so keep `blur` off for a film built on hard cuts or on that shot, and let the whip legs before a cut carry the smear `~`.
- Direction at a cut: the incoming shot starts moving in the outgoing shot's direction (pan right into pan right, push into push); a reversal across a hard cut is the jarring cut (`moran/DPcvDgNDNM4` 0:08-0:25).
- The camera drifts: `DEFAULT_DRIFT` (0.02) multiplies the zoom by `1 + drift x frame / durationInFrames`, i.e. up to 2 % across the whole composition (0.033 %/s on a 60 s film). That is under `NORMS.camera.holdRate`, so T8 reads it as a hold, and it is not enough to make a 4 s hold alive: a hold still needs a keyed move or an idle loop. `Camera` is never stepped and never shaken `[eng Camera.tsx]`.
- `stepFrame(frame, 30, 12)` holds a pose for 3, 2, 3, 2 frames (the 3:2 cadence), 2.5 on average `[eng step.ts]`.
- One frame goes into the camera, the pieces and `traceAt`; when the register asks for stepped motion the pieces read `stepFrame(frame, fps, 12)` (`registration.md` 1.6).

## 1. Rhythm

**Phrase-locked cut.** The edit lands on the spoken phrase (grammar §1, §10.1).
- Measured A: one edit event per 3.5 words (p10-p90 2.1-5.5 = `NORMS.rhythm.wordsPerEvent`); at most two cuts per phrase (`hex/DSA2Hs3k06k`); the word-speed variant (shot median 0.17-0.24 s) only for a run of names, numbers or hype (`hex/DUiOWpiCare`, `hex/DPgS8B7CZoY`).
- How: two camera keys on the cut frame, old pose then new (and the frame in `CUT_FRAMES`, so `camera.shot` bumps), or a new hero in the trace from the cut frame, on the onset of the word that names the new picture (`hex/DN-WcdHiZCs`). The hero is on screen inside `NORMS.sync.heroWindowFrames` of the key word (H1); put the cut on the last of those frames, not after.
- The phrase boundaries come from the sheet and `words.json`; you do not retime them. A beat the sheet cannot carry at this density goes back to the storyboard (SKILL Hand-off).
- Tell: the voice outruns the picture (`hex/DNDJyk8pizL`); the picture arrives after the noun. Fix: earlier cut, never a later caption.

**Caption as the motion.** On a held plate, face or engraving the caption chunk changes and the picture does not (grammar §1).
- Measured A: ~20 % of cuts keep the picture (6-51 %, heuristic); the picture under it lasts 2-4 s (`hex/DY_8VpvCpeO`), up to 9.25 s on a talking head (`hex/DcO003cvlUI`, register C); 1-2 label swaps per engraving (`hex/Dd0qOzpqoYf`).
- How: the chunk replaces in place at a fixed position (`hex/DbnDiSLCtax`, `hex/Dbxj93xiCqg`); each swap is a caption event for R1-R3. Chunking and timing: `devices-type-data-life.md` 1. The chunk swap is the whole motion: nothing else needs to move on that beat except the never-static drift.
- Reading time and the measured swap rate meet: examples swap every 0.4-0.6 s (`hex/Dd0qOzpqoYf`), and `NORMS.caption.minLegibleS` sits inside that band; `NORMS.caption.maxCps` still lengthens a chunk of long words. A sentence delivered one word per card is a lettering/word-card beat (grammar §7 one word per card, ~0.3-0.4 s per word), traced as `lettering`.
- Tell: tiny low-contrast caption over a moving face (`hex/DcO003cvlUI`). Fix: the caption moves to a quiet area or gets a plate (the art director's caption system).
- Merging: a picture and its caption landing within `NORMS.rhythm.eventMergeS` count as one event. To count two, separate them by more than that; to avoid doubling, land them together.

**Count in steps.** A number or date advances in steps on one spot, then holds (grammar §1).
- Measured: three swaps of 0.3-0.4 s (`hex/DeBjyarCfFn`, register C: `$` -> `$17.` -> `$17.8 million`); a counter run of ~1.5 s (`hex/DXy2ea_ib-P`, `hex/DZmh9k_C2cp` 0 -> 532); years at ~0.3 s each, then a 2-3 s hold; ~8 ticks/s for an altimeter (`hex/Da44fBhCbJd`).
- How: no counter component exists (engine gap): index a list of values from the writer's sequence by `Math.floor(interpolate(frame, [from, to], [0, values.length - 1], clamp))` (fast, then each last step seen), set in a mono face or `fontVariantNumeric: "tabular-nums"` so the digits do not jitter (`moran/DaNlGAcgYsD`); put the number on an object (`ee/DZXDJ8AuAiU` flip board, `hex/Dc3B4rcCH18` placard). The run ends on the spoken number's onset or just after; the final value holds >= `NORMS.caption.minLegibleS`.
- Tell: the number swaps instead of counting, or the digits jitter in width. Fix: steps from the writer's sequence, tabular figures.

**Flash train.** A run of 0.13-0.17 s white or glow frames on an intensity beat (grammar §1).
- Measured: 5-9 flashes of 0.13-0.17 s (`hex/DTC-mtEiT3S`); 4 in the first 1.9 s (`hex/DPBpZK4CbYi`); 32/165 pieces have >= 3 flashes at <= 0.2 s; the median piece has none.
- How: an overlay on the screen layer (an `AbsoluteFill` outside `<Camera>`), alpha pulses of 4-5 frames at `NORMS.fps`, not camera cuts: pulses are not events for R1-R2, and the picture underneath changes at most once per train. `moran/DMDyGp6Jwwx` (a brightness spike over 4-8 frames centred on the cut).
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
- How: the camera's slow drift (`DEFAULT_DRIFT`) is only the floor. Every picture held longer than ~1.5 s also gets a keyed move from the sheet's `zoom.kind` (`push-in`, `punch-in`, `pull-out`, `pan`, `tilt`, `drift`, `into-frame`; roll through `rotate`; `static` is the payoff row only, and still carries the drift). A `drift` is a slow single leg kept under `NORMS.camera.holdRate`, so T8 reads it as a hold. Exception, the fast montage: the camera holds and the cut is the move (`hex/DXUEoamgkj5`, 39 holds; `hex/DUiOWpiCare` zoom <= 1.12): 26 % of A shots have no camera move, and the voice covers the cut (grammar §12.1).
- Tell: a dead hold (`pin/349989`, 8 identical seconds). Fix: 1-3 % drift, up to ~7 % over the shot on a held plate (`moran/DZFqNzwAqVa` 0:16-0:20), or an idle loop; a still is a slideshow (`moran/DZsDDmvtNJP`).

**Stepped (12 fps) motion.** Camera and piece moves play on twos (grammar §2, §12.3).
- Measured A: median 30 % of shots stepped; >= 25 % stepped in 91/165 pieces (hex 63/106, ee 23/51, ee median 9 %): a house style of the archival-paper explainer, not the genre rule.
- When: the register or the style bible asks for it. The evidence for it: archival stills and low-resolution footage (`hex/DQepYZ4CfSt` 45/69 "hides upscaling"), generated plates (`hex/Dbc-vIXCCqe` 32/36 "hides AI softness"), paper pieces (`ee/DZXDJ8AuAiU`). Without the ask, stay on ones.
- How: one stepped clock, `stepFrame(frame, fps, 12)`, for every piece and for the trace (`registration.md` 1.6). `SetDown` steps its carry with `stepFps` (and `carryAt`/`setDownPose` take the same option, so the trace follows); `useDraw` marks step on twos; page turns run at 8 fps (`moran/Dafr0KjAkve`); jitter snaps rather than glides (`moran/DQsNA9RCcs_`: 6 px, 2 moves/s, seeded with `random`). Captions and lettering text stay on the voice's clock; their write-on stroke steps. **The `Camera` component is never stepped** (engine gap): a stepped camera is not available, so a film that asks for stepped motion steps the pieces and keeps the camera smooth, and says so in `animation-notes.md`.
- Tell: half the pieces stepped and half not, or stepped pieces under a smooth camera with no note. Fix: one clock for the pieces, named in the notes.

**Punch-in to the named detail.** A push of x1.5 to x4 lands on the detail at the word that names it (grammar §2; the storyboard names the detail, you make the move).
- Measured A: 72/165 pieces contain a push >= x1.5; 29/165 a push >= x2.0, which is 3 % of push-ins: an accent. Findings: x2.9 on the ticket on the line that names it (`hex/DcapWBnCHCh`); ~x1.5 to the eyes on "lost the left eye" (`hex/DZmh9k_C2cp`); x2.02 into a watch dial (`hex/DPwBS-mCRuS`).
- Gates: T7 reads each sheet row whose `zoom.kind` is `push-in` or `pull-out`: inside one shot the scale must change by >= `NORMS.camera.emphasisMinScaleDelta`; a row that reaches `NORMS.camera.punchMax` counts as a punch, whatever its kind, and more than `NORMS.camera.maxPunches` per film is T7. A hard cut is never a move only if the trace reports a new `shot` at the cut (`registration.md` 1.5). Moran punches 1x <-> 2x "a lot" (`moran/DOb0h6VCSpM`); the evidence rules that a rare accent (grammar §12.2). T9: from the row's first key word to the row's end its `<row id>-target` item is in the trace and inside the safe box (`layoutOf(format).safe`).
- How: centre the camera on the target part: the key's `x`, `y` are the part's world centre (`PARTS` in `scene.ts`), `zoom` the push. Two cases, both ruled by T9 (the target is inside the safe box from the row's first key word to the row's end):
  - the key word falls inside a plate already on screen: the move lands (95 %) by the key word: end key at the key word's frame, start key one leg earlier (a `glide` leg of `L` frames lands at 0.81 L, so `L = ceil(reach / 0.81)`; `move` reaches 95 % at 0.57 s, `whip` at 0.28 s, counted from the leg's first frame); this is also the picture-before-the-noun rule (craft §2.7);
  - the row opens with a cut onto its hero: the new shot is composed so the target is already inside the safe box on the cut frame, and the push starts at the cut and lands about one reach later, while the chunk is read (snap-settle below).
  Either way, read the `<row id>-target` item of `traceAt` at the key frame and at the row's end, and look at the still; never assume. A `punch-in` row is the x2 accent: a `whip` leg or a short `glide`, at most `NORMS.camera.maxPunches` in the film. Focus-hunt blur only with a punch (>= `NORMS.camera.punchMax`); never on a push under it.
- Tell: a push that ends on the wrong part of the picture (postmortem C7, K1). Fix: reframe at once (`worked-examples.md` 2).
- Range: the measured ordinary push is x1.14, under the T7 bar. A row the sheet marks `push-in` is an emphasis move and is built at >= x1.15, one point over the measured median (the storyboard playbook calls x1.14 the ordinary push); a gentler x1.05-1.13 move belongs on a `drift` row. A `drift` stays slow: under `NORMS.camera.holdRate` per second T8 reads it as a hold.

**Snap, then settle.** The move is fastest in its first frames and eases out so the caption is read on a settled picture (grammar §2).
- Measured A, moves >= 0.5 s: 45 % peak in the first quarter, 33 % in the middle half, 23 % in the last quarter; per piece, the median move peaks mid-shot in 109/165 and early in 52. Findings: median peak at 0.06 of the move (`hex/Dd0qOzpqoYf`), 0.07 (`hex/DdTK_skvNta`), 0.12 (`hex/DbnDiSLCtax`); near-symmetric 0.41 (`hex/Dbc-vIXCCqe`); late, accelerating into the cut (`pin/350033`).
- How: a short leg is already snap-settle (a `whip` leg lands in 0.28 s, a `move` leg in 0.57 s, then the picture holds settled while the chunk is read). A mid-peak is a `glide` leg as long as the move (the bell peaks in the middle); a front-loaded peak is a `whip` or `move` leg inside a longer gap to the next key. A late peak (a move that accelerates into a cut) is a cut key pair placed at the peak of the leg, `peak = leg start + 0.5 x travel` (travel = leg length for `glide`, 0.7 s for `move`, 0.35 s for `whip`); there is no `cutAtPeak` helper, compute the frame in `scene.ts`, and use `Math.log(zoom)` when judging a zoom's speed so it reads as a ratio. Moran's long 1-2 s eases and spike-shaped speed graph (`moran/DLQ4Wp9pqv3`, `moran/DPcvDgNDNM4`) are the long-`glide` and the `whip` cases (grammar §12.4: front-loaded is the most common single shape, mid-peak is common too). In the instructive register a snap is limited to the one emphasis row per beat; the default is the `glide` leg.
- Tell: every move the same shape and length. Fix: choose per beat by what the caption must do: snap for a read, mid-peak for a travel, late for a cut.
- Calm register (`NORMS.registers.instructive`): emphasis moves are a bell of 1-2 s (one `glide` leg of 1.2-1.6 s, 95 % at 0.81 x its length); no whip, no spike (`moran/DLQ4Wp9pqv3` 0:12-0:17 vs `DPcvDgNDNM4` 0:03-0:08). T7 holds an emphasis row there to `camera.maxPushRatePerS` (average scale change per second) and `camera.minMoveS`.

**Pull-out reveal.** From a detail to its context, a face to the room, to the closing wide (grammar §2).
- Measured A: pull-out zoom median 0.87 (0.67-0.95); 115/165 pieces pull to <= 0.8 at least once; closing wide 0.926 (`pin/349959`, C); close-up proof then pull-out to the phone 0.61 (`ee/DZuVqDpO0Um`); zoom-out that makes room for each new card (`ee/DaU3XslOTOa`).
- How: zoom from ~1.0 to the pull value on a `glide` leg (the example's second beat pulls 1.2 -> 1.0); every piece the pull reveals is already seated and in the trace before the move starts (a piece not in the frame cannot be revealed). On the last beat the revealed set is the earlier beats' heroes and supports, traced as `piece` with their manifest ids; coverage stays >= `NORMS.frames.minCoverage` on every frame including the last (T5); `ground` is excluded from that count.
- Tell: a pull-out that ends on empty ground, a smear or a half-built board (postmortem C6). Fix: build the collage first; end on a composed frame held ~2 s; the last spoken word lands on the apex of the move.

**Into the screen or frame.** The camera pushes through a screen, window or picture frame until it is the next scene (grammar §2); sheet `zoom.kind: "into-frame"`, target `<hero>.screen`, `.frame` or `.window`, and the next row's hero is what the screen showed.
- Measured: dolly into a phone screen (`ee/DUGJjUEjO_I`); into a laptop in ~0.5 s (`ee/DUZvCOriq0d`); x4 into a monitor (`pin/350010`); gold frame grows 0.25 -> 1.2 in ~1.5 s and the person steps out (`ee/Da2XkSfOy7h`).
- How: engine device with no Remotion component. Compose it: a `glide` or `whip` leg zooms the camera into the screen's centre (`Phone3D` screen, a framed picture), a hard cut (two keys, `CUT_FRAMES`) lands where the leg is fastest on the next shot, whose first key is the same screen scale so the shape continues; trace the screen as the hero until the cut. Keep the shape centred (+-5 % of the frame, craft §2.1).

**Layered parallax.** Foreground layers move faster than the plate (grammar §2).
- Measured: three layers at zoom 1.09 (`ee/DdI5hwFuoI6`); two-speed clouds (`hex/DakK_n7igAJ`); a blurred passer-by as a natural wipe, ~0.25 s (`hex/DbC_1tFCI3K`); foreground blur framing the hero (`ee/Dbp5HyyOmsR`).
- How: `Multiplane` (`camKeys`, `layers: [{ depth, children }]`, `focus`, `dof`, `motionBlur`) with `layerOffset`/`blurFor` from `src/parallax/depth.ts`: layer offset = camera travel x factor, 1.0 for the plate and more for the foreground (1.3-1.8 `~`), lower contrast at the back (`moran/DMtlFlxJ6sg`). The archivist supplies the split planes (`moran/DZsDDmvtNJP`, `moran/DQu3nYiCepd`). Two or three layers, on a slow dolly of one move; a traced box follows the layer's drawn position (`layerOffset`).

**Vertical move on a tall subject.** Tilt or pan along a tall subject so 9:16 needs no crop (grammar §2): a facade with a climber (`hex/DUQRqS2icUB`), a rope down to a cage in 3 s with ease-out (`hex/DeTi33ICNIC`), a tilt to a skyline (`hex/DcapWBnCHCh`). How: `tilt` as a `glide` leg that moves the key's `y`; the subject's top and bottom parts are both inside the frame at their words (T9 per part, or two beats).
