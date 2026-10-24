# Motion craft: physics, depth, camera and look

How a professional short-form edit moves, measured, and how to build it with this engine. Style-free:
nothing here is a palette, a font or a subject; every number is a mechanism that works in any look.

Source: the S5 study (2026-10-24/25). A 34.6 s professional reel was rebuilt from scratch, measured
frame by frame against its reference with `tools/critique/motion-measure.py`, judged by the owner twice:
first pass "bem abaixo da média — animação, física dos objetos, movimentação, filtros visuais";
second pass, built on this file, "resultado satisfatório, 8/10". Measured misses fell 137 → 53.

## Why the first pass failed (read first)

| Miss | Cause | Fix (section) |
| --- | --- | --- |
| Objects drifted in; the pro edit throws them in and they land | hand `lerp`/`interpolate` tweens: constant speed, no overshoot, no settle | §1 |
| Small, sharp foreground; the pro edit fills the frame with big blurred pieces | sizes guessed from a text breakdown | §2 |
| Camera eased like a Ken Burns; the pro camera punches in steps and opens close | camera keys by eye | §3 |
| Flat, cold, too sharp, single-pixel grain | grain + CSS vignette only; ~80 GPU effects unused | §4 |
| All of it passed on contact sheets | a 2 fps sheet shows layout, never speed, overshoot or blur | §6 |

## 1. Physics: every move is an event with mass

Use `src/physics` (pure in frame, fps, seed; times in seconds, so the same call works at 16, 24 or 30 fps).
Never animate a moving piece with a linear or symmetric ease.

| Event | Primitive | Measured target (pro reel) |
| --- | --- | --- |
| A piece arrives (frame, card, photo, object) | `throwIn` — arc + spin + overshoot settle | crosses the frame in **0.12–0.25 s**; peak speed ≈ half the frame width per frame at 16 fps; settles in **~0.25 s** (damping 0.45–0.6); arrives **already in flight at the cut** (start 1–4 frames before it) |
| Overshoot on landing, scale pop, gesture | `bounce` | 5–30 % overshoot (damping 0.6 → ~10 %, 0.35 → ~30 %) |
| Leaves, scraps, paper falling | `flutter` — sway, spin, 3D flip | sway 0.3–0.9 Hz; large pieces fall ≈ 0.5–0.6 frame widths per second; start the shower before frame 0 so frame 0 is already full |
| Floating objects (clocks, frames, ornaments) | `drift` | 1–4 px amplitude, 0.3–0.5 Hz; more reads as wobble and keeps the shot from settling |
| A slow carry to a place | `hover` (ease in, then drift) | when `throwIn` is too violent |
| Hits on the beat, cuts, slams | `impactShake` | 10–40 px, decaying in ~0.2 s |
| A thing falls out of frame | gravity (`y = ½·g·t²`) with tumble | no bounce; it leaves |
| A support pulled from under an object | the support moves, the object keeps its place one beat (inertia), then falls | |

Secondary motion: stagger a group's arrivals 1 frame apart at 16 fps (~0.06 s); rotation lags position (rotation spring a little looser); a puppet's forearm follows the upper arm 2–5 frames late.

## 2. Scale and depth

- **Measure before sizing.** Hero subjects fill **50–80 % of frame height**; framed pictures on a wall are ~35 % bigger than a first guess. Measure on full-resolution frames (head height ÷ frame height, object width ÷ frame width) and size every cut-out from those numbers. A generated cut-out has transparent padding: measure its visible alpha, not its box.
- **Foreground is big and blurred.** Pieces passing in front (leaves, fragments, frames) are 30–50 % of frame width and depth-blurred; the background is soft. A flat stack of sharp cut-outs reads as cheap.
- **Composition is part of the edit.** When one picture takes the place of part of another (a frame where a head was), cut that band out of the first and put the second in its place on the beat — never two pictures floating side by side.
- **Type in depth.** Words sit between planes (behind falling leaves, over a figure); a word must still read whole — never hide letters behind a body unless the reference does.

## 3. Camera

- **Every held shot moves.** Pushes of 3–15 % over the shot; nothing static.
- **Punch-ins are steps, not eases.** A punch is a 5–35 % scale jump that lands in 1–2 frames and settles (decelerating step); an end card can carry several, on the voice's beats, in and back out. A spring fits a punch poorly: use a per-frame scale table.
- **Openings can pull back.** Many shots open close and pull out fast in the first 2–3 frames (−10 to −30 %), then push slowly.
- **Measured camera tables.** When a target motion exists on video, `tools/critique/motion-measure.py` → `frames.csv` (`zoom_step_pct`, `tx`, `ty` per frame, native px) → `tools/critique/camera-table.py` → `tableAt` in `src/camera`. Apply about the frame centre with `transformOrigin: "0 0"` (a centred origin applies the zoom twice).
- **Whips and spins** decay over ~5 frames; smear the fast frames (motion blur or a directional blur scaled by the step).
- The camera reads the composition's fps: a 16 fps film times its eases in seconds and holds poses on its own clock.

