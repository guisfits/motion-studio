# Chris Moran: what this role must know (131 lessons)

Source: Chris Moran (`@chrismoran__`), professional motion designer teaching the editorial-collage look in After Effects, 52 tutorial reels.
Every lesson below was extracted from the reel's transcript and its on-screen panels (OCR at 2 fps); the full ledger is `tutorials/chrismoran/lessons.jsonl`.
Values are his (After Effects units); `~` = read uncertainly; "not stated" = he gave none. `Build` says how this engine does it.
Lessons marked *(shared)* are owned by another role; know them, do not execute them.

Where a lesson and `tools/checks/norms.mjs` disagree, the norm gates the render; raise the conflict to the Director.

## Hook and first seconds

1. **Hook: 'not the dunk', the TV treatment; take it away** *(shared)* — Show a vintage-treated basketball clip, misdirect from the dunk to the TV treatment, remove it so it looks like low-quality footage, then name 'screen treatments' and promise three steps.
   - 'Look at this clip. See it? Not the dunk.'
   - A/B: treatment off at ~0:06
   - name it with a title card 'SCREEN Treatments'
   - count: just three steps
   - Values: `steps` 3; `A/B at` ~0:06
   - Why: misdirect plus A/B proves the treatment is what dates the clip
   - Source: reel `DaQeqljgc7y` 0:00-0:16
2. **Hook: how you apply a texture matters more than which one** *(shared)* — Frame blend modes as the real skill in texturing, more important than picking the texture.
   - claim: texturing makes design feel real
   - twist: application beats selection
   - topic: blend modes
   - Why: application decides whether the texture looks right
   - Source: reel `DbBSCjjgbTw` 0:00-0:08
3. **Hook: same texture, different scale, tactile vs off** *(shared)* — Show two frames with the exact same texture, one tactile and one off, reveal the difference is scale, and tease a weird quarter trick.
   - A/B with labels (TACTILE)
   - reveal: same texture, only scale differs
   - tease the trick, then 'but first, there's a problem'
   - Why: scale decides believability; the tease holds viewers through the setup
   - Source: reel `DcBhNhOg5kR` 0:00-0:12

## Structure, pacing, retention

1. **Cheat sheet with search terms as the CTA** *(shared)* — Ends on a screenshot-able cheat sheet: what each band adds, examples and search terms.
   - Highs: 'film grain overlay', 'color noise texture', 'paper scan texture'
   - Mids (body, rhythm, character): 'halftone texture', 'grunge overlay', 'paper print scan'
   - Lows (grounds the look, ties everything): 'light refraction overlay', 'glass distortion texture', 'film light leak'
   - Rule of thumb: one High, one Mid, one Low
   - Values: `search terms` 9 (3 per band)
   - Why: a saveable payoff drives retention and shares
   - Build: archivist search list per texture band
   - Source: reel `DNuJS_oWoxM` 0:30-0:36

## Composition and hierarchy

1. **Maps steer attention, not just decorate** — Map visuals should manipulate focus and tell the viewer where to look.
   - treat the map as a focus tool
   - Why: directs the eye
   - Source: reel `DLShlJxRXZe` 0:00-0:04
2. **Markups as an invisible teacher's hand** — When a frame has no hierarchy or focal point, circles, arrows and callouts override it and say 'look here first'; demo on a map of east-coast states with a 'Look here first' label.
   - identify frames with no focal point
   - add one markup that names the target ('Look here first')
   - Values: `markups per frame` one focal markup in the demo
   - Why: improves comprehension by guiding the eye
   - Build: annotation overlay layer (circle/arrow/label) keyed to the narration beat
   - Source: reel `DMixnWEpuhj` 0:04-0:13
3. **Fake depth: low contrast back, high contrast front** — Reduce contrast on the background and raise it in the foreground for visual separation.
   - background layer: less contrast
   - foreground layer: more contrast
   - Why: cheap atmospheric-perspective depth cue
   - Build: per-layer contrast() filter, lower on back planes
   - Source: reel `DMtlFlxJ6sg` 0:23-0:30
4. **Layered backgrounds instead of flat solids** — Flat solids are fine because they do not distract, but if every background is flat the piece lacks identity; Vox uses image backgrounds constantly.
   - use solids sparingly for focus beats
   - default to a layered image background
   - Why: identity and editorial feel
   - Build: background layer built from images, not fillRect
   - Source: reel `DY7TSLJAQef` 0:10-0:22
5. **Topic-matched background imagery** *(shared)* — Pull a few images that support the video's subject; for a political piece: the Capitol building, newspaper scans, political architecture.
   - pick 2-3 subject images (demo: Capitol facade + 1918 NYT 'Armistice signed' front page)
   - arrange them overlapping, angled
   - Values: `images` a few (2 shown)
   - Why: relevance gives the frame meaning even in the background
   - Source: reel `DY7TSLJAQef` 0:22-0:30
6. **Why: subtle treatments create depth** — These subtle treatments appear constantly in documentaries and Vox uses them for depth.
   - keep each treatment subtle
   - Why: depth without calling attention
   - Source: reel `DZFqNzwAqVa` 0:20-0:26
7. **Pick a photo with clear foreground, midground, background** *(shared)* — Start with an image that has plenty of depth: a clear foreground, midground and background.
   - choose photos with three readable depth planes
   - Values: `planes` 3
   - Why: parallax needs separable planes
   - Source: reel `DZsDDmvtNJP` 0:12-0:15
8. **Treat the image as typography: match scale and align** — The key to a rebus: size the image like type and line it up with the text.
   - match the image's scale to the adjacent type
   - align it with the text line
   - Values: `scale` match text height
   - Why: the image reads as part of the word
   - Build: size icons to cap height, baseline-aligned in the layout
   - Source: reel `DdoVHX5gfP-` 0:25-0:35

## Camera and focus

1. **Subtle vignette guides the eye and sells journalism** — Third layer is a subtle vignette; the trio is used in documentaries to make viewers feel part of the story.
   - subtle vignette layer
   - Values: `vignette strength` subtle, not stated
   - Why: it places the viewer inside the journalism, not just polish
   - Build: radial gradient multiply, low alpha, in the final-pass stack
   - Source: reel `DLQw7mqJzRp` 0:13-0:21
2. **Focus vignette with a Compound Blur** *(shared)* — A radial gradient in Multiply darkens the edges, and an adjustment layer with Compound Blur uses the gradient as its blur map; animating the gradient centre moves the focus.
   - new solid with a radial gradient, blend Multiply
   - adjustment layer above the map with Compound Blur
   - Blur Layer = the radial gradient layer (dropdown)
   - Maximum Blur 15, If Layer Sizes Differ: Stretch Map to Fit
   - animate the gradient Start Point to the subject
   - Values: `blend mode` Multiply; `effect` Compound Blur; `Maximum Blur` 15.0; `If Layer Sizes Differ` Stretch Map to Fit; `Invert Blur` option shown, state not readable; `gradient Start Point` 293.2,-487.2 moving to 293.2,-325.2; `comp fps` 24
   - Why: focus manipulation, as Vox maps do
   - Build: radial-gradient multiply mask plus a blur whose radius is read from the same mask (two-pass: sharp + blurred, mixed by mask), centre keyed to the target
   - Source: reel `DLShlJxRXZe` 0:04-0:17
3. **Choppy handheld camera: 3D camera with wiggle on position** *(shared)* — Three planes as 3D layers with a simple 3D camera whose position has a wiggle gives the choppy handheld look of the ad.
   - split FG/MG/BG into 3D layers
   - simple 3D camera
   - wiggle on camera position
   - Values: `wiggle` values not stated
   - Why: copies the choppy handheld look of the reference ad
   - Build: parallax camera with per-plane depth scaling plus stepped random offsets on camera x/y
   - Source: reel `DMtlFlxJ6sg` caption
4. **Depth script: Disperse layers in z** *(shared)* — The free Depth script (Yat Fung Leung) distributes selected layers in 3D without breaking existing animation: select the layers, press Disperse.
   - install Depth (free, $0+)
   - select the scene layers (3D on)
   - Focal Length 50mm, Layer Spacing 1000, optional Create Camera Null
   - press Disperse
   - Values: `tool` Depth v1.0.2 script (free); `Focal Length` 50mm; `Layer Spacing` 1000; `options` Create Camera Null, Disperse, Move
   - Why: the 3D camera is intimidating; this sets depth in one click
   - Build: assign each plane z = index * spacing and scale it by (z+f)/f so it keeps its framed size
   - Source: reel `DQu3nYiCepd` 0:06-0:21

## How pieces move

1. **Cut frame rate to 12 fps with Posterize Time** *(shared)* — Vox animation is stepped at about 12 fps with Posterize Time on the finishing adjustment layer.
   - add Posterize Time to the top adjustment layer
   - Frame Rate 12.0
   - Values: `effect` Posterize Time; `Frame Rate` 12.0
   - Why: stepped motion gives the hand-made stop-motion feel
   - Build: quantize time t=floor(t*12)/12 for animated layers; output 24/30 with held frames
   - Source: reel `DLQ4Wp9pqv3` 0:08-0:12
2. **Jitter, not wiggle: snaps to random values** *(shared)* — Wiggle's motion path glides between values and feels software-made; jitter's path snaps to random values like cutouts nudged under a rostrum camera. A side-by-side motion-path diagram shows both.
   - drop jitter on Position, Rotation or Scale
   - never use wiggle for the stop-motion look
   - Values: `wiggle` smooth path between values; `jitter` snaps to random values
   - Why: randomness with holds is the stop-motion signature
   - Build: hold-random offsets refreshed N times per second (random, not noise), applied to transforms
   - Source: reel `DQsNA9RCcs_` 0:12-0:21
3. **Concentric outlines: shape stroke plus Offset Paths** *(shared)* — A stroked shape layer with Offset Paths expands into concentric outlines.
   - shape layer + Stroke
   - Add > Offset Paths (with copies) to expand outward
   - Why: the repeating-shapes look
   - Build: SVG: N offset outlines of one path (stroke only), animated outward
   - Source: reel `DR0HIWTiTkJ` 0:12-0:18
4. **Edge boil: why hand-drawn lines wiggle** *(shared)* — Edge boil is one of the easiest ways to make animation feel crafted; before software every frame was drawn by hand, so each line differed slightly and shapes wiggled frame to frame.
   - recognise the boil as frame-to-frame line variance
   - Why: hand-drawn frame-by-frame variance reads as crafted
   - Source: reel `DZdCD2YNk4d` 0:07-0:19

