# Kit and cut-outs: real material

**Real-world objects are cut from real photographs, scans or footage, never drawn in code.** A
book, a hammer, a building, a coin drawn with canvas paths reads as a hammer but is not believed.
Code draws light, type, ink, marks, data and camera; material comes from the kit.

## The kit folder

A kit is a folder the project owns (`--kit <dir>` or `MOTION_KIT`):

```
<kit>/
  catalog.json   recipes, committed
  sources/       downloaded originals (gitignored)
  pieces/        built pieces + manifest.json (gitignored; rebuilt from the catalog)
  out/           contact sheets per kind
```

A catalog entry:

```json
{ "id": "map-1890-europe", "kind": "page", "src": "https://…/map.jpg", "cut": "paper",
  "border": 0, "tags": ["map", "europe", "19th-century"],
  "source": "Library catalogue record", "license": "public domain" }
```

`kind`: portrait, page, place, painting, object, symbol, texture, footage, cover, take.
`cut`: `subject` (lift the subject), `paper` (key out the paper, keep the ink), `none`.
`src` may be a path (relative to `--root`) or a URL; `*` ids expand a glob.

| Command | Does |
|---|---|
| `node <E>/core/kit.mjs fetch [--only id,…] --kit <dir>` | downloads catalog URLs into `sources/` |
| `node <E>/core/kit.mjs build [--only …] [--kind …] [--takes] --kit <dir>` | cuts or copies every piece into `pieces/<kind>/<id>.<ext>` + `manifest.json` |
| `node <E>/core/kit.mjs sheet [--kind …] --kit <dir>` | contact sheet per kind |
| `node <E>/core/kit.mjs list [--kind …] [--tag …] --kit <dir>` | find pieces |

Repo carries recipes, not thousands of PNGs. Grow the kit whenever a film lacks a piece.

## Cutting one piece by hand

```bash
swift <E>/core/reference/cutout.swift <in> <F>/assets/cut/<name>.png --border 12 [--mode subject|paper]
```

- `--mode subject` (default) lifts a person, statue, building or object (macOS Vision, local).
- `--mode paper` keys the paper out of an engraving, woodcut, map or printed page; the ink stays.
- `--border` is the scissors' edge: 8–14 px at the piece's final size; none for keyed prints that
  should read as ink on the ground.

Open every cut on a ground before using it: a missing hand, a halo of old background or a cut
through the subject means re-cut (other mode, or crop the source tighter first with ffmpeg).

## Rigs

A piece that must act (nod, point, swing a hammer) is cut into hinged paper parts, Monty-Python
style: a root plus children that turn about pivots, each in its parent's frame.

```bash
node <E>/core/reference/rig.mjs <picture> <F>/assets/rigs/<name>/spec.json --out <F>/assets/rigs/<name> [--swing 20]
```

```json
{ "subject": "birefnet",
  "parts": [
    { "name": "body",    "pivot": [0.47, 0.55], "parent": null,       "z": 0, "poly": [[x, y], ...] },
    { "name": "forearm", "pivot": [0.29, 0.36], "parent": "upperarm", "z": 2, "poly": [[x, y], ...], "fill": "copy" } ] }
```

- Points are 0..1 of the upright picture. A parent is listed before its children; where polygons
  overlap the later part wins. The root's `poly` is optional (a rough fence around the figure when
  the matte lifts the neighbours too).
- `subject`: `none` (the polygons alone), `alpha` (a picture that is already a cut-out PNG: its own
  transparency is the matte, with `"shrink": 0`), `subject` (Vision, fast, blocky edge with a light halo)
  or `birefnet` (clean edge, ~15 s, the model is cached in `~/.u2net`). A pale line along an edge
  means more `shrink` (px, default 2) or the other matte.
