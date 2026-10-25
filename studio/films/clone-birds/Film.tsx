import { AbsoluteFill, Audio, Freeze, Sequence, useCurrentFrame } from "remotion";
import { Grain } from "../../../src/texture";
import musicUrl from "./audio/music.wav";
import { Filters, q, Screen, useFonts, Vignette } from "./lib/kit";
import { LOOP, REPEATS } from "./scene";
import { Air } from "./shots/Air";
import { Street } from "./shots/Street";

// Two layer groups over the whole loop, so loop frame = reference frame inside both (a Sequence
// with from > 0 would shift useCurrentFrame): the street (sky, Capitol camera, signs, van, crowd)
// and the air above it (plane + banner, pigeon, reticle, foreground trees). Each returns nothing
// outside its own frames.
const BEATS: { from: number; to: number; Shot: React.FC }[] = [
  { from: 0, to: LOOP, Shot: Street },
  { from: 0, to: LOOP, Shot: Air },
];

const Loop: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0d24" }}>
      <Filters />
      {BEATS.map(({ from, to, Shot }) => (
        <Sequence key={from} from={from} durationInFrames={to - from} layout="none">
          <Shot />
        </Sequence>
      ))}
      <Screen />
      <Vignette />
      <Grain opacity={0.35} size={1.2} stepFps={30} />
    </AbsoluteFill>
  );
};

// One picture tree, frozen on the reference's 12 fps 3/2 clock (breakdown 1), replayed REPEATS
// times with a hard cut at the seam; the bed already holds the three copies.
export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {Array.from({ length: REPEATS }, (_, i) => (
        <Sequence key={i} from={i * LOOP} durationInFrames={LOOP}>
          <Freeze frame={q(frame - i * LOOP)}>
            <Loop />
          </Freeze>
        </Sequence>
      ))}
      <Audio src={musicUrl} />
    </AbsoluteFill>
  );
};
