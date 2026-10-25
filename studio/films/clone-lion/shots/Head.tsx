// The front sheep head (breakdown 3 #8, 4, 6): one image, pre-blurred (~6 px sigma at native size)
// and only scaled by the push, so no blur animation. It rises with a bell, plateaus, then falls with
// a pure ease-in and leaves the bottom of the frame by f105-126.
import { useCurrentFrame } from "remotion";
import headUrl from "../assets/gen/G08-head-closeup-cut.png";
import { K, keys, lin } from "../lib/kit";

// Ear-to-ear width at S = 1, and the nose position inside the 981x1030 picture.
const W = 600;
const NOSE = { x: 497, y: 497 };
const NATIVE_W = 981;
// The cut-out ends at the chest; stretch it down so the wool runs off the bottom edge as in the reference.
const SY = 1.0;
const CHEST = 300;

const nose = (f: number) => ({
  x: keys(f, [[0, 540], [5, 537], [10, 534], [15, 518], [20, 500], [25, 486], [30, 472], [35, 471], [40, 470], [45, 473], [50, 476], [60, 478], [70, 484], [80, 495], [90, 511], [100, 522], [105, 522], [126, 530]]),
  y: keys(f, [[0, 890], [5, 892], [10, 889], [15, 868], [20, 832], [25, 788], [30, 745], [35, 710], [40, 690], [45, 683], [50, 682], [60, 682], [70, 694], [80, 739], [90, 837], [100, 1002], [105, 1114], [115, 1360], [126, 1650]]),
  s: keys(f, [[0, 1.0], [5, 1.0], [10, 1.02], [20, 1.06], [30, 1.17], [40, 1.31], [50, 1.39], [60, 1.45], [70, 1.51], [80, 1.63], [90, 1.77], [100, 1.91], [105, 1.99], [126, 2.4]]),
});

export const Head: React.FC = () => {
  const f = useCurrentFrame();
  if (f > 126) return null;
  const n = nose(f);
  const scale = (W * K) / NATIVE_W;
  // 6 px of blur at native size, expressed in the picture's own pixels.
  const blur = (6 * NATIVE_W) / W;
  const mark = lin(f, [[0, 1], [26, 1], [30, 0]]);
  return (
    <>
      {[CHEST, 0].map((dy) => (
      <img
        key={dy}
        src={headUrl}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: NATIVE_W,
          height: 1030,
          transformOrigin: "0 0",
          transform: `translate(${n.x * K}px, ${n.y * K}px) scale(${scale * n.s}, ${scale * n.s * SY}) translate(${-NOSE.x}px, ${-NOSE.y + dy}px)`,
          filter: `url(#head) blur(${blur}px)`,
          WebkitMaskImage: dy ? "linear-gradient(to bottom, transparent 55%, #000 70%)" : "linear-gradient(to bottom, #000 88%, transparent 100%)",
        }}
      />
      ))}
      {mark > 0 && (
        <svg width={720 * K} height={1280 * K} viewBox="0 0 720 1280" style={{ position: "absolute", left: 0, top: 0, opacity: mark }}>
          <g fill="none" stroke="#EACC49" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" transform={`translate(${(n.x - 540) * 1},${(n.y - 890) * 1})`}>
            <polyline points="262,700 292,775 410,755" />
            <polyline points="470,650 520,700 470,745" />
          </g>
        </svg>
      )}
    </>
  );
};
