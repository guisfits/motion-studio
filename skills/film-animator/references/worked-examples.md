# Worked examples

Project-agnostic: invented ids and a generic voice. Numbers were computed with the engine's own functions (`spring`, `NORMS`, the table's camera) while writing this file.

## 1. Two sheet rows, from ledger to keys to registration

Sheet (storyboard v2, one row = one picture event). The voice runs at 3.0 words/s; word `n` starts at `21.00 + (n - 1) / 3`.

| row | `t` | words | hero | `key[0]` | `zoom` |
|---|---|---|---|---|---|
| b07 | [21.00, 23.33] | 7 (words 1-7) | `hero-a` (new) | word 1, 21.00 | `hero-a.part`, `drift` |
| b08 | [23.33, 25.67] | 7 (words 8-14) | `hero-b` (new) | word 8, 23.33 | `hero-b.part`, `push-in` |

**Ledger** (`templates.md` 1). Caption chunks of 3, 4, 3 and 4 words start on words 1, 4, 8 and 11: 21.00, 22.00, 23.33, 24.33. The picture changes land on the key words, a frame or two ahead (inside `NORMS.sync.heroWindowFrames`): the cut to `hero-b` at 23.30 sits 0.03 s from the chunk at 23.33, so by `NORMS.rhythm.eventMergeS` they are one edit.

| Event | At | Source |
|---|---|---|
| cut onto `hero-a` + chunk 1 | 21.00 | `camera.shot` and caption id (merged) |
| chunk 2 | 22.00 | caption id |
| cut onto `hero-b` + chunk 3 | 23.30 / 23.33 | `camera.shot`, hero id, caption id (merged) |
| chunk 4 | 24.33 | caption id |

Four events over the 4.67 s of the two rows: 1.17 s each (`NORMS.rhythm.aslRange`), 8.6 per 10 s (`NORMS.rhythm.eventsPer10s`), 14 / 4 = 3.5 spoken words per event (`NORMS.rhythm.wordsPerEvent`). b07 holds `hero-a` for 2.3 s and the chunk swap at 22.00 is its motion (caption as the motion); the row also carries a drift so the plate is never still.

**Camera keys.** The row opens with a cut onto its hero, so the target is composed inside `stage.box` on the cut frame and the push starts at the cut and lands one reach later (`devices-rhythm-camera.md` 2, punch-in section):

```js
table.camera([
  /* ... b07: drift ... */
  [23.30, { ...st.view(px, py, { z: 1.00 }), cut: true }],        // camera.shot -> 2
  [23.30, { ...st.view(px, py, { z: 1.18, ease: "glide" }) }],   // push onto hero-b.part
]);
```

Measured on the real table with this key pair (a cut to x 1500, then the push): z at the cut frame 1.008 (the breathing), 1.125 at 23.60, 1.182 at 23.92 (the `glide` 95 % point is 0.62 s after the key), 1.190 at 24.12. The x of the cut frame is the cut key's x: nothing from the move in flight carries across. T7 reads b08 as `push-in`: 1.18 / 1.00 inside one shot = +18 %, over `NORMS.camera.emphasisMinScaleDelta`; the cut is not counted as a move because `camera.shot` changed.

**Registration for b08.** `hero-b` (role `hero`) from 23.30; `b08-target` (role `target`) with the part's frame box from the same `PARTS` entry as `partAt`, from the first key word (23.33) to the row's end (25.67), inside the safe box the whole time; `cap-3`, `cap-4` (role `caption`) each with `box`, `text`, `cap` and `color`; the ground as `ground-2`.

## 2. A cropped zoom target (T9), fixed before anything else

Defect (a review note in stage 2, or `partAt` in the stills): on row b05 the push ends with the portrait cropped above the eyes. The sheet says `hero: { asset: "portrait-a" }`, `zoom: { target: "portrait-a.eyes", kind: "push-in" }`; the film registers `b05-target`. A crop that shows only at the end of the move is a stage-2 defect (the camera keys); one already in the animatic still at `key[0]` is stage 1's layout.

1. Measure, do not guess. Frame is 1080 x 1920 and `stage.box` is x 70-915, y 220-1520 (845 x 1300, `core/lib/layout.js`). The eyes sit at world (1200, 900); the camera key was centred at (1200, 200) with z 1.4. The projection of `registration.md` 4 (no roll): `y = 960 + (900 - 200) * 1.4 = 1940`. That is below the box bottom (1520) and below the frame (1920): T9 red, T5 usually follows because the face left the frame.
2. Centre the camera on the part: key (1200, 900). Now `y = 960`, `x = 540`: the part is at the frame centre.
3. Check the zoom fits the context: the face is 420 px wide, so `z <= 0.8 * 845 / 420 = 1.61`; z 1.4 passes. If the needed delta (`NORMS.camera.emphasisMinScaleDelta`) cannot be reached inside that z because the picture is too small, that is a defect of the asset: route it to the archivist through the Director, with the row id.
4. Re-render the stills at the key word and at the end of the move, read `partAt` at both, look at both images.
5. Re-run `node <engine>/core/checks/run.mjs <film> --stage animatic` (`--stage draft` once the draft is rendered). Write the fix in `animation-notes.md` ("b05: target cropped, camera centre (1200, 200) -> (1200, 900), z 1.4 kept"). Only then touch b06.

The point of the order: a crop left "for later" is what a viewer sees first (postmortem C7: a portrait cut at the forehead, held 4 s), and one red can hide another because most codes report only their first occurrence (`registration.md` 5).
