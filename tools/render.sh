#!/usr/bin/env bash
# Render one composition while holding the machine-wide render lock: Chromium + WebGL renders
# collide when two run at once, so parallel agents queue here instead of racing. The same lock
# guards every other heavy job (image generation, music, TTS): one at a time on the machine.
# Usage: tools/render.sh <CompositionId> <out.mp4> [extra remotion render args]
set -euo pipefail
lock=/tmp/motion-studio-render.lock
until mkdir "$lock" 2>/dev/null; do sleep 3; done
trap 'rmdir "$lock"' EXIT
npx remotion render studio/index.ts "$@"
