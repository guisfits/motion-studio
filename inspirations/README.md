# Inspirations

A repertoire of motion made by others: what good motion design looks like, and the grammar a
film can borrow. **Never the source of identity**: a film's look comes from its project's own
theme and references. From an inspiration a film takes grammar only (pacing, transitions,
camera, technique, structure), never its content, characters, logos or palette.

How a film uses this folder: pick 1–3 entries, open them (the piece itself, not just this row),
and write in the film's `style_guide.md` which grammar comes from which entry.

**Notes only.** The studies below are committed as notes; clips and frames are a local cache,
never committed. To study a new piece: `node <E>/core/reference/inspiration.mjs <id> <url>
[--fps 2] [--out dir]` (download only with permission and for study), measure it (see the
`motion-engine` skill, `references/render-and-review.md`), and write what you saw to
`inspirations/<id>.md`: grammar and general takeaways, no project specifics.

## Studied (notes in this folder)

| id | Notes | Best for |
|----|-------|----------|
| `earn-edits-account` | [earn-edits-account.md](earn-edits-account.md) | narrated story explainers (12 reels): length, words/s, hook, turn, captions, holds, mix, CTA |
| `chrismoran-account` | [chrismoran-account.md](chrismoran-account.md) | editorial-collage tutorials (12 reels): shot lengths, "look at this" hooks, one accent, voice-only mix |
| `zhylin-five-vox-tricks` | [zhylin-five-vox-tricks.md](zhylin-five-vox-tricks.md) | "5 tricks from Vox" (62 s): second-by-second breakdown, chapter cards, montage only under lists |
| `collage-reels-trio` | [collage-reels-trio.md](collage-reels-trio.md) | three collage reels: graded grounds, hero word behind the subject, one mark, lead + key captions |
| `twoclipping-ui-morph` | [twoclipping-ui-morph.md](twoclipping-ui-morph.md) | one object that never cuts; UI feature loops |
| `claude-pop-donald` | [claude-pop-donald.md](claude-pop-donald.md) | long films: fixed palette + recurring motifs, two type registers, bookend |
| `mablesjoseph-watercolor` | [mablesjoseph-watercolor.md](mablesjoseph-watercolor.md) | colour script per act, light as meaning, painterly texture |
| `oozn-steve-jobs` | [oozn-steve-jobs.md](oozn-steve-jobs.md) | chaptered history with a year counter and spotlight; ending through a door of light |

Source of the first entries: Movez, "How to build motion design studio with Opus 5.5
(Full-course)", X article, 2026-09-27 — <https://x.com/0xMovez/article/2104216919033192746>.
Add an entry whenever someone shares a piece or a film borrows from a new one.

## Films and clips

