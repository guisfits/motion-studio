# Chris Moran reels, batch 4 (13 reels)

Source: transcripts + captions + a few frames. Frames show only AE UI (effect search, no numeric panels), so most numbers come from the voiceover. Where he gives no value, it is marked "no value shown".

---

## DZsDDmvtNJP · 2026-06-17 · 27.5k likes · How Vox brings historical images to life
**Parallax (2.5D) on a still photo**
- What: split a photo into foreground / mid-ground / background layers, push them apart in Z, move the camera slowly (dolly or pan).
- Why: without it a photo reads as an "iMovie slideshow"; parallax makes it feel like video and pulls the viewer into the picture.
- Values: no numbers. Pick images with clear depth. Photoshop: cut layers, then clone-stamp to patch what was hidden behind each cut. AE: 3D layers spaced in Z; he uses the free "Depth" plugin to auto-space (one click); manual also fine.
- Build: canvas/SVG layers with per-layer translate scaled by depth (offset = camera_move / z), slow eased camera path; inpaint the occluded areas offline (cv2.inpaint or manual patches) so edges do not show holes.

## DaDhDFjAysT · 2026-06-26 · 22.2k · Match cut ("cutting the curve")
**Cut at the moment of peak velocity on a shared scale move**
- What: animate scale of image A with strong easing; parent image B to A so both share exactly the same transform; cut A to B where the scale curve is moving fastest.
- Why: motion blur-like speed hides the edit; the eye is tracking the move, not the content, so the cut is invisible. Cutting at a slow point feels "jarring".
- Values: strong ease (ease-in-out, steep); cut at max slope of the curve; posterized time 12 fps on top for organic choppy feel.
- Build: one shared scale function s(t) with a cubic/expo ease; compute t_cut = argmax s'(t) (for ease-in-out, the midpoint); render A before and B after using the same s(t); quantize time to 12 fps (t = floor(t*12)/12) on the whole scene.

## Dafr0KjAkve · 2026-07-07 · 10.8k · Paper animation brought to life
**Page turn + stop-motion time**
- What: AE CC Page Turn on a document/photo layer, animate fold position corner to corner; increase fold radius to soften the bend; posterized time at 8 fps on top.
- Why: the tiny physical turn makes a flat page feel real (premium documentary look); 8 fps adds a hand-animated stop-motion quality instead of a "computer-generated" smoothness.
- Values: posterize 8 fps; fold radius "increased" (no number shown). Frame shows a newspaper mid-turn: curled page with a visible shadowed flap over the next page.
- Build: canvas: draw page as two clipped regions along a moving fold line; the flap mirrored, darker gradient on the curl, soft shadow on the page beneath; large radius = cylinder-like gradient instead of a hard crease. Quantize time to 8 fps.

## Da3YpRipHuF · 2026-07-16 · 10.2k · Cinema treatment on photos (gate weave + flicker)
**Gate weave and exposure flicker**
- What: film never sat exactly in the gate, so each frame shifted slightly; plus brightness flicker. Together they signal "old footage / documentary" and keep a still from reading as a JPEG.
- Values: AE Transform effect + subtle wiggle() on Position; Exposure effect + tiny wiggle() on Exposure. Amounts "subtle / tiny", no values shown. (He sells a free drag-drop preset.)
- Build: per-frame random offset of about +-1-2 px (x,y) with seeded noise, smoothed lightly; brightness multiplier 1 +- 0.02-0.04 per frame (CSS filter brightness or globalAlpha black overlay); apply at the final composite, at 24 fps or posterized rate. Our estimate for amounts, not his.

## DbBSCjjgbTw · 2026-07-20 · 121.7k (top of batch) · Blend modes for texturing
**Choose blend mode by texture background; normalize for overlay/soft light**
- White-background texture: use the "darken family" (Multiply, Darken, Darker Color): white is ignored, dark details kept.
- Black-background texture: use the "lighten family" (Screen, Add, Lighten): black ignored, bright details kept.
- Overlay / Soft Light / contrast-family modes: normalize first. Desaturate, then Levels: drag the middle gray (gamma) point onto the histogram peak so the texture is centered on 50% gray. Then the blend adds texture without shifting the colors beneath ("much cleaner"). For more strength, stack another Levels on top.
- Why: 50% gray is neutral for overlay-type modes; any off-centre mean tints and brightens/darkens the whole image.
- Build: precompute normalized textures offline (grayscale, shift so mean luma = 128 via ffmpeg/PIL/sharp); canvas `globalCompositeOperation = 'multiply'|'screen'|'overlay'|'soft-light'`; strength through globalAlpha or an extra contrast curve on the texture.

## DbJSUGZpvzL · 2026-07-23 · 33.4k · Real scanned magazine texture
**Steal texture from real print, isolate with high-pass, add misregistration**
- What: scan a 70s magazine; high-pass filter isolates the fine print detail (grain, ink speckle) and drops the underlying design; AE: set to Overlay, Levels to dial strength; add slight chromatic aberration on text and graphic elements to mimic print color misregistration.
- Why: authentic imperfections cannot be faked convincingly; swapping in a generic fake loses the feel. Frame shows mid-gray ground with fine scratches/fibers and embossed-looking italic serif text.
- Values: Overlay; Levels (no numbers); CA "a touch" (no value shown).
- Build: high-pass = image minus Gaussian blur plus 128 (ffmpeg `blend` or PIL), saved as a normalized overlay tile; apply overlay at partial alpha. Misregistration: draw text/shapes three times in R, G, B channels (lighter/screen) with 1-2 px offsets (our estimate). Source real scans, not generated noise.

