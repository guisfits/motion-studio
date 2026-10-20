# Chris Moran (Vox-style) presets: engine recipes

Source: `~/Downloads/vox resources/` + `FootageTreatments.aep` (untrusted, read-only; parsed as RIFX binary with a Python script, never opened in AE).
Notation: `~` = guessed or inferred. Times in "f" = frames, derived from keyframe ticks (1024 ticks per frame in the comp/preset files, ~24 fps; Callouts/Pen files use 1000 ticks per frame). AE colors are listed as 0-255 RGB.
Blend codes recovered from the layer header match the AE SDK transfer-mode ids: 2 Normal, 4 Add, 5 Multiply, 6 Screen, 7 Overlay (confirmed by layer names: "Overlay"=7, "Edge Glow"=4, "Smudges"=6, "Highlighter"=5). 26 and 33 are not resolvable (see end).

## Shared building blocks (reused by almost every file)

| Block                      | AE definition                                                                                                                                                                                                                                                           | Engine equivalent                                                                                                                                                                                                                                   |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| posterizeTime(N)           | `ADBE Posterize Time`, Frame Rate 12 (Secret Sauce, Callouts, InkBleed, Vox), 16 (FootageTreatments 1, 2), 9 (Treatment 3), 10 (Waveform), 29.97 (CRT blur)                                                                                                             | Quantise the clock: `t' = floor(t*N)/N` before every animated value; for ffmpeg post, `fps=N` then `fps=<out>`.                                                                                                                                     |
| Per-frame exposure flicker | `ADBE Exposure2` Exposure with expression (below). `floorTime`/`holdTime`/`freq` are computed but never used, so the result is a new random value EVERY frame (the "2 per second" comment is wrong).                                                                    | `gain = 2^(rand(-s,s))` per frame, s = 0.03 (screens, Callouts, FootageTreatments 0.02, Secret Sauce 0.04). CSS `filter: brightness(gain)` or ffmpeg `eq=brightness` / `exposure=exposure=x`.                                                       |
| Film grain                 | Video Copilot-style `VISINF Grain Implant` ("Add Grain"), Viewing Mode 3 (final), Intensity 0.3 (Secret Sauce, Vox) or 1.0 default, Size 2.0 (Callouts) / 1.4 / 0.6, Monochromatic on in Treatment 3 (Intensity 2.0, Size 0.6), Blend mode 1, Animation Speed 1, Seed 0 | Pre-generated grain PNG sequence or canvas noise re-seeded each frame at 12-24 fps, blended `overlay`/`soft-light` at ~0.15-0.3; ffmpeg: `noise=alls=12:allf=t` (t = temporal). Size 2 means 2 px grains: generate at half-res and upscale nearest. |
| Gate weave                 | `ADBE Geometry2` Transform, Scale 101-105%, Position expression (below)                                                                                                                                                                                                 | `translate(rand±J px)` per frame + `scale(1.01..1.05)` so edges never show.                                                                                                                                                                         |
| Chromatic aberration       | `Quick Chromatic Aberration 3` (PEQCAGL): Position (channel offset) 1.0-2.0, Blur 1.0-3.0, Sample Count 10, Distort Uniform 6-7, Repeat Edge Pixels on                                                                                                                  | Split RGB: R shifted `-d`, B `+d` px (d = 1-2 px), optional 1-3 px blur on the shifted channels. SVG: `feColorMatrix` per channel + `feOffset` + `feBlend mode=screen`; ffmpeg: `rgbashift=rh=-2:bh=2`.                                             |
| Curves                     | `ADBE CurvesCustom`, 256-entry LUT recovered (see per-preset)                                                                                                                                                                                                           | ffmpeg `curves=all='x/y ...'` or a canvas 256-LUT; SVG `feComponentTransfer` with `feFuncR/G/B type="table"`.                                                                                                                                       |

Verbatim expressions used in several files:

