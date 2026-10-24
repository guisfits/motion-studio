#!/usr/bin/env bash
# Render one composition while holding the machine-wide render lock: Chromium + WebGL renders
# collide when two run at once, so parallel agents queue here instead of racing.
# Usage: tools/render.sh <CompositionId> <out.mp4> [extra remotion render args]
set -euo pipefail
lock=/tmp/motion-studio-render.lock
until mkdir "$lock" 2>/dev/null; do sleep 3; done
trap 'rmdir "$lock"' EXIT
npx remotion render studio/index.ts "$@"
