#!/usr/bin/env bash
# Render S01-S03 alone through the private entry (same lock as tools/render.sh). Run from the engine root.
set -euo pipefail
lock=/tmp/motion-studio-render.lock
until mkdir "$lock" 2>/dev/null; do sleep 3; done
trap 'rmdir "$lock"' EXIT
npx remotion render studio/films/clone-van-gogh/lib/s01-03-entry.tsx S0103 studio/films/clone-van-gogh/out/s01-03.mp4 "$@"
