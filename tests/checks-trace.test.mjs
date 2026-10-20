import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { sampleTrace, checkTrace } from "../core/checks/trace.mjs";

const film = fileURLToPath(new URL("./fixture-trace", import.meta.url));
const codes = (f) => [...new Set(f.map((x) => x.code))].sort();

test(
  "trace is sampled from the page at the given fps",
  { timeout: 60_000 },
  async () => {
    const tr = await sampleTrace(film, { format: "9x16", fps: 10 });
    assert.equal(tr.frames.length, 30);
    // The format's safe box, scaled to the film's own 540x960 frame (T9 reads it).
    assert.deepEqual(tr.safe, [35, 110, 422.5, 650]);
    assert.equal(tr.frames[6].items[0].id, "cap1");
    assert.deepEqual(codes(checkTrace(tr)), ["T2", "T4", "T5", "T7"]);
  },
);

test("a film without a trace is red, not an empty pass", () => {
  const f = checkTrace({
    W: 540,
    H: 960,
    dur: 1,
    frames: [{ t: 0, items: null, camera: null }],
  });
  assert.deepEqual(codes(f), ["T0"]);
});

test("a caption at a fade does not count as legible", () => {
  const frames = Array.from({ length: 30 }, (_, i) => ({
    t: i / 30,
    camera: null,
    items: [
      {
        id: "c",
        role: "caption",
        text: "fé",
        box: [100, 700, 100, 50],
        alpha: i < 20 ? 0.6 : 1,
      },
      { id: "h", role: "hero", box: [100, 100, 340, 600], alpha: 1 },
    ],
  }));
  assert.ok(
    codes(checkTrace({ W: 540, H: 960, dur: 1, frames })).includes("T2"),
  );
});

// Register A swaps caption chunks every 0.4-0.6 s (grammar §7, §10): 0.6 s passes, 0.4 s does not.
test("a caption legible for a measured chunk swap passes T2, a shorter one fails", () => {
  const caption = (legibleFrames) =>
    Array.from({ length: 30 }, (_, i) => ({
      t: i / 30,
      camera: null,
      items: [
        ...(i < legibleFrames
          ? [{ id: "c", role: "caption", text: "fé", box: [100, 700, 100, 50], alpha: 1 }]
          : []),
        { id: "h", role: "hero", box: [100, 100, 340, 600], alpha: 1 },
      ],
    }));
  const t2 = (n) => codes(checkTrace({ W: 540, H: 960, dur: 1, frames: caption(n) })).includes("T2");
  assert.equal(t2(18), false);
  assert.equal(t2(12), true);
});

// A display word bled off the edge on purpose (grammar: oversized type cropped by the frame)
// is flagged `bleed: true` and exempt from T4; a caption must stay whole whatever it says.
test("lettering flagged bleed is exempt from T4, a bleeding caption is not", () => {
  const frame = (item) => [
    {
      t: 0,
      camera: null,
      items: [item, { id: "h", role: "hero", box: [100, 100, 340, 600], alpha: 1 }],
    },
  ];
  const t4 = (item) =>
    codes(checkTrace({ W: 540, H: 960, dur: 1, frames: frame(item) })).includes("T4");
  const word = { id: "w", role: "lettering", text: "FÉ", box: [-80, 300, 700, 260], alpha: 1 };
  assert.equal(t4(word), true);
  assert.equal(t4({ ...word, bleed: true }), false);
  const cap = { id: "c", role: "caption", text: "fé", box: [-10, 700, 100, 50], alpha: 1 };
  assert.equal(t4({ ...cap, bleed: true }), true);
});

const W = 540,
  H = 960;
const fullHero = { id: "h", role: "hero", box: [0, 0, W, H], alpha: 1 };
// n frames at 30 fps; items(t) gives the trace of each frame.
const traceOf = (n, items, camera = () => null) => ({
  W,
  H,
  fps: 30,
  frames: Array.from({ length: n }, (_, i) => ({
    t: i / 30,
    items: items(i / 30),
    camera: camera(i / 30),
  })),
});

test("no sampled frames is red T0, not an empty pass", () => {
  assert.deepEqual(codes(checkTrace({ W, H, frames: [] })), ["T0"]);
});

