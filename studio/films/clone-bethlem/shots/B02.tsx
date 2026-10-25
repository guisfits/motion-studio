import { AbsoluteFill } from "remotion";
import { Plate, Words, useRefFrame } from "../lib/kit";
import hogarthUrl from "../assets/pd/P03-hogarth-bedlam-wellcome.jpg";

// Shot 2 (reference f89-130, 3.67-5.38 s): the Hogarth Bedlam plate crop-hops every 8-10 frames
// (patients, man at the window, barred window, woman with fan, fiddler), no camera move inside a
// crop, each crop ~1.1x larger than the last. A white live line, no bar: "mental patients" and, from
// f99, "like zoo animals." (breakdown 2.2).

const ASPECT = 1600 / 1397;
// A crop is framed by its centre and its height (0..1 of the plate); the width follows the 9:16 frame.
const crop = (cx: number, cy: number, ch: number): [number, number, number, number] => {
  const cw = (ch * 0.5625) / ASPECT;
  return [cx - cw / 2, cy - ch / 2, cw, ch];
};

// Hop start (frames into the shot), centre and height; measured zoom per hop (the reference is much tighter than "60 % of the plate").
const HOPS: { f: number; c: [number, number, number] }[] = [
  { f: 0, c: [0.24, 0.55, 0.62] },
  { f: 8, c: [0.45, 0.48, 0.34] },
  { f: 18, c: [0.615, 0.37, 0.45] },
  { f: 28, c: [0.69, 0.57, 0.41] },
  { f: 38, c: [0.815, 0.65, 0.48] },
];

export const B02: React.FC = () => {
  const t = useRefFrame();
  const hop = [...HOPS].reverse().find((h) => t >= h.f) ?? HOPS[0];
  return (
    <AbsoluteFill>
      <Plate src={hogarthUrl} aspect={ASPECT} crop={crop(...hop.c)} />
      <Words size={112} y={50} color="#F3F3EE" weight={500} shadow>
        {t < 10 ? "mental patients" : "like zoo animals."}
      </Words>
    </AbsoluteFill>
  );
};
