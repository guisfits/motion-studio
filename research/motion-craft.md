# Motion craft: numeric recipes for collage / Vox-style / AI-image history reels

Purpose: implementable numbers so a frame-pure Remotion engine reproduces After Effects-quality motion.
Context: first clone was judged "well below average: animation, object physics, motion, visual filters".

## Evidence legend (read first)

Web search in this session was thin on pro-tutorial numbers. Every row carries a tag:

- **[S]** verified in a fetched or searched source (URL in Sources).
- **[D]** derived by me from physics or maths (formula shown; reproducible).
- **[C]** craft convention from practitioner knowledge. NOT verified by a source this session. Treat as a starting value to tune against the reference reel, not as fact.

Frame conversions: 1 s = 16 / 24 / 30 frames. "6f" = 0.375 s @16, 0.25 s @24, 0.2 s @30. Define everything in **seconds** and convert; Remotion `spring()` is already seconds-based (frame/fps).

---

## 1. After Effects motion fundamentals

| Recipe | Numbers | Tag | Remotion |
|---|---|---|---|
| Easy Ease (F9) | Both handles ~33% influence, 0 speed at the key. Result: bell-shaped speed graph. | [C] | `Easing.bezier(0.33, 0, 0.67, 1)` (or `Easing.inOut(Easing.cubic)`) in `interpolate`. |
| Pro ease-out entrance (object arrives) | Fast start, long settle: out-influence ~10-20%, in-influence 70-90% on the arrival key. Speed graph = steep spike then long tail. | [C] | `Easing.bezier(0.16, 1, 0.3, 1)` (expo-out feel) or `Easing.out(Easing.exp)`. |
| Ease-in exit | Mirror: slow start, abrupt end off-screen. | [C] | `Easing.bezier(0.7, 0, 0.84, 0)`. |
| Entrance duration | Small/medium object: 8-12f @24 (0.33-0.5 s) to reach 95%; hero object 14-20f @24. At 16 fps keep to ~6-10f (same seconds). "Normal pace 12-15f; slow/heavy 20-30f" (frame budget guide, 24 fps assumed). | [S]/[C] | Duration in seconds x fps. |
| Settle | Visible motion ends by ~60-70% of the move time; the last 30% is sub-pixel drift. Never linear into rest. | [C] | Spring or exp-out; `overshootClamping:false` for bounce. |
| Inertial bounce / overshoot (Ebberts) | Overshoot form: `amp*sin(2*pi*freq*t)/exp(decay*t)`. Published parameter sets: **amp .05, freq 4.0, decay 8.0** (2017 version, tight); **amp .05, freq 4, decay 2** (loose, many bounces); **amp .02, freq 3, decay 5** (position). Higher decay = dies faster; higher freq = wobbles more. Amp is scaled by incoming velocity at the last key. Overshoot expression sample values elsewhere: freq 3, decay 5. | [S] | See spring mapping below. |
| Ebberts "Keyframe Bounce Back" (ball hitting ground) | `e=0.7` (elasticity), `g=5000` (px/s^2), `nMax=9` bounces. Each bounce: height scales e^2, duration scales e. Offset = `vu*delta*(vl - g*delta/2)`. | [S] | Implement as pure function of `t`: iterate segments `segDur_i = 2*v_i/g`, `v_{i+1}=v_i*e`. No libs needed. |
| **AE bounce -> Remotion spring mapping** | Spring: `m x'' = -k x - c v`. `w0=sqrt(k/m)`, `zeta=c/(2*sqrt(k*m))`. AE decay = `zeta*w0` (1/s). AE freq (Hz) = `w0*sqrt(1-zeta^2)/(2*pi)`. Overshoot % = `exp(-pi*zeta/sqrt(1-zeta^2))`. Remotion default (m1,k100,c10): zeta .5, 16% overshoot, 1.38 Hz, decay 5. | [D] (defaults [S]) | Table below. |
| Wiggle, drift | `wiggle(0.3-0.8 Hz, 3-8 px)` position; rotation `wiggle(0.5, 1-2 deg)`. Slow, tiny, constant "alive" motion on held images. | [C] | `noise2D/noise3D` from `@remotion/noise` keyed on `frame/fps*freq`; frame-pure. |
| Wiggle, shake | `wiggle(8-15 Hz, 10-40 px)` with decay envelope `exp(-t*6)` over 8-15f for an impact. | [C] | `noise2D` with decaying amplitude (see Camera). |
| Follow-through / secondary motion | Child/attached parts lag the parent by **2-5 frames** and overshoot independently; softer spring (lower stiffness) on the child. | [S] (offset 2-5f)/[C] | Same spring, `frame - delay`, lower stiffness. |
| Anticipation | Pull back opposite to travel by 5-15% of travel distance (or scale to 0.9-0.95) for 3-5f @24, then fast-go. For pop-ins, usually skip anticipation and use overshoot instead. | [C] | Piecewise `interpolate` with 3 keys. |
| Staggering | Offset each element 2-4f (@24) from the previous; never start a group on the same frame. | [C] | `delay = i * stagger` in `spring({frame: frame - delay})`. |

