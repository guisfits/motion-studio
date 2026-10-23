import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { springReach } from "../core/lib/motion.js";
import { EASE } from "../core/lib/table.js";

const studio = fileURLToPath(new URL("..", import.meta.url));
const film = fileURLToPath(new URL("./fixture-table", import.meta.url));
const out = `${film}/out`;
const stills = (...ts) =>
  execFileSync("node", [`${studio}/core/render.mjs`, film, "--stills", ts.join(",")], { stdio: "pipe" });
const still = (i, t) => `${out}/stills-9x16/${String(i).padStart(3, "0")}-${t.toFixed(2)}s.png`;

// [r, g, b] of one pixel of a PNG at (x, y).
const pixel = (png, x, y) => [
  ...execFileSync("ffmpeg", ["-loglevel", "error", "-i", png, "-vf", `crop=1:1:${x}:${y}`,
    "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]).subarray(0, 3),
];
const near = (got, want, tol = 8) => got.every((c, i) => Math.abs(c - want[i]) <= tol);
const RED = [0xcc, 0x22, 0x22];
const BLUE = [0x22, 0x55, 0xcc];
const GREEN = [0x22, 0xaa, 0x44];

// Cues come from the page itself: the same table the film builds, read after the camera keys.
async function pageValue(expr, arg) {
  const { chromium } = await import("playwright");
  const { startServer, filmUrl } = await import("../core/server.mjs");
  const server = await startServer();
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
    await page.goto(filmUrl(server, film, "?format=9x16&render=1"));
    await page.waitForFunction(() => window.ready === true, null, { timeout: 60_000 });
    return await page.evaluate(expr, arg);
  } finally {
    await browser.close();
    server.close();
  }
}

test("the camera moves the world: the frame centre becomes the far surface", { timeout: 120_000 }, () => {
  rmSync(out, { recursive: true, force: true });
  stills(0.05, 2.5);
  const start = pixel(still(0, 0.05), 540, 960);
  const arrived = pixel(still(1, 2.5), 540, 960);
  assert.ok(near(start, RED), `at t=0.05 the centre is the sheet, got ${start}`);
  assert.ok(!near(start, GREEN), "the island is not under the camera at the start");
  assert.ok(near(arrived, GREEN), `at t=2.5 the centre is the island at (2000,2000), got ${arrived}`);
});

test("the same still rendered twice is byte-identical", { timeout: 120_000 }, () => {
  stills(1.7);
  const a = createHash("sha256").update(readFileSync(still(0, 1.7))).digest("hex");
  stills(1.7);
  const b = createHash("sha256").update(readFileSync(still(0, 1.7))).digest("hex");
  assert.equal(b, a);
});

const cueChecks = (cues) => {
  assert.deepEqual(cues.filter((c) => c.type === "swish" || c.type === "whoosh").map((c) => c.type),
    ["swish", "whoosh"]);
  const [swish, whoosh] = cues;
  // A camera whoosh peaks halfway along the move's spring (where the picture moves fastest), not at
  // the key that starts it: key + springReach(k, d, 0.5) of the move's ease (both keys: "move").
  const half = springReach(EASE.move.k, EASE.move.d, 0.5);
  assert.ok(Math.abs(swish.t - (1.2 + half)) < 1e-9 && Math.abs(whoosh.t - (3.0 + half)) < 1e-9,
    `cues sit at the middle of each move (${swish.t}, ${whoosh.t})`);
  assert.ok(swish.gain > whoosh.gain && swish.gain <= 1, "a longer move is louder, capped at 1");
  const tearCue = cues.find((c) => c.type === "tear");
  assert.ok(tearCue, "the tear child contributes its own cue");
  assert.equal(tearCue.t, 0.5);
};

// Move 1: (540,960) -> (2000,2000) is ~1792 px (> 1400); move 2: 600 px (250..1400).
test("cues(): a long move is a swish, a short one a whoosh, and children add theirs (keys with z)", { timeout: 120_000 }, async () => {
  const cues = await pageValue(() => {
    window.TABLE.camera([
      [0, { x: 540, y: 960, z: 1 }],
      [1.2, { x: 2000, y: 2000, z: 1 }],
      [3.0, { x: 2000, y: 2600, z: 1 }],
    ]);
    return window.TABLE.cues();
  });
  cueChecks(cues);
});

// The header of makeTable says missing fields keep the first key's value, but cues() subtracts
// an undefined z from the first key and gets NaN, so camera keys without z are never heard.
test("cues(): camera keys without z still produce whoosh/swish",
  { timeout: 120_000 }, async () => {
  cueChecks(await pageValue(() => window.TABLE_CUES()));
});

test("camera.at() reports the keyed positions once settled", { timeout: 120_000 }, async () => {
  const [home, far] = await pageValue(() => [window.CAMERA_AT(0), window.CAMERA_AT(2.8)]);
  // Handheld drift stays within ~25 px.
  assert.ok(Math.abs(home.x - 540) < 25 && Math.abs(home.y - 960) < 25, `home ${home.x},${home.y}`);
  assert.ok(Math.abs(far.x - 2000) < 25 && Math.abs(far.y - 2000) < 40, `far ${far.x},${far.y}`);
});

// A cut key is an instant jump: the move in flight does not carry its remaining travel across it,
// and the easing toward the next key starts from the cut key's pose. (Handheld drift: ~25 px,
// 1.2 % scale, 0.4 deg.)
test("camera cut: the cut frame is exactly the cut key, and the next move eases from there", { timeout: 120_000 }, async () => {
  const k = EASE.move.k;
  const d = EASE.move.d;
  const s = await pageValue(({ k, d }) => {
    window.TABLE.camera([
      [0, { x: 540, y: 960, z: 1, r: 0 }],
      [1.0, { x: 2000, y: 960, z: 0.5, r: 30 }],
      [1.2, { x: 300, y: 300, z: 1, r: 0, cut: true }],
      [2.0, { x: 900, y: 300, z: 1, r: 0 }],
      [3.0, { x: 1500, cut: true }],
    ]);
    const at = window.CAMERA_AT;
    return {
      before: at(1.2 - 1e-3),
      cut: at(1.2),
      next: [1, 2, 3, 6].map((n) => at(1.2 + n / 60)),
      easeFrom: at(2.05),
      partial: at(3.0),
    };
  }, { k, d });
  const near = (a, b, tol) => Math.abs(a - b) <= tol;
  assert.ok(s.before.x > 900 && s.before.z < 0.9, `the move is in flight just before the cut: ${JSON.stringify(s.before)}`);
  for (const [i, p] of [s.cut, ...s.next].entries()) {
    assert.ok(near(p.x, 300, 25) && near(p.y, 300, 25), `frame ${i} after the cut sits at the cut key: ${p.x},${p.y}`);
    assert.ok(near(p.z, 1, 0.03), `frame ${i} after the cut is at scale 1, got ${p.z}`);
    assert.ok(near(p.r, 0, 0.5), `frame ${i} after the cut is upright, got ${p.r}`);
  }
  const { spring } = await import("../core/lib/motion.js");
  const want = 300 + 600 * spring(0.05, k, d);
  assert.ok(near(s.easeFrom.x, want, 25), `easing starts from the cut pose: ${s.easeFrom.x} vs ${want}`);
  // A cut key that names only x keeps the other fields of the pose it follows.
  assert.ok(near(s.partial.x, 1500, 25) && near(s.partial.y, 300, 25) && near(s.partial.z, 1, 0.03),
    `partial cut: ${JSON.stringify(s.partial)}`);
});

test("a torn sheet reveals what lies beneath once it opens", { timeout: 120_000 }, () => {
  stills(0.2, 1.0);
  // (540,500) is far from the ragged seam at mid-height, so it is the sheet before and the
  // under-surface after, never a blend of the halves' edges.
  const before = pixel(still(0, 0.2), 540, 500);
  const after = pixel(still(1, 1.0), 540, 500);
  assert.ok(near(before, RED), `before the tear: sheet colour, got ${before}`);
  assert.ok(near(after, BLUE), `after the tear: the surface beneath, got ${after}`);
  const lower = pixel(still(1, 1.0), 540, 1500);
  assert.ok(near(lower, BLUE), `the lower half opened too, got ${lower}`);
});

test("station.surface lays a torn paper sheet: ragged clip inside, a drop shadow that follows it outside, returned to the caller", { timeout: 120_000 }, async () => {
  const r = await pageValue(() => {
    const st = window.TABLE.station({ x: 100, y: 200, rot: 5 });
    const geo = { x: 10, y: 20, w: 300, h: 500, color: "#eee" };
    const [a] = st.surface({ ...geo, torn: { seed: 3 } });
    const [b] = st.surface({ ...geo, torn: { seed: 4, depth: 5, jag: 10 } });
    const [bare] = st.surface({ ...geo, torn: { seed: 3 }, shadow: false });
    const [plain] = st.surface({ ...geo });
    const dup = st.surface({ ...geo, torn: { seed: 3 } })[0];
    let err = "";
    try {
      st.surface({ ...geo, torn: {} });
    } catch (e) {
      err = e.message;
    }
    const pts = (el) => el.firstChild.style.clipPath.split(",").length;
    return {
      parent: a.parentNode === st.el,
      shadow: a.style.filter,
      clip: a.firstChild.style.clipPath,
      outerClip: a.style.clipPath,
      other: b.firstChild.style.clipPath,
      sameSeed: dup.firstChild.style.clipPath === a.firstChild.style.clipPath,
      ptsA: pts(a),
      ptsB: pts(b),
      bareFilter: bare.style.filter,
      plainBox: plain.style.boxShadow,
      plainClip: plain.style.clipPath,
      geometry: [a.style.left, a.style.top, a.style.width, a.style.height],
      err,
    };
  });
  assert.ok(r.parent, "lies in the station's frame");
  assert.match(r.shadow, /drop-shadow/, "soft shadow on the outer box");
  assert.match(r.clip, /^polygon\(/, "ragged edge on the sheet inside");
  assert.equal(r.outerClip, "", "the shadow is not clipped by the tear");
  assert.notEqual(r.other, r.clip, "another seed tears differently");
  assert.ok(r.sameSeed, "a seed always tears the same way");
  assert.ok(r.ptsB < r.ptsA, "fewer jag points, fewer polygon points");
  assert.equal(r.bareFilter, "", "shadow: false leaves the sheet flat");
  assert.match(r.plainBox, /rgba/, "a plain surface keeps its box shadow");
  assert.equal(r.plainClip, "");
  assert.deepEqual(r.geometry, ["10px", "20px", "300px", "500px"]);
  assert.match(r.err, /torn needs a numeric seed/);
});

test("table.surface takes torn too, and station.surface returns the element it laid", { timeout: 120_000 }, async () => {
  const r = await pageValue(() => {
    const el = window.TABLE.surface({ x: 0, y: 0, w: 100, h: 100, color: "#fff", torn: { seed: 1 } });
    const made = window.TABLE.station({ x: 0, y: 0 }).surface({ x: 0, y: 0, w: 50, h: 50 });
    return { clip: el.firstChild.style.clipPath.slice(0, 8), made: made.length, tag: made[0]?.tagName };
  });
  assert.equal(r.clip, "polygon(");
  assert.equal(r.made, 1);
  assert.equal(r.tag, "DIV");
});

test("tornClip lives in the engine and the vox kit still exports it", async () => {
  const { tornClip: engine } = await import("../core/lib/torn.js");
  const { tornClip: kit } = await import("../styles/vox/lib/kit.js");
  assert.equal(kit, engine);
  assert.equal(engine(5, 8, 2), engine(5, 8, 2));
  assert.match(engine(5, 8, 2), /^polygon\(/);
});
