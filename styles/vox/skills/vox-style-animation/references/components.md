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
| Numbers | `counter(stage, { from, to, tIn, dur, face: "type" \| "odometer" })` | lands on the value and holds |
| Quote on a document | `docZoom(stage, { img, rect, word, tIn, … })` | camera push to the quote; highlighter sweeps the spoken word |
| Map route | `route(stage, { points, tIn, dur })`, `route.follow` for camera keys | one route, storyboarded camera |
| Before / after | `split(stage, { a, b, seam, dir, at, tIn })` | the "take it away" beat |
| Colour with a cause | `inkBlot` (drop → splash → spread), `inkSpill` (a vessel pours), `inkFlood` (surface floods to night) | colour never appears from nothing |
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
| Hard cut on a noun change | a `whip` or `move` between stations, or a plain cut between framings; never to black or a dead frame |
| Whip | `ease: "whip"`, ≤ 3 per film, only where the idea changes |

So a station can last 4–8 s while the picture still renews every 2–3 s. Hopping stations every
1–2 s is frantic; a station with no new information for 5 s is dead.
