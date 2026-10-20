# Chris Moran reels, batch 2 (13 reels)

Sources: transcripts + captions + contact sheets + a few frames. DRDHWMWCQRl had no transcript (video only partly downloaded); caption says it is his personal story, off-topic, skipped.
Everything is After Effects in the original; each entry ends with "Build:" for our HTML/canvas/SVG + ffmpeg stack.

---

## DMjAWcFJYqo · 2025-07-25 · 9.2k likes · Logo reveal in three effects
**Technique: choker reveal with a rough, stepped edge**
- What: three stacked effects on the logo layer: Simple Choker, Roughen Edges, Posterize Time = 12. Animate Simple Choker from a positive number down to 0; the matte "unchokes" and the logo grows out of a ragged blob.
- Why: the roughen edges acts on the choked matte, so the edge stays torn during the whole reveal; posterize time makes it step like hand-cut frames. Order matters (caption): roughen sits on top of the choker; posterize time goes on an adjustment layer on top of everything (or via expression), not inside the stack.
- Values: posterize time 12 fps; choker positive value to 0 (no px given, tune per logo); no easing stated.
- Build: render logo alpha, erode/dilate it with an SVG feMorphology or a canvas distance field (threshold of a blurred alpha), add noise to the threshold for the rough edge, step the animated radius at 12 fps (quantize t = floor(t*12)/12).

## DMtlFlxJ6sg · 2025-07-30 · 8.0k · Jimmy Dean ad look, redone as a High Noon beach scene
**1. Brand tint per layer** (tint effect, brand palette per layer: map black to one brand colour, white to another). Why: one palette across photos makes cutouts read as one print. Build: duotone via canvas pixel map or SVG feComponentTransfer / feColorMatrix per layer.
**2. Fake depth with contrast by distance.** Less contrast in the background, more in the foreground (the frame labels exactly this: "less contrast" on the far hills, "more contrast" on the cooler in front). Why: separates planes with no blur. Build: per-layer contrast + lift of blacks toward the sky colour (CSS filter contrast() or levels in canvas), strength as a function of layer depth.
**3. Cardboard texture on top of everything** (Texturelabs). Why: bakes all layers into one physical object. Build: one multiply/overlay texture PNG over the final frame.
**Caption extras:**
- Text texture: Wave Warp + Roughen Edges, plus a slight Heat Distortion so it seems to catch sunlight.
- Birds: stock footage with Threshold cranked until only silhouettes remain, a touch of blur to blend in.
- Camera: simple 3D camera, scene split in foreground / midground / background, wiggle on camera position for a choppy handheld feel; soft glow over everything so light "refracts" into the birds and text.
- Build: threshold a video frame to a 1-bit alpha silhouette then blur 1-2 px; camera = parallax translate per layer plus stepped noise (see DQsNA9RCcs_); glow = blurred copy of the frame screen-blended at low opacity.
- Look: 9:16, flat saturated cyan sky, white sans caps labels for annotations on the footage.

## DNmGyQupPlQ · 2025-08-20 · 19.2k · Realistic screen treatments
**Technique: stacked CRT/laptop screen micro-flaws**
- Recipe: Venetian Blinds for thin scanlines, then Chromatic Aberration, then CC Lens for a subtle bulge. For a flat laptop-style pixel grid: drop the bulge and duplicate the blinds (horizontal + vertical grid).
- The key detail: real screens flicker at the refresh rate, so add a tiny exposure pulse. Why it works: "you don't notice it, but you feel it".
- Exact expression (caption): seedRandom(index+time,true); flickerStrength = 0.03 (range 0.02 to 0.1 for subtlety); freq = 2 per second; holdTime = 1/freq; floorTime = floor(time/holdTime)*holdTime; value = random(-flickerStrength, +flickerStrength). So exposure is a random offset that holds for 0.5 s then jumps (sample-and-hold, not smooth).
- Build: overlay repeating-linear-gradient scanlines (1 px dark, 1 px clear) and a 1-px grid; split RGB channels 1-2 px apart; barrel distortion via SVG feDisplacementMap or a canvas shader; per-frame brightness multiplier 1 + rand(-0.03, 0.03) re-rolled every 0.5 s.