test("a malformed trace item is red T0 naming the item", () => {
  const bad = [
    { id: "a", role: "hero", box: [0, 0, W, H], alpha: NaN },
    { id: "b", role: "hero", box: [0, 0, W, H], alpha: 1.5 },
    { id: "c", role: "lettering", text: "x", box: [NaN, 0, 900, 50] },
    { id: "d", role: "hero", box: [0, 0, W], alpha: 1 },
    { id: "e", role: "banner", box: [0, 0, W, H], alpha: 1 },
  ];
  for (const it of bad) {
    const f = checkTrace(traceOf(30, () => [fullHero, it]));
    assert.deepEqual(codes(f), ["T0"], it.id);
    assert.match(f[0].msg, new RegExp(`malformed trace item ${it.id}`));
  }
});

test("an item without alpha counts as fully shown", () => {
  const f = checkTrace(
    traceOf(30, () => [{ id: "h", role: "hero", box: [0, 0, W, H] }]),
  );
  assert.deepEqual(f, []);
  const tiny = checkTrace(
    traceOf(30, () => [{ id: "h", role: "hero", box: [250, 450, 10, 10] }]),
  );
  assert.deepEqual(codes(tiny), ["T5"]);
});

test("coverage counts only the part of a box inside the frame", () => {
  const f = checkTrace(
    traceOf(30, () => [
      { id: "h", role: "hero", box: [220, 430, 100, 100], alpha: 1 },
      { id: "p", role: "piece", box: [2000, 2000, 1000, 1000], alpha: 1 },
    ]),
  );
  assert.deepEqual(codes(f), ["T5"]);
  const wide = checkTrace(
    traceOf(30, () => [
      { id: "h", role: "hero", box: [220, 430, 100, 100], alpha: 1 },
      { id: "p", role: "piece", box: [-1000, 0, 1040, H], alpha: 1 },
    ]),
  );
  assert.deepEqual(codes(wide), ["T5"]);
  const half = checkTrace(
    traceOf(30, () => [
      { id: "h", role: "hero", box: [220, 430, 100, 100], alpha: 1 },
      { id: "p", role: "piece", box: [-W / 2, 0, W, H], alpha: 1 },
    ]),
  );
  assert.deepEqual(half, []);
});

test("a caption read too fast is red T1", () => {
  const text = "Wittenberg reformadores";
  const f = checkTrace(
    traceOf(30, (t) => [
      fullHero,
      { id: "c", role: "caption", text, box: [100, 700, 300, 50], alpha: 1 },
    ]),
  );
  assert.deepEqual(codes(f), ["T1"]);
  assert.match(f[0].msg, /23\.0 cps/);
});

test("a caption with more than four words is orange T3", () => {
  const f = checkTrace(
    traceOf(60, () => [
      fullHero,
      {
        id: "c",
        role: "caption",
        text: "a fé vem do ouvir",
        box: [100, 700, 300, 50],
        alpha: 1,
      },
    ]),
  );
  assert.deepEqual(codes(f), ["T3"]);
  assert.equal(f[0].severity, "orange");
});

test("a hero missing, faded or off the middle third is orange T6", () => {
  const piece = { id: "p", role: "piece", box: [0, 0, W, H], alpha: 1 };
  const none = checkTrace(traceOf(30, () => [piece]));
  assert.deepEqual(codes(none), ["T6"]);
  assert.match(none[0].msg, /no hero/);
  const faded = checkTrace(
    traceOf(30, () => [piece, { ...fullHero, alpha: 0.5 }]),
  );
  assert.deepEqual(codes(faded), ["T6"]);
  assert.match(faded[0].msg, /no hero/);
  const side = checkTrace(
    traceOf(30, () => [
      piece,
      { id: "h", role: "hero", box: [0, 0, 100, H], alpha: 1 },
    ]),
  );
  assert.deepEqual(codes(side), ["T6"]);
  assert.match(side[0].msg, /off the middle third/);
  assert.equal(side[0].severity, "orange");
});

test("a linear camera move is yellow T8; an eased one is not", () => {
  const linear = checkTrace(
    traceOf(
      30,
      () => [fullHero],
      (t) => ({ scale: 1 + 0.3 * t, x: 0, y: 0 }),
    ),
  );
  assert.deepEqual(codes(linear), ["T8"]);
  assert.equal(linear[0].severity, "yellow");
  const eased = checkTrace(
    traceOf(
      30,
      () => [fullHero],
      (t) => ({ scale: 1 + 0.3 * t * t, x: 0, y: 0 }),
    ),
  );
  assert.deepEqual(eased, []);
});

