# Chris Moran: what this role must know (184 lessons)

Source: Chris Moran (`@chrismoran__`), professional motion designer teaching the editorial-collage look in After Effects, 52 tutorial reels.
Every lesson below was extracted from the reel's transcript and its on-screen panels (OCR at 2 fps); the full ledger is `tutorials/chrismoran/lessons.jsonl`.
Values are his (After Effects units); `~` = read uncertainly; "not stated" = he gave none. `Build` says how this engine does it.
Lessons marked *(shared)* are owned by another role; know them, do not execute them.

Where a lesson and `tools/checks/norms.mjs` disagree, the norm gates the render; raise the conflict to the Director.

## Section index (read a section with `offset`/`limit`, not the file)

- Structure, pacing, retention: line 26
- Composition and hierarchy: line 42
- Camera and focus: line 69
- How pieces move: line 181
- Transitions: line 322
- Paper and texture: line 419
- Colour and grade: line 630
- Film and screen treatments: line 726
- Cut-out and collage: line 920
- Type, callouts and annotation: line 964
- Maps and data: line 1152
- Workflow and tools: line 1224
- What reads as fake: line 1366

## Structure, pacing, retention

1. **Use it when something zooms or moves fast** *(shared)* — Focus hunting works best during a zoom or fast motion.
   - trigger the blur keys on a zoom or fast move
   - Why: motion masks the effect and sells camera realism
   - Build: couple blur keyframes to zoom events
   - Source: reel `DLdy8b5JpHC` 0:17-0:21
2. **Before/after by toggling each preset on in turn** *(shared)* — The demo shows the two presets as a panel with OFF/OFF, then Gate Weave ON, then both ON, so the viewer sees each imperfection added separately.
   - start with both treatments off
   - turn Gate Weave on (28s)
   - then turn Exposure Flicker on (29s)
   - Values: `presets` Gate Weave, Exposure Flicker; `states` OFF/OFF at 25.5-27s, ON/OFF at 28s, ON/ON at 29-30s
   - Why: isolates each effect's contribution for the viewer
   - Build: render A/B variants with each post-pass flag toggled; cut between them
   - Source: reel `DTJJq9JiXxj` 0:25-0:30

## Composition and hierarchy

1. **Maps steer attention, not just decorate** *(shared)* — Map visuals should manipulate focus and tell the viewer where to look.
   - treat the map as a focus tool
   - Why: directs the eye
   - Source: reel `DLShlJxRXZe` 0:00-0:04
2. **Markups as an invisible teacher's hand** *(shared)* — When a frame has no hierarchy or focal point, circles, arrows and callouts override it and say 'look here first'; demo on a map of east-coast states with a 'Look here first' label.
   - identify frames with no focal point
   - add one markup that names the target ('Look here first')
   - Values: `markups per frame` one focal markup in the demo
   - Why: improves comprehension by guiding the eye
   - Build: annotation overlay layer (circle/arrow/label) keyed to the narration beat
   - Source: reel `DMixnWEpuhj` 0:04-0:13
3. **Fake depth: low contrast back, high contrast front** *(shared)* — Reduce contrast on the background and raise it in the foreground for visual separation.
   - background layer: less contrast
   - foreground layer: more contrast
   - Why: cheap atmospheric-perspective depth cue
   - Build: per-layer contrast() filter, lower on back planes
   - Source: reel `DMtlFlxJ6sg` 0:23-0:30
4. **Treat the image as typography: match scale and align** *(shared)* — The key to a rebus: size the image like type and line it up with the text.
   - match the image's scale to the adjacent type
   - align it with the text line
   - Values: `scale` match text height
   - Why: the image reads as part of the word
   - Build: size icons to cap height, baseline-aligned in the layout
   - Source: reel `DdoVHX5gfP-` 0:25-0:35

## Camera and focus

1. **Camera move via a parent Zoom null** — All artwork layers are parented to one null named Zoom; the eased push-in is animated on that null, not on each layer.
   - create a null 'Zoom'
   - parent every art layer to it
   - animate scale/position on the null with the long ease
   - Values: `parent` 11. Zoom (all layers); `move` push-in, values not stated
   - Why: one control moves the whole collage as a camera
   - Build: scene-level camera transform (scale/translate) applied to the world group
   - Source: reel `DLQ4Wp9pqv3` 0:04-0:21
2. **Subtle vignette guides the eye and sells journalism** *(shared)* — Third layer is a subtle vignette; the trio is used in documentaries to make viewers feel part of the story.
   - subtle vignette layer
   - Values: `vignette strength` subtle, not stated
   - Why: it places the viewer inside the journalism, not just polish
   - Build: radial gradient multiply, low alpha, in the final-pass stack
   - Source: reel `DLQw7mqJzRp` 0:13-0:21
3. **Focus vignette with a Compound Blur** — A radial gradient in Multiply darkens the edges, and an adjustment layer with Compound Blur uses the gradient as its blur map; animating the gradient centre moves the focus.
   - new solid with a radial gradient, blend Multiply
   - adjustment layer above the map with Compound Blur
   - Blur Layer = the radial gradient layer (dropdown)
   - Maximum Blur 15, If Layer Sizes Differ: Stretch Map to Fit
   - animate the gradient Start Point to the subject
   - Values: `blend mode` Multiply; `effect` Compound Blur; `Maximum Blur` 15.0; `If Layer Sizes Differ` Stretch Map to Fit; `Invert Blur` option shown, state not readable; `gradient Start Point` 293.2,-487.2 moving to 293.2,-325.2; `comp fps` 24
   - Why: focus manipulation, as Vox maps do
   - Build: radial-gradient multiply mask plus a blur whose radius is read from the same mask (two-pass: sharp + blurred, mixed by mask), centre keyed to the target
   - Source: reel `DLShlJxRXZe` 0:04-0:17
4. **Focus hunting adds spatial realism** — Mimic a DSLR searching for focus with a short shifting blur; it adds a sense of depth.
   - blur in and out like a lens refocusing
   - Values: `effect` Fast Box Blur
   - Why: increased sense of spatial realism
   - Build: animate a blur pass on the world layer up and back to 0
   - Source: reel `DLdy8b5JpHC` 0:00-0:09
5. **Focus-hunt keyframes: 0, 4, 6, 0 px** — One adjustment layer with Fast Box Blur; four eased keyframes on Blur Radius: 0, 4, 6, back to 0 px.
   - Layer > New > Adjustment Layer
   - Fast Box Blur, Blur Dimensions Horizontal and Vertical, Repeat Edge Pixels on
   - keyframe Blur Radius 0 -> 4 -> 6 -> 0 px, all Easy Ease
   - Values: `Blur Radius keys` 0 px, 4 px, 6 px, 0 px ('my settings' card); `interpolation` Easy Ease (hourglass keys); `Blur Dimensions` Horizontal and Vertical; `Repeat Edge Pixels` on; `Iterations` not readable
   - Why: a short rise and fall reads like a lens hunting
   - Build: ctx.filter blur keyed 0->4->6->0 px with ease-in-out, edges clamped
   - Source: reel `DLdy8b5JpHC` 0:09-0:17
6. **Choppy handheld camera: 3D camera with wiggle on position** — Three planes as 3D layers with a simple 3D camera whose position has a wiggle gives the choppy handheld look of the ad.
   - split FG/MG/BG into 3D layers
   - simple 3D camera
   - wiggle on camera position
   - Values: `wiggle` values not stated
   - Why: copies the choppy handheld look of the reference ad
   - Build: parallax camera with per-plane depth scaling plus stepped random offsets on camera x/y
   - Source: reel `DMtlFlxJ6sg` caption
7. **Punch in and out: 1x to 2x scale, hidden by motion** *(shared)* — He punches in and out of scenes a lot (shown as a kinetic '2x SCALE' then '1x SCALE' type gag) to extend a scene's life, always timing the change on motion.
   - punch in to ~2x, later back to 1x
   - time each punch on a moving element
   - Values: `punch-in` 2x scale; `punch-out` 1x scale
   - Why: extends scene longevity and keeps the viewer engaged
   - Build: scene camera scale steps 1x <-> 2x keyed on motion beats
   - Source: reel `DOb0h6VCSpM` 0:24-0:31
8. **Depth script: Disperse layers in z** — The free Depth script (Yat Fung Leung) distributes selected layers in 3D without breaking existing animation: select the layers, press Disperse.
   - install Depth (free, $0+)
   - select the scene layers (3D on)
   - Focal Length 50mm, Layer Spacing 1000, optional Create Camera Null
   - press Disperse
   - Values: `tool` Depth v1.0.2 script (free); `Focal Length` 50mm; `Layer Spacing` 1000; `options` Create Camera Null, Disperse, Move
   - Why: the 3D camera is intimidating; this sets depth in one click
   - Build: assign each plane z = index * spacing and scale it by (z+f)/f so it keeps its framed size
   - Source: reel `DQu3nYiCepd` 0:06-0:21
9. **Camera rig: 35mm camera on a controller null, depth of field on** — A 35mm camera is driven by a Camera Controller null; depth of field is enabled.
   - camera preset 35mm
   - Camera Controller null parenting the camera
   - Enable Depth of Field
   - Values: `preset` 35mm; `angle of view` 54.43°; `zoom` 370.42 mm; `focus distance` 1734.26 mm; `depth of field` on; `blur level` 100%; `comp fps` 23.976
   - Why: a single null moves the camera; DOF sells depth
   - Build: camera object with focal length and per-plane blur by distance from focus plane
   - Source: reel `DQu3nYiCepd` 0:07-0:10
10. **Dolly or pan the camera for parallax** — Once layers are spread in z, a dolly or pan of the camera gives smooth parallax depth; great for collage animation.
   - animate the camera controller: dolly in or pan
   - Why: near planes move more than far planes
   - Build: parallax factor per plane = f/(z+f) applied to camera translation
   - Source: reel `DQu3nYiCepd` 0:21-0:27
11. **Fringe blur with Compound Blur and a map** — Soften the edges of the frame while keeping the subject sharp, using Compound Blur driven by a map layer.
   - Effects > Compound Blur on the photo
   - Blur Layer = a map layer (white at the edges, dark on the subject)
   - raise Maximum Blur
   - Values: `effect` Compound Blur; `Blur Layer` '5. Map 3'; `Maximum Blur` 8.0 -> 21.0 -> 26.0
   - Why: depth: subject sharp, frame fringe soft
   - Build: blur pass masked by a radial gradient (max ~26 px at the edge)
   - Source: reel `DZFqNzwAqVa` 0:05-0:09
12. **Vignette to guide the eye** — Use a vignette to guide the viewer's eye to the subject.
   - vignette layer above the photo
   - Why: steers the eye
   - Build: radial gradient multiply
   - Source: reel `DZFqNzwAqVa` 0:12-0:16
13. **Slow zoom on a Zoom null: ~108% to 115%** — Add slow zooms so it feels like a physical photo being filmed; the scale lives on a parent 'Zoom' layer at the top of the stack.
   - layer stack: Zoom, Vignette, Film Dust, Map, Lens Blur, image, Frame
   - keyframe Zoom scale slowly upward
   - Values: `Scale` 108.0% -> 115.0% (values during playback); `fps` 23.976; `stack` Zoom / Vignette 3 / Film Dust / Map 6 / Lens Blur 6 / image / Frame 6
   - Why: feels like a camera filming a real print
   - Build: scale keyframe ~1.08->1.15 over the shot on the photo group
   - Source: reel `DZFqNzwAqVa` 0:16-0:20
14. **Slow camera dolly or pan for parallax** — Slowly dolly or pan the camera so the planes shift at different speeds and the viewer feels immersed in the photo.
   - animate camera/null position on X (pan) or Z (dolly)
   - keep it slow
   - Values: `camera position` x 683 -> 814 -> 952 -> 1102 at y 960, z -1500 (scrubbed); `speed` slow (exact keyframes not shown)
   - Why: parallax = depth = video-like
   - Build: per-layer translate = cameraOffset * f/(f+z); slow linear/eased pan
   - Source: reel `DZsDDmvtNJP` 0:31-0:37
15. **Shadow plate in Multiply, slow position keyframe drifts the light** — Set the shadow plate to Multiply at 100% opacity and add a slow Position keyframe so the light gently drifts across the frame.
   - Opacity: Blend Mode Multiply, 100%
   - Motion > Position keyframes, slow drift on X
   - Values: `Blend Mode` Multiply; `Opacity` 100%; `Scale` 100; `Anchor Point` 3500.0,2333.5 (image centre); `Position` starts ~572,960; end not shown; `speed` slow
   - Why: moving light gives the still life
   - Build: translate a multiply shadow plate slowly across the clip duration
   - Source: reel `DdKZ5oBpPCW` 0:34-0:38

## How pieces move

1. **Cut frame rate to 12 fps with Posterize Time** — Vox animation is stepped at about 12 fps with Posterize Time on the finishing adjustment layer.
   - add Posterize Time to the top adjustment layer
   - Frame Rate 12.0
   - Values: `effect` Posterize Time; `Frame Rate` 12.0
   - Why: stepped motion gives the hand-made stop-motion feel
   - Build: quantize time t=floor(t*12)/12 for animated layers; output 24/30 with held frames
   - Source: reel `DLQ4Wp9pqv3` 0:08-0:12
2. **Long smooth eases of 1-2 seconds** — Moves use very smooth eases stretched over a long time; he shows the speed graph and labels it 'copy this easing'.
   - ease the camera/zoom keyframes over 1-2s
   - speed graph: one smooth bell, slow start and slow end
   - Values: `ease duration` 1-2 s; `speed graph scale` up to 250 %/sec shown; `keys` ~0:00 to ~2:12f on the graph
   - Why: long eases read calm and polished against the stepped frame rate
   - Build: cubic ease-in-out (strong influence, ~0.8-0.9) over 1-2s on camera and element moves
   - Source: reel `DLQ4Wp9pqv3` 0:12-0:17
3. **Dry editing: motion presets on a Transform effect** — Put motion (overshoot, wiggle) on a Transform effect instead of the layer's own transform, so motion stacks non-destructively on top of existing keyframes; he calls it dry editing (don't repeat yourself).
   - apply Effect > Distort > Transform to the layer
   - keyframe the effect's Position/Scale/Rotation (overshoot), or apply a wiggle preset
   - save it as a preset; stack several
   - Values: `Transform base` Anchor 540,960, Position 540,960, Scale 100, Opacity 100, Shutter Angle 0, Use Composition's Shutter Angle on; `wiggle presets` Wiggle - position, rotation, scale, shear, gelatin; Wigglerama
   - Why: speed and quality without touching base animation
   - Build: motion modifiers (overshoot, wiggle) as composable functions applied over base keyframes
   - Source: reel `DO60IqNif6o` 0:30-0:44
