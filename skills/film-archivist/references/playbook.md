# Archivist's device playbook

Every device the archivist owns (grammar §13: document as proof, halftone or engraving sources,
footage and stills that survive a 12 fps step and a halftone, plates for mosaics and crowds) plus
the cut-out finish the art director specifies and you bake. Format: **when** → **how in this
engine** → **measured range** (grammar ids; `~` = inference) → **tell and fix**. Screen px are at
1080 × 1920.

Engine: `core/reference/cutout.swift` (Vision cut, macOS, local), `core/reference/regions.mjs`
(`cutRegions`: polygons → oven → one PNG per region), `core/reference/oven.mjs` (`tornAlpha`,
`fibreRim`, `bake`), `core/kit.mjs` (`fetch`, `build`, `sheet`, `list` over a kit `catalog.json`),
`core/reference/clip.mjs` (footage → frames), `core/reference/find.mjs` (`search` the open
collections → candidates + numbered sheet; `add` one to a kit catalog with provenance),
`core/reference/matte.py` (BiRefNet matte, local, for what Vision misses). Kit commands and Openverse search:
`skills/motion-engine/references/kit-and-cutouts.md`.

## §1 The right subject (postmortem C3)

**When:** every row. **How:** write the need from the sheet's line and the row's `subject`; search
the object's own names (original-language title, maker, century, catalogue term: engraving,
woodcut, plate, manuscript, broadside), in the subject's language and in English; verify the
person, place or edition on the object's catalogue page (title, sitter, place, date, maker). A
thumbnail or a file name is not verification. **Range:** two candidates compared when the archive
has them; the rejected one and why in `assets-notes.md`. **Period first:** a dated print or a
portrait by a known maker of the time beats a later likeness; a modern photo only for a modern
subject. When nothing survives from the exact year, the nearest period view with its true date, and
tell the Director so no lettering claims the earlier date. **Tell:** a generic figure tagged with a
role word (C3). **Fix:** `missing` with the trail; never a look-alike.

Search order (house rule; no measured source covers archive search, `research/external-skills.md`
gap 3): the overlay's collection or kit → `find.mjs search` (Openverse, Commons, AIC, Cleveland,
Met in one call; English catalogue terms + medium or period: "luther woodcut", "wittenberg
engraving 1550") → Openverse (`license=cc0,pdm`, then `by,by-sa`) → Wikimedia
Commons → museum open access → national libraries (historical maps: national map collections;
Moran starts maps at OpenStreetMap or the Library of Congress, `moran/DcTljpCgNNJ`) → Internet
Archive. Topic-matched background imagery (architecture, period paper) for grounds and plates
(`moran/DY7TSLJAQef`).

## §2 Document as proof (49 pieces, grammar §6)

**When:** the line states a fact a page can settle (a date, a sum, a quote, a ruling, a headline).
**How:** source the real page: a newspaper clipping, a decree, a letter, a book page, a captured
web page or post (`moran/DLQw7mqJzRp`: real captures, cropped tight on the line, then treated).
Deliver the whole sheet as one row and the key clause as its own row: a kit entry with
`cut: "regions"` and one polygon around the clause (`regions.mjs` names it `<id>-<regionId>.png`),
or `--mode paper` on the clause crop so ink sits on any ground. **Range:** clipping ~90 % of width
(`hex/DNfiewopHaL`); screenshots tilted ~3° with the highlight then zoomed (`hex/DVZHDehkr_K`); a
stack of three sheets zoomed to the clause (`hex/DYMUSnRiNbV`); the headline as the receipt
(`hex/Dc3B4rcCH18`). Legibility `~`: at the beat's widest zoom the clause's x-height on screen
should be no smaller than the caption's cap height (`NORMS.caption.capHeight` × 1920), so it can be
read without the caption repeating it. **Tell:** a typed-up mock "clipping" (`moran/DbJSUGZpvzL`: a
real scan beats a fake). **Fix:** the real scan; if the clause is too small, a sharper copy or a
tighter region, never retyped text.

## §3 Sources that survive the treatment and the camera

**Halftone or engraving sources** (halftone B&W cut-out, 57 pieces, grammar §9). **When:** the
bible's treatment is halftone or engraving (the common case). **How:** prefer engravings, woodcuts,
etchings and B&W photographs with strong value separation: a subject that reads as a silhouette
in two tones. The art director's `K.halftone` dot grows with darkness, so mid-grey sources turn to
mush (`~`). Check: render the cut once through the bible's dot on its ground and look at phone width.
**Range:** dot ~3 px at 360 w masks upscaling (`hex/DTnEO5KCawE`); engravings throughout
(`hex/Dd0qOzpqoYf`); halftone on licensed stills (`ee/DbAnBlpTkUQ`). Moran: a high-res texture hides
a low-res image (`moran/DQpMiV_Cdpr`): that covers a support, never a hero's face.

**Survive 12 fps stepping** (stepped motion, grammar §2: ≥ 25 % stepped shots in 91/165 register-A
pieces; used on archival stills, low-res footage, paper pieces). **How:** stills survive by
construction; footage must read in single frames: little motion blur, a subject that holds its
place, no fast pans, no burned-in subtitles or logos (`~`). Turn footage into frames with
`node <engine>/core/reference/clip.mjs <rec> <film>/assets/clip-<id> --fps 60 [--from s --to s]`. **Range:** archival
stills and low-res footage stepped "hides upscaling" (`hex/DQepYZ4CfSt`), "reads as archival film"
(`hex/DO5lBJLiTni`). **Tell:** odd tell #5, low-res or mismatched footage shown raw
(`ee/DTNgwGAjH7-`). **Fix:** a larger copy, or a clip that gets one beat under the bible's
treatment.

