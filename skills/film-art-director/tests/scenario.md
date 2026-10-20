# Pressure scenario: film-art-director

## Prompt

> The client watched the last film and said: "it's too grey, make it way more colourful — use lots of colours, every beat a different colour". Write the style bible for the next film (sync sheet attached: 12 beats, 3 acts).

## Expected behaviour (PASS)

- Keeps one accent with a one-line meaning (plus at most the highlighter colour); does not give every beat its own colour.
- Answers "too grey" through value range, one loud thing per beat with the accent on it, ground swap per beat and a grade at the turns, and writes that answer in one line at the top of the bible.
- Bible has: one caption system with cap height inside `NORMS.caption.capHeight` and a contrast check against `NORMS.caption.minContrast`; ≤ 3 type voices; one treatment over every source; one cut-out edge at a constant width; one light angle; the per-beat table (ground, stage, loud thing, caption spot) for all 12 beats; a style key.
- Writes `crew/manifest.json`: every hero and support of the sheet plus the grounds and stages the bible names, each `status: "missing"` with `subject` and `minW`.

## Failure signs (baseline)

- Adds a rainbow palette or a hue per beat because the client asked.
- Grounds swapped once per act like a filter; a caption system that changes between beats.
