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
   - **Measure**, don't eyeball: `tools/critique/motion-measure.py ref.mp4 --shots scene.ts --out out/measure/ref` → per-shot zoom curve, peak object speed (px/f), settle frames, sharpness and edge blur (depth of field), contrast, warmth, grain. These numbers are the spec.
   - Voice: transcribe with word times; our take (OmniVoice) phrase by phrase, each phrase anchored on the reference's start time (`voice/build-vo.py`: drift ≤ 0.25 s).
2. **Pictures per shot**, matched to the reference's composition (Rule 1).
3. **Build one shot at a time** with the engine (Rules 2–4), render that shot only (`--scale=0.5`).
4. **Compare at full rate** (Rule 5) and with the measures; fix; at most 3 rounds per shot.
5. **Send the shot** to the owner as soon as it passes: `tools/critique/vs.sh ref.mp4 clone.mp4 <from> <to> out.mp4 [--slow] [--audio]` (never a range cut carrying the whole reference audio: it freezes in players). Then the next.
6. **Fold every lesson** into a skill rule, a component or a tool the same day; record gaps in `crew/notes-*.md` and in the benchmark table (✅ / 🟡 / ❌ per shot, with the cause).

## Rules

1. **Composition first, matched.** Prompt each plate with the reference's framing words (front-on / profile / top-down, subject size as % of frame, where it sits, camera height). A subject that the reference composites (the frame *replaces* the head) is generated or cut as one piece in that place. Look at every picture before using it (generated or downloaded); a title or file name is not proof.
2. **Scale and depth like the reference.** Hero ≥ the reference's measured fill (usually 50–80 % of frame height). Foreground pieces (leaves, fragments, frames) are big (30–50 % of width) and blurred by depth; background soft. Use depth blur, never a flat stack of sharp cut-outs.
3. **Physics, never lerps.** Every entrance, landing, fall and float uses `src/physics`: `throwIn` (arc + spin + overshoot settle, 3–6 f at 16 fps), `bounce` (5–30 % overshoot), `flutter` (leaves: sway 0.3–0.9 Hz, spin, 3D flip), `drift` (floating objects), `impactShake` on hits. Match the measured peak speed and settle frames. Fast movers get motion blur (`@remotion/motion-blur` `HtmlInCanvasMotionBlur`, shutter 180°).
4. **The look is part of the edit.** Wrap the film in `Grade` (warmth, contrast, bloom, aberration, vignette) and stepped `Grain`; tune to the measured contrast/warmth. Transitions and lens moves use the GPU effects (`@remotion/effects`: zoom-blur, lens-blur, light-leak, roughen-edges, tear, glow, turbulent-displace) — read `.agents/skills/remotion-markup/effects.md` and `html-in-canvas.md` before writing your own.
5. **Judge motion at full rate.** Contact sheets (2 fps) show layout only. For every shot also make a consecutive-frame strip of reference vs clone (`ffmpeg … trim=start_frame=A:end_frame=A+12, tile=12x1` for both, vstack) and read it frame by frame: entry speed, overshoot, spin, depth blur, fill. Then compare `motion-measure` numbers (🔴 > 2x off).
6. **Resources.** One heavy job at a time on the machine (render, image, music, TTS: they share `tools/render.sh`'s lock); drafts at `--scale=0.5`; at most 2 agents; never a disk-wide search.

## What cannot be cloned here (say so in the benchmark, don't fake it)

- Shots that were image-to-video clips in the reference (people gesturing, walking, painting): AI video is banned. Rebuild with separated parts (puppet rig, parallax, physics) and mark 🟡 with the reason.
