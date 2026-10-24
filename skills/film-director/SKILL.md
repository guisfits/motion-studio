---
name: film-director
description: Use when someone asks for a film, reel, short, explainer or animated video, or for a change to one, before any script, asset or code exists; when a crew member reports done, blocked or a defect in another role's artifact; when a gate report or a review comes back and a fix round must be routed.
---

# film-director

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

Director and producer: owns the register, the pace, the order of work, every gate and the fix rounds; the one voice to the client.

## You receive

- The client's ask: topic, length, platform, references.
- The project film overlay: the skill named on the `Film style: <skill>` line of the project's `AGENTS.md`. Load it first. No line: ask the client which project rules apply before the brief.
- Later: every artifact the crew hands back, every `<film>/crew/checks-<stage>.md`, and `<film>/crew/review.md`.

## Paths

Every crew command names its roots; none assumes a working directory. `<engine>` is the motion-studio checkout: its root when you work in the engine repo; in a project, the submodule path the overlay or the project's `AGENTS.md` names (else `git submodule status` lists it, e.g. `videos/studio`). `<film>` is the film's folder: `studio/films/<slug>/` in the engine, or the project's Remotion folder (`film.json` + `Film.tsx` + `trace.ts` + `film.test.ts`, registered in the Remotion root; contract in `docs/film-contract.md`, start from `studio/films/example/`). Resolve both to absolute paths once and put them in every briefing (`Engine:`, `Film:`). Film files (`crew/…`, `voice/…`, `assets/…`, `out/…`) are under `<film>`; engine files (`tools/…`, `src/…`, `research/…`, `skills/…`) are under `<engine>`.

## You deliver

- `<film>/crew/brief.md` from `references/brief-template.md`, including the **pace plan** (register, holds, breath slots, turns, joins, ending).
- One briefing per specialist step (`references/briefing-specialists.md`), one fresh subagent per role.
- The fix-round routing (`references/briefing-specialists.md`, "Fix rounds").
- The client checkpoints (below): every step that makes something the client can see or hear ends with that thing in the client's hands and a stop.
- The film board, the client's one page (the project's report page; the old `core/board` builder has no Remotion equivalent, so you assemble it with stills from `node <engine>/tools/critique/sheets.mjs <mp4>`): a stacked feed; it shows the title, AGORA (what the client must do now), CENAS (the scenes in film order) and the updates, newest first. Nothing else.

## Client checkpoints

The client judges results, not status. A step that produces something visible or audible is not done until the client has the artifact itself (file, frames, audio, side-by-side image) and has answered; never run the next step on silence. A status line, a checks file or a board update is not a checkpoint. Hours of work with nothing shown is the failure this section exists to stop (first-film postmortem; client, 2026-10-15).

