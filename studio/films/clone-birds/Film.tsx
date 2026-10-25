import { AbsoluteFill, useCurrentFrame } from "remotion";
import { LOOP } from "./scene";

// Placeholder until the kit and the beats land (S9 T43): shows the loop frame so the
// composition renders and the stills sheet can be wired.
export const Film: React.FC = () => {
  const f = useCurrentFrame() % LOOP;
  return (
    <AbsoluteFill style={{ backgroundColor: "#cfd6e6", alignItems: "center", justifyContent: "center", fontSize: 120 }}>
      {f}
    </AbsoluteFill>
  );
};