### Spring parameter table (derived, mass = 1)

| Feel | AE equiv. (freq Hz / decay) | zeta | Remotion `config` | Overshoot |
|---|---|---|---|---|
| No bounce, smooth | n/a | >=1 | `{damping:200}` (documented) [S] | 0% |
| Snappy pop, tiny overshoot | ~3.5 / 14 | .62 | `{mass:1, stiffness:300, damping:22}` | ~8% |
| Default Remotion | 1.38 / 5 | .5 | `{mass:1, stiffness:100, damping:10}` [S] | 16% |
| Ebberts amp.05/f3/d5 | 3 / 5 | .26 | `{mass:1, stiffness:380, damping:10}` | ~42% |
| Ebberts amp.05/f4/d8 | 4 / 8 | .30 | `{mass:1, stiffness:700, damping:16}` | ~37% |
| Heavy, slow settle | ~1 / 6 | .70 | `{mass:2, stiffness:120, damping:30}` | ~5% |

Note: AE overshoot expressions add a bounce *on top of* the keyed move, so effective overshoot in AE is `amp`-scaled; the table gives step-response overshoot of the spring itself. Tune by eye; use `spring({durationInFrames})` + `measureSpring` to fit a time budget.

---

## 2. Physics looks

| Look | Recipe | Tag | Remotion |
|---|---|---|---|
| Thrown / flying-in cut-out | Position: parabola, entry from off-frame 30-60% of width away; duration 10-16f @24. Spin: 1-2 rotations total or +/-15-40 deg, decelerating (ease-out). Scale 0.6 -> 1.05 -> 1.0 if "thrown at camera". Landing: overshoot 3-6% then 2-3 damped wobbles, rotation settles to final tilt of -3..+3 deg (never exactly 0 for paper). Shadow offset grows while in flight (lift) and tightens on landing. | [C] | `x = interpolate(spring)`, `y = x_progress` with parabola `y = -4h*p*(p-1)` (p in 0..1); rotation `spring` with separate softer config; shadow blur/offset driven by `1 - p`. |
| Falling leaves / paper (flutter) | Fall speed 80-200 px/s (1080 tall). Sway: horizontal `A*sin(2*pi*f*t)`, A 40-120 px, f 0.3-0.6 Hz. Rotation follows the horizontal velocity: `rot = k*cos(2*pi*f*t)`, k 20-45 deg (leaf), 8-20 deg (paper). Add Y-axis flip (`rotateY` 0..180) at 0.2-0.4 Hz for paper. Each particle: random phase, f, A. Slight horizontal drift 20-60 px/s. | [C] | Pure function of `frame` and seeded `random(id)` from `remotion`. 20-60 particles of `<div>` with CSS 3D transform; frame-pure. |
| Gravity drop with bounce | `g` 4000-6000 px/s^2 at 1080 tall (Ebberts g=5000 [S]); `e` 0.5-0.7; 2-4 visible bounces; squash on impact: scaleY 0.9, scaleX 1.08 for 2f then back. | [S] g,e / [C] squash | Closed form from Ebberts segments (above). |
| Pop on beat | Scale 1 -> 1.08-1.15 -> 1.0 in 4-6f @24 (peak on the beat frame, or 1-2f before). Optionally +brightness 10-20%. Beat grid from music BPM: frames per beat = `fps*60/bpm`. | [C] | `spring({frame: frame - beatFrame, config:{stiffness:400,damping:14}})`; derive beat frames from audio analysis (`@remotion/media-utils` `getAudioData`/`visualizeAudio`). |
| Scale punch-in on a cut | Cut to shot already at 1.06-1.12 scale, settle to 1.0-1.03 over 4-8f @24 (exp-out); or the reverse (1.0 -> 1.05 over the held shot = "push"). Use 1-2 per 10 s, not every cut. | [C] | `interpolate(frame, [0,6], [1.1,1.03], {easing: Easing.out(Easing.cubic)})`. |

