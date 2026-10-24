// Clone of the earn.edits "Van Gogh" reel (inspirations/earn-edits-van-gogh): shot spans from
// crew/reference-breakdown.md, cut table. Frames are 0-based here (breakdown f = frame + 1).
// Native 16 fps like the reference: nothing is smoothed to 30.

export const FPS = 16;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const DURATION = 554;

export type ShotId =
  | "S01" | "S02" | "S03" | "S04" | "S05" | "S06" | "S07" | "S08"
  | "S09" | "S10" | "S11" | "S12" | "S13" | "S14" | "S15" | "S16";

/**
 * Each shot's span, transitions included: where two spans overlap, the later shot draws on top
 * and owns the transition (e.g. S03 opens with the paper-tear holes over S02's last frames).
 * `to` is exclusive.
 */
export const SHOTS: { id: ShotId; from: number; to: number; name: string }[] = [
  { id: "S01", from: 0, to: 32, name: "drowning (1a wide, 1b punch + PAIN)" },
  { id: "S02", from: 32, to: 60, name: "portrait wall, frames fly in" },
  { id: "S03", from: 52, to: 105, name: "tear holes in; blossom profile + leaves; head -> Starry Night punch" },
  { id: "S04", from: 105, to: 152, name: "clock hall; punch to head; skull lifts" },
  { id: "S05", from: 148, to: 181, name: "radial zoom blur in; balance, brain falls" },
  { id: "S06", from: 181, to: 211, name: "velvet, brain match cut, THOUGH THE / label punch" },
  { id: "S07", from: 211, to: 234, name: "1888 numeral ring" },
  { id: "S08", from: 234, to: 289, name: "Gauguin argument" },
  { id: "S09", from: 289, to: 317, name: "ear in sunflowers; slides up" },
  { id: "S10", from: 317, to: 348, name: "corridor walk away, LATER / VOLUNTARILY ENTERED THE" },
  { id: "S11", from: 348, to: 375, name: "keyhole zoom-through; green mat, asylum painting" },
  { id: "S12", from: 375, to: 400, name: "man on plinth, fragments past lens" },
  { id: "S13", from: 400, to: 433, name: "painter at easel, HIS OWN STRUGGLES; pillar sweep starts" },
  { id: "S14", from: 433, to: 457, name: "pillar sweep ends; Starry Night in gallery, rope" },
  { id: "S15", from: 457, to: 492, name: "puzzle pieces; punch, HAS A STRUCTURE" },
  { id: "S16", from: 492, to: 554, name: "desk, folder, URL end card" },
];
