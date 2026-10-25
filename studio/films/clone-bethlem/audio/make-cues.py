# SFX cues from the reference's measured hits (breakdown 7), moved onto our timeline via lib/anchors.json.
#   python3 audio/make-cues.py → audio/cues.json
import json, os
H = os.path.dirname(os.path.abspath(__file__))
A = json.load(open(f"{H}/../lib/anchors.json"))
def our(t):
    for a, b in zip(A, A[1:]):
        if t <= b[0]:
            return b[1] if b[0] <= a[0] else a[1] + (t - a[0]) / (b[0] - a[0]) * (b[1] - a[1])
    return A[-1][1] + t - A[-1][0]
REF = [  # reference seconds, type, gain, note
    (1.50, "whoosh-deep", 0.8, "f37 men rise"),
    (4.00, "thud-soft", 0.6, "f97 first crop-hop"),
    (5.42, "bell-deep", 0.5, "f131 title hit"),
    (9.33, "impact", 0.35, "f225 into the coin card"),
    (9.60, "click", 0.5, "f231 coin pops in"),
    (10.67, "thud", 0.6, "f257 snowy crowd"),
    (13.50, "paper-slide", 0.5, "f325 couple"),
    (16.83, "click", 0.7, "f405 violin enters"),
    (16.86, "swell", 0.35, "f405 short chord"),
    (24.75, "boom", 0.7, "f595 chain hit into 'Inside,'"),
    (27.00, "thud", 0.6, "f649 beaten"),
    (27.67, "knock", 0.6, "f665 bowl lands"),
    (31.58, "paper-place", 0.5, "f759 Norris slides in"),
    (34.25, "whoosh", 0.9, "f823 fast push into the face"),
    (35.00, "stamp-wood", 0.7, "f841 shackle clank"),
    (40.67, "rustle", 0.7, "f977 paper swings in"),
    (41.75, "thud", 0.5, "f1003 St Paul's"),
    (43.83, "boom", 0.6, "f1053 Norris again"),
    (45.33, "thump", 0.6, "f1089 years card"),
    (47.50, "page", 0.8, "f1141 page peel"),
    (49.50, "bell-deep", 0.5, "sting under 'oversight.'"),
]
cues = [{"t": round(our(t), 3), "type": k, "gain": g, "note": n} for t, k, g, n in REF]
json.dump(cues, open(f"{H}/cues.json", "w"), indent=1)
print(len(cues), "cues; last", cues[-1])
