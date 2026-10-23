import React from "react";
import { tornClip } from "./torn-clip";

export type TornProps = {
  seed: string;
  /** Bite depth in % of the side. */
  amp?: number;
  teeth?: number;
  /** Explicit clip polygon (e.g. one half from `tornSplitClips`); overrides seed/amp/teeth. */
  clip?: string;
  /** Colour of the white fibre rim peeking past the cut; null = none. */
  fibre?: string | null;
  style?: React.CSSProperties;
  children: React.ReactNode;
};

/**
 * Clips its children to a seeded torn polygon and lays a pale fibre rim just behind the cut,
 * like the exposed paper core of a real tear. The caller sizes it (width/height in `style`).
 */
export const Torn: React.FC<TornProps> = ({
  seed,
  amp,
  teeth,
  clip,
  fibre = "#f7f3ea",
  style,
  children,
}) => {
  const polygon = clip ?? tornClip(seed, amp, teeth);
  const fill: React.CSSProperties = { position: "absolute", inset: 0 };
  return (
    <div style={{ position: "relative", ...style }}>
      {fibre ? (
        <div
          style={{
            ...fill,
            background: fibre,
            clipPath: polygon,
            transform: "scale(1.012)",
          }}
        />
      ) : null}
      <div style={{ ...fill, clipPath: polygon }}>{children}</div>
    </div>
  );
};
