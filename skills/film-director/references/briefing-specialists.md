# Briefing a specialist

Each role runs as a fresh subagent that loads its own `film-<role>` skill. Fresh context is the
point: the specialist sees only its inputs, so it cannot inherit another role's mistakes or the
conversation's drift. Typed hand-off artifacts, one owner per field and capped fix loops are what
make multi-agent pipelines work; more personas do not (`research/crew-roles.md` §3–4).

## The brief (every specialist, every time)

```text
Load the skill film-<role> and follow it.
Engine: <absolute engine dir> (every `<engine>/…` in your skill; `tools/` holds checks, render, audio, critique)
Film: <absolute film dir> (every `<film>/…`; crew/, voice/, assets/, out/ are under it)
Inputs: <exact paths this role reads — nothing else>
Overlay part: <the lines of the project overlay this role needs, pasted or by path + section>
Pace plan rows: <only the rows this role executes, e.g. storyboard: holds, breath cards, joins, ending>
Deliver: <exact output paths>
Gate: <exact command, e.g. `FILM_STAGE=sheet npx vitest run <film>`> — done means exit 0 and no 🔴 in crew/checks-<stage>.md
Stop rule: return when the gate is green, or when blocked; never edit another role's artifact —
send the defect back instead.
Return: done | partial | blocked; artifact paths; the gate's summary line; defects found in
other roles' artifacts (path, what, why).
```

## Self-check loop (every picture-producing specialist)

Add this to the brief of film-art-director (style frame, motion test), film-animator, and any role
that renders a picture. The specialist returns only after it has looked at its own output:

1. Render: `<engine>/tools/render.sh <CompositionId> <film>/out/<name>.mp4 [--scale=0.5]` (the machine render lock; never raw `npx remotion render` with parallel agents).
2. Contact sheet: `node <engine>/tools/critique/sheets.mjs <film>/out/<name>.mp4`.
3. Look at the sheet as an image (Read the png), not at the code.
4. Fix against the layout rules: everything inside the frame; the hero fills ~70% of it; one hero per moment; an event every 2-3 s; hero type at least 0.05 of the frame's cap height.
5. Repeat 1-4 until the sheet passes, and only then return (done, with the sheet path in the hand-off).

## Inputs and outputs per role

Kept equal to each role's `SKILL.md` "You receive" / "You deliver". When a role's skill changes its
contract, change this row in the same commit.