---

## 3. Camera

| Item | Numbers | Tag | Remotion |
|---|---|---|---|
| 2.5D push-in | Slow continuous: 1.00 -> 1.06-1.15 over the shot (3-6 s), ease-in-out or linear-with-soft-ends. Fast "punch": 1.0 -> 1.3 in 8-12f with exp-out. Animate camera zoom, not layer scale, so planes diverge. | [C] | Wrap scene in a parent with `perspective` and per-plane `translateZ`, or compute scale per plane = `1 + (zoom-1)*depthFactor`. |
| Parallax depth ratios (translation per plane, camera pan = 1.0) | Far BG 0.1-0.25; mid BG 0.4-0.6; subject plane 1.0; foreground 1.5-2.5. Scale push per plane: BG 0.3x of FG push. Rule: speed ~ 1/depth. | [C] | Per-layer `translateX(pan * factor)`. Real 3D alternative: `@remotion/three` (react-three-fiber) with a perspective camera and image planes at z. |
| Depth of field (2.5D fake) | Background plane blur 4-12 px (at 1080p), foreground out-of-focus plane blur 10-25 px; subject 0. Rack focus: animate blur subject 0->8 and BG 8->0 over 12-24f @24 with ease-in-out. | [C] | CSS `filter: blur(Npx)` per plane (frame-pure). Cost: large blurs are expensive; pre-blur static plates if unchanging. |
| Motion blur | AE shutter angle 180 deg = exposure of half the frame interval; AE default samples 16 (adaptive up to 64). Remotion `CameraMotionBlur`: `shutterAngle` default 180, `samples` 5-10 recommended, children must be absolutely positioned; destructive to colours at high sample counts. `HtmlInCanvasMotionBlur` (v4.0.529+) is the recommended modern route, `shutterAngle` 0-360 default 180, example `samples` 8; experimental. `Trail` is a stylised echo, not realistic. | [S] (Remotion), [C] (AE default) | `@remotion/motion-blur` (library exists). At 16 fps the blur per frame is long (0.5 x 62 ms = 31 ms); consider shutterAngle 90-120 to keep crispness, or apply blur only to fast movers. |
| Whip pan | 4-6f @24 total. Blur horizontal 40-120 px peaking at mid-transition; ease-in-out on the translation; cut hidden at peak blur (A and B both smeared). Add 1-2 frame exposure flash optionally. | [C] | Directional blur: SVG `feGaussianBlur stdDeviation="60 0"` on a `filter`, animated per frame; translateX of both clips +/- 100% with exp easing; or `CameraMotionBlur`. |
| Camera shake (impact) | Amplitude 10-40 px (translate) + 0.5-2 deg rotate at frame 0, decay `exp(-t*6..10)`, frequency 10-15 Hz, duration 10-18f @24. Different seeds per axis. | [C] | `noise2D('x', frame*0.9, 0)*amp*Math.exp(-t*7)`; frame-pure. |

---

## 4. Look / filters ("grade")

All values are starting points to tune against the reference frames (eyedropper on the reel). [C] unless noted.

