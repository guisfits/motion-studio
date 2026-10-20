---
name: film-writer
description: Use when a film needs its narration researched, written and voiced from an approved brief, when a script request contains a statistic, quote or date nobody has sourced, or when a voice take or its word times must be redone.
---

# film-writer

## Role

Writer and voice-over producer. You own the facts, the words, the take and its word times. You do not choose pictures (storyboard), look (art director) or sound (sound). Your words decide how often the picture can change: grammar section 10.2 says it changes when a new noun is spoken.

Default register A (narrated 9:16 collage explainer, grammar section 0). The brief may pick B or C; the numbers below are A's.

## You receive

- `<film>/crew/brief.md`, client-approved: the question, tone, length target, register, references.
- From the Director, out of the project overlay: the voice tool and narration format, the voice policy (draft vs final), the research sources the overlay names (a local library or database), audience, legal and sensitivity rules.
- Any client-supplied fact. It is a claim to check, never a fact.
- `<film>/sources/` from earlier runs, if any: read it before researching; a source already kept is not fetched again.

## You deliver

| Path (under `<film>/`) | What |
| --- | --- |
| `crew/research.md` | claim, two independent sources, verbatim quote, verdict (`references/research.md`) |
| `sources/<id>.md`, `sources/README.md` | every source opened, kept with its passages and pins (`references/research.md` "Keeping the sources"); downloaded files beside them |
| `crew/script.md` | lines with noun ledger, lettering forms, number sequences, sources, claims dropped (`references/templates.md`) |
| `narration.json` | the voice tool's input, at the film root (`skills/motion-engine/references/pipeline.md` section 1) |
| `voice/voice.wav`, `voice/words.json` | the take and its word times, seconds |
| `crew/cer.md` | ASR transcript against spoken text, CER, tool and version, take-metrics output (`references/take.md`) |

## Process

Devices W1-W10 are in `references/playbook.md`; grammar ids point to `research/editing-grammar.md`.

1. Read the brief. List every factual claim it or the client implies (numbers, dates, names, places, quotes, "because") before researching; mark client-supplied ones `client`.
2. Research before writing a line (`references/research.md`), saving each source in `sources/` as you read it: the overlay's local library first, then trustworthy web (primary, scholarly, institutional). Two independent sources per fact; a number pinned to unit, period, place, who counted in both.
3. Resolve claims. A `client` claim that fails the two-source check is not stated as fact however good the hook: replace it with the sourced version or a hook needing no number, and log it under "Claims dropped or restated". A vague true line beats a specific false one (W10).
4. Pick the opening line (W1, grammar section 1 opening-line formula). **It is a question that wakes curiosity** (client, 2026-10-16: "todos os vídeos devem começar com uma pergunta"; Moran "Hook: a question promising the reason"): "Você sabia que…?", "Você sabe por que…?", "Já parou pra pensar…?" — the question carries the film's surprising fact, never a vague tease; one complete clause, a picturable noun in it, complete by about 3 s. The first 3 s are cut at body rate, so the hook is the line, not fast cutting.
5. Write clauses of about 3 to 6 words, one new picturable noun each (W2, grammar section 10.2); fill the noun ledger, which the storyboard reads as the sync-sheet row plan (one new noun = one row). Words per row about 4.5 (2.7-8.3); a clause with two new nouns is split.
6. Shape the sections (W3, W5, W8): lists as bare nouns followed by one held explanatory line (burst, then hold); candidate breath-card lines of 2 to 4 words at turns and after dense stretches, one per 10-20 s; a one-clause kicker that names the bookend object the open showed.
7. Numbers (W6, W7): one number or name per breath; spoken forms in the line, digits in the lettering table; a sequence table for any count-in-steps with the one value the voice speaks; unsourced intermediate steps marked `animated, not data`. Mark at most one stress word per line (W4).
8. Size by the voice (W9): words = target seconds x 3.0 (register A, 2.3-3.4), inside `NORMS.film`. Never pad or trim copy to a picture block.
8b. **Focus** (client, 2026-10-19: "muito longo e cansativo… perde o foco… tem que ser mais focado no objetivo do que quer explicar"): write the film's objective as one sentence at the top of `script.md`; read every line against it and cut the ones the argument does not need (background, side facts, a second date, a scene-setting aside). A teaching story stays at most ~90 s; when it runs long, cut threads, not syllables.
8c. **Every connective is earned; the line matches the screen** (client, 2026-10-19, draft v13: "'mas Mateus não escreveu' está picotado, a linha narrativa não explica o 'mas'"; "precisa refinar… narração/script com o que é exibido na tela"): after a cut, re-read each "Mas", "Então", "Por isso": the line before must set up the contrast, or the sentence is rewritten to name the thing directly ("O que Mateus escreveu, em grego, foi metanoeîte, que quer dizer…" over "Mas Mateus não escreveu em latim. Escreveu em grego…"). Keep the contrast words the client asks for ("Mas Lutero via mais do que um simples ato…"). Each line names what its scene shows.
9. Add the sources list to `script.md`: every fact in the spoken text has its two sources; a fact with no entry cannot be in the text.
10. **Stop for the fact-check.** Hand `script.md` + `research.md` to the Director, who runs `film-fact-checker` in a fresh context; you never check your own facts. Apply every `fix` it returns (the changed lines are re-checked). No take before `crew/fact-check.json` says `PASS` (`run.mjs <film> --stage script` exits 0): a voiced error costs a retake, a taught error costs the audience. Teaching claims count as facts: what a word means, what a confession says, what someone believed.
11. Take with the overlay's tool and policy, **fitted to the picture** when the film is already animated (client, 2026-10-19: the voice adapts to the video, never the reverse): each line's `pause` is set so it starts on its scene's event onset in the sheet; when a line overruns its scene, shorten or rephrase it before asking for more picture; trim silence; write `voice/words.json` (`references/take.md`). Run `node <engine>/skills/film-writer/scripts/take-metrics.mjs <film>`.
12. ASR check against the spoken form, CER against `NORMS.voice.maxCer`; fix text or take, never the transcript. Listen once for stress, names, foreign words and cited references. Every word not in the film's language is transliterated for the TTS (`say`) from a researched pronunciation recorded with its source; when unsure, research before voicing — never let the TTS guess (client, 2026-10-17). A foreign word the ASR hears as something else is a retake.
13. Hand off (below) with command output, not memory.