## Transitions

1. **Logo reveal: Simple Choker 100 to 0 + Roughen Edges + Posterize Time 12** *(shared)* — Three stacked effects on the logo; animate Simple Choker's Choke Matte from a positive value down to zero to grow the logo in with ragged edges at 12 fps.
   - Effect > Matte > Simple Choker (View: Final Output)
   - Effect > Stylize > Roughen Edges (Edge Type Roughen)
   - Effect > Time > Posterize Time, Frame Rate 12
   - keyframe Choke Matte 100 -> 0
   - Values: `Choke Matte` 100.00 -> 0 (graph card '100 (SIMPLE CHOKER) 0'); `View` Final Output; `Edge Type` Roughen; `Border` 1.60; `Edge Sharpness` 9.90; `Fractal Influence` 1.00; `Scale` 10.0; `Stretch Width or Height` 0.00; `Offset (Turbulence)` 0.0,0.0; `Complexity` 2; `Evolution` 0x+0.0°; `Posterize Time` 12.0
   - Why: the choke erodes the matte; roughen makes the growing edge organic; 12 fps steps it
   - Build: alpha matte erode (morphology radius 100->0) + feTurbulence displacement on the edge (scale ~10, 2 octaves), time quantized to 12 fps
   - Source: reel `DMjAWcFJYqo` 0:02-0:12
2. **What a luma matte is and when to use it** — A luma matte is black and white footage used as a mask for another layer; use it when a visual should feel developed or uncovered in real time.
   - black/white footage drives the visibility of the layer below
   - Why: reads as something being developed or uncovered live
   - Build: mask = luminance of a video frame
   - Source: reel `DVcF9XyiSjm` 0:06-0:16
3. **Ink reveal: ink bleed overlay above artwork, Inverted Luma Matte** *(shared)* — Put an ink bleed overlay directly above the artwork and set the artwork's Track Matte to the ink layer, inverted; where the overlay is bright the design shows.
   - layer stack: 1 Ink, 2 Artwork, 3 Background White, 4 Audio
   - Artwork Track Matte = 1. Ink, Luma, inverted (click the invert toggle)
   - ink footage is an ink-bleed stock clip
   - Values: `matte` Inverted Luma Matte; `stack` Ink / Artwork / Background White / Audio; `comp depth` 8 bpc
   - Why: the ink plate reveals the design as it spreads
   - Build: ffmpeg maskedmerge/alphamerge with ink footage luminance; canvas mask from video luminance (inverted)
   - Source: reel `DVcF9XyiSjm` 0:17-0:25
4. **Page turn with CC Page Turn: settings** *(shared)* — Drop the built-in CC Page Turn on the page layer, animate Fold Position from one corner to the other, and raise Fold Radius to soften the bend.
   - Effects > CC Page Turn on the page layer
   - keyframe Fold Position corner to corner
   - raise Fold Radius
   - Render: Front & Back Page; Back Page = a layer; lower Back Opacity
   - Values: `Fold Position` 219.3,178.3 -> 759.8,814.0 (corner to corner); `Fold Direction` 0x-60.0°; `Fold Radius` 19.6 -> 47.5 -> 91.9 while dragging; final 50.0; `Light Direction` 0x-60.0°; `Render` Front & Back Page; `Back Opacity` 100.0 -> 85.0
   - Why: a softer bend reads more like paper
   - Build: page-curl: fold line moving diagonally at -60°, cylinder radius ~50 px shading, back face at 85% opacity
   - Source: reel `Dafr0KjAkve` 0:13-0:25
5. **CC Burn Film reveal 100 to 0** *(shared)* — Reveal the map with Stylize > CC Burn Film, keyframing Burn from 100 to 0.
   - CC Burn Film on the map layer
   - keyframe Burn 100 -> 0
   - set Center and Random Seed to taste
   - Values: `Burn` 100 -> 45.0 -> 0.0; `Center` ~702.3,121; `Random Seed` 1 -> 180
   - Why: a burnt-film dissolve makes a cool reveal
   - Build: noise-thresholded burn mask with dark/orange edge, threshold swept 1 -> 0
   - Source: reel `DcTljpCgNNJ` 0:24-0:29

## Paper and texture

1. **Texture is intentional: pick per piece from free libraries** — Choose textures like a chef picks ingredients, per piece; here a faded newspaper and a macro shot of stock paper for a title card.
   - browse free libraries (Texturelabs, Texture Fabrik shown)
   - pick per piece: 'Faded Newspaper' and 'Paper 348 / Macro detail paper', both in Textures > Paper
   - download the large size
   - Values: `textures` 2 (faded newspaper, macro stock paper); `sites` texturelabs.org, Texture Fabrik; `download size` large 4240x3034 jpg (small 960x687, med 1920x1374 offered); `licence` 'Free for commercial use' shown on Texturelabs
   - Why: deliberate choice beats one default overlay
   - Build: curate per-scene scans in the asset manifest at >=4K source size; never one global overlay
   - Source: reel `DL24UePpHWN` 0:06-0:18
2. **Texture stack: Overlay and Pin Light layers over Normal artwork** — The texture layers sit on top of the artwork with blend modes; the timeline shows two layers in Overlay and two in Pin Light above Normal layers.
   - stack the texture layers on top of the title-card layers
   - set two to Overlay and two to Pin Light; the art below stays Normal
   - no track mattes used (all No Matte)
   - Values: `blend modes` Overlay x2, Pin Light x2, rest Normal; `track matte` No Matte on all; `opacity values seen` 97.4%, 100%; `texture scale` ~2536.6% (one layer, scaled up to fill); `parent column` 4 layers show '11. TEXTURE' (likely parent/link; unclear)
   - Why: blend modes integrate the grain into the art instead of a flat veil
   - Build: canvas globalCompositeOperation 'overlay' for two texture passes and a pin-light shader (or 'hard-light' approximation) for two more
   - Source: reel `DL24UePpHWN` 0:17-0:23
3. **Set texture strength with Curves on the texture layer** — Apply a Curves effect to the texture layer itself and move its luminance levels to set strength.
   - Effect > Curves on the texture layer
   - Channel: RGB
   - bend the curve to shift luminance until the strength feels right
   - Values: `effect` Curves; `channel` RGB; `curve points` not readable
   - Why: keeps colours clean and the texture integrated
   - Build: pre-grade the texture with a luminance LUT (ImageData) or CSS filter brightness/contrast before compositing
   - Source: reel `DL24UePpHWN` 0:26-0:34
4. **Never solid colours: map everything to a texture** — Almost no flat fills; shape layers carry a texture instead of a flat colour.
   - shape layer with no stroke
   - colour area filled through a texture
   - Values: `solid colour` almost never; `stroke` 0 px
   - Why: avoids the sterile digital look
   - Build: fill shapes with a texture pattern (or multiply a scan over the fill) instead of a flat fillStyle
   - Source: reel `DLQ4Wp9pqv3` 0:17-0:21
5. **Type sits on a paper scan in Multiply** — The typography comp has a Texturelabs paper scan under the text with a Multiply layer, so letters print onto paper.
   - Texturelabs_Paper_300XL as background
   - a layer in Multiply over it
   - Values: `texture` Texturelabs_Paper_300XL; `blend` Multiply (one layer)
   - Why: type never sits on a flat fill
   - Build: text drawn over a paper scan with multiply
   - Source: reel `DLTLw1DpgwE` 0:04-0:07
6. **Bake one cardboard texture over everything, in Overlay** — Finish with a single Texturelabs cardboard texture over the whole comp, blend mode Overlay, so the layers read as one printed object.
   - download a cardboard scan from Texturelabs
   - place on top of the comp
   - blend mode Overlay
   - Values: `blend` Overlay; `source` Texturelabs (file ..._148L.jpg)
   - Why: unifies disparate layers
   - Build: final-pass cardboard scan, globalCompositeOperation 'overlay'
   - Source: reel `DMtlFlxJ6sg` 0:30-0:34
7. **Texture stacking: one High, one Mid, one Low** — Treat textures as frequency bands, one per band so they build instead of fighting. High: noise (fine sharp detail). Mid: halftone (medium density and scale, structure). Low: animated light refractions (broad soft distortion under everything).
   - High channel: noise, film grain, paper fibres
   - Mid channel: halftone pattern, grit, scratches, print textures
   - Low channel: light leaks, animated refractions, blur maps, vignettes
   - Values: `bands` 3; `per band` 1; `demo` High = noise, Mid = halftone pattern, Low = light refractions
   - Why: each lane has its own scale, so layers complement
   - Build: three overlay layers: fine grain noise, halftone dot pattern, animated blurry refraction/light-leak gradients
   - Source: reel `DNuJS_oWoxM` 0:11-0:26
8. **Hide low-quality assets with high-quality texture** — Step 2: a halftone or fine grain disguises low-res images and gives a printed feel; his example is a 540x300 image under a 5260x4000 texture.
   - keep the weak photo
   - put a high-resolution halftone/grain texture over it
   - Values: `image` 540x300; `texture` 5260x4000
   - Why: the texture's detail replaces the image's missing detail
   - Build: low-res archival photos always rendered through a halftone pass at output resolution
   - Source: reel `DQpMiV_Cdpr` 0:21-0:29
9. **Halftone via luma matte, then Levels on the halftone** — Use a halftone scan (Texturelabs Grunge 340, 'vintage halftone') as the luma matte of the photo, then tweak Levels on the halftone until it feels right.
   - texturelabs.org grunge_340 (vintage halftone, free for commercial use)
   - halftone layer above the photo, scaled up (440%)
   - photo Track Matte = halftone, Luma Matte
   - Levels on the halftone: Input White ~64%
   - Values: `texture` Texturelabs Grunge 340; `halftone scale` 440%; `photo scale` 202.6%; `track matte` Luma Matte; `Levels (halftone)` Input Black 0, Input White 20971.5 (~64%), Gamma 1.00, Output 0-32768
   - Why: the photo prints only through the dots
   - Build: photo alpha = luminance of a halftone scan (levels-adjusted), then composite on paper
   - Source: reel `DQpMiV_Cdpr` 0:29-0:36
10. **Pencil look: Roughen Edges** — For graphite, stack Roughen Edges after the displace; its Edge Type list offers Roughen, Roughen Color, Cut, Spiky, Rusty, Rusty Color, Photocopy, Photocopy Color.
   - Effect > Stylize > Roughen Edges after Turbulent Displace
   - Edge Type Roughen for pencil
   - Values: `Edge Type options` Roughen, Roughen Color, Cut, Spiky, Rusty, Rusty Color, Photocopy, Photocopy Color; `values` not stated for pencil
   - Why: mimics graphite
   - Build: noise-displaced, slightly eroded stroke edge
   - Source: reel `DT2_SIMgBfI` 0:24-0:28