test(
  "a film without a positive duration cannot be sampled",
  { timeout: 60_000 },
  async () => {
    const dir = fileURLToPath(new URL("./.tmp-films/no-dur", import.meta.url));
    for (const dur of ["undefined", "0", "NaN"]) {
      rmSync(dir, { recursive: true, force: true });
      mkdirSync(dir, { recursive: true });
      writeFileSync(
        `${dir}/index.html`,
        `<script>window.FILM = { dur: ${dur} }; window.trace = () => []; window.seek = () => {}; window.ready = true;</script>`,
      );
      await assert.rejects(
        sampleTrace(dir, { format: "9x16" }),
        /FILM\.dur must be a positive number/,
        dur,
      );
    }
    rmSync(dir, { recursive: true, force: true });
  },
);

test("a camera without a finite positive scale is red T0", () => {
  for (const camera of [{ x: 0, y: 0 }, { scale: NaN }, { scale: 0 }]) {
    const f = checkTrace(
      traceOf(
        30,
        () => [fullHero],
        () => camera,
      ),
    );
    assert.deepEqual(codes(f), ["T0"], JSON.stringify(camera));
    assert.match(f[0].msg, /malformed camera/);
  }
});

test("T5: a ground is not coverage, whether registered as ground or as a ground asset", () => {
  const smallHero = { id: "h", role: "hero", box: [220, 430, 100, 100], alpha: 1 };
  const asGround = checkTrace(
    traceOf(30, () => [smallHero, { id: "paper", role: "ground", box: [0, 0, W, H] }]),
  );
  assert.deepEqual(codes(asGround), ["T5"]);
  const manifest = { assets: [{ id: "paper", kind: "ground" }, { id: "wood", treatment: "ground" }] };
  for (const id of ["paper", "wood"]) {
    const asPiece = checkTrace(
      traceOf(30, () => [smallHero, { id, role: "piece", box: [0, 0, W, H] }]),
      { manifest },
    );
    assert.deepEqual(codes(asPiece), ["T5"], id);
  }
  // A real piece of the same size still covers the frame.
  const real = checkTrace(
    traceOf(30, () => [smallHero, { id: "map", role: "piece", box: [0, 0, W, H] }]),
    { manifest },
  );
  assert.deepEqual(real, []);
});

test("T8: a held camera's breathing drift is not a linear move", () => {
  // The table's breathing: 1.2 % at 0.3 rad/s, near-linear around its inflections (t = 0).
  const breath = checkTrace(
    traceOf(
      60,
      () => [fullHero],
      (t) => ({ scale: 1.4 * (1 + 0.012 * Math.sin(t * 0.3)), x: 0, y: 0 }),
    ),
  );
  // (The film-wide range is only 1 %, so T7 speaks; T8 must not.)
  assert.ok(!codes(breath).includes("T8"), JSON.stringify(breath));
  // A slow but real linear drift (3 %/s) is still reported.
  const drift = checkTrace(
    traceOf(
      60,
      () => [fullHero],
      (t) => ({ scale: 1 + 0.03 * t, x: 0, y: 0 }),
    ),
  );
  assert.ok(codes(drift).includes("T8"));
});

test("a zoom target is a known role and does not count as coverage", () => {
  const smallHero = { id: "h", role: "hero", box: [220, 430, 100, 100], alpha: 1 };
  const f = checkTrace(
    traceOf(30, () => [smallHero, { id: "b1-target", role: "target", box: [0, 0, W, H] }]),
  );
  assert.deepEqual(codes(f), ["T5"]);
});

// A film that closes on the project's house outro declares it as FILM.house = [t0, t1]: the outro
// puts nothing in the trace, so the picture gates read the story only (T5, T6, T7, T8).
test("house window: T5 and T6 do not read the outro; without the declaration they fire", () => {
  const body = (t) => (t < 1 ? [fullHero] : []);
  const bare = traceOf(60, body);
  assert.deepEqual(codes(checkTrace(bare)), ["T5", "T6"]);
  assert.deepEqual(codes(checkTrace({ ...bare, dur: 2, house: [1, 2] })), []);
  // The story's own frames are still judged: a house window does not excuse an empty story.
  const empty = traceOf(60, () => []);
  assert.deepEqual(codes(checkTrace({ ...empty, dur: 2, house: [1, 2] })), ["T5", "T6"]);
});

