# Building product motion on the engine

```js
import { createStage } from "<E>/core/lib/stage.js";
import { spring, track, swapAlpha, indicator, SPRINGS } from "<E>/core/lib/motion.js";
import { makeClip } from "<E>/core/lib/clip.js";
import { makePhone } from "<E>/core/lib/phone.js";
import { el, maskedLine, lineIn, makeCounter } from "<E>/styles/motion-graphics/lib/text.js";
import { drawRays, makeDust, makeEngraving } from "<E>/styles/motion-graphics/lib/scenes.js";
```

## Helpers

| Helper | Use |
|---|---|
| `el(parent, css, text)` | an absolutely positioned element, built once |
| `maskedLine(parent, words, css, wordCss)` | a line whose words rise out of a mask; `"|"` breaks the line; returns `{ line, inners, words }` |
| `lineIn(line, t, { tIn, tOut, stagger = 0.08, enter, exit })` | words in staggered from `tIn`, out by rising away from `tOut` |
| `makeCounter(parent, { digits, css })` | odometer: each digit rolls continuously with the value |
| `indicator(t, stops, width)` (motion.js) | a selection bar that stretches between tabs |
| `swapAlpha(t, tIn, tOut)` (motion.js) | content inside a morphing container |
| `drawRays`, `makeDust`, `makeEngraving` | light rays in the theme's glow, dust in a beam, an image cut line by line |
| `makePhone`, `makeClip` (core) | the device and the real take inside it |

## Kinetic type

- One statement per beat, ≤ 6 words, ≥ 96 px at 1080 wide; key word may take the accent.
- Enter by mask rise or letter set; settle with tracking; exit by moving, not fading.
- Two type registers at most: a huge statement face and a small label face (mono or sans).
- For a narrated film the caption is the engine's `say` (2–4 words, fixed lower spot); a
  statement is a separate, larger element, never a duplicate of the caption.

## UI morph loop (one shape never cuts)

1. Write the state list first (8–12 states for 12–15 s, ~1–1.5 s each).
2. One container: size, radius and fill interpolate on one spring per transition (`track`).
3. Content inside swaps only after the morph settles (`swapAlpha`); numbers count, lines draw.
4. A cursor or touch causes every change (press → state change), so each morph reads as an action.
5. Last frame equals first; check with `sheets.mjs --loop`.

## The camera around the device

- Spring zooms into what the voice or the statement names (`heavy` spring on scale), travel, a
  slight roll, a 3D tilt (`rotateX/Y` on `phone.el`), device swaps by a camera move.
- No static hold over ~2 s; no punch-in (an instant scale jump); the device's screen stays whole
  and upright enough to read.
- The bridge between the design world and the device is one move inside the film's world (light
  falls on the screen, a tear reveals it, the camera travels to it), not a cut to a floating phone.

## Product checks (add to the critic's hunt list)

- The product appears as a real take with visible touches; never invented UI.
- Each feature named in the script is shown in use, readable for ≥ 3 s on the phone sheet; the
  screen header is never covered by a caption.
- No bad data visible in any frame (read every word of every take).
- After one watch a viewer can name what the product does and at least one feature.
- No corner labels, frame borders or watermark-like text (the giveaways of template video).

## Studied references

`inspirations/twoclipping-ui-morph.md` (one shape never cuts) · `inspirations/claude-pop-donald.md`
(fixed palette, two type registers, bookend) · `inspirations/oozn-steve-jobs.md` (chapters, year
counter, beat-locked cuts) · `inspirations/mablesjoseph-watercolor.md` (colour script per act,
light as meaning). Grammar only; never their content, palette or characters.
