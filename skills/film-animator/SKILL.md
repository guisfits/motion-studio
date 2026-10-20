---
name: film-animator
description: Use when a film has a passing sheet gate (sync sheet, style bible, ready manifest, voice and word times) and needs its animatic, camera, entrances, transitions, captions and type timing, or its silent master; or when a framing, rhythm, trace or dead-frame defect (R1-R4, T0-T11, H1, P1, M1) is routed back for a fix. Owns `index.html`, the animatic, `draft-9x16.mp4` and `silent-9x16.mp4`.
---

# film-animator

## The core: a scene is a paper EVENT, not pictures pasted on a ground

Read this first; it overrides any habit below (client, 2026-10-15, said five times: "você está pegando um monte de imagens e colando num fundo qualquer… seja criativo").

The film is a **Vox-style animated paper collage**. Every scene is something that HAPPENS to paper while the line is said — designed as motion first, the still comes last. A scene that is "a few cut-outs arranged on a ground, then the camera drifts" is a failure even if every picture is right.

For each scene, before any layout, write its **event**: one verb the paper performs that visualises the line, using the collage vocabulary of the finished pieces in `<engine>/inspirations/vox-collage/collage-study/findings.jsonl` (`area` = motion, transition, entrance-exit, cutout, camera). Search it for the line's idea (e.g. `jq 'select(.area=="transition")' … | grep -i tear`) and borrow:
- **tear / reveal** — a page or a face is torn open and the next picture is underneath; a hole in paper shows the next scene.
- **cut / slice** — scissors free a phrase from a page; a portrait sliced into strips that slide away; a word cut out and pasted large.
- **travel / spread** — a letter or a sheet travels along a route that draws itself on a map, then multiplies and scatters across cities; copies fly off a press.
- **drop / pile / stack** — objects fall onto the desk one per noun, settle with a bounce, pile up; a stack shrinks and slides off.
- **fold / unfold / flip** — a letter folds and seals; a page turns to the verse; a card flips to show its back (the gloss).
- **stamp / write / type** — a stamp comes down; a pen writes the word; a typewriter strikes it; a highlighter drags across.
- **act** — the person in the picture does the verb (a rigged cut-out: hammers, scourges, points, turns the head).
- **wipe into ground** — a coloured slab sweeps in, becomes the next ground, and shatters into shards that expose the next scene.
- **match / swap** — the object inside the same frame or circle swaps on the cut; a shape becomes the next shape.
The scene's end state is what that event leaves behind (torn edges, the route, the pile, the stamped word) — never a tidy arrangement.

**Every board is a strip, not a single still**: 3 small keyframes (start → event → end) above the end frame, so the client sees what happens. A board without an event is not ready to show.

## Role

Animator and editor: you cut the film to the voice and make it move, and you register what it draws so the gates measure meaning. You change no word, no sheet row, no asset.

## You receive

- `crew/sync-sheet.json` (storyboard): one row = one picture event; `key`, `hero`, `support`, `lettering`, `zoom {target, kind}`, optional `device`, `join` (`skills/film-storyboard/references/sync-sheet-fields.md`). Times are law; read them at load, never retype.
- `crew/style-bible.md`, `crew/manifest.json`, `assets/` (all `ready`); the brief and its pace plan (register, holds, joins, ending); the overlay pieces the Director passes (house outro, recurring cards).
- `voice/voice.wav`, `voice/words.json`. The voice is the clock.
- The engine: `core/` (`README.md` "The film contract"), `research/editing-grammar.md` (cited as `grammar §n`).

## You deliver

