# Chris Moran reels, batch 3 (13 reels)

Source: transcripts + captions + contact sheets (two sheets read in detail: DY7TSLJAQef, DZdCD2YNk4d; the rest from transcript and caption; single-frame extraction failed on non-full-range YUV, not retried). All tips are After Effects (AE); each is translated to canvas/SVG/ffmpeg. Sponsored reels: none. Music credit on DTOKw4vieGq is Musicbed (incidental). Several reels end with "free presets in my bio" (his AE presets; not needed).

Shared pattern of the reels: hook = "look at X, see it?", then toggle the effect off to show the flat version, then the recipe. Vox is the reference throughout. Reel look: vertical 9:16, burnt-in uppercase caption bar at the bottom (white sans on a dark pill/band), talking head cut with screen recordings of the AE panel.

---

## DTJJq9JiXxj · 2026-01-05 · 7,088 likes · Stranger Things film-printer artifacts

**Gate weave + exposure flicker**

- What: gate weave = tiny frame-by-frame positional jitter from mechanical drift in old film printers; exposure flicker = slight frame-to-frame brightness inconsistency from printing.
- Why: the Stranger Things title recreates both on purpose to fight the "computerized" look of modern animation. Viewers do not notice them consciously, they feel "nostalgic".
- Values: none given (presets only). Our defaults to pick: weave +-0.5 to 1.5 px translation and +-0.1 deg rotation, re-rolled each frame (or at 12 fps steps); flicker +-3 to 6% brightness.
- Build: global post pass on the final canvas: per-frame `translate(rand, rand)` of the whole composite from a seeded RNG, plus a `brightness()`/alpha-white overlay multiplier randomised per frame. Same pass is reusable for the whole film.

## DTOKw4vieGq · 2026-01-07 · 21,473 likes · CRT TV emulation

**CRT screen pass for blending low-quality archival footage**

- What: a real CRT filmed on a 50% gray background is used as an overlay (captures the irregularities), plus a digital rebuild: downsampling, exposure flicker, scan behavior.
- Why: a CRT/TV pass unifies mismatched, low-quality footage and "brings it back to life"; adds another layer of interest to documentary work.
- Values: recorded gray plate set to Overlay; template exposes sliders for footage quality, overlay strength, others. No numbers on the effect chain.
- Build: for archival clips only: render at low res (e.g. 480p) and upscale with nearest/bilinear, draw scanlines (1px dark line every 2-3 px at ~15-25% alpha), subtle RGB offset, vignette, flicker; optional gray-plate overlay via `globalCompositeOperation='overlay'`. Mismatch-hider: apply to the clip, not the whole film.

## DT2_SIMgBfI · 2026-01-23 · 14,186 likes · Pen/graphite line animation

**Hand-drawn line: Trim Paths + taper + turbulent displace + pencil/ink finish**

- What: animate a stroke with Trim Paths; set a taper with the end length tuned so weight looks like a pen lifting off the paper.
- Why: perfectly uniform vector strokes read as computerized; three small changes break that.
- Values: Turbulent Displace amount ~50, size 2, complexity 2 (his wording: scale and complexity down to 2). Pencil: stack Roughen Edges (graphite). Pen: use Photocopy effect (ink), tune its border size by eye.
- Build: SVG path with `stroke-dashoffset` draw-on; variable width by drawing the path as a polygon ribbon whose width tapers to ~0 over the last 10-20% of length; wobble via `feTurbulence`+`feDisplacementMap` (baseFrequency high, scale ~2-4 px at 1080p); pencil = grain mask multiplied on the stroke (noise threshold), ink = threshold+slight blur.

## DUEIdzuCUgn · 2026-01-28 · 17,812 likes · Scanned look for collage

**Blur 2 px + Unsharp Mask tug of war**