| Effect | Recipe | Remotion |
|---|---|---|
| Contrast curve | Mild S-curve: shadows -5..-8%, highlights +4..+6%; or `contrast(1.08-1.15)`; lift blacks slightly to 6-10 (not crushed) for a filmic, printed look. | CSS `filter: contrast(1.1) saturate(0.9) brightness(1.02)`; or SVG `feComponentTransfer` with `feFuncR/G/B type="table"` for a true curve. |
| Warm grade | Tint toward amber: shadows teal-ish neutral, highlights warm (R+6, B-8), saturation 0.85-0.95, a `sepia(0.15-0.35)` base for history/paper feel. | `sepia(.25) saturate(.9) hue-rotate(-5deg)`; or `feColorMatrix`. |
| Film grain | Size 1-1.5 px at 1080p, opacity 6-14% (up to 20% for 16 mm look), monochrome, **animated at 12-24 fps (new seed every 1-2 frames; even on a 16 fps edit, refresh each frame)**; blend `overlay` or `soft-light`. | SVG `feTurbulence type="fractalNoise" baseFrequency="0.8-1.2" numOctaves="2" seed={frame}` -> `feColorMatrix` to grey, absolutely-positioned overlay with `mix-blend-mode: overlay`; `seed` must be integer, change per frame. |
| Vignette | Radial, 20-35% darkening at corners, feather ~70%, not centred exactly. | `radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,.35) 100%)` overlay. |
| Halation / bloom | Threshold highlights (>0.8), blur 20-60 px, tint red-orange (halation) or white (bloom), opacity 15-35%, `screen` blend. | Duplicate layer: `filter: brightness(1.4) contrast(1.4) blur(30px)`, `mix-blend-mode: screen; opacity:.25`. WebGL/three shader is cheaper at 1080x1920. |
| Chromatic aberration | RGB split 1-3 px at edges (increase radially), up to 8-15 px on a glitch/impact beat for 2-4f. | SVG: three `feOffset` on isolated channels (`feColorMatrix`) merged with `feBlend mode="screen"`; or three stacked copies with `mix-blend-mode: screen`. |
| Light leaks | Warm orange/red gradient blobs, `screen` blend, opacity 20-50%, drifting slowly, flaring across a cut for 8-16f @24 (transition cover). | Video/PNG overlay (`<OffthreadVideo>` with `mix-blend-mode: screen`) or animated radial-gradients. |
| Paper / collage texture | Multiply a scanned paper texture (fibre, creases) over the whole frame at 20-40% (`multiply`/`overlay`); per-cut-out: slight paper grain + fold highlights. | `<Img>` overlay with `mix-blend-mode: multiply`; fixed texture (static) is fine, grain layer animates. |
| Cut-out drop shadow | Offset 6-14 px down (and 2-5 px right), blur 8-20 px, black at 25-40% opacity; plus a tight contact shadow offset 1-2 px, blur 2-3 px, 45-55%. Offset/blur grow when the piece is "lifted", shrink at rest. | `filter: drop-shadow(6px 10px 14px rgba(0,0,0,.35)) drop-shadow(1px 2px 2px rgba(0,0,0,.5))` (alpha-following; needs transparent PNG). |
| Rough-edged cut-out | Torn / scissor-cut irregular edge, 2-6 px of white paper border visible, slightly wobbly; edge displaced by noise. | Pre-bake mask in pipeline (best). Runtime: SVG `feTurbulence baseFrequency="0.04" numOctaves="3"` -> `feDisplacementMap scale="6-12"` on the alpha; add `feMorphology dilate` radius 2-4 + white fill under the image for the paper border. |

---

## 5. Vox / collage technique

| Technique | Numbers | Tag | Remotion |
|---|---|---|---|
| Stepped frame rate | Whole cut-out layer set on **twos** (12 unique poses/s on a 24 fps timeline) or **threes** (8/s); stop-motion look = 8-12 unique/s. Fast actions switch to ones for a few frames. On a **16 fps** edit, "on twos" = 8 unique/s, effectively already the choppy range; do not step down further except for the boil. | [S] (twos=12 poses/s; threes=8; ones for fast action) | `const f = Math.floor(frame / hold) * hold;` and drive all transforms with `f`. Apply only to jitter/boil, NOT to camera moves. |
| Boil / jitter ("handmade wobble") | Per-cut-out random offset +/-1-3 px and rotation +/-0.3-1 deg, re-rolled every 2-3 frames (on twos/threes), different seed per layer. Optional edge displacement re-seeded on the same step (`feTurbulence seed={floor(frame/hold)}`, displacement scale 2-4). | [C] | `random(\`${id}-${Math.floor(frame/hold)}\`)` from `remotion` for deterministic jitter. |
| Layering | Subject cut-out + 2-4 supporting paper scraps + background texture + 1-3 foreground scraps (blur/overlay); torn paper, tape, stamps, handwritten marks, halftone/dotted overlay; shadows distinguish layers. | [C] | Stack `<AbsoluteFill>`; assets as transparent PNGs. |
| Tape / paper details | Tape: semi-transparent beige rectangle, rotated 8-20 deg, opacity 70-85%, with `multiply` and slight noise; paper edge white border 2-6 px. | [C] | PNG + CSS `mix-blend-mode`. |
| How cut-outs move | Rarely smooth tweens: pop/slide in with ease-out in 6-10f, then hold with micro-jitter, occasionally swing (pendulum rotation +/-3 deg, 0.5 Hz, decay) and slide-ins from off-frame edges at an angle. Keep shadows. | [C] | See sections 1-2. |
| Known references | Ben Marriott "Paper Cutout Effect" AE project/tutorial (free project file, how the effect is built); LinkedIn Learning "Creating a Handmade Look in After Effects: Paper Cutout and Stop Motion" (Owen Lowery, texture + stop-motion timing). Content not fetched. | [S] existence | Study to confirm hold-lengths. |

