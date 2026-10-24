#!/usr/bin/env python3
"""Cuts a cut-out figure into rig parts: a torso plus, per limb, one part per link (2-link arm, 3-link
leg, ...), each a capsule of the figure's own pixels. Writes the part PNGs and a TS module the
Puppet reads (src/rig).

  cut-limbs.py <figure.png> <limbs.json> <out_dir> [--name NAME]

<figure.png> is an RGBA cut-out of the whole figure (alpha = the figure). <limbs.json>:

  {
    "torso": {"name": "torso", "pivot": [540, 1000]},          // optional; hinge in figure px, default the centre
    "limbs": {
      "l": {
        "joints": [[300, 450], [185, 480], [60, 310]],         // shoulder, elbow, hand tip (figure px)
        "radii": [[56, 48], [44, 48]],                         // per link: capsule radius at its start and its end
        "names": ["ua_l", "fa_l"],                             // optional; default <limb>_0, <limb>_1, ...
        "stub": 34,                                            // optional; px along the first link where the torso cut starts
        "tip_extend": 22,                                      // optional; the last link runs this far past its tip
        "margin": 4,                                           // optional; how much wider than the limb the torso is cut
        "extra": [[[565, 262], [735, 271], 26, 22]]            // optional; capsules (a, b, ra, rb) welded to the LAST link (brush, fingers)
      }
    }
  }

The torso cut is the limb's capsule grown by `margin`; for the first link it starts `stub` px along the
link, and its round end reaches back `radius + margin` from there, so the torso keeps `stub - radius -
margin` px of the limb past the hinge; a shorter stub keeps none and bites `radius + margin - stub` px
behind the hinge, mostly under the first link's own disc about that hinge.

Joint k is the hinge of link k: link k runs from joint k to joint k+1. Each link part keeps the figure's
pixels inside its capsule, cropped to their bounds (+3 px). The capsule's far end is a disc, so a link
turned about its hinge shows no gap, and the next link (drawn later, so on top) owns the joint.

The module <out_dir>/<name>-parts.ts exports:
  SIZE   [w, h] of the assembled figure (the Puppet's `size`)
  PARTS  a Part[] for the Puppet in DRAW ORDER (torso first, then each limb's links, later on top):
         { part, file, pivot, parent, origin }.
         `pivot` is the hinge inside the part's own image; `origin` is the image's top-left in the figure;
         `file` is the PNG's name, next to the module (map it to an imported URL in `images`).

Run with PIL: /Users/guisfits/llm-models/venv_mlx/bin/python -I tools/kit/cut-limbs.py ...
"""

import argparse
import json
import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw

SS = 3  # supersampling of the capsule masks, for clean edges
PAD = 3  # px kept around a part's pixels


def capsule(draw, a, b, ra, rb):
    """A tapered capsule from a (radius ra) to b (radius rb) on a supersampled mask."""
    ang = math.atan2(b[1] - a[1], b[0] - a[0])
    nx, ny = -math.sin(ang), math.cos(ang)
    pts = [
        ((a[0] + nx * ra) * SS, (a[1] + ny * ra) * SS),
        ((b[0] + nx * rb) * SS, (b[1] + ny * rb) * SS),
        ((b[0] - nx * rb) * SS, (b[1] - ny * rb) * SS),
        ((a[0] - nx * ra) * SS, (a[1] - ny * ra) * SS),
    ]
    draw.polygon(pts, fill=255)
    for c, r in ((a, ra), (b, rb)):
        draw.ellipse(((c[0] - r) * SS, (c[1] - r) * SS, (c[0] + r) * SS, (c[1] + r) * SS), fill=255)


def along(a, b, d):
    """The point d px from a towards b (past b when d is longer than the segment)."""
    length = math.hypot(b[0] - a[0], b[1] - a[1])
    if length == 0:
        raise ValueError(f"joints {a} and {b} coincide")
    return (a[0] + (b[0] - a[0]) / length * d, a[1] + (b[1] - a[1]) / length * d)


def mask(size, paint):
    m = Image.new("L", (size[0] * SS, size[1] * SS), 0)
    paint(ImageDraw.Draw(m))
    return m.resize(size, Image.LANCZOS)


def times(alpha, m):
    return Image.composite(alpha, Image.new("L", alpha.size, 0), m)


def links_of(name, spec):
    """[(part name, start, end, ra, rb, extra capsules)] of one limb, the tip already extended."""
    joints = [tuple(float(v) for v in j) for j in spec["joints"]]
    radii = spec["radii"]
    if len(joints) < 2 or len(radii) != len(joints) - 1:
        raise ValueError(f"limb {name}: {len(joints)} joints need {len(joints) - 1} radii pairs, got {len(radii)}")
    names = spec.get("names") or [f"{name}_{i}" for i in range(len(radii))]
    if len(names) != len(radii):
        raise ValueError(f"limb {name}: {len(names)} names for {len(radii)} links")
    last = len(radii) - 1
    out = []
    for i, ((ra, rb), part) in enumerate(zip(radii, names)):
        end = joints[i + 1]
        if i == last:
            end = along(joints[i], end, math.dist(joints[i], end) + spec.get("tip_extend", 0))
        extra = [(tuple(e[0]), tuple(e[1]), e[2], e[3]) for e in spec.get("extra", [])] if i == last else []
        out.append((part, joints[i], end, ra, rb, extra))
    return out


