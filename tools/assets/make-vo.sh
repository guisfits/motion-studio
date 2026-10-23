#!/usr/bin/env bash
# Generates the three demo voice-over lines with macOS `say` and converts them to 48 kHz mono WAV.
# Output: assets/audio/vo-01.wav .. vo-03.wav (gitignored: regenerate with this script).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="$ROOT/assets/audio"
VOICE="Daniel"

LINES=(
  "In the beginning was the word, and the word was written by hand."
  "Every map is an argument about what matters."
  "What the engraver cut in wood, we now cut in light."
)

mkdir -p "$OUT"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

for i in "${!LINES[@]}"; do
  n="$(printf '%02d' $((i + 1)))"
  say -v "$VOICE" -o "$tmp/vo-$n.aiff" "${LINES[$i]}"
  ffmpeg -loglevel error -y -i "$tmp/vo-$n.aiff" -ar 48000 -ac 1 -c:a pcm_s16le "$OUT/vo-$n.wav"
  echo "vo-$n.wav  ${LINES[$i]}"
done