---

## 6. "earn.edits"-style AI-collage history reels

Mostly [C]: no creator breakdown was found in search; this is the common pipeline as practised. Verify against the reference reel frame by frame.

| Aspect | What is typically done | Remotion |
|---|---|---|
| Generated vs AE | AI image gen (Midjourney/Flux/etc.) for scenes; **image-to-video** (Kling, Runway, Luma, Veo) only for a few hero shots with subtle motion (walking, smoke, flags); most scenes are **still images animated in AE**: 2.5D parallax, slow push, cut-out layers. Cut-outs often removed via background removal then re-composited over paper/map backgrounds. | Parallax rigs from layered PNGs (depth from monocular depth-map models or manual layer split). `<OffthreadVideo>` for i2v clips. |
| Typical AE plugins/effects | Saber (glowing lines/energy), Deep Glow (bloom), CC Particle World / Particular (dust, embers, sparks), Displacement Map & Turbulent Displace (heat shimmer, wobble, wavy flags, ink), Optical Flares (lens flare on cuts), Fractal Noise (smoke, overlays), CC Lens / Lens Blur, Glow, Echo/Posterize Time (stepped boil). | Glow = blur+screen copy; particles = seeded `random()` arrays; displacement = SVG `feTurbulence`+`feDisplacementMap` (animate `seed` or `baseFrequency`); flares = pre-rendered overlay video with `screen` blend. No real equivalents of Saber/Deep Glow: use stacked blurs. |
| Transitions | Burn / fire-edge reveal (mask through fractal noise, hot orange edge via luma matte + glow), paper tear (two halves translate/rotate apart with rough alpha), keyhole zoom (scale mask 0 -> large, content scales 1.5-3x opposite), whip pan (see Camera), pillar/strip wipe (5-12 vertical bars staggered 1-2f), glitch slice, flash/light-leak. Duration 8-18f @24 (0.3-0.75 s). | Burn: SVG `<mask>` with `feTurbulence` threshold animated by `frame`; tear: `clip-path: polygon()` with jagged points from seeded noise on two copies; keyhole: `clip-path`/SVG mask path scaled; pillars: N divs with staggered `scaleY`. `@remotion/transitions` offers presets (fade, slide, wipe, flip) and custom presentations. |
| Kinetic type (pop per word) | Scale 0 -> 1.1 -> 1.0 over ~6-8f @24 (peak at ~4f, settle by 8f); with opacity 0 -> 1 over the first 2f; word stagger 2-4f; sometimes y-offset 20-40 px. Emphasis word: different colour/size/highlighter box. Same spring family as section 1: `{stiffness:300-500, damping:14-22}` approximates 0 -> 1.08-1.12 -> 1. | `spring()` per word with `delay`; `@remotion/captions` for word timings from the voice track. |

---

## 7. Remotion libraries / building blocks

| Need | Library | Notes |
|---|---|---|
| Springs | `remotion` `spring()`, `measureSpring()` | Defaults mass 1, damping 10, stiffness 100, overshootClamping false. [S] |
| Easing / interpolate | `remotion` `Easing`, `interpolate` | `Easing.bezier` for AE influence curves. |
| Noise (wiggle) | `@remotion/noise` | frame-pure noise2D/3D/4D. |
| Motion blur | `@remotion/motion-blur` (`CameraMotionBlur`, `Trail`, `HtmlInCanvasMotionBlur`) | See Camera. [S] |
| Transitions | `@remotion/transitions` | Presentations + custom. |
| 3D / DOF | `@remotion/three`, drei `DepthOfField`/postprocessing | Real camera, bokeh. |
| Shapes / paths | `@remotion/shapes`, `@remotion/paths` | Tears, masks. |
| Filters | CSS `filter`, SVG filters, `mix-blend-mode` | Rendered by headless Chromium; confirm `--gl` settings and test render time for blur-heavy stacks. |

Frame-purity rule: every random/noise must be derived from `frame` plus a fixed seed (`random()` from `remotion`), never `Math.random()` or wall-clock.

---

## Top 10 changes with the biggest payoff for a 16 fps AI-collage history-reel clone (ranked)

