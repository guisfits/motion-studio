import { AbsoluteFill, Audio, Sequence } from "remotion";
import { Grade, GRADE_REEL, Grain } from "../../../src/texture";
import mixUrl from "./audio/mix.wav";
import { SHOTS, type ShotId } from "./scene";
import { S01 } from "./shots/S01";
import { S02 } from "./shots/S02";
import { S03 } from "./shots/S03";
import { S04 } from "./shots/S04";
import { S05 } from "./shots/S05";
import { S06 } from "./shots/S06";
import { S07 } from "./shots/S07";
import { S08 } from "./shots/S08";
import { S09 } from "./shots/S09";
import { S10 } from "./shots/S10";
import { S11 } from "./shots/S11";
import { S12 } from "./shots/S12";
import { S13 } from "./shots/S13";
import { S14 } from "./shots/S14";
import { S15 } from "./shots/S15";
import { S16 } from "./shots/S16";

// Base grain opacity; each shot scales it by its measured `look.grain` (scene.ts).
const BASE_GRAIN = 0.65;

const SHOT: Record<ShotId, React.FC> = { S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13, S14, S15, S16 };

// One Sequence per shot, in cut order: an overlapping later shot draws on top and owns the
// transition. Each shot carries its own look, measured on the reference: a Grade pass and stepped grain.
export const Film: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {SHOTS.map(({ id, from, to, look }) => {
      const Shot = SHOT[id];
      return (
        <Sequence key={id} from={from} durationInFrames={to - from} name={id}>
          <Grade {...GRADE_REEL} {...(look?.edgeBlur ? { edgeBlur: look.edgeBlur } : {})} {...(look?.soften !== undefined ? { soften: look.soften } : {})}>
            <Shot />
          </Grade>
          <Grain opacity={BASE_GRAIN * (look?.grain ?? 1)} size={1.3} stepFps={16} />
        </Sequence>
      );
    })}
    <Audio src={mixUrl} />
  </AbsoluteFill>
);
