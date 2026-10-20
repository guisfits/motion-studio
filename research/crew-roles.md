# Crew roles for AI-built Vox-style Reels: research and recommendation

Date: 2026-10-15. Marks: [own] = my inference; [snippet] = seen only in search-result text, page not opened; [gap] = no source found.

## 1. Sources

Opened (fetched and read):

1. FilmAgent, arXiv 2501.12909 — https://arxiv.org/html/2501.12909v1 — director/screenwriter/actor/cinematographer agents; Critique-Correct-Verify and Debate-Judge; human-rated ablation.
2. AniMaker, arXiv 2506.10540 — https://arxiv.org/html/2506.10540v2 — director/photography/reviewer/post-production agents; reviewer-in-loop clip selection; ablations.
3. MovieAgent, arXiv 2503.07314 — https://arxiv.org/html/2503.07314v1 — director → scene plan → shot plan agents; ablation of multi-agent vs single.
4. Anim-Director, arXiv 2408.09787 — https://arxiv.org/html/2408.09787v1 — one GPT-4 "director" driving tools; self-reflection and best-of-N selection.
5. MAViS, arXiv 2508.08487 — https://arxiv.org/html/2508.08487v5 — writer + per-aspect reviewers, 3E (Explore/Examine/Enhance) loop; strongest ablation of review loops.
6. DreamFactory, arXiv 2408.11788 — https://arxiv.org/html/2408.11788v1 — simulated animation company (CEO, director, producer, screenwriter, painter, monitor); bounded discussion, shared memory.
7. Why Do Multi-Agent LLM Systems Fail? (MAST), arXiv 2503.13657 — https://arxiv.org/html/2503.13657v3 — 14 failure modes over 1600+ traces; verification and spec failures dominate.
8. Cognition, "Multi-Agents: What's Actually Working" — https://cognition.com/blog/multi-agents-working — single-threaded writes, fresh-context reviewer; (its 2025 companion "Don't Build Multi-Agents", https://cognition.com/blog/dont-build-multi-agents, seen via search only: parallel agents make conflicting implicit decisions).
9. School of Motion, Motion Design Industry Roles — https://www.schoolofmotion.com/blog/motion-design-industry-roles-responsibilities — producer, CD, art director, director, editor, compositor, animator, concept artist.
10. Kurzgesagt, "How to make a Kurzgesagt video" (transcript on LingQ) — https://www.lingq.com/pt/aprenda-ingles-online/courses/689474/how-to-make-a-kurzgesagt-video-in-120-4887128/ — script → illustration → narration → animation → music → sound → review; 1,200+ hours.
11. Studio Liddell, Animation Production Pipeline — https://studioliddell.com/news/the-animation-production-pipeline-a-complete-guide — script → storyboard → animatic → art direction → layout → animation → compositing → sound → sign-off.
12. StudioBinder, Animatic — https://www.studiobinder.com/blog/animatic/ — animatic = storyboard + timing + dialogue/SFX/music, between board and first animation.
13. Designing Sound, Re-recording mixers vs sound designers — https://designingsound.org/2011/01/24/re-recording-mixers-vs-sound-designers/ — designer owns intent, mixer owns final balance in context.

Search-result only (not opened):

14. Script supervisor duties [snippet] — https://www.screenskills.com/media/7610/final-jd-script-supervisor-110523.pdf and https://ca.indeed.com/career-advice/finding-a-job/script-supervisor — continuity breakdowns, editor's log, line tracking.
15. Mora, arXiv 2403.13248 [snippet] — https://arxiv.org/html/2403.13248v3 — SOP-coordinated agents over open video models; own-reported VBench.
16. Vox job postings [snippet] — https://www.mediabistro.com/jobs/3539237225-animator-motion-designer-unexplainable-part-time-temporary — motion designer works under an Art Director, follows the Vox style guide.

[gap] No public write-up of Vox's or Johnny Harris's internal pipeline was found. Vox evidence is job postings only. Colourist/DP-equivalent in 2D motion design: no source found; treat as [own].

