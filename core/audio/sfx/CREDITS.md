# SFX credits

Action names live in `../sfx-library.json`. File ids are short descriptive English names; the action names are what films use.

Freesound licences re-verified online on 2026-10-10 (46 recordings, all CC0 1.0).

## Committed files: Freesound, CC0 1.0

Each file here is a trimmed, mono 48 kHz, peak-normalised (-3 dBFS) mp3 cut from the Freesound
recording below, released under CC0 1.0 (public domain dedication, no attribution required). The
licences were read from the Freesound pages when the files were cut; check the page before you
redistribute a raw file elsewhere. Some ids share one recording (a different cut of it).

| id | source | licence |
|----|--------|---------|
| paper-set-down-desk | https://freesound.org/s/473982/ | CC0 1.0 |
| book-close-thud | https://freesound.org/s/319809/ | CC0 1.0 |
| book-set-down | https://freesound.org/s/484906/ | CC0 1.0 |
| paper-rip-short | https://freesound.org/s/487206/ | CC0 1.0 |
| paper-rip-long | https://freesound.org/s/367684/ | CC0 1.0 |
| paper-crumple | https://freesound.org/s/334201/ | CC0 1.0 |
| cardboard-set-down | https://freesound.org/s/346169/ | CC0 1.0 |
| tape-rip | https://freesound.org/s/467721/ | CC0 1.0 |
| quill-write | https://freesound.org/s/856167/ | CC0 1.0 |
| pencil-underline | https://freesound.org/s/428338/ | CC0 1.0 |
| marker-stroke | https://freesound.org/s/351145/ | CC0 1.0 |
| stamp-press | https://freesound.org/s/256763/ | CC0 1.0 |
| wax-seal | https://freesound.org/s/759526/ | CC0 1.0 |
| ink-drop | https://freesound.org/s/321490/ | CC0 1.0 |
| candle-light | https://freesound.org/s/734665/ | CC0 1.0 |
| paper-burn | https://freesound.org/s/528662/ | CC0 1.0 |
| impact-low-soft | https://freesound.org/s/336494/ | CC0 1.0 |
| bells-distant | https://freesound.org/s/703590/ | CC0 1.0 |
| church-room-tone | https://freesound.org/s/697579/ | CC0 1.0 |
| stamp-ink | https://freesound.org/s/683155/ | CC0 1.0 |
| sticker-slap | https://freesound.org/s/582469/ | CC0 1.0 |
| sticker-peel | https://freesound.org/s/137246/ | CC0 1.0 |
| postit-peel | https://freesound.org/s/426264/ | CC0 1.0 |
| postit-peel-2 | https://freesound.org/s/426264/ | CC0 1.0 |
| postit-stick | https://freesound.org/s/474580/ | CC0 1.0 |
| marker-squeak | https://freesound.org/s/119153/ | CC0 1.0 |
| marker-squeak-2 | https://freesound.org/s/335956/ | CC0 1.0 |
| highlighter | https://freesound.org/s/655051/ | CC0 1.0 |
| highlighter-2 | https://freesound.org/s/461809/ | CC0 1.0 |
| quill-scratch-short | https://freesound.org/s/856167/ | CC0 1.0 |
| quill-scratch-long | https://freesound.org/s/856167/ | CC0 1.0 |
| typewriter-space | https://freesound.org/s/734318/ | CC0 1.0 |
| typewriter-space-2 | https://freesound.org/s/734318/ | CC0 1.0 |
| typewriter-carriage-bell | https://freesound.org/s/345955/ | CC0 1.0 |
| paper-slide-wood | https://freesound.org/s/464302/ | CC0 1.0 |
| paper-slide-wood-2 | https://freesound.org/s/730078/ | CC0 1.0 |
| paper-drop-wood | https://freesound.org/s/416416/ | CC0 1.0 |
| paper-drop-wood-2 | https://freesound.org/s/272496/ | CC0 1.0 |
| paper-rip-3 | https://freesound.org/s/566199/ | CC0 1.0 |
| paper-rip-4 | https://freesound.org/s/366909/ | CC0 1.0 |
| book-thud-wood | https://freesound.org/s/824385/ | CC0 1.0 |
| desk-slap | https://freesound.org/s/742356/ | CC0 1.0 |
| desk-slap-2 | https://freesound.org/s/594389/ | CC0 1.0 |
| glass-clink | https://freesound.org/s/560298/ | CC0 1.0 |
| glass-clink-2 | https://freesound.org/s/104815/ | CC0 1.0 |
| candle-snuff | https://freesound.org/s/656818/ | CC0 1.0 |
| candle-snuff-2 | https://freesound.org/s/242867/ | CC0 1.0 |
| cymbal-reverse | https://freesound.org/s/774635/ | CC0 1.0 |
| organ-chord | https://freesound.org/s/808245/ | CC0 1.0 |
| choir-ah | https://freesound.org/s/444491/ | CC0 1.0 |
| sticker-peel-2 | https://freesound.org/s/137246/ | CC0 1.0 |