11. **Pen-ink look: Roughen Edges Photocopy, adjust Border** — For ink, set Edge Type to Photocopy and raise Border until it feels right (he moves it from 12.2 to 15.9).
   - Roughen Edges Edge Type: Photocopy
   - Border ~12-16
   - Edge Sharpness 1, Fractal Influence 1, Scale 100, Complexity 2
   - Values: `Edge Type` Photocopy; `Border` 12.20 -> 15.90; `Edge Sharpness` 1.00; `Fractal Influence` 1.00; `Scale` 100.0; `Stretch Width or Height` 0.00; `Offset` 0.0,0.0; `Complexity` 2; `Evolution` 0x+0.0°
   - Why: mimics ink
   - Build: threshold of a noise-modulated stroke edge (ink bleed), border ~15px
   - Source: reel `DT2_SIMgBfI` 0:28-0:34
12. **Unsharp Mask on top: blur vs sharpen tug of war** *(shared)* — Stack Unsharp Mask directly above the blur; the blur softens edges while the mask pulls sharpness back, adding scan-like artefacting.
   - Unsharp Mask directly below Gaussian Blur in the effect stack (applied after it)
   - Radius ~5
   - Amount dialled up to taste
   - Threshold 0
   - Values: `Radius` 5.400; `Amount` dialled 0 -> 24.4 -> 35.3 -> 57.6 in demo; `Threshold` 0.00; `order` Gaussian Blur then Unsharp Mask
   - Why: reintroduces artefacting digital tools normally lack
   - Build: blur then unsharp-mask convolution (ffmpeg gblur then unsharp=lx=11:ly=11:la=0.5, or a shader)
   - Source: reel `DUEIdzuCUgn` 0:16-0:33
13. **Halftone logic: dark bigger/denser, light smaller/sparser** — Halftones come from old screen printing: presses cannot print shades of black, so tone becomes dot size and spacing.
   - dark = bigger, denser dots
   - light = smaller, spaced-out dots
   - Why: presses cannot print grey shades
   - Build: canvas/shader halftone: dot radius = f(luminance) on a grid
   - Source: reel `DUJWPrqCYGX` 0:14-0:26
14. **Source the halftone from a texture library** *(shared)* — Grab a halftone texture rather than generating it; he searches 'halftone' on Texture Labs and uses a grunge halftone plate.
   - search 'halftone' on TEXTURELABS.ORG (results: tiny halftone overlay, colour halftone overlay, grunge halftones)
   - import the plate as a layer named Halftone (file Texturelabs_Grunge_265M.jpg)
   - Values: `source` Texture Labs; `file` Texturelabs_Grunge_265M.jpg
   - Why: scanned plates carry real print irregularity
   - Build: keep a halftone plate set in the engine's texture library; select per film
   - Source: reel `DUJWPrqCYGX` 0:28-0:30
15. **Study a real overprint: misregistered ink, grain, limited palette** — Zoom into a real overprint design: misaligned ink layers, grainy prints and a very limited palette are what give printed character.
   - zoom into the reference print
   - list the imperfections
   - Values: `imperfections` misregistration, grainy prints, limited palette
   - Why: imperfections give printed character
   - Source: reel `DVd9Ls2gHWM` 0:06-0:16
16. **Finish with a dusty texture layer** *(shared)* — Add a little texture over the tinted background: a dark dust-and-scratch grunge plate.
   - texture plate over the background precomp
   - Why: gives the background a printed, physical surface
   - Build: dust/scratch plate composited (screen/overlay) at low opacity
   - Source: reel `DY7TSLJAQef` 0:38-0:42
17. **A separate shadow layer under the turning page** *(shared)* — The comp carries a 'Shadow Pattern' layer between the page and the background, so the turning page casts a shadow on what is below.
   - shadow layer below the page layer, above Background
   - Values: `layer` Shadow Pattern; `opacity` ~89.8 (value next to it, label not readable)
   - Why: a cast shadow anchors the paper in physical space
   - Build: soft shadow polygon following the fold line, multiplied over the page below
   - Source: reel `Dafr0KjAkve` 0:21-0:29
18. **White-background texture: darken modes; black-background: lighten modes** — Group AE's blend menu into families: a texture on white uses the darken group (it drops the white, keeps dark detail); a texture on black uses the lighten group (drops black, keeps bright detail).
   - white-bg scan (demo: NYT page) -> Darken group
   - black-bg texture (demo: 1952 Popular Mechanics cover) -> Lighten group
   - Values: `darken group` Darken, Multiply, Color Burn, Classic Color Burn, Linear Burn, Darker Color; `lighten group` Add, Lighten, Screen, Color Dodge, Classic Color Dodge, Linear Dodge, Lighter Color
   - Why: the neutral background drops out so only the detail remains
   - Build: canvas globalCompositeOperation multiply/darken for white-bg scans, screen/lighten for black-bg dust
   - Source: reel `DbBSCjjgbTw` 0:08-0:21
19. **Normalise a texture before contrast modes (Overlay, Soft Light)** — Contrast-group modes need normalisation first: desaturate the texture (Lumetri Saturation down), add Levels and drag the gamma (middle grey) handle to the histogram's peak, so the texture centres on 50% grey and stops shifting the colours underneath.
   - contrast group: Overlay, Soft Light, Hard Light, Linear Light, Vivid Light, Pin Light, Hard Mix
   - Lumetri Color on the texture: Saturation down (100 -> 83 seen, toward 0)
   - Color Correction > Levels
   - drag the middle grey (Gamma) under the histogram peak
   - on-screen meter goes 6% -> 41% -> 50%
   - Values: `target mean` 50% grey; `Lumetri Saturation` 100 -> 83.0 (seen mid-drag); `blend modes` Overlay / Soft Light (contrast group)
   - Why: overlay-family modes shift colours unless the texture averages 50% grey
   - Build: preprocess textures offline: grayscale, then gamma so the histogram peak sits at 128, before overlay/soft-light
   - Source: reel `DbBSCjjgbTw` 0:21-0:41
20. **Stack a second Levels to tune strength** — To make the texture stronger, stack a second Levels (Levels 2) and dial its gamma to taste instead of guessing with opacity.
   - add Levels 2 below the first
   - pull Gamma down from 1.0
   - Values: `Levels 2 Gamma` 1.0 -> 0.9 -> 0.7; `Output Black` 0.0
   - Why: controls texture intensity after normalisation
   - Build: apply gamma (e.g. 0.7) to the normalised texture as an intensity parameter
   - Source: reel `DbBSCjjgbTw` 0:43-0:49
21. **High Pass in Photoshop isolates print detail from a scan** *(shared)* — Scan the magazine page, then run Photoshop's High Pass filter: it isolates and lifts the fine print detail and drops the rest of the design.
   - scan the page
   - Photoshop: Filter > Other > High Pass
   - result is a mid-grey plate with only the print detail
   - Why: keeps grain/ink detail and drops the underlying design
   - Build: offline: gray minus gaussian-blur + 128 = high-pass texture
   - Source: reel `DbJSUGZpvzL` 0:13-0:22
22. **High-pass plate in Overlay, strength via Levels Input White** — In After Effects set the high-pass layer to Overlay and add Levels to dial how strongly the details show, by pulling Input White down.
   - layer mode Overlay
   - Color Correction > Levels on the texture
   - lower Input White
   - Values: `blend` Overlay; `Levels Input Black` 0.0; `Levels Input White` 32511.0 -> 30069.5 -> 29684.0 (16-bpc scale, ~99% -> ~91%)
   - Why: a mid-grey high-pass plate under Overlay only adds detail; Levels sets its contrast
   - Build: canvas overlay blend of the high-pass plate; strength = contrast around 128
   - Source: reel `DbJSUGZpvzL` 0:22-0:27
23. **Texture variance per layer: grain, halftone, blur + Noise HLS** — Give different layers different texture (paper grain, halftones, or a stack of a little blur and noise) so they do not look uniformly digital.
   - paper grain on some layers
   - halftone on others
   - on others: Noise HLS (Grain) then Gaussian Blur
   - Values: `Noise HLS Noise` Grain; `Hue` 0.0%; `Lightness` 53.0%; `Saturation` 0.0%; `Grain Size` 1.00; `Noise Phase` 0x+0.0°; `Gaussian Blur` dragged 0 -> 3.6 -> 8.7 -> 12.2 (final not stated); `Repeat Edge Pixels` on
   - Why: texture variance sells the layering
   - Build: per-layer filter preset: lightness noise ~0.5 at grain size 1 + blur of a few px; another preset with halftone
   - Source: reel `Dc1ShYsplyF` 0:40-0:49
24. **Tile textures: Photoshop Pattern Fill, AE CC RepeTile** — Tile instead of scaling down: in Photoshop a Pattern fill layer with lower Scale; in After Effects CC RepeTile with Expand values. Seamless textures are ideal, but seams are usually tolerable in an overlay.
   - Photoshop: Layer > New Fill Layer > Pattern, Scale 100 -> 45%
   - After Effects: Stylize > CC RepeTile, raise Expand Right/Left/Down/Up, Tiling Unfold
   - Values: `Pattern Fill Scale` 100% -> 45%; `CC RepeTile Expand` 632, 682, 1056, 595 (Right/Left/Down/Up); `Tiling` Unfold; `Blend Borders` 0.0%
   - Why: keeps the grain at a small scale while covering the whole frame; Unfold mirrors tiles to hide seams
   - Build: canvas createPattern with a mirrored (unfold) tile at the chosen scale
   - Source: reel `DcBhNhOg5kR` 0:18-0:28
25. **Quarter trick to judge texture scale** — Drop a photo of a quarter onto the design; you know how big a quarter feels, so scale texture and design until the details look believable next to it, then remove it.
   - add a quarter layer (scaled ~32%)
   - scale texture/design until it matches (demo 154% -> 134% -> 114% -> 101%)
   - delete the quarter
   - Values: `reference object` US quarter (~24 mm); `quarter layer scale` ~32.0%; `texture scale` 154% -> 101%
   - Why: gives the eye a real-world scale reference
   - Build: define px-per-mm for the frame and size grain/fibres in mm; preview with a coin overlay
   - Source: reel `DcBhNhOg5kR` 0:28-0:45