- What: Gaussian blur 2 px, then Unsharp Mask on top; both on one adjustment layer over the whole collage.
- Why: perfectly clean edges are what feels digital. Blur makes subtle ink bleed; unsharp pulls sharpness back through it and adds a little artifacting digital tools do not normally make, so assets read like physical scans.
- Values: blur 2 px; Unsharp radius ~5; amount "to taste" (our start: 80-150%, threshold 0).
- Build: ffmpeg `gblur=sigma=1,unsharp=lx=11:ly=11:la=1.2` (radius 5 ~ 11x11 matrix), or canvas `filter:blur(2px)` followed by a manual unsharp (src + k\*(src - blur(r=5))) in a shader/ImageData pass. Apply once, on the composite, last in the chain before grain.

## DUJWPrqCYGX · 2026-01-30 · 58,646 likes · Halftone texture (top performer of batch)

**Halftone dot texture overlay**

- What: overlay a halftone texture (from Texture Labs) so images show a visible dot grid.
- Why: print presses cannot print grays, so shades become dots: dark = bigger, denser dots; light = smaller, spaced dots. Remove it and the image feels sterile like a PDF. NYT used as the reference.
- Values: blend Overlay or Linear Light; use Curves to set strength; if dots too big, scale the texture down and use CC RepeTile to extend the pattern without losing edges.
- Build: generate the dot pattern procedurally (screen at 45 deg, cell 3-6 px, dot radius from luminance) or ship a tiled high-res PNG; composite with `overlay`/`linear-light` (ffmpeg `blend=all_mode=overlay`, `all_opacity=0.3`); scale by tiling a smaller tile instead of stretching, so dots keep crisp edges.

## DVRV9hiCX4F · 2026-02-27 · 4,336 likes · Stylized audio visualizers

**Audio Waveform effect stacked and tinted**

- What: solid + AE Audio Waveform effect bound to the audio layer; style analog lines, dots or digital; raise max height; duplicate layers with different styles and colours, offset slightly so they stack.
- Why: stacked, offset, differently styled layers avoid the "boring default" visualizer look.
- Values: analog look = two Glow effects stacked plus a little green layered over. No numeric values.
- Build: Web Audio `AnalyserNode` (or precomputed FFT per frame from the soundtrack, deterministic for rendering) drawing 2-3 canvas layers (line, dots, bars) in different colours with 2-6 px offsets; glow via `shadowBlur` or a double blur-add pass. Low priority for our films (we rarely show visualizers).

## DVcF9XyiSjm · 2026-03-03 · 9,159 likes · Ink bleed reveal

**Luma matte ink reveal + choker/roughen animated spread**

- What: a black/white ink-bleed overlay (stock footage, e.g. Storyblocks) used as an inverted luma matte on the artwork: where the overlay is bright, the design appears. Harry Potter map is the reference.
- Why: gives the feeling that something is being developed or uncovered live.
- Values (the second half, procedural version): Simple Choker then Roughen Edges on top; animate choker from 100 to 0 so the shape grows outward like spreading ink.
- Build: canvas: draw artwork, then `destination-in` with an ink-bleed video/frame sequence (white = visible) for the stock version; procedural version = a mask shape grown with a noisy threshold: render a radial/blob mask, add noise, threshold at a rising level (SVG `feTurbulence`+`feComponentTransfer` discrete, or a per-pixel shader), animate the threshold 0 to 1 over 1-2 s ease-out. No stock footage needed.

## DVd9Ls2gHWM · 2026-03-04 · 40,986 likes · Risograph overprint

**Riso emulation: two ink comps, multiply, halftone Hard Mix, misregistration**