| id                        | Piece                                                                       | Link                                                                                                                     | What to learn (grammar)                                                                                                                                                    | Technique                                            |
| ------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `claude-opus-5-5-launch`  | Anthropic, Claude Opus 5.5 launch film (20 s)                               | <https://x.com/claudeai/status/2102435511222890900>                                                                      | A launch film from a product company: confident type statements, restraint, one idea per beat                                                                              | kinetic type, product reveal                         |
| `claude-pop`              | NotinReality, "Claude Pop" music video, the original (2:36)                 | <https://x.com/other__reality/status/2102514581684052169>                                                                | Whole song carried by drawn motion; lyrics as type that goes huge on the hook and sits as subtitles elsewhere                                                              | music video, lyric typography                        |
| `claude-pop-donald`       | donald, "Claude Pop" remake, 2.1M views, 12 h autonomous run (2:21)         | <https://x.com/donaldjewkes/status/2102801274173587569> · brief: <https://x.com/donaldjewkes/status/2102801469976248500> | The director's brief (~9,500 chars) as a crew; generate-then-trace: a video model gives base motion and physics, code redraws every frame on top so the look stays ownable | director brief, generate-then-trace, character bible |
| `pleometric-pc98`         | Pleometric, Donald's brief re-run on a PC-98 image gallery (2:36)           | <https://x.com/pleometric/status/2103082510607610023>                                                                    | Same brief, a personal image library as reference → a completely different film. Your own library is a reference nobody can copy                                           | reference library, pixel style                       |
| `pleometric-tiktok`       | Pleometric, "what its TikTok feed looks like", pure code                    | <https://x.com/pleometric/status/2102572941699354900>                                                                    | Started from a single frame of another viral piece; the model chose to write its own paper renderer                                                                        | single-frame reference, custom renderer              |
| `morse-colorful`          | Tommy D. Rossi, the showreel prompt made more colorful (15 s)               | <https://x.com/__morse/status/2103485566570369333>                                                                       | Route A dissected: one index.html, a seek function, Playwright frame by frame, ffmpeg                                                                                      | seek(t) engine                                       |
| `twoclipping-ui-morph`    | zero, UI morph loop, 1.1M views, open XML template (14 s)                   | <https://x.com/twoclipping/status/2103273003555402193>                                                                   | One shape never cuts: a single container morphs through 8–12 UI states, a cursor drives every change, last frame = first. The state list is the spec                       | one-shape morph, springs, seamless loop              |
| `verbove-makermap`        | Martijn Verbove, MakerMap: one shape through the whole product (20 s)       | <https://x.com/verbove/status/2103483957266268381>                                                                       | The morph spec applied to a real product with real data; started from one viral post as reference                                                                          | one-shape morph, product film                        |
| `stephanlivera-reel`      | Stephan Livera, the 15 s résumé showreel on Max (source of the one-liner)   | <https://x.com/stephanlivera/status/2103315922098470926>                                                                 | What "showreel" means as a genre: fast cuts, a new technique every shot, best work first                                                                                   | showreel                                             |
| `robj3d3-reel`            | Rob Hallam, the same one-liner on xhigh, one-shot with audio (15 s)         | <https://x.com/robj3d3/status/2103875898349088830>                                                                       | Sound synthesized in code, not added in post; a second film in the same session reuses the pipeline                                                                        | showreel, code-synth audio                           |
| `himanshu-reel`           | Himanshu, showreel on Max, sound on (15 s)                                  | <https://x.com/himanshutwtxs/status/2103495232637882858>                                                                 | Another read of the same one-liner: shows "brief contagion" — reels from one prompt rhyme                                                                                  | showreel                                             |
| `tdinh-typingmind`        | Tony Dinh, TypingMind launch reel, <30 min (15 s)                           | <https://x.com/tdinh_me/status/2103703135902740699>                                                                      | Brand reel from the real site: real screenshots, logo, assets, music. Replaced a $1,000 agency video                                                                       | brand reel, real UI                                  |
| `achxvi-pocketsflow`      | Chain, Pocketsflow reel with a talking character (15 s)                     | <https://x.com/achxvi/status/2103918792845963545>                                                                        | Mascot + voice (ElevenLabs) explaining the product                                                                                                                         | character, voice-over                                |
| `achxvi-product-film`     | Chain, 38 s vertical product film in 45 min, offered as a service           | <https://x.com/achxvi/status/2104014659615392078>                                                                        | Vertical product film structure: music, mascot, features, offer at the end                                                                                                 | vertical product film                                |
| `rexan-workflow`          | Rexan Wong, why "one prompt" videos look the same (10 s + thread)           | <https://x.com/rexan_wong/status/2103707054108299437>                                                                    | Naming a style beats describing one; a reference video gives pacing, type and transitions                                                                                  | reference workflow                                   |
| `nft-chen-editor`         | SuSu, a cartoon video editor coded and then edited inside (0:29)            | <https://x.com/NFT_Chen/status/2102681172367323300>                                                                      | A fake UI as a film set where every element has a known state; the character acts inside the tool                                                                          | UI as set, character                                 |
| `nft-chen-store`          | SuSu, rainy-night corner store, dense detail (1:44)                         | <https://x.com/NFT_Chen/status/2102672063668670725>                                                                      | Atmosphere built in code: wet reflections, light cones, spatial logic of a place                                                                                           | environment, lighting                                |
| `oozn-steve-jobs`         | onur ozcan, Steve Jobs biopic, 2 min, Remotion + SVG, 23 transitions (1:59) | <https://x.com/oozn/status/2103482545111232946>                                                                          | A life told as animation: jointed SVG characters, chaptered story, every cut locked to 120 BPM, soundtrack synthesized in Node                                             | biography, SVG rigs, beat-locked cuts                |
| `vox-small-print`         | Vox, "small print": story, frames and music all by the model (0:29)         | <https://x.com/Voxyz_ai/status/2102531681450119426>                                                                      | Short narrative with a point of view; music synthesized in Python, then a second-by-second polish pass                                                                     | narrative short, polish pass                         |
| `vox-opus-back`           | Vox, companion post                                                         | <https://x.com/Voxyz_ai/status/2102515959848222953>                                                                      | Context on the same piece                                                                                                                                                  | —                                                    |
| `devteamdrew-launch`      | DreW, launch-day piece, 1.8M views (0:31)                                   | <https://x.com/devteamdrew/status/2102436464323661880>                                                                   | Visible cleanup rounds: iteration is the method                                                                                                                            | polish rounds                                        |
| `mablesjoseph-watercolor` | Mable Joseph, 45 s hand-painted watercolor short, 163 model calls           | <https://x.com/mablesjoseph/status/2103465246014746943>                                                                  | Every brushstroke, wash and sound in code; honest about needing a supporting project                                                                                       | painterly rendering, brush, washes                   |
| `kloss-piano-reel`        | @kloss_xyz, 90 s piano showreel (pattern quoted in the article)             | <https://x.com/kloss_xyz>                                                                                                | Long reel driven by an original piano score; every cut synced to it                                                                                                        | score-driven editing                                 |
| `1littlecoder-intro`      | @1littlecoder, 10 s self-intro (anti-slop pattern)                          | <https://x.com/1littlecoder>                                                                                             | Guardrail: no frames, no corner text — the giveaways of AI-made video                                                                                                      | anti-slop rules                                      |
| `sonnylazuardi-story`     | @sonnylazuardi, showreel energy used to tell a history (pattern)            | <https://x.com/sonnylazuardi>                                                                                            | "The history of X from Y to today", vertical, storyboard left to the model                                                                                                 | history story                                        |
| `pradeep-pip`             | @pradeepXkapoor, "Pip" robot film, 19,000-char brief                        | <https://x.com/pradeepXkapoor>                                                                                           | The longest public brief: character, beat sheet, gates                                                                                                                     | director brief, character                            |


