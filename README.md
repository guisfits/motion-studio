# motion-studio

A technique library for code-rendered documentary and explainer films, built on
[Remotion](https://www.remotion.dev). Remotion is the core: rendering, effects, transitions,
captions, 3D and the Studio. motion-studio adds what Remotion does not ship: the techniques a
paper-collage film is made of (camera travelling over a 2D world, multiplane parallax, paper
motion, voice-timed type, diagrams, cut-out rigs), the tools around a render (sound mix,
cut-outs, checks, contact sheets) and the agent skills that make a film from a brief.

It knows technique, not style. A project brings its own identity (palette, fonts, pictures,
copy) and builds its films on top.

| Layer | What it is | Where |
|-------|------------|-------|
| **Remotion** | Render, effects, transitions, captions, 3D, Studio | `node_modules/remotion`, `@remotion/*` |
| **motion-studio** | Technique components, tools, skills, one demo per technique | `src/`, `tools/`, `skills/`, `studio/` |
| **your project** | Style and brief: formats, look, picture library, films | your repo |

## Tools

- `tools/audio/` — SFX library and cue thinning, synthesized score, voice/music/SFX mix
  (`node tools/audio/fetch-sfx.mjs` fetches the Mixkit files; they are never committed).
- `tools/kit/kit.mjs` — builds a cut-out kit from a `catalog.json` (`--kit DIR`, or
  `$MOTION_KIT`): fetches sources, cuts pieces with `tools/kit/reference/cutout.swift`, draws
  contact sheets.
- `tools/checks/` — measured gates (cues, legibility, media loudness, picture, rhythm, sync).
- `tools/critique/sheets.mjs video.mp4` — contact, phone-size, strip and loop sheets.

## Render

Demo T09 needs `assets/audio/vo-01..03.wav`, which are gitignored. Generate them once with
`npm run assets` (macOS: `say` + ffmpeg). `npm run check:assets` fails with that hint when they
are missing, and `npm run render` runs it first (npm `prerender` hook).

## Repository

```
src/          technique library entry (`src/index.ts`); `src/film/` the film contract; tests in `src/__tests__/`
studio/       Remotion Studio root and the technique demo compositions
studio/films/ films: film.json + Film.tsx + trace.ts + film.test.ts per film (`docs/film-contract.md`; `example/` is the reference)
assets/       public-domain fixtures for the demos (`assets/README.md` lists source and licence)
tools/        audio, kit (+ reference/), checks, critique (each with tests/); assets/make-vo.sh; skills/sync-remotion-skills.sh
skills/       the film crew (start at skills/film-director)
research/     evidence the crew cites (research/README.md) and the technique catalogue
tutorials/    teachers' lessons; caches local
inspirations/ finished pieces by register; caches local
archive/      engine-v1 (the HTML engine) and retired skills, frozen (archive/README.md)
```

## Tests

```bash
npm test             # vitest over src/
npm run typecheck    # tsc --noEmit
npm run test:tools   # node --test over tools/*/tests
```

The beat test runs when `.venv/bin/python` (or `$MOTION_PYTHON`) has librosa.

## Licence

MIT for the code (`LICENSE`). Fonts and sounds keep their own licences: see `CREDITS.md`.

Remotion itself is not MIT: it is free for individuals and for companies of up to three people,
and larger teams need a company licence (<https://www.remotion.dev/license>). Using motion-studio
means using Remotion, so check which tier applies to you.
