# Sources

Grouped by what they taught. **Primary** = the practitioner speaking; **craft** = tutorial /
breakdown literature; **standard** = measured or published norm; **third-party** = secondhand
description of Vox, used only to triangulate; **studies** = the frame-and-audio studies in `inspirations/`.
Pages that returned HTTP 403 to the research fetcher are listed with what the search excerpts yielded.

## Primary: Vox producers and alumni

| Source | URL | Taught |
|---|---|---|
| Joss Fong, "Videogram: How a Vox video explains the first photo of a black hole" (The Open Notebook, 2020) | https://www.theopennotebook.com/2020/01/07/videogram-how-a-vox-video-explains-the-science-behind-the-first-photo-of-a-black-hole/ | Question-before-reveal structure; "viewer can't glance back"; VO phrases as absorption pauses; "can't afford to be too clever"; music change every ~20 s; music competing with voice pitch; script editors flag confusion; Google Earth Studio camera "not too crazy" |
| Joss Fong, Video Consortium "In Sync" ep. 1 | https://videoconsortium.org/mag/episode-1-joss-fong | Explainer owes coverage + a moment that sticks; breathers; host "there for a reason, not a crutch"; perfect audio–visual correspondence aids retention; don't copy what exists |
| Joss Fong, Storybench interview (Howtown) | https://www.storybench.org/?p=24033 | 6-week feature, half research; stand-in-for-audience device; printed data viz walked through on camera; evidence over sensationalism |
| Joss Fong, The Gradient podcast page | https://thegradientpub.substack.com/p/joss-fong-videomaking-ai-science-communication | Outline only (mental models, meeting viewers in the middle); one quote on balanced explainers |
| Joe Posner, Video Consortium "In Sync" ep. 10 | https://videoconsortium.org/mag/episode-10-joe-posner | "Understand the news" → "Be curious"; one person owns a video; "can't bell and whistle your way out of a story"; Klein's intelligence/information rule; audience smarter than assumed |
| Nieman Lab, Vox video team profile (2016) | https://www.niemanlab.org/?p=124626 (403; via search excerpts) | Posner's "no desks" rule; skepticism of interviews; one-person pitch-to-publish; videos stand alone across platforms |
| Press Gazette, "Vox YouTube" (Mona Lalwani) | https://pressgazette.co.uk/vox-youtube/ | "Visual clarity"; style *and* substance; not breaking news; "over-deliver on context", "memorability factor"; ideas start from "what do you want to know"; 20 staff / 12 creator-journalists; 5–15 min medium form; >2M avg views |
| The Long Story, "Why the best journalists on YouTube are all former Vox employees" | https://thelongstory.substack.com/p/why-the-best-journalists-on-youtube | Visual-first gate (stock over narration doesn't qualify); video-first scripts; "animated opinion essay" origin; generalist model; alumni carry-over; Howtown Shorts adaptation lifted long-form views |
| Estelle Caswell, Film Independent interview (2018) | https://www.filmindependent.org/blog/explainer-an-interview-with-vox-pop-video-essayist-estelle-caswell/ | Pitch 3 ideas (headline + synopsis); original dataset before pitching; story editor checks the script "works visually"; "the whole point of video is you're talking about the thing onscreen"; script 4–5 d, build 7–10 d, ~3 weeks |
| Estelle Caswell, The Next Web (2019) | https://thenextweb.com/tnw2019/2019/05/07/earworm-youtube-music-dancing-about-architecture/ | Topic must be interesting *and* visually appealing; construction over biography; outside collaborator for data viz |
| Storybench, Vox art director (Sendaydiego) on animation | https://www.storybench.org/?p=21229 | Recurring visual anchor; accuracy (maps checked); never sanitise grim stories; polish makes it "resemble an ad"; art direction per topic (construction paper, protest posters); 1–2 videos/week, 2–3 weeks each; ~4 min watch time target |
| Cleo Abram, Video Consortium ep. 8 | https://videoconsortium.org/mag/episode-8-cleo-abram | Find "the visual that helps viewers understand it"; three-column script (ears / eyes / sources); never fill a gap with on-camera talk; standalone one-point clips beat promos in short form; avoid grey-and-neon |
| Phil Edwards, The Explainers profile | https://theexplainers.substack.com/p/making-the-trivialnontrivial-how | "Rosetta stone" document; research done when it repeats; visuals-first writing; thumbnail + headline greenlight; 2-week cycle; archival animated for momentum |
| Johnny Harris, journalism.co.uk (Borders) | https://www.journalism.co.uk/how-a-vox-reporter-uses-social-audiences-to-inspire-his-latest-video-series/ and https://www.journalism.co.uk/vox-continues-to-expand-its-network-crowdsourcing-for-its-latest-documentary-series/ | Outline in hard copy before the shoot to capture planned visuals; four weeks of pre-reporting; audience-sourced reporting |
| Johnny Harris, Adobe MAX 2025 session page | https://www.adobe.com/max/2025/sessions/scrappy-smart-and-human-the-future-of-storytelling-os558.html | "Scrappy, visual-first"; curiosity over clicks (promo copy) |
| Contently on Vox producers' independence | https://contently.com/2019/01/09/brands-publishers-video-creators/ | Producers create independently of reporters (Klein/Posner) |

