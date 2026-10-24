# Art director's device playbook

Every device the art director owns (grammar §13), as: **when** → **how in this engine** → **measured
range** (grammar ids; `~` = inference) → **tell and fix**. Ranges are register A unless tagged. They
are design ranges for the bible, not gates: the gates are the NORMS keys named in `SKILL.md`.

Remotion names: pieces are `<Img>` cut-outs carried by `SetDown` / `Torn` / `Tape` (`src/paper`);
grounds are full-frame `<Img>` paper scans in `<film>/assets/`; a desk surface is a ground under
`Camera` (`src/camera`); texture and print look are `Grain` / `printLook` (`src/texture`); type is
`RevealWords` / `Highlight` / `Ransom` / `Stroke` (`src/type`); the technique index is
`docs/techniques.md`. Tokens (`ground`, `ink`, `accent`, `accentWash`, `night`; families `serif`,
`display`, `script`) are named constants at the top of `Film.tsx`, fed from `film.json` props. The overlay supplies the
values; the bible names which token plays which role. Screen px are at 1080 × 1920.

## §0 Reading the sheet: what the line does picks the look

| The line… | Stage (§1) | Type device (§4) | Colour device (§3) |
|---|---|---|---|
| names one person, object or place | one hero on a quiet ground, or disc stage | name tag | accent only if it is the story object |
| gives a number | quiet ground or flat colour ground | numeral hero, small unit | accent on the numeral |
| proves a claim | desk stage with the document as proof | highlighter on the key phrase | tint wash on the clause |
| shows footage or a screen | footage on a paper mat, or frame in frame | caption rule follows the ground | one treatment over the clip |
| lists many | grid or mosaic (storyboard) on one ground | caption only | accent on the one that matters |
| turns the argument | ground swap, grade change | size jump on the turning word | grade carries the mood |

The sheet's optional `device` field names the storyboard device of a row (`breath-card`, `word-card`, `evidence-board`, `grid`, `crowd`, `container`, `scale-contrast`…): each needs a ground and stage in the bible (a breath card = visible paper ground + one line in the reading voice; an evidence board = desk stage with pins and string in the accent). Grammar §10.2: the picture changes on a new noun, place, person or number; only the caption changes
while the clause stays on the same subject. A new ground is a bigger change than a new picture: keep
it for a new idea or place (§2).

## §1 Stages and composition (grammar §6, §2)

**One hero on a quiet ground** (31 pieces). When: the line names one thing. How: the hero as
a `SetDown` piece on a paper ground (or a plain paper desk surface); nothing else at full weight. Range:
40–90 % of the frame empty; subject 15–35 % of the area (`pin/349959` (C)), figure 28 % of height
with 60 % empty (`hex/Dc-vZs9CkUT`), object 10 % with 85 % paper (`hex/DOvNKEtiREq`). Engine
constraint: T5 counts hero, support and piece **boxes** against `NORMS.frames.minCoverage`, ground
excluded; a lone hero under that share needs a stage piece (disc, mat, print border) or a larger
size. Tell: the hero small in the top half and empty ground below (postmortem C5). Fix: hero centre
in `NORMS.frames.heroThird`, empty space as a field around it, not a leftover band.

**Clear centre, clutter at the edges** (6 pieces, every stage). How: props pushed to the corners and
cropped by the frame; the centre holds the hero or the type line. Range: centre ~40 % clear in
stills (`pin/349974` (D)); the type line low over a darkened band, never over the busy area
(`ee/DRzcFdBjDPG`); props at the edges frame the headline (`ee/DZuVqDpO0Um`). Tell: odd tell #2
(no focal point). Fix: one dominant item, 10–20 % or more empty (`pin/350041` `~`), overlap one
element with the hero (`pin/349974`).

**Desk or tabletop stage + top-down desk camera** (58 + 33 pieces). When: objects, books, documents,
prices, a map; the topic has a working surface. How: a <wood|felt|mat|steel> surface image
seen from above as the ground, pieces on it with a `rot` on `SetDown`; `Camera` travels between named stations (keyframes of `cameraAt`).
Range: props ~45 % of width, tilted 5–10° (`hex/DbnDiSLCtax`); covers ~40 % width with a soft
shadow (`hex/Dbxj93xiCqg`); the surface material matches the topic: a steel tray for medicine
(`hex/DdvgHQcIWYy`); a pitch, road or map as the page (`ee/DZ4dXpRu9g6`, `hex/DdvgHQcIWYy`).
Moran: real desk pages (`moran/DLQw7mqJzRp`). Tell: a desk of equal-weight clippings (K3). Fix: one
object at the centre, the rest cropped at the edges.