- What: split the animation into two comps (Ink 1, Ink 2), tint each a different ink colour, set both to Multiply (overprint blend). Inside each, a halftone texture on Hard Mix at ~50% opacity. Then offset the layers slightly and animate the texture.
- Why: texture needs a real-world reference or it looks uncanny. Riso (80s-90s) prints one ink per pass: misaligned layers, grain, very limited palette = printed character.
- Values: Hard Mix ~50% opacity; blend Multiply; colours: two inks (e.g. fluorescent pink + blue are the usual riso pairing; he does not name hex); offset a few px; texture animated.
- Build: draw each ink layer as a grayscale mask, colourise with a flat ink colour, composite with `multiply` on paper colour; threshold each layer through its own halftone/grain (hard-mix equals a threshold of mask + noise); jitter layer 2 by 1-4 px (varied per frame at 8-12 fps); keep palette to 2-3 inks. Strong fit for our collage style variants.

## DYP_tfAJxD- · 2026-05-12 · 30,796 likes · Intentional moire

**Moire shimmer from a high-res halftone + slow camera move**

- What: overlay a very high-res halftone pattern on footage, blend Overlay; add a slow camera move so the pattern interferes with the content's own fine detail and shimmers.
- Why: moire (two similar but slightly different grids interacting) is normally a defect, but used on purpose adds depth and movement to a flat image; without it the slide looks like stock PowerPoint. Johnny Harris edits are the reference.
- Values: blend Overlay; pattern must be high-res (finer than the dot sizes in the halftone reel); motion = slow zoom/pan.
- Build: render the dot grid at a slightly different pitch/angle than the content, or just scale/rotate the overlay tile 0.5-2% over the shot while the content zooms, so beating moves across the frame. Check it survives H.264 compression (he warns Instagram compression may hide it): test at final bitrate.

## DYpV-UegFVN · 2026-05-22 · 10,568 likes · Print decay on type

**Distressed vintage text (Sports Illustrated 1991)**

- What: "print decay": mass-produced magazines on porous paper with imprecise presses spread ink, leaving tiny bleeds and letterpress inconsistencies that the brain reads as nostalgia.
- Why: recreate the imperfection or the type feels digital.
- Values (in order): Roughen Edges with the scale turned down (breaks perfectly clean lines); Fractal Noise as a subtle letterpress texture, lower brightness and reduce scale until ink looks pressed into the page; ink bleed = tiny Gaussian blur + soft drop shadow on top. Transcript cuts off before a final step.
- Build: type as text mask; displace edges with small high-frequency noise (`feTurbulence` baseFrequency ~0.8, `feDisplacementMap` scale 1-2 px); multiply a low-contrast fractal-noise texture inside the glyphs (alpha ~10-20% variation); finish with `blur(0.6px)` plus a 1-2 px low-alpha shadow of the same ink colour for bleed. This stacks with the 2 px blur/unsharp pass above.

## DY7TSLJAQef · 2026-05-29 · 79,935 likes · Layered backgrounds (highest likes of batch)

**Textured, image-based backgrounds instead of flat solids**

- What: Vox rarely uses a flat colour. Pull in a few images that support the subject (Capitol, newspaper scans, political architecture), pre-comp them, apply a Tint on top, add a little texture.
- Why: flat solids do not distract (good) but identity is lost if every background is flat; layered ones give an "editorial" feel. Sheet shows black swap = instantly loses it.
- Values: Tint: Map Black to a dark gray (not pure black), Map White to slightly brighter than the base, so the contrast stays subtle (the image becomes a quiet tonal field behind the main content). Texture on top (dust/scratch overlay). Sheet also shows backgrounds of columns/newspaper cut off by shapes, grey architecture ghosted behind the main cutout, blueprint line drawings on near-white, and a spotlight cone on dark.
- Build: background = 1-3 supporting images, scaled large, partially cropped, desaturated; compress their range with `levels`: out-black ~#16-#22, out-white ~#40-#55 on dark grounds (inverse for light grounds); optional blur/vignette; film dust on top. Works for our "infinite ground" look rules: the ground is a tonal photo, never #000.

## DZFqNzwAqVa · 2026-06-02 · 25,787 likes · Analog photo look

**Three layers: fringe blur, film dust, vignette (+ slow zoom)**

