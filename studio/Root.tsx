import { AbsoluteFill, Composition, Folder } from "remotion";
import { T01_DURATION, T01Camera } from "./demos/T01Camera";
import { T02_DURATION, T02Parallax } from "./demos/T02Parallax";
import { T03_DURATION, T03Type } from "./demos/T03Type";
import { T05_DURATION, T05Paper } from "./demos/T05Paper";
import { T06_DURATION, T06Transitions } from "./demos/T06Transitions";
import { T07_DURATION, T07Texture } from "./demos/T07Texture";
import { T09_DURATION, T09Captions } from "./demos/T09Captions";
import { T04_DURATION, T04Diagram } from "./demos/T04Diagram";
import { T08_DURATION, T08Sound } from "./demos/T08Sound";
import { T10_DURATION, T10Three } from "./demos/T10Three";
import { T11_DURATION, T11Puppet } from "./demos/T11Puppet";
import { T13_DURATION, T13Fx } from "./demos/T13Fx";
import { SHOWREEL_DURATION, Showreel } from "./demos/Showreel";
import { Film as ExampleFilm } from "./films/example/Film";
import example from "./films/example/film.json";
import { layoutOf, type FilmFormat } from "../src/film";

// One second of plain ground: the render smoke target. `remotion compositions` also crashes on
// an empty list (4.0.538), so the card always holds at least this one.
const Smoke: React.FC = () => <AbsoluteFill style={{ backgroundColor: "#ece4d4" }} />;

// Films: one <Composition id="F-<Id>"> per studio/films/<slug>/, sized from its film.json
// (docs/film-contract.md). Render with tools/render.sh F-<Id> studio/films/<slug>/out/silent.mp4.
const example_size = layoutOf(example.format as FilmFormat);

// The technique card: one <Composition id="T##-Name"> per demo, all inside this folder.
const Techniques: React.FC = () => (
  <Folder name="techniques">
    <Composition id="T00-Smoke" component={Smoke} durationInFrames={30} fps={30} width={1920} height={1080} />
    <Composition id="T01-Camera" component={T01Camera} durationInFrames={T01_DURATION} fps={30} width={1920} height={1080} />
    <Composition id="T02-Parallax" component={T02Parallax} durationInFrames={T02_DURATION} fps={30} width={1920} height={1080} />
    <Composition id="T03-Type" component={T03Type} durationInFrames={T03_DURATION} fps={30} width={1920} height={1080} />
    <Composition id="T05-Paper" component={T05Paper} durationInFrames={T05_DURATION} fps={30} width={1920} height={1080} />
    <Composition id="T06-Transitions" component={T06Transitions} durationInFrames={T06_DURATION} fps={30} width={1920} height={1080} />
    <Composition id="T07-Texture" component={T07Texture} durationInFrames={T07_DURATION} fps={30} width={1920} height={1080} />
    <Composition id="T09-Captions" component={T09Captions} durationInFrames={T09_DURATION} fps={30} width={1920} height={1080} />
    <Composition id="T04-Diagram" component={T04Diagram} durationInFrames={T04_DURATION} fps={30} width={1920} height={1080} />
    <Composition id="T08-Sound" component={T08Sound} durationInFrames={T08_DURATION} fps={30} width={1920} height={1080} />
    <Composition id="T10-Three" component={T10Three} durationInFrames={T10_DURATION} fps={30} width={1920} height={1080} />
    <Composition id="T11-Puppet" component={T11Puppet} durationInFrames={T11_DURATION} fps={30} width={1920} height={1080} />
    <Composition id="T13-Fx" component={T13Fx} durationInFrames={T13_DURATION} fps={30} width={1920} height={1080} />
    <Composition id="Showreel" component={Showreel} durationInFrames={SHOWREEL_DURATION} fps={30} width={1920} height={1080} />
  </Folder>
);

const Films: React.FC = () => (
  <Folder name="films">
    <Composition
      id={`F-${example.id}`}
      component={ExampleFilm}
      durationInFrames={example.durationInFrames}
      fps={example.fps}
      width={example_size.W}
      height={example_size.H}
    />
  </Folder>
);


export const RemotionRoot: React.FC = () => (
  <>
    <Techniques />
    <Films />
  </>
);
