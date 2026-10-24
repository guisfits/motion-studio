# Chris Moran: what this role must know (26 lessons)

Source: Chris Moran (`@chrismoran__`), professional motion designer teaching the editorial-collage look in After Effects, 52 tutorial reels.
Every lesson below was extracted from the reel's transcript and its on-screen panels (OCR at 2 fps); the full ledger is `tutorials/chrismoran/lessons.jsonl`.
Values are his (After Effects units); `~` = read uncertainly; "not stated" = he gave none. `Build` says how this engine does it.
Lessons marked *(shared)* are owned by another role; know them, do not execute them.

Where a lesson and `tools/checks/norms.mjs` disagree, the norm gates the render; raise the conflict to the Director.

## Hook and first seconds

1. **Hook: it looks authentic because it is** *(shared)* — Show the retro texture, remove it or swap a fake one so the feel disappears, then reveal it is real: scanned from an old magazine found at a thrift store.
   - A/B with and without the real texture
   - reveal the source (a thrift-store magazine; the scan shows 1960s Ford/track-and-field pages)
   - tease 'how did I steal it'
   - Why: real scanned artefacts carry imperfections synthetic texture lacks
   - Build: n/a (source real scans for textures)
   - Source: reel `DbJSUGZpvzL` 0:00-0:12

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

1. **Topic-matched background imagery** — Pull a few images that support the video's subject; for a political piece: the Capitol building, newspaper scans, political architecture.
   - pick 2-3 subject images (demo: Capitol facade + 1918 NYT 'Armistice signed' front page)
   - arrange them overlapping, angled
   - Values: `images` a few (2 shown)
   - Why: relevance gives the frame meaning even in the background
   - Source: reel `DY7TSLJAQef` 0:22-0:30
2. **Pick a photo with clear foreground, midground, background** — Start with an image that has plenty of depth: a clear foreground, midground and background.
   - choose photos with three readable depth planes
   - Values: `planes` 3
   - Why: parallax needs separable planes
   - Source: reel `DZsDDmvtNJP` 0:12-0:15

## Paper and texture

1. **Texture is intentional: pick per piece from free libraries** *(shared)* — Choose textures like a chef picks ingredients, per piece; here a faded newspaper and a macro shot of stock paper for a title card.
   - browse free libraries (Texturelabs, Texture Fabrik shown)
   - pick per piece: 'Faded Newspaper' and 'Paper 348 / Macro detail paper', both in Textures > Paper
   - download the large size
   - Values: `textures` 2 (faded newspaper, macro stock paper); `sites` texturelabs.org, Texture Fabrik; `download size` large 4240x3034 jpg (small 960x687, med 1920x1374 offered); `licence` 'Free for commercial use' shown on Texturelabs
   - Why: deliberate choice beats one default overlay
   - Build: curate per-scene scans in the asset manifest at >=4K source size; never one global overlay
   - Source: reel `DL24UePpHWN` 0:06-0:18
2. **Hide low-quality assets with high-quality texture** *(shared)* — Step 2: a halftone or fine grain disguises low-res images and gives a printed feel; his example is a 540x300 image under a 5260x4000 texture.
   - keep the weak photo
   - put a high-resolution halftone/grain texture over it
   - Values: `image` 540x300; `texture` 5260x4000
   - Why: the texture's detail replaces the image's missing detail
   - Build: low-res archival photos always rendered through a halftone pass at output resolution
   - Source: reel `DQpMiV_Cdpr` 0:21-0:29
3. **Source the halftone from a texture library** — Grab a halftone texture rather than generating it; he searches 'halftone' on Texture Labs and uses a grunge halftone plate.
   - search 'halftone' on TEXTURELABS.ORG (results: tiny halftone overlay, colour halftone overlay, grunge halftones)
   - import the plate as a layer named Halftone (file Texturelabs_Grunge_265M.jpg)
   - Values: `source` Texture Labs; `file` Texturelabs_Grunge_265M.jpg
   - Why: scanned plates carry real print irregularity
   - Build: keep a halftone plate set in the engine's texture library; select per film
   - Source: reel `DUJWPrqCYGX` 0:28-0:30
4. **High Pass in Photoshop isolates print detail from a scan** — Scan the magazine page, then run Photoshop's High Pass filter: it isolates and lifts the fine print detail and drops the rest of the design.
   - scan the page
   - Photoshop: Filter > Other > High Pass
   - result is a mid-grey plate with only the print detail
   - Why: keeps grain/ink detail and drops the underlying design
   - Build: offline: gray minus gaussian-blur + 128 = high-pass texture
   - Source: reel `DbJSUGZpvzL` 0:13-0:22