```js
// Exposure flicker (Modern Laptop, Retro Computer, Callouts, InkBleed, FootageTreatments; Secret Sauce uses 0.04)
seedRandom(index + time, true);
flickerStrength = 0.03; // adjust: 0.02 - 0.1 for subtlety
freq = 2; // flicker frequency per second
holdTime = 1 / freq;
floorTime = Math.floor(time / holdTime) * holdTime;
randomVal = random(-flickerStrength, flickerStrength);
randomVal;
```

## .ffx presets (13)

### 1. Screen Treatments / Modern Laptop_Screen.ffx

Look: bright, slightly blown-out LCD with a fine pixel grid, soft RGB fringing and a faint projection flicker.
Stack (in order):

1. Venetian Blinds: Transition Completion 16, Direction 0, Width 6, Feather 2.
2. Venetian Blinds 2: same, Direction 90 (horizontal + vertical lines make a pixel grid).
3. Quick Chromatic Aberration 3: Position 1.2, Blur 3, Sample Count 10, Distort Uniform 0.
4. Curves (master LUT at 0,32,64,96,128,160,192,224,255): [0, 29, 66, 121, 181, 226, 249, 255, 255]. Strong midtone and highlight lift (mid 128 -> 181), highlights clip at ~224.
5. Exposure: 0 with the flicker expression (strength 0.03).
6. Transform: Scale 102%.
   Engine: overlay a 6 px-pitch grid (`repeating-linear-gradient`, ~1 px dark line per axis, 2 px feather, mix-blend `multiply`, alpha ~0.15 ~) over the footage; apply the LUT with `curves`; fringing d = 1.2 px; per-frame brightness jitter; `scale(1.02)`.

### 2. Screen Treatments / Retro Computer_Screen.ffx

Look: CRT monitor: barrel bulge, horizontal scanlines, mild contrast S-curve.
Stack: 1. CC Lens (Center 0.5,0.5; Size 386; Convergence -74). 2. Venetian Blinds (Completion 13, Direction 0, Width 6, Feather 2: horizontal scanlines only). 3. Quick Chromatic Aberration 3 (same as laptop: Position 1.2, Blur 3). 4. Exposure flicker (0.03). 5. Curves LUT [0, 25, 53, 90, 132, 174, 207, 233, 255] (gentle S: shadows down, highlights up). 6. Transform Scale 105% (hides the bulge corners).
Engine: scanlines = 6 px period, 13% dark band, 2 px feather; bulge = SVG `feDisplacementMap` from a radial gradient map or a canvas barrel remap (k ~ 0.15 ~); LUT via `curves`; `scale(1.05)`.

### 3. Pen & Pencil / Pen Look.ffx

Look: hand-inked outline that wobbles every frame (line boil).
Stack: 1. Turbulent Displace: Displacement Turbulent, Amount keyframed 33 -> 31 one frame apart (a 2-frame "boil"), Size 2, Complexity 2, Evolution 0, Pinning 3 (Pin All), Antialiasing best. 2. Roughen Edges: Edge Type 7 (~Rusty), Border 10, Edge Sharpness 1.66, Fractal Influence 1, Scale 10, Complexity 2, Edge Color (255,153,51).
Engine: SVG `feTurbulence baseFrequency≈0.5 numOctaves=2` + `feDisplacementMap scale≈32`, re-seeded every 1-2 frames (step the `seed` attribute); then rough-edge pass: second `feTurbulence` (low freq, ~10 px scale) thresholded with `feComponentTransfer` on the alpha, border ≈ 10 px.

### 4. Pen & Pencil / Pencil Look.ffx

Same stack as Pen with: Amount 29 -> 31 (1 frame apart), Roughen Edges Edge Type 5, Border 11.8, Edge Sharpness 1.43. Edge Color (255,153,51). Reproduce as Pen with smaller displacement (~29 px at feTurbulence scale) and a softer edge (sharpness 1.43).

### 5. Cinema Treatment / Secret Sauce.ffx

