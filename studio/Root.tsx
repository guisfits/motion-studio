import { AbsoluteFill, Composition, Folder } from "remotion";

// One second of plain ground: the render smoke target. `remotion compositions` also crashes on
// an empty list (4.0.538), so the card always holds at least this one.
const Smoke: React.FC = () => <AbsoluteFill style={{ backgroundColor: "#ece4d4" }} />;

// The technique card: one <Composition id="T##-Name"> per demo, all inside this folder.
export const RemotionRoot: React.FC = () => (
  <Folder name="techniques">
    <Composition id="T00-Smoke" component={Smoke} durationInFrames={30} fps={30} width={1920} height={1080} />
  </Folder>
);