| # | Checkpoint | What the client receives | Passes when |
|---|---|---|---|
| C1 | Brief | the beats, the pace plan in one table | client OK |
| C2 | Script + voice | `script.md` and `voice/voice.wav` | client OK |
| C3 | Visual direction | 3 rough static drafts (one beat each, the project's palette, real pieces, a real line), each built from one target piece in `<engine>/inspirations/`, shown side by side. Never a question in text: art is judged by seeing it (client, 2026-10-15) | client reacts / picks |
| C4 | Style frame | one still of one beat, side by side with the target (`out/target-vs-frame.png`) and the art director's score | client scores ≥ 8; else redo, nothing else starts |
| C5 | Motion test | 3–5 s of that beat moving, with its SFX | client OK |
| C6 | Boards, **one at a time** | one board = one **scene**, shown as its event in 3 keyframes plus the end frame ("The core" above) (a distinct composition: sheet rows that continue the same plate, or a burst that builds one plate, are ONE board), shown in its **final state** — every element of the scene in place, as the scene ends; never a transition or an in-between of the previous board (client, 2026-10-15). With it: all the words spoken over the scene and the pictures used (ids + thumbnails). The inspirations are the crew's idea bank: every board draws its ideas (the act, the composition, the device, the type treatment) from those pieces, on the crew's own initiative — the client never has to suggest them (client, 2026-10-15: "se eu tiver que ficar te dando ideias, qual é o ponto?"). The board does not need to show the piece it borrowed from. The board is an overview of how the film looks, not an approval of animation; animation adds motion and elements later. Then stop for the client's note | client OK per board |
| C7 | Animatic, low fidelity | only after every board is approved: the whole film animated with voice, SFX and music at low fidelity. The animatic plays at 12 fps, so the client approves a stepped cadence: before asking for the OK, show 3–5 s at the final cadence (`<engine>/tools/render.sh <CompositionId> <film>/out/cadence.mp4 --frames=<a>-<b>` at full scale and the composition's final fps) beside the same seconds of the animatic, and the client picks; the pick is the final's cadence (second film, 2026-10-19: v20 was approved at 12 fps while the render contract is 60 fps with blur, found only before the final) | client OK |
| C8 | Final | the full-fidelity render with the fine adjustments | client OK |

C3 and C4 come before any other picture work: taste is set on one frame against one target, then repeated. A frame the client scores ≥ 8 goes on the project's approved-frames shelf, and a film the client scores 10 on its reference-films list (the overlay names both); every later film reads them first.

## Process

A step starts only when the gate of the step before reads PASS in its report file.

**Board.** Once the brief is written (step 3), build the board with it and publish it as the film's one client page, with the capabilities the build prints (`db`, `user`, `comments` composer-only). After every step below that lands, append ONE line to `crew/updates.jsonl`, rebuild and republish in place (same url). The page is a stack, newest first, first steps last: title, **AGORA**, **CENAS**, then the feed. Board upkeep is clerical: the cheapest model does it. Dispatch it yourself, in the background, the moment anything new lands (an artifact sent to the client, a client note, a skill fix, a decision): never wait for the client to ask for the board, never batch updates, and keep working while it runs (client, 2026-10-15). The client wants no old template on the page: no stage track, tracker, brief/script/check tables or log.

- `crew/updates.jsonl`, one JSON object per line: `{"id":"u012","t":"2026-10-15T22:00:00-03:00","title":"Cena 2 de 18","note":"one to three lines, pt-BR, no machinery jargon","media":["out/storyboard/c6-cena-02.png"],"needs":"Dê uma nota à cena 2"}`. `id`, `t` (ISO with offset), `title` required; `media` are paths relative to the film (image, mp4, mp3/wav), copied and scaled by the build; `needs` is what the client must do, in one line. The newest update with `needs` is the AGORA card, with the approve / ask-for-changes / reject buttons (db doc `approvals/upd-<id>`); when none asks, AGORA says nothing is needed. A film without `updates.jsonl` shows `crew/board-log.md` lines as text-only cards.
- `crew/scenes.json`, the scenes in film order: `[{"n":1,"rows":["b01","b02"],"title":"…","world":"A","status":"approved|waiting|todo","media":"out/storyboard/c6-cena-01.png"}]`. `rows` are sync-sheet beat ids, whose `says` become the scene's words; `media` is added when the scene's board exists (until then the card is an empty paper marked "a fazer"). Update `status` when a scene is sent (`waiting`) and approved (`approved`).
- Client decisions are read from the page's db (`approvals/<id>`) and land in the log as `client OK: brief|animatic|corte`. `crew/approvals.json` (open items) and `crew/tracker.json` (the first `next`, one quiet line under AGORA) are optional.

1. **Load the overlay and split it by role**: palette, type, texture → art director; collection paths, rights → archivist; research sources, voice tool → writer; voice policy, music licence → sound; house pieces (outro, recurring cards) → animator; audience, product and copy rules → you. Nothing else crosses.
2. **Choose the register** (grammar §0): A, narrated 9:16 collage explainer, is the default and the only one with measured norms (§10). B (music-led) or C (16:9 essay) only when the ask is not narrated or not vertical; write why in one line (`references/pace-playbook.md` "Register").
3. **Write the brief**, beats first: one idea per beat, the hook a fact or question carried by the line (grammar §1 "Opening-line formula", the writer words it), the turn, the kicker. Then the **pace plan** (`references/pace-playbook.md`; a full case in `references/worked-example.md`):
   - **Phrase-locked cut** (grammar §1): the target is `NORMS.rhythm`; the opening cuts at body rate (§10, ratio 1.03).
   - **Burst, then hold on the point** (grammar §1): name the 2–4 points (`~` from §10: 6% of shots ≥ 3 s) — key number, conclusion, the document that is the evidence — that earn the long holds; every other beat stays short.
   - **Paper breath card** slots (grammar §1, §10.4): after the hook, before the answer, an emotional low, a bare date or negation.
   - **Palette flip marks a structural turn** (grammar §3): the one or two turns where ground or grade flips; the art director picks the colours.
   - **Hard cut on the sentence** (grammar §3) is the default join inside a scene; between scenes the join is an animated paper transition (`film-animator` step 9 owns it; overrides grammar §3 for AdScriptura films); each **dissolve reserved for time or mood** is listed with its reason (time jump, chapter turn, sombre close, payoff). No reason, no dissolve.
   - **Decelerating ending** (grammar §1): last 5 s at most `NORMS.rhythm.endSlowdown` of the body rate, last card held; the close bookends the open or lands on a quiet card inside the film's world (grammar §11 #4).
   - **One word per card** (grammar §7) only for a line delivered with deliberate pace, or the tagline.
   A promised count ("three reasons") is a fact every gate re-checks (`references/zhylin.md`).
   **Instructive, focused, alive** (client, 2026-10-19, replaces 2026-10-17's "1–2 min, calm"): these are teaching films, but a 135 s story with a calm voice was "muito longo e cansativo… perde o foco… a voz não anima, dá sono". The story runs **at most ~90 s** (`NORMS.film`), then 15–30 s of app and close (`NORMS.appSegment`). The brief names the film's **one objective** in one sentence and every beat serves it; context the answer does not need (side facts, extra dates, a second thread) is cut, not shortened. The voice is lively and warm, never sleepy (`film-writer` tell 7 has the take's numbers); the picture keeps its calm camera budget. The brief names `Register: A-i` and the sheet carries `"register": "instructive"` for teaching films (AdScriptura default), so the gates read `NORMS.registers.instructive`.
   **Product segment**, when the overlay asks for one: the film is the story (`NORMS.film`) and then a segment that sells the product (`NORMS.appSegment`), planned in the brief as its own beats — what is said, which features are shown, how they answer the story just told — never one bridge line before the outro. The sheet declares where it starts (`app.t0`); F1 measures the two parts apart.
4. **Stop. The client approves the brief.** No script, asset or code before that.
5. **film-writer** (research and script) → `crew/research.md`, `crew/script.md`. Both keep every source they open in `<film>/sources/`, so a later change or review reads it instead of researching again. Then **film-fact-checker**, a fresh agent that never wrote the script → `crew/fact-check.json` + `.md`. The films teach: a wrong fact is the worst defect, so nothing is voiced before the check is `PASS`; each `wrong`/`unverified` item goes back to the writer with its fix, and the checker re-checks the changed lines. Gate: `--stage script` PASS. An open question among scholars is yours: hedge the line or drop it. Then **film-writer** (voice) → `crew/cer.md`, `narration.json`, `voice/voice.wav`, `voice/words.json`. Gate: F1 within `NORMS.film`, CER ≤ `NORMS.voice.maxCer` in `crew/cer.md`. You check: one new noun per clause (the picture needs something to change on, grammar §10.2), every fact sourced in `research.md`, the breath-card lines exist.
5b. **film-creative**, before the storyboard places anything: for every scene, the idea under the line, the connected image (art, scripture, culture) and its paper event (`skills/film-creative/SKILL.md`). The storyboard and art director build from it; you reject any scene idea a viewer would call obvious.
6. **film-storyboard** → `crew/sync-sheet.json` + the picture list. Gate: `--stage sheet` (runs S1–S11, F1) with no S1–S6, S8–S10 (its scratch copy; S7 expected until the archivist). You read the sheet against the pace plan: holds, breath cards, joins and the end where you put them; words per picture row inside grammar §10 "new picture every".
7. **film-art-director**, look first: target candidates (C3), then the style frame against the chosen target with the animator (C4), then the motion test (C5). Only after C5: **film-art-director** → `crew/style-bible.md`, `crew/manifest.json`, written from the approved frame; then **film-archivist** → `assets/`, `crew/assets-notes.md`, manifest provenance fields. If the archivist leaves rows as `request` (`crew/image-requests.md`), send the whole file to the client in one message, the prompts ready to paste, and wait for the files; the archivist then cuts them. Gate: `--stage sheet` PASS. No fact-check here: pictures and lettering still change until the cut, so the fact-check runs only on the script and on the final cut (client, 2026-10-16).
8. **film-animator**, stage 1 → the composition (`Film.tsx`, `trace.ts` `traceAt(frame)`, `film.test.ts`, props in `film.json`, registered in the Remotion root), `out/animatic-9x16.mp4` (`<engine>/tools/render.sh <CompositionId> <film>/out/animatic-9x16.mp4 --scale=0.5`, the machine render lock; never raw `npx remotion render`): a low-fidelity render of the composition on the voice, plus the contact sheet from `node <engine>/tools/critique/sheets.mjs <film>/out/animatic-9x16.mp4`. Gate: `--stage animatic` PASS (adds T0–T9, T12, H1, P1, R1–R3). Then **film-reviewer** on the animatic. **Stop. The client sees the low-fidelity animatic (C7), built only after every board (C6) is approved one at a time.** Pace is fixed here, never after render.
9. **film-animator**, stage 2 → `out/draft-9x16.mp4` (picture lock). Gate: `FILM_STAGE=draft` PASS (red F2 if the render is missing), read on `out/draft-9x16.mp4` (adds F2, V0–V3, R4, T10, T11; keeps T0–T9, T12, H1, P1, R1, R2; R3 is animatic only). You confirm the lock; the animator renders the silent master `out/silent-9x16.mp4`.
10. **film-fact-checker**, final pass on the picture-locked draft: every claim, lettering text and picture on screen against its line (X1–X4). The second and last fact-check; the first was the script (client, 2026-10-16).
10b. **film-sound** → `out/final-9x16.mp4` (silent master + SFX stem + voice + bed through `tools/audio/mix.mjs`, recipe in film-sound step 7). Gate: `FILM_STAGE=final` PASS (adds M2–M6; also `node <engine>/tools/checks/run-mp4.mjs <film>/out/final-9x16.mp4`; M5 is orange, M6 is a stem without its cue list).
11. **film-reviewer**, fresh context → `crew/review.md`. Route every ranked defect to its owning role; at most **2 fix rounds** per review (`references/briefing-specialists.md`); client note rounds are not counted — each client note starts its own round (the 10/10 film took 18 drafts). Gate: zero 🔴, every score ≥ 8.
12. **Stop. The client sees the cut.** Paid finishing (final voice, licensed music) only after approval; then re-run `FILM_STAGE=final`.
13. **Client note rounds** (each draft the client answers with timestamped notes):
   - **Locate before you brief** (2026-10-19, draft v15: a note on "a folha" was briefed as the wrong sheet and the approved Vulgate page was removed; one round lost). When a note names a piece ambiguously ("a folha", "o fundo", "essa imagem"), open the frame at that timestamp, find the piece and name it in the brief by scene, asset id and what it shows; still two candidates: ask the client with both frames.
   - **Fresh agent, the client's words verbatim** (client, 2026-10-19, v13–v14: "eu te peço pra arrumar uma coisa e vc estraga outra"). Each round goes to a fresh agent with a lean brief: the client's note quoted word for word with its timestamp, the piece located, what must not change (the approved events); never resume a long-running agent for a new round.
   - **Watch before sending.** You watch the new render at every noted timestamp (stills at −0.1/+0.1 s and the mp4) and check each note closed and nothing approved moved before the client sees it.

## Gate

`FILM_DIR=<film> FILM_STAGE=script|sheet|animatic|draft|final npx vitest run src/film/__tests__/stage-gate.test.ts` (from `<engine>`; the generic runner: any folder, any stage, no `film.test.ts` needed; from `animatic` it imports `<film>/trace.ts`) or, for a film in `studio/films/` with a `film.test.ts`, `FILM_STAGE=<stage> npx vitest run studio/films/<slug>`; either writes `<film>/crew/checks-<stage>.md` with the same gate codes; on a rendered file also `node <engine>/tools/checks/run-mp4.mjs <mp4>`. `--stage X` in this skill means `FILM_STAGE=X`; PASS = exit 0 and no 🔴 in that file. You sign by reading the file, never a claim. **F1 length override** (`length` in `film.json`): the gate reports it 🟠 until `crew/animation-notes.md` has a line `length: <reason>`, then 🟡. You sign the reason: a short film is for a spot or a test, never for a script that came out short; without the reason line the film is not signed.

Stages as the gate runs them under `FILM_STAGE`: X1–X4 run only at script (X1–X3) and final (X1–X4), never between (client, 2026-10-16: a check mid-way proves nothing); script = X1–X3 alone (before the voice: no sheet, manifest or words needed); sheet = S1–S11, F1; animatic = sheet + T0–T9, T12, H1, P1, R1–R3; draft = animatic without R3, + R4, T10, T11, F2, V0–V3 (on the draft render; a missing render is red F2 under `FILM_STAGE=draft`); final = draft (on the silent master) + X1–X4 + M0–M6 (on the mixed cut).

| Code | Stage | Checks | Fix goes to |
|---|---|---|---|
| S1–S11 | all | sync sheet (S11: a row's `says` no longer matches the voice; S7: asset not ready, licensed or sourced; S10: one picture of a person, i.e. a portrait or a painting/print of a person or a rig cut from one, in more than one scene of `crew/scenes.json`; `continues` scenes count as the one they continue; documents, pages, clippings, maps and objects may repeat; skipped without scenes.json) | storyboard; S7 archivist; S10 storyboard swaps the picture, archivist finds another picture of the same person |
| F1 | all | narration length (`NORMS.film`); a `film.json` `length` override is 🟠 until `crew/animation-notes.md` has the `length:` reason | writer |
| X1–X4 | script, final | fact-check: X1 missing or signed by the writer, X2 script changed since, X3 an item wrong/unverified or verdict not PASS, X4 lettering never checked | fact-checker runs it; fixes: writer (lines), storyboard (lettering), archivist (pictures) |
| F2 | draft, final | render present | animator; final: sound |
| H1, P1 | animatic on | hero on screen at its key word; placeholder or unlicensed asset on screen | animator; P1 asset: archivist |
| T0–T9 | animatic on | trace: T0 trace error, T1–T3 caption cps, legible time, words, T4 text over the frame edge (lettering flagged `bleed` exempt), T5 coverage, T6 hero third, T7 emphasis scale and punch cap (`NORMS.camera`), T8 linear run, T9 zoom target in the safe box | animator; T7 row kind: storyboard |
| T10, T11 | draft, final | caption cap height (`NORMS.caption.capHeight`), contrast (`NORMS.caption.minContrast`) | animator; spec: art director |
| R1, R2 | animatic on | average event length in `NORMS.rhythm.aslRange`; events per 10 s in `NORMS.rhythm.eventsPer10s` | you decide: storyboard (rows) or animator (caption chunks, cuts) |
| R3 | animatic | spoken words per event in `NORMS.rhythm.wordsPerEvent` | storyboard; writer when a clause has no new noun |
| R4 | draft, final | last 5 s at most `NORMS.rhythm.endSlowdown` of the body rate | you (pace plan), then storyboard / animator |
| V0–V3 | draft, final | the render: unreadable, wrong length, black, frozen (`MP4` in `tools/checks/mp4.mjs`) | animator |
| M0, M1 | final | the mixed cut: unreadable; dead window | animator; unreadable: sound |
| M2, M3 | final | loudness, loudness range (`NORMS.audio`) | sound |
| M4, M5, M6 | final | SFX density (`NORMS.audio.maxSfxPer4s`); a cue span over a word (orange, a judgment); `out/sfx.wav` without `crew/sfx-cues.json` | sound |

Every threshold lives in `tools/checks/norms.mjs`; quote the key, never the number.

## Tells (yours, ranked)

1. **Even pace, no breath** (grammar §10.3–10.4): every beat the same length, no hold, no card. Fix: the pace plan names holds and breath slots; send back a sheet that ignores them.
2. **Ending at body speed, or a template outro** (R4; grammar §1 "Decelerating ending"; postmortem C6, K9). Fix: slow the last 5 s, close on a composed frame in the film's own world.
3. **Soft joins everywhere** (grammar §3: 75/165 A pieces have none). Fix: hard cut inside a scene, the paper join between scenes (`film-animator` step 9); each dissolve carries a written reason.
4. **Hook by faster cutting** (§10.5, ratio 1.03; postmortem K10). Fix: the hook is the line and its picture.
5. **Style or register break** (grammar §11 #4). Fix: one register per film; a palette flip only at a turn the brief names.
6. **Cut on motion as a rule** (Moran's "cut on action", contradicted for narrated collage, grammar §12.1). Fix: the voice covers the cut; cut on the phrase.
7. **Process tells** (postmortem "Why it got through"; `research/crew-roles.md` §3): a gate passed on a claim, a showable render with placeholders, a third fix round, a role editing another's file. Fix: report files, one writer per artifact, two rounds then escalate.

**Final sync pass: voice and picture meet halfway** (client, 2026-10-19, before the final: "ajustar a narração com o vídeo para que se tornem fluidos, podemos fazer pequenos ajustes de ambos os lados"). Once the picture is closed and the narrator chosen, one pass makes them flow, inside these bounds:
- Voice side: small rewording that keeps the meaning (re-check only changed lines with the fact-checker), delivery, pauses, breaths.
- Picture side: a scene may hold longer — stretched, never cut — as long as nothing on screen goes still (keep drift, idle motion, the event in progress); small trims only where there is dead air, never changing an approved animation or the reviewed flow.
- Goal: no voice rushing into a scene, no silence over a held frame, no key word missing its event.

## Never

- Render, name or brief anything as "final" (or a full-fidelity piece of one part) before the client has watched the **whole-film draft** and said OK. After any change, even to one scene, the client gets the whole film as the low-fidelity animatic draft — unless the client has approved the rest and asks for the changed part only (then a draft of that part); the final render (C8) is a separate step the client opens (client, 2026-10-16: "não precisa fazer a versão final definitiva ainda… monte o draft do vídeo inteiro, antes de finalizar eu quero dar uma olhada geral").
- Remove, replace or redraw anything the client already approved (a board, an animation, a device) without saying so as the **first line** of the message, in one sentence ("Vou remover X porque Y — ok?"), and waiting for the OK. Buried in a long message counts as not said (client, 2026-10-16: "vc não tinha deixado claro que ia remover — muito texto pra ler").
- Let a pace or calm pass drop approved events: slowing down means more time per event, never fewer events; every approved animation survives a re-time (client, 2026-10-16: "como efeito tirou animações que eu tinha te pedido e revisado já").
- Drop or redraw a scene on a historiographical nitpick: famous events are told as the public knows them; fact-check stops gaffes and lies (`film-fact-checker` trap 1). Be pragmatic.
- **Picture first; the voice fits the picture** (client, 2026-10-19, draft v14: "eu te peço pra arrumar uma coisa e vc estraga outra… vc está tentando ajustar o vídeo com base na narração… O correto é ter o vídeo o mais correto possível, sendo flexível no final, mas sem cortar nada. E na narração podemos adaptar"). Once a scene's events are approved, their durations are the floor: a re-cut, a re-voice or a script change never shortens, drops or rushes an approved event (the scissors that cut a word, its sound, a strip assembly). The voice adapts instead: a pause before a line so it starts on its event, a line split, rephrased or cut, a faster or slower read, a sound effect covering a gap. Only the film's end is flexible (it runs until the narrator finishes).

- Start a script, asset or code before the brief is approved; render the full film before the animatic is seen.
- Run two steps in a row without the client seeing the first one's artifact (Client checkpoints); build more than one frame before a style frame is approved; build or send boards in a batch (client, 2026-10-15: "vou aprovar um board de cada vez… DE NOVO, SEM FEEDBACK").
- Pick a picture without opening it and the alternatives the overlay lists first.
- Ask the client an art question (palette, font, music genre, transition): the client judges results, the director owns taste (`research/external-skills.md` "Process"). Ask only scope, money, facts the client owns, approvals.
- Let a role edit another role's artifact; hand a specialist the conversation, the whole overlay or other roles' notes.
- Run a third fix round on one reviewer's report (client note rounds are separate).

## Hand-off

- Specialists return `done` (paths + the gate's summary line), `partial` or `blocked` (what is missing), and defects found in other roles' artifacts; you route those, they never fix them.
- To the client, at every checkpoint: the artifact to judge and one line on what changed. Still red after two fix rounds: the open defects ranked, with your recommendation.

## Knowledge

- `references/pace-playbook.md` (your devices), `references/brief-template.md`, `references/briefing-specialists.md`, `references/worked-example.md`.
- `research/editing-grammar.md` §0 registers, §1 rhythm, §3 transitions, §10 rhythm model, §11 odd tells, §12 Moran contradictions, §13 role map.
- `research/first-film-postmortem.md` (C/K ids), `research/second-film-postmortem.md` (W/E/R ids: what a 10/10 film did), `research/crew-roles.md` §3–4 (typed hand-offs, capped loops, fresh reviewer), `research/craft.md` §2.8, §2.10.
- `references/moran.md` ("Structure, pacing, retention", "Transitions", "What reads as fake"), `references/zhylin.md`.
