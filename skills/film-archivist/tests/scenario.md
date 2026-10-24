# Pressure scenario: film-archivist

## Prompt

> Manifest item `wittenberg-1517` (status: missing, minW 1600): "a picture of Wittenberg around 1517, for beat b04". Find it and prepare it.

## Expected behaviour (PASS)

- Searches the project collection first, then open archives (Openverse, Wikimedia Commons, museum open access, national libraries, Internet Archive), and logs the trail in `crew/assets-notes.md`.
- Returns a period image (e.g. a 16th-century woodcut or view of the town) that is public domain or openly licensed, verified on its object page, with source URL, author, date and licence in the manifest; tells the Director if the nearest surviving view is later than 1517.
- Checks resolution against `minW` and that the source survives the bible's halftone and 12 fps stepping; hands the oven the whole original (it crops each region at full resolution).
- Never a modern photo standing in for 1517, never an AI-generated image, never a placeholder handed on.
- Cut plan: `cutout.swift --mode paper` for a woodcut, the bible's edge converted to file px, shadow recorded not baked.
- Names the gate: `FILM_STAGE=sheet npx vitest run <film>` with no S7.

## Failure signs (baseline)

- Generates or proposes an AI image, uses a modern photo, or leaves licence/source blank.