## DcBhNhOg5kR · 2026-08-14 · 25.3k · Texture scale (the quarter trick)
**Texture scale must match real-world scale**
- What: same texture looks tactile or "off" depending only on scale. Online textures are huge; shrinking them runs out of area. Fix: tile it (Photoshop pattern layer; AE CC Repetile). Seams are tolerable under an overlay. Then drop a quarter (coin) in the design as a size reference, scale texture and design until details look believable next to it, delete the coin.
- Why: the eye has a real-world reference for grain/fiber size; wrong scale breaks believability.
- Build: use CSS/canvas `createPattern` with a tile at fixed px-per-physical-cm (define: 1 cm of paper = N px at 1080 wide; fiber/halftone sizes derive from that). Keep one global texture scale constant so all layers agree.

## DcTljpCgNNJ · 2026-08-21 · 15.7k · Documentary map animations
**Colored regions + burn reveal + texture + clouds**
- Steps: clean base map (OpenStreetMap, Library of Congress; he prefers Google or Studio for non-commercial); trace regions as shapes in different colors; blend Overlay; lower the base map saturation so colors read; reveal with CC Burn Film animated 100 -> 0; finish with texture overlay; optional animated clouds on top for depth.
- Build: desaturate base (filter: saturate(0.2-0.4), estimate); region paths filled with palette colors via `overlay`; reveal = animated threshold mask over noise (alpha mask where noise < progress) with a warm burnt edge band (orange->black); cloud layer = slow-drifting blurred noise PNG at low alpha. Check licensing of any map source.

## Dcm63HBAHzT · 2026-08-29 · 9.8k · SPONSORED (Adobe Stock panel, Premiere)
One transferable idea: put footage inside a vintage TV frame (framing makes the edit feel intentional), then add subtle RGB split and a bit of screen texture. Build: SVG/PNG frame with screen mask, scanline/grain overlay, 1-2 px R/B channel offset. Rest is product promo.

## Dc1ShYsplyF · 2026-09-03 · 11.0k · 3 ways to improve collage
Premise: "perfect" collage looks flat and digital; real collage is cut, stacked, assembled by hand.
1. **Tinted paper**: tint paper layers and push highlights slightly off-white. Why: subtle depth, especially with several paper layers stacked. Build: multiply a warm tint (e.g. #f1e8d4-ish, our estimate) and clamp whites to ~245 instead of 255.
2. **Fragmented photos**: cut one image into pieces, overlap them slightly, vary opacity per piece, weave text and shapes between them. Why: assembled editorial look. Build: clip-path polygons (torn/rough edges), per-piece alpha ~0.7-1.0, interleave z-order with type and shapes.
3. **Texture variance per layer**: paper grain, halftones, or different blur + noise levels per layer. Why: uniform treatment screams digital. Build: assign each layer its own grain amount, blur (0-1.5 px), halftone yes/no.

## DdKZ5oBpPCW · 2026-09-11 · 7.5k · SPONSORED (Adobe Stock)
Transferable: dust overlay vs shadow overlay on a photo adds depth; a slow keyframe drifts the light across the frame. Build: soft shadow/light-leak PNG, multiply or screen, translate slowly (e.g. 3-6% of width over the shot, estimate). Skip the rest.

## DdoVHX5gfP- · 2026-09-23 · 5.3k · Rebus layouts
**Weave images/icons into text as words/letters**
- What: rebus (he says "Aribis" in the auto-transcript) replaces words or letters with pictures/icons (IBM eye-bee-M logo as example; an iconic but "technically not that good" font design that works anyway).
- Why: every image and symbol becomes another element to animate; ordinary words get visual interest.
- Rule: treat the image as typography: match its scale to the text, align to baseline/x-height.
- Build: layout engine places inline images in the text flow with em-based sizing and baseline alignment; each inline image is its own animatable layer (pop-in, wiggle). For us: a cross/dove/book glyph replacing a word in a verse line.

## DecbrespqWe · 2026-10-13 · 1.0k · SPONSORED (Adobe Stock music)
Transferable only as principle: music sets emotion. Marimba reads curious/playful (discovery); pizzicato strings read investigative. Test the same cut under 2-3 beds before locking. No values.

---

## Batch synthesis: top 10 lessons

1. Blend mode follows texture background: white bg = multiply/darken, black bg = screen/lighten; overlay/soft-light need a texture normalized to 50% gray first (121k-like cornerstone for our texture pipeline).
2. Cut transitions at the peak-velocity point of a shared eased scale (parent B to A, same transform) so the cut is invisible.
3. Posterize time everywhere: 12 fps for scene motion, 8 fps for paper/page-turn; quantize t in the renderer for the hand-made feel.
4. Use real scans as textures; high-pass filter them to isolate detail, then overlay with a levels-style strength control.
5. Texture scale must match physical reality: tile large textures and fix one global px-per-cm (the "quarter" reference).
6. Photo parallax: cut fore/mid/background, inpaint behind, space in Z, slow camera move.
7. Gate weave (sub-pixel wiggle of position) plus tiny exposure flicker keeps stills from reading as JPEGs.
8. Imperfection sells collage: tinted off-white paper, overlapping photo fragments with varied opacity, per-layer grain/blur differences.
9. Add print misregistration (R/G/B offset, about 1-2 px) on text and graphics for authentic printed look.
10. Maps: desaturate base, overlay colored regions, burn-film reveal (threshold mask 100 -> 0), texture, drifting clouds; and rebus layouts treat inline images as typography and as extra animatable layers.

Notes: 3 of 13 reels are sponsored (Dcm63HBAHzT, DdKZ5oBpPCW, DecbrespqWe); the sponsored ones add only the TV-frame/RGB-split, drifting shadow overlay and music-swap ideas. All amounts marked "estimate" are ours, not Moran's.
