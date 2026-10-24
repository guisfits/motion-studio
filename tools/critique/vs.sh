#!/usr/bin/env bash
# Side by side, reference left / clone right, for a frame range — the comparison sent to the owner.
# Usage: tools/critique/vs.sh <ref.mp4> <clone.mp4> <from> <to> <out.mp4> [--slow] [--audio]
#   <from>/<to>: frames of the reference (to exclusive); the clone is cut at the same frames.
#   --slow: half speed (to see throws and settles); --audio: the clone's audio for that range.
# Without --audio there is NO audio track: a range cut with the whole reference's audio froze the
# picture at its end in players (S5, owner: "travou em 0:03").
set -euo pipefail
ref=$1 clone=$2 from=$3 to=$4 out=$5; shift 5
slow=1 audio=0
for a in "$@"; do case $a in --slow) slow=2;; --audio) audio=1;; esac; done
fps=$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of csv=p=0 "$ref" | awk -F/ '{print $1/$2}')
v="[0:v]trim=start_frame=$from:end_frame=$to,setpts=(PTS-STARTPTS)*$slow,scale=540:960,setsar=1[a];[1:v]trim=start_frame=$from:end_frame=$to,setpts=(PTS-STARTPTS)*$slow,scale=540:960,setsar=1[b];[a][b]hstack,fps=$fps[v]"
if [ $audio = 1 ] && [ $slow = 1 ]; then
  ss=$(awk "BEGIN{print $from/$fps}"); t=$(awk "BEGIN{print ($to-$from)/$fps}")
  ffmpeg -v error -y -i "$ref" -i "$clone" -filter_complex "$v;[1:a]atrim=start=$ss:duration=$t,asetpts=PTS-STARTPTS[s]" -map "[v]" -map "[s]" -c:v libx264 -pix_fmt yuv420p -crf 20 -c:a aac -movflags +faststart "$out"
else
  ffmpeg -v error -y -i "$ref" -i "$clone" -filter_complex "$v" -map "[v]" -an -c:v libx264 -pix_fmt yuv420p -crf 20 -movflags +faststart "$out"
fi
ffprobe -v error -show_entries stream=codec_type,duration -of csv=p=0 "$out"