26. **Shadow overlay beats dust overlay for depth** — He tried dust overlays first, then a window-light shadow overlay (light and shadow silhouette on a white wall) and kept the shadow: it adds more depth to a still photo.
   - preview dust overlays over the photo
   - preview shadow overlays over the photo
   - keep the one that adds depth
   - Values: `asset` light-and-shadow window silhouette on a white wall, 7000x4667 JPEG
   - Why: cast light and shadow add depth to a still more than dust does
   - Build: window-shadow plate over the photo in multiply
   - Source: reel `DdKZ5oBpPCW` 0:13-0:34

## Colour and grade

1. **Chromatic aberration over everything** *(shared)* — A subtle chromatic aberration across the whole frame goes unnoticed but unifies the look; he uses the free plugin Quick Chromatic Aberration 3 on a top adjustment layer.
   - top adjustment layer ('Vox Sauce')
   - apply Quick Chromatic Aberration 3 (free plugin)
   - Values: `plugin` Quick Chromatic Aberration 3 [free]; `amount` not stated in this reel (3 px in DLQw7mqJzRp)
   - Why: the frame reads as one lens
   - Build: final pass: offset R and B channels 1-3px (ImageData split) or ffmpeg rgbashift
   - Source: reel `DLQ4Wp9pqv3` 0:03-0:08
2. **Footage homogenization** — Clips from different cameras, eras or quality (e.g. a 240p clip) keep their story value but never go in raw; layer consistent effects across every clip.
   - keep the shot if it serves the story
   - layer the same effects over every clip
   - Values: `quality example` ~240p clip label on screen (OCR '244p')
   - Why: cohesion across mismatched sources
   - Build: shared final-pass stack on all clips
   - Source: reel `DMOpmHxpAOA` 0:03-0:13
3. **Soft glow over the lot** — A soft glow across everything makes sunlight appear to refract into the birds and text.
   - glow adjustment over whole comp
   - Why: ties elements into the same light
   - Build: blur+screen bloom pass on the final frame
   - Source: reel `DMtlFlxJ6sg` caption
4. **Build a colour system by colour-picking strong references** — Step 1: a colour system, picked with the eyedropper from a few strong references rather than from theory.
   - collect ~3 strong references
   - eyedrop the palette from them
   - Values: `references` a few (3 shown)
   - Why: fast and already proven to work together
   - Build: palette extraction from reference images (k-means), stored as film tokens
   - Source: reel `DQpMiV_Cdpr` 0:06-0:12
5. **Tint: whites to one colour, blacks to another, Amount ~60%** — Make photos fit the system with Tint, mapping whites to one palette colour and blacks to another, then dial Amount to Tint back for subtlety (he lands near 60%).
   - Effect > Color Correction > Tint
   - Map White To = palette light
   - Map Black To = palette dark
   - Amount to Tint from 100% down to ~59-62%
   - Values: `Amount to Tint` ~62% (scrubbed 100% -> 59% -> 62%); `colours` not readable
   - Why: all photos share the palette
   - Build: duotone gradient map mixed back with the original at ~0.6
   - Source: reel `DQpMiV_Cdpr` 0:12-0:21
6. **Levels on the photo before the tint: lifted blacks, strong gamma** — The photo also carries Levels (16-bit units): Input Black 6296.6, Input White 32768, Gamma 3.52, Output Black 3855.1, Output White 32768, i.e. crushed input, very bright mids and lifted output blacks.
   - Levels on the photo layer
   - Input Black ~19%, Gamma 3.52, Output Black ~12%
   - Values: `Input Black` 6296.6 (~19% of 32768); `Input White` 32768.0; `Gamma` 3.52; `Output Black` 3855.1 (~12%); `Output White` 32768.0
   - Why: faded, printed-looking photo with no true black
   - Build: levels LUT on photos: in-black 0.19, gamma 3.5, out-black 0.12
   - Source: reel `DQpMiV_Cdpr` 0:17-0:20
7. **Trippy overlays: stack comps, top set to Difference** *(shared)* — Stack compositions and set the top one to Difference: even simple animation gets a reactive look.
   - stack two comps
   - top blend mode Difference
   - Values: `blend` Difference
   - Why: reactive look with no complex animation
   - Build: globalCompositeOperation='difference'
   - Source: reel `DR0HIWTiTkJ` 0:24-0:33
8. **Art in black, white and 50% gray, then Tritone** — Keep artwork in black, white and 50% gray, then a Tritone on an adjustment layer maps Shadows, Midtones and Highlights to the palette in one pass; mask and invert for extra stylisation.
   - artwork only in #000, 50% gray, #FFF
   - adjustment layer 'Color Adjustment' with Effect > Color Correction > Tritone
   - set Highlights / Midtones / Shadows to the palette
   - Blend With Original 0%
   - mask and invert parts for variety
   - Values: `gray` 50%; `Blend With Original` 0.0%; `palette colours` not readable
   - Why: one-step recolour of the whole piece
   - Build: three-stop gradient map (shadow/mid/highlight) on a 3-value artwork
   - Source: reel `DR0HIWTiTkJ` 0:33-0:45
9. **Risograph: one ink per pass, limited colours** — The look comes from the Risograph, popular in the 80s and 90s, which prints separate colour passes one ink at a time.
   - restrict to a few ink colours
   - think in separate passes
   - Values: `era` 80s-90s
   - Why: the printing limitation defines the style
   - Build: palette of 2-3 inks, one layer per ink
   - Source: reel `DVd9Ls2gHWM` 0:16-0:24
10. **Riso overprint: two ink comps, Tint, both Multiply** *(shared)* — Split the animation into two comps (Ink 1, Ink 2), tint each to a different ink colour with Tint (Map Black To), and set both to Multiply.
   - two precomps Ink 1 and Ink 2
   - Tint effect: Map Black To = ink colour
   - both layers blend mode Multiply
   - Values: `Ink 1 Map Black To` #E6CE1B / #E7CF1B (H 53, S 88%, B 90%) yellow; `Ink 2 Map Black To` #286241 (H 146, S 59%, B 38%) green; `blend` Multiply; `inks` 2
   - Why: multiply overlap reproduces the overprint blend
   - Build: render each ink layer as a mask, tint to the ink colour, composite with multiply on paper
   - Source: reel `DVd9Ls2gHWM` 0:26-0:34
11. **Pre-comp, then Tint to a dim low-contrast grey** — Pre-compose the background images, add Color Correction > Tint on top, map black to a dark grey instead of pure black and white to only a slightly brighter grey, so the background is dim and low contrast.
   - select the images > Pre-compose
   - Effects & Presets search 'Tint' > Color Correction > Tint
   - Map Black To: dark grey, not pure black
   - Map White To: a slightly brighter grey (picker cursor stays near the dark corner)
   - Values: `effect` Tint; `Map Black To` dark grey (exact value not readable); `Map White To` slightly brighter grey, still dark (exact value not readable); `result` dim, low-contrast grey background
   - Why: keeps the background from competing with the main content
   - Build: canvas: draw images, grayscale + levels remap black->~#1e1e1e, white->~#555 (values to tune), then grain
   - Source: reel `DY7TSLJAQef` 0:30-0:38
12. **Phosphor colour cast via Hue/Saturation Colorize** — The 'white balance shift' is done with Hue/Saturation in Colorize mode at low saturation, giving the phosphor cast of vintage TVs.
   - Effects > Color Correction > Hue/Saturation
   - tick Colorize
   - set Colorize Hue, low Saturation, Lightness 0
   - Values: `Colorize Hue` 0x+39.0° -> 0x+79.0° (demo); `Colorize Saturation` 25; `Colorize Lightness` 0
   - Why: vintage TVs had a distinct phosphor cast that dates the image
   - Build: monochrome tint: luminance mapped into hue ~40-80°, saturation 0.25
   - Source: reel `DaQeqljgc7y` 0:30-0:38
13. **Print misregistration via a touch of chromatic aberration on type only** *(shared)* — Recreate the magazine's slight colour misregistration with a little chromatic aberration on the text and graphic elements, not the whole frame.
   - Quick Chromatic Aberration (third-party plugin) on the text/graphics layer
   - Channels: Red & Blue
   - small offset
   - Values: `effect` Quick Chromatic Aberration; `Channels` Red & Blue; `Hue Shift` 0x+0.0°; `offset/amount` ~0.50 (label not readable); `Anchor` Absolute Point 540.0,960.0
   - Why: tiny imperfections are what make it feel real
   - Build: draw R and B channels of the type layer offset by ~1 px in opposite directions (screen/lighter)
   - Source: reel `DbJSUGZpvzL` 0:27-0:36
14. **Tint paper and push the white to a warm off-white** — On paper layers add Tint and drag Map White To from pure white to a slightly warm off-white; subtle, but it adds depth when several paper layers stack.
   - Effects > Color Correction > Tint on each paper layer
   - Map White To: drag from #FFFFFF down to a warm off-white
   - vary slightly per layer
   - Values: `Map White To` #FFFFFF -> #F7F7EF -> #EFEFE4 -> #E8E8DC -> #E5E5D8 (final ~H 60°, S 6%, B 90%)
   - Why: adds depth across multiple paper layers
   - Build: map paper white to ~#E5E5D8 (warm yellow-grey, 10% darker) with small per-layer variance
   - Source: reel `Dc1ShYsplyF` 0:18-0:26

## Film and screen treatments

1. **Scan lines layer** — Layer one is a scan-line image on top of the screen recording, blend Overlay or Color Dodge, opacity about half.
   - find a scan-lines texture (he image-searches 'tv scan lines')
   - place over the recording
   - blend mode Overlay or Color Dodge
   - scrub opacity to taste
   - Values: `blend mode` Overlay or Color Dodge; `opacity` ~50% (scrubbed 46-54%)
   - Why: makes the capture feel like a real display
   - Build: repeating 2-4px horizontal line pattern, globalCompositeOperation overlay or color-dodge, alpha ~0.5
   - Source: reel `DLQw7mqJzRp` 0:03-0:10
2. **Chromatic aberration heavier on screen captures: 3** *(shared)* — On screen recordings he pushes chromatic aberration past his usual amount; Quick Chromatic Aberration 3 on an adjustment layer with offset 3.
   - adjustment layer over the recording
   - Quick Chromatic Aberration 3: Channels Red & Blue
   - Position (offset) typed as 3
   - Hue Shift 0, Rotation 0, Scale 100%, Anchor Mode Absolute Point
   - Repeat Edge Pixels on, Mix With Original 0%
   - Values: `Channels` Red & Blue; `Position` 3; `Hue Shift` 0x+0.0°; `Rotation` 0x+0.0°; `Scale` 100.00%; `Anchor Mode` Absolute Point; `Anchor` 536.3,962.0; `Repeat Edge Pixels` on; `Mix With Original` 0.00%
   - Why: sells the glass of a screen
   - Build: split R and B, offset +/-3px from a centre anchor (radial), repeat edges
   - Source: reel `DLQw7mqJzRp` 0:08-0:13
