// Clone of the "Bethlem Royal" reel (inspirations/clone-candidates c5): shot spans from
// crew/reference-breakdown.md, cut table. Spans are written in REFERENCE frames (1-based f in the
// breakdown = 0-based frame + 1) and mapped onto our narration through lib/anchors.json, so a cut
// that sat on a word in the reference sits on the same word in our voice.
import anchors from "./lib/anchors.json";

export const FPS = 24;
export const WIDTH = 1080;
export const HEIGHT = 1920;

const A = anchors as [number, number][];
const lerpPairs = (t: number, from: 0 | 1, to: 0 | 1): number => {
  if (t <= A[0][from]) return A[0][to] + (t - A[0][from]);
  for (let i = 1; i < A.length; i++) {
    const [a, b] = [A[i - 1], A[i]];
    if (t <= b[from]) {
      const span = b[from] - a[from];
      return span <= 0 ? b[to] : a[to] + ((t - a[from]) / span) * (b[to] - a[to]);
    }
  }
  const last = A[A.length - 1];
  return last[to] + (t - last[from]);
};
/** Reference seconds → our seconds. */
export const refToOur = (t: number) => lerpPairs(t, 0, 1);
/** Our seconds → reference seconds. */
export const ourToRef = (t: number) => lerpPairs(t, 1, 0);
/** A 0-based reference frame → our 0-based frame. */
export const refFrame = (f: number) => Math.round(refToOur(f / FPS) * FPS);

// The reference ends 0.175 s after its last word; ours keeps the same tail.
export const DURATION = Math.ceil((A[A.length - 1][1] + 0.175) * FPS);

export type ShotId =
  | "B01" | "B02" | "B03" | "B04" | "B05" | "B06" | "B07" | "B08"
  | "B09" | "B10" | "B11" | "B12" | "B13" | "B14" | "B15" | "B16";

/** `from`/`to` are 0-based reference frames, `to` exclusive (breakdown f1-88 → 0..88). */
export const SHOTS: { id: ShotId; from: number; to: number; name: string }[] = [
  { id: "B01", from: 0, to: 88, name: "1a-1c: empty bar card; Parliament unfolds; top-hat men rise, coats tint" },
  { id: "B02", from: 88, to: 130, name: "2a-2e: Hogarth Bedlam crop-hops, white live line" },
  { id: "B03", from: 130, to: 158, name: "3: 'Bethlem Royal Hospital,' lockup, pull-back" },
  { id: "B04", from: 158, to: 224, name: "4: text wall, white live line" },
  { id: "B05", from: 224, to: 256, name: "5: grey card, penny in a yellow ring" },
  { id: "B06", from: 256, to: 324, name: "6-7: snowy Westminster crowd, push; close crop, pan" },
  { id: "B07", from: 324, to: 404, name: "8-10: Regency couple; yoke woman, yellow pails; basket woman" },
  { id: "B08", from: 404, to: 552, name: "11-14: ruff man + violin; jester; fiddler; onlookers rack focus" },
  { id: "B09", from: 552, to: 594, name: "15: blank card, ghost door, 'Nobody thought twice about it.'" },
  { id: "B10", from: 594, to: 706, name: "16-18: chained (harness wipe); beaten; starved (bowl)" },
  { id: "B11", from: 706, to: 758, name: "19-20: constables, lantern beam, swap" },
  { id: "B12", from: 758, to: 920, name: "21-24: Norris wide + face circle; face push; shackle; pull-up" },
  { id: "B13", from: 920, to: 1002, name: "25-26: newspaper page push; crowd with yellow paper" },
  { id: "B14", from: 1002, to: 1088, name: "27-28: St Paul's men swaps; Norris again" },
  { id: "B15", from: 1088, to: 1140, name: "29: years card, counter 1814→1852" },
  { id: "B16", from: 1138, to: 1209, name: "30: report cover page peel, pull-out" },
];