## DNuJS_oWoxM · 2025-08-24 · 11.2k · Texture stacking cheat sheet
**Technique: three texture bands, one layer per band**
- High (fine detail): film grain, colour noise, paper fibres. Mid (structure and grit): halftone, grunge, print scan. Low (broad washes): animated light refractions, light leaks, glass distortion, blur maps, vignettes.
- Rule: one High + one Mid + one Low. Never two in the same band: "too many mids" goes muddy and looks bad (shown on screen: two mids turn into mush). Amateur look came from stacking in one band.
- In the reel the three are: noise (highs), halftone (mids), animated refractions (lows).
- Build: three fixed overlay slots in our compositor (grain canvas animated at low fps, halftone/print PNG with multiply, slow-moving light-leak gradient with screen); lint rule: max one overlay per slot.
- Look of the reel itself: deep navy ground, cyan + magenta halftoned condensed sans caps ("3 CHANNEL TEXTURING"), mono small-caps sublabels, final screen is a white cheat sheet.

## DOMfGIfCbuQ · 2025-09-04 · 34.0k · Blending text into texture
**Technique: three effects against the uncanny pasted-on look**
1. Turbulent Displace with size down to 2: breaks the perfectly sharp vector edge.
2. Displacement Map, mapped to the texture below: text bends with the surface (paper fold, grain).
3. Noise inside the text with grain size matched to the texture's granularity (his "most important").
4. Never pure white or pure black: nudge colours off (real things are never pure).
- Build: text in canvas, displace it with the same texture's luminance as a displacement map (SVG feDisplacementMap, scale 2-4 px), multiply generated noise at the texture's grain scale into the glyph fill, clamp colours to roughly #f2efe6 / #1c1b19 instead of #fff/#000.
- Reel look: talking head with blue pill captions in a bold condensed sans.

## DOb0h6VCSpM · 2025-09-10 · 12.8k · Cutting on action
**Technique: hide the edit inside motion**
- What: place the cut while something is moving (e.g. bar chart mid-climb, cutting wide to tight). Why: the eye is tracking the moving element and does not notice the cut; on a still frame the cut is jarring and announces itself.
- He punches in and out of scenes often (extends scene life, keeps interest), so every punch cut needs motion to cover it.
- No numbers.
- Build: in our timeline, snap scene boundaries to the time of peak velocity of the main moving layer; punch-in = scale 1.0 to ~1.15 across the cut with the motion continuing in the same direction.

## DO60IqNif6o · 2025-09-22 · 5.5k · Presets + FX Console
Workflow, mostly off-topic for a code pipeline. Point worth keeping: "dry editing", save every effect stack and transform behaviour (overshoot, wiggle) as a reusable preset, applied non-destructively. Build: we already do this by making each look a named function/preset in the engine; keep overshoot/jitter as reusable transform modifiers.

## DPcvDgNDNM4 · 2025-10-06 · 1.7k · Google-style ad animation
**1. Extreme ease curves:** fast acceleration + fast deceleration (very steep, near-instant S curve). Why: snappy, excited feel.
**2. Cut at the curve peak:** scene change when the motion is at max speed, with the next scene continuing in the same direction. Example: gradient sweep across text, cut mid-sweep into a UI card rotating the same way, so momentum carries through (same idea as DOb0h6VCSpM).
**3. Glow:** Saber plugin (free, Video Copilot) mapped to text, plus 4-Color Gradient set to Hue blend mode on top.
- Build: easing like cubic-bezier(0.9, 0, 0.1, 1) or expo in-out; match exit velocity vector of scene A to entry vector of scene B; glow = blurred bright copy of text screen-blended plus a colour gradient layer in "hue" blend (canvas globalCompositeOperation = 'hue').

