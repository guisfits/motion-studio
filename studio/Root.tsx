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
import { T14_DURATION, T14CameraDevices } from "./demos/T14CameraDevices";
import { T15_DURATION, T15TypeDevices } from "./demos/T15TypeDevices";
import { T16_DURATION, T16DocDevices } from "./demos/T16DocDevices";
import { SHOWREEL_DURATION, Showreel } from "./demos/Showreel";
import { Film as ExampleFilm } from "./films/example/Film";
import example from "./films/example/film.json";
import { Film as DryRunFilm } from "./films/dry-run/Film";
import { Film as CloneVanGoghFilm } from "./films/clone-van-gogh/Film";
import * as cloneVanGogh from "./films/clone-van-gogh/scene";
import { Film as CloneBethlemFilm } from "./films/clone-bethlem/Film";
import * as cloneBethlem from "./films/clone-bethlem/scene";
import { Film as CloneBirdsFilm } from "./films/clone-birds/Film";
import * as cloneBirds from "./films/clone-birds/scene";
import { Film as CloneLionFilm } from "./films/clone-lion/Film";
import * as cloneLion from "./films/clone-lion/scene";
import dryRun from "./films/dry-run/film.json";
import { layoutOf, type FilmFormat } from "../src/film";

// One second of plain ground: the render smoke target. `remotion compositions` also crashes on
// an empty list (4.0.538), so the card always holds at least this one.
const Smoke: React.FC = () => <AbsoluteFill style={{ backgroundColor: "#ece4d4" }} />;

// Films: one <Composition id="F-<Id>"> per studio/films/<slug>/, sized from its film.json
// (docs/film-contract.md). Render with tools/render.sh F-<Id> studio/films/<slug>/out/silent-<format>.mp4.
const example_size = layoutOf(example.format as FilmFormat);
const dry_run_size = layoutOf(dryRun.format as FilmFormat);

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
    <Composition id="T14-CameraDevices" component={T14CameraDevices} durationInFrames={T14_DURATION} fps={30} width={1920} height={1080} />
    <Composition id="T15-TypeDevices" component={T15TypeDevices} durationInFrames={T15_DURATION} fps={30} width={1920} height={1080} />
    <Composition id="T16-DocDevices" component={T16DocDevices} durationInFrames={T16_DURATION} fps={30} width={1920} height={1080} />
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
    <Composition
      id={`F-${dryRun.id}`}
      component={DryRunFilm}
      durationInFrames={dryRun.durationInFrames}
      fps={dryRun.fps}
      width={dry_run_size.W}
      height={dry_run_size.H}
    />
    <Composition
      id="F-CloneVanGogh"
      component={CloneVanGoghFilm}
      durationInFrames={cloneVanGogh.DURATION}
      fps={cloneVanGogh.FPS}
      width={cloneVanGogh.WIDTH}
      height={cloneVanGogh.HEIGHT}
    />
    <Composition
      id="F-CloneBethlem"
      component={CloneBethlemFilm}
      durationInFrames={cloneBethlem.DURATION}
      fps={cloneBethlem.FPS}
      width={cloneBethlem.WIDTH}
      height={cloneBethlem.HEIGHT}
    />
    <Composition
      id="F-CloneBirds"
      component={CloneBirdsFilm}
      durationInFrames={cloneBirds.DURATION}
      fps={cloneBirds.FPS}
      width={cloneBirds.WIDTH}
      height={cloneBirds.HEIGHT}
    />
    <Composition
      id="F-CloneLion"
      component={CloneLionFilm}
      durationInFrames={cloneLion.DURATION}
      fps={cloneLion.FPS}
      width={cloneLion.WIDTH}
      height={cloneLion.HEIGHT}
    />
  </Folder>
);


export const RemotionRoot: React.FC = () => (
  <>
    <Techniques />
    <Films />
  </>
);
