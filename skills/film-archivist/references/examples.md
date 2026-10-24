# Archivist's worked examples

Project-agnostic; archive names are generic kinds, not endorsements.

## §1 A period view: `harbour-1890-engraving`

Row: hero of the rows that say "the harbour was silting up", `subject` "the harbour the line names,
in its own decade, wharf and cranes legible", `treatment` "engraving, cut paper, torn edge",
`minW` 1512 (540 px on screen, a `punch-in` ×2.8 to the cranes).

1. Need line: that city's harbour, 1880s–1890s, cranes readable after the punch; the line names
   the place, so a generic harbour fails (postmortem C3).
2. Search: kit (none) → Openverse `harbour <city> engraving`, `license=cc0,pdm` (3 hits) → Commons
   category for the city's port → a national library's print collection (2 plates). Each object
   page checked for title, place, date, maker.
3. Candidates: (a) an 1891 wood engraving from an illustrated weekly, 3200 px scan, public domain;
   (b) a 1912 photograph, 900 px, cranes already replaced. (a) wins: right decade, and an engraving
   survives the bible's halftone and 12 fps stepping; (b) fails period and `minW`.
4. Resolution: the wharf spans 2140 px of the 3200 px scan ≥ 1512. The whole full-resolution
   original goes to the cut, never a thumbnail or a pre-cropped copy. An oven clipping is at most
   1600 px on its long side, so 1512 fits; a `minW` over 1600 could not take the torn edge.
5. Cut: `swift tools/kit/reference/cutout.swift <film>/assets/sources/harbour-1890-engraving.png
   <film>/assets/harbour-1890-engraving.png --mode paper` (ink kept, paper keyed, the scan's size
   kept); then the torn edge through a kit entry `cut: "regions"` on that PNG, one polygon around the
   wharf, `oven { seed: 41, rim: 9, depth: 11, paper: [244, 239, 228] }`: `regions.mjs` crops the
   wharf at full resolution, then fits it to 1600 px; the bible's 3 px screen rim × (1600 file px /
   540 screen px) ≈ 9 px.
6. Look: at phone width with the bible's dot: cranes and masts read; edge irregular; no halo.
7. Row filled (templates §1), `status: "ready"`; trail in `assets-notes.md`. Gate:
   `FILM_STAGE=sheet npx vitest run <film>` no S7 for this row.

## §2 A document as proof: "the dig cost twice the estimate"

The row's `device` is a one-prop proof on the desk stage; the line states a sum a page can settle.

1. Need: a page of the period that states the overrun: a newspaper report or the company's annual
   report, in the original language.
2. Search: a national newspaper archive's public-domain years → a digitised annual report on the
   Internet Archive. Chosen: the 1891 gazette page (public domain by age; the archive page says so).
   Rejected: a modern book's summary table (copyrighted, and a retelling, not the proof).
3. Rows: `gazette-1891-p3` (the whole page, support for the wide) and `gazette-1891-p3-clause` (the
   sentence with the two sums, for the push and the highlighter). The clause is cut as a region
   (templates §3) after cropping the page to its column; `--mode paper` was rejected because the
   newsprint's grey tone keyed out unevenly around the type.
4. Legibility: at the push's end scale the clause's x-height on screen is ~70 px, above the
   caption's cap height, so it reads without a caption repeating it.
5. Never retype the clause or rebuild the page in type (`moran/DbJSUGZpvzL`); if no page states it,
   the row stays `missing` and the Director asks the writer whether the line needs another proof.
