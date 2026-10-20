# Devices: transitions, entrances, contact shadows

Device -> when -> how in this engine -> measured range -> tell and fix. `grammar §n` = `research/editing-grammar.md`; ids are pieces measured there; `moran/<reel>` = a lesson in `moran.md`; `[tested]` = computed with the engine's own `spring`; `[eng]` = engine code read; `~` = inference. Gate thresholds are `NORMS` keys.

Who decides: the sheet (`join`) and the director decide where a transition other than the hard cut goes (grammar §13: hard cut as default and dissolves are the director's; match cuts, into-the-frame and container opens are the storyboard's; ground swaps and palette flips are the art director's and director's). You make it. A transition no row names is a hard cut inside a scene; between two scenes it is an animated paper join (client, 2026-10-19; `SKILL.md` step 9).

## 0. Sheet fields you act on

`crew/sync-sheet.json` rows (`skills/film-storyboard/references/sync-sheet-fields.md`): one row is one picture event, ~4.5 words. `join` is the join *into* the row: absent or `cut` = hard cut; `match` = match cut, both rows name the matching part in `zoom.target`; `dissolve` = cross-fade, only where the director's pace plan lists it. `device` tells you what the row is:

| `device` | What you build | Events and gates |
|---|---|---|
| `hold` | a held picture with a second thing moving inside (caption swaps, a mark, a slow push); under `NORMS.rhythm.maxStillHoldS` of identical picture | the caption chunks inside keep R2 legal |
| `breath-card` | the shared card asset cut in hard for 0.8-1.5 s; the line is the caption; the card carries drift and its grain | one hero change in, one out |
| `word-card` | one word per card, ~0.3-0.4 s each, a hard cut per card (`cut: true`, `camera.shot` bumped) with the word registered as `lettering` (a 0.3 s caption would be T2) | the cuts are the events |
| `one-prop` | the hero (stage) repeats, each support enters on its key word, ~0.7 s per beat (section 2) | no hero event: the chunk that starts in the row is the event |
| `container` | the container opens and the contents come out staggered (section 2) | |
| `crowd` | one cut-out multiplied in steps on the spoken numbers, uniform scale, stagger 0.1-0.4 s | repeated hero id: chunks are the events |
| `position-swap` | frame and figure stay, one spot changes by a hard swap at a frame boundary (section 2) | |
| `evidence-board` | the board hero held across rows; each link drawn pin to pin on the word that names it (`K.route` or `K.rubric`), the camera pushing while it draws (x1.9 in `hex/DY4QF50i64w`); the board grows, it is not shown complete | |
| `grid` | tiles staggered in; the push or `punch-in` goes to the off-pattern tile | |
| `scale-contrast` | the camera move that changes the sense of scale (a tiny figure, then close) | |

