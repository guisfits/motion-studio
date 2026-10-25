---
name: film-animator
description: Use when a film has a passing sheet gate (sync sheet, style bible, ready manifest, voice and word times) and needs its animatic, camera, entrances, transitions, captions and type timing, or its silent master; or when a framing, rhythm, trace or dead-frame defect (R1-R4, T0-T11, H1, P1, M1) is routed back for a fix. Owns the film's `Film.tsx`, `scene.ts` and `trace.ts`, the animatic, `out/draft-<format>.mp4` and `out/silent-<format>.mp4`.
---

# film-animator

## The core: a scene is a paper EVENT, not pictures pasted on a ground

Read this first; it overrides any habit below (client, 2026-10-15, said five times: "você está pegando um monte de imagens e colando num fundo qualquer… seja criativo").

The film is a **Vox-style animated paper collage**. Every scene is something that HAPPENS to paper while the line is said — designed as motion first, the still comes last. A scene that is "a few cut-outs arranged on a ground, then the camera drifts" is a failure even if every picture is right.

For each scene, before any layout, write its **event**: one verb the paper performs that visualises the line, using the collage vocabulary of the finished pieces in `inspirations/vox-collage/collage-study/findings.jsonl` (engine root) (`area` = motion, transition, entrance-exit, cutout, camera). Search it for the line's idea (e.g. `jq 'select(.area=="transition")' … | grep -i tear`) and borrow:
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

## Where commands run

Every command here runs from the motion-studio root (`media/video/studio` in a host project); every path is relative to it.

## Role

Animator and editor: you cut the film to the voice and make it move, and you write the trace of what it draws so the gates measure meaning. You change no word, no sheet row, no asset.

## You receive

- `crew/sync-sheet.json` (storyboard; `film.json` points to it by path): `beats` is the sync sheet, one row = one picture event; `key`, `hero`, `support`, `lettering`, `zoom {target, kind}`, optional `device`, `join` (`skills/film-storyboard/references/sync-sheet-fields.md`, "Sheet to film.json"). `crew/manifest.json` and `voice/words.json` are the other two files `film.json` points to: import them as JSON in `scene.ts`/`trace.ts`, never copy them into `film.json`. Times are law; `scene.ts` converts seconds to frames from `film.fps`, never retype a time.
- `crew/style-bible.md`, the manifest (all `ready`) and `assets/`; the brief and its pace plan (register, holds, joins, ending); the overlay pieces the Director passes (house outro, recurring cards).
- The voice and its word times (`voice/words.json`; `voice/voice.wav`), recorded at C7 right before your animatic, after the boards, with the sheet already re-timed to it (`film-director` step 7b). The voice is the clock; the `animatic` gate is red F0 without `voice/words.json`.
- The engine: `docs/film-contract.md` (the film folder, `traceAt`, stages and gates), `docs/techniques.md` (component per technique), `studio/films/example/` (the reference film), `research/editing-grammar.md` (cited as `grammar §n`). Remotion's own skills are in `skills/remotion/` (a directory of skills; the ones that matter: `remotion-best-practices/SKILL.md` the router, `remotion-render/SKILL.md` rendering, `remotion-docs/SKILL.md` API lookups): cite them instead of re-deriving.
- **No passing sheet, voice or style bible** (a dry run, a short silent piece)? Write the inputs by hand: a minimal `film.json` per `docs/film-contract.md`; `length: {minS, maxS}` to override the register's length norm (F1 measures narration as the word span, default 45–90 s; the override is an orange F1 until `crew/animation-notes.md` has a line `length: <reason>`, then yellow; the director signs the reason); colours from the project's identity, else neutral. Say in `animation-notes.md` that the inputs were hand-written.

## You deliver

