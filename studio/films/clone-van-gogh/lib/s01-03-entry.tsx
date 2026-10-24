import { AbsoluteFill, Composition, Sequence, registerRoot } from "remotion";
import { Grain } from "../../../../src/texture";
import { SHOTS } from "../scene";
import { S01 } from "../shots/S01";
import { S02 } from "../shots/S02";
import { S03 } from "../shots/S03";

// Private entry so S01-S03 render without the other shots (a parallel builder's break stays theirs).
const Mini: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {[S01, S02, S03].map((Shot, i) => (
      <Sequence key={i} from={SHOTS[i].from} durationInFrames={SHOTS[i].to - SHOTS[i].from}><Shot /></Sequence>
    ))}
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)" }} />
    <Grain opacity={0.08} stepFps={16} />
  </AbsoluteFill>
);
registerRoot(() => <Composition id="S0103" component={Mini} width={1080} height={1920} fps={16} durationInFrames={105} />);