## 4. Look, per shot

The look is not one film-wide filter: the pro reel's grain runs 1.2–7.9 and sharpness 430–1340 across shots.

- `Grade` (`src/texture`, one GPU pass through `HtmlInCanvas`): warmth, contrast (start neutral 1.0; 1.18 overshot every shot), saturation, bloom (intensity ~0.2, threshold ~0.8 — more paints a spotlight blob on flat grounds), lens edge blur (sharp centre, ~14 px at the edges), chromatic aberration (1–2, spike on impacts), vignette (~0.15). Put one `Grade` and one `Grain` per shot (`look` on the shot), not one over the film.
- `Grain` with `size` ~1.3 px: video-compressed grain is clumpy. Single-pixel noise multiplies measured sharpness 2–5x and fights every blur.
- Plates must be at least render size (1080×1920 for 9:16; larger if the shot pushes in). An 864×1536 plate pushed 1.3–1.5x reads 3–5x softer than the target.
- Calibrate: measure grain → set it; then sharpness → set `soften`; then contrast/warmth.

## 5. Transitions and effects come from the GPU library

Before writing an effect, read `.agents/skills/remotion-markup/effects.md` and `html-in-canvas.md` (ad-fontes path) — ~80 effects ship with Remotion 4: `zoomBlur` (radial zoom-through), `lensBlur` (depth/defocus pull), `glow`, `lightLeak`, `chromaticAberration`, `radialProgressiveBlur`, `roughenEdges`, `tear`, `turbulentDisplace`, `dropShadow`, `bevelAlpha`… An effect's `HtmlInCanvas` inside a shot's `Grade` renders fine. `HtmlInCanvasMotionBlur` gives per-object motion blur.

Transitions measured on the pro reel: burn/tear holes growing over ~8 frames (0.5 s); zoom-through a keyhole (plate fills the frame at its first frame, the next scene already visible through the hole, scale ×1 → ×6, halves split out); whip slide up with the bottom going dark (2 frames); a dark pillar sweeping across with the cut under it.

## 6. Judge motion at full rate

- Contact sheets (2 fps) are for layout only.
- Every entrance, landing, punch and camera move: a **12-frame consecutive strip** (`sheets.mjs --strip <t>`); read it frame by frame — how many frames to arrive, does it overshoot, does it settle, is the foreground blurred, does the hero fill the frame.
- In a strip, check whether background features move: if not, the object moves, not the camera.
- With a target video (a reference the brief names, or a previous approved film): `motion-measure.py <mp4> --shots scene.ts --out out/measure/x`, then `--compare ref x` → per-shot rows flagged 🔴 > 2x off. Read the legend: camera columns are total zoom %, zoom mean/peak %/f, peak position, zoom done at 50 %, punch-ins, pan mean/peak px/f, rotation; all px are native. Rows on a cut or inside a blur transition are tracker noise; a big textured mover drags the tracker (read those from the pictures).
- Side by side for the owner: `tools/critique/vs.sh ref.mp4 clone.mp4 <from> <to> out.mp4 [--slow] [--audio]` — never a range cut carrying a whole film's audio (it froze in the owner's player).

## 7. People in motion

A cut-out rig (`src/rig`) gets camera, composition and gesture timing close but reads as puppets: no head turns, rigid sleeves past ~35°, a static face. Generate each figure with its arms held clear of the body, cut limbs with `tools/kit/cut-limbs.py`, put gesture beats on the voice with `bounce`, idle sway with `drift`, pass `stepFps` = the film's rate (the default 12 steps the pose). A walk away from camera: scale growth + 2 steps/s bob + weight shift + slight roll. Say in the review what the rig cannot do; AI video is not an option.

## 7b. Remotion traps that cost renders

- Pictures through `<Img>`, never a raw `<img>` or a CSS `mask-image: url()` alone: the renderer does not wait for them and frames render empty. Preload a mask by also mounting it in a hidden `<Img>`.
- `transformOrigin: "0 0"` for world/camera transforms.
- A big render is fast (~12 s for 554 frames at 1080×1920 on this Mac) when nothing else uses the GPU; overlapping image generation or music generation makes everything 2–5x slower.
