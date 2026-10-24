import { describe, expect, it } from "vitest";
import { stepFrame } from "../paper";
import {
  caretVisible,
  circleMarkBox,
  circleMarkPath,
  counterStart,
  counterValue,
  drawProgress,
  formatCount,
  handwriteMask,
  handwriteProgress,
  typedCount,
  typedDoneFrame,
  typedText,
} from "../type";

const fps = 30;

describe("counterStart", () => {
  it("is dur frames before the landing frame, rounded like the component", () => {
    expect(counterStart(2, 30, 36)).toBe(24);
    expect(counterStart(1.01, 30, 10)).toBe(20);
  });
});

describe("counterValue", () => {
  const spec = { from: 0, to: 1492, start: 30, dur: 30, fps, steps: 10 };
  it("is the start value before, exactly the target after", () => {
    expect(counterValue(0, spec)).toBe(0);
    expect(counterValue(60, spec)).toBe(1492);
    expect(counterValue(300, spec)).toBe(1492);
  });
  it("clicks in discrete steps and never decreases", () => {
    const seen = new Set<number>();
    let prev = -1;
    for (let f = 0; f <= 70; f++) {
      const v = counterValue(f, spec);
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
      seen.add(v);
    }
    expect(seen.size).toBeLessThanOrEqual(11);
    expect(seen.size).toBeGreaterThan(5);
  });
  it("poses on twos at 12 fps", () => {
    const s = { ...spec, stepFps: 12, steps: 400 };
    const smooth = { ...s, stepFps: undefined };
    // 40 and 41 share the pose that began on 40; the smooth count differs between them.
    expect(counterValue(41, s)).toBe(counterValue(40, s));
    expect(counterValue(41, smooth)).not.toBe(counterValue(40, smooth));
  });
  it("formats pt-BR thousands and decimals by locale", () => {
    expect(formatCount(1234567, "pt-BR")).toBe("1.234.567");
    expect(formatCount(1234.5, "pt-BR", 2)).toBe("1.234,50");
    expect(formatCount(1234567, "en-US")).toBe("1,234,567");
  });
});

describe("the step clock", () => {
  // Every stepped pure function reads the value at the frame its pose began (`stepFrame`), exactly:
  // 30 fps on 15 poses a second changes pose on every even frame, frame 246 included.
  const stepped = { stepFps: 15 };
  it("holds a counter, a typewriter and a handwriting on the stepFrame clock", () => {
    const counter = { from: 0, to: 100000, start: 0, dur: 900, fps, steps: 100000 };
    const type = { text: "x".repeat(900), fps, startS: 0, cps: 30 };
    const write = { fps, startS: 0, durS: 30, lines: 1 };
    for (let f = 0; f < 900; f++) {
      const at = stepFrame(f, fps, 15);
      expect(counterValue(f, { ...counter, ...stepped })).toBe(counterValue(at, counter));
      expect(typedCount(f, { ...type, ...stepped })).toBe(typedCount(at, type));
      expect(handwriteProgress(f, 0, { ...write, ...stepped })).toBe(handwriteProgress(at, 0, write));
    }
  });
});

describe("typewriter", () => {
  const spec = { text: "Nínive é", fps, startS: 1, cps: 12 };
  it("shows nothing before the start and the first character on it", () => {
    expect(typedCount(29, spec)).toBe(0);
    expect(typedCount(30, spec)).toBe(1);
  });
  it("runs at the set cadence and ends on the whole text", () => {
    expect(typedCount(30 + 30, spec)).toBe(8);
    expect(typedCount(30 + 15, spec)).toBe(Math.floor(0.5 * 12) + 1);
    expect(typedCount(999, spec)).toBe(8);
  });
  it("counts a letter with its accent once", () => {
    const decomposed = { ...spec, text: "Nínive" };
    expect(typedCount(999, decomposed)).toBe(6);
    expect(typedText("Nínive", 2)).toBe("Ní");
  });
  it("steps at 12 poses per second when asked", () => {
    const s = { ...spec, stepFps: 12, cps: 30 };
    expect(typedCount(31, s)).toBe(typedCount(30, s));
  });
  it("names the frame the last character is struck, for any cadence", () => {
    for (const cps of [7, 9, 11, 12, 13, 14.5]) {
      for (const text of ["abc", "Nínive é", "a primeira Bíblia impressa"]) {
        const sp = { text, fps, startS: 0.4, cps };
        const done = typedDoneFrame(sp);
        expect(typedCount(done, sp)).toBe(text.length);
        expect(typedCount(done - 1, sp)).toBeLessThan(text.length);
      }
    }
  });
  it("names it on the held pose when stepped", () => {
    const sp = { text: "abcdef", fps, startS: 0, cps: 11, stepFps: 12 };
    const done = typedDoneFrame(sp);
    expect(typedCount(done, sp)).toBe(6);
    expect(typedCount(done - 1, sp)).toBeLessThan(6);
  });
  it("keeps the caret solid while typing and blinks after", () => {
    expect(caretVisible(35, spec)).toBe(true);
    const done = typedDoneFrame(spec);
    const states = new Set([done + 1, done + 8, done + 16, done + 24].map((f) => caretVisible(f, spec)));
    expect(states.size).toBe(2);
  });
});

