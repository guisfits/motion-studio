# Chris Moran reels, batch 1 (13 reels)

Source: transcripts + captions + a few frames. Reels were posted 2025-06-23 to 2025-07-25. Numbers marked (frame) were read off an AE screenshot; "not stated" means he gave no value. Most reels are short (20-45 s), voiceover over screen-recorded AE. Reel look: vertical 9:16, phone-filmed monitor, red/yellow pill captions with condensed bold caps (e.g. "FOR EXPOSURE."), fast cuts every 2-3 s.

Sponsored/off-topic: none. Several end with "free presets in my bio" (lead magnet, not a technique).

---

## 1. DLQw7mqJzRp · 2025-06-23 · 46.8k likes · "How Vox makes flat screens feel alive" (3 subtle layers)
Technique: the "screen recording" stack of three overlays so a green-screen/UI capture never feels sterile.
1. Scan lines
   - What: a fine horizontal line texture over the screen content.
   - Why: gives the digital surface a physical CRT/monitor presence.
   - Values: blend mode Overlay or Color Dodge, opacity "adjust" (not stated).
   - Build: tiled 1-2 px repeating-linear-gradient layer in a canvas/CSS pass, `mix-blend-mode: overlay`, alpha 0.1-0.3 to taste.
2. Chromatic aberration
   - What: RGB channel split. Why: lens-like fringing; he says go "slightly heavier than usual".
   - Build: render layer to canvas, draw R/B copies offset +-1-3 px (or SVG feOffset per channel + screen blend); ffmpeg `rgbashift`.
3. Subtle vignette
   - What: darkened edges. Why: guides the eye to centre; reads as documentary, makes viewer "part of the story".
   - Build: radial-gradient overlay, multiply, transparent centre -> ~0.3-0.5 black at corners.

