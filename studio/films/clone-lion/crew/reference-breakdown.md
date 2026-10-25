# Reference breakdown: c8 "Be A Lion Among Sheep" collage reel (8.033 s, 720x1280, 30 fps, 241 frames, every frame unique)

Source: `inspirations/clone-candidates/media/c8.mp4` (Pinterest pin 735986764157487614). Study only; no media is copied into git.
Scratch (local, gitignored): `inspirations/clone-candidates/c8-work/` (frames `f/0000..0240.png`, grids `g1-g3.png`, crops `c1-c5.png`, `spec.png` spectrogram, `mm/` motion-measure output, `cam.ts`, scripts `track.py layer.py chain.py nose.py ymask.py title.py`).

Conventions
- Frame `f` is **0-based** at 30 fps; `t = f / 30` s. The clip has 241 frames (video stream 8.033 s; the AAC stream is 8.057 s).
- Percentages: x of width (720), y of height (1280), top-left origin. Pixels are at 720 wide.
- **Measured** = computed on the frames: mean abs diff on 144x256 grayscale, multi-scale/rotation normalised cross-correlation (NCC, `cv2.matchTemplate` TM_CCOEFF_NORMED) with a template cut from f200 (sharp, final composition) or chained from f0 for the front head, HSV masks for colour, ffmpeg ebur128 and numpy STFT for sound. Scale values are quantised to 0.0125-0.05 steps, positions +-3 px. `~` = estimate read by eye from the grids/crops or a measurement I judge soft (reason given). Anything with neither mark is a fact read directly (text, counts).
- "Plane" = a group of layers that share one parallax rate (section 4). "Scale" of a plane = its NCC scale relative to the f200 frame (f200 = 1.00), so it is the size of that content as it appears in the final composition.
- Tools: `motion-measure.py` and `camera-table.py` ran (`MOTION_STUDIO_PY`, OpenCV present). Their output is a single global camera dominated by the back/mid planes; the per-layer tracks below are my own NCC scripts (section 5 compares the two).

## 1. Header (cadence, fps, loudness)

| Item | Value |
|---|---|
| Duration | 8.033 s video (241 frames), 8.057 s audio; no loop (section 8) |
| Size / fps | 720x1280 (9:16), **30 fps CFR**, H.264 ~1.18 Mb/s, AAC 44.1 kHz stereo 64 kb/s |
| Cadence | **Smooth 30 fps: every frame is a new image.** Frame-to-frame mean abs diff (144x256 gray) is > 0.07 on all 240 steps (only f1 = 0.08, f2-4 = 0.39-0.46, f173-176 = 0.34-0.41 are near-still; none is a duplicate). Motion energy (mean diff per frame) over 1-s windows: 3.7, 3.0, 2.8, **7.5**, **6.3**, 2.1, 1.0, 1.8 (measured). Peaks: 6.2 (f25-31), **8.3 (f104)**, 7.6 (f138), 7.2 (f151, the yellow clear). Stillest: f53-59 (0.5-0.9) and f170-177 (0.3-0.6). |
| Unique frames / effective fps | **241 of 241 (100 %), 30.0 fps** (measured). No stepping, no 12/15 fps cadence, no held frames (unlike c5/c7). |
| Grain / screen / boil | **None.** High-pass (sigma 3) std on a flat white patch is 0.18-0.25 (compression only); no halftone, no film grain, no re-seeded noise (measured, f0, f60, f100, f200). |
| Loudness | **-26.6 LUFS integrated, LRA 11.0 LU, true peak -6.6 dBFS** (measured, ffmpeg ebur128, full file). The low LRA-driving structure is the quiet pre-roll: f0-65 (0-2.2 s) = -33.2 LUFS, peak -20.1 dBFS; f69-240 (2.3-8.0 s) = **-24.6 LUFS**, peak -6.6 dBFS (measured). L/R correlation 0.94 (near-mono, mid/side rms 0.18). |
| Baked UI overlay | **None** (no handle, hashtag or counter on any frame, checked on 16 sampled frames) |

## 2. Beat table

Phases follow the measured motion energy and what changes on screen. Frame numbers are the first frame in which the change is clearly visible.