3. **Old-cinema imperfection: gate weave and exposure flicker** *(shared)* — Early film carried mechanical jitter (gate weave) and brightness shifts in every frame; emulating both breaks the clinical crispness of digital.
   - position jitter (gate weave)
   - exposure flicker
   - a little grain
   - Values: `named on screen` GATE WEAVE & EXPOSURE FLICKER; `contrast label` DIGITAL FEELS CLINICAL
   - Why: cuts through clinical digital crispness and makes static compositions feel alive
   - Build: final pass: per-frame translate jitter, brightness flicker, grain
   - Source: reel `DLX9PJ_pwBA` 0:00-0:13
4. **Add Grain settings** — Finish with Add Grain at low intensity.
   - Effects & Presets: Add Grain
   - Viewing Mode: Final Output
   - Preset: None
   - Tweaking: Intensity 0.2, Size 1.0, Softness 1.0, Aspect 1.0
   - Values: `Intensity` 0.200; `Size` 1.000; `Softness` 1.000; `Aspect Ratio` 1.000; `Viewing Mode` Final Output
   - Why: adds life without being noticed
   - Build: per-frame noise overlay at ~0.2 intensity (soft-light, fresh seed each frame)
   - Source: reel `DLX9PJ_pwBA` 0:21-0:23
5. **Handycam footage for nostalgia** — Home-video footage from a consumer handycam (Sony, Carl Zeiss Vario-Tessar, optical 12x shown) reads as personal memory.
   - use or emulate consumer handycam footage
   - Values: `camera shown` Sony handycam, Carl Zeiss Vario-Tessar lens, optical 12x
   - Why: nostalgia comes from the camera of the era
   - Build: handycam treatment: low res, soft focus, interlace/colour bleed, date-stamp optional
   - Source: reel `DMDyGp6Jwwx` 0:00-0:13
6. **Recipe: film grain, blur map, chromatic aberration** *(shared)* — His example blend is 1 film grain, 2 a blur map (soft edges, sharp centre), 3 a bit of chromatic aberration.
   - 1. film grain
   - 2. blur map: edges and top soft, centre sharp
   - 3. a little chromatic aberration
   - Values: `order` film grain, blur map, chromatic aberration
   - Why: the same texture on every clip hides their differences
   - Build: same grain + radial edge blur + rgb split pass per clip
   - Source: reel `DMOpmHxpAOA` 0:13-0:23
7. **Breathing Glow: settings and wiggle on Intensity** *(shared)* — Adjustment layer with Glow; Option-click the Glow Intensity stopwatch and add wiggle(1.5,.2) so the glow breathes.
   - Layer > New > Adjustment Layer
   - Effect: Glow (Glow Based On Color Channels)
   - Threshold 60%, Radius 42, Intensity 0.2
   - Composite Original Behind, Operation Add, Glow Colors Original Colors
   - Option-click Intensity stopwatch: wiggle(1.5,.2)
   - Values: `Glow Based On` Color Channels; `Glow Threshold` 60.0%; `Glow Radius` 42.0; `Glow Intensity` 0.2 base (reads 0.4 under the expression); `Composite Original` Behind; `Glow Operation` Add; `Glow Colors` Original Colors; `Color Looping` Triangle A>B>A; `Color Loops` 1.0; `A & B Midpoint` 50%; `Glow Dimensions` Horizontal and Vertical; `expression` wiggle(1.5,.2); `comp fps` 24
   - Why: subtle shifts of glow add energy
   - Build: bright-pass (>60% luma), blur r=42, add back with gain 0.2 + smooth noise +/-0.2 at 1.5 Hz
   - Source: reel `DMWEwQRp6aD` 0:05-0:13
8. **Retro screen: Venetian Blinds + Quick Chromatic Aberration 3 + CC Lens** *(shared)* — On one adjustment layer: Venetian Blinds (Transitions) makes thin scan lines, Quick Chromatic Aberration 3 adds fringe, CC Lens (Distort) adds a subtle CRT bulge.
   - Effect > Transition > Venetian Blinds for thin lines
   - Quick Chromatic Aberration 3 (free plugin)
   - Effect > Distort > CC Lens, small size for a subtle bulge
   - Values: `Venetian Blinds values` not shown; `CC Lens values` not shown; `bulge` subtle
   - Why: curved CRT-like glass with colour fringe
   - Build: shader: repeating line mask, RGB channel offset, barrel distortion
   - Source: reel `DNmGyQupPlQ` 0:06-0:11
9. **Flat laptop pixel grid: remove bulge, duplicate the blinds** *(shared)* — For a flat modern screen drop CC Lens and duplicate Venetian Blinds so two passes form a grid; the laptop frame is a MacBook Pro PNG.
   - remove CC Lens
   - duplicate Venetian Blinds (second pass at another direction for a grid)
   - place inside a laptop PNG frame
   - Values: `second blinds direction` not stated (grid implies ~90°); `frame asset` MacBook Pro PNG (Pngtree)
   - Why: a flat panel has a pixel grid, not curvature
   - Build: two perpendicular repeating-linear-gradient masks
   - Source: reel `DNmGyQupPlQ` 0:11-0:16
10. **Gate Weave: frame-by-frame jitter from old printers** *(shared)* — Gate weave is a frame-by-frame jitter of the whole picture caused by mechanical drift in old film printers.
   - jitter the whole composite (not single pieces) once per frame
   - keep it small so it reads subconsciously
   - Values: `rate` per frame
   - Why: recreates analog nostalgia and fights the computerised look of modern animation
   - Build: per-frame seeded random x/y (and tiny rotation) offset applied to the final composited frame
   - Source: reel `DTJJq9JiXxj` 0:10-0:16
11. **Exposure Flicker from light inconsistency in film printing** *(shared)* — Exposure flicker is a slight brightness variation from inconsistent light during film printing; the Stranger Things intro adds it on purpose.
   - vary overall exposure slightly frame to frame
   - apply over the whole frame, together with gate weave
   - Why: imperfect printing light; the pair fights the computerised look
   - Build: per-frame seeded brightness multiplier (CSS filter brightness / shader gain) on the final frame
   - Source: reel `DTJJq9JiXxj` 0:16-0:25
12. **Capture real irregularities on a 50% grey screen** — Film the real CRT showing a 50% grey background to capture its irregularities, then use that recording as an overlay.
   - display 50% grey full-screen on the TV
   - film the screen
   - use the recording as the overlay plate
   - Values: `background` 50% grey; `blend` Overlay
   - Why: 50% grey is neutral under Overlay, so only the screen's irregularities show
   - Build: real/scanned CRT grey plate composited with overlay blend (ffmpeg blend=all_mode=overlay or canvas globalCompositeOperation='overlay')
   - Source: reel `DTOKw4vieGq` 0:15-0:22
13. **CRT emulation stack: downsample, exposure flicker, scan behaviour, grey plate in Overlay** *(shared)* — Rebuild the screen digitally from three behaviours, then put the 50% grey recording on top in Overlay blend mode.
   - downsample the footage
   - add exposure flicker
   - add scan behaviour
   - grey recording layer blend mode = Overlay (picked from the AE mode menu)
   - Values: `effects` Downsampling, Exposure Flicker, Scan Behavior; `grey plate blend` Overlay
   - Why: makes low-quality footage read as a real screen
   - Build: canvas: draw at low res and upscale, per-frame brightness jitter, scanline pattern, overlay plate
   - Source: reel `DTOKw4vieGq` 0:20-0:29
14. **Use the CRT pass to blend archival footage** — The screen pass unifies archival footage of different quality and adds a layer of interest to documentary projects.
   - apply the same screen pass over archival clips
   - Why: hides quality mismatch between sources
   - Build: shared post-pass over archival shots in the timeline
   - Source: reel `DTOKw4vieGq` 0:29-0:34
15. **Analog finish: two Glows on an adjustment layer** *(shared)* — Stack two Glow effects on an adjustment layer above the visualizers.
   - adjustment layer on top
   - Glow + Glow 2
   - Values: `Glow Based On` Color Channels; `Glow Threshold` 60.0%; `Glow Radius` 20.0; `Glow Intensity` 0.6; `Composite Original` Behind; `Glow Operation` Add; `Glow Colors` Original Colors; `Color Looping` Triangle A>B>A; `A&B Midpoint` 50%; `Glow Dimensions` Horizontal and Vertical; `Glow 2 values` not shown
   - Why: double glow softens the digital line into a lit screen
   - Build: threshold at 60% luminance, blur r=20, add at 0.6 over original; twice
   - Source: reel `DVRV9hiCX4F` 0:28-0:31
16. **Film dust plate from Texture Labs** — Overlay a subtle film-print dust plate (Texture Labs Grunge 353, 'Film print dust', free for commercial use) so the photo feels like a film scan.
   - download the dust plate
   - layer it over the photo, subtle
   - Values: `source` Texture Labs Grunge 353 'Film print dust'; `licence` free for commercial use
   - Why: film scan feel
   - Build: dust plate overlay (screen) at low opacity
   - Source: reel `DZFqNzwAqVa` 0:09-0:12
17. **Gate weave and flicker explained** — On film each frame never landed in exactly the same place in the camera; that weave plus a little flicker became the look of old footage and documentaries.
   - recognise weave (position) and flicker (exposure) as two separate channels
   - Why: analog signature viewers associate with documentaries
   - Source: reel `Da3YpRipHuF` 0:12-0:23
18. **Scan lines: Venetian Blinds + Solid Composite on an adjustment layer** *(shared)* — On an adjustment layer add Transition > Venetian Blinds to cut horizontal scan lines, then Channel > Solid Composite so the gaps show black instead of transparency.
   - adjustment layer over the footage
   - Venetian Blinds: raise Transition Completion a little, Direction 0 (horizontal lines), Width 20
   - Solid Composite (black) below it in the stack
   - Values: `Transition Completion` 0% -> 13%; `Direction` 0x+0.0°; `Width` 20; `Feather` 0.0; `Solid Composite colour` black (values not shown)
   - Why: recreates the line structure of an old TV
   - Build: repeating horizontal stripe mask (period 20 px, ~13% dark) over footage on black
   - Source: reel `DaQeqljgc7y` 0:16-0:23
