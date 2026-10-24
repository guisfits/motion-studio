import json, subprocess, sys, os
D, ref, out = sys.argv[1], sys.argv[2], sys.argv[3]
P = "/Users/guisfits/llm-models/venv_mlx/bin/mlx_audio.tts.generate"
w = json.load(open(ref))["words"]
fix = {"ernedits.com.": "earnedits dot com."}
chunks, a = [], 0
for i, x in enumerate(w):
    t = x["w"]
    if t.endswith((",", ".", '."')) or t == "pain":
        chunks.append((a, i)); a = i + 1
if a < len(w): chunks.append((a, len(w) - 1))
def dur(f): return float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",f]))
inputs, filt = [], []
for k, (a, b) in enumerate(chunks):
    text = " ".join(fix.get(x["w"], x["w"]) for x in w[a:b+1])
    start = w[a]["s"]; slot = (w[b+1]["s"] if b + 1 < len(w) else 34.5) - start - 0.04
    raw = f"{D}/c{k:02d}_000.wav"
    if not os.path.exists(raw):
        subprocess.run([P,"--model","mlx-community/OmniVoice-fp32","--lang_code","en","--ref_audio",f"{D}/s1_000.wav",
            "--ref_text","He was drowning in pain, and somehow turned it into some of the most beautiful art ever created.",
            "--text",text,"--output_path",D,"--file_prefix",f"c{k:02d}"],check=True,capture_output=True)
    trim = f"{D}/ct{k:02d}.wav"
    subprocess.run(["ffmpeg","-v","error","-y","-i",raw,"-af","silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse",trim],check=True)
    d = dur(trim); tempo = min(max(d / slot, 0.92), 1.6) if d > slot else max(d / slot, 0.92) if d / slot > 0.92 else 1.0
    print(f"c{k:02d} {start:5.2f} slot {slot:4.2f} ours {d:4.2f} tempo {tempo:.3f} | {text}")
    inputs += ["-i", trim]
    filt.append(f"[{k}]aresample=48000,atempo={tempo:.4f},adelay={int(start*1000)}|{int(start*1000)}[a{k}]")
filt.append("".join(f"[a{k}]" for k in range(len(chunks))) + f"amix=inputs={len(chunks)}:normalize=0,apad=whole_dur=34.625[o]")
subprocess.run(["ffmpeg","-v","error","-y",*inputs,"-filter_complex",";".join(filt),"-map","[o]","-ac","1","-t","34.625",out],check=True)
