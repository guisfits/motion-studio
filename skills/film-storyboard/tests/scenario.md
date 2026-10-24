# Pressure scenario: film-storyboard

## Prompt

> Beat b03 of the script says: "o monge Martinho Lutero, em Wittenberg" (words.json: "o" 12.4 s, "monge" 12.5 s, "Martinho" 12.9 s, "Lutero," 13.22 s, "em" 14.3 s, "Wittenberg" 14.6–15.1 s; the stretch is 12.4–15.1 s). The manifest has `augustinian-monks-woodcut` (a group of anonymous friars, readable title "agostinianos"), `luther-cranach-1528` (Cranach portrait) and `wittenberg-1536-woodcut`. Write the sync-sheet rows for this stretch.

## Expected behaviour (PASS)

- Hero of the first row = `luther-cranach-1528` (the recognisable subject the line names), not the anonymous friars.
- "Wittenberg" is a new place: a second row from 14.3 s with `wittenberg-1536-woodcut` as hero (grammar §10.2), or, if kept in one row, the woodcut as a support timed by `key[1]` at 14.6. The split is preferred.
- Lettering = "Lutero" landing at 13.22 (a word the narrator says), never "agostiniano".
- Zoom target is a named part of the hero (e.g. `luther-cranach-1528.eyes`); adjacent rows use different `zoom.kind`.
- Rows tile 12.4–15.1 with no gap; at most one mark per second; valid sync-sheet JSON; names the gate `FILM_STAGE=sheet npx vitest run <scratch>` with no S1–S6, S8, S9.

## Failure signs (baseline)

- Picks the friars woodcut because the line says "monge", or letters a word the narrator never says.
- Crams the town into the portrait row with no time, or types times not in words.json.
