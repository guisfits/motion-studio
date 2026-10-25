import { AbsoluteFill, Audio, Freeze, Sequence, useCurrentFrame } from "remotion";
import { Grain } from "../../../src/texture";
import voUrl from "./voice/vo.wav";
import { CaptionBar, Filters, ShotCtx, useFont, Vignette } from "./lib/kit";
import { refFrame, SHOTS, type ShotId } from "./scene";
import { B01 } from "./shots/B01";
import { B02 } from "./shots/B02";
import { B03 } from "./shots/B03";
import { B04 } from "./shots/B04";
import { B05 } from "./shots/B05";
import { B06 } from "./shots/B06";
import { B07 } from "./shots/B07";
import { B08 } from "./shots/B08";
import { B09 } from "./shots/B09";
import { B10 } from "./shots/B10";
import { B11 } from "./shots/B11";
import { B12 } from "./shots/B12";
import { B13 } from "./shots/B13";
import { B14 } from "./shots/B14";
import { B15 } from "./shots/B15";
import { B16 } from "./shots/B16";

const SHOT: Record<ShotId, React.FC> = { B01, B02, B03, B04, B05, B06, B07, B08, B09, B10, B11, B12, B13, B14, B15, B16 };

// The reference is one stepped image on twos: picture, tint, caption and grain all hold for two
// frames (breakdown header). Freeze holds the whole picture tree; the voice stays outside it.
const Picture: React.FC = () => {
  useFont();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Filters />
      {SHOTS.map(({ id, from, to }) => {
        const Shot = SHOT[id];
        const ourFrom = refFrame(from);
        return (
          <Sequence key={id} from={ourFrom} durationInFrames={refFrame(to) - ourFrom} name={id}>
            <ShotCtx.Provider value={{ ourFrom, refFrom: from }}>
              <Shot />
            </ShotCtx.Provider>
          </Sequence>
        );
      })}
      <Vignette />
      <CaptionBar endFrame={1209} />
      <Grain opacity={0.5} size={1.3} stepFps={12} />
    </AbsoluteFill>
  );
};

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Freeze frame={Math.floor(frame / 2) * 2}>
        <Picture />
      </Freeze>
      <Audio src={voUrl} />
    </AbsoluteFill>
  );
};