Look: the core "Vox" film feel: 12 fps stepped motion, subtle breathing camera, grain, soft glow.
Stack:

1. Posterize Time: 12 fps.
2. Exposure: flicker expression with strength 0.04.
3. Add Grain: Viewing Mode 3, Intensity 0.3, Size 1.0, Softness 1.0, Saturation 1.0, Blending Mode 1, Animation Speed 1.
4. Transform: Scale 103%; Position expression:

```js
posterizeTime(24);
x = wiggle(6, 1)[0];
y = wiggle(6, 1)[1];
[x, y];
```

5. Glow: Glow Based On 2 (~color channels), Threshold 183 (of 255 ~ 72% luma), Radius 50, Intensity 0.15, Composite Original 2, Glow Operation 3, Glow Colors: original, Dimensions Horizontal+Vertical.
   Engine: whole scene clock stepped at 12 fps; camera drift = value-noise (6 Hz, amplitude 1 px) sampled at 24 fps, `scale(1.03)`; glow = threshold luma > 0.72, gaussian blur sigma ≈ 25 px, composited `screen` at 0.15 (ffmpeg: `split` -> `lut` threshold -> `gblur=sigma=25` -> `blend=all_mode=screen:all_opacity=0.15`); grain overlay 0.3.

### 6. Gate Weave & Exposure Flicker / GateWeave.ffx (effect name "HeavyWeave")

Look: projector gate weave: frame jumps a pixel or two at 24 per second.
Stack: Transform: Scale 101%; Position expression:

```js
fps = 24; // number of moves per second
seedRandom(Math.floor(time * fps), true);

jitter = 1.5; // max pixel movement
value + [random(-jitter, jitter), random(-jitter, jitter)];
```

Engine: per output frame, translate by uniform random in ±1.5 px (both axes), scale 1.01. Seeded by frame index so renders are deterministic.

### 7. Gate Weave & Exposure Flicker / HeavyFlicker.ffx

Look: strong brightness pumping. Stack: Exposure with expression `wiggle(24,.2)` (smooth noise 24 Hz, ±0.2 stops). Engine: `brightness(2^n)` with n from value noise at 24 Hz, amplitude 0.2 (about ±15% luminance).

### 8. Jitter Presets / Jitter Object.ffx

Look: any object trembles on a stepped clock. Stack: Transform "Jitter Position Transform" + Slider Control "Jitter Frequency" (default 2) + Slider Control "Jitter Amount" (default 7). Position expression:

```js
// Jitter Position Preset
var fps = effect("Jitter Frequency")("Slider");
var jitter = effect("Jitter Amount")("Slider");

seedRandom(Math.floor(time * fps), true);
value + [random(-jitter, jitter), random(-jitter, jitter)];
```

Engine: `jitter(el, fps, amount)`: seed = floor(t\*fps); translate rand ±amount px. Defaults (2 moves/s, 7 px) are slow and visible; Chris uses 12-24 fps for texture.

### 9. Jitter Presets / Text Jitter.ffx

Look: every letter hops independently. Stack: text animators "Animator 1 - x" and "Animator 1 - y", each with an Expression Selector and a Position offset (~100 px on its axis); sliders Jitter Frequency 2, Jitter Amount 60 (the amount is a percent of that 100 px offset). Expressions (x; y differs only by seed offset 456 and no comment):

```js
var fps = effect("Jitter Frequency")("Slider");
var jitter = effect("Jitter Amount")("Slider");

// Step the randomness and remove in-between interpolation
posterizeTime(fps);
seedRandom(textIndex + 123 + Math.floor(time * fps), true);

random(-jitter, jitter); // returns a percent; ±jitter% of 100 px => ±jitter px
```

