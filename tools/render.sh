#!/usr/bin/env bash
# Render one composition while holding the machine-wide render lock: Chromium + WebGL renders
# collide when two run at once, so parallel agents queue here instead of racing. The same lock
# guards every other heavy job (image generation, music, TTS): one at a time on the machine.
# The lock records its holder's PID (tools/heavy-lock.sh), so a lock left by a killed job is broken.
# Usage: tools/render.sh <CompositionId> <out.mp4> [extra remotion render args]
set -euo pipefail
source "$(dirname "$0")/heavy-lock.sh"
heavy_lock_acquire "render.sh $*"
npx remotion render studio/index.ts "$@"