**Disc or burst stage** (49 pieces). When: a face or object must pop on a busy or grey ground. How: a
flat accent or neutral disc (a cut paper circle piece, or an SVG circle with `Grain` over it) behind
the cut-out, same spot every beat that uses it. Range: disc 40–65 % of width: ~45 % (`pin/350184`
(B)), ~40 % behind a face (`hex/DN-WcdHiZCs`), ~65 % (`hex/DPBpZK4CbYi`); rays converging on the
subject (`ee/DY9SS5YOhS8`); head or hand breaking out of the disc for depth (`pin/349961` (D)).
Tell: a disc that moves spot per beat reads as layout drift. Fix: fix its position in the bible.

**Frame in frame** (42 pieces). When: footage, a screen, a point of view, an era. How: the frame is a
cut-out (TV, laptop, phone, gold frame, window) sourced by the archivist; the content plays inside
with `makeClip` or an image. Range: CRT 60–85 % of width (`hex/DTnEO5KCawE` 70 %, `hex/DSpnlAhCaJ5`
85 %), laptop 60 % (`hex/DcO003cvlUI` (C)), gold frame ~30 % (`ee/DcD4mcfIgey`), a phone viewfinder
that justifies zooms (`ee/DU-zVUXCD-r`). How (Moran): pick the TV by era (`moran/Dcm63HBAHzT`);
screen treatments (`moran/DNmGyQupPlQ`). Tell: a frame from the wrong era. Fix: name the era in the
manifest `subject`.