- `studio/films/<slug>/`: `Film.tsx`, `scene.ts`, `trace.ts`, `film.test.ts` (a copy of the example), registered in `studio/Root.tsx` as `F-<Id>`; `cues.ts` (pure sound cues) when the film has sound.
- `out/animatic-<format>.mp4` (half size, `--scale=0.5`) + its `contact.png` / `phone.png` sheets, then `out/draft-<format>.mp4` (picture lock), then `out/silent-<format>.mp4` (final size, no sound; the sound role mixes onto it).
- `crew/animation-ledger.md`, `crew/animation-notes.md`, `crew/checks-animatic.md`, `crew/checks-draft.md` (`references/templates.md`; the checks files are written by the gate).

## Process

The film is pure per frame (`useCurrentFrame`; no timers, CSS transitions or `Math.random`: use `random(seed)` from `remotion`). Geometry and timing live once, in `scene.ts`; `Film.tsx` and `trace.ts` both read it (`references/registration.md`).

Stage 1: animatic (the cut and the layout, no motion yet)
1. **Intake.** Read the brief, `film.json`, the style bible. Copy `<engine>/studio/films/example/` (minimal Remotion film: `Film.tsx`, `scene.ts`, `trace.ts`, `film.json`, `film.test.ts`) to `<engine>/studio/films/<slug>/` (or the project's Remotion folder); set `film.json`, register `F-<Id>` in `studio/Root.tsx` (size from `format`). Decide `STEP`: stepped 12 fps motion only if the brief or style bible asks (grammar §2 *Stepped motion*, §12.3: a house style, not the genre rule); if yes, the one clock is `stepFrame(frame, 30, 12)` for the pieces and the trace alike (`Camera` is never stepped: say so in the notes). Read the trace contract (`references/registration.md` 0). `SetDown`/`carryAt` (`src/paper/carry.ts`) step at `stepFps: 12` by default: pass `stepFps: 30` for smooth motion, in the component and in the trace carry alike, unless the brief asks for stepped. Centre camera targets and captions on the safe box, not the frame: `layoutOf(format).safe` (the 9x16 box is asymmetric, right rail), as the example does with `SAFE[0] + SAFE[2] / 2`.
2. **Ledger before code.** For each row list its events (hero change, caption chunk, hard cut) and compute R1-R3 and the R4 tail from the sheet and the word times (`references/templates.md` 1). Devices: *phrase-locked cut*, *caption as the motion*, *burst, then hold*, *decelerating ending* (grammar §1, §10). A row with no event, a hold over `NORMS.rhythm.maxStillHoldS`, or too many words per event is a sheet defect: route it, do not retime the row.
   - A row with no spoken word (`says: ""`, `key: []`) has no key word: hero and `<row>-target` timing key on the row's start.
   - A short film without hard cuts still needs an event every 2-3 s: a mark/highlight/underline drawn, tape laid, a piece carried in, caption chunks, a shot change inside the move (two keys on one frame).
   - T6 on a large hero the camera travels over: register the target part as the hero while the camera travels (`part-hero`, the part's projected box), or swap heroes at the arrival frame; never leave the large hero registered with its centre outside the middle third.
3. **Build the layout.** In `scene.ts`: grounds, hero, supports at their final composed place (world boxes), caption chunks timed to the voice (`fromWords`, `pageWindows`), **only where the line has no lettering on screen** — words already lettered in the picture are never captioned again (client, 2026-10-16: "legende só o necessário… não precisa legendar duas vezes a mesma narração"). In `Film.tsx`: lettering and marks drawn written; hard cuts at the phrase onset; frame 0 composed, hero seated from the cut frame. Devices: *hard cut on the sentence*, *caption as the motion*, *one hero on a quiet ground* (`references/devices-rhythm-camera.md` 1, `devices-type-data-life.md` 1).
4. **Trace** every caption (`box`, `text`, `cap`, `color`), lettering, hero, support, piece, mark, ground, each row's `<row id>-target` box, and `camera.shot` after every cut, in `trace.ts`, from the same constants and pure functions the components draw from (`references/registration.md` 2-4).
5. **Render the animatic and look** (the self-check loop below, run in full). `tools/render.sh F-<Id> studio/films/<slug>/out/animatic-<format>.mp4 --gl=angle --scale=0.5`, then `node tools/critique/sheets.mjs studio/films/<slug>/out/animatic-<format>.mp4`. Open `contact.png`, `phone.png` and a still at every row's `key[0]` as images; caption chunks, lettering and marks that land after `key[0]` are only in the mp4. Stage 1 owns the composed framing at each row's `key[0]` (where every later move must land); a framing defect seen here is fixed in the layout and the animatic re-run.
6. Gate `FILM_STAGE=animatic npx vitest run studio/films/<slug>`. STOP: hand to the Director; no motion before the go.

Stage 2: motion (after the Director's go)
7. **Camera**, one move per row from `zoom.kind`, as `CAMERA_KEYS` in `scene.ts` read by `<Camera keys>` and by `viewAt` in the trace: devices *never-static still*, *stepped motion* (only if `STEP`), *punch-in to the named detail*, *snap, then settle*, *pull-out reveal*, *into the screen or frame*, *layered parallax*, *vertical move* (`references/devices-rhythm-camera.md` 2). `push-in` and `pull-out` rows change scale by >= `NORMS.camera.emphasisMinScaleDelta`; a punch (scale ratio >= `NORMS.camera.punchMax`) at most `NORMS.camera.maxPunches` times; the target stays inside the safe box (`layoutOf(format).safe`) from the key word on (T9). In the instructive register (`sheet.register`): bell eases of 1-2 s (`NORMS.registers.instructive.camera`), one emphasis per beat, no shake. Stage 2 owns the move's path and its end: a crop that appears only once the camera moves (a push that ends past the part) is fixed in the camera keys, here.
8. **Entrances and shadows** from the row's `device`: *one prop per phrase*, *stagger build that counts*, *drop and settle*, *hand as the agent*, *document slides in tilted*, *typed entrance*, *container opens*, *overshoot pop*, *soft contact shadow* (`references/devices-transitions-entrances.md` 0, 2, 3). Depth is drawn per piece: each piece has a height above the surface; its contact shadow stays tight and its cast shadow grows softer and further with height, so overlapping pieces read as objects stacked on a table, never as one flat layer. Portraits live: a blink every few seconds (2–3 frames closed), a hat that tips on its brim and settles askew, a glance — keyed in stepped poses. Every row performs its `act` from the sheet: a rigged figure moves its parts about their pivots (`<Puppet>`, `solve`, `POSES`; parts and pivots in the film's `puppet.json`; keys in stepped poses on the film's clock, a hit lands on the word; its cue is a proposal the sound role curates, soft paper only, never a knock or slap), a prop drops, turns, tears or is stamped (a stamp comes down square to the text it prints, its face over that text, presses, lifts away, and only then is the impression there — client, 2026-10-17) — pictures are alive, never a still plate under a camera move (client, 2026-10-15). Entrances move, they never fade; the hero is up inside `NORMS.sync.heroWindowFrames` of its key word.
9. **Joins** from `join`: the default comes from the project overlay (the `Film style:` skill); absent one, the generic default is a carried, motivated transition (a `TransitionSeries` wipe, slide-off, page turn, the outgoing piece carrying in the next page), and a hard cut only when it is itself continuous (shape, direction or motion carries over it); a jump cut reads as abrupt. Then *match cut*, *flash frame*, *blur or smear frame*, *paper-native wipe*, *iris*, *glitch*, *dissolve* only where the row, the overlay or the pace plan names them (`references/devices-transitions-entrances.md` 1). Remotion routing: transitions, light leaks and 3D are in the `remotion-markup` skill, captions in `remotion-captions`; use their docs, not copies.
10. **Type and data**: a highlighter mark is drawn as one stroke WHILE the voice says the marked words, never pre-printed under them; it is the highlighter yellow (the overlay's colour), multiplied so the ink stays black (client, 2026-10-17). *caption as the motion* timing, *draw-on markup*, *count in steps*, *data that performs*, *type interleaved with the subject*, *echo stack* (`references/devices-type-data-life.md`, `devices-rhythm-camera.md` 1).
11. **Life**: *idle life* on every hold >= 1.5 s, *pose swap*, *shape morph*, *flash train* on the one intensity beat (`references/devices-type-data-life.md` 4, `devices-rhythm-camera.md` 1).
12. After each row: stills at the end of its move and at its key word (`npx remotion still studio/index.ts F-<Id> out/<row>-end.png --frame=N --gl=angle`), the trace box read at that frame (`traceAt(N)`), the image looked at. A framing defect found by anyone is fixed and the trace gates re-run before another row is touched (`FILM_STAGE=animatic` while there is no draft render yet; T7 and T9 run there), a deadline never reorders this (`references/worked-examples.md` 2).
13. **Draft.** Self-check loop (below) on `tools/render.sh F-<Id> studio/films/<slug>/out/draft-<format>.mp4 --gl=angle --scale=0.5`; watch at phone size with the sheet open; gate `FILM_STAGE=draft`; `node tools/checks/run-mp4.mjs studio/films/<slug>/out/draft-<format>.mp4`; write `animation-notes.md`.
14. After the Director confirms picture lock: `tools/render.sh F-<Id> studio/films/<slug>/out/silent-<format>.mp4 --gl=angle` (final size; `<Camera blur>` smears fast moves, shutter <= 120 deg; cuts stay sharp). It stays silent; the sound role mixes onto it (`tools/audio/mix.mjs`, film-sound step 7).

## Self-check loop (before returning any stage)

Gates read the trace, not the picture. In the S3 round all six demos needed a layout fix-up that no gate had seen; the example's caption box was caught the same way (a missing `fontSize` made the trace box wider than the ink). Run this loop before you return the animatic, the draft or a fix; a green gate on an unseen render is not done.

1. **Render** the stage's mp4 (`tools/render.sh`, half size for animatic and draft).
2. **Build the sheets**: `node tools/critique/sheets.mjs <mp4>` writes `contact.png` (2 frames/s) and `phone.png` (1 frame/s at 360 px, Reels zones shaded) into `out/`; add `--flat` for dead stretches. Pull a still (`npx remotion still … --frame=N --gl=angle`) at every row's `key[0]`, the end of every move and the last frame.
3. **Open the sheets and the stills as images** (Read the png files). Do not trust the code or the trace.
4. **Judge each against this list**, row by row:
   - every piece fully inside the frame (and inside the safe box for the hero, the target and the type);
   - about 70 % of the frame filled with picture, no bare ground;
   - one hero per moment, clearly the largest and brightest;
   - an event (new picture, chunk swap, cut, entrance) every 2-3 s up to the last frame, no dead tail;
   - hero type >= 0.05 of the frame's cap height (`NORMS.caption.capHeight` for captions), readable at phone size on `phone.png`;
   - nothing pops in: every sheet is carried in from off frame (open a 12-frame strip, `sheets.mjs --strip <t>`, on each entrance);
   - frame 0 is never an empty ground: a picture is already in motion at f0;
   - no hold longer than ~2 s without an event, to the very last frame (the dry run had dead holds 3.0–4.5 s and 7.5–10 s);
   - type never enters under, or is clipped by, its plate;
   - the camera lands on the place the brief names, readable as that place;
   - **motion is physical, judged at full rate** (S5 clone, owner: "bem abaixo da média — animação, física dos objetos, movimentação"): every entrance, landing, fall and float comes from `src/physics` (`throwIn`, `bounce`, `flutter`, `drift`, `hover`, `impactShake`), never a lerp; objects arrive fast (default, measured on one professional reel: a throw crosses the frame in 0.12-0.25 s, 2-4 frames at 16 fps, 4-7 at 30) and settle with an overshoot; foreground pieces are big and depth-blurred. These numbers are defaults: the film's own target or approved look, and its measurements, override them. A 2 fps contact sheet cannot show this: open a 12-frame consecutive strip (`sheets.mjs --strip <t>`) on every entrance and every camera move. Mechanism and numbers: `references/motion-craft.md`; when a target video exists, compare with `tools/critique/motion-measure.py` (§6 there);
   - **a stepped print is one stepped image** (S8): when the target runs on twos, freeze the whole picture tree with `<Freeze frame={Math.floor(frame / 2) * 2}>` (picture, tint, caption and grain together) and keep the audio outside it; stepping layer by layer drifts. A pale engraving print is luminance → gamma ~0.7 → blacks ~#3a, whites ~#EA, plus a 0.6 px soften: our raw scans read darker and harder than the reference until lifted. Mechanism: `studio/films/clone-bethlem/Film.tsx`, `lib/kit.tsx` `Filters`;
   - **scale, depth and look per shot** (`references/motion-craft.md` §2, §4): defaults (one professional reel; the film's target or approved look overrides them): hero 50–80 % of frame height, big blurred foreground, one `Grade` + `Grain` (size ~1.3 px) per shot, plates at least render size;
   - the trace boxes match the ink: draw a trace box over the still, or measure the caption's pixels against `captionBox` (the example matches to within 6 px); a drift here means a number was copied instead of read from `scene.ts`.
5. **Fix** what any item fails, in `scene.ts` or the component, never by loosening a trace box.
6. **Re-render, re-look** (steps 1-4) until every item passes; then gate (`FILM_STAGE=<stage> npx vitest run studio/films/<slug>`, `run-mp4.mjs`) and write what you changed in `animation-notes.md`. Only then return.

**The return is unskippable proof**: it names the contact-sheet path built from the latest render (`out/contact.png`, newer than the mp4) and gives one line per checklist item above with the frame(s) that prove it (`item: pass, f0, f132`). A return without these lines is rejected.

## Gate

`npx tsc --noEmit` must exit 0 before you return (the dry run broke it); it is part of the gate.

`FILM_STAGE=animatic|draft npx vitest run studio/films/<slug>` writes `crew/checks-<stage>.md` (the generic form, for any folder, is `FILM_DIR=<film> FILM_STAGE=<stage> npx vitest run src/film/__tests__/stage-gate.test.ts`; under `FILM_STAGE=draft` a missing draft render is red F2); PASS = the run succeeds and the file has no 🔴. On the rendered mp4 also `node tools/checks/run-mp4.mjs <mp4>` (duration, black, frozen, loudness). The stages and their gates are in `docs/film-contract.md`.

- Animatic: S1-S11, F1, T0-T9, T12, H1, P1, R1-R3 (events from hero id, caption id and `camera.shot`; `references/registration.md` 2).
- Draft (the same gates run again at the final stage): the same as the animatic, minus R3 (animatic only), plus F2 and the mp4 checks V0–V3 on the draft render (duration against `durationInFrames / fps`, black, frozen ≥ `MP4.frozenS`, stricter than the final cut's M1 dead window), R4, T10 (`NORMS.caption.capHeight`), T11 (`NORMS.caption.minContrast`, read from the draft render's pixels, `out/draft-<format>.mp4`; the final stage reads `out/silent-<format>.mp4`; render again after every change to `Film.tsx`: a stale render is caught by length, not by look). T5 (grounds excluded), T7 (per emphasis row, punch cap) and T8 already run on the animatic; they bite once the camera moves.
- 🟠 are fixed or named in `animation-notes.md` with the reason (a dissolve's T6 is the usual one). Thresholds are `NORMS` keys (`tools/checks/norms.mjs`); this file quotes none.
- Exit 0 is the floor. The gates do not see: the right part framed (T9 reads a box you put in the trace), pieces on the film's clock, stop-sync, shadow lift, a composed closing frame, a crisp vector mark. You check those on stills and name them in the notes.

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
10. Two text animations of the same role at once; a hero fading in; `Math.random` (use `random(seed)`), CSS transitions, timers, `Date`.
11. **Anxious motion** (`moran/DMtlFlxJ6sg`, `DO60IqNif6o`): camera shake, wiggle(12,2) gate weave on the camera, flicker above 2 Hz, flash trains. Off in the instructive register (`camera.forbidShake`; no gate reads it yet, the reviewer does); the paper breathes, the camera does not shake.
11b. **Register the box that moves** (T12): trace a piece with its live pose during its entrance and exit (`setDownPose`, `shiftBox`, `projectBox`), not its rest box — T12 reads the trace to catch pop-ins, and a rest box makes every slide-in look like a pop-in (6 false oranges on the reference film).
12. **Frozen cut-out or a page that fills later** (client, 2026-10-19, draft v13 0:07 and v14 0:09 — "10x que já reclamo disso": portrait strips must start assembling the moment they appear, never hang still): a portrait cut-out left still on screen, or a scene that opens on an empty page and adds its pieces after. A cut-out that opens a scene is the transition into the next page: it moves (drags, lifts, carries) until the next page is under it, and that page arrives with its pieces already on it.
13. **Enter-and-leave, ground ping-pong** (client, 2026-10-19, draft v14 1:05: "essa cena não serve pra nada, ela entra e já sai, depois entra um fundo vermelho, depois volta pra esse fundo e já entra um monte de animação junto"): a piece that enters only to leave, a ground that flips and flips back within seconds, many pieces landing at once. One ground per passage, one event at a time, each settled before the next.
13b. **Leftover ground** (client, 2026-10-19, draft v13 1:01: "resto de adição, não serve pra nada esse fundo"): a ground, sheet or backdrop from a previous scene (or a removed one) left on screen carrying nothing the line says. Every ground on screen holds what the voice is talking about; when its pieces leave, it leaves with them.
14. **Generic stand-in for a named object** (client, 2026-10-19, draft v13 0:25: "use a capa de uma bíblia, Vulgata, ao invés de uma folha simples"): the line names a thing (the Vulgate, a letter, a coin) and the screen shows a plain sheet. Show the thing itself, recognisable at a glance (a Bible's cover or binding, the seal, the coin); ask the archivist for it.

## Hand-off

- To the Director: files above and the gate summary line, with each 🟠 left and why. After lock only the Director routes changes to you.
- Back to the Director, one line per item with the row id: a target part that cannot be framed (asset too small or part cropped in the file: archivist); a row with no event, too long a hold or too many words (storyboard); a `push-in` row meant as a drift (storyboard); a line faster than a caption can hold (writer); a gate reading that looks wrong against the picture (engine, with frame number).

## Knowledge

- `research/editing-grammar.md`: §1 rhythm, §2 camera, §3 transitions, §4 entrances, §5 motion, §6 type interleaved, §7 type, §9 contact shadow, §10 rhythm model, §11 odd tells, §12 Moran contradictions.
- `research/craft.md` §2.1-2.3, §2.5-2.7, §2.10; `research/first-film-postmortem.md` (C/K ids).
- **`references/motion-craft.md` first** for any motion, physics, camera, depth, look or transition decision (measured on a professional reel, S5; style-free).
- `docs/film-contract.md`, `docs/techniques.md`, `references/registration.md`, `devices-rhythm-camera.md`, `devices-transitions-entrances.md`, `devices-type-data-life.md`, `templates.md`, `worked-examples.md`.
- `../_shared/moran.md` (the shared Moran ledger: lessons tagged `ANI`, find them with `rg -n '\{[^}]*\bANI\b' <file>`; section index at its top: read a section with offset/limit, not the file; "Camera and focus", "How pieces move", "Transitions", "Type, callouts and annotation", "Maps and data", "What reads as fake"), `references/zhylin.md`.
