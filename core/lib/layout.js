// Output formats and their safe areas. Scenes are written against layout(format), never
// fixed pixels, so one timeline renders every format by reframing instead of cropping.

export const FORMATS = {
  // Reels/Shorts/TikTok: the bottom ~20% (caption + buttons) and the right rail
  // (like/comment/share) are covered by the platform UI; the top carries the account row.
  "9x16": {
    W: 1080,
    H: 1920,
    safe: { top: 220, bottom: 400, left: 64, right: 150 },
  },
  "1x1": {
    W: 1080,
    H: 1080,
    safe: { top: 72, bottom: 72, left: 72, right: 72 },
  },
  // YouTube / site: title-safe 5% plus room for the player chrome at the bottom.
  "16x9": {
    W: 1920,
    H: 1080,
    safe: { top: 64, bottom: 96, left: 96, right: 96 },
  },
};

// { W, H, safe, box, portrait } where box is the safe rectangle scenes compose inside.
export function layout(format) {
  const f = FORMATS[format];
  if (!f)
    throw new Error(
      `unknown format "${format}" (use ${Object.keys(FORMATS).join(", ")})`,
    );
  const { W, H, safe } = f;
  const box = {
    x: safe.left,
    y: safe.top,
    w: W - safe.left - safe.right,
    h: H - safe.top - safe.bottom,
  };
  return { format, W, H, safe, box, portrait: H > W };
}
