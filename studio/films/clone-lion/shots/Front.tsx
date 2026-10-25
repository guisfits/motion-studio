// The front flock (own parallax, 1.8-2.0x the lion, breakdown 4/5) and the yellow paint wipe
// (breakdown 2 G/H, 6, 9): horizontal vest bands sweep down f112-138, solid yellow on the mane, the
// right sheep and the lamb f134-148, then a hard left-to-right clear to nothing at f152.
import { useCurrentFrame } from "remotion";
import ewe1 from "../assets/gen/G01-ewe-white-a-cut.png";
import ewe2 from "../assets/gen/G02-ewe-white-b-cut.png";
import ram from "../assets/gen/G03-ram-horned-white-cut.png";
import ewe4 from "../assets/gen/G04-ewe-blackface-cut.png";
import lamb from "../assets/gen/G07-lamb-lying-cut.png";
import brown from "../assets/gen/P05-ewe-brown-blackface-cut.png";
import { BANDS, K, keys, lin, Piece, Plane, Yellow } from "../lib/kit";
import { BackPlane, LION_BOX, LION_URL, MANE } from "./Back";

const FA = { x: 382, y: 907 };

/** Black-face sheep centre on screen, plane scale, and the lamb's own (faster) centre y. */
const frontCam = (f: number) => ({
  px: keys(f, [[100, 372], [120, 372], [150, 378], [165, 380], [200, 382], [220, 368], [240, 355]]),
  py: keys(f, [[100, 660], [108, 682], [114, 700], [120, 721], [125, 743], [130, 765], [140, 808], [150, 852], [160, 880], [170, 892], [200, 907], [240, 929]]),
  s: keys(f, [[100, 0.87], [108, 0.88], [120, 0.9], [150, 0.95], [160, 0.97], [200, 1.0], [240, 1.05]]),
  lambY: keys(f, [[100, 860], [118, 884], [126, 928], [130, 948], [160, 1080], [170, 1097], [200, 1120], [240, 1148]]),
});

const L = { ram: [248, 935, 235, 421], left: [20, 975, 228, 360], brown: [492, 995, 429, 396], mid: [485, 915, 130, 246], right: [640, 925, 215, 342], lamb: [534, 1120, 310, 289] };

const PIECES = [
  { src: ewe2, box: L.right, flip: false },
  { src: brown, box: L.brown, flip: true },
  { src: ewe1, box: L.mid, flip: false },
  { src: ram, box: L.ram, flip: false },
  { src: ewe4, box: L.left, flip: false },
];

export const Front: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 104 || f > 240) return null;
  const c = frontCam(f);
  // The lamb sits lower than the plane alone would put it: shift it by the measured excess.
  const lambDy = c.lambY - (c.py + c.s * (L.lamb[1] - FA.y));
  return (
    <Plane px={c.px} py={c.py} s={c.s} ax={FA.x} ay={FA.y}>
      <Piece src={ewe2} x={L.right[0]} y={L.right[1]} w={L.right[2]} h={L.right[3]} look="flock" pre="blur(1.2px)" />
      <Piece src={brown} x={L.brown[0]} y={L.brown[1]} w={L.brown[2]} h={L.brown[3]} flip look="flock" pre="brightness(1.7) contrast(0.9) blur(1.2px)" />
      <Piece src={ewe1} x={L.mid[0]} y={L.mid[1]} w={L.mid[2]} h={L.mid[3]} look="flock" pre="blur(1.2px)" />
      <Piece src={ram} x={L.ram[0]} y={L.ram[1]} w={L.ram[2]} h={L.ram[3]} look="flock" pre="blur(1.2px)" />
      <Piece src={ewe4} x={L.left[0]} y={L.left[1]} w={L.left[2]} h={L.left[3]} look="flock" pre="blur(1.2px)" />
      <Piece src={lamb} x={L.lamb[0]} y={L.lamb[1] + lambDy / c.s} w={L.lamb[2]} h={L.lamb[3]} look="flock" pre="blur(1.2px)" />
    </Plane>
  );
};

export const Wipe: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 112 || f >= 152) return null;
  const bottom = lin(f, [[112, 360], [120, 480], [124, 586], [128, 725], [132, 858], [136, 997], [138, 1064], [140, 1105], [148, 1144]]);
  const left = lin(f, [[112, 0], [138, 14], [140, 42], [142, 292], [146, 335], [148, 345], [150, 389], [151, 512], [152, 760]]);
  const bands = lin(f, [[112, 0], [116, 1], [138, 1], [144, 0]]);
  const lionBands = lin(f, [[112, 0], [116, 0.9], [132, 0.9], [138, 0]]);
  const solid = lin(f, [[134, 0], [142, 1]]);
  const c = frontCam(f);
  const lambDy = c.lambY - (c.py + c.s * (L.lamb[1] - FA.y));
  return (
    <div style={{ position: "absolute", inset: 0, clipPath: `polygon(${left * K}px 0, ${720 * K}px 0, ${720 * K}px ${bottom * K}px, ${left * K}px ${bottom * K}px)` }}>
      <BackPlane>
        <Yellow src={LION_URL} x={LION_BOX.x} y={LION_BOX.y} w={LION_BOX.w} h={LION_BOX.h} opacity={lionBands} mask={BANDS} />
        <Yellow src={LION_URL} x={LION_BOX.x} y={LION_BOX.y} w={LION_BOX.w} h={LION_BOX.h} opacity={solid} mask={MANE} />
      </BackPlane>
      {f >= 104 && (
        <Plane px={c.px} py={c.py} s={c.s} ax={FA.x} ay={FA.y}>
          {PIECES.map(({ src, box, flip }, i) => (
            <Yellow key={i} src={src} x={box[0]} y={box[1]} w={box[2]} h={box[3]} flip={flip} opacity={bands} mask={BANDS} />
          ))}
          <Yellow src={ewe2} x={L.right[0]} y={L.right[1]} w={L.right[2]} h={L.right[3]} opacity={solid} />
          <Yellow src={lamb} x={L.lamb[0]} y={L.lamb[1] + lambDy / c.s} w={L.lamb[2]} h={L.lamb[3]} opacity={solid} />
        </Plane>
      )}
    </div>
  );
};