4. **Extreme ease curves: spike-shaped speed graph** — Strong acceleration and deceleration; the speed graph is a sharp spike in the middle with long flat tails (fast acceleration, fast deceleration).
   - keyframe the move
   - in the speed graph pull influence very high on both keys so speed spikes mid-move
   - Values: `curve shape` spike: flat tails, sharp mid peak; `influence values` not stated (~90%+ implied by the shape)
   - Why: quick motion creates excitement
   - Build: expo in-out (or cubic-bezier(0.9,0,0.1,1)) on moves
   - Source: reel `DPcvDgNDNM4` 0:03-0:08
5. **Collage comp also steps time** — The collage timeline has a top adjustment layer with Posterize Time driven by a Controller layer.
   - adjustment layer with Posterize Time over the collage
   - a Controller null to set the rate
   - Values: `Posterize Time rate` not readable
   - Why: collage motion steps like stop-motion
   - Build: time quantize on the collage scene
   - Source: reel `DQpMiV_Cdpr` 0:31-0:33
6. **Jitter, not wiggle: snaps to random values** — Wiggle's motion path glides between values and feels software-made; jitter's path snaps to random values like cutouts nudged under a rostrum camera. A side-by-side motion-path diagram shows both.
   - drop jitter on Position, Rotation or Scale
   - never use wiggle for the stop-motion look
   - Values: `wiggle` smooth path between values; `jitter` snaps to random values
   - Why: randomness with holds is the stop-motion signature
   - Build: hold-random offsets refreshed N times per second (random, not noise), applied to transforms
   - Source: reel `DQsNA9RCcs_` 0:12-0:21
7. **Jitter expression (Position)** — Two working lines: seed the random by the floored time so each value holds for 1/fps, then add a random offset.
   - Alt-click the Position stopwatch and paste:
   - fps = 2; // number of times it will move per second
   - seedRandom(Math.floor(time * fps), true);
   - jitter = 6; // maximum amount of pixels it will move
   - value + [random(-jitter, jitter), random(-jitter, jitter)]
   - Values: `fps` 2 moves per second; `jitter` 6 px max; `seed` Math.floor(time * fps), timeless true
   - Why: held random steps read as hand-placed frames
   - Build: offset = rand(seed=floor(t*2)) * 6px per axis, held between steps
   - Source: reel `DQsNA9RCcs_` 0:26-0:28
8. **Concentric outlines: shape stroke plus Offset Paths** — A stroked shape layer with Offset Paths expands into concentric outlines.
   - shape layer + Stroke
   - Add > Offset Paths (with copies) to expand outward
   - Why: the repeating-shapes look
   - Build: SVG: N offset outlines of one path (stroke only), animated outward
   - Source: reel `DR0HIWTiTkJ` 0:12-0:18
9. **Wave Warp on an adjustment layer so the frame ripples** — Wave Warp (Distort) on an adjustment layer makes the whole frame ripple gently with the music.
   - adjustment layer on top
   - Effect > Distort > Wave Warp
   - Values: `Wave Warp values` not shown
   - Why: everything vibes with the music
   - Build: whole-frame sine displacement (SVG feDisplacementMap or shader)
   - Source: reel `DR0HIWTiTkJ` 0:18-0:24
10. **Scribbles: Turbulent Displace with animated Evolution** — On the pencil scribble layer: Turbulent Displace (Amount 5, Size 62) with Evolution animated so the lines boil; trim sliders draw it on.
   - pencil/scribble shape layer
   - Turbulent Displace: Amount 5, Size 62, Complexity 1
   - animate Evolution
   - Trim In/Out Duration sliders (1.00 s) draw the line on and off
   - Values: `Displacement` Turbulent; `Amount` 5.0; `Size` 62.0; `Offset` 540.0,960.0; `Complexity` 1.0; `Evolution` animated (starts 0x+0.0°); `Pinning` Pin All; `Antialiasing` Low; `Trim In Duration` 1.00 s; `Trim Out` slider 100 (unclear)
   - Why: hand-drawn boil
   - Build: feTurbulence seed/time stepped, displacement scale ~5px, large feature size; stroke-dash draw-on 1s
   - Source: reel `DR0HIWTiTkJ` 0:45-0:50
11. **Draw the line with Trim Paths, then taper the end** — Animate the stroke with Trim Paths, then in the stroke's Taper settings dial End Length until the weight feels like a pen lifting off the page.
   - shape path, Stroke 15 px, Round Cap, Round Join, Opacity 100%
   - Add > Trim Paths, animate End
   - Stroke > Taper: Length Units Percent, raise End Length
   - Values: `Stroke Width` 15.0; `Line Cap` Round Cap; `Line Join` Round Join; `Composite` Below Previous in Same Group; `Length Units` Percent; `End Length` not readable (fields read 0-2% while he dials); `Start/End Width, Ease` 0.0%
   - Why: pen lifting off the paper
   - Build: SVG stroke draw-on with a width-tapered outline polygon near the end
   - Source: reel `DT2_SIMgBfI` 0:10-0:19
12. **Offset the copies slightly in time so they stack** — Offset each duplicate slightly on the timeline so the copies do not move in lockstep and visually stack.
   - slide each layer a few frames on the timeline
   - Why: lockstep copies look like one layer
   - Build: per-copy audio offset of a few frames when sampling
   - Source: reel `DVRV9hiCX4F` 0:25-0:28
13. **Edge boil: why hand-drawn lines wiggle** — Edge boil is one of the easiest ways to make animation feel crafted; before software every frame was drawn by hand, so each line differed slightly and shapes wiggled frame to frame.
   - recognise the boil as frame-to-frame line variance
   - Why: hand-drawn frame-by-frame variance reads as crafted
   - Source: reel `DZdCD2YNk4d` 0:07-0:19
14. **Edge boil recipe: Roughen Edges + Turbulent Displace** — First Roughen Edges with Border about half the stroke width, then Turbulent Displace with Amount 80 and Size 2 for the hand-drawn look.
   - Stylize > Roughen Edges on the shape layer
   - Border ~ half the stroke width
   - Distort > Turbulent Displace after it
   - Amount 80, Size 2
   - Values: `Roughen Border` dragged 37.70 -> 7.10 (= ~half stroke); `Roughen Edge Sharpness` 5.67; `Displacement` Turbulent; `Amount` 80.0; `Size` 100 -> 2.0; `Offset (Turbulence)` 540.0,960.0 (centre of 1080x1920); `Complexity` 1.0; `Evolution` 0x+0.0; `Pinning` Pin All; `Antialiasing for Best Quality` Low
   - Why: breaks the perfect vector into a hand-drawn line
   - Build: canvas: displace polyline points with fine noise (size ~2 px, amount ~0.8) + rough edge mask
   - Source: reel `DZdCD2YNk4d` 0:24-0:36
15. **Random Seed expression time*4 makes the lines boil** — Alt-click the Turbulent Displace Random Seed stopwatch and type an expression so the seed changes over time; the lines start to move instantly.
   - Evolution Options > Random Seed
   - Alt/Option-click the stopwatch
   - type the expression
   - Values: `expression` time*4; `Cycle Evolution` on; `Cycle (in Revolutions)` 1
   - Why: a new seed steps the noise, so every line differs over time like redrawn frames
   - Build: seed = floor(t*4) -> noise reseeded ~4 times per second (seed is an integer, so time*4 steps at 4 Hz)
   - Source: reel `DZdCD2YNk4d` 0:36-0:42
16. **Second Turbulent Displace: bigger size, lower amount** — For more movement duplicate the Turbulent Displace and on the copy increase Size and lower Amount.
   - right-click > Duplicate the effect
   - Turbulent Displace 2: raise Size, lower Amount
   - Values: `Turbulent Displace 2 Amount` 80 -> 30 -> 15; `Turbulent Displace 2 Size` 2 -> 31 -> 52
   - Why: a larger, weaker octave adds slow wobble under the fine jitter
   - Build: two noise octaves: fine (size 2, amt 80) + coarse (size ~52, amt ~15)
   - Source: reel `DZdCD2YNk4d` 0:42-0:47
17. **Animate scale with strong easing** — Animate the first image's Scale with a strong ease so the move has a sharp speed peak.
   - Scale keyframes (demo 111% -> 153%)
   - Easy Ease then drag influence high in the Speed Graph
   - Values: `Scale` 111.0% -> 153.0%; `ease influence` 97.24%; `peak speed` ~1500 %/sec; `comp` 23.976 fps, 16 bpc
   - Why: a strong ease concentrates the motion into a fast middle where a cut hides
   - Build: cubic-bezier with ~97% influence on both ends (e.g. 0.97,0,0.03,1) on scale
   - Source: reel `DaDhDFjAysT` 0:09-0:14
18. **Posterize Time 24 -> 12 fps on an adjustment layer** — For Vox-style videos add Posterize Time on an adjustment layer on top and set Frame Rate to 12 for an organic choppy feel.
   - adjustment layer on top
   - Effects > Time > Posterize Time
   - Frame Rate 24 -> 12
   - Values: `Frame Rate` 12 (from 24); `comp fps` 23.976
   - Why: choppy handmade feel
   - Build: quantise animation time to 12 fps (hold each pose 2 frames)
   - Source: reel `DaDhDFjAysT` 0:22-0:29
19. **Posterize Time at 8 fps on top of everything** — Put Posterize Time on an adjustment layer above everything at 8 fps so the page turn steps like stop motion.
   - adjustment layer named 'Posterize Time' on top (over Background and the page)
   - Effects > Posterize Time, Frame Rate 8
   - Values: `Frame Rate` 8.0 (default 24.0)
   - Why: subtle stop-motion makes it look hand-animated, not computer-generated
   - Build: quantise the animation clock to 8 fps (hold each pose 3 frames at 24 fps)
   - Source: reel `Dafr0KjAkve` 0:25-0:37

## Transitions

1. **Spinning blurred footage with a year ruler** — The blurred leaves footage starts spinning, and a ruler of years (2002, 2003, 2004) slides across, so time visibly passes.
   - rotate the blurred background footage
   - overlay a thin tick ruler with year labels sliding sideways
   - Values: `labels` 2002, 2003, 2004
   - Why: the feeling of the passage of time
   - Build: rotate tween on a blurred bg layer + SVG tick-ruler translating with year text
   - Source: reel `DMDyGp6Jwwx` 0:26-0:30
2. **Exposure flashes to transition scenes** — Keyframe short exposure flashes to bridge from one memory to the next.
   - keyframe exposure up to a blown-out peak and back across the cut
   - Why: a flash reads as a memory cut
   - Build: brightness spike (white add) over 4-8 frames centred on the cut
   - Source: reel `DMDyGp6Jwwx` 0:30-0:34
3. **Logo reveal: Simple Choker 100 to 0 + Roughen Edges + Posterize Time 12** — Three stacked effects on the logo; animate Simple Choker's Choke Matte from a positive value down to zero to grow the logo in with ragged edges at 12 fps.
   - Effect > Matte > Simple Choker (View: Final Output)
   - Effect > Stylize > Roughen Edges (Edge Type Roughen)
   - Effect > Time > Posterize Time, Frame Rate 12
   - keyframe Choke Matte 100 -> 0
   - Values: `Choke Matte` 100.00 -> 0 (graph card '100 (SIMPLE CHOKER) 0'); `View` Final Output; `Edge Type` Roughen; `Border` 1.60; `Edge Sharpness` 9.90; `Fractal Influence` 1.00; `Scale` 10.0; `Stretch Width or Height` 0.00; `Offset (Turbulence)` 0.0,0.0; `Complexity` 2; `Evolution` 0x+0.0°; `Posterize Time` 12.0
   - Why: the choke erodes the matte; roughen makes the growing edge organic; 12 fps steps it
   - Build: alpha matte erode (morphology radius 100->0) + feTurbulence displacement on the edge (scale ~10, 2 octaves), time quantized to 12 fps
   - Source: reel `DMjAWcFJYqo` 0:02-0:12
4. **Cut on action: motion is your cover** *(shared)* — When something moves the eye is already tracking it; a cut dropped mid-motion goes unnoticed.
   - place the cut in the middle of a movement
   - Why: the brain follows the moving element, not the edit
   - Build: scene boundaries placed on peak-motion frames
   - Source: reel `DOb0h6VCSpM` 0:02-0:15
5. **Example: bar graph rising, wide to tight mid-climb** *(shared)* — Cut from a wide to a tight framing while the bars are still rising.
   - wide shot of the graph
   - cut to tight during the climb
   - Why: the graph's motion masks the edit
   - Build: cut frame chosen at the bar animation's velocity peak
   - Source: reel `DOb0h6VCSpM` 0:15-0:21
6. **Cut at the peak of the curve so momentum carries** *(shared)* — Scene 1 keys a gradient sweep across text; Scene 2 keys the rotation of a UI card; cut mid-curve so the sweep's momentum flows straight into the card's rotation in the same direction.
   - scene 1: gradient sweep over text
   - scene 2: rotating UI card
   - cut at both curves' speed peak
   - keep the same direction across the cut
   - Values: `cut point` peak of the speed curve; `direction` same across the cut (arrow on screen)
   - Why: momentum continuity makes scenes flow
   - Build: match-cut at max velocity with matching direction vectors
   - Source: reel `DPcvDgNDNM4` 0:08-0:25
7. **What a luma matte is and when to use it** *(shared)* — A luma matte is black and white footage used as a mask for another layer; use it when a visual should feel developed or uncovered in real time.
   - black/white footage drives the visibility of the layer below
   - Why: reads as something being developed or uncovered live
   - Build: mask = luminance of a video frame
   - Source: reel `DVcF9XyiSjm` 0:06-0:16
8. **Ink reveal: ink bleed overlay above artwork, Inverted Luma Matte** — Put an ink bleed overlay directly above the artwork and set the artwork's Track Matte to the ink layer, inverted; where the overlay is bright the design shows.
   - layer stack: 1 Ink, 2 Artwork, 3 Background White, 4 Audio
   - Artwork Track Matte = 1. Ink, Luma, inverted (click the invert toggle)
   - ink footage is an ink-bleed stock clip
   - Values: `matte` Inverted Luma Matte; `stack` Ink / Artwork / Background White / Audio; `comp depth` 8 bpc
   - Why: the ink plate reveals the design as it spreads
   - Build: ffmpeg maskedmerge/alphamerge with ink footage luminance; canvas mask from video luminance (inverted)
   - Source: reel `DVcF9XyiSjm` 0:17-0:25
9. **Moving footsteps: Simple Choker + Roughen Edges, choke animated 100 to 0** — The walking footsteps are a shape layer matted by a luma matte, with Simple Choker then Roughen Edges stacked on top; animating the choke from 100 to 0 makes each print grow outward like spreading ink.
   - Effects > Matte > Simple Choker on the footstep layer
   - Effects > Stylize > Roughen Edges stacked after it
   - keyframe Choke Matte 100 -> 0
   - footstep layer uses a Luma Matte (scaled 342%)
   - Values: `Choke Matte` 100 -> 0 (spoken); panel mid-animation shows 0.00 and 1.50; `Roughen Edges` values seen 2.00, 1.00, 1.00, 31.0, 0.00, offset 0.0,0.0, complexity 2 (labels cut off); `footstep matte scale` 342 %
   - Why: grows like spreading ink, not a hard pop
   - Build: animated erode->dilate of the mask with a fractal-noise edge displacement
   - Source: reel `DVcF9XyiSjm` 0:26-0:36
