---
name: film-clone
description: Use when a film must reproduce an existing reel or video shot for shot ("clone this reel", "recreate this video", "same edit as this reference", "imitate this creator") — from scratch, with our own pictures, voice and sound — or when a clone was judged weak and must be studied and improved. Owns the reference study (breakdown, measured motion), the per-shot rebuild loop and the clone's benchmark. Hands art to film-art-director/archivist rules, sound to film-sound, components to film-animator.
---

# film-clone

A clone is training: the goal is to learn how a good edit is made, then make our engine and skills
able to make it. Copy the **edit** (timing, composition, motion, physics, depth, type, transitions,
look); never the reference's pictures or sound.

## What went wrong the first time (S5, owner verdict "bem abaixo da média")

Read these before anything; each is a rule below.

| Miss | Why it happened | Rule |
| --- | --- | --- |
| Objects drifted where the reference throws them in over 2–4 frames with spin and overshoot | motion hand-tweened with lerps; checked on 2 fps contact sheets that cannot show speed | **Rule 3, Rule 5** |
| Small, sharp, few foreground pieces; the reference fills the frame with huge blurred ones | builders sized by eye from a text breakdown | **Rule 2** |
| Compositions invented (a perspective wall for a front-on wall; a head beside the frame that should replace it) | generated plates were prompted loosely, then laid out to fit them | **Rule 1** |
| Flat, cold image; the reference is warm, contrasty, glowing | grain + CSS vignette only; ~80 GPU effects unused | **Rule 4** |
| 8 h and a frozen machine for one draft | 5 agents + image/music generation + 9-tab renders at once | **Rule 6** |
| "The Starry Night" shown as Starry Night Over the Rhône | Commons title trusted, picture never looked at | **Rule 1** |

## The loop

1. **Study** the reference (no building yet).
   - Frames: `ffmpeg -i ref.mp4 frames/%04d.jpg`; native fps (many AI-collage reels are 16 fps: render at the same rate).
   - Breakdown (`crew/reference-breakdown.md`): cut table to the frame, per shot the layers back to front, camera, element motion, type, transition, grade.
   - **Treat the breakdown as a draft**: its eyeballed numbers were wrong in 5 of 16 shots (sizes, pushes, a 308 px pan never mentioned). **Check every number against full-resolution frames** before building (S5: the S15 breakdown said pieces ~14 % W and a 0.45 group scale; the pixels show ~33 % W and a ×1.345 punch).
   - **Measure**, don't eyeball: `tools/critique/motion-measure.py ref.mp4 --shots scene.ts --out out/measure/ref` → per-shot zoom curve, peak object speed (px/f), settle frames, sharpness and edge blur (depth of field), contrast, warmth, grain. These numbers are the spec. `frames.csv` `zoom_step_pct` per frame, multiplied as `Π(1 + z/100)` over a shot, IS the reference's camera path: use it as a per-frame scale table (S5 S15/S16 matched within 5 % this way).
   - Voice: transcribe with word times; our take (OmniVoice) phrase by phrase, each phrase anchored on the reference's start time (`voice/build-vo.py`: drift ≤ 0.25 s).
2. **Pictures per shot**, matched to the reference's composition (Rule 1).
3. **Build one shot at a time** with the engine (Rules 2–4). For strips render that shot's range only (`--frames=A-B --scale=0.5`, ~20 s); `motion-measure` needs the full film at full size.
4. **Compare at full rate** (Rule 5) and with the measures; fix; at most 3 rounds per shot.
5. **Send the shot** to the owner as soon as it passes: `tools/critique/vs.sh ref.mp4 clone.mp4 <from> <to> out.mp4 [--slow] [--audio]` (never a range cut carrying the whole reference audio: it freezes in players). Then the next.
6. **Fold every lesson** into a skill rule, a component or a tool the same day; record gaps in `crew/notes-*.md` and in the benchmark table (✅ / 🟡 / ❌ per shot, with the cause).

## Reading the measures (`compare.md`)

- Camera columns, in order: total zoom % (negative = pulls out), zoom mean / peak %/f, where the peak sits, zoom done at 50 % time, punch-ins, pan mean / peak px/f, rotation deg. A hard cut inside a span reads as one huge zoom/pan step: ignore that frame.
- Every px number (pan, object energy) is in the video's own native pixels, for the reference and the clone alike — never rescale them (S5: a builder doubled a camera table on a false "the reference is 540 wide", and the pan read 2x until it was halved). `tx`/`ty` are residuals about the frame centre: compose them with each step's scale when you build a camera table.
- The tracker follows the biggest moving thing: a spinning or thrown object can read as camera rotation/pan (S5 S06: "436° and 1600 px/f" was the spinning brain). Before copying a camera row, check in the strip that background features move too.
- Camera tables: skip rows whose method is `ecc` or `none`, drop a shot's last row when the next shot starts on it, and check each pan jump against the strip (people entering read as pan). Apply a table as `transformOrigin: "0 0"` + translate/scale about the frame centre — a centred origin applies the zoom twice.
- Frames inside a transition (blur, whip, keyhole) and on a cut are tracker noise (S05 f148-152 read −50 %/f): read those from the pictures. A cut's step also changes composition — match the new framing, not the step size.
- Sharpness counts grain: single-pixel noise multiplies it. Calibrate grain first (`Grain size` ~1.3 px for video-compressed grain), then softness; both are per shot (`look` in `scene.ts`), never only film-wide.
- A clone sharpness < 0.5x the reference means the plate is too small: generate at the render size (1080x1920 or larger for a pushed-in shot) or upscale it. Cost on this Mac: ~2.5 min per 1080x1920 plate, 40–60 s per 1024² cut-out, queued on the shared heavy-job lock — batch a shot's pictures in one call and plan for the wait.