test("house window: the camera gates (T7, T8) read the story's frames only", () => {
  const items = () => [fullHero];
  // Still in the story, a 40 % ease inside the outro: T7 sees no move once the outro is excluded.
  const cam = (t) => ({ scale: t < 1 ? 1 : 1 + 0.4 * (t - 1) ** 2, x: 0, y: 0 });
  const bare = traceOf(60, items, cam);
  assert.deepEqual(codes(checkTrace(bare)), []);
  const still = (t) => ({ scale: t < 1 ? 1 : 1.4, x: 0, y: 0 });
  assert.deepEqual(codes(checkTrace({ ...traceOf(60, items, still), dur: 2, house: [1, 2] })), ["T7"]);
});

test("house window: captions and lettering are still judged inside it (T4)", () => {
  const cap = { id: "c", role: "caption", text: "fé", box: [-10, 700, 100, 50], alpha: 1 };
  const tr = traceOf(60, (t) => (t < 1 ? [fullHero] : [cap]));
  assert.ok(codes(checkTrace({ ...tr, dur: 2, house: [1, 2] })).includes("T4"));
});

test("house window: a malformed or non-closing declaration is red T0", () => {
  const tr = traceOf(60, () => [fullHero]);
  for (const house of [[1], [2, 1], [NaN, 2], "x", [-1, 2], [0, 2], [0.5, 1.2]]) {
    const f = checkTrace({ ...tr, dur: 2, house });
    assert.deepEqual(codes(f), ["T0"], JSON.stringify(house));
    assert.match(f[0].msg, /house/);
  }
});

test(
  "the sampled trace carries FILM.house, and nothing when the film declares none",
  { timeout: 60_000 },
  async () => {
    const dir = fileURLToPath(new URL("./.tmp-films/house", import.meta.url));
    const sample = async (house) => {
      rmSync(dir, { recursive: true, force: true });
      mkdirSync(dir, { recursive: true });
      writeFileSync(
        `${dir}/index.html`,
        `<script>window.FILM = { dur: 2, W: 540, H: 960${house} }; window.trace = () => []; window.seek = () => {}; window.ready = true;</script>`,
      );
      return sampleTrace(dir, { format: "9x16", fps: 10 });
    };
    assert.deepEqual((await sample(", house: [1.2, 2]")).house, [1.2, 2]);
    assert.equal("house" in (await sample("")), false);
    rmSync(dir, { recursive: true, force: true });
  },
);

// H-2 (second film): a slip that slides in from the edge is the entrance R5 asks for; T4 reads it
// only once it has settled, and a word that stays cut by the edge is still red.
test("T4: lettering crossing the edge while it slides in or out is exempt; a word left cut is not", () => {
  const slide = (t) => {
    // In from above over 0.2 s, held, out to the left over the last 0.2 s.
    const y = t < 0.2 ? -200 + 1000 * t : 50;
    const x = t > 0.8 ? 100 - 2500 * (t - 0.8) : 100;
    return [fullHero, { id: "w", role: "lettering", text: "primeira tese", box: [x, y, 300, 80] }];
  };
  assert.ok(!codes(checkTrace(traceOf(30, slide))).includes("T4"));
  // Settles across the edge: cut while still, so red.
  const stuck = (t) => [fullHero, { id: "w", role: "lettering", text: "tese", box: [-40, t < 0.2 ? -200 + 1000 * t : 50, 300, 80] }];
  assert.ok(codes(checkTrace(traceOf(30, stuck))).includes("T4"));
  // Still across the edge on its first frame, then moves in: the first frame is not in transit.
  const parked = (t) => [fullHero, { id: "w", role: "lettering", text: "tese", box: [100, t < 0.3 ? -40 : t < 0.5 ? -40 + 450 * (t - 0.3) : 50, 300, 80] }];
  assert.ok(codes(checkTrace(traceOf(30, parked))).includes("T4"));
});

