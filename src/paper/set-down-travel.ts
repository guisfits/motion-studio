import type { Side } from "./SetDown";

/**
 * Off-frame travel of a `SetDown` sheet in px: the frame size on the travel axis, plus the
 * sheet's own size on that axis (so a sheet resting anywhere in the frame starts fully
 * outside it), plus any extra margin for rotation overhang.
 */
export const setDownTravel = (
  from: Side,
  width: number,
  height: number,
  opts: { size?: [number, number]; margin?: number } = {},
): number => {
  const horizontal = from === "left" || from === "right";
  const sheet = opts.size ? (horizontal ? opts.size[0] : opts.size[1]) : 0;
  return (horizontal ? width : height) + sheet + (opts.margin ?? 0);
};
