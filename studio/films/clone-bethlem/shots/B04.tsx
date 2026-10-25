import { AbsoluteFill } from "remotion";
import { FONT, Plate, useRefFrame } from "../lib/kit";
import words from "../crew/words.json";
import plateUrl from "../assets/pd/P04b-bethlem-entrance-facade.jpg";

// Shot 4 (reference f159-224, 6.58-9.29 s): the text wall. Near-black ground, the hospital plate
// ghosted at ~10 %, nine lines of the UPCOMING script scrolling horizontally in alternating
// directions. The middle line is the live line: one long string, white up to the spoken character
// and grey after, pinned at a fixed point and scrolling right-to-left with the voice (breakdown 6.2).

const SIZE = 150;
const PITCH = 190;
const FIRST_Y = 185; // centre of row 0; row 4 (y = 945) is the live line
const HEAD_X = 600; // where the spoken character sits once the line starts to scroll
const START_X = 30;
const GREY = "rgba(150,150,145,0.8)";
const SCRIPT =
  "Inside, patients were chained to walls. Beaten. Starved. It all changed when investigators walked in and found James Norris, an American sailor who had been locked in a metal harness bolted to a wall for twelve years. The images went across every newspaper in Britain. ";
const LIVE = "London's only asylum for the mentally ill,";
const LIVE_REST = " a penny to get in.";
const FIRST_FRAME_REF = 158; // shot start in absolute reference frames

type W = { w: string; s: number; e: number };
const LIVE_WORDS = (words.words as W[]).filter((x) => x.s >= 6.7 && x.s < 9.45);

let ctx: CanvasRenderingContext2D | null = null;
const measure = (text: string) => {
  ctx ??= document.createElement("canvas").getContext("2d")!;
  ctx.font = `500 ${SIZE}px "${FONT}"`;
  return ctx.measureText(text).width;
};

/** Spoken character position (fractional) in LIVE at reference time sec: words pace their own characters. */
const spokenChars = (sec: number) => {
  let chars = 0;
  for (const w of LIVE_WORDS) {
    const len = w.w.length + 1;
    if (sec >= w.e) chars += len;
    else {
      if (sec > w.s) chars += ((sec - w.s) / (w.e - w.s)) * len;
      break;
    }
  }
  return Math.min(chars, LIVE.length);
};

// Per row: script offset in characters and scroll speed in px per reference frame (alternating signs).
const ROWS: { off: number; v: number; x0: number }[] = [
  { off: 29, v: -38, x0: 0 },
  { off: 190, v: 34, x0: -3400 },
  { off: 98, v: -45, x0: 0 },
  { off: 300, v: 36, x0: -3500 },
  { off: 0, v: 0, x0: 0 }, // live
  { off: 330, v: 33, x0: -3300 },
  { off: 55, v: -40, x0: 0 },
  { off: 400, v: 38, x0: -3600 },
  { off: 120, v: -42, x0: 0 },
];

const Live: React.FC<{ t: number }> = ({ t }) => {
  const sec = (FIRST_FRAME_REF + t) / 24 + 0.5;
  const c = spokenChars(sec);
  const whole = Math.floor(c);
  const head = measure(LIVE.slice(0, whole)) + (c - whole) * measure(LIVE[whole] ?? "");
  const x = Math.min(START_X, HEAD_X - head);
  const done = LIVE.slice(0, whole);
  return (
    <div style={{ position: "absolute", left: x, top: FIRST_Y + 4 * PITCH, transform: "translateY(-50%)", whiteSpace: "pre", fontFamily: FONT, fontSize: SIZE, fontWeight: 500, lineHeight: 1 }}>
      <span style={{ color: "#F3F3EE", textShadow: "0 3px 14px rgba(0,0,0,0.7)" }}>{done}</span>
      <span style={{ color: GREY }}>{LIVE.slice(whole) + LIVE_REST + " " + SCRIPT}</span>
    </div>
  );
};

export const B04: React.FC = () => {
  const t = useRefFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#1b1b19", overflow: "hidden" }}>
      <AbsoluteFill style={{ opacity: 0.2 }}>
        <Plate src={plateUrl} aspect={1601 / 1174} crop={[0.29, 0, 0.41, 1]} />
      </AbsoluteFill>
      {ROWS.map((r, i) =>
        i === 4 ? (
          <Live key={i} t={t} />
        ) : (
          <div
            key={i}
            style={{ position: "absolute", top: FIRST_Y + i * PITCH, left: r.x0 + r.v * t, transform: "translateY(-50%)", whiteSpace: "pre", fontFamily: FONT, fontSize: SIZE, fontWeight: 500, lineHeight: 1, color: GREY }}
          >
            {(SCRIPT + SCRIPT + SCRIPT).slice(r.off)}
          </div>
        ),
      )}
    </AbsoluteFill>
  );
};