Engine: split text into spans; per span `translate(rand(seed=i+123+step), rand(seed=i+456+step))` px with step = floor(t\*fps). Real use wants amount ≈ 2-6 px, fps 8-12 (default 60 px is the slider's raw default, ~).

### 10. Glow / Flicker and Glow.ffx

Look: pulsing bloom plus grain. Stack: Glow (Based On 2, Threshold 153, Radius 116, Intensity 0.33 with expression `wiggle(2,.2)`, Composite Original 2, Operation 3), then Add Grain (Viewing Mode 3, Intensity 1.0, Size 1). Engine: highlight threshold luma > 0.6, blur sigma ≈ 58 px, screen composite at `0.33 + noise(2 Hz)*0.2`.

### 11. Classy Text Animations / LoadUp.ffx

Look: letters rise and fade in as a soft wave. Two text animators with a Range Selector each (~):

- Animator 1: Range Offset keyframed 0 -> 100 over ~12 f (ease out).
- Animator 2: Range Offset keyframed -100 -> 100 over ~17 f; Smoothness 100, Min/Max Ease 100; Position (0, +30 px); Opacity 100.
  Engine: per-letter `translateY(30px -> 0)` + opacity 0 -> 1, stagger = smooth wave (ease 100%) across the line; whole sweep ~0.7 s.

### 12. Classy Text Animations / AppearRandom.ffx

Look: letters pop on in random order. One Range Selector, Randomize Order = on, Range End keyframed 100 -> 0 over ~13 f (hard edges: Smoothness 0), animating Opacity (0 -> visible, ~). Engine: shuffle letter indices once (seeded); reveal letter k when `progress > rank(k)/n`, opacity step (no fade).

### 13. Classy Text Animations / FillAnimation.ffx

Look: text fills with a cream colour in a smooth wipe while sliding up slightly. Range Selector Range End keyframed 82 -> 0 over ~47 f (ease in/out, Smoothness 100); Fill Color (255,253,234); an `Effects` Transform Position keyframed y 0.077 -> 0 (relative, ~8% of frame height ~) over ~42 f. Engine: CSS `background-clip:text` with a moving gradient mask (soft edge ~100%), `translateY` ease-out.

## .aep projects (10)

### 14. Callouts / Callouts_Vox.aep

Look: hand-scribbled highlighter, arrows, circles, X marks drawn on over footage, with film/stepped finish. Comp "Callouts" (absolute scale ~100%).

- Finish adjustment stack (top of comp): Quick CA 3 (Position 1, Blur 1, Distort Uniform 6), Posterize Time 12, Exposure flicker, Add Grain (Size 2, Mode 3); a Curves layer in the stack [0,10,25,47,81,123,168,212,255] (darkening gamma ~0.6) at Opacity 100; a second Curves adjustment [0,58,112,162,202,231,247,253,255] (lift) at Opacity 31%; Fast Box Blur radius 3.
- Highlighter (blend Multiply): stroke (255,241,0) width 30; Trim Paths End 0 -> 100 over f46-68 (second copy f52-74), ease-out; Roughen Edges (default).
- Arrow: stroke (25,163,152) width 9; Trim End 0 -> 100 f16-27 with `posterizeTime(12); value`; Roughen Edges ×2: (Border 5.2, Sharpness 2.2, Scale 62) and (Border 5, Sharpness 4.45, Scale 10).
- "Dopler" radar rings: stroke (116,123,217) fill (244,248,250); stroke width 7 -> 3 over 25 f, Opacity 1 -> 0 over f17-25 (copies staggered by ~5-10 f); Roughen (Border 2.9, Sharpness 1.38, Scale 103) + (Border 2, Sharpness 3.25, Scale 10).
- Squiggle / Circle / x: stroke (116,123,217), widths 10 / 6 / 16; Trim End 0 -> 100 over 41 / 41 / 28 f, all `posterizeTime(12)`; Roughen Border 9.5 (Sharpness 2.2, Scale 62; 4.45, Scale 10).
- Text "FREE"/"CALLOUTS": font Chromatic Pro Compact Bold. Fill charcoal (44,43,41) ~.
  Report lists: Add Grain, Curves, Displacement Map, Exposure, Fast Box Blur, Posterize Time, Quick CA 3, Roughen Edges, Simple Choker, Transform.
  Engine: SVG paths drawn with `stroke-dasharray/offset` at 12 fps steps (ease: ~80% influence on the out handle, i.e. fast start, long settle); rough edge = displace the stroke with `feTurbulence` (baseFrequency ≈ 1/scale) + `feDisplacementMap` scale ≈ Border px; highlighter = `mix-blend-mode: multiply`.

### 15. Callouts / InkBleed / InkBleed.aep

Look: a circle/text whose ink bleeds and settles. Same finishing stack as Callouts, plus:

- "INK BLEED" text layer: Simple Choker Choke Matte 100 -> 0 over f-8..8, expression `posterizeTime(8); value`; Roughen Edges Border 1.6, Sharpness 9.9, Scale 10.
- "Circle": two Roughen Edges whose Border pulses 0 -> 20.2 and 0 -> 32.1 (f50-62, f101-102, f144-145 ~) with Scale 210 and a Scale keyframe 16 -> 220 -> 16 around f176-184 (boiling edge).
- "Foux Camera" null: Position y 1246.8 -> 755 and Scale 103% -> 403% in one frame (f25-26): a cut-in punch.
  Engine: text as a canvas mask; animate a morphological erode (choker) from 100 px to 0 in steps of 8 fps (`feMorphology radius`), then roughen with turbulence; pulse the turbulence scale for the bleed.

### 16. Textures / Texturing folder / Texturing.aep

Look: type and doodles on paper with print texture, misregistered edges and a vignette. Comp "Texturing Example Comp":

- BG; Vignette (Opacity 28%); "Card Stock" texture (blend 7 Overlay) with a Curves layer; "Faded Newspaper" texture (blend code 33, unresolved ~Soft Light/Multiply-class); TEXTURE text (Bebas Neue Bold) with Displacement Map (Max Horizontal 4 px) and Roughen Edges (Border 0 -> 8 at f40-41, Sharpness 9.13, Scale 12, Stretch 5); text Position y 2148 -> 0 and Scale 511% -> 2541% over f31-56 (punch-in).
- "Line 2": stroke width 7, Roughen Edges (Border 2, Scale 24).
  Report lists Camera Lens Blur, Grid, Fill, Posterize Time (values not in layers; unrecoverable).
  Engine: paper textures as PNG layers with `mix-blend-mode: overlay|multiply`, vignette = radial gradient at 28%; type through `feDisplacementMap` (4 px) + roughen filter.

### 17. Custom CRT Emulation / CRT Emulation_Template.aep

Look: full CRT TV recreation of the footage. Sliders on CONTROLS: Flicker Strength 50, Downsample % 19.5 (~, names inferred from expressions). Layers bottom to top:

1. Footage Placeholder: pixelate: Transform Scale = Downsample% (19.5%) then back up by `10000/q` (= 513%): nearest-neighbour downscale for lo-res. Two Transform effects.
2. Blur: Gaussian Blur 2 px (both dims), Posterize Time 29.97, Hue/Sat.
3. Scan Lines (Overlay, Opacity 40 with `wiggle(24,5)`): Venetian Blinds Completion 50 (`wiggle(2,30)`), Direction 90, Width 5, Feather 0.5; Solid Composite color (86,86,86) gray; scale (110%, 132%).
4. Heavy Color Noise: Noise Amount 20 (colour).
5. Screen Distortion: Optics Compensation FOV 30 + Transform Scale Height 109.
6. Masking: Exposure -1.28 + Fast Box Blur 2 (dark rounded-corner mask).
7. Exposure Flicker: `wiggle(24, thisComp.layer("CONTROLS").effect("Flicker Strength")("Slider") / 100)` on Exposure.
8. Displacement (Displacement Map + Transform Scale Height 101%).
9. Screen Mask; Overlay layer (blend Overlay, looped lens-dirt footage with `loopOut("cycle")`), Brightness & Contrast.
10. Glow Mask: Simple Choker -12, Gaussian Blur 29.7; Edge Glow (Add, Opacity 48%): Glow Threshold 44, Radius 49.
11. Transform (Scale Height 102%); Smudges (Screen, Opacity 50%, scale 42%); Tv Edges (frame art).
    Engine: render at 1/5 resolution (19.5% ≈ 1/5), upscale with `image-rendering: pixelated` / ffmpeg `scale=iw*0.195:-1:flags=neighbor,scale=iw/0.195:...:flags=neighbor`; scanlines 5 px period at 40% overlay; noise 20 (≈ `noise=alls=20`); barrel via `lenscorrection`/`v360`; vignette by exposure -1.28 through a blurred rounded rect; flicker `wiggle` noise 24 Hz amplitude 0.5.

### 18. Cinema Treatment / Secret Sauce Example / VOX Recreation_Vert2.aep

Look: the Vox collage reference: cream paper, graph-paper multiply, stepped text, soft shadows. Comps "Secret Sauce", "Text Animators", "Texture 1".

- Background: Fill (250,248,241) = `#FAF8F1`. Graph Paper (blend Multiply, scale 116%) with Invert.
- `Secret Sauce` adjustment layer: the preset above (Posterize 12, flicker 0.04, Grain 0.3, Transform 103% + wiggle, Glow 183/50/0.15). A separate `Posterize Time` adjustment layer scales (57%, 180%) with Posterize Time 12 only.
- Shadow cards "before 2/3": Gaussian Blur 148, Opacity 30%, Scale (175%, 56%): giant soft side shadows, stroke gray (38,38,38).
- Typography: American Typewriter Condensed; layers Load Up, Random Appear, Fill Animation (= presets 11-13), "Odometer Mask" matte for a rolling-number counter (Position slide, mask).
- "Texture 1" rig (Mt. Mograph "Motion 4" 3D Dynamics): texture layer follows a controller and wiggles. Position expression (verbatim core):

```js
newValue = wiggle(frequency, amount); // wiggleType 1: seedRandom(time + seedValue*1000)
// wiggleType 2 (stepped):
var timeVal = Math.round((time + seedValue * 1000) * frequency) / frequency;
newValue = wiggle(frequency, amount, 3, 1, timeVal);
lastValue = (newValue || value) + effectProperty("...-0002");
// delay: controllerLayer.position.valueAtTime(time - delayAmount/100)
```

- Report effects not recoverable as layers: Camera Lens Blur, CC Ball Action, CC Page Turn, Compound Blur, Corner Pin, Gradient Ramp, Grid, Hue/Saturation, Thicc Stroke, Tint (no params found).
  Engine: base = cream `#FAF8F1`, multiply graph-paper PNG; wrap the scene in the Secret Sauce chain; "texture wiggle" = 8-12 fps stepped position noise on the paper texture, amplitude ~3-8 px, with 1-3 frame lag behind the camera.

### 19. Gate Weave & Exposure Flicker / Flicker & Weave / Flicker & Weave.aep

Demo comp "Flicker Presets": layers `Weave` (adjustment: Transform with the GateWeave expression, Scale 101%, 24 fps, ±1.5 px), `Flicker` (adjustment: Exposure `wiggle(24,.2)`), text "Static", "Presets On". Identical to presets 6 and 7. Engine: toggle chain.

### 20. Glow / Flicker and Glow / Flicker and Glow.aep

Comp "Glow and Flicker": `Pulsing Glow` adjustment (Glow Radius 116, Intensity 0.33, `wiggle(2,.2)`) + `Grain` adjustment (Add Grain Mode 3). Same as preset 10. Also embeds a copy of the VOX Recreation project (project 18).

### 21. Audio Visualizers / Waveform Template.aep

Look: analog audio line visualisers. Comps "Grainy Analog", "Stacked Visualizer".

- Grainy Analog: Audio Spectrum x2 on a line (Start 0.032,0.5 -> End 0.973,0.5; 17 bands; End Frequency 14700/22050; Max Height 15630 / 32000; Thickness 46.8 / 9; Display Option 2 = Analog Lines; Averaging on; colour (181,192,242) ~ lavender-white), Primary line then Gaussian Blur 70; Glow Treatment: Glow ×3 (Radius 20 / 290 / 320, Intensity 0.6 each); Grid (Border 2, color 105 gray, Opacity 41%); Playhead stroke width 11 with Gaussian Blur 11; Hue Shifter; Posterize Time 10; Add Grain.
- Stacked Visualizer: Middle Dots (Add): 81 bands, Thickness 5, colour (246,244,85) ~; Top/Bottom Line (Add): Thickness 4, Side Options 1/2, Audio Offset 10 ms, colour (204,80,73) ~; Analog Crunch: Fast Box Blur 2 + Unsharp Mask 100%/radius 5; Subtle Glow ×2 (Radius 20, 85; Intensity 0.6); Posterize 12; Grid with Roughen (Border 3, Scale 44).
  Engine: WebAudio `AnalyserNode` -> N bands -> polyline/dots; glow = 3 stacked blurred copies (`drop-shadow` 20 / 290 / 320 px ~ at 0.6) with `lighter` composite; step at 10-12 fps.

### 22. SpotifyWrapped / SpotifyWrapped_ForAudience.aep

Look: bold flat colour "wrapped" cards with wavy shapes and a pencil underline that boils. Comps "BaseAnimation", "IN AE".

- Pencil layers: stroke 8 px, Turbulent Displace Amount 5, Size 62, Random Seed expression `time*8` (seed steps 8 per second: hand-drawn boil); sliders/checkbox drive on/off. Engine: `feTurbulence` seed = floor(t\*8), displacement scale 5, base frequency 1/62.
- Wave: Wave Warp, Wave Width 1247.9 (huge, gentle undulation), Pinning 2.
- Colour mapping: Tritone: (Highlights `#F3F2EE`/`#FF9892` variants, Midtones `#2A272A`/`#9892FF`, Shadows `#29272A`): remap lum to 3 colours. Engine: `feComponentTransfer` table with 3 stops, or canvas gradient-map on luma.
- Shapes: "Spirals" (stroke 43) and masks animating Position from y 3200 -> 0 in 205 f, 2440 -> 0 in 203 f (wipe transitions); `Shape Layer 2` blend code 26.
- Logo: Fill (42,39,42) ~, Scale 14%; text font Knockout HTF50.

### 23. FootageTreatments.aep

Look: three ready-made footage grades. Comps "Treatment 1/2/3" with an `Effect Stack` adjustment and a `Blur Map` layer.

- Treatment 1: Exposure flicker (0.02), Lumetri Color (Exposure +1.2, Midpoint 71 ~; LUT/curves not recoverable), CC Ball Action (Ball Size 111, ~ pixel-dot look), Quick CA 3 (Position 2, Distort Uniform 7), Posterize Time 16, Add Grain (Size 1.4); Blur Map: Camera Lens Blur radius 6 (map layer drives where the blur applies).
- Treatment 2: Blur Map (Lens Blur 6) plus stack: flicker 0.02, Posterize 16, Add Grain (Intensity 2.4, Size 1.4), Hue/Saturation, Quick CA 3 (2 px, Distort 7).
- Treatment 3: "Animated Felt Scan" overlay (blend code 27, Opacity 71%, Levels), stack: Posterize 9, Add Grain (Intensity 2.0, Size 0.6, Monochromatic), flicker 0.02; Blur Map Lens Blur 6.
  Engine: tilt-shift/depth blur = `feGaussianBlur` masked by a gradient map (stdDev ≈ 6); stack = chain from "Shared building blocks" with grain intensity as the signature (Treatment 2 heaviest).

### 24. Focus - AE Plugin / Focus.jsx (ScriptUI panel, plain text; read, not run)

Look: camera zoom with focus hunting (rack focus). Two actions:

- Zoom + Focus Hunting: master null, Scale 100% -> (100 + zoom%) (default zoom 100%, duration 30 f, Bezier ease speed 0 / influence 80% in and out); the focus layer starts at 10 f/30 f and lasts 18 f/30 f (scaled with duration, min 2 f).
- Static Focus Hunting (default 18 f): adjustment layer "Focus Hunting" with Box Blur, Iterations 8, Blur Radius keyframes (frame of an 18-f baseline): f0 0, f4 8, f8 18, f13 5, f18 0.
  Engine: `blur(px)` curve [0,0],[4,8],[8,18],[13,5],[18,0] (frames, scaled by duration/18) and `scale(1 -> 2)` ease (cubic-bezier(0.2,0,0.2,1) ~ from influence 80%) on the camera group; blur applied to the whole scene.

## Top techniques for a Vox-style collage film (ranked by value)

1. Stepped time everywhere: `posterizeTime` 12 fps on the scene, 8-12 fps on jitter/boil/draw-on. One quantised clock does most of the hand-made feel.
2. Secret Sauce chain on the final comp: 12 fps, per-frame exposure flicker ±0.04, grain intensity 0.3, scale 103% with 1 px stepped drift (24 Hz sampling, 6 Hz noise), glow 183/50/0.15.
3. Paper world: cream `#FAF8F1` ground + graph/newspaper/card-stock PNGs as `multiply`/`overlay`, with the texture sliding on a stepped wiggle (Mt. Mograph rig) instead of sitting static.
4. Rough-edged drawn marks: stroke "draw-on" (Trim End 0 -> 100, ease-out, 12 fps) + double Roughen Edges (Border 2-10, Scale 10 and 62-103, Sharpness 1.4-4.5) + Highlighter in `multiply`; implement as SVG `feTurbulence`+`feDisplacementMap` with the seed stepped.
5. Line boil: displacement amount ~5-33 with feTurbulence size 2-62 re-seeded 8 times per second (Pen/Pencil/Spotify pencil).
6. Rack-focus camera move: blur curve 0,8,18,5,0 over 18 f plus 100% -> 200% eased zoom (Focus.jsx).
7. Screen/CRT overlay kit: 5-6 px scanline/pixel-grid at 13-50%, S-curve LUT, 1-2 px chromatic fringe, lens bulge, vignette via exposure -1.28.
8. Letter animators: random-order pop-on, smooth rise-and-fade (LoadUp: 30 px, 12-17 f), cream fill wipe, per-letter stepped jitter.
9. Gate weave ±1.5 px at 24 fps + scale 101%, and heavy flicker `wiggle(24,.2)` exposure.
10. Audio line visualiser with three-stage glow (20/290/320 px at 0.6) at 10-12 fps.

## Unrecoverable / caveats

- Blend codes 26 (Curves adjustment layers, Spotify "Shape Layer 2") and 33 ("Faded Newspaper") and 27 ("Animated Felt Scan"): not resolvable from the header (SDK ids beyond 25 vary); treat as soft-light/overlay-class texture blends ~.
- Lumetri Color LUT/look data (FootageTreatments), CC Ball Action / Page Turn / Compound Blur / Thicc Stroke / Corner Pin / Gradient Ramp / Tint / Camera Lens Blur / Grid params in VOX Recreation and Texturing (listed in the reports, no parameter blocks in the saved comps).
- Text content and font sizes of text layers; masks and mask feather; shape path vertices.
- Keyframe tick scale differs per file (1000 vs 1024 per frame); frame counts are ±1 frame.
- Pen/Pencil Turbulent Displace `Evolution`: no expression found, so any boil comes from the 2-key Amount flip (33/31 or 29/31) only.