## 2. DLQ4Wp9pqv3 · 2025-06-24 · 10.5k · "Vox has one of the coolest animation styles" (the 4 global rules)
Techniques (the master checklist):
1. Global chromatic aberration over everything (free plugin, not named in transcript). Build as in #1, applied once on the final composite, not per layer.
2. Frame rate cut to about 12 fps. Posterize Time effect. Why: stop-motion/hand-made feel, hides digital smoothness. Build: render at 12 fps, or quantise the animation clock `t = floor(t*12)/12` for all non-camera motion; output at 24/30 by duplicating frames (ffmpeg `fps=12` then `fps=30`, or `framerate` hold).
3. Long, smooth ease-ins of 1-2 seconds. Why: slow settle feels confident and calm against the choppy 12 fps. Build: easeOut/easeInOutCubic-or-sine with 1000-2000 ms durations for moves.
4. Almost never flat solid colour; everything mapped to a texture. Build: every fill gets a paper/grain texture via blend (see #9).

## 3. DLR8e0NuUh9 · 2025-06-24 · 27.1k · "How Vox sound design makes their videos come alive"
- What: tactile foley layered under every visual event.
- Why: sound you can "feel" engages a second sense and makes cut-paper objects feel physical.
- Sound vocab: paper rustles, felt marker, film camera snaps, set clicks. He shows more search terms and free SFX libraries on screen (not in transcript).
- Values: "adjust your levels" only; none given.
- Build: an SFX bus keyed to scene events (paper in/out = rustle, stamp/pin = click, camera move = shutter snap); randomise sample pick and +-2 dB/+-5% pitch so repeats don't sound looped; mix under VO.

## 4. DLShlJxRXZe · 2025-06-24 · 12.3k · "How Vox map graphics guide your eye"
Technique: depth-of-field focus pull on a map to direct attention.
- Recipe: radial gradient layer, blend Multiply; adjustment layer with Compound Blur using the gradient as blur map; animate the gradient's centre to the target place. Add line effects with Trim Paths.
- Why: frame with no hierarchy is flat; a blur everywhere except the target says "look here first".
- Values: no numbers.
- Build: render map to canvas; second pass blurs (`ctx.filter=blur(Npx)`) and composites the sharp copy through a radial mask whose centre/radius tween to the target. Route lines: SVG path with animated `stroke-dashoffset`.

## 5. DLTLw1DpgwE · 2025-06-24 · 17.7k · "Vox-inspired type animation"
Techniques (built with AE text animators, saved as presets):
1. Brand-colour pop then settle: yellow pops in, fades to charcoal for legibility. Why: accent grabs the eye, dark text reads. Build: per-word colour tween accent->ink over about 0.5-1 s.
2. Odometer / slot-machine letter pop-in: random letters appear in place before resolving. Build: per-char scramble through random glyphs, locking left to right on a short stagger.
3. Rule: only one text animation at a time. Why: otherwise the viewer doesn't know where to read. Build: scheduler allows one active type effect per scene.
- Values: none beyond "seconds" to build.

## 6. DLX9PJ_pwBA · 2025-06-26 · 14.5k · "borrows from old-time cinema" (jitter + exposure flicker)
- What: two expressions on one layer: position jitter and exposure flicker, plus a little Add Grain on top. Effect stack (frame): Quick Chromatic Aberration 3 -> Posterize Time -> Exposure -> Add Grain -> Transform.
- Why: early film had mechanical jitters and brightness shifts baked into each frame; it cuts the clinical crispness of digital.
- Values (frame): position shows 540,960 -> 539.3,961.0, i.e. under 1 px jitter around centre on a 1080x1920 comp; exposure master driven by expression (base 0.00); expression text not legible. Posterize Time sits above Exposure so the flicker steps at the low fps.
- Build: per held frame, offset = random +-1 px (seeded, quantised to 12 fps), exposure = `1 + rand(-0.03..0.03)` as CSS brightness/ctx.filter; grain overlay on top.

## 7. DLdy8b5JpHC · 2025-06-29 · 16.9k · "focus hunting"
- What: DSLR-style refocus: blur pulses in and out as if the lens is searching.
- Why: adds spatial realism/depth; best when something zooms or moves fast.
- Values: Fast Box Blur on an adjustment layer, a few keyframes shifting blur amount (not stated numerically; judging from the idea, small pulse of a few px up to maybe 10-20 px, our guess).
- Build: blur px tween on the whole scene with 2-3 overshooting keyframes (e.g. 0 -> 12 -> 3 -> 0 over 0.5-0.8 s) timed to a zoom or cut.

## 8. DLnuz5ZJ6Ys · 2025-07-02 · 35.6k · "marimba scoring"
- What: marimba-led music bed (Vox licenses from KPM; expensive, he gives search terms and adjacent instruments on screen).
- Why (3): the frequency range does not compete with the narrator; emotionally neutral so attention stays on information; years of educational TV conditioned viewers to lean in for information.
- Build: pick a pizzicato/marimba/glockenspiel/kalimba bed, low and mid-light, duck under VO (about -18 to -22 dB below voice, our guess); keep rhythmic but sparse.

## 9. DL24UePpHWN · 2025-07-08 · 82.2k (best performer) · "Sourcing and integrating textures"
Techniques:
1. Choose textures like ingredients: for a title card, faded newspaper + macro stock paper. Source from two free sites (named on screen, not in transcript).
2. Blend with blend modes, but control strength with Curves on the texture, not opacity. Why: opacity makes the texture feel less integrated and muddies colour; Curves changes the texture's luminance levels so it stays crisp and only the light/dark balance shifts. Values (frame): RGB curve, a gentle S-curve (shadows nudged down, highlights up), small adjustment.
3. Displacement map from the texture onto the text, so letters pick up the paper's surface form.
- Build: textures as images; `mix-blend-mode: multiply` (darks) / `screen` or `overlay`; pre-process the texture with a levels/contrast curve (canvas LUT or SVG feComponentTransfer) rather than lowering alpha. Displacement: SVG feDisplacementMap with the paper texture as map, scale about 2-6 px.

## 10. DMDyGp6Jwwx · 2025-07-13 · 3.5k · Barbie "life flashing" soundscape
Techniques:
1. Start soft: out-of-focus leaves + atmospheric sound primes emotion (alternatives: waves, train window).
2. Home-video footage gets high-pass and low-pass filter plus reverb, with an Everyone's-in-take; why: carve EQ space for the music and make footage sound like a distant memory.
3. Spinning footage = passage of time.
4. Keyframed exposure flashes between scenes.
- Values: not stated.
- Build: WebAudio/ffmpeg chain `highpass=f=300, lowpass=f=3500` (our guess) + reverb (`aecho`/convolution) on memory clips; rotation tween on backdrop layer; exposure spike (brightness 1 -> 2 -> 1 in about 4-6 frames) at cuts.

## 11. DMOpmHxpAOA · 2025-07-18 · 35.6k · "Footage homogenization"
- What: layer the same effects on every clip so mismatched sources (different cameras/eras/quality) look like one world.
- Why: if a shot serves the story, keep it; consistency of treatment hides differences. No exact recipe matters, consistency does.
- Stack named: grain + blur map + a bit of chromatic aberration.
- Build: one shared post chain on every footage/image layer (same grain amount, same CA, same colour grade, same posterize fps). Applies hard to our mixed public-domain engravings/photos/manuscript scans: one treatment pass per asset class, then one global pass.

## 12. DMWEwQRp6aD · 2025-07-20 · 2.0k · "Life to a static image" (glow + grain)
- What: a static image gets a pulsing glow driven by an expression, plus grain.
- Why: tiny shifts of light and grain add energy; stops it reading like a slideshow; also usable as TV flicker; seen in Netflix title sequences.
- Values (frame): Glow adjustment layer: threshold 60%, radius 42, intensity 0.2 (expression on intensity, text not legible; he says "no need to overcook", so keep the swing small), composite original Behind, operation Add, colours Original.
- Build: bloom pass (blur of bright pixels, threshold 0.6, radius about 42 px at 1080 wide, `screen`) with intensity = `0.2 + noise(t)*small`, animated at the low fps; layer grain on top.

## 13. DMixnWEpuhj · 2025-07-25 · 11.8k · "Box-style markup" (circles, arrows, callouts)
- What: hand-drawn annotations over footage.
- Why: frame alone has no hierarchy; markup is "an invisible teacher's hand" saying look here first.
- Recipe: simple shapes animated with Trim Paths for the draw-on; Roughen Edges for an organic hand-drawn look; for chalky, stack a second Roughen Edges at lower scale. Values not stated.
- Build: SVG paths, `stroke-dashoffset` draw-on over about 0.4-0.8 s; roughness via feTurbulence + feDisplacementMap (two passes: coarse and fine scale for chalk), quantised to 12 fps so the wobble boils.

---

## Batch synthesis: top 10 lessons

1. Treat the look as one global post chain: 12 fps quantise + chromatic aberration + grain + vignette applied to the final composite and to every source (reels 2, 11, 1).
2. Run motion at about 12 fps but keep eases long (1-2 s ease-in/out); choppy cadence plus slow settle is the signature (reel 2).
3. Never flat colour: every fill/shape is texture-mapped (reel 2).
4. Tune texture strength with a Curves/levels pass on the texture, not by dropping opacity; then displace text with the paper map (reel 9, highest-liked).
5. Homogenise mixed assets: the same treatment on every clip/image so archive sources cohere (reel 11).
6. Cheap life for any still: sub-pixel position jitter (about 1 px) + exposure flicker + grain, at the low fps (reel 6); add a bloom pulse (threshold 60%, radius 42, intensity about 0.2) (reel 12).
7. Foley is half the look: paper rustle, marker, camera snap, set clicks on every event (reel 3).
8. Marimba/pizzicato bed that sits out of the VO band and stays neutral (reel 8).
9. Direct the eye with selective blur: a moving radial focus mask on maps and a focus-hunting blur pulse on fast moves; plus hand-drawn Trim-Path-style markup (reels 4, 7, 13).
10. One type effect on screen at a time; accent colour pop then settle to charcoal; odometer letter lock-in (reel 5).