`zoom.kind` values you now meet: `push-in` (emphasis, T7), `punch-in` (the x2 accent, counted by T7's punch cap), `pull-out` (T7), `pan`, `tilt`, `drift`, `static` (payoff row), `into-frame` (`devices-rhythm-camera.md` 2).

## 1. Transitions

**Hard cut on the sentence (the default inside a scene; between scenes see `SKILL.md` step 9).** Measured A: soft transitions 0.28 per 10 s; 75/165 pieces have none; 99 shots all hard cuts (`hex/DX6M6NCCWyE`) (grammar §3).
- How: a `cut: true` camera key at the phrase onset (the camera reports a new `shot`), or a hero swap in the same frame; the new station is already composed (hero and enough supports seated before the cut frame; a hero flying in on the cut frame is a T5). Identical paper grain across the cut so it reads as an element swap (`pin/349959`); 1-frame black between scenes is seen once (`ee/DaU3XslOTOa`). Cut semantics: `devices-rhythm-camera.md`, engine facts.
- Tell: a cross-fade between beats that no row asks for. Fix: cut.

**Ground swap per beat.** The new ground is the scene change (grammar §3; the art director's list of grounds).
- Measured: a ground every ~3 s (`hex/DZw15OaCDZv`); 5 in 24 s (`hex/Db-UqYwiqT5`); none longer than ~6 s (`hex/DcF_qVxqsaA`); 12 material sets in 46 s (`ee/DZXDJ8AuAiU`).
- How: the ground changes on the cut frame with its cut-out set already on it; each ground registered as `ground` with its own id, so coverage counts only pictures.

**Match cut on shape or object.** A circle, prop or hero object carries over the cut (grammar §3).
- Measured: the object swaps inside the same circle at the same position (`pin/350184`); round object changes scale market -> planet in one frame (`ee/DebtJlmO-89`); each exit object is the next entrance (`ee/DdI5hwFuoI6`); object -> texture zoom (`hex/DeGwAnTCJqI`).
- How: keep position, scale class and direction of motion across the cut (`moran/DPcvDgNDNM4`); `K.zoomThrough` for a dive (`devices-rhythm-camera.md` 2, into the screen); a whip key whose cut sits at `cutAtPeak` for a travel that continues across it (`moran/DaDhDFjAysT`). Check the two frames either side of the cut side by side: the shared shape sits within +-5 % of the frame (craft §2.1).

**Flash frame over the cut.** 2-4 frames of white, glow or flare hide the swap (grammar §3): lamp flare (`ee/DRzcFdBjDPG`); 0.13 s glow (`hex/DdTK_skvNta`); camera-flash glare (`ee/DUGJjUEjO_I`).
- How: a screen-layer overlay at alpha pulsing over 2-4 frames at `NORMS.fps`, peaking on the cut frame. Singly here; the train is `devices-rhythm-camera.md` 1.

**Blur or smear frame on the swap.** The outgoing frame smears or defocuses for 1-4 frames; the new one is born settled (grammar §3).
- Measured: 1 frame (`ee/DaAV2R5IuSi`); 2 frames of defocus (`pin/350020`); 3-4 frames of smear on speed (`hex/DaFnYhFCvKl`); ~4 frames of radial blur (`hex/Da0NQ7eCAnr`).
- How: the engine smears the world along the camera travel above `BLUR_FLOOR` px per frame (`core/lib/table.js`), in the DOM, so it shows in the draft; the cut itself is never blurred, so the smear is the frames before the cut on a whip key and the frame after the cut is settled. The final render blends sub-frames; `--sub 8` for whips. Focus hunt: keys 0, 4, 6, 0 px of box blur over a few frames (`moran/DLdy8b5JpHC`). Blur belongs to the world, never to captions or lettering in screen space.
- Tell: a whip with no blur strobes. Fix: raise the travel, or the final render's samples, not a drawing trick.

**Dissolve reserved for time or mood.** Measured A: 28 % of soft events last >= 0.6 s; 61/165 pieces have at least one (grammar §3).
- When the row says `join: "dissolve"` (the director's list): one chapter turn (`hex/DN-WcdHiZCs`, the only 2.08 s one), a time jump (`hex/DYy1TUWufoF`: dissolves signal time, cuts signal a new fact; `hex/DcF_qVxqsaA` 0.4-2.5 s for "Today"), a sombre close (`hex/Daug-7bC4ZY`), the payoff (`hex/DbnDiSLCtax` 2.7 s). Footage cuts hard, graphics dissolve (`hex/Dc-vZs9CkUT`).
- How: a cross-fade by opacity of two whole shot elements, the one place a fade is right. The hero is below `NORMS.frames.heroAlpha` while it fades (T6 "no hero" for that span) and H1 needs it up at its key word: finish the fade before the key word's window, and name the T6 in the notes.

**Paper-native wipe.** A tear, page curl, curtain, cloud, smoke or slab sweeps across and becomes the next ground (grammar §3).
- Measured: torn strip in 4 frames (`ee/DeWa3ljOu2j`); three-stage tear in 1 s (`pin/350151`); page curl 0.5 s (`hex/DbXtTeqifQw`, `hex/Dbxj93xiCqg`); block wipe in the next scene's colour (`ee/DdtaQr_O7w7`); slab that becomes the ground (`ee/Db-fZK_OO76`).
- How: `K.tearReveal(stage, { from, tIn, dur: 0.6, side, seed })` (12 fps jerks, shadow lip on the shot beneath); `K.pageTurn(stage, { from, tIn, dur: 0.9, spine })` (8 fps, `moran/Dafr0KjAkve`); `K.inkBlot({ cover: true, reveal })` for ink flooding into the next shot (`moran/DVcF9XyiSjm`, `moran/DcTljpCgNNJ` burn-film reveal). The outgoing shot lies above the incoming one in the DOM. Both transitions expose `done` and a landing cue for the sound role.

**Palette flip.** A turn in the story flips colour to B&W or light to dark (grammar §3). The art director and the director fix where; you make it on a cut, not a fade (`hex/DXOey6vghtu`: 6 flips in 38 s).

**Iris or shape-mask reveal.** Measured: shape tunnel in ~6 frames over 1.5 s (`ee/DbagmfuIKyH`); a window in black growing 30 % -> full in 0.3 s for a change of viewpoint (`hex/DcS2NcaCHBM`); iris closing on one detail (`ee/DYURMKHoayc`).
- How: `clip-path: circle(...)` or `polygon(...)` on the incoming shot, radius a pure function of `T(t)`. The hero registers the visible part of its box, because T5 and T6 read the box.

**Glitch cut.** 1-4 frames of RGB split or pixel blocks, only when the topic is digital (grammar §3): an AI montage (`hex/DcG_IX3P3vI`, 0.14 s x 30), games (`hex/DdlM2RiK1ih`). How: an SVG channel-offset filter on the screen layer for 1-4 frames. On a topic that is not digital it reads as a mistake.

## 2. Entrances

Order inside a beat: ground, hero, supports, connectors and marks, lettering last. The hero is seated by the beat's start; the entrances a viewer sees are the supports, the marks and the lettering, and the hero of a beat reached by an in-view travel. An entrance is a transform (position, a small rotation toward rest, lift and shadow), never an opacity fade and never a scale pop from nothing: a fading hero is under `NORMS.frames.heroAlpha` and the gate sees none (T6, H1).

Springs measured with the engine's `spring` `[tested]`:

| k, d | overshoot | 95 % at | within 1 % from | use |
|---|---|---|---|---|
| 320, 30 (`SPRINGS.snappy`) | 0.8 % | 0.20 s | 0.24 s | `K.piece` default, leading edges |
| 260, 14 (the `slap` move) | 22 % | 0.13 s | 0.67 s | paper pressed down, then relaxed (on 12 fps) |
| 260, 17 | 14 % | 0.15 s | 0.54 s | light pop, label, stamp (~15 % in grammar) |
| 200, 14.6 | 15 % | 0.16 s | 0.62 s | light pop |
| 170, 26 (`SPRINGS.default`) | 0 | 0.36 s | 0.51 s | heavy paper: maps, documents |
| 70, 15 (the `slide` move) | 0.2 % | 0.48 s | 0.61 s | a sheet gliding in from off frame with 7 deg of turn |
| 120, 24 (`SPRINGS.heavy`) | 0 | 0.50 s | 0.73 s | very large sheets |

**One prop per phrase.** Each spoken noun brings its prop onto the held ground, in speech order, ~0.7 s per beat, then the plate empties for the thesis (`hex/DZrkiVFCxe5`; `ee/DUiSq11jO4R` one word per second; `pin/349959` props piecemeal in 0.5 s steps, the beat resets with a hard cut to the empty ground) (grammar §4). The storyboard places them; you land each one on its word: `tIn` such that the 95 % point is the word's onset or up to `NORMS.sync.heroWindowFrames` frames before it.

**Stagger build that counts.** Items land 0.1-0.4 s apart so the count is seen (grammar §4).
- Measured: 0.1 s (`hex/Db-UqYwiqT5`); 0.15 s (`hex/DYy1TUWufoF`); 0.2 s (`hex/Dc-vZs9CkUT`, `hex/DbC_1tFCI3K`); 0.25-0.3 s (`hex/DdqZ3qKKe7f`); 0.27-0.4 s (`ee/DdI5hwFuoI6`, `hex/DeL0qoEvYmD`). Cast from the archive ~0.4 s (`hex/DYmMoGlCETm`).
- How: item i enters at `base + i * gap`, the gap in whole frames at `NORMS.fps` (3-12). If the sheet enumerates ("seven partners" shown as seven), the gap follows the voice and each item lands on its word. Vary individual gaps and speeds by 20-40 % so two big pieces never stop on the same frame (craft §2.2 `~`).
- Tell: stop-sync (all pieces settle on one frame). Fix: offset starts 3+ frames or speeds 20-40 %.

**Drop and settle.** A paper piece drops or slides with a small rotation and settles with a shadow (grammar §4).
- Measured: 2-3 frame settle (`pin/350031`); 4-frame bounce for a headline (`hex/DbILU8IileY`); stamp 1.3 -> 1.0 in 2 frames as the percussive beat (`ee/DZ4dXpRu9g6`); bills drop one by one, 3 in ~1 s (`hex/DbnDiSLCtax`). Heavy paper lands without overshoot (craft §2.2).
- How: `slap` move on a clipping for a light sheet; `slide` for a heavy one; the lift (1 -> 0) drives the shadow (section 3). A stamp is the one place a 2-3 frame linear `progress` is right: it is too short for an ease to be seen. A move is at least 6-8 frames (250-330 ms) from start to settle, otherwise it is a flicker (craft §2.2).
- Tell: slideware (fade or scale-pop at 30 fps smoothness; postmortem K2). Fix: lift, rotation, settle, shadow.

**Hand as the agent.** A hand places, presses, writes or erases (grammar §4): hands place buildings (`pin/350180`), index cards (`hex/DcF_qVxqsaA`), a recipe on a fixed bowl (`hex/DZw15OaCDZv`), a gloved hand erases "FOR YEARS" (`ee/DbAnBlpTkUQ`), a real hand writes the number (`ee/DcaqrJkOiD3`). Why: human scale and a visible cause.
- How `~`: the archivist's hand cut-out slides in a few frames ahead of the piece, the piece takes its landing under it, the hand leaves the way it came; one hand pose per action (pose swap, `devices-type-data-life.md` 4). Hand and piece share a clock.

**Document slides in tilted.** A page slides in at 3-12 deg, straightens or stays tilted, then the camera pushes to the headline (grammar §4).
- Measured: 0.4 s slide, ~8 deg to straight, push to headline (`hex/DapVrzSiKJR`); a 4-5 sheet stack at 0.3-0.5 s each (`hex/Dbxj93xiCqg`); 4 frames, 3 deg (`ee/DZHpNwSob_R`); ~12 deg over a plate dimmed ~50 % (`ee/DcaqrJkOiD3`).
- How: a clipping with a `slide` move (turn built in) and, for the push, `K.docZoom(stage, { at, img, x, y, w, rect, word, tIn, fill })`: the page lands at `tIn - 0.7`, the camera frames the quote at `fill` of the frame width, a highlighter sweeps the word; splice `dz.keys` into the camera keys. The quote's rect is the beat's zoom target.

**Typed or UI-native entrance.** Text types, bubbles stack, a cursor clicks (grammar §4; 35 of 52 pieces are ee, so mostly business explainers).
- Measured: one character per frame (`ee/DSxDRZRDKVT`); one chat line every 0.8-1 s (`ee/DTaQHn1DEll`); a prompt streaming ~2 s (`hex/DWG_-c3grGL`); serif italic at ~8 characters/s as a cold open (`ee/Db7vTmguuxN`).
- How: `K.typewriter(stage, { text, tIn, cps })` or `K.ransom` for a label typed on a paper strip; real captured pages as evidence (`moran/DLQw7mqJzRp`). One text animation per role at a time: a stressed word over a running caption is allowed (grammar §12.5), two animations of the same role are not.

**Container opens.** Photos spring out of an envelope fanned 0.1 s apart (`hex/DdvgHQcIWYy`); an envelope opens in 0.6 s on "one condition" (`hex/Dc3B4rcCH18`); a ledger whose pages are the dates (`ee/DcJM47zIj-t`) (grammar §4). How: the container is a piece; the contents are staggered entrances starting at its opening frame.

**Overshoot pop on light pieces.** Labels and stamps overshoot and settle (grammar §4): label pop 0.25 s (`hex/DZ1_nI7iEd8`); ~15 % overshoot (`pin/349991`); the label and birds follow the number at 0.15 s (`ee/Dc0KeKyOQZE`). How: 200/14.6 or 260/17 from the table; heavy paper gets none.

**Exits.** Mostly cuts (grammar §4). Designed exits: a sheet sliding over the pile (`hex/DdDvS3ZC1gg`), a crumple into a bin (`ee/DcD4mcfIgey`, "ignored" made literal), a pull-out that turns the scene into a frame in the next (`ee/DdI5hwFuoI6`). A piece leaves by lifting away, the entrance reversed and faster (195 ms against 225 ms, craft §2.2). Never fade the hero out while it is the beat's subject.

**Position-locked swap.** The frame, figure or label stays and one spot changes (grammar §4): role words on the same figure, ~1.1 s each (`ee/DcijzMlOiKS`); founders swap every 0.4 s (`ee/Ddn42dGOwnB`); faces swap in 1-2 frames, type stays (`ee/DeB2BnjOvHp`). How: the swap is a hard replacement at a frame boundary, not a fade; the unchanged parts keep their registered ids.

## 3. Contact shadows

**Soft contact shadow** under each sheet or where pieces touch (grammar §9; the look is the art director's).
- Measured: 10-20 px offset under cards (`pin/349972`, `hex/DYZBoYQiQBA` ~15 px offset, ~20 px blur); ~6 px (`pin/349962`); 2-4 px under cut-outs (`hex/DOvNKEtiREq`); the shadow under a curling page sells it (`hex/DX6M6NCCWyE`). None on pure black ground (`pin/fd62cda1`) or for flat-colour props on a grey print (`hex/Dd0qOzpqoYf`).
- How: the shadow follows lift. Rest is the style bible's value; in flight offset and blur grow and ease back as the piece lands, from the same `lift` that drives the position (`K.clipping` computes a two-layer shadow that grows with height; `K.piece` takes a resting `height`, seeded 0.05-0.5 per piece, so a collage never has one shadow). One light angle for the whole film (craft §2.3, source 11). A shadow on every piece reads as fake: only where a piece sits over another.
- Tell: a pasted cut-out, no contact shadow (grammar §11 #1). Fix: the shadow on landing and where parts touch; edges, grain and treatment are the archivist's and art director's, never repainted here.