| # | Frames | s | What changes | Entry type |
|---|---|---|---|---|
| A | f0-4 | 0.00-0.13 | Opens already moving-in: diffs 0.1, 0.4, 0.4, 0.5, 1.3 (ease-in from rest). Frame = B&W composition seen small and **soft** (sigma ~4-6 px): black lion (tilted ~25 deg CCW) with yellow marker bars across its torso and an open yellow L/bracket outline under it, small flock left and right, a pale ghost tree behind; **a large sheep head in front, soft, nose at (540,890)**, occupying the lower 45 % of the frame. White ground. | hold -> ease-in |
| B | f5-45 | 0.17-1.5 | **Push-in + roll**: the front head rises and grows (nose y 892 -> 683, scale 1.00 -> 1.37, peak speed -8.8 px/f at f20-25), the back plane (lion, flock, yellow) grows x1.09 (0.78 -> 0.85), rises ~48 px and **rotates ~25 deg back to level** (rot 25 deg at f0-10, 20 at f10-15, 15 at f20, 10 at f25-30, 5 at f35-40, 0 from ~f45; peak ~0.65 deg/f at f25-35 per motion-measure). Yellow bars slide off the torso and collapse upward to the lion's head/mane (yellow px 2.3 % -> 3.5 % of frame at f48-52). | animated, ease-in-out |
| C | f45-65 | 1.5-2.17 | **Plateau on the sheep face** (nose y 683-682 f45-60, only scale creeps 1.37 -> 1.48). The lion lowers behind the head until only its mane/face shows above the ears (y ~ 300-340), going from soft to sharp (sigma 3 at f45 -> 0 at f60). **Paper strip fades in blurred at f44-48** (gray 248 -> 228 in ~4 frames) with a pale yellow brush wash behind it; strip goes sharp f60-64; red "Note To Self" first red pixels f60-62 (x 320-407). | animated |
| D | f65-84 | 2.17-2.8 | **Music drops at f68** (audio section 9). **Title starts writing**: first red title pixels f68 (x 186-199), a scribbled "B" completes by f82; "Note To Self" shows a doubled ghost f66-74. Head begins to fall (nose y 682 -> 739 at f80, speed 3 -> 6 px/f), back plane ~still. | animated |
| E | f85-110 | 2.83-3.67 | **Head falls out the bottom fast** (accelerating): nose y 780 (f85), 837 (f90), 910 (f95), 1002 (f100), 1114 (f105); speed 11 -> 14.6 -> 18.4 -> **22.4 px/f**; scale keeps growing 1.70 -> 1.99; tracker loses it at f106 (nose below the frame). Behind it the lion is fully revealed (sharp from f60), then the **front flock** appears under the lion as the head clears: black-face sheep visible f108 (c 374,682), lamb f118 (c 492,884). Title "Be A L" -> "Be A Lion" (f92-108). Motion energy peaks 8.3 at f104. | animated |
| F | f110-126 | 3.67-4.2 | Head's last blurred wool slides off the bottom (still faint grey at the f124 bottom edge, gone by ~f128). Whole back plane + crowd drift down (lion y 377 -> 413), title writes "Be A Lion Am". **Yellow starts to fill in**: coverage 2.0 % (f108) -> 4.8 % (f124). | animated |
| G | f126-140 | 4.2-4.67 | **Yellow paint wipe 1** sweeps top to bottom: horizontal "hi-vis vest" bands across the lion torso (f124-128), then across the ram/black-face row (f130-136), then the lamb (f138-140). Coverage 5.9 % (f128) -> 10.4 % (f132) -> **17.3 % (f136)**. Strip/title glitch (echo + horizontal smear) f136-142, strongest f139-141. | animated |
| H | f140-152 | 4.67-5.07 | **Solid yellow fill** on lion mane/head, lamb and the right-hand sheep (peak 20.1 % at f145), then **clears left to right** (left edge x: 42 f140, 292 f142, 345 f148, 389 f150, 512 f151) and is **gone at f152** (14.8 % f150 -> 7.9 % f151 -> 0 %). Title finishes writing at f152. | animated, hard end |
| I | f152-176 | 5.07-5.87 | Settle: all planes decelerate to a stop (lion y 543 -> 562 centre, speed < 0.5 px/f by f168; diffs 2.8 -> 0.3 at f170-177). Title complete. | ease-out |
| J | f177-240 | 5.9-8.03 | **Final composition holds ~2.7 s as a slow push-in** (lion plane scale 0.97 -> 1.04, +7 %, accelerating: motion energy 0.6 -> 1.7); lamb (front crowd) drifts down +68 px, strip drifts left 20 px, a few glitch echoes on the strip text (f177-180, f214-230, `~`). No new element. Ends on f240 (hard end, audio fades over the last ~6 frames). | animated (slow) |

## 3. Layer list (back to front)