def cut(img, spec):
    """Returns (parts, images): parts in draw order as Part dicts without `file`; images {part name: RGBA}."""
    img = img.convert("RGBA")
    alpha = img.getchannel("A")
    torso_alpha = alpha
    parts, images = [], {}
    torso = spec.get("torso", {})
    torso_name = torso.get("name", "torso")
    pivot = torso.get("pivot") or [img.width / 2, img.height / 2]
    parts.append(dict(part=torso_name, pivot=[round(pivot[0], 1), round(pivot[1], 1)], parent=None, origin=[0, 0]))
    limb_parts = []
    for limb, lspec in spec["limbs"].items():
        links = links_of(limb, lspec)
        margin = lspec.get("margin", 4)
        stub = lspec.get("stub", 0)
        parent = torso_name
        for k, (part, a, b, ra, rb, extra) in enumerate(links):
            def paint(draw, grow, a=a, b=b, ra=ra, rb=rb, extra=extra):
                capsule(draw, a, b, ra + grow, rb + grow)
                for ea, eb, era, erb in extra:
                    capsule(draw, ea, eb, era + grow, erb + grow)

            m_link = mask(img.size, lambda d, paint=paint: paint(d, 0))
            # the torso is cut a little wider than the limb, and from the stub on for the first link
            start = along(a, b, stub) if k == 0 and stub else a

            def paint_cut(draw, start=start, b=b, ra=ra, rb=rb, extra=extra):
                capsule(draw, start, b, ra + margin, rb + margin)
                for ea, eb, era, erb in extra:
                    capsule(draw, ea, eb, era + margin, erb + margin)

            m_cut = mask(img.size, paint_cut)
            torso_alpha = Image.composite(Image.new("L", img.size, 0), torso_alpha, m_cut.point(lambda v: 255 if v > 127 else 0))
            part_alpha = times(alpha, m_link)
            box = part_alpha.point(lambda v: 255 if v > 8 else 0).getbbox()
            if box is None:
                raise ValueError(f"limb {limb}: link {part} holds no figure pixels; check its joints against the figure")
            box = (max(0, box[0] - PAD), max(0, box[1] - PAD), min(img.width, box[2] + PAD), min(img.height, box[3] + PAD))
            png = img.copy()
            png.putalpha(part_alpha)
            images[part] = png.crop(box)
            limb_parts.append(dict(
                part=part,
                pivot=[round(a[0] - box[0], 1), round(a[1] - box[1], 1)],
                parent=parent,
                origin=[box[0], box[1]],
            ))
            parent = part
    torso_img = img.copy()
    torso_img.putalpha(torso_alpha)
    images[torso_name] = torso_img
    return parts + limb_parts, images


def parts_module(name, size, parts):
    """The TS text of <name>-parts.ts."""
    rows = ",\n".join(
        "  " + json.dumps(dict(part=p["part"], file=p["file"], pivot=p["pivot"], parent=p["parent"], origin=p["origin"]))
        for p in parts
    )
    return (
        f"// Generated by tools/kit/cut-limbs.py; do not edit by hand.\n"
        f"// PARTS is in draw order (later on top). pivot: the hinge inside the part's own image; origin: the image's\n"
        f"// top-left in the assembled figure; file: the PNG next to this module.\n"
        f"export const SIZE: [number, number] = [{size[0]}, {size[1]}];\n"
        f"export const PARTS: {{ part: string; file: string; pivot: [number, number]; parent: string | null; origin: [number, number] }}[] = [\n{rows},\n];\n"
    )


def run(figure, spec, out_dir, name):
    img = Image.open(figure)
    parts, images = cut(img, spec)
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    for p in parts:
        p["file"] = f"{name}-{p['part']}.png"
        images[p["part"]].save(out / p["file"])
    module = out / f"{name}-parts.ts"
    module.write_text(parts_module(name, img.size, parts))
    return parts, module


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("figure")
    ap.add_argument("limbs_json")
    ap.add_argument("out_dir")
    ap.add_argument("--name", help="prefix of the output files (default: the figure's file name without -cut)")
    args = ap.parse_args(argv)
    name = args.name or Path(args.figure).stem.removesuffix("-cut")
    try:
        parts, module = run(args.figure, json.loads(Path(args.limbs_json).read_text()), args.out_dir, name)
    except (ValueError, KeyError) as err:
        sys.exit(f"cut-limbs: {err}")
    print(f"{module}: {len(parts)} parts ({', '.join(p['part'] for p in parts)})")


if __name__ == "__main__":
    main()