- What: (1) fringe blur: soften the frame edges while the subject stays sharp; (2) film dust overlay (Texture Labs) so it reads as a film scan; (3) vignette to guide the eye; plus a slow zoom so a physical photo seems to be filmed.
- Why: documentary photos never sit flat; these cues show up constantly and create depth.
- Values: none numeric. Our start: edge blur radial mask 0 at 60% radius to 6-10 px at corners; dust at 10-20% screen/add; vignette -25 to -40% at corners; zoom 100 to 104-108% over the shot, ease-in-out.
- Build: canvas: draw photo, draw blurred copy through a radial-gradient mask (`destination-in`), overlay dust frame/PNG, radial gradient black multiply; scale transform animated slowly (also covers the "photo on a table filmed" effect).

## DZdCD2YNk4d · 2026-06-11 · 20,374 likes · Edge boil for callouts

**Edge boil: lines that wiggle frame to frame**

- What: Vox callouts (circle, arrow, underline) have subtle moving edges. Origin: hand-drawn animation, where every frame's line was slightly different.
- Why: static perfect lines feel lifeless; boil makes the piece look crafted.
- Values: animate the stroke with Trim Paths; add Roughen Edges with border size ~half the stroke width; add Turbulent Displace amount 80, size 2; set Random Seed expression to `time*4` (4 distinct looks per second, i.e. boil at ~4 fps; he does not say 12 fps); for more motion duplicate Turbulent Displace with bigger size and lower amount (a second, slower, wider wobble).
- Build: SVG filter `feTurbulence` with `seed` stepping `floor(t*4)` driving `feDisplacementMap` (scale ~3-6 px at 1080p, low baseFrequency ~0.02-0.04 for a second wide wobble plus a high one ~0.3 for fine tremor); apply to every stroke/callout, not photos. Sheet shows the callout is a blue hand-drawn ellipse and curved arrow on a newspaper photo with grainy black-white ground; the reel itself intercuts 16 mm-style frame-by-frame animation footage.

---

## Batch synthesis: top 10 lessons

1. Never output flat solids: ground = supporting photos/scans, tinted to dark gray (not #000) with a narrow tonal range, plus dust (DY7T, 80k likes).
2. Texture needs a real-world reference (halftone, riso, print decay); abstract noise looks uncanny (DVd9).
3. Edge boil on every callout/stroke: seed stepping at `time*4` (~4 fps), displace ~80/size 2 equivalent; add a second slow wide wobble (DZdC).
4. Final "scan" pass on the whole collage: blur 2 px then unsharp radius ~5; clean edges are the digital tell (DUEI).
5. Halftone overlay in Overlay/Linear Light, tiled (not stretched) so dots stay crisp; dark = bigger dots (DUJW, 59k likes).
6. Riso overprint: separate ink layers, Multiply, per-layer hard-mix halftone, 1-4 px misregistration, 2-3 inks (DVd9).
7. Photos: fringe blur + dust + vignette + slow 4-8% zoom, so a still reads as a filmed physical object (DZFq).
8. Whole-film imperfection pass: gate weave (per-frame jitter) + exposure flicker, plus CRT/low-res pass only on mismatched archival clips (DTJJ, DTOK).
9. Hand-drawn pen look: trim-path draw-on, taper the last stretch, turbulent displace ~50/size 2, pencil = rough edges, ink = photocopy threshold (DT2\_).
10. Print-decay type: rough edges + letterpress noise inside glyphs + 0.5 px blur and soft same-colour shadow for bleed; moire shimmer comes free if a fine overlay meets slow camera moves, but test it at final bitrate (DYpV, DYP\_).

Open items for the caller: (a) numeric ranges marked "our start" are my proposals, not Chris's; (b) DYpV transcript ends mid-sentence, final step unknown; (c) no frame-level AE values were read beyond DZdC/DY7T sheets.