Source kind: **photo plates and photo cut-outs, grayscale**, composited on a flat white ground, no keyline, no drop shadow, no paper grain. Cut edges are soft/clean because the sheep and lion plates were shot on snow/white; feet melt into a pale snow floor (bottom of the frame #F6F6F6). Everything except the yellow, the red title and the lion's eyes is neutral gray (mean |R-B| 2.0-4.9, sheep mean RGB 196/196/196, measured). Size/position are at 720 wide; "c" = centre of the matched template.

| # | Layer | Source kind | Size / position at key frames | Edge / rim | Yellow? |
|---|---|---|---|---|---|
| 0 | Ground | flat white | full frame, **#FCFCFC** (252) at the top, **#F6F6F6** (246) at the bottom snow | none | no |
| 1 | Pale ghost tree | cut-out tree silhouette, ~10 % contrast | f200: x 590-716, y 195-419 (126x224 px); gray ~#E9E9E9-#EFEFEF on #FCFCFC. Tracked c (569,167) f40 -> (603,167) f50 -> (630,229) f120 -> (645,306) f160 -> (653,306) f200; scale ~0.9 (f50-70) -> 1.0 (f160) -> 1.05 (f240) | none (fades to the ground) | no |
| 2 | **Back flock** (small sheep left/right/behind the lion: pale left sheep, dark-face sheep, ram head behind the mane) | photo cut-outs, soft at f0-60 (sigma ~3-5 `~`), sharp after | ride the lion plane (same scale/rotation); at f200 left pale sheep c (84,590) 0-170 x 490-690, ram head c ~ (120,495) | clean | f84-124: two sheep at far left turn yellow (`~`) |
| 3 | **Lion** (black, grey mane, standing, 3/4 to camera, violet glowing eyes) | photo cut-out; eyes = added violet glow | f200 bbox x ~30-690 (660 px = 92 % W), y 410-870 (460 px = 36 % H); head+mane template centre (595,497). Tracked (head-template centre, scale, rot CCW): f0 (414,364) 0.78 25; f10 (420,360) 0.78 20; f20 (438,342) 0.80 15; f30 (470,321) 0.83 10; f40 (510,316) 0.85 5; f85 (552,331) 0.88 0; f90 (556,340) 0.90; f100 (560,355) 0.90; f110 (564,377) 0.93; f120 (568,401) 0.93; f140 (578,455) 0.95; f160 (586,493) 0.98; f200 (595,498) 1.00; f240 (590,496) 1.04-1.05. Hidden behind the sheep head from ~f40 to ~f95 except mane/face above the ears (y ~ 285-340, mane c (517,280) f40 -> (551,284) f60 -> (560,292) f85) | clean cut, mane fades softly into white at its lower tips | **yes**: marker bars f0-44; stripes f112-128; band + fill f124-150 (mane/head solid) |
| 4 | **Paper strip** (torn-edge notebook paper, two thin ruled lines, "Note To Self" above the title) | photo of lined paper, paper beige | f200: x 118-587 (470 px = 65 % W), y 330-439 (110 px = 8.6 % H), centre (353,382). Tracked c/scale: f48-60 ~ (314,234) ~1.1 (blurred, `~`); f76-84 (326,232) 0.90; f92 (328,242) 0.90; f110 (334,274) 0.93; f130 (341,323) 0.95; f150 (342,367) 0.95; f170 (349,386) 0.98; f200 (353,382) 1.0; f240 (332,372) 1.05 | slightly irregular/torn ends, no shadow; a faint white crack near x ~ 230 | pale yellow wash behind/over it f44-130 |
| 5 | Title text (red script) | hand-drawn write-on, section 7 | f200: "Note To Self" x 318-411 y ~345-365 (small, 93 px wide); "Be A Lion Among Sheep" x 160-579 (420 px = 58 % W), y 374-419 (46 px tall) | n/a | n/a |
| 6 | **Front flock** (ram with curled horns, black-face sheep, second white sheep, big right sheep, lying lamb) | photo cut-outs, sharp from first sight | revealed from behind the head f106-118. f200 c: black-face (382,907) ~ 115x185 px; ram (250,862) ~ 220x275; right sheep (632,880) ~ 175x240; **lamb** (534,1120) ~ 310x260 (43 % W) (sizes are my template boxes, `~`). Scales .88-.95 at reveal -> 1.0 at f200 -> 1.04 at f240 | clean | **yes**: bands then fill f124-150 |
| 7 | Left crowd edge (black-face sheep at far left, bottom edge) | photo cut-out | f200: x 0-135, y 790-1150 (19 % W x 28 % H) | clean | f127-140 band only |
| 8 | **Front sheep head** (white sheep, head + chest of wool, ears, dark nose; soft focus, no sharp variant exists) | photo cut-out, pre-blurred | **f0 nose (540,890) = 75 %/69.5 %**, face width ~445 px (62 % W), chest/wool fills the bottom 20 % and spreads x 40-720. Nose track (cx,cy,S): f10 (534,889,1.02); f20 (500,832,1.06); f30 (472,745,1.17); f40 (470,690,1.31); f50 (476,682,1.39); f60 (478,682,1.45); f70 (484,694,1.51); f80 (495,739,1.63); f90 (511,837,1.77); f100 (522,1002,1.91); f105 (522,1114,1.99); gone ~f106-126 (face width at f105 ~ 885 px, wider than the frame) | soft (sigma 6 px at native size) | yellow marker L-shape on its forehead f0-30 only |
| 9 | Yellow marker layer (f0-80) | painted/marker strokes, flat yellow | f0: 5 vertical bars (~14-20 px wide, 110-130 px tall) on the lion torso, a long open L/bracket outline below it at x ~ 220-420, y ~ 520-770, and zigzag at right x ~ 480-580, y ~ 440-600; rides the back plane (rotates with it); at f40 collapses to the mane (x 440-600, y 270-330) | flat fill, hand-drawn feel | **is** yellow |
| 10 | Pale yellow wash | huge translucent brush shapes (3-4 vertical slashes, ~ 50-100 px wide) | behind/over the strip and tree, top 0-30 % of the frame, f44-130, colour **#FAF4D1-#FCF5D1** (pale lemon, ~25-35 % opacity `~`); at f48-56 they look like giant letters | soft | yes (pale) |
| 11 | **Yellow paint wipe** | flat #F5DA3E layer, colour-style blend over the cut-outs only (white ground stays white) | f124-152, section 6/9 | hard stripe edges | **is** yellow |

## 4. Motion per layer

Everything is smooth at 30 fps. px at 720 wide; "px/f" = per frame.

| Layer | Motion | Numbers | Feel |
|---|---|---|---|
| Front head | rises + grows (push-in), plateau, then accelerates down and out | nose y: 892 (f5), 868 (f15), 832 (f20), 788 (f25), 745 (f30), 710 (f35), 690 (f40), 683 (f45), 682 (f50-60), 694 (f70), 739 (f80), 837 (f90), 1002 (f100), 1114 (f105). Speed px/f: -4.2 (f10-15), -7.2, **-8.8 (f20-25)**, -8.6, -7.0, -4.0, -1.4, -0.2 (f45-50); then +0.2 (f60-65), +1.8 (f65-70), +4.5 (f75-80), +11.5 (f85-90), +14.6, +18.4, **+22.4 (f100-105)**. Scale S 1.00 (f5), 1.06 (f20), 1.17 (f30), 1.31 (f40), 1.45 (f60), 1.63 (f80), 1.77 (f90), 1.91 (f100), 1.99 (f105) | rise = ease-in-out bell (peak f22-28, over ~f5-48); fall = pure ease-in (accelerating, no stop). **No overshoot** (nose y never drops below 682). |
| Back plane (lion, back flock, ghost tree, marker layer, strip) | f0-45: grows, rises, un-rolls; f45-85 nearly still; f85-160 drifts down; f160-240 settles then slow push | lion head-centre: x 414 -> 510 (f0-40), -> 552 (f85), -> 586 (f160), 595 (f200); y 364 (f0), 342 (f20), 321 (f30), 316 (f40), 331 (f85), 355 (f100), 401 (f120), 455 (f140), 493 (f160), 498 (f200). Rot 25 -> 0 deg by ~f45. Scale .78 (f0) -> .85 (f40) -> .90 (f90) -> .93 (f110-120) -> .98 (f160) -> 1.00 (f200) -> 1.05 (f240). Drift down f90-160: +153 px (2.2 px/f, peak ~3 px/f at f110-125) | ease-in-out; settles with ease-out at ~f165 |
| Strip | fades in blurred (f44-48), focuses (f60-64), then rides the back plane | cy 232-242 (f76-92) -> 254 (f100) -> 274 (f110) -> 296 (f120) -> 323 (f130) -> 367 (f150) -> 386 (f170) -> 382 (f200) -> 372 (f240); drift +154 px f92-170 (2.0 px/f) = lion plane; scale .90 (f76-100) -> 1.00 (f200) -> 1.05 | same as lion plane |
| Front flock (rams, black-face, lamb, right sheep) | revealed as the head clears, then drift down slightly faster than the back plane | black-face cy: 682 (f108), 700 (f114), 721 (f120), 743 (f125), 765 (f130), 808 (f140), 852 (f150), 880 (f160), 892 (f170), 907 (f200), 929 (f240 at scale 1.05). Lamb cy: 884 (f118), 928 (f126), 948 (f130), 1080 (f160), 1097 (f170), 1120 (f200), 1148 (f220-240). Ram 814 (f150), 838 (f160), 858 (f170), 862 (f200). Right sheep 855 (f160), 880 (f200). Scales .88-.95 (f108-120) -> .95-.97 (f150-160) -> 1.00 (f200) -> 1.04 (f230) | same ease; lamb is the nearest of the group (it keeps moving: +40 px f160-200 vs lion +5) |
| Parallax ratios (measured) | f0-40: head log-scale rate / lion = ln1.31 / ln(.85/.78) = **3.1x**; head dy / lion dy = -200 / -48 = **~4x** (lion dy includes the un-roll). f60-105: head ln(1.99/1.45)=0.317 vs lion ln(.90/.88)=0.023 -> **~14x**; dy +432 vs +32 -> **~13x** (f90-105: +277 vs +24 = 11.5x). f120-150: black-face +131 px vs lion +73 px -> **1.8x**; lamb f125-160 +158 vs lion +80 -> **2.0x**. Strip and left pale sheep move 1.0x the lion (f120-150: strip +71 vs lion +73; left sheep f140-160 +37 vs lion +38). | Three depth rates: head ~12x, front flock 1.8-2.0x (lamb highest), lion + strip + tree + back flock 1x |
| Rotation | back plane only, f0-45 | 25 deg (f0) -> 0 deg (f45), CCW tilt unwinding clockwise; motion-measure per-frame rotation 0.13 (f5), 0.35 (f10), 0.49 (f15), 0.61 (f20), **0.64 (f25)**, 0.60 (f30), 0.65 (f35), 0.48 (f40), 0.41 (f45), 0.16 (f50), 0.01 (f55), ~0 after (sum ~ 22 deg); head, strip, front flock have none | ease-in-out |
| Title strokes | hand-drawn write-on, section 7 | red x1 (right edge of the title ink): 199 (f68), 209 (f80), 223 (f86), 257 (f89), 285 (f98), 313 (f104), 367 (f110), 395 (f119), 433 (f125), 473 (f128), 501 (f134), 535 (f143), 561 (f149), 569 (f152), 577-579 (f185+) | ~3 px/f f89-110, ~5 px/f f110-134, ~5.5 px/f f134-152 |
| Yellow wipe | fill sweeps down, then clears left to right (HSV mask, 2nd-98th percentile extents) | lowest yellow row (y p98): 586 (f124), 725 (f128), 858 (f132), 997 (f136), 1064 (f138), 1105 (f140), 1144 (f148) = ~ 34 px/f f128-138; right edge (x p98) 527 -> 681 (f124-136) -> 710 (f150); left edge (x p2) 14 (f108-138), 42 (f140), 292 (f142), 335 (f146), 389 (f150), 512 (f151), gone f152 (~ +50 px/f, last 3 frames +120 px/f); centroid (x,y): (215,333) f108 -> (338,747) f136 -> (547,795) f148 -> (632,886) f151 | linear sweep in, hard out |

## 5. Camera

There is no single camera: a virtual camera pushes in and tilts over a stack of three parallax rates (section 4). The table gives the **content scale and position per plane** (what the animator moves), plus the cumulative output of `camera-table.py` as a cross-check.

| Frame | Back plane (lion head centre) | scale / rot | Front head (nose) | S | Front flock (black-face centre) | Tool cumulative (scale, tx, ty) |
|---|---|---|---|---|---|---|
| 0 | (414,364) | 0.78 / 25 deg | (540,890) | 1.00 | hidden | 1.000, 0, 0 |
| 15 | (428,354) | 0.80 / 20 deg | (518,868) | 1.02 | hidden | 1.009, -5, -15 |
| 30 | (470,321) | 0.83 / 10 deg | (472,745) | 1.17 | hidden | 1.039, -15, -65 |
| 45 | ~ (532,~318) | 0.85 / ~0 deg | (473,683) | 1.37 | hidden | 1.064, -13, -93 |
| 60 | ~ (545,332) | ~0.88 / 0 | (478,682) | 1.45 | hidden | 1.079, -12, -95 |
| 75 | ~ (550,328) | ~0.88 / 0 | (489,710) | 1.57 | hidden | 1.095, -11, -91 |
| 90 | (556,340) | 0.90 / 0 | (511,837) | 1.77 | hidden | 1.121, -12, -75 |
| 105 | (560,364) | 0.90 / 0 | (522,1114) | 1.99 | ~ (374,~690) (revealed f108) | 1.151, -12, -42 |
| 120 | (568,401) | 0.93 / 0 | gone | - | (372,721) .90 | 1.193, -11, +8 |
| 135 | ~ (573,430) | ~0.94 / 0 | gone | - | ~ (374,787) | 1.250, -12, +65 |
| 150 | ~ (582,474) | 0.96 / 0 | gone | - | (378,852) .95 | 1.300, -13, +115 |
| 165 | (590,~530) | 0.97 / 0 | gone | - | ~ (380,886) | 1.338, -13, +143 |
| 180 | (594,~532) | 0.99 / 0 | gone | - | ~ (381,899) | 1.347, -13, +145 |
| 200 | (595,498) = reference | 1.00 / 0 | gone | - | (382,907) 1.00 | 1.369, -15, +149 |
| 220 | (593,493) | 1.02 / 0 | gone | - | ~ (368,~918) | 1.402, -22, +154 |
| 240 | (590,496) | 1.04-1.05 / 0 | gone | - | (355,929) 1.05 | 1.430, -33, +157 |

- **Zoom (back plane):** x1.09 over f0-40 (0.78 -> 0.85), near-flat f40-85, x1.14 over f85-160 (0.88 -> 0.98), x1.07 over f160-240 (0.97 -> 1.04). Overall x1.33 (0.78 -> 1.04); the tool's cumulative 1.43 is the same order (it tracks the dominant back/mid-plane features through the head hand-over, so it is soft, `~`).
- **Zoom (front head):** x1.99 in 105 frames; this is the "rack focus pull-back" look: the camera stays put on the head while the head grows and falls, the world behind rises into view.
- **Pan / tilt:** back plane x 414 -> 595 (+181 px, +25 % W) and y 364 -> 316 -> 498 (up 48 px f0-40, then down 182 px f40-200). Front head x 540 -> 470 -> 522 (-70 / +52 px), y 890 -> 682 -> 1114+ (up 208, then down 432+).
- **Roll:** 25 deg CCW tilt on the back plane at f0, level by f45; front layers never roll. After f45 there is no roll (NCC rotation search `0 deg` for f85-240).
- **Rack focus:** section 6 (the head is a constant-blur image that only scales; the lion, strip and crowd go from soft to sharp).
- **Tool check:** `motion-measure.py` reports `scale` ~1.000-1.003 per frame and 1000-2300 ORB inliers; its single global camera cannot represent three planes, so its `ty` (-95 at f60, +157 at f240) matches the back/mid planes only.

## 6. Look

| Item | Value |
|---|---|
| Grade | **Black-and-white, neutral gray, no tint.** Mean |R-B| 2.0 (f200), 3.4 (f0), 4.9 (f60); sheep mean RGB **(196,196,196)** at f200. Luminance percentiles f200: p2 **1**, p10 65, p50 **232**, p90 **253**, p98 254 (highlights clipped at 253-254); f0: p2 13, p10 129, p50 230; f100: p2 2, p10 105, p50 218 (measured). Lion body: p2 0, p50 48 (black with grey mane); sheep fleece mid-greys 150-215; ground **#FCFCFC / #F6F6F6**. High-key: median > 218 at all times. |
| Accent colours | Only three non-grey things exist: **yellow strokes**, **red title**, **violet lion eyes**. |
| Yellow | **#F5DA3E** bright core (saturated-pixel median #F4DA3E-#F6DA3E over f56-148; #EACC49-#EACE4A on the f0-12 bars; #D4BB52 on the lion body at f12). Over white subjects it reads **#F9DE55** (lamb, f144); over the black lion it darkens to **#584705** (mane, f144), i.e. a colour/overlay-style blend that keeps the base luminance (a multiply would stay black, a normal fill would stay #F5DA3E). Early marker bars are close to opaque. Pale wash (f44-130): **#FAF4D1-#FCF5D1** (~ 25-35 % opacity, `~`). Coverage (HSV mask, % of frame): 2.3 (f0), 2.1-2.7 (f0-44), 3.4 (f48-56), 1.7 (f96-100 minimum), 2.0 (f108), 4.8 (f124), 10.4 (f132), **17.3 (f136)**, 15.4 (f140), **20.1 (f145 max)**, 14.8 (f150), 7.9 (f151), **0.0 (f152 on)**. |
| Red (title) | Title ink: saturated pixels p10/p50/p90 = **(171,70,72) / (186,87,87) / (202,110,109)**, darkest cores **#9D4140**; median **#BA5757** (anti-aliased brush stroke, video compression). Pick **`~#B8484A`** for the ink colour, rendered with a slightly darker core. "Note To Self" is the same red, thinner. |
| Violet eyes | Lion eyes: median **#5D4DAD** (93,77,173), highlights **#C6BFEF**; ~190 blue px at f200 (two eyes of ~12 px); present from f0 (71 px) to f240; a glow, no flare. |
| Paper strip | Beige **#E5DCCD** median (p10 #B68980 where ink, p90 #ECE5D9); two thin dark ruled lines at ~ 28 % and ~ 62 % of the strip height; paper texture is flat (no fibres at 720 px); left/right ends slightly irregular (torn), no shadow. 470x110 px at f200. |
| Texture / grain | None. No grain, no halftone, no paper overlay on the ground; the whole frame is clean. A few drifting dust/snow specks (2-4 px) are seen by eye f20-110 and f150-240 (`~`, not counted: an automatic speck detector fired on fur/text). |
| Vignette | **None**: top corners 252-253 (the ground), bottom corners 247 (snow), centre varies with content. Don't add one. |
| Blur / depth of field (sigma px at 720, Gaussian equivalent) | **Front head: constant source blur, rising only because it scales.** Edge-width sigma (contrast / (2.5 x max gradient)): 5.8 (f0), 5.5 (f20), 7.3 (f40), 8.7 (f55), 9.4 (f70), 10.3 (f85), 11.8 (f100), 12.4 (f105); divided by S (1.00-1.99) it is a flat **5.2-6.2 px at native size** (measured), so there is no animated blur on the head: blur ~6 px baked in, scale does the rest. **Lion (back plane): soft then sharp**: template fit sigma 4-5 at f0-40, 3 at f40-50 (mane fit), 2 at f55, **0 from f60** (measured; 0 = within 1 px of the sharp f200 plate). **Strip: ~4-6 px at f48-60 with horizontal smear** (edge-profile estimate, `~`; the template fit saturated), **sharp from f64** (read from crop `c1.png`). **Back flock (left/right small sheep): ~3-5 at f0-60 (`~`)**, sharp by f85. **Front flock, lamb, ram: sharp (0-1.5) from first sight** (f108-126). Title: sharp once drawn. |
| Chromatic aberration | none seen |
| Flicker | none |

## 7. Type

| Text | Where | Font style | Colour | Size / placement |
|---|---|---|---|---|
| "Be A Lion Among Sheep" (the title; the pin text, read directly) | one line on the paper strip, below "Note To Self" | **Hand-drawn brush/marker script, upright-to-slightly-slanted caps and lowercase, dry-brush stroke with rough, uneven edges and a tall looping "B" and "A" (Kaushan Script / Yellowtail / hand-lettered look, `~`; not a clean formal script and not a block sans)** | red `~#B8484A` (section 6) | f200: x 160-579 (420 px, 58 % W), ink y 374-419 (46 px incl. descender), x-height ~ 24 px (~); f240: 441 px wide, 50 px tall (scale 1.05). |
| "Note To Self" | small line above the title, centred on the strip | same hand/brush face, small caps-and-lowercase | same red, thinner | f200: x 318-411 (93 px), ~ 20 px tall at x ~ 365 centre; shows a **doubled ghost f66-74** (two copies, ~ 4 px apart) and again with the title echo f136-142 |

**How it writes on (measured with the red-pixel extent and read from `c4.png`):** it is a **stroke-by-stroke handwriting reveal**, not a left-to-right wipe and not a typewriter:
- "Note To Self" is already on the strip when it fades in at f48 (blurred), first red pixels (sharp) f60-62.
- The title starts at f66-68 as a few scribbled red marks at the left end of the first line (x 186-199 at f68, "~~" shapes at f70-74), resolves into a rough "B" at f76-80 and a clean "B" at f82; "Be" at f88, "Be A" at f92, "Be A L" at f100, "Be A Lio" at f104, "Be A Lion A" at f112, "Be A Lion Am" at f120, "Be A Lion Among" at f128, "Be A Lion Among S" at f132-136, "...Sh" at f138, "...She" at f143-146, full "Sheep" at f152-155. Each glyph shows intermediate incomplete strokes for ~ 3-6 frames; the first letter takes the longest (~ 15 frames, f66-82).
- Right edge of ink (px): 199 (f68), 223 (f86), 285 (f98), 313 (f104), 367 (f110), 417 (f122), 473 (f128), 501 (f134), 535 (f143), 561 (f149), 569 (f152), 577-579 (f185+) (measured). Total 85 frames (2.8 s) for 420 px.
- After completion the strip + title carry on with the plane (section 4). Glitch echoes (ghost double + horizontal smear) at f66-74 and f136-142 (strongest f139-141, strip smears ~ 20+ px horizontally), and milder bursts at f153, f165-167, f177-180, f214-230 (strip-ROI frame diffs > 2x median, `~`; the strip has no positional jitter: phase-correlation shift < 0.5 px per frame, measured f160-199).

## 8. Loop / ending

- **Not a loop.** f240 (full composition, slow push) vs f0 (soft close-up): mean abs diff 49.8 on 144x256 gray = a hard jump if the player loops; f239 -> f240 is 2.2 (normal). Treat it as a one-shot with a held end.
- The last 6 audio frames fade (rms -30 at f235, -43 at f240); the video does not fade out.
- Hold: the end is **not static**: f177-240 = slow push-in (+7 % scale on the lion plane, lamb +68 px down, strip -20 px left). Do not freeze the last frame; keep the push to the last frame.
- First 5 frames start from near-rest (diff 0.1-0.5 then 1.3), so the move eases in from f0.

## 9. Sound

Method: ffmpeg ebur128 per segment; numpy STFT (4096 window, 60 columns/s; spectrogram `c8-work/spec.png`); spectral-flux onsets in three bands (sub < 150 Hz, mid 150 Hz-2 kHz, high 2-8 kHz) and autocorrelation. No lyrics transcribed. AAC stereo, near-mono (L/R corr 0.94).

**Answer: it is music, with a possible quiet pre-roll sound; I could not isolate separate SFX.** Reading by section:

| Section | Frames | Level | What the spectrum shows |
|---|---|---|---|
| Pre-roll | f0-67 (0-2.2 s) | rms ~ -39 dBFS, -33.2 LUFS | Quiet **tonal material at 500 Hz-3 kHz** (50 % of energy 500 Hz-2 kHz, 31 % 2-6 kHz; harmonic ladders near 800 Hz and 2.3 kHz with gentle pitch slides at 0.2-0.8 s and 1.0-1.5 s), almost nothing below 150 Hz. Could be a quiet melody, a vocal fragment or animal-like calls: I cannot tell from the spectrum (**open item**, not transcribed). High-band onsets f18, f34, f49-51 (weak). |
| **Drop** | **f68** (2.27 s) | rms **-51 -> -28 dBFS in one 33 ms window (+23 dB)**, strongest onset in all three bands (strength 1.0) | **Sub-bass impact** (peak 120 Hz decaying to 26-35 Hz), then a **sustained sub-bass drone/808 bed** (97-99 % of energy < 150 Hz from 2.3 to 5.0 s; dominant peak 26 Hz at 2.5, 2.75, 3.0, 3.75, 4.0 s). Reads as a music drop, not a foley hit. |
| Body | f69-175 (2.3-5.8 s) | rms -18 (f80-84, loudest early peak) ... -22 ... -40; short dips at f105-115, f135-145, f150-165 | low bed with **weak beats**: sub onsets f85 (2.83 s), f99 (3.29), f112 (3.73), f143 (4.76), f167 (5.57); intervals 0.46 s and 0.44 s -> **tempo ~ 130 BPM** (autocorr lag 0.476 s = 126 BPM, and 1.022 s = 2 beats; `~` +-4 BPM). 8th/16th hi-band hits: f80, f89, f99, f120, f130. |
| Lead | f165-205 (5.5-6.9 s) | rms -25 to -29 dBFS | **tonal harmonic ladders at 500 Hz-3 kHz** (melodic or vocal-like line, by spectrogram), hi-band onsets f166, f171. |
| Outro | f205-240 (6.9-8.0 s) | -18 (f215) to -43 (f240) | warm 150-500 Hz body (79 % of energy at 7-8 s), onsets f215 (mid), f217, f222 (hi); fade over f234-240. |

Hits vs visual beats (measured frames):
- **f68 drop = the first title strokes** (red ink f68) and the head's fall starting (f65-70); also lion fully sharp at f60. This is the only hard sync.
- f85 / f99 / f112 low beats fall inside the head's fall (E): f99-105 = the speed peak (22 px/f), f112 ~ the black-face / lamb reveal (f108-118).
- f120 and f130 high-band onsets = start of the yellow ramp (f120: 4.1 % coverage; f130: 7.2 %, f132 = the jump to 10.4 %); f143 sub onset = the second yellow stage (solid fill f142-148). The **yellow clear (f148-152) has no audio hit** (no onset within f146-165); the loud lead (f166-171) arrives ~ 14-19 frames after it.
- f215-222 onsets and the f215 -18 dBFS peak have no visual event (slow push only).
- Not found: a riser into f68 (rms falls -40 -> -52 over f60-67), no whoosh or paper SFX at the strip fade-in (f44-48), no "write" SFX during the title.

## 10. Clone rules

1. **Render 30 fps, 241 frames (8.033 s), 720x1280, every frame distinct**; no stepping to 12 fps, no motion blur layer, no grain, no halftone, no vignette.
2. **White ground (#FCFCFC top, #F6F6F6 snow bottom)** and **grayscale photos**; colour exists only as yellow `#F5DA3E`, title red `~#B8484A`, lion-eye violet `#5D4DAD`.
3. **Three depth rates** moved by one virtual camera: front head x ~12, front flock x 1.8-2.0 (lamb highest), lion + strip + tree + back flock x 1.0. Use measured ratios (section 4); back plane starts rolled 25 deg CCW and un-rolls to 0 by f45.
4. Head curve: nose y 892 -> 682 (f5-45, ease-in-out bell peaking f20-28 at -8.8 px/f), plateau 682 until f60, then ease-in down 682 -> 1114 by f105 (speed 22 px/f), S 1.00 -> 1.45 -> 1.99; **no overshoot**. The head is **one pre-blurred image (sigma ~ 6 px at native size)** scaled up; do not animate a blur on it.
5. Lion focus pull: lion/back flock sigma 4-5 at f0-40 -> 0 at f60; strip sigma ~5 (f48-60) -> 0 at f64; crowd sharp from f108. The strip **fades in over f44-48**.
6. Title: red hand-brush script ("Be A Lion Among Sheep") revealed **stroke by stroke** f66-152 (right-edge schedule section 7), "Note To Self" above it (visible f48 blurred, sharp f60); two ruled lines; paper **#E5DCCD**; add the doubled-ghost glitch at f66-74 and f136-142.
7. Yellow: marker bars on the lion f0-44; pale wash f44-130; **paint wipe** f124-152: horizontal bands top-to-bottom f124-138, solid fill f138-148 (peak 20 % of the frame at f145), clear left-to-right f140-152 with a hard last 3 frames; clipped to the cut-outs, never on the white ground; blend that keeps base luminance (black lion goes dark olive `#584705`, white sheep go `#F9DE55`).
8. Title and strip scale and drift with the lion plane (strip centre 232 -> 382 by f170); final slow push f160-240 (+7 %), lamb moves faster than the rest.
9. Sound: bass-driven music, quiet 2.2 s pre-roll then a **drop on f68** with sub-bass bed, ~130 BPM (weak), tonal lead ~ f165-205, fade over the last 6 frames; keep the loud section at ~ -24.6 LUFS and the pre-roll ~ -33 LUFS. Put the drop on the first title stroke.
10. No baked UI text on the picture; the reel carries only the title and "Note To Self".

## 11. Not measured / open, and tool problems

- **Tool problems:** none blocking. `motion-measure.py` and `camera-table.py` ran (`MOTION_STUDIO_PY` with OpenCV). Output caveat: the single global camera it fits is not meaningful here (three planes, big uniform white areas, a front head that leaves the frame); cumulative scale 1.43 and `ty` +157 follow the back/mid planes. No other errors. (An earlier call of my own `layer.py` with the wrong argument order raised `IndexError`/`ValueError`, my script, not the tools.)
- **Not measurable / soft:** (a) f45-85 lion position is read from the mane template (partly hidden, `~`). (b) Strip blur at f48-60: the template fit saturated at sigma 22 because the title text differs from the f200 template; the edge-profile estimate (4-6 px + horizontal smear) is `~`. (c) Front-flock positions before f106 and the exact moment the front head is fully off screen (f106-128) are not tracked (NCC meaningless on hidden/tiny content). (d) Pale yellow wash opacity and the colour-blend model are inferred from colour medians, not from the source layers. (e) Title font is identified by look only; no OCR/font match. (f) The 0-2.2 s sound is unidentified (tonal/vocal-like vs animal-like): the sound crew should audition `c8.mp4` by ear before copying. (g) Tempo ~ 130 BPM is weak (low onset strength 0.3 in the sub band).
- **Open questions for the owner/director:** the pin text reads "Be A Lion Among Sheep" (English); the house is pt-BR, so confirm the clone's title language (recommended: keep the English phrase for a study clone, then pt-BR "Seja um leao entre as ovelhas" for product use, via `user-copy`). Source pictures: the clone needs a black lion cut-out, a sheep head, a ram, a black-face sheep, a lamb and a snow-field flock, all CC0/PD (`media/shared/kit` search first, then Openverse CC0).
