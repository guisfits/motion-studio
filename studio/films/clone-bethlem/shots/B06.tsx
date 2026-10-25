import { AbsoluteFill } from "remotion";
import { Plate, ramp, useRefFrame } from "../lib/kit";
import snowUrl from "../assets/gen/P06-snowy-westminster.png";

// Shot 6-7 (reference f257-324, 10.67-13.46 s): 6 the snowy Westminster crowd pushes 1.0 -> 1.4 toward
// the crowd (f257-288, hard cut in); 7 tight crop of the crowd, lamp and holly wreath drifting left to
// right (f289-324), re-cropped at f301. The lamp pole is a different depth than the men: the lamp
// layer is the same plate again, moved 1.2x.

const ASPECT = 1088 / 1920;
// The generated plate carries a fake signature in its bottom-right corner: every crop stays above it.
const NO_SIGNATURE: [number, number, number, number] = [0, 0, 1, 0.955];
// Men spaced ~25 % of the frame, hats at ~55 % height (as the reference), wreath above them.
const CROP_A: [number, number, number, number] = [0.0, 0.18, 0.75, 0.75];
const CROP_B: [number, number, number, number] = [0.01, 0.305, 0.55, 0.55];

export const B06: React.FC = () => {
  const t = useRefFrame();
  if (t < 32) {
    // Push toward the crowd's right-centre; reference scale fit 1.0 -> 1.4 with the tower sliding up and out.
    const s = ramp(t, 0, 31, 1, 1.4);
    return (
      <AbsoluteFill style={{ transform: `scale(${s})`, transformOrigin: "40% 78%" }}>
        <Plate src={snowUrl} aspect={ASPECT} crop={NO_SIGNATURE} />
      </AbsoluteFill>
    );
  }
  const second = t >= 44; // re-crop at f301 (breakdown cut table: 40)
  const crop = second ? CROP_B : CROP_A;
  const seg = second ? ramp(t, 44, 67, 0, 1) : ramp(t, 32, 43, 0, 1);
  // Men move right (camera pans), the lamp layer 1.2x faster and clipped to the left strip.
  const men = (second ? -3 : -4) + seg * (second ? 6 : 4);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translateX(${men}%) scale(${1.12 + seg * 0.04})` }}>
        <Plate src={snowUrl} aspect={ASPECT} crop={crop} />
      </AbsoluteFill>
      <AbsoluteFill style={{ transform: `translateX(${men * 1.2}%) scale(${1.12 + seg * 0.04})`, clipPath: "inset(0 62% 40% 0)" }}>
        <Plate src={snowUrl} aspect={ASPECT} crop={crop} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