## 2. Real roles

Stage: PRE = pre-production, PROD = production, POST = post.

| Role | Owns | Deliverable | Stage | In / Out |
|---|---|---|---|---|
| Producer | Schedule, budget, approval chain, versioning, hiring. Not assets. (SoM: delivers "on time and within budget"; Liddell: producers keep the approval chain short) | Plan, schedule, sign-offs, delivery | all | In: brief, client. Out: locked scope, gates |
| Director / Creative director | Vision, final creative call, client-facing | Treatment, notes, approvals | all | In: brief. Out: direction to every dept; sign-off |
| Writer / script editor | Narrative logic, facts (Kurzgesagt: the bottleneck, expert-checked) | Locked script | PRE | In: research. Out: script to board |
| Storyboard artist | Staging, framing, flow, visual metaphors | Storyboard | PRE | In: script. Out: boards to animatic |
| Animatic editor | Timing of shots against audio/dialogue (StudioBinder, Liddell: "expensive disagreements should happen" here) | Animatic | PRE | In: boards + scratch VO. Out: timed reference |
| Art director / production designer | Visual roadmap, style guide, palette, supervises designers (SoM, Vox posting) | Style guide, concept/colour keys | PRE | In: brief. Out: guide to illustrators |
| Illustrator / asset designer | Cut-outs, backgrounds, props (Kurzgesagt: ~200 panels, 2-3 illustrators, 8-12 weeks) | Layered assets | PRE-PROD | In: boards + style guide. Out: assets to animators |
| Animator / motion designer | Motion, timing, camera moves | Animated shots | PROD | In: assets + animatic. Out: shots to comp |
| Compositor | Making elements sit together; layers, atmosphere, 2D fixes | Composited shots | POST | In: shots. Out: comp to edit/colour |
| Editor | Assembly to timeline following board/script; transitions; media management | Picture lock | POST | In: shots, VO. Out: locked cut |
| Colourist | Grade, look consistency [own: in motion design this is usually the editor/compositor or the art director's palette] | Graded master | POST | In: lock. Out: master |
| Sound designer | Intent: which sounds exist and why | SFX/ambience, temp mix | POST | In: animatic/lock. Out: stems |
| Composer / music supervisor | Score or licensed music (Kurzgesagt: original songs) | Music stems | POST | In: animatic. Out: stems |
| Re-recording mixer | Final balance of dialogue, VO, SFX, music in context | Final mix | POST | In: stems + locked picture. Out: mix |
| Script supervisor | Continuity: what was shot vs script, line tracking, editor's log, screen-time estimate [snippet] | Continuity breakdown, logs | PRE-PROD | In: script. Out: notes to editor |
| QA / review / sign-off | Format, sync, naming, version control (Liddell: render can look complete yet fail delivery) | Approved master | POST | In: master. Out: delivery |

Findings on the client's list:
- Producer is mis-scoped. Real producers own schedule, budget and approvals, not images or cut-outs. Asset prep is the illustrator/asset designer (under an art director). [verified: SoM, Liddell]
- Cinematography in 2D is split: palette/texture belongs to the art director; camera and zoom to the animator/layout; grade to editor or colourist. [own for the mapping]
- Editor does not own "zooms and effects" in a real studio; animators and compositors make motion, the editor assembles and times it.
- Sound engineer bundles three jobs: designer (intent), editor (clean), mixer (balance). Narration recording/timing belongs earlier, with the animatic.
- Missing from the client's list: writer, storyboard + animatic, script supervisor (continuity), QA/sign-off. These are where our recorded failures sit.

## 3. Multi-agent findings

| Paper | Roles | Loop / talk | Result | Failure modes noted |
|---|---|---|---|---|
| FilmAgent (2025) | Director, screenwriter, actors, 2 cinematographers | Critique-Correct-Verify (max 3 iterations); Debate-Judge for shots; text-only | Human avg 3.98 (Group) vs 3.04 (Solo, same GPT-4o) vs 3.30 single o1; plot 1.87→3.53, camera 2.07→3.53. 15 ideas only; no per-loop ablation | Hallucinated actions, scene inconsistency, repeated static shots; critiques are text-only so visual errors unchecked; no music/grade/edit roles |
| MovieAgent (2025) | Director → scene plan → shot plan (+ screenwriter, storyboard, location) | Sequential hand-off of typed artifacts, CoT rationale carried forward | Multi-agent 3.55→3.72, +CoT 3.82 (3 movies, human rating). Small | Weak background consistency, abrupt transitions; 10-prompt benchmark |
| AniMaker (2025) | Director, photography, reviewer, post-production | Reviewer scores clip in context of neighbours; MCTS best-of-N | AniEval +14.6% over best baseline; human 3.22 vs 2.07; single candidate −7.1%; selecting with VBench instead of reviewer −4.6% | "Large gap to commercial quality"; VBench rewards static output; narrow eval (10 stories) |
| MAViS (2025) | Writer + structure/content/style reviewers; shot designer+reviewer; evaluators/refiners per stage; voice designer+reviewer | 3E loop, per-aspect reviewers, capped iterations (1-5) | Removing structure reviewer: narrative 34.0→13.7; compliance 84.5→100 (shot), 56.5→100 (subtitles); overall success 0.49→0.86 | Cost (13.6 h on 2 H100 for one video); evaluators are MLLMs, not fully reliable; no dialogue, SFX or editing |
| DreamFactory (2024) | CEO, director, producer, screenwriter, filmmaker, reviewer; painter/monitor | Bounded rounds (forced stop), shared "local memory", base-frame description | Cross-scene metrics beat script-only baseline (CSFD 0.89 vs 0.77); no ablation | Not creative; output can feel like an assembly of clips |
| Anim-Director (2024) | One GPT-4 director calling tools | Self-reflection plus best-of-N with metric filter | Without image/video enhancement: coherence 0.87→0.82, distortion 0.74→0.67; auto metrics only | Tools not controllable; choppy transitions |
| Mora (2024) [snippet] | Specialist agents per task under SOPs | SOP hand-offs | Self-reported VBench near Sora | Own-reported, not independently checked |
| MAST (2025) | (taxonomy, not a film system) | — | Failures come mostly from system design and inter-agent misalignment, not model limits | Step repetition 15.7%, reasoning-action mismatch 13.2%, ignoring termination 12.4%, disobeying spec 11.8%, incorrect verification 9.1%, no/incomplete verification 8.2% |
| Cognition (2025-26) | Writer + fresh-context reviewer | Writes stay single-threaded; reviewer sees only the output | Reviewer finds ~2 bugs/PR, ~58% severe (no baseline given) | Parallel writers make conflicting implicit decisions |

Takeaways:
- Gains are real but evaluated on tiny sets (10-20 prompts) with LLM or small human raters, mostly by the authors. Treat as directional.
- What helped most is a separate reviewer checking against an explicit rubric (MAViS per-aspect reviewers, AniMaker contextual reviewer, FilmAgent director critique), not extra "creative" roles.
- Typed hand-off artifacts (MovieAgent sub-script → scene → shot; DreamFactory shared memory) reduce drift.
- Cap iterations (FilmAgent 3, MAViS 1-5, DreamFactory 5 ideas). MAST shows unbounded loops and weak verification are common failures.
- Nobody covers sound mixing, grade or editing well (FilmAgent, MAViS say so explicitly). That is our actual pain point, so no paper answers it. [own]
- Reviewer needs the picture, not just text: FilmAgent's critiques were text-only and missed visual errors. [own link to our "dead frames / unreadable captions"]

## 4. Recommendation [own, built on sections 2-3]

Principle: roles are artifact owners, not personas. Keep a role only if it has a checkable deliverable and a gate. One writer of the timeline at a time (Cognition); reviewers are read-only with fresh context.

| Role | Action | Owns | Hand-off artifact (out) | Gate to pass |
|---|---|---|---|---|
| Director | Keep (human-facing, one voice) | Vision, one-line message per beat, final verdict | Brief with beat list (what the viewer must grasp per beat) | Owner approves brief |
| Writer / script | Add (client list lacks it) | VO text, facts | Locked script, per-beat | Fact + length check (60-90 s at VO pace) |
| Sound (VO first) | Merge narration timing into pre-production | VO audio, word timestamps | VO file + timing JSON | VO duration matches budget |
| Storyboard + script supervisor | Add; merge into one artifact | Voice = picture = lettering per beat | Sync sheet: per beat: VO words, on-screen picture, caption text, zoom target, hierarchy (hero/support), time range | Every VO noun has a picture; no beat without hero; no placeholder asset |
| Art director (cinematography here) | Rename client's "cinematography" | Palette, texture, paper relief, type scale, caption legibility rules | Style tokens + caption spec | Contrast/size check on caption spec |
| Asset designer (client's "producer") | Rename | Cut-outs, backgrounds, no placeholders | Asset manifest (id, file, source, status) | Manifest has zero placeholder/missing |
| Animatic | Add (cheap, before render) | Timing + framing at low res | Low-rate render of the cut on the voice, plus a one-still-per-beat contact sheet | Owner or fresh reviewer watches; fix here, not after render |
| Motion/camera (client's "editor: zooms") | Split from editor | Zoom/push/pan per beat, motion purpose | Shot list with camera moves tied to sync-sheet focus | Each move lands on the hero of that beat |
| Editor / assembly | Keep, narrower | Timeline, transitions, pacing | Picture-locked render | No dead frame (frame-difference scan) |
| Sound designer + mixer | Keep, after picture lock | SFX, music, levels | Final mix | Loudness + VO intelligibility check |
| Fresh-eyes reviewer (QA) | Add; mandatory | Watches render and reads frames against sync sheet | Defect list ranked by severity (not fixes) | Zero severe defects; max 2 fix rounds |
| Producer | Keep as orchestrator only | Order, budget (tokens/time), gates, iteration caps | Run log | — |

Order: 1 Director brief → 2 Writer script → 3 VO + timestamps → 4 Sync sheet (storyboard + continuity) → 5 Art direction tokens + asset manifest → 6 Animatic → [owner glance] → 7 Motion/camera shot list → 8 Render + edit → 9 Sound → 10 Fresh-eyes review → 11 Fix rounds (≤2) → 12 Deliver.

Mapping to our failures:

| Failure | Role/gate that catches it |
|---|---|
| Picture–voice mismatch | Sync sheet + animatic check |
| Unreadable captions | Art director caption spec + review |
| Weak zooms | Camera shot list tied to hero of beat |
| Placeholders shown | Asset manifest gate + reviewer |
| No hierarchy | Sync sheet hero/support field |
| Dead frames | Frame-diff scan at assembly + reviewer |

Trade-offs:
- Each extra role adds a hand-off where contradictions enter (MAST: spec and role disobedience, reasoning-action mismatch). Counter with typed artifacts, one owner per field, and the sync sheet as the single source of truth that every stage reads.
- Collapse where possible: Director + Producer can be one orchestrator; Art director + asset designer share one style-token file; Editor + camera can be one agent if the shot list is fixed upstream. Keep Reviewer separate, always (fresh context is the point).
- Do not run roles in parallel on the same files; parallelize only read-only checks and independent asset generation.
- Cap review at 2 fix rounds; require reviewer output as a ranked defect list with frame references, not free prose.
- Expect little help from literature on sound/edit quality; rely on deterministic checks (loudness, caption contrast, frame-diff, manifest completeness) instead of LLM opinion where possible. Papers show LLM verifiers often check superficially (MAST 9.1% incorrect, 8.2% incomplete verification).
