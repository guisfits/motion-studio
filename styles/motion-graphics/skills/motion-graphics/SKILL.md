---
name: motion-graphics
description: Use when making or judging UI and product motion graphics — product reels, app or feature clips, launch films, kinetic typography, UI morph loops, title cards, logo stings, or any shot of a real app or website inside a device frame with a finger or cursor — or when a product video feels like animated screenshots.
---

# Motion graphics (UI, product, kinetic type)

The product is the hero and the motion explains it. Two registers, never mixed in one frame:
**the product shown as it is** (a real recording of real use, sober, whole) and **the design
around it** (type, camera, light, transitions), where all the creativity lives.

**Project overlay.** Brand (palette, faces, wordmark), devices, audience, voice, CTA and outro
belong to the project's overlay skill; it overrides this skill where it says so. Narrated
product explainers also follow `explainer-script`; editorial-collage passages follow
`vox-style-animation`.

## Patterns

| Pattern | Shape | Good for |
|---|---|---|
| Product reel | hook (the problem in ≤ 5 words of kinetic type, or one spoken sentence) → the device found in the film's world → 2–3 features, one real take each, held to be followed → one proof (a number, a quote) → CTA | launch, promo |
| One-shape morph | a single container never cuts: it morphs through 8–12 UI states, a cursor or touch causes each change, last frame = first | feature loops, feeds |
| Kinetic statement | type states the idea; words rise from masks, track, settle; one statement per beat | title cards, launch films |
| Layer by layer | one object, each beat goes one level deeper in the product | showing depth of a feature |

## Norms

| Dimension | Norm |
|---|---|
| Length | Reels 45–60 s (90 max); a loop 10–15 s; a sting 2–4 s |
| Hook | complete by 4.5 s; something already moving on frame 0; never a title card on a gradient |
| Cadence | dynamic, not frantic: a beat 1.6–3.2 s on average; each feature take readable ≥ 3 s; whips ≤ 3 |
| Frame | ≤ 3 elements, one accent; one big thing per beat; nothing readable in the 9:16 UI zones |
| Type | statements ≥ 96 px at 1080 wide, ≤ 6 words; labels ≤ 3 words; nothing under 44 px |
| Product | whole screen in a device frame, a real take with touch indicators; never screenshots animated, cropped panels, UI pieces flying out, or labels over the UI |
| Camera | always alive around the device: spring zooms into what the voice names, travel, slight roll, device swaps; no static hold > ~2 s; never a punch-in |
| Sound | voice-led if narrated; UI sounds soft and rare (≤ 1 per 4–6 s), 12 dB under speech; -14 LUFS |

## Motion that feels expensive

- **Springs only** (`heavy` for big type and devices, `default` for cards and camera, `snappy`
  for UI parts). **Retarget, don't restart** (`track`). **Stagger** groups 30–60 ms, leader first.
- **Kinetic type, not fades**: words rise from a mask, letters set one by one, tracking settles.
  Opacity alone is a fallback.
- **Morph containers**: size, radius and fill move together; content swaps only after the morph
  settles (`swapAlpha`); text never overlaps during a swap.
- **Match cuts**: the shape that ends a shot starts the next. Transitions carry meaning.
- **Exits are moves** (sink, rise out of the mask), never a fade to a ghost.
- **Fast moves strobe**: > ~60 px per frame ghosts in the blended final; heavier spring, shorter
  path, or render the range `--sub 8`.

## Workflow

1. Script (`explainer-script`) or a state list for a loop: the list of states is the spec.
2. Capture real takes: `references/capture.md`.
3. Style guide: every choice names its source (a theme token, a named inspiration's grammar).
4. Build on the engine (`motion-engine`): `core/lib/phone.js`, `clip.js`, `motion.js`,
   `styles/motion-graphics/lib/text.js` (`el`, `maskedLine`, `lineIn`, `makeCounter`) and
   `scenes.js` (`drawRays`, `makeDust`, `makeEngraving`): `references/building.md`.
5. Critique loop: stills → draft → sheets; score with `vox-critic`'s method (its rubric's
   Readability, Text, Composition, Cadence, Motion, Voice, Mix, Ending apply unchanged) plus the
   product checks in `references/building.md`.
