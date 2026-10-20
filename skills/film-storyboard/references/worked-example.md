# Worked example: from narration to rows

Project-agnostic; continues the director's example (`film-director/references/worked-example.md`,
the shipping-container film). Pace plan rows for this stretch: a burst at beat 2 resolving into a
hold; a breath card after the hook.

Narration, 0.0–11.4 s (words.json, abbreviated):

> In 1956, loading one ship took a week. ‖ It took a week. ‖ Sacks, barrels, crates, bales, ‖ every
> one carried by hand. ‖ Thousands of dockers ‖ on every quay.

## Decisions, phrase by phrase

| Words | Rule applied | Row |
|---|---|---|
| "In 1956, loading one ship took a week." | new number + new object: one row; hook picture = the ship being loaded, `key[0]` "ship" | b01 |
| "It took a week." | pace plan: breath card after the hook | b02 `breath-card` |
| "Sacks, barrels, crates, bales," | list sentence → word-speed rows, one per noun (§10.2; `zhylin.md` 3); burst holds the camera, the cut is the move | b03–b06, `zoom.kind: "static"` |
| "every one carried by hand." | the burst resolves: the point of beat 2 is the hand, the hold of the plan | b07 `hold`, `punch-in` to `.hands` (punch 1 of 2) |
| "Thousands of dockers" | "thousands": one docker cut-out multiplied | b08 `crowd`, hero = the docker cut-out |
| "on every quay." | same subject continues, crowd grows on the spoken word: same plate, next count step | b09 `crowd`, same hero |

Not a row: "took a week" inside b01 (same clause), "every one" inside b07 (continues the subject:
the caption changes, the picture holds).

## Two of the rows

```json
{ "beats": [
  {
    "id": "b07",
    "t": [6.1, 8.4],
    "says": "every one carried by hand.",
    "key": [{ "word": "hand", "t": 7.6 }],
    "hero": { "asset": "docker-sack-1950s-photo", "why": "a man carrying a sack on his back: the labour the line names" },
    "support": [],
    "lettering": [{ "text": "hand", "lands": 7.6, "mark": "circle" }],
    "zoom": { "target": "docker-sack-1950s-photo.hands", "kind": "punch-in" },
    "device": "hold"
  },
  {
    "id": "b08",
    "t": [8.4, 9.9],
    "says": "Thousands of dockers",
    "key": [{ "word": "Thousands", "t": 8.4 }],
    "hero": { "asset": "docker-cutout", "why": "one docker multiplied into a crowd makes 'thousands' visible" },
    "support": [],
    "lettering": [],
    "zoom": { "target": "docker-cutout.figure", "kind": "pull-out" },
    "device": "crowd"
  }
] }
```

Row report for 0–11.4 s: 9 rows, ~3 words per row, 1 same-plate row: inside grammar §10 "new
picture every" for a hook-and-burst stretch; the body after it will run longer rows.

Picture list lines for these rows (hand-off): `docker-sack-1950s-photo` — a docker carrying a sack,
**hands uncropped with room around them** (punch target); `docker-cutout` — one full-figure docker,
clean edges, used 2 rows, multiplied by the animator; `breath-card` — shared card, source drawn.
