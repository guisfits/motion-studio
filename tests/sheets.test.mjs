import { test, after } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { flatRanges, frames } from "../core/critique/sheets.mjs";

const ff = (args) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args], { stdio: "pipe" });
const dir = mkdtempSync(join(tmpdir(), "sheets-test-"));
const S = "s=270x480:r=30";

// A 9:16 clip: a grainy bare ground for `bare` seconds, then busy test-pattern frames for `busy`.
function clip(name, { bare, busy }) {
  const out = join(dir, name);
  const filters = [];
  let i = 0;
  const inputs = [];
  if (bare) {
    inputs.push("-f", "lavfi", "-i", `color=c=0xe8dcc0:d=${bare}:${S},noise=alls=6:allf=t`);
    filters.push(`[${i++}:v]`);
  }
  if (busy) {
    inputs.push("-f", "lavfi", "-i", `testsrc2=d=${busy}:${S}`);
    filters.push(`[${i++}:v]`);
  }
  ff([...inputs, "-filter_complex", `${filters.join("")}concat=n=${i}:v=1[v]`, "-map", "[v]", "-pix_fmt", "yuv420p", out]);
  return out;
}

// [r, g, b] of one pixel of a PNG at (x, y).
const pixel = (png, x, y) => [
  ...execFileSync("ffmpeg", ["-loglevel", "error", "-i", png, "-vf", `crop=1:1:${x}:${y}`, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]).subarray(0, 3),
];

test("--flat reports the bare stretch and only that", () => {
  const ranges = flatRanges(clip("bare-then-busy.mp4", { bare: 2, busy: 3 }));
  assert.equal(ranges.length, 1, JSON.stringify(ranges));
  assert.ok(Math.abs(ranges[0].from - 0) < 0.15 && Math.abs(ranges[0].to - 2) < 0.2, JSON.stringify(ranges));
  assert.ok(ranges[0].bare > 0.9, `bare share ${ranges[0].bare}`);
});

test("--flat ignores a busy film and a bare stretch of 0.5 s or less", () => {
  assert.deepEqual(flatRanges(clip("busy.mp4", { bare: 0, busy: 3 })), []);
  const short = clip("short.mp4", { bare: 0.4, busy: 2 });
  assert.deepEqual(flatRanges(short), []);
});

test("the phone sheet shades the Reels UI zones and leaves the safe box clear", () => {
  const gray = join(dir, "gray.mp4");
  ff(["-f", "lavfi", "-i", `color=c=0x808080:d=1:${S}`, "-pix_fmt", "yuv420p", gray]);
  const f = frames(gray, { fps: 1, width: 360, guides: true });
  try {
    const png = f.cells[0].file; // 360 x 640: 1080x1920 scaled by 1/3
    const at = (x, y) => pixel(png, Math.round(x / 3), Math.round(y / 3));
    const tinted = ([r, , b]) => r > b + 10;
    assert.ok(tinted(at(540, 100)), "top 220 px shaded");
    assert.ok(tinted(at(540, 1700)), "bottom 400 px shaded");
    assert.ok(tinted(at(1010, 1300)), "right rail shaded from y 1100");
    assert.ok(!tinted(at(1010, 900)), "the rail starts at y 1100");
    assert.ok(!tinted(at(540, 900)), "the safe box is untouched");
    assert.ok(!tinted(at(900, 1300)), "the rail is only 140 px wide");
  } finally {
    rmSync(f.dir, { recursive: true, force: true });
  }
});

after(() => rmSync(dir, { recursive: true, force: true }));