describe("handwrite", () => {
  const spec = { fps, startS: 1, durS: 2, lines: 2 };
  it("writes lines one after the other, whole at the end", () => {
    expect(handwriteProgress(0, 0, spec)).toBe(0);
    expect(handwriteProgress(45, 0, spec)).toBeGreaterThan(0.4);
    expect(handwriteProgress(45, 1, spec)).toBe(0);
    expect(handwriteProgress(90, 1, spec)).toBe(1);
    expect(handwriteProgress(30 + 30, 0, spec)).toBe(1);
  });
  it("masks everything at 0 and nothing at 1", () => {
    expect(handwriteMask(0)).toContain("calc(0 * (100% + 0.35em) - 0.35em)");
    expect(handwriteMask(1)).toContain("calc(1 * (100% + 0.35em) - 0.35em)");
  });
});

describe("circleMark", () => {
  const pts = (d: string) => [...d.matchAll(/[ML] ([\d.-]+) ([\d.-]+)/g)].map((m) => [Number(m[1]), Number(m[2])]);
  it("is empty at 0 and grows point by point", () => {
    expect(circleMarkPath("a", 0)).toBe("");
    const a = pts(circleMarkPath("a", 0.3)).length;
    const b = pts(circleMarkPath("a", 0.9)).length;
    expect(b).toBeGreaterThan(a);
  });
  it("closes the lap and overshoots its start, inside the unit box", () => {
    const p = pts(circleMarkPath("a", 1));
    const [x0, y0] = p[0];
    const [x1, y1] = p[p.length - 1];
    const gap = Math.hypot(x1 - x0, y1 - y0);
    expect(gap).toBeGreaterThan(0.5);
    expect(gap).toBeLessThan(22);
    for (const [x, y] of p) {
      expect(x).toBeGreaterThan(-5);
      expect(x).toBeLessThan(105);
      expect(y).toBeGreaterThan(-5);
      expect(y).toBeLessThan(105);
    }
  });
  it("is irregular, seeded and pure", () => {
    expect(circleMarkPath("a", 1)).toBe(circleMarkPath("a", 1));
    expect(circleMarkPath("a", 1)).not.toBe(circleMarkPath("b", 1));
  });
  it("gives the box it occupies for a trace", () => {
    expect(circleMarkBox({ x: 100, y: 100, w: 200, h: 100 }, 0.1)).toEqual({ x: 80, y: 90, w: 240, h: 120 });
  });
  it("draws on the pure progress shared with useDraw", () => {
    expect(drawProgress(0, fps, 2)).toBe(0);
    expect(drawProgress(70, fps, 2)).toBe(1);
  });
  it("stops the pen exactly at the progress, keeping the points already drawn", () => {
    const part = pts(circleMarkPath("a", 0.3));
    const full = pts(circleMarkPath("a", 1));
    expect(part.slice(0, -1)).toEqual(full.slice(0, part.length - 1));
    expect(part[part.length - 1]).not.toEqual(full[part.length - 1]);
  });
  it("poses on twos unless told otherwise", () => {
    expect(drawProgress(61, fps, 2)).toBe(drawProgress(60, fps, 2));
    expect(drawProgress(61, fps, 2, 12, 3, false)).not.toBe(drawProgress(60, fps, 2, 12, 3, false));
  });
});
