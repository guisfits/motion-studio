import { AbsoluteFill, Audio } from "remotion";
import musicUrl from "./audio/music.wav";
import { Filters, useFonts } from "./lib/kit";
import { Back, Type } from "./shots/Back";
import { Front, Wipe } from "./shots/Front";
import { Head } from "./shots/Head";

// One 241-frame shot, reference frame = our frame. Back to front: the back plane (ghost tree, flock,
// lion, strip), the front flock, the yellow wipe (colour blend, so it only tints the cut-outs), the
// red type on top of the wipe, then the big blurred head.
export const Film: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#fcfcfc 0%, #fcfcfc 70%, #f6f6f6 100%)" }}>
      <Filters />
      <Back />
      <Front />
      <Wipe />
      <Type />
      <Head />
      <Audio src={musicUrl} />
    </AbsoluteFill>
  );
};
