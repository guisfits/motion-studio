import type { Cue } from "../../src/audio/cues";

// Single source of T08's timing (seconds): the composition animates from these constants and the
// cue list below is derived from them, so a sound lands on the frame its contact is drawn.
// Pure module (type-only import) so Node can load it for tools/audio/cues-json.mjs.
// Times named P1_* are passage-1 local (= composition time, it starts at 0); P2_* are local to
// passage 2, which starts at P2_FROM (composition seconds).

export const T08_FPS = 30;
export const T08_DURATION = 17 * T08_FPS;

// Passage 1 runs P1_FRAMES, the tornWipe join overlaps JOIN_FRAMES of it with passage 2.
export const P1_FRAMES = 270;
export const JOIN_FRAMES = 22;
export const P2_FRAMES = T08_DURATION - P1_FRAMES + JOIN_FRAMES;
export const P2_FROM = (P1_FRAMES - JOIN_FRAMES) / T08_FPS;
// The torn edge bites in over the first frames of the join: the rip is heard just after it starts.
export const JOIN_TEAR = P2_FROM + 0.1;

// Travel times of the paper pieces (src/paper): a sheet lands when its carry ends, a strip
// likewise; the sound is the contact, not the start of motion.
export const SET_DOWN_DUR = 0.55;
export const TAPE_DUR = 0.25;
/** Delay that makes a set-down piece land (contact) at `contact` seconds. */
export const delayFor = (contact: number) => contact - SET_DOWN_DUR;

// The voice lines start here (composition s); key words land on their spoken onsets.
export const VO1_AT = 1.8;
export const VO2_AT = 9.6;
export const WORD_ONSETS = { word: 1.25, hand: 2.87, map: 0.34, argument: 0.83, matters: 1.99 };

// Passage 1: hero sheet, one card per key word, tape on the second card, a tear of the hero.
export const P1_HERO = 0.3;
export const P1_WORD = VO1_AT + WORD_ONSETS.word; // card lands on the word
export const P1_HAND = VO1_AT + WORD_ONSETS.hand;
export const P1_TAPE = 4.9;
export const P1_TEAR = 6.2;

// Passage 2 (local to P2_FROM): hero cut-out, one card per key word, stamp, tapes, closing cut-out.
export const P2_HERO = 0.75;
export const P2_MAP = VO2_AT + WORD_ONSETS.map - P2_FROM;
export const P2_ARGUMENT = VO2_AT + WORD_ONSETS.argument - P2_FROM;
export const P2_STAMP_HIT = VO2_AT + WORD_ONSETS.matters - P2_FROM;
export const P2_STAMP_DUR = 8 / T08_FPS;
export const P2_TAPE_A = 4.5;
export const P2_TAPE_B = 6.0;
export const P2_CLOSE = 7.1;

// Passage-2 local seconds to composition seconds.
const p2 = (t: number) => P2_FROM + t;

export const T08_CUES: Cue[] = [
  { at: P1_HERO + SET_DOWN_DUR, sfx: "paper-place", gain: 0.6 },
  { at: P1_WORD, sfx: "paper-place", gain: 0.5 },
  { at: P1_HAND, sfx: "paper-place", gain: 0.5 },
  { at: P1_TAPE + TAPE_DUR, sfx: "tape", gain: 0.6 },
  { at: P1_TEAR, sfx: "tear", gain: 0.6 },
  { at: JOIN_TEAR, sfx: "tear", gain: 0.6 },
  { at: p2(P2_HERO + SET_DOWN_DUR), sfx: "paper-place", gain: 0.6 },
  { at: p2(P2_MAP), sfx: "paper-place", gain: 0.5 },
  { at: p2(P2_ARGUMENT), sfx: "paper-place", gain: 0.5 },
  { at: p2(P2_STAMP_HIT), sfx: "stamp", gain: 0.6 },
  { at: p2(P2_TAPE_A + TAPE_DUR), sfx: "tape", gain: 0.6 },
  { at: p2(P2_TAPE_B + TAPE_DUR), sfx: "tape", gain: 0.6 },
  { at: p2(P2_CLOSE + SET_DOWN_DUR), sfx: "paper-place", gain: 0.5 },
];
