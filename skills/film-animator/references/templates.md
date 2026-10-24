# Templates

Four working papers of the animator. The gates read the film, not these; they exist so the rhythm, the camera and the trace are decided before they are drawn. Thresholds are `NORMS` keys (`tools/checks/norms.mjs`).

## 1. Event ledger (`crew/animation-ledger.md`, written before the first line of the film)

One row per sheet row (`b01`, ...), in time order. An event is a hero change, a caption chunk change or a hard cut (`camera.shot`); events closer than `NORMS.rhythm.eventMergeS` are one edit (`registration.md` 2).

| row | t0-t1 | words | hero id (new / same) | caption chunks (start s: text) | cut? | events (s) | zoom kind and target | start key (s) | `join` / `device` |
|---|---|---|---|---|---|---|---|---|---|
| b08 | 23.33-25.67 | 7 | new `hero-b` at 23.30 | 23.33 "..." / 24.33 "..." | shot 2 at 23.30 | 23.30 (cut + chunk, merged), 24.33 | `push-in` `hero-b.part` | 23.30 (at the cut) | cut |

Totals, computed from the events column before drawing (the gates repeat them on the trace):

| Check | Computation | Bound |
|---|---|---|
| R1 | film duration / number of events | `NORMS.rhythm.aslRange`; and no stretch of `NORMS.rhythm.maxStillHoldS` with no event while the camera holds |
| R2 | events in every 10 s window that ends before the last 5 s | `NORMS.rhythm.eventsPer10s` |
| R3 | spoken words of `words.json` / number of events | `NORMS.rhythm.wordsPerEvent` |
| R4 | events per second in the last 5 s / events per second before | at most `NORMS.rhythm.endSlowdown` |

A row that gives no event of its own (a held plate with no chunk starting in it) is a gap the ledger shows. Fixes in order of ownership: caption chunking and the cut times are yours; a row that holds a picture too long or packs too many words is the storyboard's (route it, do not retime a sheet row); a clause with no new noun is the writer's.

## 2. Camera key table (`crew/animation-notes.md`, one line per row that moves)

| row | kind | target part | zoom from -> to | ease (`CamKey.ease`) | start frame = key frame - reach | lands (95 %) | cut? | target box at the key frame (`traceAt`, frame px) |
|---|---|---|---|---|---|---|---|---|
| b08 | push-in | `hero-b.part` | 1.00 -> 1.18 | `glide` | f699 (23.30 s, at the cut) | 23.92 s | cut at f699 | [440, 880, 200, 160], inside the safe box |

The reach per ease and the stacked-key variants are in `devices-rhythm-camera.md` (engine facts). The target column is read from the real film's trace (`traceAt(frame).items`, the `<row id>-target` item) at the key frame and at the row's end (T9 covers the whole span).

## 3. Registration checklist (per row, before its stills)

- [ ] hero in the trace from the row's start (or its cut frame), alpha >= `NORMS.frames.heroAlpha`, one hero at a time
- [ ] supports, pieces, marks, lettering, ground traced with the roles of `registration.md` 2
- [ ] `<row id>-target` traced from the same `PARTS` entry (`scene.ts`) the component and the stills use
- [ ] captions: unique id, `captionItem` with `text`, `box`, `cap`, `color`
- [ ] every hard cut is in `CUT_FRAMES` (`scene.ts`) so `shotAt` bumps `camera.shot`
- [ ] one clock for camera, pieces and trace (`stepFrame(frame, 30, 12)` only if the brief says so)
- [ ] a still at the end of the move and one at the key frame, opened as images (the gate does not see a wrong part framed); the self-check loop of SKILL.md ran

## 4. `crew/animation-notes.md`

```
# Animation notes: <film>

Register: A (or the brief's). Stepped motion: yes/no (why: brief / style bible line).
Gate lines: animatic <summary line>; draft <summary line>.

## Rows that move
<the camera key table, section 2>

## Intent per row (one paragraph each, only where something is not obvious)
b07: caption-as-the-motion over the held plate; b08: cut to hero-b on its name and a push to the part, landed while the chunk is read.

## Fixes
b05: target cropped at the forehead (T9). Camera centre moved to the part, z 1.7 -> 1.4. Re-run: PASS.

## Left open (named to the Director with the reason)
T6 during the dissolve in b19 (hero below alpha for 0.8 s; the dissolve is the brief's).
```

The notes record intent and the fixes made; the gate files hold the readings.
