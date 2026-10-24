# Notes S04-S07 (round 2)

Fonts (OFL, Google Fonts): Cinzel (VAN GOGH, numerals), Archivo Black (THOUGH THE / EXACT), Lilita One (REMAIN DEBATED, 1888). Render: ~6 s for 129 frames at full size.

## S04 clock hall
Matches: cuts at 105/129, dolly-in first 7 f, VAN GOGH typed with guide lines, hard punch, skull lift with ring and brain, huge cropped text at the bottom after the punch.
Differs: head is larger than the reference's (generated figure has a bigger head), vines do not grow (baked into the cut-out), no clock parallax depth.
## S05 balance
Matches: radial blur join over S04's last frames, close-up (hand at top, pan mid frame), brain slides and falls out at x 45 %.
Differs: painting has one pan and no beam, so no beam tilt, no lamp, no second pan.
## S06 velvet
Matches: match-cut fall, type timing, white label box with typed yellow text, punch at f198, big gilt ornaments drifting.
Differs: brain is an anatomical gold sculpture (no laurel), ornaments are a different shape.
## S07 1888
Matches: real 3D spiral of 60 numerals, depth blur on near ones, 6 gilt frames flying outward, plate with orange 1888, dolly + roll.
Differs: frames have a flat gilt border (no ornate relief).

## Gaps
- Engine Camera is 1920x1080-world, three eases only: a per-key ease function and portrait world would remove the local `kf` helper.
- No radial zoom blur component: local `RadialBlur` (layered scaled copies) should move to `src/fx`.
- No vine-growth / clip-lift component for cut-outs.
- No Three helper for canvas-drawn text/frame textures with depth blur (local code in S07).
- Beam/pan rigs need separate generated parts (prompt a beam, pans, lamp as cut-outs).