**Resolution against `minW`.** The source must span `minW` px across the subject (the art
director's on-screen width × the beat's largest zoom). Take the archive's original or full size,
never a thumbnail or a screenshot of a viewer. `regions.mjs` crops each region from the source at
full resolution and only then fits the clipping to 1600 px on its long side, so a small region of a
big scan keeps the scan's pixels: hand it the whole original. `cutout.swift` keeps the source's size. An
oven clipping is at most 1600 px on its long side, so a `minW` above 1600 cannot take the torn edge:
the die-cut rim keeps the source's size, or the Director lowers the zoom. Never upscale and call it
ready.

**Footage, frames and screens.** Footage on a paper mat and frame in frame (art director, grammar
§6) need licensed clips and era-right frames: pick the TV or device by era, transparent, isolated,
no people, no generated content (`moran/Dcm63HBAHzT`); handycam footage reads as its era
(`moran/DMDyGp6Jwwx`). **Tell:** odd tell #9, production leftovers (a stock watermark:
`hex/DWG_-c3grGL`). **Fix:** another source; never crop a watermark out.

## §4 The cut-out: matte, edge, shadow (grammar §9, odd tell #1)

**Matte.** `swift <engine>/core/reference/cutout.swift <in> <out.png> --mode subject|paper|instances
[--border px]`. `subject`: people, statues, buildings, objects. `paper`: engravings, woodcuts, maps,
printed pages (ink stays, paper goes transparent). `instances`: writes `{ regions: [{ id, poly }] }`
(u, v in 0..1) to paste into a `cut: "regions"` kit entry and hand-edit. Check the matte on a light
and a dark ground: a clipped hand, face, date or clause, or a halo of the old background, means
re-cut (other mode, `matte: "birefnet"` for hair and busy grounds, tighter crop first, or
hand-edited polygon). Isolate exactly; never redraw or
fill in (`research/external-skills.md` §Archivist).

**Edge (the bible's choice).** White die-cut rim: `--border px` (paper-coloured, constant width).
Torn edge with fibre: the oven, set per kit entry as `oven: { seed, rim, depth, paper: [r, g, b],
grain }` (defaults rim 7, depth 9 px; `paper` must be three numbers, a hex string is rejected).
Range from the evidence, at 1080 w: rim 3–8 px, constant (`pin/350080` (D), `ee/DafS1lPu18x`,
`ee/DSc0jeJjB9u`); torn fibre rim ~3 px (`pin/350019` (D)); rough scissor outline ~4 px
(`hex/DY4QF50i64w`). **Convert to file px:** file px = screen px × (file width / on-screen width).
A 1600 px file shown 540 px wide needs a 3 px screen rim baked as ~9 px. Seeds: fixed per row,
varied across rows, recorded in `cut`. **Tell:** mixed rim widths read as a pack from mixed sources
(`pin/350067` (D)); straight clean edges read pasted (`pin/350121` (D)); crisp edges read digital
(`moran/DUEIdzuCUgn`). **Fix:** one recipe for the film, re-baked.

**Shadow and depth.** The contact shadow is the animator's (`K.piece({ height })` draws it); you
record the bible's resting token in `shadow` and the plane in `depth` (`bg`, `mid`, `fg`). Separate
pieces for parts that must move apart (a figure and its object). Pick photos with three readable
planes when the bible plans parallax (`moran/DZsDDmvtNJP`). Never bake a shadow into the PNG.

**Treatment match.** A photo among prints gets the same treatment as its neighbours: tint, halftone
or grain set by the bible (craft §2.4; odd tell #1 fix `pin/350315`: tone photos into the palette).
You deliver the clean cut; the treatment is applied at render, so do not pre-grade unless the bible
says the source needs levels first (`moran/DQpMiV_Cdpr`: levels before tint).

## §5 Plates for crowds and mosaics

**Multiply one cut-out into a crowd** (grammar §4) and **grid or mosaic for "many"** (grammar §6) are
the storyboard's devices; you supply the plates. **How:** for a crowd, one clean subject with a
closed silhouette and no cropped limbs, cut once, so it repeats at uniform scale; for a mosaic, a
set of N tiles from one archive and one treatment, plus the one off-pattern tile the sheet names.
**Range:** 8 bottles → 80+ (`hex/DZw15OaCDZv`); prisoners 3 → 12 → 24 at uniform scale
(`hex/DeOZeaQCs6q`); 16 painting tiles for "900 paintings" (`hex/DbNcjZ2iwUc`); ~40 tiles and a push
into one (`hex/DV36JADibx8`). **Tell:** tiles from mixed sources and tones read as a stock grid
(odd tell #1 at scale). **Fix:** one source family; each tile is its own manifest row only when it
is shown alone, otherwise the set is one row with its tiles listed in `assets-notes.md`.

## §6 Licence and provenance (gate S7, P1)

Accept: public domain (PD, PD-old, PD-US, PDM), CC0, CC BY, CC BY-SA, read on the object's own page
(not an aggregator, not a CDN link). Reject: NC, ND, "editorial use only", "free to use" with no
named licence, watermarked stock, anything unclear. A living person's likeness or a modern brand is
the Director's call. Generated images: never, for anything a viewer could take as evidence
(`skills/motion-engine/references/kit-and-cutouts.md`). Record at download: `source` (the object's
page), `licence` as stated, `author` (the maker, not the uploader), `date` (the work's, not the
scan's), `credit` for CC BY/BY-SA. Spell the manifest key `licence`: the kit catalog and its
`pieces/manifest.json` use `license`, which S7 reads as blank if copied over.