## Collage

Editorial collage (`vox-style-animation` skill). From these pieces take the grammar only;
colours, type and pieces come from the project's theme and its own material.

| id | Piece | Link | What to learn (grammar) | Technique |
| --- | --- | --- | --- | --- |
| `chrismoran-editorial` | Chris Moran, "one of the easiest ways to make motion graphics feel more editorial" (42 s), sent as a reference | <https://www.instagram.com/reel/DY7TSLJAQef/> | Cover frame: a huge serif word with a photo cut-out (the Capitol) breaking through it, torn strips as windows, dark grained ground with faded old print, one hand-drawn red arrow, a small caption tag. Depth by overlap of type and cut-out | editorial collage, Vox style |
| `human-academy-vox-bust` | Human Academy, Vox-style reel made with Claude Code + Remotion (76 s), sent as a reference | <https://www.instagram.com/reel/DbTxeqsBWST/> | Cover frame: one classical bust sliced into horizontal bands, each band from a different source (gold helmeted head, marble face, stone base); flat light ground; minimal type with one accent word. The sliced figure (`makeSlices`) | sliced composite, minimal type |
| `miraclestudios-boulder` | miraclestudios__, minimalist poster collage (sent as a reference) | <https://www.instagram.com/reel/DamzkLfAFYy/> | Cover frame: a B&W photo cut-out carrying a visual metaphor (a man at a computer under a giant boulder), one large red circle and a dotted orbit as the only accent, Swiss-poster micro-typography. The idea told by one image | poster collage, visual metaphor |
| `vox-explainers` | Vox (YouTube explainers) | <https://www.youtube.com/@Vox> | Cut-out photos, torn edges, highlighted headlines, slow 3D camera over a page, masked reveals that step rather than slide | editorial collage |
| `lawrence-jordan` | Lawrence Jordan, collage films from Victorian engravings (*Duo Concertantes* 1964, *Once Upon a Time* 1973, *Sophie's Place*) | <https://brightlightsfilm.com/tableaux-vivant-notes-lawrence-jordan/> | Old engravings recombined so they move and mean something new; the print's age is part of the image | cut-out engravings, stop motion |
| `harry-smith-heaven-earth` | Harry Smith, *Heaven and Earth Magic* (1957–62) | <https://en.wikipedia.org/wiki/Heaven_and_Earth_Magic> | 19th-century catalogue cut-outs on a black ground; a spiritual ascent told only with cut pieces; sound of clocks and water as structure | cut-out on black, sound-led |
| `stacey-steers` | Stacey Steers, *Night Reels*, *Edge of Alchemy* (2017) | <https://collections.eastman.org/exhibitions/6918/stacey-steers-night-reels> | Every frame a collage of 19th-century engravings and illustrations; dense, dreamlike, handmade | engraving collage |
| `gilliam-python` | Terry Gilliam, Monty Python's Flying Circus cut-outs | <https://en.wikipedia.org/wiki/Cutout_animation> | Engravings and photos with hinged parts, stepped motion; comic timing from a stiff paper puppet | hinged cut-outs |
| `vox-director` | vox-director, an open workflow that describes the Vox look (hand-cut paper, torn edges, tape, halftone, big cut-out headlines) | <https://github.com/Alisa0808/vox-director> | Vocabulary list for the style. Its AI-image pipeline is not this engine's: cut real references | style vocabulary |

Studied frame by frame: [collage-reels-trio.md](collage-reels-trio.md).

## Repos and long-form projects

| id                       | Project                                            | Link                                                       | What to learn                                                                                                     |
| ------------------------ | -------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `pdoom`                  | John Heibel, PDoomVideo (music video, 1.1K stars)  | <https://github.com/JohnHeibel/PDoomVideo>                 | Subagents per chapter (`src/ch/`), `ANIMATION_GUIDE.md` written first, `STORYBOARD.md` after the first generation |
| `claude-animation-base`  | John Heibel, ClaudeAnimationBase (starter)         | <https://github.com/JohnHeibel/ClaudeAnimationBase>        | A minimal starting harness                                                                                        |
| `claude-animation-skill` | buildwithhanif, claude-animation-skill             | <https://github.com/buildwithhanif/claude-animation-skill> | Hand-drawn look: Node canvas rigs, pens, synthesized sound                                                        |
| `austerlitz`             | WinterArc21, Battle of Austerlitz film (long form) | <https://github.com/WinterArc21/Battle-of-Austerlitz-Film> | A long historical film built in code: chaptering, maps, armies                                                    |
| `awesome-ai-motion`      | guanmo-ai, awesome-ai-motion (prompt library)      | <https://github.com/guanmo-ai/awesome-ai-motion>           | Prompt patterns by genre                                                                                          |
| `awesome-opus-videos`    | athemeroy, awesome-opus-5-5-videos (dataset)       | <https://github.com/athemeroy/awesome-opus-5-5-videos>     | Catalog of the trend's videos; names "brief contagion" (one prompt → films that rhyme)                            |
| `hyperframes`            | HeyGen, HyperFrames (HTML + GSAP framework)        | <https://github.com/heygen-com/hyperframes>                | Read-only inspiration; this engine does not use it                                                                |
| `remotion-skills`        | Remotion, AI skills (React framework)              | <https://www.remotion.dev/docs/ai/skills>                  | Read-only inspiration; this engine does not use it                                                                |

## Hubs

| Hub                        | Link                                              | Use                                                                                     |
| -------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------- |
| whatships                  | <https://whatships.com>                           | Launch videos of products, by company                                                   |
| Dribbble — motion          | <https://dribbble.com/tags/motion_graphics>       | Motion design shots by designers                                                        |
| Competitors' launch films  | (the project's own category)                      | What the category does, so the film does not                                            |
| Movez Substack             | <https://movez.substack.com>                      | The article's author; new pieces of the trend                                           |
| Thariq on "one-shot" posts | <https://x.com/trq212/status/2102870353781641416> | Reminder: the viral "one prompt" films carry 10k-char briefs, skills, examples and keys |

