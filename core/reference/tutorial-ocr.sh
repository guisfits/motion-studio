#!/bin/bash
# Per reel: 2 fps full-res frames -> Vision OCR -> ocr.txt (every frame's text, with its second)
# and ocr-values.txt (deduplicated lines that carry a setting: digits, %, px, fps, or an After
# Effects word). Usage: ocr-all.sh <moran-dir>
set -u
D="$1"; O=$(dirname "$0")/ocr
for v in "$D"/media/*.mp4; do
  id=$(basename "$v" .mp4); W="$D/work/$id"
  [ -f "$W/ocr-values.txt" ] && continue
  F="$W/ocr-frames"; mkdir -p "$F"
  ffmpeg -nostdin -loglevel error -y -i "$v" -vf fps=2 -q:v 2 "$F/f-%04d.jpg"
  "$O" "$F"/f-*.jpg | awk '/^## /{split($2,a,"[-.]"); t=(a[2]-1)/2; next} {print t"s\t"$0}' > "$W/ocr.txt"
  # Keep lines with a value or a tool word; drop exact repeats of the previous kept line.
  awk -F'	' 'BEGIN{IGNORECASE=1} { t=tolower($2); if (t ~ /[0-9]|%|px|fps|blend|multiply|screen|overlay|opacity|blur|noise|wiggle|posterize|keyframe|ease|displace|turbulent|fractal|gradient|mask|matte|feather|threshold|radius|intensity|amount|scale|rotation|position|grain|halftone|levels|curves|tint|hue|saturation|exposure|glow|shadow|expression|effect|preset/ && $2!=prev) {print; prev=$2} }' "$W/ocr.txt" > "$W/ocr-values.txt"
  rm -rf "$F"
  echo "$id $(wc -l < "$W/ocr-values.txt") value lines"
done