10. **Parent image 2 to image 1** — Parent the second image to the first so they share exactly the same movement.
   - Parent pick-whip Image 2 -> Image 1
   - Values: `layers` Image 1 (animated), Image 2 (parented)
   - Why: both shots move identically across the cut
   - Build: shared transform applied to both clips
   - Source: reel `DaDhDFjAysT` 0:13-0:17
11. **Cut at the fastest point of the curve** — Find where the animation moves fastest (the speed-graph peak) and make the cut there.
   - open the Speed Graph
   - find the peak
   - split/cut at that frame
   - Values: `cut` at peak velocity (~1500 %/sec), ~1s into the move
   - Why: at peak speed the eye cannot track detail, so the cut disappears
   - Build: compute ease derivative; place cut at argmax
   - Source: reel `DaDhDFjAysT` 0:17-0:22
12. **Page turn with CC Page Turn: settings** — Drop the built-in CC Page Turn on the page layer, animate Fold Position from one corner to the other, and raise Fold Radius to soften the bend.
   - Effects > CC Page Turn on the page layer
   - keyframe Fold Position corner to corner
   - raise Fold Radius
   - Render: Front & Back Page; Back Page = a layer; lower Back Opacity
   - Values: `Fold Position` 219.3,178.3 -> 759.8,814.0 (corner to corner); `Fold Direction` 0x-60.0°; `Fold Radius` 19.6 -> 47.5 -> 91.9 while dragging; final 50.0; `Light Direction` 0x-60.0°; `Render` Front & Back Page; `Back Opacity` 100.0 -> 85.0
   - Why: a softer bend reads more like paper
   - Build: page-curl: fold line moving diagonally at -60°, cylinder radius ~50 px shading, back face at 85% opacity
   - Source: reel `Dafr0KjAkve` 0:13-0:25
13. **CC Burn Film reveal 100 to 0** — Reveal the map with Stylize > CC Burn Film, keyframing Burn from 100 to 0.
   - CC Burn Film on the map layer
   - keyframe Burn 100 -> 0
   - set Center and Random Seed to taste
   - Values: `Burn` 100 -> 45.0 -> 0.0; `Center` ~702.3,121; `Random Seed` 1 -> 180
   - Why: a burnt-film dissolve makes a cool reveal
   - Build: noise-thresholded burn mask with dark/orange edge, threshold swept 1 -> 0
   - Source: reel `DcTljpCgNNJ` 0:24-0:29

## Paper and texture

1. **Texture is intentional: pick per piece from free libraries** *(shared)* — Choose textures like a chef picks ingredients, per piece; here a faded newspaper and a macro shot of stock paper for a title card.
   - browse free libraries (Texturelabs, Texture Fabrik shown)
   - pick per piece: 'Faded Newspaper' and 'Paper 348 / Macro detail paper', both in Textures > Paper
   - download the large size
   - Values: `textures` 2 (faded newspaper, macro stock paper); `sites` texturelabs.org, Texture Fabrik; `download size` large 4240x3034 jpg (small 960x687, med 1920x1374 offered); `licence` 'Free for commercial use' shown on Texturelabs
   - Why: deliberate choice beats one default overlay
   - Build: curate per-scene scans in the asset manifest at >=4K source size; never one global overlay
   - Source: reel `DL24UePpHWN` 0:06-0:18
2. **Texture stack: Overlay and Pin Light layers over Normal artwork** *(shared)* — The texture layers sit on top of the artwork with blend modes; the timeline shows two layers in Overlay and two in Pin Light above Normal layers.
   - stack the texture layers on top of the title-card layers
   - set two to Overlay and two to Pin Light; the art below stays Normal
   - no track mattes used (all No Matte)
   - Values: `blend modes` Overlay x2, Pin Light x2, rest Normal; `track matte` No Matte on all; `opacity values seen` 97.4%, 100%; `texture scale` ~2536.6% (one layer, scaled up to fill); `parent column` 4 layers show '11. TEXTURE' (likely parent/link; unclear)
   - Why: blend modes integrate the grain into the art instead of a flat veil
   - Build: canvas globalCompositeOperation 'overlay' for two texture passes and a pin-light shader (or 'hard-light' approximation) for two more
   - Source: reel `DL24UePpHWN` 0:17-0:23
3. **Set texture strength with Curves on the texture layer** *(shared)* — Apply a Curves effect to the texture layer itself and move its luminance levels to set strength.
   - Effect > Curves on the texture layer
   - Channel: RGB
   - bend the curve to shift luminance until the strength feels right
   - Values: `effect` Curves; `channel` RGB; `curve points` not readable
   - Why: keeps colours clean and the texture integrated
   - Build: pre-grade the texture with a luminance LUT (ImageData) or CSS filter brightness/contrast before compositing
   - Source: reel `DL24UePpHWN` 0:26-0:34
4. **Never solid colours: map everything to a texture** *(shared)* — Almost no flat fills; shape layers carry a texture instead of a flat colour.
   - shape layer with no stroke
   - colour area filled through a texture
   - Values: `solid colour` almost never; `stroke` 0 px
   - Why: avoids the sterile digital look
   - Build: fill shapes with a texture pattern (or multiply a scan over the fill) instead of a flat fillStyle
   - Source: reel `DLQ4Wp9pqv3` 0:17-0:21
5. **Type sits on a paper scan in Multiply** *(shared)* — The typography comp has a Texturelabs paper scan under the text with a Multiply layer, so letters print onto paper.
   - Texturelabs_Paper_300XL as background
   - a layer in Multiply over it
   - Values: `texture` Texturelabs_Paper_300XL; `blend` Multiply (one layer)
   - Why: type never sits on a flat fill
   - Build: text drawn over a paper scan with multiply
   - Source: reel `DLTLw1DpgwE` 0:04-0:07
6. **Bake one cardboard texture over everything, in Overlay** *(shared)* — Finish with a single Texturelabs cardboard texture over the whole comp, blend mode Overlay, so the layers read as one printed object.
   - download a cardboard scan from Texturelabs
   - place on top of the comp
   - blend mode Overlay
   - Values: `blend` Overlay; `source` Texturelabs (file ..._148L.jpg)
   - Why: unifies disparate layers
   - Build: final-pass cardboard scan, globalCompositeOperation 'overlay'
   - Source: reel `DMtlFlxJ6sg` 0:30-0:34
7. **Texture stacking: one High, one Mid, one Low** *(shared)* — Treat textures as frequency bands, one per band so they build instead of fighting. High: noise (fine sharp detail). Mid: halftone (medium density and scale, structure). Low: animated light refractions (broad soft distortion under everything).
   - High channel: noise, film grain, paper fibres
   - Mid channel: halftone pattern, grit, scratches, print textures
   - Low channel: light leaks, animated refractions, blur maps, vignettes
   - Values: `bands` 3; `per band` 1; `demo` High = noise, Mid = halftone pattern, Low = light refractions
   - Why: each lane has its own scale, so layers complement
   - Build: three overlay layers: fine grain noise, halftone dot pattern, animated blurry refraction/light-leak gradients
   - Source: reel `DNuJS_oWoxM` 0:11-0:26
8. **Hide low-quality assets with high-quality texture** *(shared)* — Step 2: a halftone or fine grain disguises low-res images and gives a printed feel; his example is a 540x300 image under a 5260x4000 texture.
   - keep the weak photo
   - put a high-resolution halftone/grain texture over it
   - Values: `image` 540x300; `texture` 5260x4000
   - Why: the texture's detail replaces the image's missing detail
   - Build: low-res archival photos always rendered through a halftone pass at output resolution
   - Source: reel `DQpMiV_Cdpr` 0:21-0:29
9. **Halftone via luma matte, then Levels on the halftone** *(shared)* — Use a halftone scan (Texturelabs Grunge 340, 'vintage halftone') as the luma matte of the photo, then tweak Levels on the halftone until it feels right.
   - texturelabs.org grunge_340 (vintage halftone, free for commercial use)
   - halftone layer above the photo, scaled up (440%)
   - photo Track Matte = halftone, Luma Matte
   - Levels on the halftone: Input White ~64%
   - Values: `texture` Texturelabs Grunge 340; `halftone scale` 440%; `photo scale` 202.6%; `track matte` Luma Matte; `Levels (halftone)` Input Black 0, Input White 20971.5 (~64%), Gamma 1.00, Output 0-32768
   - Why: the photo prints only through the dots
   - Build: photo alpha = luminance of a halftone scan (levels-adjusted), then composite on paper
   - Source: reel `DQpMiV_Cdpr` 0:29-0:36
10. **Pencil look: Roughen Edges** *(shared)* — For graphite, stack Roughen Edges after the displace; its Edge Type list offers Roughen, Roughen Color, Cut, Spiky, Rusty, Rusty Color, Photocopy, Photocopy Color.
   - Effect > Stylize > Roughen Edges after Turbulent Displace
   - Edge Type Roughen for pencil
   - Values: `Edge Type options` Roughen, Roughen Color, Cut, Spiky, Rusty, Rusty Color, Photocopy, Photocopy Color; `values` not stated for pencil
   - Why: mimics graphite
   - Build: noise-displaced, slightly eroded stroke edge
   - Source: reel `DT2_SIMgBfI` 0:24-0:28
11. **Pen-ink look: Roughen Edges Photocopy, adjust Border** *(shared)* — For ink, set Edge Type to Photocopy and raise Border until it feels right (he moves it from 12.2 to 15.9).
   - Roughen Edges Edge Type: Photocopy
   - Border ~12-16
   - Edge Sharpness 1, Fractal Influence 1, Scale 100, Complexity 2
   - Values: `Edge Type` Photocopy; `Border` 12.20 -> 15.90; `Edge Sharpness` 1.00; `Fractal Influence` 1.00; `Scale` 100.0; `Stretch Width or Height` 0.00; `Offset` 0.0,0.0; `Complexity` 2; `Evolution` 0x+0.0°
   - Why: mimics ink
   - Build: threshold of a noise-modulated stroke edge (ink bleed), border ~15px
   - Source: reel `DT2_SIMgBfI` 0:28-0:34
12. **Gaussian Blur 2 px for ink bleed** — A tiny Gaussian Blur creates a subtle ink bleed even if it looks wrong at first.
   - Effects & Presets > Blur & Sharpen > Gaussian Blur (not the Legacy one)
   - on an adjustment layer
   - Blurriness 2.0
   - Blur Dimensions Horizontal and Vertical
   - Repeat Edge Pixels on
   - Values: `Blurriness` 2.0 (a later demo comp shows 3.0); `Blur Dimensions` Horizontal and Vertical; `Repeat Edge Pixels` on
   - Why: simulates ink spreading into paper
   - Build: canvas ctx.filter='blur(2px)' or ffmpeg gblur=sigma~1 on the world layer
   - Source: reel `DUEIdzuCUgn` 0:11-0:16
13. **Unsharp Mask on top: blur vs sharpen tug of war** — Stack Unsharp Mask directly above the blur; the blur softens edges while the mask pulls sharpness back, adding scan-like artefacting.
   - Unsharp Mask directly below Gaussian Blur in the effect stack (applied after it)
   - Radius ~5
   - Amount dialled up to taste
   - Threshold 0
   - Values: `Radius` 5.400; `Amount` dialled 0 -> 24.4 -> 35.3 -> 57.6 in demo; `Threshold` 0.00; `order` Gaussian Blur then Unsharp Mask
   - Why: reintroduces artefacting digital tools normally lack
   - Build: blur then unsharp-mask convolution (ffmpeg gblur then unsharp=lx=11:ly=11:la=0.5, or a shader)
   - Source: reel `DUEIdzuCUgn` 0:16-0:33
14. **Halftone logic: dark bigger/denser, light smaller/sparser** *(shared)* — Halftones come from old screen printing: presses cannot print shades of black, so tone becomes dot size and spacing.
   - dark = bigger, denser dots
   - light = smaller, spaced-out dots
   - Why: presses cannot print grey shades
   - Build: canvas/shader halftone: dot radius = f(luminance) on a grid
   - Source: reel `DUJWPrqCYGX` 0:14-0:26
15. **Halftone plate in Overlay or Linear Light, strength via Curves** — Set the halftone layer to Overlay or Linear Light, then put Curves on it (RGB channel) to dial the strength.
   - layer Mode menu: Overlay (or Linear Light)
   - Effect: Color Correction > Curves on the Halftone layer, channel RGB
   - bend the curve to raise or lower contrast = strength
   - Values: `blend` Overlay or Linear Light; `Curves channel` RGB; `curve shape` not readable
   - Why: Curves changes how much of the dot contrast survives the blend
   - Build: overlay texture plate; strength via a contrast curve (or opacity) on the plate before blending
   - Source: reel `DUJWPrqCYGX` 0:30-0:34
16. **Too-big dots: scale the plate down, extend with CC RepeTile** — If the dots are too big, scale the texture layer down and add CC RepeTile to tile it out so the frame edges stay covered.
   - Scale the texture layer down (demo 404% -> ~220%)
   - add CC RepeTile
   - raise Expand Right/Left/Down/Up until the frame is covered
   - Tiling = Repeat, Blend Borders 0%
   - Values: `Scale` 404.0% -> 222.0%; `CC RepeTile Expand` values dragged up to ~392 (103, 205, 343, 392, 272 seen); `Tiling` Repeat; `Blend Borders` 0.0%
   - Why: smaller dots without losing coverage at the edges
   - Build: canvas createPattern(texture,'repeat') with a scale transform
   - Source: reel `DUJWPrqCYGX` 0:34-0:41
17. **Halftone texture inside each comp, Hard Mix, ~50% opacity** — Inside each ink comp add a halftone texture layer above the artwork set to Hard Mix and lowered to around 50% opacity.
   - layer stack inside the comp: Halftone over the artwork (placeholder 'REPLACE ME')
   - Halftone mode = Hard Mix
   - lower opacity
   - Values: `blend` Hard Mix; `opacity` ~50% (spoken); panel shows it being dragged 85% -> 69%
   - Why: hard mix posterises the ink into print dots
   - Build: per-ink threshold of (ink + halftone) in a shader = hard mix
   - Source: reel `DVd9Ls2gHWM` 0:35-0:41
18. **Misregistration offset and animated texture** — Push it further by offsetting the ink layers slightly against each other and animating the texture so the print boils.
   - offset one ink layer by a few px
   - animate the halftone texture position over time
   - compare against a '1 Color - w/o halftone' version
   - Why: misregistration and a moving texture make it feel like a true riso animation
   - Build: per-ink few-px offset; shift texture origin every few frames
   - Source: reel `DVd9Ls2gHWM` 0:41-0:48