## Curated by research (2026-10-08)

Picked for editorial, typographic, sober work with craft. Each link answered when checked
(Behance and Codrops block bots but open in a browser).

### Hubs: where good motion is curated

| Hub | Link | Use |
|-----|------|-----|
| Motionographer | <https://motionographer.com> | The reference blog of the motion industry: studio work, case studies, process |
| Stash | <https://www.stashmedia.tv> | Curated archive of commercials, title design, brand films since 2005 (subscription; previews free) |
| Vimeo Staff Picks | <https://vimeo.com/channels/staffpicks> | Hand-picked shorts; strong animation and title work |
| Vimeo — Kinetic Typography | <https://vimeo.com/channels/kinetictypography> | Type-led motion |
| Behance — Motion | <https://www.behance.net/galleries/motion> | Studio and freelancer projects with process boards |
| School of Motion | <https://www.schoolofmotion.com> | Articles, annual roundups (e.g. websites with great animation in 2026), craft lessons |
| Webby Awards — Best Use of Animation | <https://winners.webbyawards.com/winners/websites-and-mobile-sites/features-design/best-use-of-animation-or-motion-graphics> | Juried animation that serves the experience |
| Motion Folios | <https://motionfolios.com> | Curated motion designers' portfolios |
| It's Nice That | <https://www.itsnicethat.com> | Editorial design culture, animation and graphic design features |
| Abduzeedo | <https://abduzeedo.com> | Design and motion galleries, interviews |
| Savee | <https://savee.com> | Visual moodboarding; good for type and editorial frames |