5. **Shadow overlay beats dust overlay for depth** *(shared)* — He tried dust overlays first, then a window-light shadow overlay (light and shadow silhouette on a white wall) and kept the shadow: it adds more depth to a still photo.
   - preview dust overlays over the photo
   - preview shadow overlays over the photo
   - keep the one that adds depth
   - Values: `asset` light-and-shadow window silhouette on a white wall, 7000x4667 JPEG
   - Why: cast light and shadow add depth to a still more than dust does
   - Build: window-shadow plate over the photo in multiply
   - Source: reel `DdKZ5oBpPCW` 0:13-0:34

## Colour and grade

1. **Footage homogenization** *(shared)* — Clips from different cameras, eras or quality (e.g. a 240p clip) keep their story value but never go in raw; layer consistent effects across every clip.
   - keep the shot if it serves the story
   - layer the same effects over every clip
   - Values: `quality example` ~240p clip label on screen (OCR '244p')
   - Why: cohesion across mismatched sources
   - Build: shared final-pass stack on all clips
   - Source: reel `DMOpmHxpAOA` 0:03-0:13

## Film and screen treatments

1. **Treat real browser and social pages as evidence** — The demo material is real captures (Wikipedia, Google search, a Facebook profile) zoomed in and treated, not mock-ups.
   - capture real pages
   - crop tight on the relevant line
   - apply the three-layer screen treatment
   - Values: `sources shown` Wikipedia (Eiffel Tower), Google search, Facebook profile
   - Why: documentary credibility comes from real interfaces
   - Build: screen-capture assets (our own app/web) under the scan-line + rgb shift + vignette pass
   - Source: reel `DLQw7mqJzRp` 0:04-0:22
2. **Handycam footage for nostalgia** *(shared)* — Home-video footage from a consumer handycam (Sony, Carl Zeiss Vario-Tessar, optical 12x shown) reads as personal memory.
   - use or emulate consumer handycam footage
   - Values: `camera shown` Sony handycam, Carl Zeiss Vario-Tessar lens, optical 12x
   - Why: nostalgia comes from the camera of the era
   - Build: handycam treatment: low res, soft focus, interlace/colour bleed, date-stamp optional
   - Source: reel `DMDyGp6Jwwx` 0:00-0:13
3. **Use the CRT pass to blend archival footage** *(shared)* — The screen pass unifies archival footage of different quality and adds a layer of interest to documentary projects.
   - apply the same screen pass over archival clips
   - Why: hides quality mismatch between sources
   - Build: shared post-pass over archival shots in the timeline
   - Source: reel `DTOKw4vieGq` 0:29-0:34
4. **Film dust plate from Texture Labs** *(shared)* — Overlay a subtle film-print dust plate (Texture Labs Grunge 353, 'Film print dust', free for commercial use) so the photo feels like a film scan.
   - download the dust plate
   - layer it over the photo, subtle
   - Values: `source` Texture Labs Grunge 353 'Film print dust'; `licence` free for commercial use
   - Why: film scan feel
   - Build: dust plate overlay (screen) at low opacity
   - Source: reel `DZFqNzwAqVa` 0:09-0:12
5. **Frame footage inside an old TV** *(shared)* — Placing footage inside a period TV frame makes the edit feel intentional and pulls the viewer into the story.
   - use a vintage TV frame with a cut-out (transparent) screen
   - footage sits behind the bezel
   - Why: framing makes the edit feel intentional
   - Build: PNG TV bezel with transparent screen, footage clipped to the screen rect
   - Source: reel `Dcm63HBAHzT` 0:06-0:15
6. **Pick the TV frame by era: transparent, isolated, previewed over the edit** — Choose the frame by the project's time period; filter the search to transparent, isolated assets without people, and preview several directly over the edit before committing.
   - search 'vintage TV frame'
   - filters: Background Transparent, Isolated assets, Exclude people, Exclude GenAI content
   - drop 2-3 candidates over the edit and compare
   - Values: `filters` Transparent background, Isolated assets, Exclude people, Exclude GenAI content; `asset` 'vintage old TV cut out screen' (transparent PNG)
   - Why: every project has a different period; testing in context beats guessing
   - Build: keep a library of era-tagged TV bezels with screen rects; choose per film
   - Source: reel `Dcm63HBAHzT` 0:15-0:30

## Type, callouts and annotation

1. **Rebus references in current brand design** — He shows the device in live brand work: an Apple Safari ad with icons inline in the sentence, Google's product pages and Nike's Space Hippie / Air Max visual design.
   - collect real examples of icons inline with copy
   - Values: `examples` Apple Safari on Mac ad, Google products page, Nike Space Hippie, Nike Air Max
   - Why: proves the device is current, not retro
   - Source: reel `DdoVHX5gfP-` 0:09-0:28

## Maps and data

1. **Satellite base map with district labels and a Screen highlight** *(shared)* — The base is satellite footage (Google Earth, Landsat/Copernicus credit) labelled with district names; the chosen district gets a highlight shape in Screen mode.
   - satellite footage as the map
   - district labels in caps (NODA, UPTOWN, SOUTH END, DILWORTH)
   - highlight shape over the chosen district, blend Screen
   - Values: `source credit` Google Earth, Landsat / Copernicus; `highlight blend` Screen
   - Why: real imagery plus one lit area makes the target obvious
   - Build: satellite still/tiles as base, SVG district polygon filled with light colour in 'screen' mode, caps labels
   - Source: reel `DLShlJxRXZe` 0:09-0:14
