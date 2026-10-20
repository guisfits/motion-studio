---
name: explainer-script
description: Use when a narrated explainer, Reel, Short or TikTok is being planned and before any shot, scene or render; when someone names a subject for a video ("make a video about…", "write the narration"); or when a film's narration must be written, revised, re-timed or judged.
---

# Explainer script

People do not watch to watch; they stay to **learn one thing**. The script is a short argument
told by a narrator: one question, evidence, one insight. The picture is built on it afterwards
(`vox-style-animation`, `motion-graphics`), so no film starts without an approved script.

**Project overlay.** Audience, register, voice, the CTA wording and any bridge line from the
topic to a product belong to the project's overlay skill; it overrides this skill where it says so.
This skill writes no product lines.

## Before writing: three answers, one line each

1. **Question**: what does the viewer want to know (or not know they want to know)?
2. **Insight**: the one sentence they will repeat after one watch.
3. **Evidence**: the key document, number, map or object that proves it (the "Rosetta stone").

If any is vague, narrow the subject. Research until new sources repeat what you have.

## Shape

| Beat | ≈ 50 s film | Does |
|---|---|---|
| Hook | 0–4.5 s | one complete sentence, said whole: a fact, a number, a "what if", a paradox or "look at this"; voice at 0.0 s over the subject |
| Context | to ~25 % | who, when, how much: only what the middle needs |
| Development | to ~45 % | 2–3 points, one idea each, each with its proof on screen |
| Turn | 40–60 % | one explicit pivot: "But…", "Why?", "Here's the strange part" |
| Payoff | to ~85 % | answers the opening question, or reframes it |
| Close | ~2.5 s | a calm verdict or question, alone |
| CTA | last ≤ 4.5 s | one spoken line, ≤ 11 words, the last line of the film |

## Numbers

| Quantity | Norm |
|---|---|
| Length | Reels 45–60 s, 90 max; never under ~27 s if it argues anything |
| Rate | ≈ 2.3 words/s in pt-BR at a calm, clear pace; ≈ 2.5–2.7 in English (range 2.2–3.0) |
| Words | 50 s ≈ 115 (pt-BR) / 125–135 (EN); leave breath, do not fill to the ceiling |
| Beat | one sentence of 2.5–4.5 s + one visual idea |
| Line | ≤ ~15 words, one idea; read aloud before keeping |

## Writing rules

- Spoken, not written: short sentences, plain words, no lists, no parentheses, no abbreviations
  the voice must guess. "Look at this." and "That's right." are absorption pauses, not filler.
- Clean slate: assume the viewer knows nothing you did not know a week ago; never assume they
  are slow. Define, then go deep.
- Every noun has an object on screen (three columns: **ears / eyes / sources**). A line with no
  object is cut or rewritten.
- One number or name per beat. One memorable moment per film.
- Every fact, date, number and quote is checked and noted with its source. If unsure, say less.

## Output

1. `script.md`: the three answers; the beats table (t, line, idea, object on screen, source); the
   sentence to remember.
2. `narration.json` (the engine's voice contract):

```json
{ "voice": "narrator-key", "start": 0.05, "gap": 0.3,
  "lines": [
    { "id": "hook", "text": "In 1930, almost nobody came.", "keys": ["1930"], "marks": { "nobody": "underline" } },
    { "id": "turn", "text": "But that was the point.", "pause": 0.6 },
    { "id": "cta", "text": "Follow for the next one.", "pause": 0.4 } ] }
```

`keys` = the words that become the giant hero word (one per idea); `marks` = `circle`,
`underline`, `highlight` or `strike`, at most one per line; `pause` (0.4–0.8 s) before each new
beat; `start` ≈ 0.05 so the first word lands on frame 0.

3. A free draft voice timed into `voice/words.json`; its length is the film's length. Show the
script before any picture; pay for a final voice only after the film is approved.

Hook types, beat-sheet template and checks: `references/structure.md`.
