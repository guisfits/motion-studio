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

## Sources and licences

- Prefer public-domain and CC0 collections: museum open-access programmes, national libraries,
  Internet Archive, Wikimedia Commons (PD/CC0 files), and free-licence photo/footage sites whose
  licence allows reuse. CC BY only when attribution on screen or in the description is acceptable
  to the project.
- Record the licence and source of every file in the catalog (and of every SFX in its credits).
- Never pass a generated image off as a real person, place, object or document. Generated images
  may be atmosphere (`mood-only` tag), never evidence.
- Evidence must be the right one: the right century, language, person, edition. A picture that
  merely fits the mood under a factual line is decoration, and a critic fails it.

## Recordings (footage and app takes)

`node <E>/core/reference/clip.mjs <rec.mov> <F>/assets/clip-<name> --fps 60 [--from s --to s]`
turns a recording into frames + `clip.json`; play it with `makeClip`. Keep the original recording;
the frames are rebuilt. Screen-capture practice (touch indicators, clean status bar, rehearsed
gestures) is in the `motion-graphics` skill.

## One world per film

Every piece belongs to one material world (e.g. 19th-century print on paper, or modern photo on
cardboard). A piece from another world, era or medium breaks the spell; swap it or re-grade it so
it reads as printed on the same stock (one tint, one grain, one shadow angle).
