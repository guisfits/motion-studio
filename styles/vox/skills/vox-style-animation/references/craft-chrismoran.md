# Craft notes: Chris Moran (Vox-style breakdowns)

Chris Moran (`@chrismoran__`, Instagram) is a professional motion designer who breaks down the Vox
look in short reels. Distilled from his 52 reels (2025-06 to 2026-10, voiceover transcribed, frames
read) and his free After Effects presets and projects (decoded, values below). Values marked `~` are
inferred, not stated by him. Each note ends with the code translation (no After Effects here).

His one-line thesis: **the Vox look is a stack of small imperfections applied the same way to
everything**. No single effect carries it; consistency does.

## 1. One finishing chain over the whole film

Apply it once, on the final composite, after every piece is placed. The same chain on every asset
is what makes mixed archive sources (scans, photos, footage, type) cohere.

| Step | Value (his "Secret Sauce" preset) | Code |
| --- | --- | --- |
| Stepped time | 12 fps for the scene | quantise the clock `t' = floor(t*12)/12` before every animated value |
| Exposure flicker | new random gain every frame, ±0.04 stops (screens/callouts ±0.02–0.03) | `brightness(2^rand(-0.04,0.04))`, seeded per frame |
| Gate weave | ±1–1.5 px position, stepped; scale 101–103 % so edges never show | `translate(rand px)` per frame + `scale(1.03)` |
| Grain | intensity 0.3, size 1 (2 in his callouts), re-seeded each frame; monochrome only in his footage treatment 3 | noise (size 2 = half res, upscaled nearest), `overlay`/`soft-light` 0.15–0.3; ffmpeg `noise=alls=12:allf=t` |
| Glow | threshold 183/255, radius 50, intensity 0.15 | blurred highlights pass, `screen` |
| Chromatic aberration | 1–2 px channel offset, 1–3 px blur on the shifted channels; global, not per layer | R −d, B +d px; ffmpeg `rgbashift=rh=-2:bh=2` |
| Vignette | ~0.3–0.5 darker at the edges (~; he shows it, gives no number) | radial gradient, `multiply` |
| Scan pass | Gaussian blur 2 px, then unsharp radius ~5 (amount to taste) | once, on the composite, ~last before grain: clean vector edges are the digital tell |

The flicker in his expression is per frame even though it names a 2 Hz rate (the hold variables are
unused); keep it per frame and tiny, or it reads as a fault.

## 2. Texture

- **Blend follows the texture's background.** White background → Multiply/Darken (keeps the dark
  detail); black background → Screen/Lighten/Add (keeps the bright detail).
- **Overlay and Soft Light need normalisation first:** desaturate the texture, then set levels so
  its histogram peak sits at 50 % grey. Un-normalised, the blend shifts the colours underneath.
- **Control strength with Curves/Levels on the texture, not with opacity.** Opacity flattens and
  fogs; curves keep contrast in the detail. Stack a second levels pass to push it.
- **Three bands, one layer each:** fine grain · halftone/print · soft light wash. Two layers in the
  same band turn to mud.
- **Real reference only:** scanned paper, halftone, riso, print decay. Abstract noise looks uncanny.
  High-pass a scan to isolate its detail before overlaying.
- **Physical scale:** fix one pixels-per-centimetre for the film and tile large textures instead of
  stretching (stretched dots and fibres read as fake).
- **Texture is a quality equaliser:** a high-res halftone or grain over a low-res asset hides it.
- **The ground breathes:** the texture slides on a stepped wiggle (his rig) instead of sitting still.
- His texture recipe (`Texture.psd`): flat colour + a faded newspaper in Pin Light + paper ridges in
  Overlay. Code: `mix-blend-mode` stack or canvas `globalCompositeOperation`.

## 3. Colour cohesion

- **One palette, then map every asset into it:** duotone/tritone (image black → palette dark,
  image white → palette light) before any other treatment.
- **Never pure black or pure white.** Grounds are dark grey with a narrow tonal range; whites are
  off-white/cream (`#FAF8F1` in his paper world).
- **Never a flat solid ground.** Build it from supporting photos or scans of the subject, darkened
  and tinted, plus dust (his most-liked lesson on backgrounds). A flat fill "lacks identity".
- Depth for free: lower contrast in the background, higher in the foreground.

## 4. Time

- 12 fps for cut-outs and scene moves, 8 fps for page turns and paper, ~4 fps for edge boil; long
  eases (1–2 s) on top of the stepped clock. Choppy cadence plus slow settle is the signature.
