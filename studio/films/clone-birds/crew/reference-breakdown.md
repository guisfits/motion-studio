# Reference breakdown: c7 "Birds Aren't Real" collage loop (5.005 s shot x3, 720x1280, 29.97 fps container, 12 unique frames/s)

Source: `inspirations/clone-candidates/media/c7.mp4` (Pinterest pin 735986764157506920). Study only; no media is copied into git.
Scratch (local, gitignored): `inspirations/clone-candidates/c7-work/` (frames `f/0000..0150.png`, sheets `sheet0-3.png`, grids `g1-g3.png`).

Conventions
- Frame `f` is **0-based** at the 29.97 fps container; `t = f / 29.97` s. Only frames 0-149 are described; the clip is that shot three times (f150 = f0, f300 = f0).
- Percentages: x of width (720), y of height (1280), top-left origin. Pixel values are at 720 wide.
- **Measured** = computed on the frames (mean abs diff on 144x256 grayscale; template matching with normalised cross-correlation (NCC) in numpy; pixel medians). `~` = estimate read by eye from the sheets/grids (+-5 % of the frame unless stated). Anything with neither mark is a fact read directly (text, counts).
- Tools: `tools/critique/motion-measure.py` and `camera-table.py` could not run (see section 11); every camera number here comes from my own NCC scripts (`/private/tmp/...` scratch, not kept), so treat those as the working measurement, not tool output.

## 1. Header (cadence, fps, loudness)

| Item | Value |
|---|---|
| Duration | 15.015 s = 3 x 5.005 s (150 frames each); this breakdown covers f0-149 |
| Size / fps | 720x1280 (9:16), 29.97 CFR (2997/100), H.264, 450 frames |
| Cadence | **Strict 5-frame period, 2 new images per 5 frames: new image at f = 5n and 5n+3 (measured over all 150 frames, zero exceptions)**. Holds are 3,2,3,2,... frames. Pattern per 5 frames `N H H N H` (frame diff between consecutive frames: 0.0-0.2 on holds, 3.8-65 on new frames). |
| Unique frames | **60 of 150 (40 %)**: 0,3,5,8,10,13,15,18,20,... ,143,145,148 |
| Effective fps | **12.0** (60 / 5.005 s); identical in every second, no bursts, no variable holds (unlike c5) |
| What steps | Everything: all layers, halftone screen and grain move together on the same 12 fps clock. A held frame is bit-near-identical (diff <= 0.2, compression only). |
| Grain / screen boil | New halftone/grain seed on every unique frame: static stretches (f10-21, f89-129) still differ by raw mean abs 4.7-10.3 between unique frames, but only 0.3-4 after a 6 px blur: the structure is static, the dot screen "boils" at 12 fps (measured). |
| Loudness | **-14.7 LUFS integrated, LRA 1.8 LU, true peak -4.3 dBFS** (measured over the full 15 s with ffmpeg ebur128; audio is the same 5.005 s three times, loop correlation 0.975-0.977). AAC 44.1 kHz stereo, 326 kb/s. |
| Baked UI overlay | Four small texts on every frame, never move: see section 7. |

## 2. Beat table (section 2 of the brief)

Phases follow the measured motion energy (mean abs frame diff per new frame): 27-38 (A) -> 4-7 (B) -> 24-40 (C) -> 15-29 (D) -> 6-14 (E) -> 24-39 (F). No cut inside the shot: every change is a continuous move or a layer entering. The only cut is the loop seam (section 8).