**Footage on a paper mat** (20 pieces). When: 16:9 or square footage in a 9:16 film. How: the clip
in a box on the paper ground; the caption above the box at one fixed spot across cuts. Range: clip
~35 % of the canvas (`hex/DNNfSWsJ0em`), box 30–40 % of height (`hex/DPgS8B7CZoY`); caption fixed
above (`hex/DP6L1BqCc0g`). Tell: a small 16:9 clip in black bars (`ee/DTNgwGAjH7-`, odd tell #5).
Fix: the mat, or cover the clip with type for one beat.

## §2 Grounds (grammar §3, §8)

**Visible paper ground** (99 pieces, the most common device). Always. How: a ground `<Img>` of a real
paper scan, or a surface image; texture bands via `Grain` / `printLook` (one
layer per band: fine grain, print, soft wash). Range: crumpled, fibre, grid, kraft or newsprint
paper even under empty cards (`hex/DaAIlijic8Y`). Moran: never a bare vector fill
(`moran/DY7TSLJAQef`, ruled partial in §12.6); one texture per frequency band
(`moran/DNuJS_oWoxM`); darken modes on white, lighten on black (`moran/DbBSCjjgbTw`); judge scale
against a real object (`moran/DcBhNhOg5kR`); warm off-white instead of pure white
(`moran/Dc1ShYsplyF`). Tell: a tiled pattern with a visible repeat (K4, C6). Fix: a scan larger than
the frame at the deepest pull-out, or rotate/flip tiles.

**Ground swap per beat** (12 pieces; the ground changes every ~3–6 s across register A, §10.4). When:
a new place, idea or actor (`ee/DZXDJ8AuAiU`). How: a new surface image per station, or
a ground swap + `InkSpread` (`src/fx`) for a day/night turn; the cut lands on the beat (hard cut inside a scene,
a paper join between scenes, `film-animator` step 9; the Director owns transitions). One ground
carries a whole passage and never flips back (`film-animator` tell 13). Range: 5 grounds, one every ~3 s (`hex/DZw15OaCDZv`); no ground over
~6 s (`hex/DcF_qVxqsaA`); 12 material sets in 46 s (`ee/DZXDJ8AuAiU`). Rules: one flat material per
ground with one cut-out set on it (`hex/Db-UqYwiqT5`); at most two saturated hues per scene and one
halftone over all scenes (`ee/DbagmfuIKyH`). Tell: one ground per act, swapped like a filter (K4).
Fix: plan grounds per beat group in the bible's table.

**Flat colour ground per scene** (10 pieces, mostly the prop/business explainer). When: a number, a
headline stack, a chapter or year slate. How: the `ground` token as a flat fill with `Grain` over it.
Range: full-bleed saturated ground with grain (`ee/DQucioMABeN`); one colour slate per year
(`ee/DYURMKHoayc`); ground colour taken from the subject (`ee/DYgz0USId6P`). Ruling §12.6: flat
fields are used, grain keeps them from reading as vector. Tell: flat with no grain. Fix: grain or a
felt/canvas scan.

## §3 Colour and texture (grammar §8, §5)

**Grey world, one accent** (52 pieces). Always: decide the accent first. How: material greyscale or
sepia (halftone/tint, below); `accent` reserved for the story object or key word. Range: only
yellow, 8 uses, each the plot noun (`hex/Dd0qOzpqoYf`); accent under 5 % of the frame
(`ee/DVDNgkZCtf4`); people grey, the brand object red (`ee/DafS1lPu18x`). How (Moran): tint photos
into the colour system at ~60 % (`moran/DQpMiV_Cdpr`); tritone from grey art (`moran/DR0HIWTiTkJ`).
The highlighter colour (§4) is the film's second hue at most. Tell: accent everywhere (K7); a hue
per beat. Fix: the meaning table in the bible: an accent use with no meaning is cut.

**One treatment over every source** (20 pieces). Always, decided once. How: `printLook` on pieces (never on text; the halftone dot is its option), a frame finish over the composition (fringe, scan, vignette,
flicker, weave, `Grain`), `Grain` bands. Range: grey-blue grade + grain + scanline over all
footage (`hex/DNDJyk8pizL`); halftone as glue across scenes (`ee/DbagmfuIKyH`); halftone on licensed
stills (`ee/DbAnBlpTkUQ`); one grade on archive and modern clips (`ee/DZ4dXpRu9g6`). Moran:
homogenise every clip the same way (`moran/DMOpmHxpAOA`). Tell: odd tell #6, plates drifting in
style (`ee/Dbp5HyyOmsR`). Fix: same grade, grain and halftone on all plates; high-contrast greyscale
hides mismatched sources (`hex/DdOCMfmCbLq` (C)).

**Grade carries the mood** (21 pieces). When: at the structural turns the Director marks. How:
finish and tint values per section; `InkSpread` for a day/night turn. Range: colour for the
optimistic beat, grey for failure (`hex/DY_8VpvCpeO`); dark past, warm payoff (`ee/DbAnBlpTkUQ`);
colour saved for the human payoff (`hex/DdvgHQcIWYy`). Tell: grade changes with no turn in the line.
Fix: tie each grade to a named turn in the bible.

**Tint wash on the story object** (18 pieces). When: the line names a region or object to judge.
How: an accent-coloured overlay (multiply or overlay) on the object or region; timing is the
animator's. Range: red 40 % on "something is wrong" (`hex/Da9wmeYi1ZG`); red 0.7 as a blast radius
(`hex/DaaSLUAidHC`); a map region tinted as named (`hex/Dbc-vIXCCqe`); one prop recoloured lime on
the money line (`ee/DbVMvRvMboX`). Tell: a wash in a non-accent hue. Fix: the wash is the accent.

**Vignette or spotlight pool** (44 pieces). When: a white page feels digital, or one object must
own the frame. How: a vignette gradient in the frame finish (default 0.35). Range: 15–35 % corner darkening
(`hex/DWG_-c3grGL` 15 %, `ee/Dbp5HyyOmsR` 20 %, `ee/DcJM47zIj-t` 35 %); a 60 % spot on a cork board
(`hex/Da0NQ7eCAnr`). Moran: focus vignette with Compound Blur (`moran/DLShlJxRXZe`). Tell: a
vignette that darkens the caption. Fix: check T11 on the darkest caption spot.

**Moving window-light shadow** (7 pieces). When: a desk stage that needs time of day or calm. How: a
real blind/leaf shadow scan via a `Grain`-style texture layer in multiply, slow drift. Range: bands at ~25–30°
(`ee/DTxZksEDMiQ`, `hex/DYg3NWxiZ7j`). Moran: `moran/DdKZ5oBpPCW`. Tell: band angle against the
film's light angle. Fix: one light angle for shadows and bands.

**Scanline or CRT texture** (16 pieces). When: screens, footage, a mid-century subject. How:
the finish scan option plus a scanline texture layer. Range: ~2 px scanlines (`hex/DQepYZ4CfSt`);
scanline + grain glue mixed plates (`hex/Dbc-vIXCCqe`). Moran: scan-line layer ~50 % overlay
(`moran/DLQw7mqJzRp`); CRT pass to blend archival (`moran/DTOKw4vieGq`). Tell: two textures in one
band (`moran/DNuJS_oWoxM`), overcooked grain (`moran/DMWEwQRp6aD`). Fix: one layer per band.

## §4 The caption system (grammar §7)

**Small serif caption on the quiet area** (58 pieces; the register-A reading track). How: `say()`
a screen-voice line at one fixed spot; `serif` family, italic allowed.
Range: cap height 2.5–3.5 % of frame height (`hex/Dbc-vIXCCqe` 3.5, `hex/Dbxj93xiCqg` 3,
`hex/Da0NQ7eCAnr` 2.5); the gate band is `NORMS.caption.capHeight`. Font size ≈ cap height / 0.7 for
a typical serif (`~`, measure the face). 1–5 words per chunk (`hex/DU3hTiOk2-M`,
`hex/DY_8VpvCpeO`); word count and timing gated by `NORMS.caption`. Placement: sky, water, wall, a
dark chest, never a face (`hex/DcF_qVxqsaA`); black on paper, white with a soft glow on footage
(`hex/DbnDiSLCtax`). Inside the central width and outside the platform UI bands (craft §2.5). Moran's
uppercase pill (`moran/DL24UePpHWN`) is not this register (§12.7). Text never pure #000/#FFF
(`moran/DOMfGIfCbuQ`; untested by the evidence, §12.8, kept for text). Tells: white 3 % on a bright
sky (`hex/DQepYZ4CfSt`), across eyes and mouth (`hex/DOOCNSVCexy`). Fix: paper or a dark area,
below the chin; T11.

**Caption rule follows the ground** (18 pieces). How: the bible states the caption colour and size
per ground class (paper, footage, flat colour), one family. Range: black ~3 % above the letterbox,
white 3.5 % inside the clip (`hex/DPlWlKVCfON`); ~6 % bold italic centred on blank paper
(`hex/DYg3NWxiZ7j`); the caption layer constant across footage and plates (`ee/DcaqrJkOiD3`).

**Condensed caps headline stack** (47 pieces; the prop/business explainer). When: the film picked
this system instead of the serif caption. How: the `display` family condensed caps, one line per
beat, the last word recoloured or oversized; a sentence caption in `NORMS.caption.capHeight` runs
underneath for sound-off viewers (`ee/DYURMKHoayc`). Range: ~1.5 s hold per line (`ee/DaU3XslOTOa`);
the red headline is the only colour (`ee/DYt77hNOaeB`). Ruling §12.5: two text layers coexist when
one is emphasis and one is reading.

**Key-word size jump** (24 pieces). When: the stressed word of a line. How: lettering (a word piece,
the caption lead + key) in the emphasis voice; nothing else changes. Range: 1.6–4× the caption
(`hex/DN-WcdHiZCs` 1.6–2×, `hex/DQwRiFzCf6W` 7 % vs 3 %, `hex/DOvNKEtiREq` 4:1); a name at 3× on
first appearance, caption size after (`hex/DO5lBJLiTni`). Lettering is not a caption: T10 does not
hold it to the caption band.

**Highlighter on the key phrase** (53 pieces). When: the one phrase that carries the claim. How:
`Highlight` (behind the text, multiply, `accentWash`) or the caption marks. Range: reveal
left to right in 0.4–0.6 s (`hex/DaKcIKGisp7`, `ee/Dacjr7jNsbG`); bar half a line high
(`hex/DbXtTeqifQw`); one per line (`hex/DYmMoGlCETm`); one colour per film (yellow, lime, green or
blue: `ee/DTaQHn1DEll`, `hex/Dc-vZs9CkUT`). Moran: hand-drawn box (`moran/DLnuz5ZJ6Ys`). Craft
§2.6: one active mark at a time. Tell: thin uniform ovals drawn in one frame (K6). Fix: the swipe,
one colour, the animator times it.

**Name tag on the subject** (40 pieces). When: a person or thing named for the first time. How:
a name-tag piece or a paper/tape label (`Tape`) near the subject. Range: two lines, lower third
(`hex/DbSap1rTb6K`); two tiers who + what (`hex/DWdeabDAoHp`); ~1 s per face for a series
(`ee/DeG9eYVOknN`). Tell: odd tell #10, floating labels (`ee/Dd08TpPONpx`). Fix: on the subject, or
a leader line (`hex/DNfiewopHaL`).

**Numeral hero, small unit** (42 pieces). When: the line's number is the point. How: lettering in
the display voice, the unit in the caption voice beside or below. Range: numeral 12–35 % of height
(`hex/DPBpZK4CbYi` 12–15 %, `hex/DOOCNSVCexy` 20–25 %, `hex/DeL0qoEvYmD` (C) 30–35 %). Tell: the
numeral across a logo (`hex/DPBpZK4CbYi`). Fix: bare paper or the dark part of the clip.

**Handwritten script as a second voice** (33 pieces). When: names, asides, mood, a diary voice. How:
`Stroke` / `Underline` write-on in the `script` family. Range: written stroke by stroke in 1.5–2 s
(`hex/DYOyiPDI666`, `hex/DYZBoYQiQBA`); script for names and mood, serif for facts
(`hex/DdI4HMVi99s`). Tell: script labels small, light, random (K5). Fix: script only for the aside
role, on its spoken word.

**Type voices.** Reading (caption), emphasis (size jump, numeral, headline, tag), aside (script): at
most three families (postmortem K8, craft §2.5 one emphasis style; the cap of three is `~`). One
chapter-card template for the whole film (`references/zhylin.md` 1).

## §5 The cut-out finish (grammar §9)

**White die-cut rim** (52 pieces) **or torn edge with fibre** (52 pieces): pick one as the film's
edge; the other only as a second material in the same frame (torn base, clean figure: `pin/349960`
(D)). How: the archivist bakes it (`cutout.swift --border`, or the oven's `rim`/`depth` through
`regions.mjs`); `Torn` can add a torn or deckle edge at render. Range: rim 3–8 px at
1080 w, constant width (`pin/350080` (D) 3–5, `ee/DafS1lPu18x` 4–6, `ee/DSc0jeJjB9u` ~7); torn
fibre rim ~3 px, gaps ~4 px (`pin/350019` (D), `pin/350137` (D)). Tell: odd tell #1 and mixed widths
(`pin/350067` (D)); straight clean edges (`pin/350121` (D)); crisp edges read digital
(`moran/DUEIdzuCUgn`). Fix: one width in the bible, in screen px.

**Tilted photo print** (53 pieces). When: photos, polaroids, documents laid on a stage. How:
`SetDown` with `rot` and a print border. Range: ±3–6° (`hex/DNz8oT80j3U`), 2–15° overall, 5–15° when
stacked (`hex/DUiOWpiCare`); 8 px polaroid border with a soft shadow (`hex/DXzqcfMiZ0F`). Tell: all
prints at 0° or all at the same angle. Fix: an angle range and a seed per piece.

**Contact shadow tokens** (the animator draws them, grammar §9). The bible gives one light angle and
the resting/lifted values: 2–4 px under cut-outs (`hex/DOvNKEtiREq`), 10–20 px offset and ~20 px
blur under cards (`pin/349972` (C), `hex/DYZBoYQiQBA` (C)); none on pure black (`pin/fd62cda1` (D))
or for flat props on a grey print (`hex/Dd0qOzpqoYf`). the `height` prop of the piece sets the resting depth.
Craft §2.4: one angle for the film; shadow grows with lift.

## §6 Focus check per beat (odd tells #2, #3, #7)

For each beat of the per-beat table answer: the loud thing; the empty share; caption spot clear of
faces, sky, logos; accent only on the focus; overlaps only on sub-second beats and every final hold
inside a safe margin (~60 px at 1080 w, `ee/DcijzMlOiKS`); hero + supports + stage pieces ≥
`NORMS.frames.minCoverage`. A beat that fails two of these goes back to its stage choice (§1).
