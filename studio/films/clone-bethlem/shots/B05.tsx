import { AbsoluteFill, Img } from "remotion";
import { Card, Plate, PAPER_GREY, ACCENT, ramp, useRefFrame } from "../lib/kit";
import paperUrl from "../assets/pd/P25-paper-fine-ambientcg-Paper001.jpg";
import ghostUrl from "../assets/pd/P04b-bethlem-entrance-facade.jpg";
import pennyUrl from "../assets/pd/P05-penny-1797-britannia-bnf.jpg";

// Shot 5 (reference f225-256, 9.33-10.63 s): grey card, hospital ghosted. f225 a yellow stripe
// above the film's caption bar; f227 it becomes a block; f231 the penny (Britannia side) pops into
// the block, which then reads as a ring around it; micro push 1.00 -> 1.03 (breakdown 6.3).
// The caption bar itself is film-level. Our block sits above it (bar centre y = 49.8 %).

const BLOCK_W = 383;
const BLOCK_H = 188;
const BLOCK_CY = 40; // % of H; the block's bottom edge (44.9 %) stays above the bar's top (46.8 %)
const COIN = 372;

export const B05: React.FC = () => {
  const t = useRefFrame();
  const blockH = ramp(t, 1, 3, 70, BLOCK_H); // stripe -> block at f227
  const coinK = ramp(t, 5, 8, 0, 1, "out"); // coin pops up from below inside the block
  const push = ramp(t, 0, 31, 1, 1.03);
  const cy = (BLOCK_CY / 100) * 1920;
  return (
    <Card paper={paperUrl} tone={PAPER_GREY}>
      <AbsoluteFill style={{ opacity: 0.15 }}>
        <Plate src={ghostUrl} aspect={1601 / 1174} crop={[0.22, 0.08, 0.56, 0.9]} />
      </AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <div style={{ position: "absolute", left: "50%", top: cy, width: BLOCK_W, height: blockH, transform: "translate(-50%, -50%)", backgroundColor: ACCENT }} />
        {coinK > 0 ? (
          // The coin overlaps the block's top edge and is cut flat at its bottom edge.
          <div style={{ position: "absolute", left: "50%", top: cy - BLOCK_H / 2 - 64, width: COIN, height: COIN, marginLeft: -COIN / 2, clipPath: `inset(0 0 ${COIN - 64 - BLOCK_H}px 0)` }}>
            <div style={{ width: COIN, height: COIN, borderRadius: "50%", overflow: "hidden", transform: `translateY(${(1 - coinK) * 240}px)` }}>
              <Img src={pennyUrl} style={{ width: "100%", height: "100%", objectFit: "cover", transform: "translateY(-9%) scale(1.14)" }} />
            </div>
          </div>
        ) : null}
      </AbsoluteFill>
    </Card>
  );
};
