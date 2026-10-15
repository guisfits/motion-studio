# Building the style on the engine (`styles/vox/lib`)

```js
import * as K from "<E>/styles/vox/lib/kit.js";          // re-exports moves.js
import { makeCutout, makeSlices } from "<E>/styles/vox/lib/collage.js";
```

Same contract as every engine component: build once with `tIn`/`tOut`, `x.draw(t)`, `x.cues()`.
Colours and faces come from `theme()` (the project overlay sets them); never hard-code a hex in a film.

## Components by job

| Job | Component | Notes |
|---|---|---|
| Ground | `ground(stage, { tone, texture, scan })` | graded ground with an optional real scan multiplied in; `tone(t)` switches day/night |
| Grain | `grain(stage, { strength })` | over everything, low (0.05–0.1) |
| Finishing pass | `finish(stage, { flicker, weave, scale, fringe, scan, vignette, grain, fps, seed })` → `draw(t)` | once, last, after everything is placed: exposure flicker (±0.03 stops) and gate weave (±1 px, scale 1.02) stepped per frame at `fps` (24), a global 1.5 px R/B fringe, scan softening (blur 2 px + unsharp), vignette 0.35, then `grain` on top. It wraps the whole stage, so the table camera stays smooth; whatever is built on `stage.dom` after it is wrapped too, so an end card that must stay clean gets its own div on `stage.root` (swap `stage.dom` while building it). Each step `false` to switch off; defaults and reasons in `craft-chrismoran.md` §1 |
| Real-scan texture | `texture(stage, { src, kind, blend, strength, scale, ppcm, tile, wiggle, fps, seed, normalize, loop, target })` → `{ draw(t), el, info }` | a scanned paper / print / dust layer over the table, built **after** the table and pieces and **before** `finish` (table → texture layers → finish → grain; the outro on its own layer). `blend: "auto"` measures the texture's background (light → multiply, dark → screen); overlay/soft-light normalise to 50 % grey first. `strength` is a curve on the texture, never opacity. `tile: true` + `ppcm` (the scan's px/cm) against `stage.pxPerCm` (40) keeps one physical scale; untiled it covers, never stretched. `wiggle` (±2 px, 12 fps, seeded) slides the ground; `kind: "video"` plays a clip folder frame-exactly (dust, scratches). `target`: an element (a sheet's print band) or `{ x, y, w, h }`. One layer per band: grain · print · light wash |
| Cut paper | `piece(stage, { img, w, x, y, rot, tIn, tOut, from, edge, height, stepped, filter })` | `from`: `tl tr bl br left right above below` (pulled in by an unseen hand); `edge`: `border deckle torn none`; `height` sets the shadow; `stepped: 12` for hand-moved feel |
| Photo with frame | `photo(...)` | a print with border and shadow |
| Print screen | `halftone`, `halftoneFilter` | dots on engravings, photos and grounds; never on text |
| Torn edges | `tornClip(seed)`, table `tear(...)`, `split({ seam: "tear" })` | a tear is a transition and a comparison |
| Figure in bands | `makeSlices(stage, imgs, { bands })` → `set(ts, { from, stepped })` | one subject, each band from a different source |
| Low-level cut-out | `makeCutout(stage, img)` → `place(x, y, { rot, scale, lift })` | for custom moves |
| Hero word | `heroWord(stage, { text, size, x, y, rot, edge, bleed, behind, enter, tIn })` | 380–520 px word bleeding off one edge, inserted **behind** a cut-out; crop by a few px so the cropped word never reads as another word |
| Lead + key caption (voiceless) | `caption(stage, { lead, key, size, accent, tIn })` | small lead word + big key word |
| Voiced captions | engine `say(stage, V, { line, screen: true, marks })` | the 2–4-word chunk in the fixed lower spot |
| Plain word / label | `word`, `tag` | `face`: display, serif, body, mono, typewriter, script, hand |
| One mark | `rubric({ kind: "underline" \| "circle" \| "arrow" })`, `highlight`, `say` marks | one per frame, drawn on in 0.3–0.5 s |
| Writing | `handwrite` (pen along the stroke), `typewriter` (key cue per letter, collapsed to one burst by thinning) | a margin note, a factual line |
| A line written by hand | `handText(stage, { text, x, y, size, face, color, tIn, k, d, dur, parent })` | revealed left to right at the pen's pace and finished exactly at `tIn + dur` (last glyph unclipped); `parent` puts it on a piece (a clipping's `.el`) |
| Ransom label | `ransom(stage, { text, size, tracking, upper, face, paper, ink, tIn, cps, ...clipping options })` | a strip whose letters are typed on, one key cue each, as it feeds out; `upper: false` + `edge: "torn"` is a headline banner that keeps its tear |
| Silhouette in bands | `sliced(stage, { img, w, x, y, cuts, moves: (i) => [...], place: (i) => ({ x }) })` | a cut-out sliced into torn bands that assemble; `place(i)` pushes one band off line |
| Scribble round a cut-out | `outline(img, { w, offset, seed })` → `pt(u)` | a seeded path hugging the image's alpha silhouette, for a stroke reveal |
| Numbers | `counter(stage, { from, to, tIn, dur, face: "type" \| "odometer" })` | lands on the value and holds |
| Quote on a document | `docZoom(stage, { img, rect, word, tIn, … })` | camera push to the quote; highlighter sweeps the spoken word |
| Map route | `route(stage, { points, tIn, dur })`, `route.follow` for camera keys | one route, storyboarded camera |
| Before / after | `split(stage, { a, b, seam, dir, at, tIn })` | the "take it away" beat |
| Colour with a cause | `inkBlot` (drop → splash → spread), `inkSpill` (a vessel pours), `inkFlood` (surface floods to night) | colour never appears from nothing |
| Tear transition | `tearReveal(stage, { from, tIn, dur, side, seed, bite, tilt, rim })` → `contact`, `done`, `progress(t)` | the shot on top ripped away along a torn front in uneven 12 fps jerks: white fibre rim, shadow lip on the shot beneath; one `tear` cue at the first step. `from` = the outgoing shot (a table's `view`), built above the incoming one |
| Page-turn transition | `pageTurn(stage, { from, tIn, dur, spine, shade, back })` → `done`, `angle(t)` | the shot turns over on its spine at 8 fps with curl shading, a paper back and a cast shadow; `shade` = a real crumple scan multiplied in; one `page` cue as it lifts |
| Ink transition | `inkBlot(stage, { x, y, tIn, cover: true, reveal, out, matte })` → `done` | the drop spreads to fill the frame, the next shot (`reveal`, built **above** `out`) carried inside a seeded fbm ink edge; `matte: { clip, at }` multiplies real ink footage (a `makeClip`) from the contact; `drip` + `splash` cues |
| Zoom-through | `zoomThrough(stage, { from, to, x, y, z, tIn, dur, ease })` → `cut`, `done` | dive into a point (hole, word, eye) on one eased scale move shared by both shots, hard cut at peak velocity (`cutAtPeak`), `to` lands upright at scale 1; `to` should be a table's view (its world fills the frame while small); one `whoosh` on the cut |
| Tape | `tapeOn(stage, { src, x, y, w, h, rot, tIn, lay, from })` → `pressed` | a strip laid across a piece's edge on the 12 fps clock, hovering, then pressed flat and held; `src` must be a photographed tape cut-out (never drawn); one `tape` cue on the press |
| Hard cut on the table | camera key `{ ..., cut: true }`; `cutAtPeak(curve, t0, t1)` (core motion.js) | an instant, silent, unblurred jump between table regions; a move still in flight keeps going through it, so cutting at the move's peak keeps its direction |
| Light | `candle`, `lightSweep`, `ripple` | atmosphere, a reveal |
| Drop cap | `dropCap` | a capital that fills |
| Legacy | `lockup` | an end card; prefer the CTA as the last spoken line |

## Placing and moving pieces

- Pieces enter by being **placed** (lift → land with a small rotation settle → contact shadow) or
  **pulled** in from a corner or side. Never fade in, never scale up from zero.
- Hand placements may step at 12 fps; corner pulls, camera, captions and recordings stay smooth.
- Layer order: graded ground → hero word → subject cut-out in front of it → one mark → caption.
- One shadow angle per scene; shadow offset and blur grow with `height`.
- Composed mess (optional, per project): words at ±4–12°, margin notes, overlaps with the frame
  edge; still ≤ 3 elements that read, and every readable word inside the safe box.

## Stations and the shot cadence

The engine's infinite table maps the style's grammar like this:

| Style idea | On the table |
|---|---|
| A new ground for a new idea | a new **station** (far apart, turned), reached by camera travel |
| A shot (≈ 1.6–3.2 s average) | a visual beat inside a station: a piece placed, a push to the next object, a mark landing, a cut to a new framing |
| Hero hold (3–8 s) | a station held with a slow push (`glide`, ≤ ~2 % scale per second) while the voice explains |
| Hard cut on a noun change | a `whip` or `move` between stations, or a plain cut between framings (a `cut: true` key); never to black or a dead frame |
| Whip | `ease: "whip"`, ≤ 3 per film, only where the idea changes |

So a station can last 4–8 s while the picture still renews every 2–3 s. Hopping stations every
1–2 s is frantic; a station with no new information for 5 s is dead.
