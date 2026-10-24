#!/usr/bin/env bash
# Generates a neutral music bed for the sound demo: a slow two-chord pad (A minor → F major),
# synthesized with ffmpeg so no licence question arises. 48 kHz stereo WAV, 20 s.
# Output: assets/audio/bed-01.wav (gitignored: regenerate with this script).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="$ROOT/assets/audio/bed-01.wav"
mkdir -p "$(dirname "$OUT")"

# Each chord is three soft sines with a little detune; the second half switches chord with a
# 2 s crossfade via the gate expressions. A low-pass and a slow tremolo keep it a bed, not a tune.
chord() { echo "0.18*sin(2*PI*$1*t)+0.14*sin(2*PI*$2*t)+0.12*sin(2*PI*$3*t)+0.05*sin(2*PI*($1*2.003)*t)"; }
AM="$(chord 220 261.63 329.63)"
FM="$(chord 174.61 220 261.63)"
EXPR="(${AM})*min(1,max(0,(11-t)/2))+(${FM})*min(1,max(0,(t-9)/2))"

ffmpeg -loglevel error -y -f lavfi -i "aevalsrc='${EXPR}|${EXPR}':s=48000:d=20" \
  -af "lowpass=f=1200,tremolo=f=0.25:d=0.25,afade=t=in:d=1.5,afade=t=out:st=18:d=2,volume=0.6" \
  -c:a pcm_s16le "$OUT"
echo "bed-01.wav  20 s pad"
