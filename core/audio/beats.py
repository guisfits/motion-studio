"""Measure a supplied track's beat grid so picture changes and SFX land on the music.

    python core/audio/beats.py track.wav > <film-dir>/beats.json

beats      -> where state changes go
downbeats  -> every 4th beat, where big moments go
hits       -> onset peaks, where SFX go
"""

import json
import sys

import librosa
import numpy as np


def measure(path: str) -> dict:
    y, sr = librosa.load(path, sr=None, mono=True)
    tempo, frames = librosa.beat.beat_track(y=y, sr=sr, units="frames")
    beats = librosa.frames_to_time(frames, sr=sr).round(3).tolist()
    onset = librosa.onset.onset_strength(y=y, sr=sr)
    peaks = librosa.util.peak_pick(
        onset, pre_max=3, post_max=3, pre_avg=3, post_avg=5, delta=0.5, wait=10
    )
    return {
        "bpm": round(float(np.atleast_1d(tempo)[0]), 2),
        "beats": beats,
        "downbeats": beats[::4],
        "hits": librosa.frames_to_time(peaks, sr=sr).round(3).tolist(),
        "duration": round(float(len(y) / sr), 3),
    }


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("usage: beats.py track.wav > beats.json")
    json.dump(measure(sys.argv[1]), sys.stdout, indent=1)
    sys.stdout.write("\n")
