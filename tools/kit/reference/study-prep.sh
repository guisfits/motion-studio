#!/bin/bash
# Per video in <dir>/media: editing measures (editing.py) + 2 fps contact sheet + duration.
# Usage: study-prep.sh <dir>
set -u
D="$1"; X=$(dirname "$0")
for v in "$D"/media/*.mp4; do
  id=$(basename "$v" .mp4); W="$D/work/$id"
  [ -f "$W/shots.json" ] && continue
  mkdir -p "$W"
  (cd "$X" && uv run -q --with opencv-python-headless --with numpy editing.py "$v" "$W" >/dev/null 2>&1)
  ffmpeg -nostdin -loglevel error -y -i "$v" -vf "fps=2,scale=200:-2,tile=8x12" -frames:v 1 -q:v 5 "$W/sheet.jpg"
  echo "$id $(python3 -c "import json;d=json.load(open('$W/shots.json'));print(d.get('shots'),d.get('asl'),d.get('duration'))" 2>/dev/null)"
done