2. **Start from a clean map source** — Find a clean base map: OpenStreetMap and the Library of Congress are good starts; for non-commercial projects he prefers Google's map tools (heard 'Google or Studio', likely Google Earth Studio).
   - OpenStreetMap layers (Standard, CycleOSM, Transport, Humanitarian...)
   - Library of Congress historical maps
   - Google tools for non-commercial only
   - Values: `sources` OpenStreetMap, Library of Congress, Google (non-commercial)
   - Why: a clean base lets the highlights read; licences differ by source
   - Build: public-domain/own vector map (Natural Earth/OSM) rendered to SVG
   - Source: reel `DcTljpCgNNJ` 0:06-0:14

## Sound

1. **Tactile SFX search list** *(shared)* — He shows a 'screenshot this' list of tactile search terms to pull from sound libraries.
   - search these terms one by one
   - Values: `terms` paper movement, circuit breaker on, quick page flick, sticky note peel, film camera shutter snap, polaroid eject pop, VHS cassette snap-in, typewriter, mechanical button click, pencil scratch, chalk drag, zipper, cloth movement, coin spin on table, wood block tap, drawer slam, light switch flick, velcro rip, box lid pop open, match strike
   - Why: specific physical actions give crisp, believable cues
   - Build: seed the SFX manifest with these 20 tags; one cue type per visual event
   - Source: reel `DLR8e0NuUh9` 0:11-0:13
2. **Search terms for the marimba explainer bed** *(shared)* — Vox uses the KPM library (often $500+ per track); he gives search terms that find the same sound on cheaper libraries, and a layering tip.
   - search: 'marimba documentary music', 'marimba documentary underscore'
   - similar and less cliche: 'pizzicato strings score', 'pizzicato strings documentary', 'classical orchestra'
   - pro tip: stack with soft strings or synth pads so it feels more modern and less reality TV
   - Values: `Vox library` KPM, often $500+; `search terms` 5 listed; `layering` soft strings or synth pads
   - Why: same function at a regular budget
   - Build: music-sourcing keyword list in the sound skill; bed = marimba + soft pad layer
   - Source: reel `DLnuz5ZJ6Ys` 0:31-0:39

## Workflow and tools

1. **Free SFX sources, or record it yourself** — Sources: Freesound and Soundly, or record the sound yourself.
   - freesound.org
   - getsoundly.app
   - record your own
   - Values: `sources` freesound.org, getsoundly.app, self-recorded
   - Why: free and specific
   - Build: archivist pulls CC0 clips from Freesound with licence noted in the manifest
   - Source: reel `DLR8e0NuUh9` 0:13-0:14
2. **Music platforms ranked A/B/C, and adjacent instruments** — Ranked by best options and ease of finding these tracks: A Audio Network, AudioJungle, Epidemic Sound; B YouTube, Pond5, Musicbed; C Artlist (only for this style). Adjacent searches: pizzicato cello and pizzicato violin.
   - try tier A first
   - adjacent: 'pizzicato cellos documentary score', 'pizzicato violin score'
   - Values: `tier A` Audio Network, AudioJungle, Epidemic Sound; `tier B` YouTube, Pond5, Musicbed; `tier C` Artlist; `adjacent` pizzicato cello, pizzicato violin
   - Why: where these tracks are easiest to find
   - Build: archivist sourcing order for music beds, licence recorded in the manifest
   - Source: reel `DLnuz5ZJ6Ys` 0:37-0:43
3. **Reference object: study a real cheap CRT** — He bought a real old CRT (a US$75 Marketplace listing shown on screen) and spent the afternoon studying it to match the emulation to the real thing.
   - get a real reference device
   - compare emulation against it side by side
   - Values: `price shown` $75
   - Why: an emulation is only convincing when checked against the real artefact
   - Build: n/a (reference gathering)
   - Source: reel `DTOKw4vieGq` 0:08-0:10
4. **Source ink bleed from stock footage** — Ink reveals come from an ink-bleed overlay clip from a stock library, not built by hand.
   - find an ink bleed overlay clip
   - import it as a layer (Footage Ink)
   - Why: real ink motion is hard to fake
   - Build: need licensed/CC ink bleed clips in the asset library
   - Source: reel `DVcF9XyiSjm` 0:17-0:20

## What reads as fake

1. **Texture needs a real-world reference or it looks uncanny** *(shared)* — Texturing makes the digital feel physical, but it must copy a real-world reference or the result looks uncanny.
   - pick a real printed reference before texturing
   - Why: invented texture reads as uncanny
   - Source: reel `DVd9Ls2gHWM` 0:00-0:06
