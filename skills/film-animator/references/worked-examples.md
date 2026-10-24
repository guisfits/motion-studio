# Worked examples

Project-agnostic: invented ids and a generic voice. Numbers were computed with the engine's own functions (`spring`, `NORMS`, the camera's easing in `src/camera/presets.ts`) while writing this file.

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

**Camera keys.** The row opens with a cut onto its hero, so the target is composed inside the safe box on the cut frame and the push starts at the cut and lands one reach later (`devices-rhythm-camera.md` 2, punch-in section). Two keys on the same frame are a cut: `scene.ts` also lists the frame in `CUT_FRAMES`, which `trace.ts` hands to `shotAt`:

```ts
// scene.ts: frames from the sheet's seconds (FPS = film.fps)
export const CUT_FRAMES = [..., Math.round(23.3 * FPS)];             // camera.shot -> 2 at f699
export const CAMERA_KEYS: CamKey[] = [
  /* ... b07: drift ... */
  { frame: 699, x: HX, y: HY, zoom: 1.0 },                           // the cut: key the pose you want on that frame
  { frame: 699 + 19, x: HX, y: HY, zoom: 1.18, ease: "glide" },      // push onto hero-b.part, lands ~one reach later
];
```

Measured with `cameraAt` on a key pair like this (a cut to x 1500, then the push; probe run while writing this file): at the cut frame the pose is exactly the new key (zoom 1.000, x 1500), the zoom is 1.033 five frames later and 1.180 on the last frame of the leg; the cut frame reports a velocity of ~1500 px/frame (so it is a cut, and never blurred), and the frame after reports under 1. The x of the cut frame is the cut key's x: nothing from the move in flight carries across. T7 reads b08 as `push-in`: 1.18 / 1.00 inside one shot = +18 %, over `NORMS.camera.emphasisMinScaleDelta`; the cut is not counted as a move because `camera.shot` changed. A 19-frame `glide` leg reaches 95 % of its change at 0.81 x 19 = frame 15 of the leg (0.51 s), settled while the chunk is read.

**Trace for b08.** `hero-b` (role `hero`) from f699; `b08-target` (role `target`) with the part's frame box from the same `PARTS` entry the stills use (`projectBox` of the part's world box through `view`), from the first key word (f700) to the row's end (f770), inside the safe box the whole time; `cap-3`, `cap-4` (role `caption`) each from `captionItem` (`box`, `text`, `cap`, `color`); the ground as `ground-2`.

## 2. A cropped zoom target (T9), fixed before anything else

Defect (a review note in stage 2, or the `b05-target` box in `traceAt` against the stills): on row b05 the push ends with the portrait cropped above the eyes. The sheet says `hero: { asset: "portrait-a" }`, `zoom: { target: "portrait-a.eyes", kind: "push-in" }`; the film traces `b05-target`. A crop that shows only at the end of the move is a stage-2 defect (the camera keys); one already in the animatic still at `key[0]` is stage 1's layout.

1. Measure, do not guess. Frame is 1080 x 1920 and the safe box is x 70-915, y 220-1520 (845 x 1300, `layoutOf("9x16").safe`). The eyes sit at world (1200, 900); the camera key was centred at (1200, 200) with z 1.4. The projection of `registration.md` 4 (`projectBox`, no roll): `y = 960 + (900 - 200) * 1.4 = 1940`. That is below the box bottom (1520) and below the frame (1920): T9 red, T5 usually follows because the face left the frame.
2. Centre the camera on the part: the `CamKey` is `{ x: 1200, y: 900, zoom: 1.4 }`. Now `y = 960`, `x = 540`: the part is at the frame centre.
3. Check the zoom fits the context: the face is 420 px wide, so `z <= 0.8 * 845 / 420 = 1.61`; z 1.4 passes. If the needed delta (`NORMS.camera.emphasisMinScaleDelta`) cannot be reached inside that z because the picture is too small, that is a defect of the asset: route it to the archivist through the Director, with the row id.
4. Re-render the stills at the key frame and at the end of the move (`npx remotion still studio/index.ts F-<Id> out/b05.png --frame=N --gl=angle`), read the `b05-target` box from `traceAt(N)` at both, open both images.
5. Re-run `FILM_STAGE=animatic npx vitest run studio/films/<slug>` (`draft` once the draft is rendered). Write the fix in `animation-notes.md` ("b05: target cropped, camera centre (1200, 200) -> (1200, 900), z 1.4 kept"). Only then touch b06.

The point of the order: a crop left "for later" is what a viewer sees first (postmortem C7: a portrait cut at the forehead, held 4 s), and one red can hide another because most codes report only their first occurrence (`registration.md` 5).