## Fetched files: Mixkit (never committed)

The Mixkit Sound Effects Free License (https://mixkit.co/license/#sfxFree) allows use in your
own productions but not redistribution of the files, so these are downloaded by
`node core/audio/fetch-sfx.mjs` into `sfx/fetched/` (gitignored), processed by the same recipe.
Their source URL, high-pass and length are in `../sfx-sources.json`. Five of them
(stamp-wood, stamp-wood-2, match-flame, boom-low, paper-pass-transition) were
first made as a layer of a Freesound and a Mixkit recording; the fetched version is the Mixkit
layer alone. Until they are fetched, their actions fall back to synthesized voices.

| id | source |
|----|--------|
| paper-slide | https://assets.mixkit.co/active_storage/sfx/1530/1530-preview.mp3 |
| paper-drop-floor | https://assets.mixkit.co/active_storage/sfx/386/386-preview.mp3 |
| page-turn | https://assets.mixkit.co/active_storage/sfx/1104/1104-preview.mp3 |
| page-turn-large | https://assets.mixkit.co/active_storage/sfx/1105/1105-preview.mp3 |
| book-flip | https://assets.mixkit.co/active_storage/sfx/1101/1101-preview.mp3 |
| paper-crumple-2 | https://assets.mixkit.co/active_storage/sfx/2996/2996-preview.mp3 |
| paper-rustle | https://assets.mixkit.co/active_storage/sfx/2380/2380-preview.mp3 |
| paper-wind | https://assets.mixkit.co/active_storage/sfx/2653/2653-preview.mp3 |
| pen-scratch | https://assets.mixkit.co/active_storage/sfx/2367/2367-preview.mp3 |
| typewriter-key | https://assets.mixkit.co/active_storage/sfx/1366/1366-preview.mp3 |
| typewriter-keys-burst | https://assets.mixkit.co/active_storage/sfx/1379/1379-preview.mp3 |
| typewriter-bell | https://assets.mixkit.co/active_storage/sfx/1368/1368-preview.mp3 |
| typewriter-return | https://assets.mixkit.co/active_storage/sfx/1381/1381-preview.mp3 |
| liquid-pour | https://assets.mixkit.co/active_storage/sfx/2826/2826-preview.mp3 |
| liquid-splash | https://assets.mixkit.co/active_storage/sfx/1311/1311-preview.mp3 |
| water-drop | https://assets.mixkit.co/active_storage/sfx/3179/3179-preview.mp3 |
| match-strike | https://assets.mixkit.co/active_storage/sfx/2590/2590-preview.mp3 |
| fire-crackle | https://assets.mixkit.co/active_storage/sfx/1329/1329-preview.mp3 |
| whoosh-short | https://assets.mixkit.co/active_storage/sfx/1461/1461-preview.mp3 |
| whoosh-long | https://assets.mixkit.co/active_storage/sfx/1474/1474-preview.mp3 |
| swish-pan | https://assets.mixkit.co/active_storage/sfx/3115/3115-preview.mp3 |
| riser-short | https://assets.mixkit.co/active_storage/sfx/790/790-preview.mp3 |
| swell-reverse | https://assets.mixkit.co/active_storage/sfx/784/784-preview.mp3 |
| church-bell-single | https://assets.mixkit.co/active_storage/sfx/619/619-preview.mp3 |
| floor-creak | https://assets.mixkit.co/active_storage/sfx/337/337-preview.mp3 |
| door-creak | https://assets.mixkit.co/active_storage/sfx/195/195-preview.mp3 |
| church-door | https://assets.mixkit.co/active_storage/sfx/193/193-preview.mp3 |
| click-soft | https://assets.mixkit.co/active_storage/sfx/1117/1117-preview.mp3 |
| pop | https://assets.mixkit.co/active_storage/sfx/2356/2356-preview.mp3 |
| stamp-wood | https://assets.mixkit.co/active_storage/sfx/2182/2182-preview.mp3 |
| stamp-wood-2 | https://assets.mixkit.co/active_storage/sfx/2182/2182-preview.mp3 |
| typewriter-key-2 | https://assets.mixkit.co/active_storage/sfx/1365/1365-preview.mp3 |
| typewriter-key-3 | https://assets.mixkit.co/active_storage/sfx/1384/1384-preview.mp3 |
| typewriter-key-4 | https://assets.mixkit.co/active_storage/sfx/1380/1380-preview.mp3 |
| typewriter-carriage-bell-2 | https://assets.mixkit.co/active_storage/sfx/1383/1383-preview.mp3 |
| paper-flip-fast | https://assets.mixkit.co/active_storage/sfx/1100/1100-preview.mp3 |
| paper-crumple-3 | https://assets.mixkit.co/active_storage/sfx/2389/2389-preview.mp3 |
| paper-crumple-4 | https://assets.mixkit.co/active_storage/sfx/2385/2385-preview.mp3 |
| match-flame | https://assets.mixkit.co/active_storage/sfx/1345/1345-preview.mp3 |
| flame-whoosh | https://assets.mixkit.co/active_storage/sfx/1348/1348-preview.mp3 |
| camera-whoosh-low | https://assets.mixkit.co/active_storage/sfx/2615/2615-preview.mp3 |
| swish-air | https://assets.mixkit.co/active_storage/sfx/1489/1489-preview.mp3 |
| swish-spin | https://assets.mixkit.co/active_storage/sfx/1493/1493-preview.mp3 |
| riser-soft | https://assets.mixkit.co/active_storage/sfx/1445/1445-preview.mp3 |
| boom-low | https://assets.mixkit.co/active_storage/sfx/2900/2900-preview.mp3 |
| paper-pass-transition | https://assets.mixkit.co/active_storage/sfx/1469/1469-preview.mp3 |
| bell-low-single | https://assets.mixkit.co/active_storage/sfx/587/587-preview.mp3 |

## Processing

High-pass at 100 Hz (60 Hz for the deep bell, boom and deep whoosh) to drop handling rumble, mono
48 kHz, leading silence trimmed to 6 ms before the onset (-32 dB below the clip's peak), length
capped (hits 0.1-1.5 s, beds and bells up to 4.5 s) with a fade-out, peak-normalised to -3 dBFS,
mp3 96 kbps. Quiet crinkles (paper-crumple-3/4, typewriter-key-4) get a soft tanh drive before
normalising so the body is not buried under the spikes.

## Sampler

`node core/audio/sfx/sampler.mjs [--out dir]` writes `sampler.mp3` (the first variant of every
action, in library order) and `sampler.txt` (time, action, file) into `./out` by default.