19. **Finish with a dusty texture layer** — Add a little texture over the tinted background: a dark dust-and-scratch grunge plate.
   - texture plate over the background precomp
   - Why: gives the background a printed, physical surface
   - Build: dust/scratch plate composited (screen/overlay) at low opacity
   - Source: reel `DY7TSLJAQef` 0:38-0:42
20. **A separate shadow layer under the turning page** — The comp carries a 'Shadow Pattern' layer between the page and the background, so the turning page casts a shadow on what is below.
   - shadow layer below the page layer, above Background
   - Values: `layer` Shadow Pattern; `opacity` ~89.8 (value next to it, label not readable)
   - Why: a cast shadow anchors the paper in physical space
   - Build: soft shadow polygon following the fold line, multiplied over the page below
   - Source: reel `Dafr0KjAkve` 0:21-0:29
21. **White-background texture: darken modes; black-background: lighten modes** *(shared)* — Group AE's blend menu into families: a texture on white uses the darken group (it drops the white, keeps dark detail); a texture on black uses the lighten group (drops black, keeps bright detail).
   - white-bg scan (demo: NYT page) -> Darken group
   - black-bg texture (demo: 1952 Popular Mechanics cover) -> Lighten group
   - Values: `darken group` Darken, Multiply, Color Burn, Classic Color Burn, Linear Burn, Darker Color; `lighten group` Add, Lighten, Screen, Color Dodge, Classic Color Dodge, Linear Dodge, Lighter Color
   - Why: the neutral background drops out so only the detail remains
   - Build: canvas globalCompositeOperation multiply/darken for white-bg scans, screen/lighten for black-bg dust
   - Source: reel `DbBSCjjgbTw` 0:08-0:21
22. **Normalise a texture before contrast modes (Overlay, Soft Light)** *(shared)* — Contrast-group modes need normalisation first: desaturate the texture (Lumetri Saturation down), add Levels and drag the gamma (middle grey) handle to the histogram's peak, so the texture centres on 50% grey and stops shifting the colours underneath.
   - contrast group: Overlay, Soft Light, Hard Light, Linear Light, Vivid Light, Pin Light, Hard Mix
   - Lumetri Color on the texture: Saturation down (100 -> 83 seen, toward 0)
   - Color Correction > Levels
   - drag the middle grey (Gamma) under the histogram peak
   - on-screen meter goes 6% -> 41% -> 50%
   - Values: `target mean` 50% grey; `Lumetri Saturation` 100 -> 83.0 (seen mid-drag); `blend modes` Overlay / Soft Light (contrast group)
   - Why: overlay-family modes shift colours unless the texture averages 50% grey
   - Build: preprocess textures offline: grayscale, then gamma so the histogram peak sits at 128, before overlay/soft-light
   - Source: reel `DbBSCjjgbTw` 0:21-0:41
23. **Stack a second Levels to tune strength** *(shared)* — To make the texture stronger, stack a second Levels (Levels 2) and dial its gamma to taste instead of guessing with opacity.
   - add Levels 2 below the first
   - pull Gamma down from 1.0
   - Values: `Levels 2 Gamma` 1.0 -> 0.9 -> 0.7; `Output Black` 0.0
   - Why: controls texture intensity after normalisation
   - Build: apply gamma (e.g. 0.7) to the normalised texture as an intensity parameter
   - Source: reel `DbBSCjjgbTw` 0:43-0:49
24. **High-pass plate in Overlay, strength via Levels Input White** *(shared)* — In After Effects set the high-pass layer to Overlay and add Levels to dial how strongly the details show, by pulling Input White down.
   - layer mode Overlay
   - Color Correction > Levels on the texture
   - lower Input White
   - Values: `blend` Overlay; `Levels Input Black` 0.0; `Levels Input White` 32511.0 -> 30069.5 -> 29684.0 (16-bpc scale, ~99% -> ~91%)
   - Why: a mid-grey high-pass plate under Overlay only adds detail; Levels sets its contrast
   - Build: canvas overlay blend of the high-pass plate; strength = contrast around 128
   - Source: reel `DbJSUGZpvzL` 0:22-0:27
25. **Texture variance per layer: grain, halftone, blur + Noise HLS** *(shared)* — Give different layers different texture (paper grain, halftones, or a stack of a little blur and noise) so they do not look uniformly digital.
   - paper grain on some layers
   - halftone on others
   - on others: Noise HLS (Grain) then Gaussian Blur
   - Values: `Noise HLS Noise` Grain; `Hue` 0.0%; `Lightness` 53.0%; `Saturation` 0.0%; `Grain Size` 1.00; `Noise Phase` 0x+0.0°; `Gaussian Blur` dragged 0 -> 3.6 -> 8.7 -> 12.2 (final not stated); `Repeat Edge Pixels` on
   - Why: texture variance sells the layering
   - Build: per-layer filter preset: lightness noise ~0.5 at grain size 1 + blur of a few px; another preset with halftone
   - Source: reel `Dc1ShYsplyF` 0:40-0:49
26. **Tile textures: Photoshop Pattern Fill, AE CC RepeTile** *(shared)* — Tile instead of scaling down: in Photoshop a Pattern fill layer with lower Scale; in After Effects CC RepeTile with Expand values. Seamless textures are ideal, but seams are usually tolerable in an overlay.
   - Photoshop: Layer > New Fill Layer > Pattern, Scale 100 -> 45%
   - After Effects: Stylize > CC RepeTile, raise Expand Right/Left/Down/Up, Tiling Unfold
   - Values: `Pattern Fill Scale` 100% -> 45%; `CC RepeTile Expand` 632, 682, 1056, 595 (Right/Left/Down/Up); `Tiling` Unfold; `Blend Borders` 0.0%
   - Why: keeps the grain at a small scale while covering the whole frame; Unfold mirrors tiles to hide seams
   - Build: canvas createPattern with a mirrored (unfold) tile at the chosen scale
   - Source: reel `DcBhNhOg5kR` 0:18-0:28
27. **Shadow overlay beats dust overlay for depth** *(shared)* — He tried dust overlays first, then a window-light shadow overlay (light and shadow silhouette on a white wall) and kept the shadow: it adds more depth to a still photo.
   - preview dust overlays over the photo
   - preview shadow overlays over the photo
   - keep the one that adds depth
   - Values: `asset` light-and-shadow window silhouette on a white wall, 7000x4667 JPEG
   - Why: cast light and shadow add depth to a still more than dust does
   - Build: window-shadow plate over the photo in multiply
   - Source: reel `DdKZ5oBpPCW` 0:13-0:34

## Colour and grade

1. **Chromatic aberration over everything** — A subtle chromatic aberration across the whole frame goes unnoticed but unifies the look; he uses the free plugin Quick Chromatic Aberration 3 on a top adjustment layer.
   - top adjustment layer ('Vox Sauce')
   - apply Quick Chromatic Aberration 3 (free plugin)
   - Values: `plugin` Quick Chromatic Aberration 3 [free]; `amount` not stated in this reel (3 px in DLQw7mqJzRp)
   - Why: the frame reads as one lens
   - Build: final pass: offset R and B channels 1-3px (ImageData split) or ffmpeg rgbashift
   - Source: reel `DLQ4Wp9pqv3` 0:03-0:08
2. **Footage homogenization** *(shared)* — Clips from different cameras, eras or quality (e.g. a 240p clip) keep their story value but never go in raw; layer consistent effects across every clip.
   - keep the shot if it serves the story
   - layer the same effects over every clip
   - Values: `quality example` ~240p clip label on screen (OCR '244p')
   - Why: cohesion across mismatched sources
   - Build: shared final-pass stack on all clips
   - Source: reel `DMOpmHxpAOA` 0:03-0:13
3. **Soft glow over the lot** *(shared)* — A soft glow across everything makes sunlight appear to refract into the birds and text.
   - glow adjustment over whole comp
   - Why: ties elements into the same light
   - Build: blur+screen bloom pass on the final frame
   - Source: reel `DMtlFlxJ6sg` caption
4. **Tint: whites to one colour, blacks to another, Amount ~60%** *(shared)* — Make photos fit the system with Tint, mapping whites to one palette colour and blacks to another, then dial Amount to Tint back for subtlety (he lands near 60%).
   - Effect > Color Correction > Tint
   - Map White To = palette light
   - Map Black To = palette dark
   - Amount to Tint from 100% down to ~59-62%
   - Values: `Amount to Tint` ~62% (scrubbed 100% -> 59% -> 62%); `colours` not readable
   - Why: all photos share the palette
   - Build: duotone gradient map mixed back with the original at ~0.6
   - Source: reel `DQpMiV_Cdpr` 0:12-0:21
5. **Levels on the photo before the tint: lifted blacks, strong gamma** *(shared)* — The photo also carries Levels (16-bit units): Input Black 6296.6, Input White 32768, Gamma 3.52, Output Black 3855.1, Output White 32768, i.e. crushed input, very bright mids and lifted output blacks.
   - Levels on the photo layer
   - Input Black ~19%, Gamma 3.52, Output Black ~12%
   - Values: `Input Black` 6296.6 (~19% of 32768); `Input White` 32768.0; `Gamma` 3.52; `Output Black` 3855.1 (~12%); `Output White` 32768.0
   - Why: faded, printed-looking photo with no true black
   - Build: levels LUT on photos: in-black 0.19, gamma 3.5, out-black 0.12
   - Source: reel `DQpMiV_Cdpr` 0:17-0:20
6. **Trippy overlays: stack comps, top set to Difference** — Stack compositions and set the top one to Difference: even simple animation gets a reactive look.
   - stack two comps
   - top blend mode Difference
   - Values: `blend` Difference
   - Why: reactive look with no complex animation
   - Build: globalCompositeOperation='difference'
   - Source: reel `DR0HIWTiTkJ` 0:24-0:33
7. **Art in black, white and 50% gray, then Tritone** *(shared)* — Keep artwork in black, white and 50% gray, then a Tritone on an adjustment layer maps Shadows, Midtones and Highlights to the palette in one pass; mask and invert for extra stylisation.
   - artwork only in #000, 50% gray, #FFF
   - adjustment layer 'Color Adjustment' with Effect > Color Correction > Tritone
   - set Highlights / Midtones / Shadows to the palette
   - Blend With Original 0%
   - mask and invert parts for variety
   - Values: `gray` 50%; `Blend With Original` 0.0%; `palette colours` not readable
   - Why: one-step recolour of the whole piece
   - Build: three-stop gradient map (shadow/mid/highlight) on a 3-value artwork
   - Source: reel `DR0HIWTiTkJ` 0:33-0:45
8. **Riso overprint: two ink comps, Tint, both Multiply** — Split the animation into two comps (Ink 1, Ink 2), tint each to a different ink colour with Tint (Map Black To), and set both to Multiply.
   - two precomps Ink 1 and Ink 2
   - Tint effect: Map Black To = ink colour
   - both layers blend mode Multiply
   - Values: `Ink 1 Map Black To` #E6CE1B / #E7CF1B (H 53, S 88%, B 90%) yellow; `Ink 2 Map Black To` #286241 (H 146, S 59%, B 38%) green; `blend` Multiply; `inks` 2
   - Why: multiply overlap reproduces the overprint blend
   - Build: render each ink layer as a mask, tint to the ink colour, composite with multiply on paper
   - Source: reel `DVd9Ls2gHWM` 0:26-0:34
9. **Pre-comp, then Tint to a dim low-contrast grey** *(shared)* — Pre-compose the background images, add Color Correction > Tint on top, map black to a dark grey instead of pure black and white to only a slightly brighter grey, so the background is dim and low contrast.
   - select the images > Pre-compose
   - Effects & Presets search 'Tint' > Color Correction > Tint
   - Map Black To: dark grey, not pure black
   - Map White To: a slightly brighter grey (picker cursor stays near the dark corner)
   - Values: `effect` Tint; `Map Black To` dark grey (exact value not readable); `Map White To` slightly brighter grey, still dark (exact value not readable); `result` dim, low-contrast grey background
   - Why: keeps the background from competing with the main content
   - Build: canvas: draw images, grayscale + levels remap black->~#1e1e1e, white->~#555 (values to tune), then grain
   - Source: reel `DY7TSLJAQef` 0:30-0:38
10. **Phosphor colour cast via Hue/Saturation Colorize** *(shared)* — The 'white balance shift' is done with Hue/Saturation in Colorize mode at low saturation, giving the phosphor cast of vintage TVs.
   - Effects > Color Correction > Hue/Saturation
   - tick Colorize
   - set Colorize Hue, low Saturation, Lightness 0
   - Values: `Colorize Hue` 0x+39.0° -> 0x+79.0° (demo); `Colorize Saturation` 25; `Colorize Lightness` 0
   - Why: vintage TVs had a distinct phosphor cast that dates the image
   - Build: monochrome tint: luminance mapped into hue ~40-80°, saturation 0.25
   - Source: reel `DaQeqljgc7y` 0:30-0:38
11. **Print misregistration via a touch of chromatic aberration on type only** — Recreate the magazine's slight colour misregistration with a little chromatic aberration on the text and graphic elements, not the whole frame.
   - Quick Chromatic Aberration (third-party plugin) on the text/graphics layer
   - Channels: Red & Blue
   - small offset
   - Values: `effect` Quick Chromatic Aberration; `Channels` Red & Blue; `Hue Shift` 0x+0.0°; `offset/amount` ~0.50 (label not readable); `Anchor` Absolute Point 540.0,960.0
   - Why: tiny imperfections are what make it feel real
   - Build: draw R and B channels of the type layer offset by ~1 px in opposite directions (screen/lighter)
   - Source: reel `DbJSUGZpvzL` 0:27-0:36
12. **Tint paper and push the white to a warm off-white** *(shared)* — On paper layers add Tint and drag Map White To from pure white to a slightly warm off-white; subtle, but it adds depth when several paper layers stack.
   - Effects > Color Correction > Tint on each paper layer
   - Map White To: drag from #FFFFFF down to a warm off-white
   - vary slightly per layer
   - Values: `Map White To` #FFFFFF -> #F7F7EF -> #EFEFE4 -> #E8E8DC -> #E5E5D8 (final ~H 60°, S 6%, B 90%)
   - Why: adds depth across multiple paper layers
   - Build: map paper white to ~#E5E5D8 (warm yellow-grey, 10% darker) with small per-layer variance
   - Source: reel `Dc1ShYsplyF` 0:18-0:26

## Film and screen treatments

