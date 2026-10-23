# Archive

Retired agent skills, kept for reference only (2026-10-15). Nothing here is loaded by a film.

- `skills/vox/` — `vox-style-animation`, `vox-critic`, `explainer-script`: the editorial-collage style skills.
- `skills/motion-graphics/` — `motion-graphics`.

Why: one large style skill let details slip; films are now made by the crew in `skills/film-*`
(start at `skills/film-director`), with measured gates in `tools/checks/`. The crew was written from
craft research, not from these files; rules may be carried over from here only after a review with
the owner, each tagged with its source.

## engine-v1/ — the HTML engine (2026-10-23)

The Playwright + ffmpeg engine (a film = an HTML page with `draw(t)`): stage, server, render,
board, templates, the `vox` and `motion-graphics` style layers, `examples/`, the `motion-engine`
skill and their tests. Replaced by Remotion as the core. Frozen: nothing here runs, and paths
inside it still point at the old layout (its own `README.md` describes it).

To re-render a film made with it, check out the tag: `git checkout engine-v1`.

The tools that outlived it moved to `tools/` (audio, kit + reference, checks, critique).
`core/lib/{table,rig,motion,texture,torn,voice,phone,clip}.js` and `core/fonts/` stay in place as
porting reference until the end of phase 1.