- `<film>/index.html`: pure `draw(t)`, `window.trace`, `window.camera` (with `shot`), `window.CUES`.
- `out/animatic-9x16.mp4` (the page's own draw(t) at `NORMS.animatic.fps`, the voice on it, through the house window when `FILM.house` is declared) + `.png` (contact sheet: one still per beat, at `key[0]`), then `out/draft-9x16.mp4` (picture lock), then `out/silent-9x16.mp4`.
- `crew/animation-ledger.md`, `crew/animation-notes.md`, `crew/checks-animatic.md`, `crew/checks-draft.md` (`references/templates.md`).

## Process

Stage 1: animatic (the cut and the layout, no motion yet)
1. **Intake.** Read the brief, sheet, style bible, `words.json`. Decide `STEP`: stepped 12 fps motion only if the brief or style bible asks (grammar §2 *Stepped motion*, §12.3: a house style, not the genre rule). Read the engine's trace contract (`references/registration.md` 0).
2. **Ledger before code.** For each row list its events (hero change, caption chunk, hard cut) and compute R1-R3 and the R4 tail from the sheet and `words.json` (`references/templates.md` 1). Devices: *phrase-locked cut*, *caption as the motion*, *burst, then hold*, *decelerating ending* (grammar §1, §10). A row with no event, a hold over `NORMS.rhythm.maxStillHoldS`, or too many words per event is a sheet defect: route it, do not retime the row.
3. **Build the layout.** Grounds (role `ground`), hero, supports at their final composed place; caption chunks timed to the voice, **only where the line has no lettering on screen** — words already lettered in the picture are never captioned again (client, 2026-10-16: "legende só o necessário… não precisa legendar duas vezes a mesma narração"); lettering and marks drawn written; hard cuts at the phrase onset; frame 0 composed, hero seated from the cut frame. Devices: *hard cut on the sentence*, *caption as the motion*, *one hero on a quiet ground* (`references/devices-rhythm-camera.md` 1, `devices-type-data-life.md` 1).
4. **Register** every caption (`box`, `text`, `cap`, `color`), lettering, hero, support, piece, mark, ground, each row's `<row id>-target` box, and `camera.shot` after every cut, from the variable that draws it (`references/registration.md` 2-4).
5. `node <engine>/core/animatic.mjs <film>`; look at every still of the contact sheet against its row, then watch the mp4 (caption chunks, lettering and marks that land after `key[0]` are only there): hero is the subject, the target part is inside `stage.box` (read `partAt`), nothing clipped. Fix first. Stage 1 owns the composed framing at each row's `key[0]` (where every later move must land); a framing defect seen here is fixed in the layout and `--stage animatic` re-run.
6. Gate `--stage animatic`. STOP: hand to the Director; no motion before the go.

Stage 2: motion (after the Director's go)
7. **Camera**, one move per row from `zoom.kind`: devices *never-static still*, *stepped motion* (only if `STEP`), *punch-in to the named detail*, *snap, then settle*, *pull-out reveal*, *into the screen or frame*, *layered parallax*, *vertical move* (`references/devices-rhythm-camera.md` 2). `push-in` and `pull-out` rows change scale by >= `NORMS.camera.emphasisMinScaleDelta`; a punch (scale ratio >= `NORMS.camera.punchMax`) at most `NORMS.camera.maxPunches` times; the target stays in `stage.box` from the key word on (T9). In the instructive register (`sheet.register`): bell eases of 1-2 s (`NORMS.registers.instructive.camera`), one emphasis per beat, no shake. Stage 2 owns the move's path and its end: a crop that appears only once the camera moves (a push that ends past the part) is fixed in the camera keys, here.
8. **Entrances and shadows** from the row's `device`: *one prop per phrase*, *stagger build that counts*, *drop and settle*, *hand as the agent*, *document slides in tilted*, *typed entrance*, *container opens*, *overshoot pop*, *soft contact shadow* (`references/devices-transitions-entrances.md` 0, 2, 3). Depth is drawn per piece: each piece has a height above the surface; its contact shadow stays tight and its cast shadow grows softer and further with height, so overlapping pieces read as objects stacked on a table, never as one flat layer. Portraits live: a blink every few seconds (2–3 frames closed), a hat that tips on its brim and settles askew, a glance — keyed in stepped poses. Every row performs its `act` from the sheet: a rigged figure moves its parts about their pivots (`<film>/assets/rigs/<id>/rig.json`: parts, pivots, parent, z; keys in stepped poses on the film's clock, a hit lands on the word; its cue is a proposal the sound role curates, soft paper only, never a knock or slap), a prop drops, turns, tears or is stamped (a stamp comes down square to the text it prints, its face over that text, presses, lifts away, and only then is the impression there — client, 2026-10-17) — pictures are alive, never a still plate under a camera move (client, 2026-10-15). Entrances move, they never fade; the hero is up inside `NORMS.sync.heroWindowFrames` of its key word.
9. **Joins** from `join`: within a scene, hard cut on the phrase by default; **between scenes, an animated paper transition** (tear, slide-off, page turn, slab wipe, the outgoing piece carrying in the next page) — a bare cut from one scene's world to the next reads as "corte brusco" (client, 2026-10-19, draft v13 0:41); then *match cut*, *flash frame*, *blur or smear frame*, *paper-native wipe*, *iris*, *glitch*, *dissolve* only where the row or the pace plan names them (`references/devices-transitions-entrances.md` 1).
10. **Type and data**: a highlighter mark is drawn as one stroke WHILE the voice says the marked words, never pre-printed under them; it is the highlighter yellow (the overlay's colour), multiplied so the ink stays black (client, 2026-10-17). *caption as the motion* timing, *draw-on markup*, *count in steps*, *data that performs*, *type interleaved with the subject*, *echo stack* (`references/devices-type-data-life.md`, `devices-rhythm-camera.md` 1).
11. **Life**: *idle life* on every hold >= 1.5 s, *pose swap*, *shape morph*, *flash train* on the one intensity beat (`references/devices-type-data-life.md` 4, `devices-rhythm-camera.md` 1).
12. After each row: stills at the end of its move and at its key word, `partAt` read, image looked at. A framing defect found by anyone is fixed and the trace gates re-run before another row is touched (`--stage animatic` while there is no draft render yet; T7 and T9 run there), a deadline never reorders this (`references/worked-examples.md` 2).
13. `node <engine>/core/render.mjs <film> --draft`; watch at phone size with the sheet open; gate `--stage draft`; write `animation-notes.md`.
14. After the Director confirms picture lock: `node <engine>/core/render.mjs <film>` (60 fps, 4 subframes; `--sub 8` for whips) writes `out/silent-9x16.mp4`. It stays silent; the sound role mixes onto it.

## Gate

`node <engine>/core/checks/run.mjs <film> --stage animatic|draft`; PASS = exit 0 and no 🔴 in `crew/checks-<stage>.md`.

- Animatic: S1-S9, F1, T0-T9, H1, P1, R1-R3 (events from hero id, caption id and `camera.shot`; `references/registration.md` 2).
- Draft (the same gates run again at the final stage): the same as the animatic, minus R3 (animatic only), plus F2, M0, M1 (dead window `NORMS.frames.deadWindowS`), R4, T10 (`NORMS.caption.capHeight`), T11 (`NORMS.caption.minContrast`). T5 (grounds excluded), T7 (per emphasis row, punch cap) and T8 already run on the animatic; they bite once the camera moves.
- 🟠 are fixed or named in `animation-notes.md` with the reason (a dissolve's T6 is the usual one). Thresholds are `NORMS` keys; this file quotes none.
- Exit 0 is the floor. The gates do not see: the right part framed (T9 reads a box you registered), pieces on the film's clock, stop-sync, shadow lift, a composed closing frame, a crisp vector mark. You check those on stills and name them in the notes.

## Real-world sense (client, 2026-10-16: "ter em mente como objetos funcionam no mundo real… devem fazer sentido prático")

Before a scene is done, watch it once asking only "would paper and objects on a real desk do this?" Every item below is a red defect:
- **Layers obey stacking**: a route, line or ink drawn on the map goes UNDER the cut-outs pasted on top of it, never across them.
- **Tools work the right way up**: a pin enters point first, head out, and actually holds the paper it pins; tape spans both edges; a staple bites both sheets; a stamp prints square and inks after the lift.
- **Nothing vanishes**: a piece leaves by a physical act (slid off, lifted out of frame, torn away, covered); never a fade or a pop-out.
- **Nothing appears from nowhere** (client, 2026-10-16): every piece enters by a physical act — slid, dropped, pulled in from off-frame or out of another object; never a pop-in, a fade-in or a scale-from-zero.
- **Lettering fits**: typed or lettered text ends fully inside the frame and its strip; check the last frame of every type-on.
- **A turned page reveals a different page**: the leaf under a page turn shows new content, never a copy of the page above.
- **Nothing parks**: from frame 0 every piece on screen is moving or settling (drag in, breathe); never a picture frozen in a corner or a cut-out held still before its move starts.
- **One gesture at a time, dragged not cut**: when three things must arrive, a hand drags them in one after another, each settling before the next; no stacked sub-second animations.
- **The key moment gets time**: the film's best device is held long enough to be read (≥ 2 s of clear motion, then a hold); stretch the picture past the voice if needed.

## Tells (ranked; fix named)

0. **Approved event compressed to fit the voice** (2026-10-19, draft v14 0:06: the scissors cutting the word, and their sound, lost in a re-cut). Play it at its approved duration; no room left → route a `pause` to the writer (picture first, `film-director` "Never").
1. **Unreadable type** (grammar §11 #3; T10, T11): small, low contrast, over faces or a bright sky. Move to the quiet area, plate or glow; size and colour are the style bible's.
2. **Dead hold** (§11 #8; R1 still hold, M1): a still held with no event and no drift. Caption as the motion, 1-3 % drift or an idle loop.
3. **Pasted look, popping in and stop-sync** (§11 #1; postmortem K2; client, 2026-10-19, draft v15 0:49: "os objetos têm que ser movimentados na tela, não pipocarem/aparecerem do nada" — a second picture appeared over the first with no motion): every piece enters by moving — slid, dragged, dropped or carried in from off-frame or from under another piece — and leaves the same way; never appears in place, never cuts in. Fade or scale-pop entrances, no shadow lift, all pieces settling on one frame. Lift, rotation, settle; offset starts 3+ frames. A dropped piece starts a hand's height above the desk (scale ≤ ~1.12, ~0.25 s fall, a small press), never from camera-close at 1.5×+ shrinking in 1–2 frames: that reads as a digital "punch" (client, 2026-10-17).
4. **Weak or wrong zoom** (postmortem C7, K1; T7, T9; §12.2; client, 2026-10-19, draft v16 0:09: "deu zoom demais e cortou totalmente Lutero da imagem"): linear, under the bar, ends on the wrong part, pushes so far that the scene's person leaves the frame (the hero stays visible through any push), or punches as a habit. Reframe at once; a punch (`NORMS.camera.punchMax`) is a rare accent.
5. **Voice outruns the picture** (§1; H1): the noun lands before its picture. Cut earlier, never delay the caption.
6. **Held overlap or crop** (§11 #7): an entrance crop kept past its first frames, a final hold outside the safe margin. Overlaps only on sub-second beats.
7. **Raw low-res or generated plate** (§11 #5, #6): step it if `STEP`, cover with type, use for one beat.
8. **Floating label** (§11 #10): draw a leader to its object with the label.
9. **Soft join with no row** (§3), a smeared or empty ending (postmortem C6), a chip per word (C2), a flat vector mark (K6), blur on type.
10. Two text animations of the same role at once; a hero fading in; `Math.random`, CSS transitions, timers.
11. **Anxious motion** (`moran/DMtlFlxJ6sg`, `DO60IqNif6o`): camera shake, wiggle(12,2) gate weave on the camera, flicker above 2 Hz, flash trains. Off in the instructive register (`camera.forbidShake`; no gate reads it yet, the reviewer does); the paper breathes, the camera does not shake.
11b. **Register the box that moves** (T12, engine `9dbe46b`): `ctx.reg` a piece with its live pose during its entrance and exit, not its rest box — T12 reads the trace to catch pop-ins, and a rest box makes every slide-in look like a pop-in (6 false oranges on the reference film).
12. **Frozen cut-out or a page that fills later** (client, 2026-10-19, draft v13 0:07 and v14 0:09 — "10x que já reclamo disso": portrait strips must start assembling the moment they appear, never hang still): a portrait cut-out left still on screen, or a scene that opens on an empty page and adds its pieces after. A cut-out that opens a scene is the transition into the next page: it moves (drags, lifts, carries) until the next page is under it, and that page arrives with its pieces already on it.
13. **Enter-and-leave, ground ping-pong** (client, 2026-10-19, draft v14 1:05: "essa cena não serve pra nada, ela entra e já sai, depois entra um fundo vermelho, depois volta pra esse fundo e já entra um monte de animação junto"): a piece that enters only to leave, a ground that flips and flips back within seconds, many pieces landing at once. One ground per passage, one event at a time, each settled before the next.
13b. **Leftover ground** (client, 2026-10-19, draft v13 1:01: "resto de adição, não serve pra nada esse fundo"): a ground, sheet or backdrop from a previous scene (or a removed one) left on screen carrying nothing the line says. Every ground on screen holds what the voice is talking about; when its pieces leave, it leaves with them.
14. **Generic stand-in for a named object** (client, 2026-10-19, draft v13 0:25: "use a capa de uma bíblia, Vulgata, ao invés de uma folha simples"): the line names a thing (the Vulgate, a letter, a coin) and the screen shows a plain sheet. Show the thing itself, recognisable at a glance (a Bible's cover or binding, the seal, the coin); ask the archivist for it.

## Hand-off

- To the Director: files above and the gate summary line, with each 🟠 left and why. After lock only the Director routes changes to you.
- Back to the Director, one line per item with the row id: a target part that cannot be framed (asset too small or part cropped in the file: archivist); a row with no event, too long a hold or too many words (storyboard); a `push-in` row meant as a drift (storyboard); a line faster than a caption can hold (writer); a gate reading that looks wrong against the picture (engine, with frame and `t`).

## Knowledge

- `research/editing-grammar.md`: §1 rhythm, §2 camera, §3 transitions, §4 entrances, §5 motion, §6 type interleaved, §7 type, §9 contact shadow, §10 rhythm model, §11 odd tells, §12 Moran contradictions.
- `research/craft.md` §2.1-2.3, §2.5-2.7, §2.10; `research/first-film-postmortem.md` (C/K ids).
- `references/registration.md`, `devices-rhythm-camera.md`, `devices-transitions-entrances.md`, `devices-type-data-life.md`, `templates.md`, `worked-examples.md`.
- `references/moran.md` ("Camera and focus", "How pieces move", "Transitions", "Type, callouts and annotation", "Maps and data", "What reads as fake"), `references/zhylin.md`.