// H-7 (second film): an approved open starts on the bare ground while the first piece moves in.
test("T5: the first 0.3 s of a scene whose first piece is entering are not read", () => {
  const camera = (t) => ({ scale: 1, x: 0, y: 0, shot: t < 0.5 ? 1 : 2 });
  // The hero slides in from the left from frame 3; the second shot opens the same way.
  const enter = (t0) => (t) => {
    const u = Math.min(1, Math.max(0, (t - t0) / 0.3));
    return { id: `h${t0}`, role: "hero", box: [-W + W * u, 0, W, H] };
  };
  const items = (t) => [{ id: "g", role: "ground", box: [0, 0, W, H] }, ...(t < 0.5 ? (t >= 0.1 ? [enter(0.1)(t)] : []) : [enter(0.5)(t)])];
  assert.ok(!codes(checkTrace(traceOf(30, items, camera))).includes("T5"));
  // A bare ground with nothing entering is still red, and so is a bare ground past the grace.
  const bare = (t) => [{ id: "g", role: "ground", box: [0, 0, W, H] }, ...(t >= 0.5 ? [fullHero] : [])];
  assert.ok(codes(checkTrace(traceOf(30, bare))).includes("T5"));
  const late = (t) => [{ id: "g", role: "ground", box: [0, 0, W, H] }, ...(t >= 0.4 ? [enter(0.4)(t)] : [])];
  assert.ok(codes(checkTrace(traceOf(30, late))).includes("T5"));
});

// H-1 (second film): no gate saw a piece appear in place. A piece's first visible frame must touch
// the frame edge, move or scale in, come in on a cut, fade in, or be uncovered by a piece moving off it.
test("T12: a piece that appears in place at full size is orange; entrances are not", () => {
  const t12 = (items, camera) => checkTrace(traceOf(30, items, camera)).filter((f) => f.code === "T12");
  const pin = { id: "pin", role: "piece", box: [200, 300, 60, 60] };
  const popped = t12((t) => [fullHero, ...(t >= 0.3 ? [pin] : [])]);
  assert.equal(popped.length, 1);
  assert.equal(popped[0].severity, "orange");
  assert.match(popped[0].msg, /pin/);
  assert.equal(popped[0].t, 9 / 30);
  // Dropped from a hand's height: moves and scales over its first frames.
  const drop = (t) => {
    const u = Math.min(1, (t - 0.3) / 0.15);
    return { ...pin, box: [200, 300 - 120 * (1 - u), 60 * (1 + 0.12 * (1 - u)), 60 * (1 + 0.12 * (1 - u))] };
  };
  assert.deepEqual(t12((t) => [fullHero, ...(t >= 0.3 ? [drop(t)] : [])]), []);
  // Slid in from the edge: its first box touches the frame edge.
  const slid = (t) => ({ ...pin, box: [Math.min(200, -60 + 2000 * (t - 0.3)), 300, 60, 60] });
  assert.deepEqual(t12((t) => [fullHero, ...(t >= 0.3 ? [slid(t)] : [])]), []);
  // Comes in on a hard cut (a new shot is a composed picture), at frame 0, or fading in.
  assert.deepEqual(t12((t) => [fullHero, ...(t >= 0.3 ? [pin] : [])], (t) => ({ scale: 1, x: 0, y: 0, shot: t >= 0.3 ? 2 : 1 })), []);
  assert.deepEqual(t12(() => [fullHero, pin]), []);
  assert.deepEqual(t12((t) => [fullHero, ...(t >= 0.3 ? [{ ...pin, alpha: Math.min(1, (t - 0.29) * 5) }] : [])]), []);
  // Uncovered by a flap that lifts off it; a flap that stays put is not an excuse.
  const flap = (moves) => (t) => ({ id: "flap", role: "piece", box: [150 + (moves && t >= 0.3 ? 400 * (t - 0.3) : 0), 250, 200, 200] });
  assert.deepEqual(t12((t) => [fullHero, flap(true)(t), ...(t >= 0.3 ? [pin] : [])]), []);
  assert.equal(t12((t) => [fullHero, flap(false)(t), ...(t >= 0.3 ? [pin] : [])]).length, 1);
  // A piece that changes role (hero → piece) is the same piece, not a new one; lettering and
  // marks are typed or drawn in place and are not T12's; a ground is not a piece.
  assert.deepEqual(t12((t) => [{ ...fullHero, role: t < 0.5 ? "hero" : "piece" }]), []);
  assert.deepEqual(t12((t) => [fullHero, ...(t >= 0.3 ? [{ ...pin, role: "lettering", text: "95" }, { ...pin, id: "m", role: "mark" }, { ...pin, id: "g", role: "ground" }] : [])]), []);
});