## Rules

1. **Composition first, matched.** Prompt each plate with the reference's framing words (front-on / profile / top-down, subject size as % of frame, where it sits, camera height). A subject that the reference composites (the frame *replaces* the head) is generated or cut as one piece in that place. Look at every picture before using it (generated or downloaded); a title or file name is not proof. Faces: say the exact view ("strict left profile, nose pointing left, one ear visible"); a loose "profile" prompt gives a front-facing head. A hand holding a small object comes out with the object toy-sized: generate the object separately and draw it behind the fingers. A shot where one picture replaces part of another (S5: the framed painting replaces the head): cut that band out of the first picture and put the second on screen in its place at the beat.
2. **Scale and depth like the reference.** Measure first: the subject's height and width in reference frames, the head-to-frame ratio; size every cut-out from those (a generated cut-out has transparent padding: its box width is not what shows — measure the visible alpha). Hero ≥ the reference's measured fill (usually 50–80 % of frame height). Foreground pieces (leaves, fragments, frames) are big (30–50 % of width) and blurred by depth; background soft. Use depth blur, never a flat stack of sharp cut-outs.
3. **Physics, never lerps.** A camera that was measured follows its measured path (the table above; punches are decelerating steps a spring fits poorly). Every object entrance, landing, fall and float uses `src/physics`: `throwIn` (arc + spin + overshoot settle, 3–6 f at 16 fps), `bounce` (5–30 % overshoot), `flutter` (leaves: sway 0.3–0.9 Hz, spin, 3D flip), `drift` (floating objects), `impactShake` on hits. Match the measured peak speed and settle frames. Falling foreground leaves in S5 fell 35–40 px/f at 16 fps for large ones; start a shower before frame 0 so the first frame is already full. In a strip, check whether background features move: if they don't, it is the object moving, not the camera. Fast movers get motion blur (`@remotion/motion-blur` `HtmlInCanvasMotionBlur`, shutter 180°).
4. **The look is part of the edit, per shot.** The film's `Grade` (warmth, contrast, bloom, lens edge blur, aberration, vignette) and stepped `Grain` take per-shot values (`look` on the shot in `scene.ts`): the reference's grain, sharpness and contrast vary shot to shot (S5: grain 1.2 on clean paper, 5.6 on a desk); tune each to its measured row. Transitions and lens moves use the GPU effects (`@remotion/effects`: zoom-blur, lens-blur, light-leak, roughen-edges, tear, glow, turbulent-displace) — read `.agents/skills/remotion-markup/effects.md` and `html-in-canvas.md` before writing your own. An effect's `HtmlInCanvas` inside the film's Grade renders fine (S05 zoomBlur).
5. **Judge motion at full rate.** Contact sheets (2 fps) show layout only. For every shot also make a consecutive-frame strip of reference vs clone (`ffmpeg … trim=start_frame=$A:end_frame=$((A+12)), tile=12x1` for both, vstack — compute the end frame in the shell, ffmpeg won't; in zsh write `${A}`, since `$A:e…` is a history modifier) and read it frame by frame: entry speed, overshoot, spin, depth blur, fill. Then compare `motion-measure` numbers (🔴 > 2x off). Reference frame files are 1-based (`frames/0001.jpg` = frame 0): build strips by file name, or with `trim=start_frame` on the mp4 — never mix the two. A big textured object or a revolving wall drags the tracker: there the pictures give the push, not the numbers.
6. **Resources.** Parallel agents share `/tmp`, the scratchpad and `out/`: every agent writes its own prefixed files and renders to a private output name. One heavy job at a time on the machine (render, image, music, TTS: they share `tools/render.sh`'s lock); drafts at `--scale=0.5`; at most 2 agents; never a disk-wide search.

## What cannot be cloned here (say so in the benchmark, don't fake it)

- People in motion (reference AI video clips): a cut-out rig gets camera, composition and gesture timing close, but reads as puppets — no head turns, rigid sleeves, a static face. `Puppet` steps poses at 12 fps by default: pass the film's rate (`stepFps={16}`). Cut arms with a 2-link capsule cutter (S5: `studio/films/clone-van-gogh/lib/s08-cut-arms.py`; to be promoted to `tools/`).

- Shots that were image-to-video clips in the reference (people gesturing, walking, painting): AI video is banned. Rebuild with separated parts (puppet rig, parallax, physics) and mark 🟡 with the reason.