| # | Frames (0-based) | s | What changes | Entry type |
|---|---|---|---|---|
| A | f0-9 (new at 0,3,5,8) | 0.00-0.33 | Capitol (blue halftone) already full frame. "BIRDS AREN'T REAL" sign (A), "AVIAN SURVEILLANCE" sign (B) and the red-bird CCTV card slide/rotate in from the right/left edges and settle (ease-out, ~8 frames, no overshoot). Van slides in from the right. | animated (stepped) |
| B | f10-21 | 0.33-0.73 | Plateau: signs, card, van hold position (NCC: sign A at x474 y638 on f10, 13, 15, 18, 20, +-3 px; sign B +-3 px). Only the dot screen boils; dome swells ~+6 % (~). | hold |
| C1 | f22-29 | 0.73-0.97 | Signs leave: A drifts up-right (477,638 -> ~560,580 by f28) and is gone by f30; B rotates steeper and slides off left (f23 318,1028 -> f28 partly off). Capitol starts moving: centre x 376 (f24) -> 414 (f30). Van continues left. | animated |
| C2 | f30-61 | 1.0-2.03 | **Pull-back**: Capitol shrinks 100 % -> 34 % (dome width 450 -> 151 px), drifts right then back left (cx 414 -> 441 -> 402). Red crowd rises from the bottom edge (crowd top y ~87 % at f40 -> ~52 % at f60), tilted signs "FEATHERS ARE FAKE" and "BIRDS AREN'T REAL" (wood-grain placards) appear from f50/f58, dark tree (left) enters at f43-48 (x 0-12 %), scene rolls ~10 deg CW (~). | animated |
| D1 | f62-69 | 2.07-2.3 | Red biplane dives in from top-right (f63 ~ (667,73) -> f65 ~ (513,290) -> f68 ~ (377,340)). Banner starts unspooling behind it ("BIRD" at f68). | animated |
| D2 | f68-75 | 2.27-2.5 | **Giant pigeon swoops in** from lower right: eye x 667 (f70) -> 280 (f73) -> 236 (f75). Banner "BIRDS AREN'T REAL" fully out at f75 (~360 px wide, arched). | animated |
| D3 | f75-88 | 2.5-2.94 | Pigeon centres (eye y ~680 -> 656), plane flies left (x ~220 f75 -> ~170 f78) and leaves ~f83; banner follows to the left and exits by ~f98. Dark blurred foreground trees grow in at both sides from f78 (left top-left, right big mass), bush bottom-left from f85. Crowd inside the "lens" below the beak ("BIRDS ARE SPIES" sign, f68 on). | animated |
| E1 | f89-105 | 2.97-3.5 | Slow push, trees stay. Pigeon eye (~52 -> 48 px) blinks: white glare blob f100-105. | animated (slow) |
| E2 | f106-117 | 3.5-3.9 | Eye turns solid red (f108, d ~60 px), then a **red concentric reticle** (f113 outer ring d ~112 px, f118 ~160 px). Pigeon body rises (eye y 650 f108 -> 570 f113 -> 490 f118): the move reads as a tilt-up into the face. | animated |
| E3 | f118-130 | 3.94-4.34 | Robotic chest plate (white/blue coil, peach tubes) visible at lower centre from f113, CCTV camera on the beak (peach/cream body, red lens) from f120; reticle rings keep growing/rotating (f123 d ~180 px). Slow (diff 5.8-15). | animated |
| F | f130-148 | 4.34-4.94 | **Fast whip out**: reticle ring d 170 (f130) -> 200 (f135, f138) -> 260 (f140) -> huge, bottom-left, partly out of frame (f143). Pigeon slides down/left out of frame between f138 and f143; blurred trees drop out; the sharp wide street scene (Capitol, crowd, "FEATHERS ARE FAKE") is back at f143-148 with dome ~190-230 px. | animated |
| - | f149 (held with f148) | 4.97-5.005 | Held last frame. | hold |
| seam | f149 -> f150 | - | **Hard cut** back to f0 (diff 65.5, 2x the biggest in-shot step). | cut |

## 3. Layer list (back to front)

Source kind: all pictures are photo/clip-art **cut-outs** treated with a halftone screen and the duotone grade (section 6). All layers sit in one stepped image; nothing is smooth.

