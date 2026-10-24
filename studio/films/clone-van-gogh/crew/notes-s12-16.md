# Notes S12-S16 (builder)

Side-by-side: `out/s12-16-vs.mp4` (ref left, ours right), sheet `out/s12-16-sheets/contact.png`. Rendered half-scale. Private render entry `lib/s12-16-entry.tsx` (S12-16 only; not used by the film).

## Per shot
- S12 (375-400): matches camera push 1.0 -> 1.45, spotlight cone pulsing, figure on a code-drawn plinth with rim glow, torn paintings flying past and a canvas peeling off at the flank. Differs: the "revolving gallery" is three scrolling bands of paintings (no true cylinder, no depth), figure is a flat cut-out (no body turning), plinth reads weaker than the reference.
- S13 (400-433): constant push 1.0 -> 1.4, type in world coords, HIS OWN / STRUGGLES typed. Cut-out painter rocks at the hip. Differs: no brush arm (the generated image is one flat figure, no separable arm), so the painting action is only a body lean.
- S14 (433-457): real Starry Night behind the S02 frame cut-out (s11-frame-cut.png), brick wall, rope, caption in screen space growing 72 -> 94 px, push 1.0 -> 1.2. Pillar sweep measured from the reference (table in lib/s12-16-pillar.tsx). Differs: rope is the generated cut-out squashed; wall darker than reference.
- S15 (457-492): jigsaw drawn in SVG (tabs only on inner edges), small state then punch at local 18, slow push, two captions. Differs: pieces are flatter/paler than the glossy reference, insets are simple code icons.
- S16 (492-554): desk, folder pop with overshoot, plain "Ae" tiles, red CircleMark, URL typed (Orbitron 900, green left brace). Differs: URL slightly thinner than the reference, no drop-in of desk props.

## Gaps
- Camera is 1920x1080-oriented: a portrait camera component (or a `viewport` prop) would remove my `Cam` helper.
- No jigsaw/puzzle component: a `Jigsaw` (SVG tabs, inset image, label) in src/devices.
- No pillar/whip-bar transition: `barSweep({from,to,width})` in src/transitions, drawn from absolute frame so both shots share it.
- Puppet needs separable parts: image generation should output arm/torso/palette as separate layers or rig a cut-out with an arm mask.
- Cylinder gallery: a three.js revolving-wall component (src/three) would replace the banded scroll.
- Render entry: a bundler error in another builder's file blocks every render; a per-shot render entry generator in tools/ would isolate builders.
- Image viewing tools failed for a stretch (hook timeout), so the first pass was tuned from measured numbers (alpha bboxes, pixel stats), not by eye.

## Fonts (OFL, assets/fonts/)
Lilita One (OFL), Orbitron variable (OFL), Cinzel variable (OFL), from github.com/google/fonts.

## Render time
Half-scale 179 frames ~8 s; full-scale 179 frames ~7 s on the private entry (6.9 s measured).
