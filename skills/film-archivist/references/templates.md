# Archivist's templates

## §1 Manifest row, filled (`crew/manifest.json`)

The art director's keys stay as written (`id`, `kind`, `beats`, `subject`, `treatment`, `minW`). You
add or fill the rest. S7 reads `status`, `licence`, `source`; P1 reads `status`, `licence`.

```json
{
  "id": "harbour-1890-engraving",
  "kind": "hero",
  "beats": ["b04", "b11"],
  "subject": "the harbour the line names, seen in its own decade: wharf and cranes legible",
  "treatment": "engraving, cut paper, torn edge",
  "minW": 1512,
  "status": "ready",
  "licence": "Public domain (PD-old-100)",
  "source": "https://<archive>/<object page that states the licence>",
  "author": "<engraver, or 'anonymous' with the attribution the page gives>",
  "date": "<the work's date as the archive gives it>",
  "credit": "",
  "file": "assets/harbour-1890-engraving.png",
  "w": 1600,
  "h": 1032,
  "cut": "paper + oven {seed: 41, rim: 9, depth: 11, paper: [244, 239, 228], grain: 0.05}",
  "depth": "mid",
  "shadow": "resting per bible: 3 px / 4 px blur, light 315°"
}
```

Rules: `status` is one of `missing`, `placeholder`, `pending`, `request` (a generated picture asked
of the client, §4), `ready`; `ready` only with the file,
a checked cut and every provenance field filled. `w`, `h` = the delivered PNG. A detail crop is its
own row with the same provenance and its own `id`.

## §2 Search trail (`crew/assets-notes.md`)

```markdown
## harbour-1890-engraving (b04, b11): status ready
Need: the harbour named at b04 ("…"), 1880s–1890s, wharf and cranes readable; minW 1512.
Searched: kit (no harbour) → Openverse "harbour 1890 engraving" (3 hits) → Commons category of the
city's port (12 files) → national library catalogue (2 plates).
Candidates:
1. <title, maker, date, size, licence, page> — chosen: right decade, 2140 px across the wharf.
2. <title…> — rejected: 1910 photograph, cranes replaced; 900 px.
Survival: halftone at the bible's dot keeps the cranes at 360 px wide; engraving keyed with --mode paper.
Open: none.
```

A row left `missing` ends with `Blocked:` (what fails) and `Need:` (the choice the Director must
route: smaller on-screen size, another subject, a storyboard change).

## §3 Kit catalog entry for regions (document clause, or figures from one plate)

```json
{
  "id": "gazette-1891-p3", "kind": "page", "src": "sources/gazette-1891-p3.jpg",
  "cut": "regions",
  "regions": [{ "id": "clause", "poly": [[0.12, 0.41], [0.88, 0.41], [0.88, 0.47], [0.12, 0.47]] }],
  "oven": { "seed": 12, "rim": 8, "depth": 6, "paper": [244, 239, 228], "grain": 0.05 },
  "source": "https://<archive object page>", "license": "public domain"
}
```

`node tools/kit/kit.mjs build --only gazette-1891-p3 --kit <dir>` writes `pieces/page/gazette-1891-p3-clause.png`;
copy or point the film at it and give it its own manifest row (`gazette-1891-p3-clause`, with
`licence`, never `license`). Polygons from `cutout.swift --mode instances` or drawn by hand on the
source, u, v in 0..1 from the top-left. Give it the whole scan: each region is cropped at full
resolution before the clipping is fitted to 1600 px on its long side.

## §4 Image request (`crew/image-requests.md`)

One block per `request` row. The Director forwards the whole file to the client in one message; the
client generates with the tool named and drops each file as `assets/sources/<id>.png`.

```
## luther-at-desk (b05): status request
Tool: <the overlay's generator, e.g. Gemini (Nano Banana Pro) or ChatGPT>
Why generated: searched Commons, Met, AIC, Openverse for "luther writing desk": only 19th-century
  scenes in colour, none in the film's woodcut treatment (trail in assets-notes.md).
Attach: assets/sources/luther-cranach-1528.jpg (likeness reference)
Aspect: 4:5 · at least 2048 px on the long side
Prompt:
  A 16th-century German woodcut of Martin Luther, the man in the attached portrait, seated at a
  plain wooden writing desk, quill in hand, an open book and an inkwell before him. Three-quarter
  view, waist up, centred. Black ink lines and cross-hatching on off-white paper, as in a Wittenberg
  print of the 1520s; no colour, no shading gradients. Plain empty paper background around the
  figure, nothing behind him. No text, no letters, no frame, no border, no signature.
Check on return: likeness to the reference; period clothes (scholar's cap, black gown); hands with
  five fingers; no letters anywhere; lines read at phone width.
```

The prompt names subject, composition, medium and period in plain sentences (no "4k, masterpiece"
tokens), the plain background the cut needs, and the exclusions every generated piece carries: no
text, no frame. The overlay's recipe adds the film's treatment words; a set of pieces is requested
one at a time with the same style sentence and the first approved piece attached.