- Each child reaches `overlap` (3% of its size) behind its pivot into its parent, and the parent
  keeps a patch of radius `reach` (30% of the child's size) around the pivot: `fill: "copy"` reuses
  the child's own pixels (one cloth: a sleeve), `"inpaint"` (default) invents them from the
  parent's pixels with OpenCV TELEA through `uv`, `"texture"` keeps the `copy` patch at the joint
  and rebuilds the rest of what the child covered *inside the parent's own `poly`* by exemplar
  synthesis from the parent's nearby pixels (hatching and grain carry on; TELEA leaves a flat
  blob). Use `texture` when a limb crosses a torso (an engraving's forearm over the belly), give
  the parent a `poly` that says how far it reaches under the limb, and keep `reach` small (the
  patch is a duplicate of the child's own pixels: a long one shows as a ghost limb). Raise
  `reach` when a gap opens at wide angles.
- `underlay`: a part's own field, `"underlay": "cap-hair.png"`: a PNG in the output folder, the size of
  the source, painted by hand or script, that replaces the parent's pixels wherever the part lay over
  the parent's polygon. For when synthesis cannot be trusted (hair under a cap, where `texture`
  borrows skin): give the parent a `poly` that says how far it reaches under the part.
- `extras`: finished overlay pictures that are not cut from the source, for a blink or a mouth:
  `{ "name": "eyelids", "file": "eyes-closed.png", "x": 812, "y": 760, "parent": "body", "z": 3 }`
  (the PNG sits in the output folder, `x, y` is its top-left in source px). They go in `rig.json`
  with `hidden: true`; `drawRig` skips them unless the pose lists their name in `show: ["eyelids"]`.
  A blink: paint the lids from the skin around the eyes at the same size, show them 2-3 frames.
  `preview`: `{ "seconds": 3, "fps": 24, "ease": "inOut", "keys": [{ "t": 0.4, "angles": { "beret": 14 },
  "show": ["eyelids"] }] }` scripts `preview.mp4` instead of the swing (angles travel, `show` holds).
- Pivot at the middle of the joint's cut edge; cut through plain cloth or shadow, not through a
  face or a hand. Output: `<name>.png` per part, `rig.json`, and `preview.mp4` (every child swings
  ±`swing`° over 2 s, all parts together, so judge each joint at a third of the peak too).
  Commit `spec.json` and `rig.json`; the PNGs go to R2 with the other assets.

On the film page (`core/lib/rig.js`, pure maths: the same angles always give the same pose):

```js
import { loadRig, drawRig, stepPose } from "<E>/core/lib/rig.js";
const rig = await loadRig("assets/rigs/pauwels-teses/rig.json", stage);  // queued in stage.pending
const KEYS = [{ t: 0, angles: { forearm: 0 } }, { t: 0.5, angles: { forearm: -18 } }, { t: 0.7, angles: { forearm: 0 } }];
// in draw(t): angles are degrees, clockwise, relative to the part's parent
drawRig(host, rig, { angles: stepPose(t, KEYS, 12), x: 540, y: 1200, scale: 1.4, origin: [400, 560] });
```

`drawRig` takes a DOM container (the parts are created once and moved after) or a canvas context.
`origin` is the source px point that lands on `x, y` after `scale`. `stepPose(t, keys, fps = 12,
{ ease })` holds each key until the next on an `fps` grid (the pose-swap feel of hand-moved paper);
`ease: "linear" | "in" | "out" | "inOut" | fn` travels between keys instead, still in steps.

## Sources and licences

- Prefer public-domain and CC0 collections: museum open-access programmes, national libraries,
  Internet Archive, Wikimedia Commons (PD/CC0 files), and free-licence photo/footage sites whose
  licence allows reuse. CC BY only when attribution on screen or in the description is acceptable
  to the project.
- Record the licence and source of every file in the catalog (and of every SFX in its credits).
- Generated images are allowed when a search costs more than it gives (the archivist's image
  request: the client generates from a written prompt and returns the files). Never as a document
  or clipping, never with legible text, a real person only from a real portrait passed as
  reference; record `licence: "generated"` and the tool in `source`.
- Evidence must be the right one: the right century, language, person, edition. A picture that
  merely fits the mood under a factual line is decoration, and a critic fails it.

## Finding pieces fast

- One command searches the open collections and shows the candidates on a numbered sheet:
  `node core/reference/find.mjs search "<terms>" --out <dir> [--min-w px]` (Openverse, Commons,
  AIC, Cleveland, Met; public domain and CC0 only). `find.mjs add <dir>/candidates.json <n> --kit
  <kit> --id <id> --kind <kind> --cut <cut>` writes the catalog row with `url`, `source` (the
  object's page), `license`, `author`, `date`; then `kit.mjs fetch --only <id>` and `build`.
- `build` cuts in parallel with a compiled cutter; the recipe (`cut`, `border`, `matte`) is
  hashed into the manifest, so editing it re-cuts. `matte: "birefnet"` mattes with BiRefNet
  (local, `core/reference/matte.py`, via `uv`; first run downloads ~1 GB) where Vision leaves a
  halo on hair or misses a figure in a busy plate. When Vision finds no subject at all, the
  source is a ground or a page: `cut: none` or `paper` (BiRefNet guesses wrong there).
- By hand, Openverse: `https://api.openverse.org/v1/images/?q=<terms>&license=cc0,pdm`
  (add `&source=wikimedia|rawpixel|flickr` to narrow). It returns the file URL, licence and the
  landing page to record. Museum open access (Walters, Met, Cleveland, British Library) is there.
- Wikimedia and Flickr may rate-limit or block originals (HTTP 429): take the large preview the
  API lists (`_b`, 1024 px) and note the original's URL in the catalog for later.
- "Isolated"/"png sticker" results are often drawings with a fake checkerboard: reject them;
  cut a real photo instead (`cutout.swift --mode subject`).
- One good cut-out can make a set: tinted variants (colour matrix / hue / levels) read as
  different objects of the same family (three books from one photo). Crop manuscripts and maps to
  the fragment that reads at phone size.
- Match the evidence to the word: "genealogies" → a genealogical chart (linked medallions),
  "maps" → a period map of the right land, not any old map.

## Recordings (footage and app takes)

`node <E>/core/reference/clip.mjs <rec.mov> <F>/assets/clip-<name> --fps 60 [--from s --to s]`
turns a recording into frames + `clip.json`; play it with `makeClip`. Keep the original recording;
the frames are rebuilt. Screen-capture practice (touch indicators, clean status bar, rehearsed
gestures) is in the `motion-graphics` skill.

## One world per film

Every piece belongs to one material world (e.g. 19th-century print on paper, or modern photo on
cardboard). A piece from another world, era or medium breaks the spell; swap it or re-grade it so
it reads as printed on the same stock (one tint, one grain, one shadow angle).