1. **Replace linear/CSS-default tweens with spring/exp-out easing everywhere** (entrance 6-10f @16 / same seconds, overshoot 5-15%, settle tail). Amateur motion is almost always "linear or symmetric ease".
2. **Add secondary motion and overlap**: stagger groups 2-4f, follow-through lag 2-5f on attached parts, rotation/scale settling on every landing.
3. **Real 2.5D camera with parallax** (planes at 0.2 / 0.5 / 1.0 / 1.8 speed ratios, push-in 1.0 -> 1.1 on every held shot) instead of flat Ken Burns on a single image.
4. **Cut-out depth cues**: dual drop shadow (offset 6-14 px/blur 8-20/35% + contact shadow), lifted-shadow animation during flight, 2-6 px paper edge, rough/torn alpha edge.
5. **Animated film grain + paper texture + vignette on one global overlay** (grain re-seeded every frame, 8-14% overlay; paper multiply 20-40%; vignette 25-35%). Cheapest "looks professional" win.
6. **Stepped boil/jitter on twos** for cut-outs (+/-1-3 px, +/-0.5 deg re-rolled every 2 frames) while the camera stays smooth.
7. **Thrown/flying-in object physics**: parabola path + decelerating spin + landing overshoot with 2-3 damped wobbles; leaf/paper flutter with sway 0.3-0.6 Hz coupled to rotation.
8. **Transitions with substance**: whip pan with 40-120 px directional blur at the cut, burn/tear/keyhole/pillar wipes, light-leak flash on key cuts, impact shake (10-40 px, decay exp(-7t), 10-15f).
9. **Colour grade + glow**: S-curve, warm/sepia bias, halation/bloom 15-35% on highlights, subtle chromatic aberration 1-3 px (spike to 8-15 px on impacts).
10. **Beat-synced punches and pop-in kinetic type**: scale punch 1.08-1.15 over 4-6f on beats, per-word 0 -> 1.1 -> 1.0 pops staggered 2-4f, 1-2 punch-ins per 10 s (not every cut); plus `CameraMotionBlur` (shutterAngle 90-180, 5-10 samples) on fast movers only.

---

## Sources

Fetched or surfaced in search:

- Dan Ebberts, Bounce and Overshoot (Keyframe Bounce Back: e=.7, g=5000, nMax=9; overshoot formula) - https://www.motionscript.com/articles/bounce-and-overshoot.html
- Adobe Community, inertial bounce thread (amp .05/freq 4/decay 2; amp .02/freq 3/decay 5; amp .05/freq 4/decay 8; decay overflow note) - https://community.adobe.com/questions-529/inertial-bounce-expression-30984 and https://community.adobe.com/t5/after-effects-discussions/inertial-bounce-multiple-times-on-the-same-property/m-p/13578026
- Remotion spring() docs (defaults, damping 200 for no bounce) - https://www.remotion.dev/docs/spring
- Remotion motion blur guide - https://www.remotion.dev/docs/motion-blur-guide
- Remotion CameraMotionBlur (shutterAngle 180, samples) - https://remotion.dev/docs/motion-blur/camera-motion-blur
- Remotion HtmlInCanvasMotionBlur - https://www.remotion.dev/docs/motion-blur/html-in-canvas-motion-blur
- Shooting on twos (12 poses/s) - https://stopmotionstudio.com/en/manual/Shooting_on_Twos
- Animating on ones, twos, threes - https://publish.obsidian.md/mister-chad/animation/animating+on+the+ones%2C+two%2C+and+threes
- Animation-principle frame budgets (follow-through offset 2-5f; pacing 12-15f / 20-30f) - https://playbooks.com/skills/dylantarre/animation-principles/after-effects
- Easy Ease / speed graph basics - https://computerstudio.uni-ak.ac.at/tutorials/motion-design-01/
- Ben Marriott, Paper Cutout Effect (AE project) - https://benmarriott.gumroad.com/l/NDtPol
- LinkedIn Learning, Creating a Handmade Look in After Effects (Paper Cutout and Stop Motion) - https://www.classcentral.com/course/linkedin-learning-creating-a-handmade-look-in-after-effects-1-paper-cutout-and-stop-motion-29823

Derived: spring <-> AE overshoot mapping (damped harmonic oscillator; own derivation).

## Gaps (open)

- No source found for: easy-ease 33% influence, parallax ratios, DOF blur values, grain/vignette/halation/shadow numbers, pop-in frame counts, earn.edits workflow. Marked [C]. Best next step: measure these directly from the reference reel (frame-step at 16 fps, sample shadow offset, grain amplitude, scale curves) and overwrite the [C] rows.
- Per-reel breakdown videos (Johnny Harris, Vox, "earn.edits") not fetched; YouTube is not readable via fetch.
