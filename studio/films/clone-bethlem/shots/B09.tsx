import { Card, FONT, INK, Words, useRefFrame } from "../lib/kit";
import paperUrl from "../assets/pd/P25-paper-mottled-ambientcg-Paper003.jpg";
import doorUrl from "../assets/gen/P15-cell-door.png";

// Shot 15 (reference f553-594, 23.00-24.71 s): the quiet beat. Pale paper, the barred cell door ghosted
// at ~15 %, no bar: plain black Garamond (~38 px in the 540-px reference, 60 px here). "Nobody" (f556) -> "Nobody thought" (f564) ->
// "twice about it." replaces both at f577 (breakdown 6.3 card B).

export const B09: React.FC = () => {
  const t = useRefFrame();
  const text = t < 3 ? "" : t < 11 ? "Nobody" : t < 23.5 ? "Nobody thought" : "twice about it.";
  return (
    <Card paper={paperUrl} ghost={doorUrl} ghostOpacity={0.13} tone="#EEEEEC">
      {/* ~38 px in the 540-wide reference = ~60 px at our 1080 (measured on the sheets) */}
      <Words size={60} y={49.7} color={INK} weight={400} style={{ fontFamily: FONT }}>{text}</Words>
    </Card>
  );
};
