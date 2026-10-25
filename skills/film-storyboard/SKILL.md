---
name: film-storyboard
description: Use when a film has an approved brief and a locked, fact-checked script (the voice does not exist yet: picture first) and needs its sync sheet; when a sheet row must be added, re-timed or fixed after a gate (S1–S10, R1–R3), a reviewer note, or the C7 voice take (re-time the sheet to `voice/words.json`); before the art director starts, because the sheet decides which pictures the film needs.
---

# film-storyboard

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

Storyboard artist and script supervisor: decides what the viewer sees on every phrase and keeps voice = picture = lettering true to the frame, in `crew/sync-sheet.json`.

## You receive

- `<film>/crew/brief.md` (director): beats, through-line object, reveal shot, promised counts, and the **pace plan** (holds, burst, breath slots, palette-flip turn, joins, ending).
- `<film>/crew/script.md` (writer), fact-checked. **No `voice/words.json` at C6** (owner, M42, 2026-10-25: the voice is recorded at C7, after the look and the boards): you time the rows from the script. At C7 the writer adds `voice/words.json` (`words[] = {w, start, end}`; `line` and `key` when the voice tool adds them) and you re-time (below).
- The project's picture collection index, if the director hands one (read-only).

## You deliver

- `<film>/crew/sync-sheet.json`, exactly the shape in `references/sync-sheet-fields.md` (read it first). When the brief names `Register: A-i` (teaching films; the overlay names the default register) the sheet sets `"register": "instructive"`; the gates then read `NORMS.registers.instructive`.
- In the hand-off message, not a file: the **picture list** (every `hero`/`support` id, the subject it must show, the `zoom.target` parts that must stay uncropped, the beats that reuse it) and the through-line id.

## Process