## Craft: tutorials and breakdowns

| Source | URL | Taught |
|---|---|---|
| PremiumBeat, "Replicating Vox motion graphics" | https://www.premiumbeat.com/blog/replicating-vox-motion-graphic/ | 12 fps graphics in a 24 fps edit; text a few frames behind its plate; zoom-through with 3D camera + short blur spike; torn lower-third mask reveal; 5–6 textures cycling 2–3/s; chromatic aberration + Gaussian 3.5 at edges, feather 50, "occasional" |
| Adobe Community threads on Posterize Time / 12 fps nested comps | https://community.adobe.com/questions-529/after-effects-why-set-posterize-time-to-12-fps-in-24fps-comp-54684 | Preserve-frame-rate nesting vs Posterize Time; stepped graphics over a smooth background to avoid judder |
| NoFilmSchool, Vox-style map in After Effects | https://nofilmschool.com/how-create-vox-style-map-animations-after-effects | Storyboard the camera first; Google Earth Studio → AE; desaturate + Lumetri vignette; Posterize Time 10 fps; 16 mm grain Overlay 35 % |
| Motion Array, "3 Johnny Harris style tips" | https://blog.motionarray.com/learn/premiere-pro/edit-documentary-in-premiere-pro/ | Slide-in over 8 frames with blur 50→0 + projector SFX; match cut on text with ≥ 12 images, clips shortening from 8 f, camera click per cut; texture overlays via blend mode + blurred inverted mask; Harris layers texture, film burns, light leaks, grain |
| Motion Array, 2.5D parallax | https://blog.motionarray.com/learn/after-effects/animate-flat-2d-images-after-effects/ | Cut layers, paint hidden background, camera moves not layers, subtle secondary motion, grain to sell it, choose shallow-DOF images |
| Filmbro / Tuts+ parallax | https://www.filmbro.com/blogs/tutorials/how-to-create-a-2-5d-fake-3d-parallax-effect-in-after-effects ; https://photography.tutsplus.com/tutorials/how-to-make-25d-animation-in-after-effects--cms-41295 | Same workflow, Photoshop clean-up first |
| Ben Marriott paper cut-out (lesterbanks write-up) | https://lesterbanks.com/2020/02/an-easy-way-to-get-a-paper-cutout-stop-motion-look-in-ae/ | Wiggle Paths driven by a posterised expression; low update rate = stop-motion edge; wiggle position/rotation so everything shares the look |
| Ben Marriott animated grain (lesterbanks) | https://lesterbanks.com/2019/08/how-to-use-roughen-edges-for-animated-grain/ | Mask + matte + Roughen Edges for living grain |
| Ben Marriott Gumroad (Textures / Paper Cutout) | https://benmarriott.gumroad.com/l/DOFSr ; https://benmarriott.gumroad.com/l/NDtPol | Project files exist; settings are in the videos |
| Jake Bartlett, "The Paper Cutout Look" (Skillshare) | https://www.skillshare.com/en/classes/the-paper-cutout-look-in-adobe-after-effects/239727349 (403) | Shadowbox cut-out with textures via track mattes (from listing) |
| Motion Array, stop-motion style | https://motionarray.com/learn/after-effects/stop-motion-style-animation-in-after-effects/ (403) | Posterize Time + wiggle (from excerpt) |
| Tuts+ / Lucke, texture on animation | https://photography.tutsplus.com/tutorials/how-to-add-texture-to-animations-in-after-effects--cms-107120 | Paper texture behind, low opacity, rotation + wiggle posterised ~4 fps |
| Collage/paper texture guides | https://npm.vehikl.com/blog/create-authentic-newspaper-print-texture-in-photoshop-1764800446 ; https://earthshards.com/tag/pale-papers/ | Halftone blur + ink bleed + off-white paper = print; scan your own papers; coffee-aged tints |
| CSU Stanislaus brand guide (cut-outs) | https://www.csustan.edu/brand/visual-identity/graphic-elements | Cut-outs break the border, sit in front of text, anchor a collage; recolour a texture to add depth |
| Drop shadow basics | https://www.websiteplanet.com/glossary/website-builders/what-is-a-drop-shadow/ ; https://support.apple.com/guide/motion/motn68ab0c73/mac ; https://www.redsharkdigital.com/news/how-to-create-layered-cut-out-paper-in-adobe-illustrator | Offset/blur meaning; consistent light source; layered paper stack casting onto the layer beneath |
| Easing guides | https://madegooddesigns.com/motion-design-principles/ ; https://www.graduateschool.edu/learn/premiere-pro/animation-principles-motion ; https://uxdesign.cc/a-guide-to-motion-design-principles-7f05f10ccd79 | Ease-out enter / ease-in exit / in-out within frame; overshoot for playful only; 200–500 ms UI moves; secondary lag |
| Walter Murch, Rule of Six (StudioBinder, NoFilmSchool) | https://www.studiobinder.com/blog/walter-murch-rule-of-six/ ; https://nofilmschool.com/2016/11/6-rules-good-cutting-according-oscar-winning-editor-walter-murch | Emotion 51 % > story > rhythm > eye trace > 2D > 3D; break the lowest first |
| Editing grammar lecture, "When to cut" | https://mhadimedia.notion.site/Editing-Grammar-Technical-Craft-Lecture-3-2639240bd799808c958eda9e75037412 | A move must promise new information or it is unmotivated |
| Ken Burns practice (forums/docs) | https://community.adobe.com/t5/premiere-pro-discussions/how-to-make-smooth-ken-burns-zoom-in-out-effect-in-premiere-but-so-really-professional/m-p/11122538 ; https://www.mintlify.com/francozanardi/movielite/api/vfx/zoom | No published rate; subtle + hand-shaped curve preferred; 1.0→1.3 cubic as a code default. Our 5–20 % / ≤ 2 %/s is inference |
| Paul Bradshaw, Journalism Recipe Book, "Explainer" | https://github.com/paulbradshaw/journalismrecipebook/blob/main/explainer.md | Explainers answer what/how; start from a news question; lists as a format |
| JEA, "What is an explainer video?" | https://jea.org/digital-media/what-is-an-explainer-video/ | Set up the question, make them need the answer, then information, then CTA; "explain it to a friend, start with so" (secondhand) |

