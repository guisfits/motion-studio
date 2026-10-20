# Registration: the film contract and the trace

What the film draws is registered once, from the same variables that draw it, so the gates measure meaning (captions, lettering, hero, zoom target) without reading pixels. Source ids: `[eng]` = engine code read for this file (`core/lib/trace.js`, `core/checks/trace.mjs`, `core/checks/picture.mjs`, `core/checks/norms.mjs`, `core/lib/table.js`, `core/lib/layout.js`, README "The film contract"); `[tested]` = observed by running the gates or the engine's own functions; `~` = inference. Numbers are `NORMS` keys, never restated.

## 0. Read the contract before the first line

The contract is documented in `README.md` ("The film contract", trace items `cap`, `color`, `target`, `ground`, `camera(t).shot`) and is what `core/lib/trace.js`, `core/checks/trace.mjs`, `core/checks/picture.mjs`, `core/checks/rhythm.mjs` and `core/checks/legibility.mjs` read today. A caption without `cap` or `color` is a red T10 or T11 at the draft. Before the first line of a film, read the `ROLES` set in `trace.mjs` and the field names in those files again: a role the checker does not know is a T0 and stops every other gate, and a missing caption field is a red T10 or T11. If this file and the engine disagree, the engine wins and the Director hears about it.

## 1. The film

1. The film is `<film>/index.html`. DOM built once; `draw(t)` only sets styles; time enters only as `t`; random numbers only from `rng(seed)`; no CSS transitions, timers or state kept between calls `[eng README]`.
2. Read data at load with `fetch` on relative URLs: `crew/sync-sheet.json`, `crew/manifest.json`, `voice/words.json`. Never copy a time into code. `loadVoice()` returns an object whose `words` is a method (`V.words(lineId)`); fetch the JSON yourself for the raw array `[tested: V.words.find throws]`.
3. Assert at load that every derived constant (`tIn`, `tOut`, lands, key times) is a finite number. `undefined + 0.4` is `NaN`, a `NaN` pose silently becomes "off screen" and the hero vanishes `[tested]`.
4. `window.CUES = table.cues()` plus any component `cues()`, so the sound role gets the landings `[eng]`. `window.camera = t => { const p = table.at(T(t)); return { scale: p.z, x: p.x, y: p.y, shot }; }` with `shot` = the number of `cut: true` keys at or before `T(t)`. Scale finite and > 0 or T0 stops the run. `shot` is how R1 to R3 see a hard cut as an event and how T7 avoids reading a cut's scale jump as a move; a cut key without it is both a missed event and a false punch `[eng rhythm.mjs, picture.mjs]`.
5. One clock. `const T = (t) => (STEP ? stepped(t, 12) : t)`. When the register asks for stepped motion (SKILL step 1) the camera and every piece read `T(t)`, and the trace functions read the same `T(t)`: the gate sees the poses the viewer sees `[tested]`.

## 2. What to register

`const tr = makeTrace(); tr.add(id, role, fn); tr.install();` before `stage.run`. `fn(t)` returns `{ box: [x, y, w, h], alpha, text, ... }` or `null` when the thing is not drawn; `alpha` defaults to 1. Boxes are frame pixels (`FILM.W` x `FILM.H`): the axis-aligned bounds of what is on the canvas after camera, rotation and entrance offset `[eng]`.

