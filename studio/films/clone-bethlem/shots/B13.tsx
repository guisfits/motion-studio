import { AbsoluteFill } from "remotion";
import { Card, Plate, W, H, ramp, useRefFrame } from "../lib/kit";
import { NewsPage, PAGE_H, PAGE_W } from "../lib/b13-16-news";
import paperUrl from "../assets/pd/P25-paper-fine-ambientcg-Paper001.jpg";
import crowdUrl from "../assets/gen/P22-newspaper-crowd.png";

// Shot 13 (reference f921-1002, 38.3-41.7 s): 13a the Norris broadsheet on pale ground (f921-976), set
// in code; the reference settles from a close frame to the whole page then creeps in. 13b hard cut at
// f977 to the crowd; the same page is still held over it (f977-979), then swings down into the
// crowd's hands, tinted yellow at once and full by f985 (breakdown 25-26).

export const B13: React.FC = () => {
  const t = useRefFrame();
  const crowd = t >= 56;
  // Page scale: 1.3 settling to 1.0 by f935, then a slow push to f976; after the cut it shrinks to a held sheet.
  const base = t < 14 ? ramp(t, 0, 14, 1.3, 1.0, "out") : ramp(t, 14, 55, 1.0, 1.06);
  const held = ramp(t, 57, 64, 0, 1, "out");
  const s = crowd ? 1.06 + (0.76 - 1.06) * held : base;
  const tint = crowd ? ramp(t, 57, 62, 0, 1) : 0;
  return (
    <AbsoluteFill>
      {crowd ? (
        <Plate src={crowdUrl} aspect={1088 / 1920} cam={{ s: [1.1, 1.15], f: [56, 82] }} />
      ) : (
        <Card paper={paperUrl} tone="#E3E3E0" />
      )}
      <div
        style={{
          position: "absolute", left: W / 2 - PAGE_W / 2, top: H * 0.5 - PAGE_H / 2, width: PAGE_W, height: PAGE_H,
          transform: `translate(${held * 50}px, ${held * -20}px) rotate(${held * 8}deg) scale(${s}, ${s * (1 - 0.3 * held)})`,
          transformOrigin: "50% 50%",
        }}
      >
        <NewsPage />
        {tint > 0 ? (
          <div style={{ position: "absolute", inset: 0, filter: "url(#accent)", opacity: tint }}>
            <NewsPage />
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
