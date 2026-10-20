#!/bin/bash
# Per reel: 16 kHz wav -> whisper transcript (txt + srt with times) -> scene-change frames + a 1 fps
# contact sheet. Deterministic prep so the lesson-extraction agents read text and a few stills,
# never the video. Usage: WHISPER_MODEL=<ggml-model.bin> prep.sh <moran-dir>   (expects <dir>/media/<id>.mp4;
# WHISPER_MODEL is a whisper.cpp ggml model path, e.g. ggml-small.bin)
set -u
D="$1"; M=${WHISPER_MODEL:?set WHISPER_MODEL to a whisper.cpp ggml model path}
mkdir -p "$D/work"
for v in "$D"/media/*.mp4; do
  id=$(basename "$v" .mp4); W="$D/work/$id"; mkdir -p "$W/frames"
  [ -f "$W/transcript.srt" ] || {
    ffmpeg -nostdin -loglevel error -y -i "$v" -ar 16000 -ac 1 "$W/audio.wav" &&
    whisper-cli -m "$M" -l en --prompt "Vox, After Effects, Premiere, Photoshop, blend mode, keyframe, Trim Paths, Turbulent Displace, Fractal Noise, CC Page Turn, posterize time, wiggle, halftone, adjustment layer" -osrt -otxt -of "$W/transcript" -t 4 "$W/audio.wav" >/dev/null 2>&1
    rm -f "$W/audio.wav"
  }
  [ -f "$W/sheet.jpg" ] || {
    # Scene changes (the demo moments: before/after, AE panels with numbers), capped at 24.
    ffmpeg -nostdin -loglevel error -y -i "$v" -vf "select='gt(scene,0.25)',scale=540:-2" -vsync vfr -frames:v 24 -q:v 4 "$W/frames/scene-%02d.jpg"
    # 1 fps contact sheet, 6 across.
    ffmpeg -nostdin -loglevel error -y -i "$v" -vf "fps=1,scale=240:-2,tile=6x10" -frames:v 1 -q:v 5 "$W/sheet.jpg"
    ffprobe -v error -show_entries format=duration -of csv=p=0 "$v" > "$W/duration.txt"
  }
  echo "$id $(wc -w < "$W/transcript.txt" 2>/dev/null) words, $(ls "$W/frames" | wc -l) scenes"
done