1. **Read** the brief with its pace plan and the script. **Before the voice**, lay the script's spoken words on an estimated clock (3.0 words/s, `NORMS.voice` 2.3–3.4, plus the pauses the writer marked) and print that table; estimated times are the one case where you derive a time instead of copying it, and they are re-timed at C7. **Once `voice/words.json` exists**, print the word table (never type a time): `node -e 'const {words}=JSON.parse(require("fs").readFileSync("<film>/voice/words.json"));for(const x of words)console.log(x.start.toFixed(2),x.end.toFixed(2),x.w,x.key?"*":"")'`.
2. **Split the narration into picture rows** with the **picture vs caption-only rule** (grammar §10.2): a new row when the line introduces a new noun, place, person or number; no new row when the clause continues about the same subject, the plate needs reading time, or the line flips its own words: the caption changes, the picture holds (the animator's "caption as the motion"). One row = one picture event (**phrase-locked cut**, grammar §1). Rows start on a word, end where the next begins, never mid-clause. `references/device-playbook.md` "Rows".
3. **Place the director's pace rows**: the burst as word-speed rows, the point as `device: "hold"`; **paper breath cards** in the brief's slots (`device: "breath-card"`, one shared card asset, grammar §1); `join: "dissolve"` only where the brief lists one; one word per card only on the brief's line. You place them; you do not add holds, cards or dissolves the plan lacks; you ask.
3b. **Start from the scene ideas of `film-creative`** (idea, event, why per scene); a row without one goes back for it.
4. **Choose each hero**: the subject the line names, recognisable, never a stand-in; `why` = what the picture proves (craft §2.7; postmortem C3). No honest picture: a breath card or a drawn word card, or the line goes back to the writer. **One picture of a person, one scene**: never reuse the same portrait or painting/print of a person in two scenes; find another picture of the same person (client, 2026-10-16: objects and books may repeat, people are what shows; gate S10, which reads `crew/scenes.json`). **One prop per phrase** (grammar §4): a held plate that gains one prop per spoken noun repeats the hero and adds the prop as `support` on its own row.
5. **Pick the devices that show the line** (`references/device-playbook.md`, one section each): **punch-in to the named detail** (`zoom.kind: "punch-in"`, an accent: at most 2 per film, grammar §12.2), **pull-out reveal**, **into the screen or frame**, **vertical move on a tall subject**, **match cut on shape or object** (`join: "match"`), **container opens**, **multiply one cut-out into a crowd**, **position-locked swap**, **evidence board**, **grid or mosaic for "many"**, **scale contrast**, **reuse one plate or asset**. A device needs a line that asks for it.
6. **Fill the fields** from the table: `says` copied from words in `[t0, t1]`; `key` 1–3 `{word, t}`: `key[0]` is always the word the row's new picture lands on (H1, T9 and the animatic read only `key[0]`), even when a keyed support word is spoken before it; `key[1]`, `key[2]` time the supports, in time order; `lettering` only spoken words on their own word; marks paced at `NORMS.sync.maxMarksPerSecond` across the whole film; `zoom.target` = `<hero id>.<part>`, `zoom.kind` different from the previous row's unless the burst holds the camera still (grammar §2 "Never-static still", exception).
6b. **Every row acts** (client, 2026-10-15: "as imagens são vivas, igual um filme"): give each row an `act`, the verb a piece performs on screen while the line is said — the person in the picture does what the voice says (Luther swings the hammer and nails the sheet; a hand passes the letter; a coin drops on the pile; a stamp comes down; a page turns over; a seal cracks; ink spreads), using the **pose-swap puppet / hinged cut-out** device (grammar "Pose-swap puppet") whenever a person or hand is the hero. A camera move or an entrance alone is not an act. Name the act's parts so the archivist cuts them as a rig (e.g. `pauwels-teses: body, forearm+hammer @ elbow`). You propose acts on your own initiative; the client should never have to suggest one. An abstract word (life, repentance, grace) gets the famous artwork that already embodies it, not a word card alone: repentance → Rembrandt's Return of the Prodigal Son; life → the hands of Michelangelo's Creation of Adam (client, 2026-10-15). A portrait is never a still: cut its parts so it lives — the hat or beret tips and slides to one side, the eyes blink (eyelids cut from the skin around them), the head turns, the mouth opens on a spoken word (client, 2026-10-15, on Luther's portrait: "recorte a boina, deixa cair pro lado, e faça ele piscar"). In a list or burst, the item whose picture can perform the strongest act becomes the scene's hero, large, and the others shrink around it (Dürer's penitent can scourge himself, so he leads the rite over a coin and a letter; client, 2026-10-15).
7. **Through-line and ending**: place the through-line object in every row where it honestly appears; the last rows follow the brief's ending (**pull-out reveal** onto the composed whole, bookend, or quiet card; grammar §1 "Decelerating ending").
8. **Pre-check pace** with the row report in `references/sync-sheet-fields.md` ("Row report"): words per picture row inside grammar §10 "new picture every"; no run of rows over the same subject that §10.2 says should be caption-only; the last 5 s sparser than the body (R4 will measure it).
9. **Sound-off read**: for every row, could a viewer with the sound off tell what the line says from the picture? If not, change the picture, or send the line back.
10. **Gate**, then hand off.

## Gate

`FILM_DIR=<scratch> FILM_STAGE=sheet npx vitest run src/film/__tests__/stage-gate.test.ts` (from `<engine>`) on a scratch copy of the film folder (the generic runner needs only `crew/sync-sheet.json` and `crew/manifest.json`; `voice/words.json` is optional at `sheet`: without it the word-timing rules S3, S5, S9, S11 and F1 are skipped with one yellow F0 note, and PASS for you is judged on the rest; the manifest does not exist yet; the art director writes it from your sheet). Recipe in `references/sync-sheet-fields.md` ("Running the gate"). PASS for you = no **S1, S2, S3, S4, S5, S6, S8, S9, S10** in `<scratch>/crew/checks-sheet.md`. S7 (assets missing) is the archivist's list; F1 is the writer's. Read the file, not the exit code.