19. **Frame footage inside an old TV** — Placing footage inside a period TV frame makes the edit feel intentional and pulls the viewer into the story.
   - use a vintage TV frame with a cut-out (transparent) screen
   - footage sits behind the bezel
   - Why: framing makes the edit feel intentional
   - Build: PNG TV bezel with transparent screen, footage clipped to the screen rect
   - Source: reel `Dcm63HBAHzT` 0:06-0:15
20. **Pick the TV frame by era: transparent, isolated, previewed over the edit** *(shared)* — Choose the frame by the project's time period; filter the search to transparent, isolated assets without people, and preview several directly over the edit before committing.
   - search 'vintage TV frame'
   - filters: Background Transparent, Isolated assets, Exclude people, Exclude GenAI content
   - drop 2-3 candidates over the edit and compare
   - Values: `filters` Transparent background, Isolated assets, Exclude people, Exclude GenAI content; `asset` 'vintage old TV cut out screen' (transparent PNG)
   - Why: every project has a different period; testing in context beats guessing
   - Build: keep a library of era-tagged TV bezels with screen rects; choose per film
   - Source: reel `Dcm63HBAHzT` 0:15-0:30
21. **Subtle RGB Split and a VHS screen texture finish the TV** *(shared)* — After framing, add a subtle RGB Split effect on the footage and a transparent VHS screen-texture layer over it to complete the look.
   - Video Effects > RGB Split on the footage, subtle
   - screen texture image ('screen texture vhs', transparent) above the footage, under the bezel
   - Values: `effect` RGB Split (amount not stated); `texture` transparent VHS screen texture
   - Why: completes the screen treatment
   - Build: channel offset 1-2 px plus scanline/noise overlay clipped to the screen rect
   - Source: reel `Dcm63HBAHzT` 0:36-0:40

## Cut-out and collage

