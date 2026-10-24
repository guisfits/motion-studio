# Art director's templates

## §1 Style bible (`crew/style-bible.md`)

Fill every section; a blank is a decision not made. Numbers are screen px at 1080 × 1920 or NORMS
keys; overlay values (hex, family names) are written as the overlay's token name, with the `Film.tsx` token constant
it fills when the overlay maps one (`<overlay token>` → `accent`); never a raw hex.

```markdown
# Style bible: <film slug>  (register <A|B|C>)

## 0. Notes and answers
- "<owner note, verbatim>" → <one line: which device answers it, e.g. value range + one accent on the focus>

## 1. Caption system
- System: <serif caption on the quiet area | condensed caps stack + sentence caption>
- Reading voice: <serif|display family>, <weight/italic>; cap height <fraction> of frame height
  (inside NORMS.caption.capHeight) = <px>; font size <px> (measured on the face)
- Spot: <fixed y band, px>; inside the central width; outside the platform UI bands
- Colour by ground: paper → <token>; footage → <token> + glow <px>; flat colour → <token>
- Contrast: ≥ NORMS.caption.minContrast on the darkest/brightest spot it can land on: <spot, ratio>
- Emphasis voice: <family>, size jump <×>; numeral <% of height>; name tag <form>
- Aside voice: <script family | none>
- Highlighter: <token>, the film's only highlighter colour
- Chapter card: <ground, numeral, title voice> (one template)

## 2. Colour
- World: <greyscale | sepia | tinted> material
- Accent: <token> = <one-line meaning>; never on <list>
- Second hue: <highlighter token | none>; at most two saturated hues per scene
- Grade by turn: <turn beat> → <grade>; <turn beat> → <grade>

## 3. Treatment and texture (one for every source)
- Pieces: <halftone dot px | engraving keyed (cut paper) | tint amount | colour kept>
- Footage: <grade, scanline, halftone>
- Frame finish: { fringe, scan, vignette, flicker, weave, grain } = <values or off>
- Texture bands: fine <file>, print <file>, wash <file>; one layer per band

## 4. Cut-out finish
- Edge: <die-cut rim | torn edge with fibre>, <px> at screen size, constant
- Prints: tilt range <±°>, border <px>
- Light: from <angle>°; contact shadow resting <offset/blur px>, lifted <offset/blur px>; none on <grounds>

## 5. Per-plate look (rows that share a hero are one plate)
| Rows | Line does | Ground (material) | Stage | Loud thing | Empty % | Caption spot | Type device | Colour device |
|------|-----------|-------------------|-------|------------|---------|--------------|-------------|---------------|

## 6. Style key
Beat <id> at t = <s>: <what the still must show>. Signed: <date> against sections 1–4.
```

Checks before hand-off: one caption system; ≤ 3 type families; one accent with a meaning; one
treatment; one edge; a ground per plate group with no material held over ~6 s unless the rows are a hold the
Director asked for; every sheet row inside one plate row of the table.

## §2 Manifest (`crew/manifest.json`)

`tools/checks/sync.mjs` reads `manifest.assets` (an array): S7 fires on any row whose `status` is
not `"ready"` or whose `licence` or `source` is empty; S2 when a `hero.asset` has no row.
`tools/checks/picture.mjs` (P1) accepts an on-screen hero, support or piece only when its id is a
`ready` row with a `licence`; `trace.ts` ids are these ids. Captions, lettering and marks are not assets.

```json
{
  "assets": [
    {
      "id": "harbour-1890-engraving",
      "kind": "hero",
      "beats": ["b04", "b11"],
      "subject": "the harbour the line names, seen in its own decade: wharf and cranes legible",
      "treatment": "engraving, cut paper, torn edge",
      "minW": 1512,
      "status": "missing",
      "source": "",
      "licence": ""
    },
    {
      "id": "kraft-paper-ground",
      "kind": "ground",
      "beats": ["b01", "b02", "b03"],
      "subject": "real kraft paper scan, larger than the frame at the widest pull-out",
      "treatment": "ground, no cut",
      "minW": 2400,
      "status": "missing",
      "source": "",
      "licence": ""
    }
  ]
}
```

Rules

1. One row per distinct id in every `beats[].hero.asset` and `beats[].support[]`; the same id in
   two beats is one row listing both beats.
2. `kind`: `hero`, `support`, `ground`, `stage` (disc, mat, frame, desk surface), `document`,
   `texture`. Grounds, stages and textures are rows because they are files with a licence.
3. You write `id`, `kind`, `beats`, `subject`, `treatment`, `minW`, and `status: "missing"`,
   `source: ""`, `licence: ""`. The archivist fills provenance and sets `ready`; you never do.
4. `subject` says what makes it the right picture (who, where, which period or edition), so a
   look-alike can be rejected.
5. `minW` = the subject's widest on-screen width in px × the largest camera scale the sheet plans on
   it (`zoom` kind and target over every row that shows it; `punch-in` and `into-frame` count at full scale). Example: 540 px wide at a ×2.8 punch
   → 1512. Write `~` in the bible when the scale is estimated. A torn-edge (oven) cut is at most
   1600 px on its long side: a larger `minW` takes the die-cut rim or a smaller zoom.
6. Ids: kebab-case, subject + source or date. Unique. No row without a sheet or bible reference.
