import { AbsoluteFill } from "remotion";
import { SHOTS, type ShotId } from "../scene";
import { FONT, INK, PAPER_GREY } from "./kit";

/** Stand-in for a shot not built yet: its id and cut-table name on grey paper. */
export const Placeholder: React.FC<{ id: ShotId }> = ({ id }) => (
  <AbsoluteFill style={{ backgroundColor: PAPER_GREY, justifyContent: "center", alignItems: "center", padding: 80, fontFamily: FONT, color: INK, fontSize: 44, textAlign: "center" }}>
    {id}: {SHOTS.find((s) => s.id === id)?.name}
  </AbsoluteFill>
);