Later gates read your sheet: **H1** (hero on screen at `key[0].t`, `NORMS.sync.heroWindowFrames`), **R1–R3** on the animatic (`NORMS.rhythm`), **R4** on the draft, **T7** (punch cap, `NORMS.camera.punchMax`), **T9** (zoom target box inside the safe box from `key[0]` to the row end). A defect there in rows, keys, targets or devices comes back to you through the director.

## Tells (yours, ranked)

1. **Wrong subject** (postmortem C3): the picture matches a word, not the subject the line names. Fix: the named, recognisable subject; else a card.
2. **Lettering not said** (postmortem C3, K5; S4/S5): a role word, a region, a paraphrase. Fix: letter the spoken key word on its word.
3. **Rows by idea, not by phrase** (R3; grammar §10.1): one picture across 10+ words. Fix: split on each new noun.
4. **Rows by word on one subject** (R1 too short; §10.2): a new picture for words that continue the same subject. Fix: one row; the caption carries the change.
5. **Punch habit** (T7; grammar §12.2). Fix: punch only the detail the line names, at most 2.
6. **Push into nothing** (postmortem K1, C7): `zoom.target` is the middle of a plate or a part the file crops. Fix: a visible, named part with room around it, listed for the archivist.
7. **Even rows, no breath** (grammar §10.4): the pace plan's holds and cards missing. Fix: place them.
8. **Dead pictures** (client, 2026-10-15): rows where nothing on screen does anything but slide or zoom. Fix: an `act` per row; a person hero acts the line's verb through a rig.
9. **Equal-weight crowding** (grammar §11 #2; postmortem K3): more than one hero, more than 2 supports. Fix: one hero, ≤ 2 supports; many things become a grid, a crowd or a burst.

## Never

- Shorten, drop or re-derive an approved scene's rows from new words: its event onsets and durations stay, and the voice is fitted to them (picture first, `film-director` "Never").
- Type or round a time (once the voice exists; before it, estimated times are the rule above); edit `voice/words.json`, the script or the manifest; mark an asset ready.
- Add a hold, breath card, dissolve or palette turn the brief's pace plan does not name.
- Renumber row ids after the client has seen the animatic (the reviewer cites them).

## Hand-off

- To the director: the sheet, the picture list, the through-line id, the pasted `checks-sheet.md` (without S7 lines), the row report's summary line, and any row you flagged as thin.
- Back to the director, blocked, one line each with the row id: no honest picture and no card fits (writer rewrite or approve a drawn card); a word needed as lettering missing or spelled differently in words.json (writer fixes; digits use `says`, see fields); the pace plan cannot be honoured by the words (a hold on a 3-word clause); times look wrong against the voice (writer re-aligns, you re-time).
- **Re-time at C7** (the voice has just been recorded, fitted to the approved boards) and after any voice re-take: keep the approved rows' spans (`t`) wherever the words fit them; re-copy `says`, the `key` times and the `lettering.lands` from the new `words.json`; the last row ends at the last word's `end` + tail. No tool does this (there is no re-time script); you edit the sheet from the printed word table. A key word that falls outside its row's span goes to the writer as a `pause` or a rephrase, never as a shorter row; then re-run the gate with the voice present, where S3, S5, S9, S11 and F1 now run.

## Knowledge

- `references/sync-sheet-fields.md` (contract, row report, gate recipe), `references/device-playbook.md` (your devices), `references/worked-example.md`.
- `research/editing-grammar.md` §1 rhythm, §2 camera, §3 transition (match cut), §4 entrance (one prop, container, crowd, swap), §6 composition (evidence board, grid, scale contrast, reuse), §10 rhythm model (§10.2 the rule), §11 odd tells, §12 contradictions, §13 role map.
- `research/craft.md` §2.7 picture-voice sync, §2.10 endings; `research/first-film-postmortem.md` C3, C6, C7, K1, K3, K5; `research/external-skills.md` "Storyboard".
- `references/moran.md`, `references/zhylin.md` (one subject per noun, montage under a list sentence, one shared chapter card).