1. **Three clear depth planes, tinted per layer with Tint** — Lay out foreground, midground, background clearly, then apply Tint to each layer to map it into the brand palette (e.g. Map Black To a deep blue #00609C).
   - scene split into FG/MG/BG
   - Effect > Color Correction > Tint per layer
   - Map Black To brand dark (#00609C shown), Map White To brand light
   - Amount to Tint 100%
   - Values: `effect` Tint; `Map Black To` #00609C (H203 S100 B61; RGB 0,96,156); `Map White To` not readable; `Amount to Tint` 100.0%
   - Why: layers read as separate planes and share one palette
   - Build: per-plane duotone: luminance mapped between two palette colours (canvas LUT or SVG feComponentTransfer)
   - Source: reel `DMtlFlxJ6sg` 0:15-0:23
2. **Birds as thresholded silhouettes** — Take stock footage, push Threshold until only silhouettes remain, add a touch of blur to blend.
   - stock bird footage
   - Threshold effect cranked up
   - slight blur
   - Values: `threshold` cranked up, value not stated; `blur` touch
   - Why: flat silhouettes sit in a collage; blur softens the hard edge
   - Build: canvas luminance threshold of footage frames, then 1px blur
   - Source: reel `DMtlFlxJ6sg` caption
3. **Design the scene flat in Photoshop as separate layers** — The 2.5D scene starts as a layered PSD (2.5D_Ref.psd): building base, door, banner, left/right trees, lanterns, car and car shadow, each on its own layer, grouped into foreground, midground, background.
   - design flat in Photoshop
   - every depth element on its own layer
   - import as layers into AE
   - Values: `layers seen` Building Base, Door, Banner, Back left tree, back right tree, lantern left, lantern right, Lanterns, Car, Car Shadow, overlay grid
   - Why: each element can take its own depth
   - Build: scene described as named planes with a depth index
   - Source: reel `DQu3nYiCepd` 0:00-0:17
4. **Separate planes in Photoshop and clone-stamp the hidden areas** — In Photoshop cut the elements into their own layers (Foreground, Midground, background) and patch the areas they hid with the Clone Stamp tool.
   - layers: Foreground, Midground, background (Normal, 100% opacity)
   - Clone Stamp over the holes in the lower layers (zoomed ~326%)
   - Values: `layers` Foreground / Midground / background; `blend` Normal 100%; `work zoom` 326%
   - Why: hidden areas are revealed when the camera moves
   - Build: cut-out PNG layers with inpainted backgrounds
   - Source: reel `DZsDDmvtNJP` 0:15-0:24
5. **Fragment one photo into overlapping pieces at reduced opacity** *(shared)* — Cut one image into fragments (each a separate layer of the same photo), overlap them slightly, lower their opacity, and weave text and shapes between the pieces for an assembled editorial look.
   - duplicate the photo layer per fragment (6 layers of the same Capitol image) and mask each to a piece
   - overlap slightly
   - lower opacity of all fragments
   - insert text and shape layers between them in the stack
   - Values: `fragments` 6 in the demo; `Opacity` 100% -> 84% -> 82%
   - Why: assembled editorial look
   - Build: split one image into polygon clip-paths at ~82% alpha, z-ordered with type/shape layers
   - Source: reel `Dc1ShYsplyF` 0:26-0:40

## Type, callouts and annotation

1. **Displacement Map: text takes the paper's form** — A Displacement Map on the text, driven by the texture layer, makes type feel printed onto the surface.
   - add Displacement Map to the text
   - Displacement Map Layer = the texture (layer 'TEXTURE 3')
   - set Use For Horizontal / Use For Vertical channels and Max Horizontal / Max Vertical Displacement
   - Values: `effect` Displacement Map; `map layer` TEXTURE 3; `parameters` Use For Horizontal, Max Horizontal Displacement, Use For Vertical, Max Vertical Displacement, Displacement Map Behavior, Edge Behavior
   - Why: extra tactility: the text belongs to the paper
   - Build: SVG feDisplacementMap with the paper scan as feImage map, small scale (2-6px), on the text layer
   - Source: reel `DL24UePpHWN` 0:34-0:39
2. **Yellow pop-in, then fade to charcoal** *(shared)* — Letters pop in in the brand yellow and settle to charcoal for legibility.
   - animator Fill Color: yellow
   - range sweeps, then colour eases to charcoal
   - Values: `colours` yellow to charcoal, hex not stated
   - Why: brand colour grabs, charcoal reads
   - Build: per-letter colour tween yellow to charcoal over time
   - Source: reel `DLTLw1DpgwE` 0:10-0:16
3. **Random letter appear and odometer pop-in** *(shared)* — Letters appear in random order; an odometer number (e.g. $600,000,000) rolls its digits in like a slot machine.
   - Range Selector with randomized order for the letter appear
   - odometer layer driven by a Range Selector Offset
   - Values: `example` $600,000,000
   - Why: common Vox moves for names and figures
   - Build: per-letter random delay; per-digit vertical roll in a clip mask
   - Source: reel `DLTLw1DpgwE` 0:16-0:22
4. **His own explainer graphics: hand-drawn yellow box and graph-paper tier list** — He explains with Vox-style graphics: a hand-drawn yellow rectangle boxes the key band on a dark textured EQ graph; the tier list sits on graph paper with condensed caps and a handwritten note.
   - dark textured ground, thin line graph, hand-drawn yellow box as the callout
   - graph-paper ground for lists, big condensed caps headings, handwritten aside
   - Values: `callout colour` yellow; `grounds` dark textured canvas; light graph paper
   - Why: the picture carries the point while the voice talks
   - Build: SVG hand-drawn rect (wobbly path, yellow stroke) over a texture ground; graph-paper ground asset
   - Source: reel `DLnuz5ZJ6Ys` 0:14-0:38
5. **Build markups: shape + Trim Paths + Roughen Edges (twice for chalk)** *(shared)* — Simple shape layers drawn on with Trim Paths; Roughen Edges gives a hand-drawn edge; stack a second Roughen Edges with a lower scale for a chalky stroke. He keeps this as a user preset 'RoughTrim'.
   - shape layer (ellipse/path), Add > Trim Paths, animate End
   - Effect > Stylize > Roughen Edges
   - for chalk: second Roughen Edges with lower Scale
   - save as user preset (his: RoughTrim)
   - Values: `effects` Trim Paths, Roughen Edges x2; `second Roughen Edges` lower Scale (value not stated); `Roughen Edges parameters` not readable
   - Why: organic hand-drawn look
   - Build: SVG stroke draw-on plus feTurbulence/feDisplacementMap twice (coarse, then fine frequency)
   - Source: reel `DMixnWEpuhj` 0:13-0:24
6. **Markup look: violet stroke on graph paper, label boxes** — His demo markup is a thick violet hand-drawn ellipse over a big black serif letter on graph paper, with labels in a serif on violet boxes and a small black sub-label box.
   - graph-paper ground
   - thick single-colour (violet) rough stroke
   - labels: serif caps on solid colour boxes with white keyline
   - Values: `stroke colour` violet / periwinkle (hex not stated); `ground` graph paper
   - Why: one accent colour reads as the teacher's pen
   - Build: accent-colour rough stroke + label chips component
   - Source: reel `DMixnWEpuhj` 0:20-0:24
7. **Text gets texture: Wave Warp + Roughen Edges + slight Heat Distortion** *(shared)* — Add wave warp and roughen edges to the title, plus slight heat distortion so it seems to catch sunlight.
   - Wave Warp on text
   - Roughen Edges on text
   - slight Heat Distortion
   - Values: `heat distortion` slight, value not stated
   - Why: text feels printed and in the same air as the scene
   - Build: SVG feTurbulence+feDisplacementMap for roughened edge and ripple
   - Source: reel `DMtlFlxJ6sg` caption
8. **Turbulent Displace at tiny Size breaks sharp edges** *(shared)* — First effect on the text: Turbulent Displace with Size dragged right down (he says to 2) so only the vector edge breaks up.
   - Effect > Distort > Turbulent Displace on the text
   - Displacement Turbulent, Amount 40
   - Size down to 2 (later frames read 6.0)
   - Complexity 1, Pinning Pin All, Antialiasing Low
   - Values: `Displacement` Turbulent; `Amount` 40.0; `Size` 2.0 when set (6.0 in later frames); `Offset` 540.0,960.0; `Complexity` 1.0; `Evolution` 0x+0.0°; `Pinning` Pin All; `Antialiasing` Low
   - Why: breaks the clean vector edges
   - Build: SVG feTurbulence (high baseFrequency ~ small size, 1 octave) + feDisplacementMap scale ~2-6px on the text
   - Source: reel `DOMfGIfCbuQ` 0:08-0:14
9. **Displacement Map from the paper texture below** *(shared)* — Displacement Map on the text with the paper scan beneath as the map, so letters bend with the surface.
   - Effect > Distort > Displacement Map
   - Displacement Map Layer: the paper scan (Texturelabs_Paper_369XL), Source
   - Use For Horizontal: Red
   - Edge Behavior: Expand Output on, Wrap Pixels Around off
   - Values: `map layer` 21. Texturelabs_Paper_369XL.jpg (Source); `Use For Horizontal` Red; `Max Horizontal / Vertical Displacement` not readable; `Expand Output` on; `Wrap Pixels Around` off
   - Why: text follows the paper surface
   - Build: feDisplacementMap with the paper scan as feImage, channel R, small scale
   - Source: reel `DOMfGIfCbuQ` 0:14-0:20
10. **Noise HLS inside the text matched to the paper grain (most important)** *(shared)* — Add Noise HLS to the text in Grain mode, lightness only, and set Grain Size so it matches the granularity of the texture below.
   - Effect > Noise & Grain > Noise HLS
   - Noise: Grain; Hue 0%, Lightness 23%, Saturation 0%
   - Grain Size ~4 (scrubbed 3.9-5.6 while matching)
   - Values: `effect` Noise HLS; `Noise` Grain; `Hue` 0.0%; `Lightness` 23.0%; `Saturation` 0.0%; `Grain Size` 4.00 (scrubbed 3.93-5.55); `Noise Phase` 0x+0.0°
   - Why: matching granularity makes the text sit in the stock
   - Build: luminance-only noise masked to the text fill, cell size matched to the paper scan's grain
   - Source: reel `DOMfGIfCbuQ` 0:20-0:26
11. **Full text stack: Simple Choker, Turbulent Displace, Noise HLS, Displacement Map, Fast Box Blur** *(shared)* — Beyond the three named effects, the text layer also carries Simple Choker (0) and a light Fast Box Blur (radius 1, 3 iterations) to soften the result.
   - order: Simple Choker > Turbulent Displace > Noise HLS > Displacement Map > Fast Box Blur
   - Fast Box Blur radius 1, iterations 3, Horizontal and Vertical, Repeat Edge Pixels on
   - Values: `Simple Choker` Choke Matte 0.00, View Final Output; `Fast Box Blur Radius` 1.0; `Iterations` 3; `Blur Dimensions` Horizontal and Vertical; `Repeat Edge Pixels` on
   - Why: a 1px soften stops the type looking cut out
   - Build: text pass chain: edge displace -> grain -> paper displace -> 1px blur
   - Source: reel `DOMfGIfCbuQ` 0:10-0:17
12. **Saber glow mapped to text** *(shared)* — Free Saber plugin on a solid, Core Type set to Text Layer so the glow follows the type.
   - Saber on a dark solid
   - Customize Core > Core Type: Text Layer (pick the text layer)
   - Glow Color blue
   - Values: `Glow Color` blue; `Glow Intensity` 6.0%; `Glow Spread` 0.07; `Glow Bias` 0.62; `Core Size` 3.00; `Core Start` 540.0,1632.0; `Core End` 540.0,288.0; `Start Roundness` 0.83; `End Size` 110%; `End Offset` 100%; `End Roundness` 0.50; `Offset Size` on; `Halo Intensity` 100%; `Halo Size` 100%; `Core Softness` 0.0; `Flicker Intensity` 12%; `Flicker Speed` 15.00; `Alpha Mode` Disable; `comp fps` 23.976
   - Why: colourful glowing edge that tracks the letters
   - Build: text outline stroke blurred at 2 radii (core + halo) and added; slight 15Hz intensity flicker
   - Source: reel `DPcvDgNDNM4` 0:25-0:30
13. **4-Color Gradient in Hue mode recolours the glow** *(shared)* — Stack a 4-Color Gradient over the Saber glow with its Blending Mode set to Hue, turning the single-colour glow into a Google-style multicolour.
   - Effect > Generate > 4-Color Gradient on the glow
   - Blending Mode: Hue
   - Blend 100, Jitter 0%, Opacity 100%
   - Values: `Blending Mode` Hue; `Blend` 100.0; `Jitter` 0.0%; `Opacity` 100.0%; `points` e.g. 659.5,962.1 and 196.5,995.6; `colours` not readable
   - Why: multicolour glow without rebuilding it
   - Build: four-point gradient composited with 'hue' blend over the glow layer
   - Source: reel `DPcvDgNDNM4` 0:30-0:33
14. **Print Decay: why 1991 print looks messy** — He calls it Print Decay: mass-produced on cheap porous paper with imprecise presses, ink spread outward as it pressed in, leaving tiny bleeds and letterpress inconsistencies the brain associates with nostalgia.
   - identify the three imperfections: edge roughness, uneven ink density, ink bleed
   - recreate each digitally
   - Values: `era` 1991 cover
   - Why: the brain associates these imperfections with nostalgia
   - Source: reel `DYpV-UegFVN` 0:09-0:31
15. **Switchable Cursor Element for screen shots** *(shared)* — Animation Presets > Shapes > Elements > Switchable Cursor Element gives a fully animatable cursor with several styles; pair it with a screen treatment whenever the scene lives on a computer.
   - double-click the preset
   - switch cursor style
   - add a screen treatment (RGB screen)
   - Values: `preset` Animation Presets > Shapes > Elements > Switchable Cursor Element
   - Why: sells 'this is happening on a computer'
   - Build: SVG cursor sprites with style switch, over an RGB-screen pass
   - Source: reel `DaNlGAcgYsD` 0:08-0:19
16. **Rebus layout weaves images and icons into text** — A rebus weaves images and icons directly into a text layout, often replacing words (IBM's eye-bee-M logo); every image or symbol is another element to animate.
   - replace words in a sentence with photos or icons
   - IBM as eye, bee, M
   - Why: makes ordinary words visually interesting and gives extra motion elements
   - Build: inline SVG/images in the text flow, each animated as its own element
   - Source: reel `DdoVHX5gfP-` 0:09-0:25
17. **Rebus references in current brand design** *(shared)* — He shows the device in live brand work: an Apple Safari ad with icons inline in the sentence, Google's product pages and Nike's Space Hippie / Air Max visual design.
   - collect real examples of icons inline with copy
   - Values: `examples` Apple Safari on Mac ad, Google products page, Nike Space Hippie, Nike Air Max
   - Why: proves the device is current, not retro
   - Source: reel `DdoVHX5gfP-` 0:09-0:28

## Maps and data

1. **Map scene layer stack** *(shared)* — The map comp is a 20-layer stack: finishing layer, highlights, focus gradient, textures, the ink and cut-out layers, grunge, grade, then the map footage and background.
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
2. **Satellite base map with district labels and a Screen highlight** — The base is satellite footage (Google Earth, Landsat/Copernicus credit) labelled with district names; the chosen district gets a highlight shape in Screen mode.
   - satellite footage as the map
   - district labels in caps (NODA, UPTOWN, SOUTH END, DILWORTH)
   - highlight shape over the chosen district, blend Screen
   - Values: `source credit` Google Earth, Landsat / Copernicus; `highlight blend` Screen
   - Why: real imagery plus one lit area makes the target obvious
   - Build: satellite still/tiles as base, SVG district polygon filled with light colour in 'screen' mode, caps labels
   - Source: reel `DLShlJxRXZe` 0:09-0:14
3. **Stack duplicates with different styles, colours and Add mode** *(shared)* — Duplicate the visualizer layer a few times, change the style on each (one is a Digital spectrum with Side A & B), give each a colour and stack them in Add mode.
   - duplicate layer to 3-4 copies (Waveform 1-3)
   - vary Display Options per copy (Digital / Analog lines / Analog dots)
   - Side Options Side A & B on one
   - layer mode Add
   - different Inside/Outside Color per copy
   - Values: `copies` 3-4; `layer mode` Add; `spectrum copy` ~14700.0, 64 bands, 2990.0 height, 90.00 duration, 10.00, thickness 4.00, softness 0.0% (field labels partly cut off); `Side Options` Side A & B; `Display` Digital; `scale` 122.9 %; `one colour` ~#CC5049 (OCR 'CCS049')
   - Why: layered styles read richer than one default line
   - Build: several spectrum/waveform renderers drawn with 'lighter' composite and per-copy colour
   - Source: reel `DVRV9hiCX4F` 0:21-0:26
4. **Start from a clean map source** *(shared)* — Find a clean base map: OpenStreetMap and the Library of Congress are good starts; for non-commercial projects he prefers Google's map tools (heard 'Google or Studio', likely Google Earth Studio).
   - OpenStreetMap layers (Standard, CycleOSM, Transport, Humanitarian...)
   - Library of Congress historical maps
   - Google tools for non-commercial only
   - Values: `sources` OpenStreetMap, Library of Congress, Google (non-commercial)
   - Why: a clean base lets the highlights read; licences differ by source
   - Build: public-domain/own vector map (Natural Earth/OSM) rendered to SVG
   - Source: reel `DcTljpCgNNJ` 0:06-0:14
5. **Colour regions with shapes in Overlay over a desaturated map** *(shared)* — Trace the regions to highlight with shape layers, give each region its colour, set the shapes to Overlay, and drop the base map's saturation with Hue/Saturation on an adjustment layer.
   - shape layers tracing regions, one colour each
   - shape blend mode Overlay
   - adjustment layer with Hue/Saturation below the shapes, Master Saturation down
   - Values: `blend` Overlay; `Hue/Saturation Master Saturation` 0 -> ~-15 (seen); Colorize off
   - Why: colour shows through while keeping map detail; reads best on a desaturated base
   - Build: SVG region paths with mix-blend-mode overlay over a saturate(0.85) map
   - Source: reel `DcTljpCgNNJ` 0:14-0:24
6. **Finish with a texture overlay and drifting clouds** *(shared)* — Finish the map with a texture overlay and, optionally, animated clouds on top for more depth.
   - texture overlay on top
   - optional animated clouds layer
   - Why: adds depth
   - Build: cloud plate scrolled slowly with screen/soft-light blend
   - Source: reel `DcTljpCgNNJ` 0:29-0:36

## Sound

1. **Tactile sound design is the reason Vox satisfies** *(shared)* — Sounds you can feel, not generic whooshes, carry the satisfaction: paper rustles, felt marker, film camera snaps, clicks.
   - use physical sound categories tied to the material on screen
   - Values: `categories` paper, film camera, felt marker, VHS tape (on-screen tiles at 0:11)
   - Why: tactile cues make the visuals feel physical
   - Build: foley library tagged by material: paper, marker, shutter, tape, clicks
   - Source: reel `DLR8e0NuUh9` 0:00-0:11
2. **Distant-memory audio: High-pass + Low-pass + Studio Reverb** *(shared)* — On the home videos stack a Highpass, a Lowpass and Studio Reverb (Premiere audio effects); an OFF/ON card compares the result.
   - Audio Effects > Filter and EQ > Highpass
   - Audio Effects > Filter and EQ > Lowpass
   - Audio Effects > Reverb > Studio Reverb
   - A/B with an 'AUDIO EFFECTS: OFF / ON' card
   - Values: `effects` Highpass, Lowpass, Studio Reverb (Premiere Pro)
   - Why: carves EQ space for the music and makes the footage feel like a distant memory
   - Build: ffmpeg highpass=f=~300,lowpass=f=~3000,aecho/afir reverb on the clip audio (cutoffs are our guess, not his)
   - Source: reel `DMDyGp6Jwwx` 0:12-0:26

## Workflow and tools

1. **Finishing adjustment layer stack ('Vox Sauce')** *(shared)* — One adjustment layer named Vox Sauce carries the whole finish, in order: Quick Chromatic Aberration 3, Posterize Time, Exposure, Add Grain.
   - one top adjustment layer over the comp
   - effects in order: Quick Chromatic Aberration 3 > Posterize Time > Exposure > Add Grain
   - Values: `order` Chromatic Aberration, Posterize Time (12.0), Exposure, Add Grain
   - Why: one reusable finishing pass gives every shot the same look
   - Build: a single post pass in the engine: rgb shift -> time quantize -> exposure -> grain, applied to every scene
   - Source: reel `DLQ4Wp9pqv3` 0:10-0:12
2. **The 'Secret Sauce' finishing stack, in order** *(shared)* — His finishing adjustment layer runs: Quick Chromatic Aberration 3, Posterize Time 12, Exposure (flicker), Add Grain, Transform (jitter), Glow (off by default, sometimes worth adding).
   - one adjustment layer on top of every comp
   - order: Chromatic Aberration > Posterize Time > Exposure > Add Grain > Transform > Glow (off)
   - Values: `Posterize Time` 12.0; `comp fps` 24; `Glow` off by default
   - Why: one reusable pass gives every shot gate weave, flicker, grain and stepped time
   - Build: engine post chain: rgb shift -> time quantize 12 -> exposure flicker -> grain -> jitter translate (-> optional soft glow)
   - Source: reel `DLX9PJ_pwBA` 0:16-0:25
3. **Save effect stacks as presets: the 'Mixed Media Treatment'** *(shared)* — Perfect a stack once, Shift-select its effects, Animation > Save Animation Preset to the User Presets library. His example preset 'Mixed Media Treatment' = Posterize Time, Chromatic Aberration, Exposure Flicker, Subtle Camera Shake, Vignette.
   - build the stack on an adjustment layer (shown: Quick Chromatic Aberration 3, Posterize Time, Exposure, Add Grain)
   - Shift-select the effects
   - Animation > Save Animation Preset > User Presets (.ffx)
   - Values: `preset contents` Posterize Time, Chromatic Aberration, Exposure Flicker, Subtle Camera Shake, Vignette; `Chromatic Aberration` Channels Red & Blue, Anchor Mode Absolute Point, Anchor 960.0,540.0 (landscape comp), Mix With Original 0.00%; offset value unclear (~3-6); `file` MixedMediaTreatment.ffx
   - Why: one click away and easy to tweak next project
   - Build: engine: named treatment modules (posterize + rgb shift + flicker + shake + vignette) selectable per film
   - Source: reel `DO60IqNif6o` 0:08-0:25
4. **His preset library = his move vocabulary** *(shared)* — The User Presets folder lists his reusable moves; the names show the building blocks of his style.
   - name presets by what they do and keep them in one folder
   - Values: `presets seen` Waggle, VoxSauce, TrimPathsSimple, ThiccTop, ThiccBottom, TextVaryWiggle, TextShake_Scale, TextPop_BG, TextLoadUpTransform, SmoothUpTransform, Smooth Load Up, Slight Move Up, SlideIn Left Text, Seamless, RoughTrim, RoughTextDisplacement, Pop In Choppy, Page Animator 1, OpacityStrobe_Short, MeshGradient, LoadUp, LoadDownSmooth, Load Up_AppearWord, LetterLoad, Lettering In, HardCutLeft, Global Shake, Flicker On
   - Why: a named library is a style system
   - Build: mirror as an engine move registry: load-up/down, pop-in choppy, rough trim, text wiggle, opacity strobe, flicker on, global shake, hard cut
   - Source: reel `DO60IqNif6o` 0:22-0:24
5. **Reference object: study a real cheap CRT** *(shared)* — He bought a real old CRT (a US$75 Marketplace listing shown on screen) and spent the afternoon studying it to match the emulation to the real thing.
   - get a real reference device
   - compare emulation against it side by side
   - Values: `price shown` $75
   - Why: an emulation is only convincing when checked against the real artefact
   - Build: n/a (reference gathering)
   - Source: reel `DTOKw4vieGq` 0:08-0:10

## What reads as fake

1. **Never set texture strength with opacity** — Reducing the texture layer's opacity makes it feel pasted on and muddies colour; on-screen labels say opacity reads dull and flat.
   - keep texture layers near full opacity
   - control strength another way (Curves, next lesson)
   - Values: `opacity` avoid as the strength control; `screen labels` OPACITY = DULL & FLAT vs CURVES = MUCH BETTER
   - Why: opacity makes textures less integrated and muddies colours
   - Build: never use globalAlpha as the texture-strength knob
   - Source: reel `DL24UePpHWN` 0:19-0:28
2. **Consistency beats the exact effect** *(shared)* — There is no required recipe; the key is applying the same treatment to every clip. Montages mixing YouTube and TV footage use it.
   - pick a treatment
   - apply it identically to all clips
   - Why: consistency is what reads as one film
   - Build: one treatment preset per film, applied to every clip by the renderer
   - Source: reel `DMOpmHxpAOA` 0:23-0:31
3. **Grain on top; do not overcook** — Add Grain on top for subtle movement; keep it light, eyes notice more than we think; glow plus grain stops it feeling like an iMovie slideshow.
   - Add Grain on the same adjustment layer, after Glow
   - Viewing Mode Final Output, Preset None
   - Intensity ~0.4-0.5, Size 1, Softness 1, Aspect 1
   - Values: `Add Grain Intensity` 0.500 (scrubbed between 0.4 and 0.5); `Size` 1.000; `Softness` 1.000; `Aspect Ratio` 1.000
   - Why: avoids the static-slideshow look without drawing attention
   - Build: per-frame grain overlay, low strength, after the glow pass
   - Source: reel `DMWEwQRp6aD` 0:12-0:22
4. **Do not double-stack a band** — Too many textures in one band, e.g. two mids, turns muddy and looks bad.
   - pick one texture per band
   - Values: `max per band` 1
   - Why: muddy, chaotic look
   - Build: lint: refuse more than one overlay of the same band
   - Source: reel `DNuJS_oWoxM` 0:26-0:30
5. **Never pure white or pure black: #373030 and #FAF5E9** — Nudge text colours off pure values; he swaps #000000 for #373030 and #FFFFFF for #FAF5E9, and marks the extreme corners of the colour picker as zones to avoid.
   - dark: #373030 instead of #000000
   - light: #FAF5E9 instead of #FFFFFF
   - avoid the corner zones of the picker
   - Values: `dark` #373030; `light` #FAF5E9; `avoid` #000000, #FFFFFF
   - Why: almost nothing in reality is pure; off values look natural
   - Build: palette tokens: ink #373030, paper-white #FAF5E9; lint for pure #000/#FFF
   - Source: reel `DOMfGIfCbuQ` 0:26-0:33
6. **Crack the vector look: Turbulent Displace 50 / 2 / 2** *(shared)* — Turbulent Displace on the line with Amount about 50 and Size and Complexity down to 2.
   - Effect > Distort > Turbulent Displace
   - Amount ~50, Size 2, Complexity 2, Pinning Pin All, Antialiasing Low
   - Values: `Displacement` Turbulent; `Amount` 50.0; `Size` 2.0; `Complexity` 2.0; `Offset` 540.0,960.0; `Pinning` Pin All; `Antialiasing` Low; `second instance` Turbulent Displace 2 at Amount 31.0, Size 2.0, Complexity 2.0
   - Why: removes vector perfection
   - Build: feTurbulence (fine scale, 2 octaves) + feDisplacementMap on the stroke
   - Source: reel `DT2_SIMgBfI` 0:19-0:24
7. **Too-crisp edges read as digital** — When animation feels overly crisp, the cause is perfectly clean edges; analog needs them softened.
   - diagnose crispness as edge cleanliness
   - Why: clean edges are a digital tell
   - Build: avoid perfectly clean vector edges in the final pass
   - Source: reel `DUEIdzuCUgn` 0:03-0:11
8. **Texture needs a real-world reference or it looks uncanny** — Texturing makes the digital feel physical, but it must copy a real-world reference or the result looks uncanny.
   - pick a real printed reference before texturing
   - Why: invented texture reads as uncanny
   - Source: reel `DVd9Ls2gHWM` 0:00-0:06
9. **Hook: perfect collage looks awful** *(shared)* — Collage is all about layering and reads flat and digital without handmade imperfection; the paradox hook: perfect collage looks awful, because the style comes from cutting, stacking and assembling by hand. Promise three details.
   - state the topic (layering)
   - paradox: perfection is the problem
   - reason: hand-assembly origin
   - count: three ways
   - Values: `tips` 3
   - Why: hand-crafted imperfection is the style
   - Source: reel `Dc1ShYsplyF` 0:00-0:18
10. **Most online textures are too large: scaling down runs out of texture** — Paper textures from stock sites are usually huge; scaling the layer down (demo 102% -> 94%) leaves the frame uncovered.
   - recognise the problem before scaling
   - Values: `demo scale` 102.0% -> 94.0% exposes the edges; `sources browsed` Texture Labs, Vecteezy, Pngtree, Textures4Photoshop, Dreamstime
   - Why: a downscaled single image cannot cover the frame
   - Source: reel `DcBhNhOg5kR` 0:12-0:18