1. **Scan lines layer** *(shared)* — Layer one is a scan-line image on top of the screen recording, blend Overlay or Color Dodge, opacity about half.
   - find a scan-lines texture (he image-searches 'tv scan lines')
   - place over the recording
   - blend mode Overlay or Color Dodge
   - scrub opacity to taste
   - Values: `blend mode` Overlay or Color Dodge; `opacity` ~50% (scrubbed 46-54%)
   - Why: makes the capture feel like a real display
   - Build: repeating 2-4px horizontal line pattern, globalCompositeOperation overlay or color-dodge, alpha ~0.5
   - Source: reel `DLQw7mqJzRp` 0:03-0:10
2. **Chromatic aberration heavier on screen captures: 3** — On screen recordings he pushes chromatic aberration past his usual amount; Quick Chromatic Aberration 3 on an adjustment layer with offset 3.
   - adjustment layer over the recording
   - Quick Chromatic Aberration 3: Channels Red & Blue
   - Position (offset) typed as 3
   - Hue Shift 0, Rotation 0, Scale 100%, Anchor Mode Absolute Point
   - Repeat Edge Pixels on, Mix With Original 0%
   - Values: `Channels` Red & Blue; `Position` 3; `Hue Shift` 0x+0.0°; `Rotation` 0x+0.0°; `Scale` 100.00%; `Anchor Mode` Absolute Point; `Anchor` 536.3,962.0; `Repeat Edge Pixels` on; `Mix With Original` 0.00%
   - Why: sells the glass of a screen
   - Build: split R and B, offset +/-3px from a centre anchor (radial), repeat edges
   - Source: reel `DLQw7mqJzRp` 0:08-0:13
3. **Old-cinema imperfection: gate weave and exposure flicker** — Early film carried mechanical jitter (gate weave) and brightness shifts in every frame; emulating both breaks the clinical crispness of digital.
   - position jitter (gate weave)
   - exposure flicker
   - a little grain
   - Values: `named on screen` GATE WEAVE & EXPOSURE FLICKER; `contrast label` DIGITAL FEELS CLINICAL
   - Why: cuts through clinical digital crispness and makes static compositions feel alive
   - Build: final pass: per-frame translate jitter, brightness flicker, grain
   - Source: reel `DLX9PJ_pwBA` 0:00-0:13
4. **Position jitter expression on a Transform effect** — The gate weave is an expression on the Position of a Transform effect inside the finishing adjustment layer, so the whole frame weaves.
   - finishing adjustment layer 'Vox Sauce' > Transform effect
   - Position expression:
   - posterizeTime(24); x = wiggle(6,1)[0]; y = wiggle(6,1)[1]; [x,y];
   - Values: `posterizeTime` 24; `wiggle freq` 6 per second; `wiggle amp` 1 px; `Transform Position` 540.0,960.0 base (1080x1920 comp), e.g. 539.3,961.0 and 540.9,959.x while running; `Transform Scale` 103.0 (overscan so edges never show)
   - Why: mechanical gate weave sampled at film rate
   - Build: whole-frame translate by smooth noise (6Hz, +/-1px) sampled at 24fps, with ~3% overscan
   - Source: reel `DLX9PJ_pwBA` 0:15-0:19
5. **Exposure flicker expression** — An expression on Exposure gives a random brightness offset; strength 0.04 with a suggested 0.02-0.1 range.
   - Exposure effect (Channels: Master) on the finishing layer
   - Exposure expression:
   - seedRandom(index + time, true); flickerStrength = 0.04; freq = 2; holdTime = 1/freq; floorTime = Math.floor(time / holdTime) * holdTime; randomVal = random(-flickerStrength, flickerStrength); randomVal
   - Values: `flickerStrength` 0.04 (adjust 0.02-0.1); `freq` 2 per second (holdTime 0.5 s); `value seen` Exposure 0.02, Offset 0.0000, Gamma 1.00; `seedRandom` index + time, timeless true
   - Why: brightness shifts as in early film
   - Build: global brightness gain 2^(random(-0.04,0.04)) per held step in the final pass
   - Source: reel `DLX9PJ_pwBA` 0:19-0:21
6. **Add Grain settings** *(shared)* — Finish with Add Grain at low intensity.
   - Effects & Presets: Add Grain
   - Viewing Mode: Final Output
   - Preset: None
   - Tweaking: Intensity 0.2, Size 1.0, Softness 1.0, Aspect 1.0
   - Values: `Intensity` 0.200; `Size` 1.000; `Softness` 1.000; `Aspect Ratio` 1.000; `Viewing Mode` Final Output
   - Why: adds life without being noticed
   - Build: per-frame noise overlay at ~0.2 intensity (soft-light, fresh seed each frame)
   - Source: reel `DLX9PJ_pwBA` 0:21-0:23
7. **Recipe: film grain, blur map, chromatic aberration** — His example blend is 1 film grain, 2 a blur map (soft edges, sharp centre), 3 a bit of chromatic aberration.
   - 1. film grain
   - 2. blur map: edges and top soft, centre sharp
   - 3. a little chromatic aberration
   - Values: `order` film grain, blur map, chromatic aberration
   - Why: the same texture on every clip hides their differences
   - Build: same grain + radial edge blur + rgb split pass per clip
   - Source: reel `DMOpmHxpAOA` 0:13-0:23
8. **Breathing Glow: settings and wiggle on Intensity** — Adjustment layer with Glow; Option-click the Glow Intensity stopwatch and add wiggle(1.5,.2) so the glow breathes.
   - Layer > New > Adjustment Layer
   - Effect: Glow (Glow Based On Color Channels)
   - Threshold 60%, Radius 42, Intensity 0.2
   - Composite Original Behind, Operation Add, Glow Colors Original Colors
   - Option-click Intensity stopwatch: wiggle(1.5,.2)
   - Values: `Glow Based On` Color Channels; `Glow Threshold` 60.0%; `Glow Radius` 42.0; `Glow Intensity` 0.2 base (reads 0.4 under the expression); `Composite Original` Behind; `Glow Operation` Add; `Glow Colors` Original Colors; `Color Looping` Triangle A>B>A; `Color Loops` 1.0; `A & B Midpoint` 50%; `Glow Dimensions` Horizontal and Vertical; `expression` wiggle(1.5,.2); `comp fps` 24
   - Why: subtle shifts of glow add energy
   - Build: bright-pass (>60% luma), blur r=42, add back with gain 0.2 + smooth noise +/-0.2 at 1.5 Hz
   - Source: reel `DMWEwQRp6aD` 0:05-0:13
9. **TV flicker variant on Exposure** — The same idea drives a TV flicker; the expression he got from ChatGPT runs on Exposure with flickerSpeed 15, flickerIntensity 1.2 EV and baseExposure 0.5, using a wiggle for noise. He has seen it in Netflix title sequences.
   - Exposure (effect or Lumetri) expression:
   - flickerSpeed = 15; // flickers per second
   - flickerIntensity = 1.2; // max EV swing
   - baseExposure = 0.5; // your normal exposure
   - noise = wiggle(...) (rest of the code not readable)
   - Values: `flickerSpeed` 15 per second; `flickerIntensity` 1.2 EV max swing; `baseExposure` 0.5; `remaining code` not readable
   - Why: versatile; appears in title sequences
   - Build: exposure gain 2^(0.5 + noise(t*15)*1.2) for TV-screen inserts
   - Source: reel `DMWEwQRp6aD` 0:22-0:28
10. **Retro screen: Venetian Blinds + Quick Chromatic Aberration 3 + CC Lens** — On one adjustment layer: Venetian Blinds (Transitions) makes thin scan lines, Quick Chromatic Aberration 3 adds fringe, CC Lens (Distort) adds a subtle CRT bulge.
   - Effect > Transition > Venetian Blinds for thin lines
   - Quick Chromatic Aberration 3 (free plugin)
   - Effect > Distort > CC Lens, small size for a subtle bulge
   - Values: `Venetian Blinds values` not shown; `CC Lens values` not shown; `bulge` subtle
   - Why: curved CRT-like glass with colour fringe
   - Build: shader: repeating line mask, RGB channel offset, barrel distortion
   - Source: reel `DNmGyQupPlQ` 0:06-0:11
11. **Flat laptop pixel grid: remove bulge, duplicate the blinds** — For a flat modern screen drop CC Lens and duplicate Venetian Blinds so two passes form a grid; the laptop frame is a MacBook Pro PNG.
   - remove CC Lens
   - duplicate Venetian Blinds (second pass at another direction for a grid)
   - place inside a laptop PNG frame
   - Values: `second blinds direction` not stated (grid implies ~90°); `frame asset` MacBook Pro PNG (Pngtree)
   - Why: a flat panel has a pixel grid, not curvature
   - Build: two perpendicular repeating-linear-gradient masks
   - Source: reel `DNmGyQupPlQ` 0:11-0:16
12. **Refresh-rate micro flicker via Exposure expression** — Real screens flicker with their refresh rate; a tiny random Exposure pulse makes the screen feel real instead of pasted on. A 'NO FLICKER vs REAL SCREENS' card compares.
   - Exposure effect on the screen adjustment layer (after Venetian Blinds, Quick Chromatic Aberration 3, Curves)
   - Exposure expression:
   - seedRandom(index + time, true); flickerStrength = 0.03; freq = 2; holdTime = 1/freq; floorTime = Math.floor(time / holdTime) * holdTime; randomVal = random(-flickerStrength, flickerStrength); randomVal
   - Values: `flickerStrength` 0.03 (adjust 0.02-0.1); `freq` 2 per second; `Exposure base` 0.00, Offset 0.0000, Gamma 1.00; `stack order` Venetian Blinds > Quick Chromatic Aberration 3 > Curves > Exposure
   - Why: you do not notice it but you feel it
   - Build: per-frame brightness gain 2^random(-0.03,0.03); seed by floor(t*2) if the value should hold
   - Source: reel `DNmGyQupPlQ` 0:16-0:27
13. **Gate Weave: frame-by-frame jitter from old printers** — Gate weave is a frame-by-frame jitter of the whole picture caused by mechanical drift in old film printers.
   - jitter the whole composite (not single pieces) once per frame
   - keep it small so it reads subconsciously
   - Values: `rate` per frame
   - Why: recreates analog nostalgia and fights the computerised look of modern animation
   - Build: per-frame seeded random x/y (and tiny rotation) offset applied to the final composited frame
   - Source: reel `DTJJq9JiXxj` 0:10-0:16
14. **Exposure Flicker from light inconsistency in film printing** — Exposure flicker is a slight brightness variation from inconsistent light during film printing; the Stranger Things intro adds it on purpose.
   - vary overall exposure slightly frame to frame
   - apply over the whole frame, together with gate weave
   - Why: imperfect printing light; the pair fights the computerised look
   - Build: per-frame seeded brightness multiplier (CSS filter brightness / shader gain) on the final frame
   - Source: reel `DTJJq9JiXxj` 0:16-0:25
15. **Capture real irregularities on a 50% grey screen** *(shared)* — Film the real CRT showing a 50% grey background to capture its irregularities, then use that recording as an overlay.
   - display 50% grey full-screen on the TV
   - film the screen
   - use the recording as the overlay plate
   - Values: `background` 50% grey; `blend` Overlay
   - Why: 50% grey is neutral under Overlay, so only the screen's irregularities show
   - Build: real/scanned CRT grey plate composited with overlay blend (ffmpeg blend=all_mode=overlay or canvas globalCompositeOperation='overlay')
   - Source: reel `DTOKw4vieGq` 0:15-0:22
16. **CRT emulation stack: downsample, exposure flicker, scan behaviour, grey plate in Overlay** — Rebuild the screen digitally from three behaviours, then put the 50% grey recording on top in Overlay blend mode.
   - downsample the footage
   - add exposure flicker
   - add scan behaviour
   - grey recording layer blend mode = Overlay (picked from the AE mode menu)
   - Values: `effects` Downsampling, Exposure Flicker, Scan Behavior; `grey plate blend` Overlay
   - Why: makes low-quality footage read as a real screen
   - Build: canvas: draw at low res and upscale, per-frame brightness jitter, scanline pattern, overlay plate
   - Source: reel `DTOKw4vieGq` 0:20-0:29
17. **Use the CRT pass to blend archival footage** *(shared)* — The screen pass unifies archival footage of different quality and adds a layer of interest to documentary projects.
   - apply the same screen pass over archival clips
   - Why: hides quality mismatch between sources
   - Build: shared post-pass over archival shots in the timeline
   - Source: reel `DTOKw4vieGq` 0:29-0:34
18. **Analog finish: two Glows on an adjustment layer** — Stack two Glow effects on an adjustment layer above the visualizers.
   - adjustment layer on top
   - Glow + Glow 2
   - Values: `Glow Based On` Color Channels; `Glow Threshold` 60.0%; `Glow Radius` 20.0; `Glow Intensity` 0.6; `Composite Original` Behind; `Glow Operation` Add; `Glow Colors` Original Colors; `Color Looping` Triangle A>B>A; `A&B Midpoint` 50%; `Glow Dimensions` Horizontal and Vertical; `Glow 2 values` not shown
   - Why: double glow softens the digital line into a lit screen
   - Build: threshold at 60% luminance, blur r=20, add at 0.6 over original; twice
   - Source: reel `DVRV9hiCX4F` 0:28-0:31
19. **A little Add Grain on top** — Finish with a little grain from Noise & Grain > Add Grain over everything.
   - Effects & Presets > Noise & Grain > Add Grain on top
   - Values: `effect` Add Grain
   - Why: avoids the sterile digital look
   - Build: seeded per-frame grain overlay at low opacity
   - Source: reel `DVRV9hiCX4F` 0:31-0:33
20. **Gate weave: Transform effect, wiggle(12,2) on Position** — Add Distort > Transform to the photo and put a subtle wiggle expression on its Position.
   - Effects > Distort > Transform on the image layer
   - Alt-click Position stopwatch
   - type the expression
   - Values: `expression` wiggle(12,2); `frequency` 12 per second; `amplitude` 2 px
   - Why: using the Transform effect keeps the layer's own Position free for animation
   - Build: per-frame smooth noise offset, 12 Hz, ±2 px on the whole frame
   - Source: reel `Da3YpRipHuF` 0:23-0:31
21. **Flicker: Exposure effect, wiggle(14,.2) on Exposure** — Add Color Correction > Exposure and put a tiny wiggle on the Exposure value to create flicker.
   - Effects > Color Correction > Exposure
   - Channels Master
   - Alt-click Exposure stopwatch, type the expression
   - Values: `expression` wiggle(14,.2); `frequency` 14 per second; `amplitude` 0.2 stops; `Offset` 0.0; `Gamma Correction` 1.0
   - Why: slight exposure jitter reads as film flicker
   - Build: per-frame brightness multiplier 2^(noise*0.2) at 14 Hz
   - Source: reel `Da3YpRipHuF` 0:31-0:36