| What | Role | Id | Box and fields | Read by |
|---|---|---|---|---|
| Caption chunk | `caption` | `cap-<n>`, unique per chunk, never reused for other text | `box` = the text run with a little padding (T11 samples the rendered pixels in it: the median luminance is the background, so the glyphs must be a minority of the box); `text` = the displayed words; `cap` = cap height in frame px as drawn; `color` = text colour as `#rgb`, `#rrggbb` or `rgb()` | T1-T4, T10 (`cap`), T11 (`color`), R1 and R3 (chunk change = event) |
| Lettering | `lettering` | `<beat>-<word>` | the word's full final extents, measured once at load; `text`; `bleed: true` only for a display word cropped by the frame on purpose (README trace contract) | T4 (skipped when `bleed`) |
| Mark | `mark` | `<beat>-<word>-mark` | stroke bounds | role check; S6 reads the sheet |
| Hero | `hero` | the manifest asset id | bounds; alpha 1 while it moves in | T5, T6, H1, P1, R1 (hero change = event) |
| Support, other piece | `support`, `piece` | manifest asset id | bounds | T5, P1 |
| Ground (paper, desk, disc, flat field, plate behind) | `ground` | `ground-<n>`, not a manifest id | full bounds | counted by nothing: excluded from T5 |
| Zoom target, one per row that names one | `target` | `<row id>-target`, e.g. `b07-target` | the named part's extents in frame px, projected by the same function as the picture | T9: from the row's first key word until the camera leaves for the next row it is registered and inside the safe box (`stage.box`) |
| Camera | `window.camera(t)` | | `{ scale, x, y, shot }` | T0, T7 (moves split at a change of `shot`), T8, R1 (`shot` change = event) |

Events for R1 to R3 are exactly three things (`core/checks/rhythm.mjs`): the first `hero` item on screen at alpha >= `NORMS.frames.heroAlpha` changes id; the `caption` item at alpha >= `NORMS.caption.legibleAlpha` changes id (a caption leaving is not an event, the next one arriving is); `camera.shot` changes. Frame 0 sets the first values and is not an event; events within `NORMS.rhythm.eventMergeS` of the last one are the same edit. Camera moves, supports entering, marks and flashes are not events. A row that repeats the previous hero id (a held plate, one prop per phrase, a crowd step) makes no hero event: its event is the caption chunk that starts in it, or a cut.

A film that closes on the project's house outro (an imported, pre-approved closing piece that registers nothing) declares its window with `FILM.house = [t0, t1]` (seconds; t1 is the film's end), set before `window.ready`. T5-T9, R1-R4 and H1 then read the story only (it ends at t0, and R4's last 5 s are the story's); captions, legibility (T1-T4, T10, T11), P1 and the media gates still read the whole render. A malformed or non-closing window is a red T0 (`core/checks/house.mjs`, README trace contract).

## 3. Rules that keep draw and trace the same

1. Draw and trace share one function. Write `pose(t)` once; `draw` applies it, `fn` projects it. Alpha, box and text are the drawn ones, so an entrance or fade the viewer sees is the one the gate sees. A parallel table of numbers drifts the first time a beat is retimed.
2. Return `null` when the item is not on screen: before `tIn`, after `tOut`, or fully outside the frame. T6 takes the first `hero` in the list, so a hero kept registered while the camera is elsewhere is reported "off the middle third" `[tested]`. Exactly one hero is on screen at a time.
3. A hero stays at alpha >= `NORMS.frames.heroAlpha` from its entrance on: it enters by position, rotation and scale, never by opacity. A fade-in counts as "no hero" for its whole length (T6) and can miss H1 `[eng]`. A dissolve between heroes does the same: finish it before the key word's window (`NORMS.sync.heroWindowFrames`).
4. A caption's legible time counts only frames at alpha >= `NORMS.caption.legibleAlpha`, so fades come on top of the hold. T1 divides characters by that time `[eng]`.
5. A ground is never registered as `piece` to lift coverage: T5 counts registered area, so that passes the gate and leaves the frame empty. Register it as `ground` (T5 also skips a manifest asset whose `kind` or `treatment` is `ground`, but do not rely on it).
6. A deliberate bleed word (a display word cropped by the frame behind the subject, grammar §6 type interleaved) registers the part of its box that is inside the frame; T4 reads any lettering whose box crosses an edge `[eng]`. Never for a caption or small lettering. Open question for the engine: T4 has no exemption for a declared bleed.
7. One malformed item (wrong role, a box that is not four finite numbers, alpha outside 0-1) makes the gate return only T0 `[eng checkTrace]`.