## DQpMiV_Cdpr · 2025-11-04 · 22.5k · Collage is about cohesion
**1. Build a colour system.** Colour-pick from a few strong references (he calls it cheating; faster than theory). Fit every photo to it with Tint: map whites to one colour, blacks to another; dial the Tint amount back for a subtler look. The reel shows a 4-swatch system: a red, a cream, a near-black and a white; tinted photo ends up cream highlights + dark teal-grey shadows.
**2. Hide low-quality assets under high-quality texture.** A halftone or fine grain disguises a low-res image (shown: a 540x300 photo vs 5260x4000 texture) and gives a printed feel. Halftone is a found texture; the photo is applied to it with a Luma Matte, then Levels tweaked until it feels right.
- Build: pick 4 palette colours from refs; duotone every cutout (black to palette dark, white to palette light, mix 0.6-1.0); halftone = luminance-thresholded dot pattern as mask on the photo (or multiply a high-res halftone texture, then levels/contrast); upscale low-res assets with the grain on top.
- Look: cream (#fbfbdc-ish) ground, hot-pink/red serif display type ("collage" in a high-contrast italic serif), grey-teal photo cutouts, pink pill captions, timeline-year ticks.

## DQsNA9RCcs_ · 2025-11-05 · 4.6k · Jitter effect (handmade feel)
**Technique: jitter instead of wiggle**
- What: random snap to a new value, held, then another; apply to position, rotation, scale, and even to text titles (paper-cutout feel). Wiggle oscillates smoothly (software-generated look); jitter snaps like real cutouts nudged under a stop-motion camera. Caption: randomness matters, and even heavy Posterize Time does not hide wiggle's smooth oscillation.
- Implementation: two lines of expression (not shown legibly; two free presets, text and object). No numbers given; the pictogram shows jitter as scattered discrete points vs wiggle as a continuous loop.
- Build: jitter(t) = hash(floor(t*fps_j) , seed) mapped to +-N units, held between steps. Suggest fps_j 8-12, position +-2-4 px, rotation +-0.5-1 deg, scale +-0.5-1% (our guess, tune by eye). Use separate seeds per layer and per property.
- Look: cream ground, dark navy serif titles, red pill labels, Chicago-newspaper collage.

## DQu3nYiCepd · 2025-11-06 · 21.3k · 2.5D with the Depth plugin
**Technique: layers spread in 3D, camera dolly/pan for parallax**
- Lay out foreground / mid / background; the free "Depth" plugin's Disperse button spaces the layers along Z automatically; then dolly or pan the camera gives parallax. Removes the hassle of the AE 3D camera.
- Build: each layer gets z; screen offset = camera movement * (1/z) (translate), scale about vanishing point; auto-assign z by sort order with even spacing; dolly = scale layers by f/(z - camZ).

## DRDHWMWCQRl · 2025-11-14 · 3.9k · Personal story
Off-topic, skipped (no transcript).

## DR0HIWTiTkJ · 2025-12-03 · 9.7k · Spotify Wrapped 2025 look
**Technique set (generative line art)**
- Repeating shapes, etch-a-sketch lines, soft-black palette.
- Concentric outlines: a shape layer with Stroke + Offset Paths repeated outward.
- Everything ripples with the music: Wave Warp on an adjustment layer over the whole frame.
- Trippy overlays: stack comps, top one in Difference blend.
- Colour: keep artwork black, white and 50% grey, then map with Tritone (highlights, midtones, shadows) to the brand palette in one pass; mask and invert it for extra stylization.
- Scribbles: Turbulent Displace on top, animate Evolution.
- Build: SVG/canvas strokes repeated with growing offsets (offset path = scaled stroke or Clipper offset); feTurbulence + feDisplacementMap with animated baseFrequency/seed for wobble; globalCompositeOperation 'difference'; final tritone as a 3-stop gradient map LUT on luminance (works for the whole film, ties to the colour system lesson).
- Look: dark UI recording with AE panels; red pill captions; screen-recorded tutorial.

---

## Batch synthesis: 10 most valuable lessons
1. Whole-film cohesion comes from one palette + duotone/tritone mapping every asset (black to palette dark, white to palette light) before anything else.
2. Texture in three bands only (fine grain / halftone-print / soft light wash), exactly one per band; two of the same band equals mud.
3. Hide low-quality assets under high-res halftone or grain: texture is a quality equaliser, not decoration.
4. Replace smooth wiggle with held random jitter (8-12 fps steps) on position/rotation/scale/text to get stop-motion cutout feel; wiggle looks like software.
5. Integrate text with its surface: tiny turbulent displacement (about 2) + displacement by the texture + matched-grain noise inside glyphs + never pure white/black.
6. Cut on motion: place cuts at peak velocity and keep direction across the cut; still cuts feel jarring.
7. Fake depth cheaply: lower contrast in background, higher in foreground, plus z-spread layers with parallax camera (auto-space the z values).
8. Reveal by animating a choker/threshold from positive to 0 with rough edges and posterized time (12 fps), so reveals feel torn and hand-cut.
9. Add imperceptible micro-flicker (sample-and-hold exposure noise, +-3% every 0.5 s) and scanline/chromatic details to screens so they read as real.
10. Extreme ease (fast in / fast out) gives the energetic Google-ad feel; build looks once as reusable presets (dry editing).