22. **Scan lines: Venetian Blinds + Solid Composite on an adjustment layer** — On an adjustment layer add Transition > Venetian Blinds to cut horizontal scan lines, then Channel > Solid Composite so the gaps show black instead of transparency.
   - adjustment layer over the footage
   - Venetian Blinds: raise Transition Completion a little, Direction 0 (horizontal lines), Width 20
   - Solid Composite (black) below it in the stack
   - Values: `Transition Completion` 0% -> 13%; `Direction` 0x+0.0°; `Width` 20; `Feather` 0.0; `Solid Composite colour` black (values not shown)
   - Why: recreates the line structure of an old TV
   - Build: repeating horizontal stripe mask (period 20 px, ~13% dark) over footage on black
   - Source: reel `DaQeqljgc7y` 0:16-0:23
23. **Rolling soft black bar distortion** — Animate a soft-edged black shape travelling slowly from the top of the frame to the bottom and loop it to mimic old TV roll.
   - draw a feathered black shape
   - keyframe top -> bottom, slow
   - loop it
   - Values: `speed` slow, not stated
   - Why: recreates the distortion seen on old TVs
   - Build: feathered horizontal band translated by (t mod period) over the frame, low opacity
   - Source: reel `DaQeqljgc7y` 0:23-0:30
24. **Subtle RGB Split and a VHS screen texture finish the TV** — After framing, add a subtle RGB Split effect on the footage and a transparent VHS screen-texture layer over it to complete the look.
   - Video Effects > RGB Split on the footage, subtle
   - screen texture image ('screen texture vhs', transparent) above the footage, under the bezel
   - Values: `effect` RGB Split (amount not stated); `texture` transparent VHS screen texture
   - Why: completes the screen treatment
   - Build: channel offset 1-2 px plus scanline/noise overlay clipped to the screen rect
   - Source: reel `Dcm63HBAHzT` 0:36-0:40

## Cut-out and collage