## 4. Projecting a table film to frame pixels

The table draws `translate(W/2,H/2) rotate(-r) scale(z) translate(-x,-y)` `[eng table.draw]`. A station-local point goes to the frame like this, with `p = table.at(T(t))` and `w = station.toWorld(lx, ly)`:

```js
const toFrame = (st, lx, ly, t) => {
  const w = st.toWorld(lx, ly), p = table.at(T(t)), a = (-p.r * Math.PI) / 180;
  const dx = (w.x - p.x) * p.z, dy = (w.y - p.y) * p.z;
  return [W / 2 + dx * Math.cos(a) - dy * Math.sin(a), H / 2 + dx * Math.sin(a) + dy * Math.cos(a)];
};
const frameBox = (st, corners, t) => { /* corners through toFrame; return [minx, miny, maxx-minx, maxy-miny] */ };
```

A piece's corners are its centre plus half-extents rotated by its current rotation, plus its entrance offset, all from the same `pose(t)`. Screen-space layers (captions on the fixed overlay) are already in frame pixels.

Add one film-local aid, `PARTS`: `"<asset>.<part>"` to station and local point, and `window.partAt(id, t)` using `toFrame`. The `<row id>-target` registration is built from the same `PARTS` entry, so the number you read by eye on a still is the number T9 reads.

## 5. Reading the gates

The trace is sampled at every `1/NORMS.fps` s over the whole film, so `fn` must be cheap and pure. Most codes report only their first occurrence (T5 once per film, T6 once per second or hero, T4 per id): after a fix, re-run until clean, one red can hide several `[tested]`.

| Code | Usual cause | Fix |
|---|---|---|
| T0 | NaN or non-finite box, role the checker does not know, camera scale 0 | assert finite at load; re-read `ROLES` |
| T1, T2 | chunk too long for its hold, or hold counted from the start of the fade | lengthen the hold or split the chunk (`devices-type-data-life.md` 1) |
| T3 | more than `NORMS.caption.maxWords` words | re-chunk |
| T4 | lettering or caption crosses a frame edge while registered | retire it before the camera leaves; move it inside `stage.box` |
| T5 | too few registered pieces on screen: frame 0 before the hero enters, a cut frame with pieces still flying in, a long lateral move before a cut, the closing pull-out | seat pieces earlier, move less, add earlier beats' pieces to the closing collage |
| T6 | no hero on screen for a second, or its centre outside `NORMS.frames.heroThird` | hero seated from the beat start, stale registration, lateral move |
| T7 | a row whose `zoom.kind` is `push-in` or `pull-out` moves under `NORMS.camera.emphasisMinScaleDelta` inside one shot; or more than `NORMS.camera.maxPunches` rows reach `NORMS.camera.punchMax` | enlarge the move, or send the row back to be `drift`; budget the punches (a deep pull-out counts) |
| T8 | a linear stretch of scale in a move; steps under `NORMS.camera.holdRate` per second (the breathing) are a hold | ease the move; a drift above the hold rate is a move |
| T9 | the row's `<row id>-target` is not registered at its first key word, or leaves `stage.box` before the row ends | reframe or land the move earlier (`worked-examples.md` 2) |
| T10, T11 | caption `cap` outside `NORMS.caption.capHeight` (or not registered); `color` against the pixels behind `box` under `NORMS.caption.minContrast` (or not registered) | size, plate and colour are the style bible's; move the caption to a quiet area (grammar §7) |
| R1, R2, R3, R4 | event count or spacing outside `NORMS.rhythm`; R1 also reports a still hold (no event, camera still) of `NORMS.rhythm.maxStillHoldS` | `templates.md` 1 |
| H1 | the hero is not on screen at alpha >= `NORMS.frames.heroAlpha` inside the window of its first key word | seat it earlier |
| P1 | a hero, support or piece id that is not a `ready`, licensed manifest asset | never invent ids; ask the Director |