### UI and web motion (for app moments)

| Hub | Link | Use |
|-----|------|-----|
| Mobbin | <https://mobbin.com> | Real app flows and transitions from shipped products |
| Godly | <https://godly.website> | Web design with motion, recorded as video |
| Awwwards | <https://www.awwwards.com> | Award-winning sites; scroll and transition ideas |
| Codrops | <https://tympanus.net/codrops> | Web animation demos and "Motion Highlights" roundups |
| GSAP showcase | <https://gsap.com/showcase> | Sites built on scroll/timeline motion (read-only inspiration) |
| Rive marketplace | <https://rive.app/marketplace> | Interactive state-machine animations: UI micro-motion |
| LottieFiles | <https://lottiefiles.com> | Library of UI animations; micro-interaction timing |

### Studios to study (their reels and case studies)

| Studio | Link | Why |
|--------|------|---------------------|
| Cartoon Saloon | <https://www.cartoonsaloon.ie> | *The Secret of Kells*: an illuminated manuscript brought to life; ornament, drop caps and gilt in motion |
| BibleProject | <https://bibleproject.com> | Long-form illustrated explainers in many styles; study the craft, never the look |
| Ordinary Folk | <https://ordinaryfolk.co> | Crafted brand films; made BibleProject's "Blessing & Curse" with paint strokes for meaning |
| BUCK | <https://buck.co> | Range and polish; clear explanation of complex products (Apple Card intro) |
| Oddfellows | <https://oddfellows.tv> | Illustrated, design-first storytelling |
| Giant Ant | <https://www.giantant.ca> | Warm, human brand animation |
| ManvsMachine | <https://mvsm.com> | High-end 3D and kinetic product films (Nike Air Max) |
| Gunner | <https://gunner.work> | Design-led 2D/3D brand work |
| Golden Wolf | <https://goldenwolf.tv> | Bold character and graphic animation |
| Animade | <https://animade.tv> | Playful product and brand animation, strong UI motion |
| Territory Studio | <https://www.territorystudio.com> | Screen graphics and interfaces for film |
| Kurzgesagt | <https://kurzgesagt.org> | Explainer motion: dense ideas made clear, recurring visual system |
| Apple events and product films | <https://www.apple.com/apple-events> | Launch-film restraint: type statements, product as hero |

### Code motion: tools and repos (read-only inspiration)

This engine renders on its own; these teach technique.

| Project | Link | Teaches |
|---------|------|---------|
| awesome-creative-coding | <https://github.com/terkelg/awesome-creative-coding> | Generative art, shaders, creative-coding resources |
| motion-ui-design | <https://github.com/fliptheweb/motion-ui-design> | Motion UI principles, inspiration, libraries |
| awesome-animation | <https://github.com/animatious/awesome-animation> | Open-source UI motion libraries |
| The Book of Shaders | <https://thebookofshaders.com> | Textures, noise, light: paper, grain, glow |
| Manim (3Blue1Brown) | <https://www.manim.community> · <https://www.3blue1brown.com> | Equation and glyph morphing; ideas made visible |
| Motion Canvas | <https://motioncanvas.io> | Narration-synced vector explainers, generator timelines |
| Revideo | <https://re.video> | Motion Canvas fork with a render API |
| Theatre.js | <https://www.theatrejs.com> | Keyframe sequencing UI for web animation |