| Role | Reads | Writes | Gate it runs |
|---|---|---|---|
| film-writer | `crew/brief.md`; overlay: voice tool and narration format, voice policy (draft vs final), research sources, audience, legal and sensitivity rules; client facts as claims to check | `crew/research.md`, `crew/script.md`, `narration.json`, `voice/voice.wav`, `voice/words.json`, `crew/cer.md` | `skills/film-writer/scripts/take-metrics.mjs` (F1 within `NORMS.film`), CER ≤ `NORMS.voice.maxCer` |
| film-storyboard | `crew/brief.md` (with the pace plan), `crew/script.md`, `voice/words.json`; picture collection index if the overlay has one (read-only) | `crew/sync-sheet.json` (rows: `t`, `says`, `key`, `hero`, `support`, `lettering`, `zoom {target, kind}`, optional `device`, `join`); picture list + through-line id in the hand-off message | `FILM_STAGE=sheet` on a scratch copy: no S1–S6, S8–S10 |
| film-art-director | `crew/brief.md` (register), the approved `crew/sync-sheet.json` + picture list, `voice/words.json`; overlay: palette, type, texture; client visual notes quoted verbatim | `crew/style-bible.md`, `crew/manifest.json` (`id`, `kind`, `beats`, `subject`, `treatment`, `minW`, `status: "missing"`, empty `source`/`licence`) | `FILM_STAGE=sheet`: S2 zero, every `support` id has a row; later T5, T6, T10, T11, P1 hold the film to the bible |
| film-archivist | `crew/manifest.json` (`id`, `kind`, `beats`, `subject`, `treatment`, `minW`), `crew/style-bible.md` (treatment, edge, light and shadow tokens), `crew/sync-sheet.json` (read-only); overlay: collection or kit to search first, rights rules | `assets/<id>.png`, `assets/sources/<id>.<ext>`, `crew/assets-notes.md`; manifest fields `status`, `licence`, `source`, `author`, `date`, `credit`, `file`, `w`, `h`, `cut`, `depth`, `shadow` | `FILM_STAGE=sheet` fully PASS (S7) |
| film-animator | `crew/sync-sheet.json` (incl. `device`, `join`), `crew/style-bible.md`, `crew/manifest.json`, `assets/` (all `ready`), the brief and its pace plan, `voice/voice.wav`, `voice/words.json`; overlay: house pieces | the film folder's `Film.tsx`, `trace.ts` (`traceAt(frame)`, pure, same constants as `Film.tsx`; carries the camera `shot`), `film.test.ts`, `film.json` props, the cue list (`Cue[]` JSON, `src/audio/cues.ts`), `out/animatic-9x16.mp4` + contact sheet, `out/draft-9x16.mp4`, `out/silent-9x16.mp4` (after the lock), `crew/animation-ledger.md`, `crew/animation-notes.md`; the gate writes `crew/checks-animatic.md`, `crew/checks-draft.md` | `FILM_STAGE=animatic`, then `FILM_STAGE=draft` (`npx vitest run <film>`) |
| film-sound | `out/silent-9x16.mp4`, the composition's cue list (`Cue[]` JSON), `voice/voice.wav`, `voice/words.json` (optional `out/voices.auto.json`), `crew/sync-sheet.json` (`t`, `device`, `join`, `zoom.kind`), `crew/brief.md` (pace plan); overlay: voice policy, music licence rules, sonic logo | `crew/sfx-cues.json`, `out/sfx.wav` (rendered from exactly that list), `assets/music/music.wav` + `music.meta.json`, `out/final-9x16.mp4`, `crew/sound.md` (music source and licence; a line per orange M3/M5) | `FILM_STAGE=final`: no red; every M3/M5 orange explained in `crew/sound.md` |
| film-reviewer | only: the render you name, `crew/sync-sheet.json`, `crew/checks-<stage>.md` (that stage and earlier), the limits section of `crew/style-bible.md` (accents, type voices, caption spec), the scene files for the entrance audit | `crew/review.md`, `crew/review-frames/`, `crew/review-round1.md` (round 2) | zero 🔴, every score ≥ 8 |

The reviewer never receives code beyond the scene files its entrance audit reads, nor the brief, the pace plan, other roles' notes or this
conversation: what the film "meant" is exactly what fresh eyes must not know.

## Fix rounds

1. The reviewer's ranked defects come to you. Each names a `t`, a frame, the norm broken and the owning role.
2. Rule on ownership with the gate table in `SKILL.md`. Rhythm codes (R1–R4) are yours to split: too few picture rows → storyboard; caption chunks too long or too short inside held pictures → animator; a clause with no new noun to show → writer.
3. Group by owning role; brief each role once with its defects (same brief shape: Inputs + its `crew/review.md` rows).
4. Re-run the gates from the earliest stage any fix touched, then a fresh reviewer.
5. Round 2 is the last. Still red → stop and take the open defects, ranked, with your recommendation, to the client.
6. Client notes on a draft are briefed the same way, with `SKILL.md` step 13 (locate the piece, the client's words verbatim, a fresh agent, you watch before sending).

## Order and parallelism

- Steps run in the flow's order. Read-only work may run in parallel (the archivist searching while the art director writes the bible, once the manifest exists); two roles never write the same file at the same time. The manifest is the one file two roles write, split by field and in turn: the art director writes ids and needs first, the archivist then fills only provenance and cut fields.
- Shared equipment (the voice engine, a paid API, the render) runs one job at a time.