## Standards and studies

| Source | URL | Taught |
|---|---|---|
| Torcoli, Freke-Morin, Paulus, Simon, Shirley (2019), "Preferred levels for background ducking…", JAES 67(12) | https://salford-repository.worktribe.com/output/1371938/background-ducking-to-produce-esthetically-pleasing-audio-for-tv-with-clear-speech ; https://aes2.org/publications/elibrary-page/?id=20711 | ≥ 10 LU commentary over music, ≥ 15 LU over ambience; non-experts want +4 LU; 22 listeners; highly personal preferences |
| IRPR Sound, explainer / YouTube checklists | https://sounddesign.irpr.agency/guides/sound-design-checklist-for-explainer-videos/ ; https://sounddesign.irpr.agency/guides/how-to-mix-audio-for-youtube/ | -14 to -16 LUFS web; dialogue → foley → ambience → music → mix; lock picture first; check on real devices |
| Openclip, audio ducking | https://openclip.app/learn/audio-ducking.md | 15–25 dB duck; attack 10–30 ms; release 200–500 ms; -14 LUFS |
| Ducking timing guide (0–1.1 s lead, 0.2 s ramp) | https://v48tuyih0eytvyiwyd84kwv0.core.boriel.com/010b611d-cc0e-45c9-bcb9-c7a38dbf4dfb?page=8 (provenance unclear) | Start the dip before the first word; 0.2 s ramp; SFX ≈ 6 dB under dialogue (weak) |
| DCMP Captioning Key | https://dcmp.org/captioningkey/print | ≤ 2 lines; 40 f min, 6 s max; 130–160 wpm by level; sans medium white mixed case, rim shadow, translucent box; bottom, move up if covering faces/graphics; line-break rules |
| BBC Subtitle Guidelines (via summaries) | https://clevercast.com/bbc-subtitling-guidelines ; primary https://bbc.github.io/subtitle-guidelines/ | 160–180 wpm ≈ 0.33–0.375 s/word; ≤ 2 lines; line ≤ 68 % of 16:9 width |
| WCAG 1.2.2 summaries | https://blog.equally.ai/developer-guide/captions-prerecorded/ ; https://boia.org/blog/open-vs.-closed-captions-which-is-more-accessible | Captions Level A; open captions acceptable where closed unsupported; not screen-reader readable |
| Verizon Media + Publicis caption survey (via 3Play, Streaming Media) | https://www.3playmedia.com/blog/verizon-media-and-publicis-media-find-viewers-want-captions/ ; https://www.streamingmedia.com/Articles/News/Online-Video-News/80-of-Video-Caption-Users-Arent-Hearing-Impaired-Finds-Verizon-131860.aspx | 69 % watch muted in public, 25 % in private; 80 % more likely to finish with captions; 80 % of caption users not hearing-impaired; stated preference, not measured watch time |
| Reels safe-zone guides (unofficial) | https://www.firstpier.com/resources/instagram-ad-safe-zones ; https://www.trymypost.com/blog/instagram-reels-safe-zones-text-placement-2026 ; https://socialsizes.io/instagram-reels-size/ | Central 1080×1350 as the all-clear box; ~250 px top, 280–420 px bottom, ~120 px right |
| Reels/Shorts length and retention (marketing, directional only) | https://www.opus.pro/blog/ideal-instagram-reels-length ; https://klap.app/blog/how-long-should-reels-be ; https://www.bytecap.io/research/youtube-shorts-retention-benchmarks ; https://contentstudio.io/blog/youtube-shorts-analytics-guide | 7–15 s vs 15–30 s retention claims (unsourced); total-seconds-watched vs completion trade-off; Shorts "swiped away vs stayed"; 25–35 s cluster; no official threshold |
| Voiceover rate vendors | https://breadnbeyond.com/how-many-words-does-a-60-seconds-explainer-video-needs/ ; https://sounddesign.irpr.agency/tools/voiceover-word-count-calculator/ ; https://www.stimme24.com/en/blog/hire-explainer-video-voice-over/ | 140–160 wpm default; 110–130 technical; ~200 not recommended; 60 s ≈ 140–150 words |

