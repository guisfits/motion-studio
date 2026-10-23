# Remotion official skills — source

| field | value |
| ----- | ----- |
| repo | https://github.com/remotion-dev/skills |
| commit | `6c67adcd9cdbe6eb84d76342da89b225f9161cb2` (2026-10-22) |
| checked | 2026-10-23 |
| licence | none declared (`gh api repos/remotion-dev/skills --jq .license` → `null`; no licence in README or package.json) |

No licence means no right to redistribute, so the skills are **fetched, not committed**:
`tools/skills/sync-remotion-skills.sh` downloads the pinned commit into `skills/remotion/<skill>/`
(gitignored). Re-check the licence when bumping the pin; if one that permits redistribution
appears, the copies may be committed instead.

Skills at the pin: remotion-best-practices (router), -captions, -create, -docs, -interactivity,
-maps, -markup, -multimedia, -render, -saas, -studio, -upgrade.