| # | Layer | Source kind | Size / position at key frames | Edge / rim | Red? |
|---|---|---|---|---|---|
| 0 | Sky (blue-cream, clouds) | photo, full bleed | whole frame; cream clouds ~ y 5-45 %; low-angle sky | none (plate) | no |
| 1 | Capitol + lawn/portico | photo cut-out (low-angle, facade slopes down to the right ~ +8 deg baked, ~) | f0-21: dome width ~ 420-450 px (~60 % W), finial at y ~ 0-1 %, cx ~ 370 (51 %); f30: 450 px, cx 414, top 0; f48: 280 px, cx 464, crop-top y 225; f60: 151 px, cx 402, y 411; f75: 95 px, cx 382, y 474 (measured, NCC) | clean cut against sky, no keyline | no (blue) |
| 2 | Tiny bird silhouettes | black cut-outs, 3-8 per frame, ~6-14 px | scattered across the sky, drift slowly | none | no |
| 3 | Back trees (left, f43-) | black/navy tree cut-out, sharp | f50: x 0-12 %, y 40-55 %; later behind the crowd at left | clean | no |
| 4 | Van (cream box truck, red "BIRDS AREN'T REAL" on the side, red satellite dish on the roof) | cut-out clip art, halftone | f0: cx ~700, f3 ~580, f8 ~480, f13-23 ~420-430 (~); f30: width ~470 px (65 % W), y 897-1200; f48: 244 px; f57: 169 px (measured, NCC) | clean cut | **yes**: red text + dish (#C3292E-ish) |
| 5 | Red-bird CCTV sign (bird silhouette with a camera head on a card) | cut-out, red silhouette on tan/olive halftone card (f3-25) that becomes white (f28+) | f10: card at x 0-38 %, y 62-81 %; f30: ~ x 0-34 %, y 78-94 % | straight paper edge | **yes** (red bird) |
| 6 | Handheld sign A "BIRDS AREN'T REAL" (white placard, navy frame, rotated ~ -30 deg, hand + stick at lower right) | type cut-out | settled f10-21: centre (474,638), ~ 63 % W x 31 % H bounding box (~450x400 px); f0 ~ (570,580) part off right | white placard, no shadow | no (navy) |
| 7 | Handheld sign B "AVIAN SURVEILLANCE" (white placard, rotated ~ -32 deg) | type cut-out | settled: centre (351,1048), ~ 70 % W x 36 % H | same | no |
| 8 | Crowd (red silhouettes, a few blue figures with raised arms) | photo cut-outs, red duotone | rises from bottom: top edge ~ 87 % H (f40), ~ 67 % (f50), ~ 52 % (f60), ~ 45-50 % (f65-148). Red-pixel share of frame: 0 % f0, 1.4 % f30, 6.6 % f50, 9.1 % f60, 9.6 % f70, then 2-4 % while the pigeon covers it (measured) | clean | **yes**, the main red mass |
| 9 | Placards in the crowd: "FEATHERS ARE FAKE" (white, black brush type, tilted ~ -20..-25 deg), "BIRDS AREN'T REAL" (white), "BIRDS ARE SPIES" (white/blue, navy type), small red-bird signs | type cut-outs | enter f50-58 from the bottom/left, then scale with the crowd; "BIRDS ARE SPIES" sits in the crowd just under the beak (x 8-20 %, y 62-74 % at f95) | straight | red bird icons only |
| 10 | Biplane (red body, navy wing/tail) | cut-out clip art, ~ 100 px (14 % W) | f63 ~ (667,73); f65 ~ (513,290); f68 ~ (377,340); f70 ~ (310,370); f75 ~ (220,370); f78 ~ (170,380); gone ~f85 | clean | **yes** |
| 11 | Banner "BIRDS AREN'T REAL" (cream cloth, navy heavy type, arched/wavy) | type on a shape, ~ 360x60 px (50 % x 5 %) | f68: only "BIRD" at ~x 366; f70 "BIRDS ARE"; f75 full at ~ x 360-720, y ~ 380-420 (~); f88 ~ x 70-330, y ~ 530-560; out by ~f100 | cloth edge cut | no (navy/cream) |
| 12 | **Giant pigeon** (blue-grey halftone, feather hatching) | cut-out photo, ~ 60-100 % of frame height | f70: eye (680,600) d ~ 68; f75: (236,680) d ~ 66; f78: (176,680); f85: (250,660) d ~ 56; f88: (376,656) d ~ 52; f95: (420,650) d ~ 48; f108: (484,650) red d ~ 60; head spans x ~ 15-75 %, y ~ 45-100 % at f88-135 | clean; a faint lighter rim on the right side of the head (~) | eye + reticle only |
| 13 | Robot parts on the pigeon | cut-outs: chest plate (white coil/gears, peach tubes), CCTV camera body on the beak (peach, red lens) | chest centre ~ (370,850) at f113-138, ~ 20 % W x 12 % H; camera lens ~ (190,540) f123, ~ 14 % W | clean | lens red |
| 14 | **Red reticle** (target: solid red disc, black ring, blue pupil + 3-5 thin red broken concentric arcs) | shape/vector, additive-ish over the eye | d (outer): f113 ~112, f118 ~160, f123 ~180, f130 ~170, f135 ~200, f138 ~200, f140 ~260 px; centre follows the eye: (370,570) f113, (324,490) f118, (370,480) f123, (400,510) f130, (380,530) f135, (370,560) f138, (260,660) f140 (all ~) | thin 2-3 px red arcs | **yes** |
| 15 | Foreground trees (dark navy, blurred) | cut-outs, 2-3 depth planes, defocused | enter f75-85; f88: left mass x 0-27 % (y 5-45 % + bottom-left bush from f85), right mass x 80-100 % (y 30-85 %); f100: left to x ~ 190 px, right from x ~ 585; they exit quickly f135-140 (dark pixel share 25 % f135 -> 20 % f140) | soft (blur) | no |
| 16 | Overlays (grade, screen, vignette, UI text) | full-frame | see sections 6 and 7 | | |

## 4. Motion per layer

Everything is quantised to the 12 fps cadence (section 1). Amplitudes are px at 720 wide (% of 720).

| Layer | Motion | Numbers | Feel |
|---|---|---|---|
| Sign A | slide + rotate in, hold, slide out | f0 (570,580)~ -> f3 (518,597) -> f5 (501,621) -> f8 (483,634) -> f10 (474,640) settled (measured NCC). Step sizes -52, -17, -18, -9 px: ease-out, ~10 frames. Exit f21-30: (477,638) -> f25 (507,624) -> f28 ~ (560,580) -> gone f30 | ease-out in, ease-in out; **no overshoot** (< 3 px = 0.4 %) |
| Sign B | slide + rotate in, hold, rotate-out left | f0 (190,840)~ -> f3 (280,1011) -> f5 (327,1030) -> f8 (348,1046) -> f10 (351,1048) settled. Exit: f23 (318,1028), f25 (261,1040), f28 half off left, near-vertical (~ -80 deg) | same; exit is a rotating slide |
| Hold jitter | none structural | settled signs vary < 3 px (0.4 %) f10-20; what reads as "jitter" at 6 fps is the 12 fps stepping + dot-screen boil | - |
| Red-bird card | enters from left f3-10, then rides the scene | tan card f3-25, white f28+ | - |
| Van | slides in from right, then follows the pull-back | cx ~700 (f0) -> 580 (f3) -> 480 (f8) -> ~425 (f13-23) (~); f30 486 (measured) -> f45 429 -> f57 375 (measured) | ease-out |
| Capitol (camera proxy) | slow swell, pan, pull-back | see section 5 | ease-in-out |
| Parallax vs Capitol | van/foreground shrinks faster | log-scale ratio van/dome 1.38 (f42), 1.37 (f48), 1.25 (f54) -> **~1.3x** (measured f36-54); van moves left -111 px f30->f57 while the dome centre moves +14 px | foreground = 1.3x the plate scale rate |
| Crowd | rises from the bottom, then scales with the foreground (1.3x) | top edge ~ 87 % H f40 -> 52 % H f60 (~) | ease-out |
| Biplane | dives in from top-right, then flies left | ~ -10 px/frame (-300 px/s) f68-78; dive f63->f65 ~ (-154,+217) in 2 frames | straight, fast |
| Banner | unspools from the plane's tail (mask wipe left to right), follows the plane left | "BIRD" f68 -> "BIRDS ARE" f70 -> "BIRDS AREN'T R" f73 -> full f75; arch ~ 8-10 deg tilt at the left end (~) | wave, no flutter |
| Pigeon | swoops in from the lower right, sinks back, then rises | eye x: 667 (f70) -> 280 (f73) -> 236 (f75) -> 176 (f78) -> 250 (f85) -> 376 (f88) -> 420 (f95) -> 484 (f108); eye y: 600, 673, 680, 680, 660, 656, 650, 650; then **y 570 (f113), 490 (f118), 480 (f123), 510 (f130), 530 (f135), 560 (f138), 660 (f140)** (~, +-15 px) | f70-73 snap (3 frames), f75-108 slow, f108-118 fast rise (~ 16 px/frame) |
| Pigeon scale | shrinks while the camera backs off, then holds | eye d 68 (f70), 66 (f75), 56 (f85), 52 (f88), 48 (f95-108) ~ -30 % over f75-95; then reticle grows | - |
| Foreground trees | grow in from the edges (scale-up/approach), then drop out | left top-left f78 (x 0-90 px, y 0-200) -> f100 (x 0-235) ; right from x 435 (f78) -> 572 (f88) -> 585 (f100) -> 608 (f120) -> 652 (f140) (dark-mask extents, measured on 30-70 % H rows) | slow drift, then quick exit |
| Reticle rings | outer ring grows, arcs rotate | d 112 -> 260 px f113-140 (~); at f143 a huge ring crosses the lower-left corner (~ 300+ px) | ease-in (accelerating), pulse |

## 5. Camera

No real camera: one comp-scale (and a small roll) on the whole scene group; foreground layers add parallax. Proxy = Capitol dome width (NCC, template from f30, f48 for the later ones). `scale` is relative to f30 = 1.00 (dome width 450 px). "crop-top y" is the y of the template's top edge (the dome crop), not the finial.

| Frame | dome width px | scale (f30 = 1) | dome cx px | crop-top y | Notes |
|---|---|---|---|---|---|
| 0 | ~ 420-450 | ~ 0.95-1.0 | ~ 372 | ~ 0-12 | NCC .88; signs cover the base (low confidence) |
| 10-21 | 441-459 | ~ 0.98-1.02 | 370 | 0 | static, a slight swell by eye (+~6 %, ~), NCC .82-.87 |
| 24 | 441 | 0.98 | 376 | 0 | pan starts |
| 27 | 441 | 0.98 | 388 | 0 | |
| 30 | 450 | 1.00 | 414 | 0 | |
| 33 | 432 | 0.96 | 429 | 18 | zoom out starts |
| 36 | 414 | 0.92 | 441 | 42 | |
| 39 | 396 | 0.88 | 450 | 66 | |
| 42 | 369 | 0.82 | 472 | 102 | |
| 45 | 297 | 0.66 | 471 | 180 | (f48 template) |
| 48 | 280 | 0.62 | 464 | 225 | |
| 51 | 252 | 0.56 | 456 | 267 | |
| 54 | 218 | 0.48 | 441 | 312 | |
| 57 | 190 | 0.42 | 428 | 351 | |
| 60 | 151 | 0.34 | 402 | 411 | fastest step (-0.14 per 3 frames) |
| 63 | 134 | 0.30 | 396 | 429 | |
| 66 | 123 | 0.27 | 392 | 444 | |
| 69 | 123 | 0.27 | 388 | 450 | |
| 72 | 112 | 0.25 | 386 | 459 | |
| 75 | 95 | 0.21 | 382 | 474 | last reliable NCC (.88); pigeon hides the dome after |
| 78-108 | ~ 85-110 | ~ 0.2-0.25 (~) | ~ 350-380 (~) | ~ 470-520 (~) | read by eye on the grids (dome behind the pigeon's head); camera ~ static in scale |
| 113-138 | hidden | - | - | - | pigeon/reticle fills; the "push" is the pigeon rising (eye y 650 -> 480) + reticle growth, not a dome scale |
| 140 | ~ 80 (~) | ~ 0.18 | ~ 390 | ~ y 480 centre | Capitol re-appears at top centre |
| 143 | ~ 100-110 (~) | ~ 0.23 | ~ 190-230 (~) | - | |
| 145 | ~ 160 (~) | ~ 0.36 | - | - | |
| 148 | ~ 190-230 (~) | ~ 0.45 | ~ 410 (~) | - | wide street shot; NCC attempts here were unreliable |

- **Zoom**: 1.0 (f0-24) -> 0.21 (f75) = x4.7 pull-back over f24-75, ease-in-out, steepest at f54-60; then hold ~ 0.2-0.25 to f138; then ~ x2 push back toward 0.45 in f140-148 (reads as the pigeon whipping away). Per-3-frame ratio f30-60: 0.96, 0.96, 0.96, 0.93, 0.8 (f42-45 step in the f30-template, differs from the f48 template), 0.94, 0.9, 0.87, 0.88, 0.80.
- **Pan**: dome cx 370 -> 472 (f21-42, +102 px = +14 % W, to the right), then back 472 -> 382 (f42-75, -90 px). The foreground (van) moves the opposite way: 486 -> 375 (f30-57).
- **Roll/tilt**: the dome crop never needed rotation in the NCC rotation search (best +0 deg for f45-75), but the facade baseline visibly slopes: ~ +7 deg (f45) -> ~ +10-13 deg (f58-63) (descends to the right), dome axis leans right ~ 3-7 deg (~). Treat as a baked Dutch-angle photo plus the scene roll ~ 0 -> +10 deg CW over f30-63 (~), back to ~ +5 deg by f75.
- **Tilt-up**: f108-118 the pigeon moves up 160 px (22 % of 720 / 12.5 % H); there is no separate camera tilt measured.
- `camera-table.py` could not run (no cv2); this table is the substitute.

## 6. Look

| Item | Value |
|---|---|
| Grade | **duotone navy-to-cream with a hard red accent**. Blacks: **#00001B - #000131** (2nd percentile median, f30; #000016 f88; #000011 f125). Highlights: **#E8ECDA (f30), #EFEFD2 (f88), #F0EED3 (f125)** (top 2 % median) = warm cream/white. Sky blue median ~ **#B2C4BD** (green-grey, mixed with the dot screen); cloud cream ~ **#E8ECDA**. Capitol/pigeon mid-tone blue median ~ **#8FB1D3** (dome), **#8DA2BF** (chest), feather ~ #88769E (violet cast, mean #796E8E). Foreground trees median **#212741**, darkest ~ #0A0D24. Paper white of the placards **~ #D3D4BF**. Luminance percentiles (f30): p2 4, p10 10, p50 158, p90 215, p98 228 (full-range, not compressed). |
| Red accent | **#C3292E** (crowd median); saturated reds measured at **#BA0F1B (f30), #B81323 (f88), #C2101F (f125)**. Use `~#BC1020` for solid red (reticle, plane, van type, bird sign) and `~#C3292E` for the crowd (halftone lightens it). Red-pixel share (R>150, G<90, B<90): 0 % f0, 1.4 % f30, 6.6 % f50, 9.1 % f60, 9.6 % f70, 2.0 % f80, 2.2 % f90, 3.2 % f100, 3.6 % f125, 2.2 % f140. Red enters with the van/bird sign (f0-10), grows with the crowd (f40-70), then shrinks behind the pigeon; the reticle brings the second wave (f108+). |
| Halftone | **dot screen with ~ 5.4 px pitch (0.75 % W), rotated ~ 36 deg** (FFT peak on two sky/dark patches: 5.4 px; one patch 3.8 px). In the sky the dots are ~1 px navy specks on cream; in blue/dark areas the screen is coarse ink dots (dot diameter ~ 2-4 px). It covers every layer, including the red crowd and the type, and re-seeds each unique frame. |
| Grain | fine photographic grain on top of the screen; cannot be separated from the dots by std (flat sky patch high-pass std 8.5, patch with dots 23-28). Re-seeded each unique frame like the screen. |
| Vignette | strong, dark corners: corner/centre luminance **0.73 (f0), 0.76 (f30), 0.58 (f100), 0.59 (f140)**; f60 reads 1.01 because red/dark content in the corners. Use a radial multiply ~0.6-0.75 at the corners (~). |
| Blur / DOF | foreground trees: strong defocus, ~ Gaussian sigma 10-14 px (~), 2-3 planes (far tree smaller/softer at the right edge, big near bush bottom-left); pigeon and everything else sharp. Tilt-shift-like: sharp band across the middle. |
| Chromatic aberration | none measurable: best global shift between R and B channels is (0,0) px (min mean abs diff 41.7 at 0 shift). |
| Flicker | mean luminance (every 5 frames) 119-146; no strobe. Brightness steps: 137 at f0-10, 120-122 at f90-125 (dark trees), 133-146 at f135-145 (sky returns). The only flashes are the white eye glare f100-105 and the reticle arcs. |
| Light leak / other | slight cream glow on the sky (screen blend, ~ +10 %, ~); none seen on the type. |

## 7. Type

| Text | Where | Font style | Colour | Size / placement |
|---|---|---|---|---|
| "BIRDS / AREN'T / REAL" (sign A, 3 lines) | placard, rotated ~ -30 deg | condensed bold geometric grotesque in all caps (DIN-condensed / Barlow Condensed Bold look), letter-spaced slightly, inside a square navy frame ~ 14 px thick (frame is part of the card) | navy ~ #1F2A6B-ish ink (halftone, appears #8CA6CB mean at 720) (~) | cap height ~ 60-70 px, 3 lines ~ 190 px tall (26 % H) |
| "AVIAN / SURVEILLANCE" (sign B) | placard, rotated ~ -32 deg | same face, "AVIAN" very large (~ 110 px cap), "SURVEILLANCE" ~ 40 px cap, tight | navy | no frame |
| "BIRDS / AREN'T / REAL" on the van | van side, horizontal | heavy condensed sans, all caps, 3 lines | red ~ #C3292E | ~ 40 px cap, ~ 150x150 px block |
| "FEATHERS ARE / FAKE" | tilted placard f50+, ~ -20 deg | **hand-lettered brush / marker caps** (italic ink look) | black/navy | "FAKE" ~ 55 px cap at f60 (shrinks with scale) |
| "BIRDS ARE / SPIES" | placard held in the crowd, f68+ | condensed bold sans, caps ("SPIES" larger) | navy on white-blue | ~ 25 px cap at f95 |
| "BIRDS AREN'T REAL" (small placards in the crowd, f58+) | white boards | monoline/semi-bold sans caps, 3 lines | black ~ #222 | ~ 20 px cap (shrinking) |
| "BIRDS AREN'T REAL" (banner) | plane banner, arched | heavy condensed black (Impact/Anton-like) caps | navy ~ #0E1445 | one line ~ 360 px wide, cap ~ 30 px |
| "@mondayschallenge" | **baked overlay, top-left**, x 36-188, y ~ 233 (13 % H below the top) | light geometric sans (Outfit/Poppins Light look), ~ 17 px x-height ~ 12 px | white ~ 70 % opacity (~) | static, unchanged all 150 frames |
| "#9" | top-right, x 665-685, y ~ 233 | same | same | static |
| "Theme of the week" | bottom-left, x 38-175, y ~ 1048 | same | same | static (hidden under sign B at times) |
| "Top Secret" | bottom-right, x 608-690, y ~ 1048 | same | same | static (hidden under sign B/van at times) |

The four overlay texts are part of the source's frame (Pinterest challenge template); decide in the clone whether to omit or restyle them (not product copy).

## 8. Loop seam (f149 -> f150)

- f148 and f149 are the same image (last hold, wide street shot: dome ~ 190-230 px, crowd in the lower half, "FEATHERS ARE FAKE" tilted placard left, reticle gone); f150 is **identical to f0** (diff 2.9 = compression noise; f0 vs f1: 0.01).
- The step f149 -> f150 has mean abs diff **65.5** (largest step in the shot; the next largest in-shot is 40.1 at f27). It is a **hard cut**, not a dissolve and not a continuous loop: the Capitol jumps from ~ 0.45 to ~ 1.0 scale, signs reappear mid-entry, the pigeon is gone.
- The cadence phase is continuous across the seam: 150 = 5 x 30, so f150 is a new-image frame (5n), exactly where the pattern wants it.
- Audio: also loops (corr 0.975); the music restarts at the seam (see section 9). Last rms window falls to ~ 12 from ~ 20 (partly the window edge).
- Clone: render exactly 150 frames, last frame held; the container loops it.

## 9. Music

Method: spectral-flux onsets + autocorrelation on the 22.05 kHz mono mix of the first 5.005 s (numpy only; librosa is not installed). No narration; no lyrics are transcribed here.

- **Tempo ~ 131 BPM** (beat 0.459 s = 13.7 frames): autocorrelation peaks at 65.4 BPM (0.917 s, the strongest, in all three bands) and its double 130.8 BPM (0.459 s); low band also shows ~ 136 (0.441 s), weaker. 8th-note spacing 0.23 s (6.9 frames) confirmed by four onsets at 4.14, 4.38, 4.60, 4.83 s. Treat 130-132 BPM as measured, half-time feel at 65 BPM.
- 5.005 s = 10.9 beats: the loop does not land on a bar line; the music is cut at the loop (copy 2 and 3 are identical). ~ 2.7 bars.
- **Feel/instrumentation (by ear from spectrum, ~)**: dark, tense electronic bed; sub bass + low kick (24 % of energy < 150 Hz), mid-heavy synth/pluck and/or vocal-less pad (31 % 500 Hz-2 kHz, centroid 1.76 kHz), a little hi-hat/shimmer (8 % > 6 kHz), no loud drums. A light riser/build.
- **Energy** (rms x100 per 0.25 s): 5.9, 8.0, 10.2, 9.3, 10.9, 14.5 (0-1.25 s, quiet, intro), 11.3, 8.8, 10.8 (1.5-2.25 s), **17-21 from 2.25 s to the end** (loud, flat). The jump at 2.25 s = **f67-68**, the biplane/banner/pigeon entry.
- **Onsets (broadband, frames at 29.97)**: f8 (0.27 s, strongest, = end of the sign entry: f8 is the settle step), f23 (0.77 s, = sign exit start), f36 (1.20 s, = pull-back under way), f58 (1.93 s) and f63 (2.10 s, = plane enters f63), then a 4-hit run **f124, f131, f138, f145 (every 7 frames = 8th notes)**, which sit in the fast end phase (f130-148) and the reticle ring growth (f123, f130/135, f140/143).
- Visual beats vs music: pigeon swoop (f70-73) and the loud section (f67) match; the red eye (f108) and the reticle (f113) fall on no strong onset (nearest low-band hits f106, f110, f117); the f124-145 hit run drives the whip-out. The sign entry (f0-10) has its one strong hit at f8.

## 10. Clone rules

1. **Render 30 fps (or 29.97), 150 frames, 720x1280**. Quantise every animated value and the screen/grain seed to the 12 fps clock: `q(f) = 5*floor(f/5) + (f%5 >= 3 ? 3 : 0)`; drive all layers from `q(f)`. (New image at f = 5n and 5n+3, holds 3,2,3,2.) No motion blur, no 60 fps interpolation.
2. **Everything steps together** (picture layers, screen, grain, vignette flicker). Static overlays (4 UI texts) do not re-seed.
3. **Re-seed the halftone/grain every unique frame**; screen pitch ~ 5.4 px, rotated ~ 36 deg, applied over all layers including type and red.
4. **One scene group with one scale**; foreground layers (van, crowd, signs) use scale exponent ~ 1.3 relative to the Capitol plate (log-scale ratio, measured); keep them as cut-outs.
5. Easing: entries ease-out ~ 8-10 frames, **no overshoot**; pull-back ease-in-out (steepest f54-60); pigeon swoop 3 frames (f70-73); reticle growth accelerating.
6. Duotone first (navy `#00001B`..`#0A0D24` shadows, cream `#E8ECDA`..`#F0EED3` highlights), **red `#BC1020` only on van type/dish, bird sign, crowd (`#C3292E`), plane, reticle**; no other colour.
7. Foreground trees defocused (sigma ~ 10-14 px at 720), two or three planes; blur only these.
8. Strong vignette (corners ~ 0.6-0.75 of centre); no chromatic aberration.
9. Type: condensed bold sans caps for signs, brush caps for "FEATHERS ARE FAKE", heavy condensed for the banner; all **navy on white**, van type in red. Signs rotated ~ -30 deg.
10. The last frame is a **hard cut** to f0; do not crossfade or ease the loop. Match the first frame to the last held frame pattern (150 divisible by 5, already phase-aligned).
11. Music ~ 131 BPM; the quiet intro f0-67, the loud body f68-149; put the 4-hit run (7 frames apart) on f124-145.

## 11. Not measured / open, and tool problems

- `tools/critique/motion-measure.py` fails at import: `ModuleNotFoundError: No module named 'cv2'` (not installed in `~/.venvs/mlx` or any other venv I found); `camera-table.py` needs its CSV, so it cannot run either. I did not install anything.
- NCC template matching is only trustworthy while the template stays visible and un-occluded: f0-8 (signs cover the base), f28 onwards for the dome until f75, and f30-57 for the van. Pigeon/dome numbers for f78-148 are by eye (`~`); automated attempts there returned garbage (ncc ~ 0.6-0.8 at the minimum scale), so they were dropped.
- Scene roll is estimated from the facade slope, not fitted. Banner arch angle, tree blur sigma and vignette strength are by eye.
- Not checked: whether the c7 audio contains vocals (no lyrics transcribed, none needed).