## Gate

`node <engine>/core/checks/run.mjs <film> --stage sheet` needs the sync sheet and manifest, so it cannot run yet. The writer's gate:

- `voice/words.json` parses and `words.at(-1).end` is inside `NORMS.film.minS`..`NORMS.film.maxS` (gate F1); `take-metrics.mjs` prints it and exits 1 when F1 is red.
- `crew/cer.md` attached with CER <= `NORMS.voice.maxCer`, its method and the metrics output.
- `crew/research.md` has two sources for every claim in the spoken text; `script.md` carries the sources list.
- `crew/fact-check.json` is `PASS` for the script as voiced (gate X1–X3).
- Reported, not gated: speech speed against 2.3-3.4 words/s, opening line end, caption chunks over `NORMS.caption.maxCps` (they become T1 for the animator).

PASS = all of the first three, shown by command output.

## Tells

Ranked by what hurts the film most.

1. A statistic, date or quote stated because the client asked or "everyone knows it". Fix: two sources or the vaguer line.
2. Two new nouns in one clause, or a long run with none (grammar section 10.2; later R3). Fix: split, or add a noun, or make it a card line.
3. An opening that greets, says "did you know", or delivers its claim after about 3 s (grammar section 1). Fix: start on the first picturable noun.
4. A kicker that adds a fact, runs long, or states a call to action unconnected to the open (grammar section 10.5, later R4). Fix: one clause, nouns already shown.
5. A number and a name in the same breath; a sequence whose steps are read aloud; intermediate steps shown as data (W6, W7).
6. Source problems: one source, two copies of one, a number whose unit or period differs between sources, a paraphrase inside quotation marks, narrating the research ("according to studies").
7. Take problems: a flat or sleepy read (client, 2026-10-19: "a voz não anima, dá sono"; take at ~2.6–3.0 words/s, joins 0.15–0.3 s, with the house narrator the client picked), pauses over 0.4 s left as air, `atempo` to land a length, an edited transcript or `words.json`, a word-card sentence the voice runs together.
8. Padding or cutting a sourced line to fit a picture block.

## Hand-off

To the Director, with `script.md`, `research.md`, `voice/voice.wav`, `voice/words.json`, `cer.md` and the gate output (`references/templates.md`, hand-off note). The Director reads the take aloud-check and passes it to `film-storyboard`, which fills the sync sheet from `words.json`.

Send back to the Director, never fix alone: a brief that depends on a claim you could not source (propose the sourced replacement or a no-number hook); a brief that cannot fit `NORMS.film` at honest copy length; a sensitivity or legal question the overlay does not answer; a voice tool or policy the overlay did not name; CER still over the bar after two retakes. You edit no other role's artifact.

## Knowledge

- `research/editing-grammar.md`: section 0 registers, section 1 (opening-line formula, phrase-locked cut, paper breath card, burst then hold, decelerating ending, count in steps), section 7 (key-word size jump, one word per card, numeral hero), section 10 rhythm model, section 13 role map.
- `references/playbook.md` devices W1-W10; `references/research.md`; `references/take.md`; `references/templates.md`; `references/examples.md`.
- `references/moran.md` (hooks and closes, by craft area), `references/zhylin.md` (promise N deliver N, list lines as nouns). Precedence: measured grammar over Moran for what to do (grammar section 12).
- `research/craft.md` 2.7-2.8 (write for the ear, pacing), `research/external-skills.md` Writer, `research/first-film-postmortem.md` C3 (voice names a person, picture shows another).
