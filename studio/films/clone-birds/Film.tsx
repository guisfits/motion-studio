import { AbsoluteFill, Audio, Freeze, Sequence, useCurrentFrame } from "remotion";
import { Grain } from "../../../src/texture";
import musicUrl from "./audio/music.wav";
import { Filters, q, Screen, useFonts, Vignette } from "./lib/kit";
import { LOOP, REPEATS } from "./scene";
import { A } from "./shots/A";

// Beats as Sequences on the loop timeline (breakdown 2); filled shot by shot (S9 T43/T44).
const BEATS: { from: number; to: number; Shot: React.FC }[] = [{ from: 0, to: 30, Shot: A }];

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
