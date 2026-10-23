import { AbsoluteFill, Composition, Folder } from "remotion";
import { T01_DURATION, T01Camera } from "./demos/T01Camera";
import { T02_DURATION, T02Parallax } from "./demos/T02Parallax";
import { T03_DURATION, T03Type } from "./demos/T03Type";
import { T05_DURATION, T05Paper } from "./demos/T05Paper";
import { T06_DURATION, T06Transitions } from "./demos/T06Transitions";
import { T07_DURATION, T07Texture } from "./demos/T07Texture";
import { T09_DURATION, T09Captions } from "./demos/T09Captions";

// One second of plain ground: the render smoke target. `remotion compositions` also crashes on
// an empty list (4.0.538), so the card always holds at least this one.
const Smoke: React.FC = () => <AbsoluteFill style={{ backgroundColor: "#ece4d4" }} />;

// The technique card: one <Composition id="T##-Name"> per demo, all inside this folder.
export const RemotionRoot: React.FC = () => (
  <Folder name="techniques">
    <Composition id="T00-Smoke" component={Smoke} durationInFrames={30} fps={30} width={1920} height={1080} />
    <Composition id="T01-Camera" component={T01Camera} durationInFrames={T01_DURATION} fps={30} width={1920} height={1080} />
    <Composition id="T02-Parallax" component={T02Parallax} durationInFrames={T02_DURATION} fps={30} width={1920} height={1080} />
    <Composition id="T03-Type" component={T03Type} durationInFrames={T03_DURATION} fps={30} width={1920} height={1080} />
    <Composition id="T05-Paper" component={T05Paper} durationInFrames={T05_DURATION} fps={30} width={1920} height={1080} />
    <Composition id="T06-Transitions" component={T06Transitions} durationInFrames={T06_DURATION} fps={30} width={1920} height={1080} />
    <Composition id="T07-Texture" component={T07Texture} durationInFrames={T07_DURATION} fps={30} width={1920} height={1080} />
    <Composition id="T09-Captions" component={T09Captions} durationInFrames={T09_DURATION} fps={30} width={1920} height={1080} />
  </Folder>
);