## Third-party descriptions of "Vox style" (triangulation only)

| Source | URL | Taught |
|---|---|---|
| Korpi AI blog | https://korpi.ai/blog/how-to-make-vox-style-explainer-videos | One question → one answer; one graphic idea per scene; one number per scene; cut-outs slide in with paper shadow; red underline swipe; hero slow push-in; music off by default; captions on dark paper tag; name sources |
| Easy-Peasy AI guide | https://easy-peasy.ai/blog/how-to-make-vox-style-videos-with-ai | Attributes "no desks, no talking-head backbone" to Posner (matches Nieman) |
| CK42BB vox-explainer-skill (GitHub) | https://github.com/CK42BB/vox-explainer-skill/blob/main/SKILL.md | Beat = 1–3 sentences, 8–14 s + one visual (a tool's design, not Vox's) |
| Wavemaker "Vox explainer" template | https://wavemaker.adwave.com/video-styles/news_explainer | Maps + charts + authoritative narration building an argument (marketing copy) |
| Kurzgesagt overviews | https://vidpros.com/9-best-youtube-channels-for-explainer-videos-on-tough-topics | Flat vector, gradients, abstract shapes = the *other* school; excluded from this style |

## Studies (`inspirations/`, measured)

| File | Taught |
|---|---|
| `inspirations/zhylin-five-vox-tricks.md` (Denys Zhylin, "5 tricks from Vox", 62.5 s) | Five tricks (visualize everything, motion design to explain, constant motion, seamless transitions, the mix); 71 cut events, ~30 shots, 5.5 s longest hold; -14.1 LUFS, LRA 1.5; ~1 SFX per 6 s on cards/transitions; reusable chapter card; host returns 3× |
| `inspirations/earn-edits-account.md` (12 reels, 5 A-grade) | 27–47 s; 2.25–3.0 wps; hook whole by 4.5 s; turn at ~50 %; beats 2–4 s; hero hold 5–17.8 s; 2–4-word captions + 1–3-word titles; one ground per idea; ≤ 2 accents; -14.1 to -15.0 LUFS, LRA 1.1–2.6; CTA ≤ 11 words, 4.9–5.8 s; calm closing beat |
| `inspirations/chrismoran-account.md` (12 reels) | 37–50 s; ASL 1.6–3.2 s; "Look at this" hooks with one red arrow; claim → take it away → steps → recap; captions avg 2.4 words in a fixed box at ~82 %; one accent per reel; 40–50 % screen recording held 1.5–4 s; voice only, no music, SFX nil; CTA as last line, hard cut; ≤ 2 moves per scene, ≤ 3 elements |
| `inspirations/collage-reels-trio.md` (3 reels) | Layered scans, dark grey not black, tint, texture; subject in front of a giant word; one red arrow; one object one word; giant word cropped at the edge; red disc as the only accent; lead + key captions |