- **Held random jitter, not smooth wiggle,** on position, rotation, scale and letters (stepped at
  8–12 fps; ~1 px for stills). Smooth wiggle reads as software.
- **Edge boil** on every stroke and callout: displacement re-seeded on a stepped clock
  (`seed = floor(t*4)` to `floor(t*8)`), amount ~5–33 px with turbulence size 2–62 (Pen/Pencil),
  or displace 80 / size 2 with a second slow wide wobble. Code: SVG `feTurbulence` +
  `feDisplacementMap`, `seed` stepped.
- Extreme ease (fast in, fast out) for energy; reserve it for one beat.

## 5. Type on paper

- One type effect on screen at a time.
- **Text belongs to its surface:** a tiny turbulent displacement (size ~2), a displacement map taken
  from the paper texture, and noise inside the glyphs at the texture's grain size.
- Print decay: rough edges + letterpress noise inside glyphs + a tiny blur (~0.5 px, ~) + a soft
  same-colour shadow for ink bleed.
- Print misregistration: R/G/B or ink layers offset ~1–2 px (~); riso: 2–3 inks on Multiply, 1–4 px.
- Letter animators from his presets: random-order pop-on; rise-and-fade 30 px over 12–17 frames
  (LoadUp); a cream fill wiping through the letters; per-letter stepped jitter; odometer lock-in.
- An accent colour can pop on arrival, then settle to charcoal.

## 6. Hand-drawn marks

- Stroke draw-on 0 → 100 % with ease-out on the 12 fps clock; taper the last stretch.
- Two Roughen Edges passes (border 2–10, scale ~10 and 62–103, sharpness 1.4–4.5) so the line is
  never vector-clean. Highlighter on Multiply. Pencil = rough edges; ink = photocopy threshold.
- Reveal by a threshold/choker animated from positive to 0 with rough edges, posterised: reveals
  feel torn and hand-cut ("burn" reveal on maps: threshold mask 100 → 0).

## 7. Camera and cuts

- **Cut at peak velocity:** two images share one eased scale move (B parented to A); cut where the
  curve moves fastest and keep the direction across the cut. Still cuts feel jarring.
- **Rack focus:** blur 0 → 8 → 18 → 5 → 0 px over 18 frames (his Focus panel), inside an eased
  100 → 200 % zoom of 30 frames (ease influence 80 %). A moving radial focus mask directs the eye on maps and documents.
- **Photos as filmed objects:** fringe blur, dust, vignette and a slow push (~4–8 % over the shot, ~); 2.5D parallax
  (fore/mid/background cut, hidden areas inpainted, spaced in depth, slow camera).

## 8. Screens and archive footage

- Screen recordings get three layers: scanlines (Overlay/Color Dodge, low), chromatic aberration a
  little heavier than elsewhere, a vignette. Laptop preset: pixel grid from two 6 px blinds at 16 %,
  curves lifting mids 128 → 181; retro preset: S-curve, lens bulge.
- CRT/low-res pass only on archive clips that do not match the rest; never on the whole film.

## 9. Sound

- Foley is half the look: paper rustle, marker, camera snap, click on every event.
- Music decides the read of the same cut: marimba = curious/playful, pizzicato strings =
  investigative. Bed neutral, out of the voice band.

## Where this meets the defaults

- **Stepped clock vs smooth camera.** He posterises the whole comp; the defaults keep the camera,
  corner pulls and recordings smooth (`motion-and-camera.md` §4). Keep the defaults for long camera
  travels (a 12 fps camera judders on a one-take table); step everything placed by hand.
- **Grain strength.** His 0.3 is After Effects grain intensity, not layer opacity; the engine's
  `grain` stays low (0.05–0.1 opacity) and gets its strength from contrast, per §2.
- **Chromatic aberration** is global and constant in his chain; the defaults keep it at the edges
  and occasional (`visual-language.md` §1, `motion-and-camera.md`). Keep the defaults' edge-only
  fringe unless a film adopts the global 1–2 px pass on purpose.
- **Cuts and palette mapping are per-film choices.** Cut-at-peak-velocity applies to films that cut;
  a one-take film moves the camera between stations instead. Duotone mapping of every asset is for
  films whose grade allows it; a film that keeps natural colour maps only its black-and-white
  sources.
- **Flicker and weave on everything** extends the defaults' "gate weave on stills": use both on the
  whole finished frame, tiny, so nothing in the film is perfectly still.
