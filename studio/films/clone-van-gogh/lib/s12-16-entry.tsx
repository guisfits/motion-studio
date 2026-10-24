// Private render entry for S12-S16 only (does not bundle other builders' shots); not used by the film.
import { AbsoluteFill, Audio, Composition, registerRoot, Sequence } from "remotion";
import { Grain } from "../../../../src/texture";
import voUrl from "../voice/vo.wav";
import { SHOTS } from "../scene";
import { S12 } from "../shots/S12";
import { S13 } from "../shots/S13";
import { S14 } from "../shots/S14";
import { S15 } from "../shots/S15";
import { S16 } from "../shots/S16";

const MAP: Record<string, React.FC> = { S12, S13, S14, S15, S16 };
const Mini: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {SHOTS.filter((s) => MAP[s.id]).map(({ id, from, to }) => {
      const Shot = MAP[id];
      return (
        <Sequence key={id} from={from} durationInFrames={to - from} name={id}>
          <Shot />
        </Sequence>
      );
    })}
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)" }} />
    <Grain opacity={0.08} stepFps={16} />
    <Audio src={voUrl} />
  </AbsoluteFill>
);
registerRoot(() => <Composition id="S12-16" component={Mini} durationInFrames={554} fps={16} width={1080} height={1920} />);
