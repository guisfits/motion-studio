# Chris Moran: what this role must know (14 lessons)

Source: Chris Moran (`@chrismoran__`), professional motion designer teaching the editorial-collage look in After Effects, 52 tutorial reels.
Every lesson below was extracted from the reel's transcript and its on-screen panels (OCR at 2 fps); the full ledger is `tutorials/chrismoran/lessons.jsonl`.
Values are his (After Effects units); `~` = read uncertainly; "not stated" = he gave none. `Build` says how this engine does it.
Lessons marked *(shared)* are owned by another role; know them, do not execute them.

Where a lesson and `tools/checks/norms.mjs` disagree, the norm gates the render; raise the conflict to the Director.

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
3. **Flicker expression detail: the hold never applies** *(shared)* — His code computes floorTime but seeds with index + time, so the value changes every frame (stepped only by Posterize Time 12); seeding with floorTime is what would hold each value for 1/freq s.
   - to actually hold: seedRandom(index + floorTime, true)
   - or rely on the 12 fps Posterize Time in the same stack
   - Values: `effective flicker rate` every frame (12 fps after Posterize Time), not 2 per second
   - Why: copying the code verbatim gives faster flicker than the comment promises
   - Build: seed the flicker random by floor(t*freq) so each value holds 1/freq s
   - Source: reel `DLX9PJ_pwBA` 0:19-0:21
4. **Consistency beats the exact effect** *(shared)* — There is no required recipe; the key is applying the same treatment to every clip. Montages mixing YouTube and TV footage use it.
   - pick a treatment
   - apply it identically to all clips
   - Why: consistency is what reads as one film
   - Build: one treatment preset per film, applied to every clip by the renderer
   - Source: reel `DMOpmHxpAOA` 0:23-0:31
5. **Grain on top; do not overcook** *(shared)* — Add Grain on top for subtle movement; keep it light, eyes notice more than we think; glow plus grain stops it feeling like an iMovie slideshow.
   - Add Grain on the same adjustment layer, after Glow
   - Viewing Mode Final Output, Preset None
   - Intensity ~0.4-0.5, Size 1, Softness 1, Aspect 1
   - Values: `Add Grain Intensity` 0.500 (scrubbed between 0.4 and 0.5); `Size` 1.000; `Softness` 1.000; `Aspect Ratio` 1.000
   - Why: avoids the static-slideshow look without drawing attention
   - Build: per-frame grain overlay, low strength, after the glow pass
   - Source: reel `DMWEwQRp6aD` 0:12-0:22
6. **Same flicker-code caveat: hold not applied** *(shared)* — As in his film-flicker code, the seed uses time, not floorTime, so values change every frame rather than every 0.5 s.
   - seedRandom(index + floorTime, true) to really hold for 1/freq
   - Values: `effective rate` every frame
   - Why: copying verbatim gives a faster flicker than the comment says
   - Build: seed by floor(t*freq)
   - Source: reel `DNmGyQupPlQ` 0:22-0:24
7. **Do not double-stack a band** *(shared)* — Too many textures in one band, e.g. two mids, turns muddy and looks bad.
   - pick one texture per band
   - Values: `max per band` 1
   - Why: muddy, chaotic look
   - Build: lint: refuse more than one overlay of the same band
   - Source: reel `DNuJS_oWoxM` 0:26-0:30
8. **Never pure white or pure black: #373030 and #FAF5E9** *(shared)* — Nudge text colours off pure values; he swaps #000000 for #373030 and #FFFFFF for #FAF5E9, and marks the extreme corners of the colour picker as zones to avoid.
   - dark: #373030 instead of #000000
   - light: #FAF5E9 instead of #FFFFFF
   - avoid the corner zones of the picker
   - Values: `dark` #373030; `light` #FAF5E9; `avoid` #000000, #FFFFFF
   - Why: almost nothing in reality is pure; off values look natural
   - Build: palette tokens: ink #373030, paper-white #FAF5E9; lint for pure #000/#FFF
   - Source: reel `DOMfGIfCbuQ` 0:26-0:33
9. **Cutting on stillness feels jarring** *(shared)* — A cut on a still frame calls attention to itself.
   - avoid cutting on static frames
   - Why: nothing for the eye to follow
   - Build: validator: flag cuts where outgoing and incoming motion are both zero
   - Source: reel `DOb0h6VCSpM` 0:21-0:24
10. **Crack the vector look: Turbulent Displace 50 / 2 / 2** *(shared)* — Turbulent Displace on the line with Amount about 50 and Size and Complexity down to 2.
   - Effect > Distort > Turbulent Displace
   - Amount ~50, Size 2, Complexity 2, Pinning Pin All, Antialiasing Low
   - Values: `Displacement` Turbulent; `Amount` 50.0; `Size` 2.0; `Complexity` 2.0; `Offset` 540.0,960.0; `Pinning` Pin All; `Antialiasing` Low; `second instance` Turbulent Displace 2 at Amount 31.0, Size 2.0, Complexity 2.0
   - Why: removes vector perfection
   - Build: feTurbulence (fine scale, 2 octaves) + feDisplacementMap on the stroke
   - Source: reel `DT2_SIMgBfI` 0:19-0:24
11. **Too-crisp edges read as digital** *(shared)* — When animation feels overly crisp, the cause is perfectly clean edges; analog needs them softened.
   - diagnose crispness as edge cleanliness
   - Why: clean edges are a digital tell
   - Build: avoid perfectly clean vector edges in the final pass
   - Source: reel `DUEIdzuCUgn` 0:03-0:11
12. **Texture needs a real-world reference or it looks uncanny** *(shared)* — Texturing makes the digital feel physical, but it must copy a real-world reference or the result looks uncanny.
   - pick a real printed reference before texturing
   - Why: invented texture reads as uncanny
   - Source: reel `DVd9Ls2gHWM` 0:00-0:06
13. **Hook: perfect collage looks awful** *(shared)* — Collage is all about layering and reads flat and digital without handmade imperfection; the paradox hook: perfect collage looks awful, because the style comes from cutting, stacking and assembling by hand. Promise three details.
   - state the topic (layering)
   - paradox: perfection is the problem
   - reason: hand-assembly origin
   - count: three ways
   - Values: `tips` 3
   - Why: hand-crafted imperfection is the style
   - Source: reel `Dc1ShYsplyF` 0:00-0:18
14. **Most online textures are too large: scaling down runs out of texture** *(shared)* — Paper textures from stock sites are usually huge; scaling the layer down (demo 102% -> 94%) leaves the frame uncovered.
   - recognise the problem before scaling
   - Values: `demo scale` 102.0% -> 94.0% exposes the edges; `sources browsed` Texture Labs, Vecteezy, Pngtree, Textures4Photoshop, Dreamstime
   - Why: a downscaled single image cannot cover the frame
   - Source: reel `DcBhNhOg5kR` 0:12-0:18