1. **Three clear depth planes, tinted per layer with Tint** *(shared)* — Lay out foreground, midground, background clearly, then apply Tint to each layer to map it into the brand palette (e.g. Map Black To a deep blue #00609C).
   - scene split into FG/MG/BG
   - Effect > Color Correction > Tint per layer
   - Map Black To brand dark (#00609C shown), Map White To brand light
   - Amount to Tint 100%
   - Values: `effect` Tint; `Map Black To` #00609C (H203 S100 B61; RGB 0,96,156); `Map White To` not readable; `Amount to Tint` 100.0%
   - Why: layers read as separate planes and share one palette
   - Build: per-plane duotone: luminance mapped between two palette colours (canvas LUT or SVG feComponentTransfer)
   - Source: reel `DMtlFlxJ6sg` 0:15-0:23
2. **Birds as thresholded silhouettes** *(shared)* — Take stock footage, push Threshold until only silhouettes remain, add a touch of blur to blend.
   - stock bird footage
   - Threshold effect cranked up
   - slight blur
   - Values: `threshold` cranked up, value not stated; `blur` touch
   - Why: flat silhouettes sit in a collage; blur softens the hard edge
   - Build: canvas luminance threshold of footage frames, then 1px blur
   - Source: reel `DMtlFlxJ6sg` caption
3. **Design the scene flat in Photoshop as separate layers** *(shared)* — The 2.5D scene starts as a layered PSD (2.5D_Ref.psd): building base, door, banner, left/right trees, lanterns, car and car shadow, each on its own layer, grouped into foreground, midground, background.
   - design flat in Photoshop
   - every depth element on its own layer
   - import as layers into AE
   - Values: `layers seen` Building Base, Door, Banner, Back left tree, back right tree, lantern left, lantern right, Lanterns, Car, Car Shadow, overlay grid
   - Why: each element can take its own depth
   - Build: scene described as named planes with a depth index
   - Source: reel `DQu3nYiCepd` 0:00-0:17
4. **Separate planes in Photoshop and clone-stamp the hidden areas** *(shared)* — In Photoshop cut the elements into their own layers (Foreground, Midground, background) and patch the areas they hid with the Clone Stamp tool.
   - layers: Foreground, Midground, background (Normal, 100% opacity)
   - Clone Stamp over the holes in the lower layers (zoomed ~326%)
   - Values: `layers` Foreground / Midground / background; `blend` Normal 100%; `work zoom` 326%
   - Why: hidden areas are revealed when the camera moves
   - Build: cut-out PNG layers with inpainted backgrounds
   - Source: reel `DZsDDmvtNJP` 0:15-0:24
5. **Fragment one photo into overlapping pieces at reduced opacity** — Cut one image into fragments (each a separate layer of the same photo), overlap them slightly, lower their opacity, and weave text and shapes between the pieces for an assembled editorial look.
   - duplicate the photo layer per fragment (6 layers of the same Capitol image) and mask each to a piece
   - overlap slightly
   - lower opacity of all fragments
   - insert text and shape layers between them in the stack
   - Values: `fragments` 6 in the demo; `Opacity` 100% -> 84% -> 82%
   - Why: assembled editorial look
   - Build: split one image into polygon clip-paths at ~82% alpha, z-ordered with type/shape layers
   - Source: reel `Dc1ShYsplyF` 0:26-0:40

## Type, callouts and annotation

1. **Displacement Map: text takes the paper's form** *(shared)* — A Displacement Map on the text, driven by the texture layer, makes type feel printed onto the surface.
   - add Displacement Map to the text
   - Displacement Map Layer = the texture (layer 'TEXTURE 3')
   - set Use For Horizontal / Use For Vertical channels and Max Horizontal / Max Vertical Displacement
   - Values: `effect` Displacement Map; `map layer` TEXTURE 3; `parameters` Use For Horizontal, Max Horizontal Displacement, Use For Vertical, Max Vertical Displacement, Displacement Map Behavior, Edge Behavior
   - Why: extra tactility: the text belongs to the paper
   - Build: SVG feDisplacementMap with the paper scan as feImage map, small scale (2-6px), on the text layer
   - Source: reel `DL24UePpHWN` 0:34-0:39
2. **Caption style: one-word chunks in a red pill** *(shared)* — Every spoken phrase is captioned as 1-4 uppercase words in a condensed bold white face on a red rounded pill, centred low.
   - split speech into 1-4 word chunks
   - uppercase condensed bold white text
   - red rounded-rectangle pill behind, centred in the lower third
   - Values: `words per caption` 1-4; `case` uppercase
   - Why: readable on mute and keeps the eye on the centre
   - Build: caption track renderer: word-chunk timing from the transcript, condensed bold font on a red pill
   - Source: reel `DL24UePpHWN` 0:00-0:40
3. **Simple line effects with Trim Paths** — Add line draw-on accents by animating the End of Trim Paths on a shape.
   - shape layer path
   - add Trim Paths
   - keyframe End from 0% upward; Start 0%, Offset 0°
   - Trim Multiple Shapes: Simultaneously
   - Values: `Start` 0.0%; `End` 0.0% at start (animated); `Offset` 0x+0.0°; `Trim Multiple Shapes` Simultaneously
   - Why: a drawn line guides the eye
   - Build: SVG stroke-dashoffset animation
   - Source: reel `DLShlJxRXZe` 0:17-0:22
4. **Yellow pop-in, then fade to charcoal** — Letters pop in in the brand yellow and settle to charcoal for legibility.
   - animator Fill Color: yellow
   - range sweeps, then colour eases to charcoal
   - Values: `colours` yellow to charcoal, hex not stated
   - Why: brand colour grabs, charcoal reads
   - Build: per-letter colour tween yellow to charcoal over time
   - Source: reel `DLTLw1DpgwE` 0:10-0:16
5. **Random letter appear and odometer pop-in** — Letters appear in random order; an odometer number (e.g. $600,000,000) rolls its digits in like a slot machine.
   - Range Selector with randomized order for the letter appear
   - odometer layer driven by a Range Selector Offset
   - Values: `example` $600,000,000
   - Why: common Vox moves for names and figures
   - Build: per-letter random delay; per-digit vertical roll in a clip mask
   - Source: reel `DLTLw1DpgwE` 0:16-0:22
6. **His own explainer graphics: hand-drawn yellow box and graph-paper tier list** *(shared)* — He explains with Vox-style graphics: a hand-drawn yellow rectangle boxes the key band on a dark textured EQ graph; the tier list sits on graph paper with condensed caps and a handwritten note.
   - dark textured ground, thin line graph, hand-drawn yellow box as the callout
   - graph-paper ground for lists, big condensed caps headings, handwritten aside
   - Values: `callout colour` yellow; `grounds` dark textured canvas; light graph paper
   - Why: the picture carries the point while the voice talks
   - Build: SVG hand-drawn rect (wobbly path, yellow stroke) over a texture ground; graph-paper ground asset
   - Source: reel `DLnuz5ZJ6Ys` 0:14-0:38
7. **Build markups: shape + Trim Paths + Roughen Edges (twice for chalk)** — Simple shape layers drawn on with Trim Paths; Roughen Edges gives a hand-drawn edge; stack a second Roughen Edges with a lower scale for a chalky stroke. He keeps this as a user preset 'RoughTrim'.
   - shape layer (ellipse/path), Add > Trim Paths, animate End
   - Effect > Stylize > Roughen Edges
   - for chalk: second Roughen Edges with lower Scale
   - save as user preset (his: RoughTrim)
   - Values: `effects` Trim Paths, Roughen Edges x2; `second Roughen Edges` lower Scale (value not stated); `Roughen Edges parameters` not readable
   - Why: organic hand-drawn look
   - Build: SVG stroke draw-on plus feTurbulence/feDisplacementMap twice (coarse, then fine frequency)
   - Source: reel `DMixnWEpuhj` 0:13-0:24
8. **Markup look: violet stroke on graph paper, label boxes** *(shared)* — His demo markup is a thick violet hand-drawn ellipse over a big black serif letter on graph paper, with labels in a serif on violet boxes and a small black sub-label box.
   - graph-paper ground
   - thick single-colour (violet) rough stroke
   - labels: serif caps on solid colour boxes with white keyline
   - Values: `stroke colour` violet / periwinkle (hex not stated); `ground` graph paper
   - Why: one accent colour reads as the teacher's pen
   - Build: accent-colour rough stroke + label chips component
   - Source: reel `DMixnWEpuhj` 0:20-0:24
9. **Text gets texture: Wave Warp + Roughen Edges + slight Heat Distortion** — Add wave warp and roughen edges to the title, plus slight heat distortion so it seems to catch sunlight.
   - Wave Warp on text
   - Roughen Edges on text
   - slight Heat Distortion
   - Values: `heat distortion` slight, value not stated
   - Why: text feels printed and in the same air as the scene
   - Build: SVG feTurbulence+feDisplacementMap for roughened edge and ripple
   - Source: reel `DMtlFlxJ6sg` caption
10. **Turbulent Displace at tiny Size breaks sharp edges** — First effect on the text: Turbulent Displace with Size dragged right down (he says to 2) so only the vector edge breaks up.
   - Effect > Distort > Turbulent Displace on the text
   - Displacement Turbulent, Amount 40
   - Size down to 2 (later frames read 6.0)
   - Complexity 1, Pinning Pin All, Antialiasing Low
   - Values: `Displacement` Turbulent; `Amount` 40.0; `Size` 2.0 when set (6.0 in later frames); `Offset` 540.0,960.0; `Complexity` 1.0; `Evolution` 0x+0.0°; `Pinning` Pin All; `Antialiasing` Low
   - Why: breaks the clean vector edges
   - Build: SVG feTurbulence (high baseFrequency ~ small size, 1 octave) + feDisplacementMap scale ~2-6px on the text
   - Source: reel `DOMfGIfCbuQ` 0:08-0:14
11. **Displacement Map from the paper texture below** — Displacement Map on the text with the paper scan beneath as the map, so letters bend with the surface.
   - Effect > Distort > Displacement Map
   - Displacement Map Layer: the paper scan (Texturelabs_Paper_369XL), Source
   - Use For Horizontal: Red
   - Edge Behavior: Expand Output on, Wrap Pixels Around off
   - Values: `map layer` 21. Texturelabs_Paper_369XL.jpg (Source); `Use For Horizontal` Red; `Max Horizontal / Vertical Displacement` not readable; `Expand Output` on; `Wrap Pixels Around` off
   - Why: text follows the paper surface
   - Build: feDisplacementMap with the paper scan as feImage, channel R, small scale
   - Source: reel `DOMfGIfCbuQ` 0:14-0:20
12. **Noise HLS inside the text matched to the paper grain (most important)** — Add Noise HLS to the text in Grain mode, lightness only, and set Grain Size so it matches the granularity of the texture below.
   - Effect > Noise & Grain > Noise HLS
   - Noise: Grain; Hue 0%, Lightness 23%, Saturation 0%
   - Grain Size ~4 (scrubbed 3.9-5.6 while matching)
   - Values: `effect` Noise HLS; `Noise` Grain; `Hue` 0.0%; `Lightness` 23.0%; `Saturation` 0.0%; `Grain Size` 4.00 (scrubbed 3.93-5.55); `Noise Phase` 0x+0.0°
   - Why: matching granularity makes the text sit in the stock
   - Build: luminance-only noise masked to the text fill, cell size matched to the paper scan's grain
   - Source: reel `DOMfGIfCbuQ` 0:20-0:26
13. **Full text stack: Simple Choker, Turbulent Displace, Noise HLS, Displacement Map, Fast Box Blur** — Beyond the three named effects, the text layer also carries Simple Choker (0) and a light Fast Box Blur (radius 1, 3 iterations) to soften the result.
   - order: Simple Choker > Turbulent Displace > Noise HLS > Displacement Map > Fast Box Blur
   - Fast Box Blur radius 1, iterations 3, Horizontal and Vertical, Repeat Edge Pixels on
   - Values: `Simple Choker` Choke Matte 0.00, View Final Output; `Fast Box Blur Radius` 1.0; `Iterations` 3; `Blur Dimensions` Horizontal and Vertical; `Repeat Edge Pixels` on
   - Why: a 1px soften stops the type looking cut out
   - Build: text pass chain: edge displace -> grain -> paper displace -> 1px blur
   - Source: reel `DOMfGIfCbuQ` 0:10-0:17
14. **Saber glow mapped to text** — Free Saber plugin on a solid, Core Type set to Text Layer so the glow follows the type.
   - Saber on a dark solid
   - Customize Core > Core Type: Text Layer (pick the text layer)
   - Glow Color blue
   - Values: `Glow Color` blue; `Glow Intensity` 6.0%; `Glow Spread` 0.07; `Glow Bias` 0.62; `Core Size` 3.00; `Core Start` 540.0,1632.0; `Core End` 540.0,288.0; `Start Roundness` 0.83; `End Size` 110%; `End Offset` 100%; `End Roundness` 0.50; `Offset Size` on; `Halo Intensity` 100%; `Halo Size` 100%; `Core Softness` 0.0; `Flicker Intensity` 12%; `Flicker Speed` 15.00; `Alpha Mode` Disable; `comp fps` 23.976
   - Why: colourful glowing edge that tracks the letters
   - Build: text outline stroke blurred at 2 radii (core + halo) and added; slight 15Hz intensity flicker
   - Source: reel `DPcvDgNDNM4` 0:25-0:30
15. **4-Color Gradient in Hue mode recolours the glow** — Stack a 4-Color Gradient over the Saber glow with its Blending Mode set to Hue, turning the single-colour glow into a Google-style multicolour.
   - Effect > Generate > 4-Color Gradient on the glow
   - Blending Mode: Hue
   - Blend 100, Jitter 0%, Opacity 100%
   - Values: `Blending Mode` Hue; `Blend` 100.0; `Jitter` 0.0%; `Opacity` 100.0%; `points` e.g. 659.5,962.1 and 196.5,995.6; `colours` not readable
   - Why: multicolour glow without rebuilding it
   - Build: four-point gradient composited with 'hue' blend over the glow layer
   - Source: reel `DPcvDgNDNM4` 0:30-0:33
16. **Jitter on titles for a tacked-on paper cutout feel** — Apply the same jitter to text so titles look like paper cutouts pinned to the board.
   - same jitter on text layers
   - Why: tactile paper cutout feel
   - Build: same jitter applied to the text layer transform
   - Source: reel `DQsNA9RCcs_` 0:21-0:26
17. **Live narration captions as one-line uppercase subtitles** *(shared)* — Every spoken phrase appears as a short uppercase caption, swapped phrase by phrase in sync.
   - 2-6 words per caption
   - uppercase, centred, over the demo
   - Values: `words per caption` ~2-6
   - Why: keeps sound-off viewers following
   - Build: caption track from the narration timing, phrase per cue
   - Source: reel `DY7TSLJAQef` 0:00-0:42
18. **Print Decay: why 1991 print looks messy** *(shared)* — He calls it Print Decay: mass-produced on cheap porous paper with imprecise presses, ink spread outward as it pressed in, leaving tiny bleeds and letterpress inconsistencies the brain associates with nostalgia.
   - identify the three imperfections: edge roughness, uneven ink density, ink bleed
   - recreate each digitally
   - Values: `era` 1991 cover
   - Why: the brain associates these imperfections with nostalgia
   - Source: reel `DYpV-UegFVN` 0:09-0:31
19. **Roughen Edges with the scale turned down** — Apply Stylize > Roughen Edges to the text layer and lower its Scale to break up perfectly clean digital lines.
   - Effects > Roughen Edges on the text layer
   - Edge Type Rough
   - lower Scale from 100
   - Values: `Edge Type` Rough; `Border` 8.00; `Edge Sharpness` 1.00; `Fractal Influence` 1.00 (OCR '100'); `Scale` 100 -> 51.0; `Stretch Width or Height` 0.00; `Complexity` 2; `Evolution` 0x+0.0
   - Why: removes clean digital lines
   - Build: fractal-noise displacement of the text alpha edge (border ~8 px, noise scale ~0.5 of default)
   - Source: reel `DYpV-UegFVN` 0:33-0:37
20. **Letterpress texture via Fractal Noise on the text** — Add Fractal Noise on the text layer after Roughen Edges, lower its brightness and reduce its scale until the ink looks pressed unevenly into the page.
   - Effects > Fractal Noise on the same text layer, below Roughen Edges
   - Fractal Type Basic, Noise Type Soft (Linear)
   - lower Brightness
   - reduce Scale (Transform)
   - Values: `Fractal Type` Basic; `Noise Type` Soft; `Contrast` 100.0; `Brightness` 0 -> -23.0; `Opacity` 100.0; `Scale` reduced, value not shown
   - Why: uneven ink density reads as letterpress
   - Build: soft value noise, brightness -23%, multiplied into the text fill
   - Source: reel `DYpV-UegFVN` 0:38-0:45
21. **Ink bleed: tiny Gaussian Blur plus soft drop shadow** — Add a tiny Gaussian Blur and a soft drop shadow on top of the other two effects to fake ink spreading into the paper.
   - effect order: Roughen Edges, Fractal Noise, Gaussian Blur
   - then a soft Drop Shadow
   - Values: `Blurriness` 'tiny' (spoken); panel shows 25.0 mid-adjustment; `Repeat Edge Pixels` on; `drop shadow` soft, values not stated
   - Why: ink spread
   - Build: canvas blur ~1px on the text + low-opacity soft shadow
   - Source: reel `DYpV-UegFVN` 0:45-0:50
22. **Draw the markup lines with Trim Paths** — Animate the callout lines on a shape layer using Trim Paths (Start/End), then add the two boil effects to that layer.
   - shape layer stroke (Shape Layer 3 in 'Edge Boil Tutorial' comp)
   - Add > Trim Paths
   - keyframe End 0% -> 100% (or Start)
   - Trim Multiple Shapes: Simultaneously
   - Values: `Trim Paths Start` 0.0%; `Trim Paths End` 100.0%; `Offset` 0x+0.0; `Trim Multiple Shapes` Simultaneously
   - Why: lines draw on like a pen
   - Build: SVG stroke-dashoffset or partial polyline length keyed 0->1
   - Source: reel `DZdCD2YNk4d` 0:19-0:24
23. **Switchable Cursor Element for screen shots** — Animation Presets > Shapes > Elements > Switchable Cursor Element gives a fully animatable cursor with several styles; pair it with a screen treatment whenever the scene lives on a computer.
   - double-click the preset
   - switch cursor style
   - add a screen treatment (RGB screen)
   - Values: `preset` Animation Presets > Shapes > Elements > Switchable Cursor Element
   - Why: sells 'this is happening on a computer'
   - Build: SVG cursor sprites with style switch, over an RGB-screen pass
   - Source: reel `DaNlGAcgYsD` 0:08-0:19
24. **Rebus layout weaves images and icons into text** *(shared)* — A rebus weaves images and icons directly into a text layout, often replacing words (IBM's eye-bee-M logo); every image or symbol is another element to animate.
   - replace words in a sentence with photos or icons
   - IBM as eye, bee, M
   - Why: makes ordinary words visually interesting and gives extra motion elements
   - Build: inline SVG/images in the text flow, each animated as its own element
   - Source: reel `DdoVHX5gfP-` 0:09-0:25

## Maps and data

1. **Map scene layer stack** — The map comp is a 20-layer stack: finishing layer, highlights, focus gradient, textures, the ink and cut-out layers, grunge, grade, then the map footage and background.
   - 1 Vox Sauce (finish) Normal
   - 2 Uptown Highlight Normal, 3 Highlight Screen
   - 4 Radial gradient Multiply
   - 5 Texture 1 Overlay (scale 60%)
   - 6 eyes emoji png, 7 Adjustment Layer (Compound Blur), 8 Gray Solid, 9 ink video, 10-12 cut-out layers (Normal)
   - 13 Texturelabs Grunge 340 Overlay, 14 Grunge 267 Color Burn, 15 Group 1 Overlay
   - 16 Curves 2, 17 Curves 1, 18 Hue/Saturation 1 (grade adjustment layers)
   - 19 VoxMap.mp4 (map footage), 20 BG
   - Values: `layers` 20; `blend modes` Screen (highlight), Multiply (gradient), Overlay (texture, grunge, group), Color Burn (grunge 267); `Texture 1 scale` 60.0%
   - Why: order matters: grade under textures, focus gradient over everything except highlights and finish
   - Build: map scene renderer: base footage -> grade -> grunge (overlay, color-burn) -> cut-outs -> blur pass -> texture overlay -> gradient multiply -> highlights screen -> finish pass
   - Source: reel `DLShlJxRXZe` 0:12-0:15
2. **Satellite base map with district labels and a Screen highlight** *(shared)* — The base is satellite footage (Google Earth, Landsat/Copernicus credit) labelled with district names; the chosen district gets a highlight shape in Screen mode.
   - satellite footage as the map
   - district labels in caps (NODA, UPTOWN, SOUTH END, DILWORTH)
   - highlight shape over the chosen district, blend Screen
   - Values: `source credit` Google Earth, Landsat / Copernicus; `highlight blend` Screen
   - Why: real imagery plus one lit area makes the target obvious
   - Build: satellite still/tiles as base, SVG district polygon filled with light colour in 'screen' mode, caps labels
   - Source: reel `DLShlJxRXZe` 0:09-0:14
3. **Audio Waveform effect on a solid: exact settings** — New Solid, add Generate > Audio Waveform, pick the music in Audio Layer, choose a display style and raise Maximum Height.
   - Layer > New > Solid
   - Effects & Presets search 'wave' > Generate > Audio Waveform
   - Audio Layer dropdown = the audio track
   - Display Options: Digital, Analog lines or Analog dots
   - raise Maximum Height
   - Composite On Original left on
   - Values: `Start Point` 108.0,960.0; `End Point` 972.0,960.0; `Path` None; `Displayed Samples` 120; `Maximum Height` 120 -> 152; `Audio Duration (ms)` 125.00; `Audio Offset (ms)` 0.00; `Thickness` 3.00; `Softness` 50.0%; `Waveform Options` Mono; `Display Options` Analog lines
   - Why: audio layer makes it reactive; height makes amplitude visible
   - Build: Web Audio/ffmpeg amplitude samples (120 per window, 125 ms) -> canvas polyline from (108,960) to (972,960)
   - Source: reel `DVRV9hiCX4F` 0:07-0:19
4. **Stack duplicates with different styles, colours and Add mode** — Duplicate the visualizer layer a few times, change the style on each (one is a Digital spectrum with Side A & B), give each a colour and stack them in Add mode.
   - duplicate layer to 3-4 copies (Waveform 1-3)
   - vary Display Options per copy (Digital / Analog lines / Analog dots)
   - Side Options Side A & B on one
   - layer mode Add
   - different Inside/Outside Color per copy
   - Values: `copies` 3-4; `layer mode` Add; `spectrum copy` ~14700.0, 64 bands, 2990.0 height, 90.00 duration, 10.00, thickness 4.00, softness 0.0% (field labels partly cut off); `Side Options` Side A & B; `Display` Digital; `scale` 122.9 %; `one colour` ~#CC5049 (OCR 'CCS049')
   - Why: layered styles read richer than one default line
   - Build: several spectrum/waveform renderers drawn with 'lighter' composite and per-copy colour
   - Source: reel `DVRV9hiCX4F` 0:21-0:26
5. **Monospaced number counters** — The built-in counting-numbers preset is monospaced, so digits stay aligned instead of jittering while they count (shown side by side: monospaced vs non-monospaced).
   - Animation Presets > Counting Numbers
   - drive the value slider
   - use tabular figures
   - Values: `demo` 0% -> 100% monospaced vs non-monospaced; `slider value` ~3056.85 (Effect Controls)
   - Why: alignment; jitter looks amateur
   - Build: font-variant-numeric: tabular-nums; fixed-width digit slots
   - Source: reel `DaNlGAcgYsD` 0:19-0:28
6. **Radio waves for callouts and location markers** — Radio Waves (built in) makes expanding rings to mark a location or draw attention without manual animation.
   - Radio Waves on a map point (demo: a radio station in Buffalo, NY)
   - Why: automatic attention-grabber
   - Build: SVG concentric rings expanding with fading opacity
   - Source: reel `DaNlGAcgYsD` 0:28-0:35
7. **Colour regions with shapes in Overlay over a desaturated map** — Trace the regions to highlight with shape layers, give each region its colour, set the shapes to Overlay, and drop the base map's saturation with Hue/Saturation on an adjustment layer.
   - shape layers tracing regions, one colour each
   - shape blend mode Overlay
   - adjustment layer with Hue/Saturation below the shapes, Master Saturation down
   - Values: `blend` Overlay; `Hue/Saturation Master Saturation` 0 -> ~-15 (seen); Colorize off
   - Why: colour shows through while keeping map detail; reads best on a desaturated base
   - Build: SVG region paths with mix-blend-mode overlay over a saturate(0.85) map
   - Source: reel `DcTljpCgNNJ` 0:14-0:24
8. **Finish with a texture overlay and drifting clouds** — Finish the map with a texture overlay and, optionally, animated clouds on top for more depth.
   - texture overlay on top
   - optional animated clouds layer
   - Why: adds depth
   - Build: cloud plate scrolled slowly with screen/soft-light blend
   - Source: reel `DcTljpCgNNJ` 0:29-0:36

## Workflow and tools

1. **Finishing adjustment layer stack ('Vox Sauce')** — One adjustment layer named Vox Sauce carries the whole finish, in order: Quick Chromatic Aberration 3, Posterize Time, Exposure, Add Grain.
   - one top adjustment layer over the comp
   - effects in order: Quick Chromatic Aberration 3 > Posterize Time > Exposure > Add Grain
   - Values: `order` Chromatic Aberration, Posterize Time (12.0), Exposure, Add Grain
   - Why: one reusable finishing pass gives every shot the same look
   - Build: a single post pass in the engine: rgb shift -> time quantize -> exposure -> grain, applied to every scene
   - Source: reel `DLQ4Wp9pqv3` 0:10-0:12
2. **Build type animation once as a Text Animator preset** — Use a Text Animator with a Range Selector, then Animation > Save Animation Preset to reuse it forever.
   - text layer > Animate: add properties (Fill Color, Position, Scale, Rotation, Opacity)
   - Range Selector 1: animate Start/End/Offset
   - Animation > Save Animation Preset
   - Values: `Range Selector` Start 0%, End 0%, Offset 0% at the frame shown; `animator properties` Fill Color, Anchor Point, Position, Scale, Rotation, Opacity
   - Why: build once, reuse forever
   - Build: parametric per-character animator in the engine (range 0..1 sweeping over characters, driving colour/offset/opacity), saved as named presets
   - Source: reel `DLTLw1DpgwE` 0:04-0:10
3. **The 'Secret Sauce' finishing stack, in order** — His finishing adjustment layer runs: Quick Chromatic Aberration 3, Posterize Time 12, Exposure (flicker), Add Grain, Transform (jitter), Glow (off by default, sometimes worth adding).
   - one adjustment layer on top of every comp
   - order: Chromatic Aberration > Posterize Time > Exposure > Add Grain > Transform > Glow (off)
   - Values: `Posterize Time` 12.0; `comp fps` 24; `Glow` off by default
   - Why: one reusable pass gives every shot gate weave, flicker, grain and stepped time
   - Build: engine post chain: rgb shift -> time quantize 12 -> exposure flicker -> grain -> jitter translate (-> optional soft glow)
   - Source: reel `DLX9PJ_pwBA` 0:16-0:25
4. **Save the focus hunt as an Animation Preset** — Save the blur keys as an animation preset to reuse on every zoom.
   - select the effect with its keys
   - Animation > Save Animation Preset
   - Why: reuse
   - Build: named focus-hunt preset in the engine, attachable to any camera move
   - Source: reel `DLdy8b5JpHC` 0:21-0:23
5. **Let an LLM draft expressions** — If expressions scare you, ChatGPT writes them and they are usually good; he shows the exact prompt.
   - prompt: write an AE expression for my exposure value to mimic a TV flickering effect
   - Why: lowers the barrier to procedural motion
   - Build: n/a (our engine is code already)
   - Source: reel `DMWEwQRp6aD` 0:28-0:33
6. **Effect order: choker, then roughen, then posterize** — Stack order is Simple Choker, then Roughen Edges, then Posterize Time on the same layer.
   - Simple Choker first
   - Roughen Edges second (acts on the choked matte)
   - Posterize Time last
   - Values: `order` Simple Choker > Roughen Edges > Posterize Time
   - Why: roughen must act on the choker's output
   - Build: pipeline order: erode -> displace edge -> time quantize
   - Source: reel `DMjAWcFJYqo` 0:02-0:09
7. **Build once, save as preset** — Save the treatment stack via Animation > Save Animation Preset to reuse.
   - Animation > Save Animation Preset
   - Why: avoids rebuilding
   - Build: screen treatments as reusable engine presets
   - Source: reel `DNmGyQupPlQ` 0:27-0:31
8. **Save effect stacks as presets: the 'Mixed Media Treatment'** — Perfect a stack once, Shift-select its effects, Animation > Save Animation Preset to the User Presets library. His example preset 'Mixed Media Treatment' = Posterize Time, Chromatic Aberration, Exposure Flicker, Subtle Camera Shake, Vignette.
   - build the stack on an adjustment layer (shown: Quick Chromatic Aberration 3, Posterize Time, Exposure, Add Grain)
   - Shift-select the effects
   - Animation > Save Animation Preset > User Presets (.ffx)
   - Values: `preset contents` Posterize Time, Chromatic Aberration, Exposure Flicker, Subtle Camera Shake, Vignette; `Chromatic Aberration` Channels Red & Blue, Anchor Mode Absolute Point, Anchor 960.0,540.0 (landscape comp), Mix With Original 0.00%; offset value unclear (~3-6); `file` MixedMediaTreatment.ffx
   - Why: one click away and easy to tweak next project
   - Build: engine: named treatment modules (posterize + rgb shift + flicker + shake + vignette) selectable per film
   - Source: reel `DO60IqNif6o` 0:08-0:25
9. **His preset library = his move vocabulary** — The User Presets folder lists his reusable moves; the names show the building blocks of his style.
   - name presets by what they do and keep them in one folder
   - Values: `presets seen` Waggle, VoxSauce, TrimPathsSimple, ThiccTop, ThiccBottom, TextVaryWiggle, TextShake_Scale, TextPop_BG, TextLoadUpTransform, SmoothUpTransform, Smooth Load Up, Slight Move Up, SlideIn Left Text, Seamless, RoughTrim, RoughTextDisplacement, Pop In Choppy, Page Animator 1, OpacityStrobe_Short, MeshGradient, LoadUp, LoadDownSmooth, Load Up_AppearWord, LetterLoad, Lettering In, HardCutLeft, Global Shake, Flicker On
   - Why: a named library is a style system
   - Build: mirror as an engine move registry: load-up/down, pop-in choppy, rough trim, text wiggle, opacity strobe, flicker on, global shake, hard cut
   - Source: reel `DO60IqNif6o` 0:22-0:24
10. **FX Console: a search bar for presets** — The free FX Console plugin (Video Copilot, v1.0.5 shown) opens a search bar for effects and presets, e.g. typing 'load' surfaces LoadUp, LoadDownSmooth, LetterLoad.
   - install FX Console (free)
   - hotkey, type the preset name, Enter
   - Values: `plugin` FX Console v1.0.5 (free)
   - Why: removes click fatigue
   - Build: n/a (AE plugin); in our engine keep a searchable preset registry
   - Source: reel `DO60IqNif6o` 0:24-0:30
11. **Save the blend as a preset** — Always save the stack as a preset so you never rebuild it.
   - Animation > Save Animation Preset
   - Why: reuse
   - Build: text-into-texture preset in the engine
   - Source: reel `DOMfGIfCbuQ` 0:33-0:35
12. **Jitter presets with slider controls** — His drag-and-drop presets (text and object) expose two sliders: Jitter Frequency and Jitter Amount; the object preset shows 5 and 60.
   - Expression Controls: Slider 'Jitter Frequency', Slider 'Jitter Amount'
   - expression reads the sliders instead of constants
   - Values: `Jitter Frequency` 5.00; `Jitter Amount` 60.00 (object preset)
   - Why: tunable per layer without touching code
   - Build: jitter(freq, amount) params on any engine element
   - Source: reel `DQsNA9RCcs_` 0:28-0:33
13. **Comp structure: one precomp per technique** — His project is split into precomps named by technique: BASE, 'offset paths & wave warp', Difference, BWG (black-white-gray), Tritone, Art Direction, then the final comp.
   - one precomp per layer of the look, stacked in a master
   - Values: `precomps` BASE, offset paths & wave warp, Difference, BWG, Tritone, Art Direction; `fps` 23.976
   - Why: each stage can be swapped or toggled
   - Build: scene graph with named passes in order
   - Source: reel `DR0HIWTiTkJ` 0:12-0:16
14. **Ship gate weave and flicker as reusable toggles** — Package both imperfections as independent switchable presets; they have uses beyond this one look.
   - one preset per imperfection
   - each with an on/off switch, stackable
   - Values: `presets` 2 (Gate Weave, Exposure Flicker)
   - Why: reusable across projects, not just the 80s look
   - Build: two independent post-pass modules with enable flags in the engine's render config
   - Source: reel `DTJJq9JiXxj` 0:25-0:34
15. **CRT template controls and their defaults** — The template exposes the emulation as sliders: footage scale/position, fine-tune downsample, overlay intensity, smudges and flicker strength.
   - Footage Scale
   - Footage Position
   - Fine Tune > Downsample %
   - Overlay Intensity
   - Smudges Strength
   - Flicker Strength
   - same effect works in Premiere (CRT Emulation effect in Effect Controls)
   - Values: `Footage Scale` 100; `Footage Position` 960.0,540.0 (1920x1080 comp); `Downsample %` demoed 47-63, settles 54; `Overlay Intensity` demoed 0 to ~43; `Smudges Strength` 50 %; `Flicker Strength` 20
   - Why: quick per-shot tuning without opening the stack
   - Build: parametrised CRT filter with downsample, overlayIntensity, smudges, flicker params (defaults 54/0/50/20)
   - Source: reel `DTOKw4vieGq` 0:36-0:41
16. **Put the pair on one adjustment layer over the collage** — Drop both effects on one adjustment layer at the top of the collage comp so all digital assets read like physical scans.
   - adjustment layer named 'Magic Crunch Sauce' at the top of the stack
   - collage layers and White BG below
   - Values: `comp depth` 16 bpc; `layer` Magic Crunch Sauce (adjustment, top)
   - Why: unifies digital assets as a scan
   - Build: single post-process pass at the end of the frame pipeline
   - Source: reel `DUEIdzuCUgn` 0:33-0:41
17. **Template: drop audio into one comp, both visualizers react** — The free template has an 'AUDIO HERE' comp: drag the audio in and both stylised visualizers update.
   - one input comp feeds all visualizers
   - Values: `visualizers` 2
   - Why: one input, many outputs keeps it reusable
   - Build: single audio input parameter shared by all visualizer components
   - Source: reel `DVRV9hiCX4F` 0:33-0:37
18. **Stack all three on the text layer inside the recreation comp** — The whole treatment is three effects stacked on one text layer (in a 'Magazine Recreation' comp over a paper Background), so it can be reused on any headline.
   - text layer over a paper Background layer
   - effect stack top to bottom: Roughen Edges, Fractal Noise, Gaussian Blur (+ drop shadow)
   - Values: `comp depth` 8 bpc; `stack` Roughen Edges > Fractal Noise > Gaussian Blur
   - Why: one reusable stack per type layer
   - Build: a 'printDecay' text filter chain in the engine
   - Source: reel `DYpV-UegFVN` 0:34-0:50
19. **Space layers in Z with the free Depth script** — Bring the layers into After Effects as 3D layers and space them out in Z; the free 'Depth' script does it in one click (Disperse), or do it by hand.
   - import the PSD as layers, enable 3D
   - Depth script v1.0.2: set Focal Length and Layer Spacing, Create Camera Null, Disperse
   - Draft 3D on for preview
   - Values: `script` Depth (Yat Fung Leung), v1.0.2, free; `Focal Length` 50mm; `Layer Spacing` 1000; `Create Camera Null` on
   - Why: real Z distances give correct parallax ratios
   - Build: assign each layer a z depth; project with a 50mm-equivalent camera
   - Source: reel `DZsDDmvtNJP` 0:24-0:31
20. **Package it as a drag-and-drop preset** — Both expressions are saved as a single drag-and-drop animation preset ('cinema-treatment') applied from Effects & Presets.
   - save the effect stack as an animation preset
   - search it by name and drop it on a layer
   - Values: `preset` cinema-treatment
   - Why: one-step reuse
   - Build: a 'cinemaTreatment' post-pass with weave and flicker params
   - Source: reel `Da3YpRipHuF` 0:36-0:41

## What reads as fake

1. **Never set texture strength with opacity** *(shared)* — Reducing the texture layer's opacity makes it feel pasted on and muddies colour; on-screen labels say opacity reads dull and flat.
   - keep texture layers near full opacity
   - control strength another way (Curves, next lesson)
   - Values: `opacity` avoid as the strength control; `screen labels` OPACITY = DULL & FLAT vs CURVES = MUCH BETTER
   - Why: opacity makes textures less integrated and muddies colours
   - Build: never use globalAlpha as the texture-strength knob
   - Source: reel `DL24UePpHWN` 0:19-0:28
2. **Only one text animation at a time** *(shared)* — Several simultaneous text animations leave viewers not knowing where to look or what to read.
   - one text animation active at once
   - Values: `simultaneous text animations` 1
   - Why: attention clarity
   - Build: scheduler constraint: one active text animation per moment
   - Source: reel `DLTLw1DpgwE` 0:22-0:27
3. **Flicker expression detail: the hold never applies** — His code computes floorTime but seeds with index + time, so the value changes every frame (stepped only by Posterize Time 12); seeding with floorTime is what would hold each value for 1/freq s.
   - to actually hold: seedRandom(index + floorTime, true)
   - or rely on the 12 fps Posterize Time in the same stack
   - Values: `effective flicker rate` every frame (12 fps after Posterize Time), not 2 per second
   - Why: copying the code verbatim gives faster flicker than the comment promises
   - Build: seed the flicker random by floor(t*freq) so each value holds 1/freq s
   - Source: reel `DLX9PJ_pwBA` 0:19-0:21
4. **Grain on top; do not overcook** *(shared)* — Add Grain on top for subtle movement; keep it light, eyes notice more than we think; glow plus grain stops it feeling like an iMovie slideshow.
   - Add Grain on the same adjustment layer, after Glow
   - Viewing Mode Final Output, Preset None
   - Intensity ~0.4-0.5, Size 1, Softness 1, Aspect 1
   - Values: `Add Grain Intensity` 0.500 (scrubbed between 0.4 and 0.5); `Size` 1.000; `Softness` 1.000; `Aspect Ratio` 1.000
   - Why: avoids the static-slideshow look without drawing attention
   - Build: per-frame grain overlay, low strength, after the glow pass
   - Source: reel `DMWEwQRp6aD` 0:12-0:22
5. **Same flicker-code caveat: hold not applied** — As in his film-flicker code, the seed uses time, not floorTime, so values change every frame rather than every 0.5 s.
   - seedRandom(index + floorTime, true) to really hold for 1/freq
   - Values: `effective rate` every frame
   - Why: copying verbatim gives a faster flicker than the comment says
   - Build: seed by floor(t*freq)
   - Source: reel `DNmGyQupPlQ` 0:22-0:24
6. **Do not double-stack a band** *(shared)* — Too many textures in one band, e.g. two mids, turns muddy and looks bad.
   - pick one texture per band
   - Values: `max per band` 1
   - Why: muddy, chaotic look
   - Build: lint: refuse more than one overlay of the same band
   - Source: reel `DNuJS_oWoxM` 0:26-0:30
7. **Never pure white or pure black: #373030 and #FAF5E9** *(shared)* — Nudge text colours off pure values; he swaps #000000 for #373030 and #FFFFFF for #FAF5E9, and marks the extreme corners of the colour picker as zones to avoid.
   - dark: #373030 instead of #000000
   - light: #FAF5E9 instead of #FFFFFF
   - avoid the corner zones of the picker
   - Values: `dark` #373030; `light` #FAF5E9; `avoid` #000000, #FFFFFF
   - Why: almost nothing in reality is pure; off values look natural
   - Build: palette tokens: ink #373030, paper-white #FAF5E9; lint for pure #000/#FFF
   - Source: reel `DOMfGIfCbuQ` 0:26-0:33
8. **Cutting on stillness feels jarring** *(shared)* — A cut on a still frame calls attention to itself.
   - avoid cutting on static frames
   - Why: nothing for the eye to follow
   - Build: validator: flag cuts where outgoing and incoming motion are both zero
   - Source: reel `DOb0h6VCSpM` 0:21-0:24
9. **Crack the vector look: Turbulent Displace 50 / 2 / 2** — Turbulent Displace on the line with Amount about 50 and Size and Complexity down to 2.
   - Effect > Distort > Turbulent Displace
   - Amount ~50, Size 2, Complexity 2, Pinning Pin All, Antialiasing Low
   - Values: `Displacement` Turbulent; `Amount` 50.0; `Size` 2.0; `Complexity` 2.0; `Offset` 540.0,960.0; `Pinning` Pin All; `Antialiasing` Low; `second instance` Turbulent Displace 2 at Amount 31.0, Size 2.0, Complexity 2.0
   - Why: removes vector perfection
   - Build: feTurbulence (fine scale, 2 octaves) + feDisplacementMap on the stroke
   - Source: reel `DT2_SIMgBfI` 0:19-0:24
10. **Too-crisp edges read as digital** *(shared)* — When animation feels overly crisp, the cause is perfectly clean edges; analog needs them softened.
   - diagnose crispness as edge cleanliness
   - Why: clean edges are a digital tell
   - Build: avoid perfectly clean vector edges in the final pass
   - Source: reel `DUEIdzuCUgn` 0:03-0:11
11. **Most online textures are too large: scaling down runs out of texture** *(shared)* — Paper textures from stock sites are usually huge; scaling the layer down (demo 102% -> 94%) leaves the frame uncovered.
   - recognise the problem before scaling
   - Values: `demo scale` 102.0% -> 94.0% exposes the edges; `sources browsed` Texture Labs, Vecteezy, Pngtree, Textures4Photoshop, Dreamstime
   - Why: a downscaled single image cannot cover the frame
   - Source: reel `DcBhNhOg5kR` 0:12-0:18
