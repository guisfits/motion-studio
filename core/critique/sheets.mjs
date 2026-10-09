// Review sheets for any MP4, so the model can look at a film instead of trusting its code.
//
//   node core/critique/sheets.mjs <video.mp4> [--out dir] [--strip 4.2,7.8] [--loop]
//   node core/critique/sheets.mjs <video.mp4> --flat       report only, writes no files
//
// Writes into --out (default: the video's folder), each labelled with timestamps:
//   contact.png   2 frames per second           variety, dead beats, composition
//   phone.png     1 frame per second at 360 px  readability at phone size; on a 9:16 video the
//                                               Reels UI zones are shaded (top 220, bottom 400,
//                                               right rail 140 from y 1100, of 1080x1920)
//   strip-<t>.png 12 consecutive frames at t    pops, overlaps and slides during a fast action
//   wave.png      audio waveform                sound sync, silence, clipping (if there is audio)
//   loop_check.mp4  the film twice back to back (--loop)
//
// --flat prints the time ranges where more than 65% of the frame is bare ground (low local
// variance: no piece, no type, no texture change) for longer than 0.5 s: dead beats and empty
// sheets that the eye reads as nothing happening.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { makeSheet } from "./sheet.mjs";

const ff = (args) =>
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args], {
    stdio: "pipe",
  });
const probe = (video, entries, stream = []) =>
  execFileSync("ffprobe", [
    "-v",
    "error",
    ...stream,
    "-show_entries",
    entries,
    "-of",
    "default=nw=1:nk=1",
    video,
  ])
    .toString()
    .trim();

// The Reels UI over a 1080x1920 frame: the top,
// the bottom band and the right rail (like, comment, share) that nothing readable may enter.
const GUIDE = "0xff3b30";
export const SAFE_GUIDES = [
  // [x, y, w, h] in 1080x1920 pixels
  [0, 0, 1080, 220],
  [0, 1520, 1080, 400],
  [940, 1100, 140, 420],
];
// ffmpeg drawbox filters, in fractions of the frame so they hold at any scale: a translucent
// fill and a thin edge on the side facing the safe area.
export const guideFilter = () => [
  ...SAFE_GUIDES.map(
    ([x, y, w, h]) =>
      `drawbox=x=iw*${x}/1080:y=ih*${y}/1920:w=iw*${w}/1080:h=ih*${h}/1920:color=${GUIDE}@0.2:t=fill`,
  ),
  `drawbox=x=0:y=ih*220/1920:w=iw:h=1:color=${GUIDE}@0.8:t=fill`,
  `drawbox=x=0:y=ih*1520/1920:w=iw:h=1:color=${GUIDE}@0.8:t=fill`,
  `drawbox=x=iw*940/1080:y=ih*1100/1920:w=1:h=ih*420/1920:color=${GUIDE}@0.8:t=fill`,
  `drawbox=x=iw*940/1080:y=ih*1100/1920:w=iw*140/1080:h=1:color=${GUIDE}@0.8:t=fill`,
];
const isReel = (video) => {
  const [w, h] = probe(video, "stream=width,height", ["-select_streams", "v"])
    .split("\n")
    .map(Number);
  return Math.abs(w / h - 9 / 16) < 0.02;
};

// Extract frames with ffmpeg into a temp folder and label each with its time.
export function frames(
  video,
  { fps, width, start = 0, count, guides = false },
) {
  const dir = mkdtempSync(join(tmpdir(), "sheet-"));
  const args = [
    "-ss",
    start.toFixed(3),
    "-i",
    video,
    "-vf",
    [`fps=${fps}`, `scale=${width}:-2`, ...(guides ? guideFilter() : [])].join(
      ",",
    ),
  ];
  if (count) args.push("-frames:v", String(count));
  ff([...args, join(dir, "%04d.png")]);
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".png"))
    .sort();
  return {
    dir,
    cells: files.map((f, i) => ({
      file: join(dir, f),
      label: `${(start + i / fps).toFixed(2)}s`,
    })),
  };
}

// Time ranges where most of the frame is bare ground. Frames are sampled at `fps`, shrunk to
// about 120 px wide and cut into 6 px blocks; a block is bare when its pixel variance is below
// `maxVar` (a paper ground's grain and mottling average out in the shrink, a piece or a line of type
// does not). A range is reported when over `ratio` of the blocks are bare for longer than `minSec`.
export function flatRanges(
  video,
  { fps = 10, ratio = 0.65, minSec = 0.5, maxVar = 25, block = 6 } = {},
) {
  video = resolve(video);
  const [vw, vh] = probe(video, "stream=width,height", ["-select_streams", "v"])
    .split("\n")
    .map(Number);
  const w = 120;
  const h = Math.max(block, Math.round((w * vh) / vw / block) * block);
  const raw = execFileSync(
    "ffmpeg",
    [
      "-loglevel",
      "error",
      "-i",
      video,
      "-vf",
      `fps=${fps},scale=${w}:${h}:flags=area,format=gray`,
      "-f",
      "rawvideo",
      "-",
    ],
    { maxBuffer: 1 << 30 },
  );
  const size = w * h;
  const n = Math.floor(raw.length / size);
  const bw = w / block;
  const bh = h / block;
  const bare = [];
  for (let f = 0; f < n; f++) {
    const base = f * size;
    let flat = 0;
    for (let by = 0; by < bh; by++)
      for (let bx = 0; bx < bw; bx++) {
        let sum = 0;
        let sum2 = 0;
        for (let y = 0; y < block; y++)
          for (let x = 0; x < block; x++) {
            const v = raw[base + (by * block + y) * w + bx * block + x];
            sum += v;
            sum2 += v * v;
          }
        const cnt = block * block;
        if (sum2 / cnt - (sum / cnt) ** 2 < maxVar) flat++;
      }
    bare.push(flat / (bw * bh));
  }
  const ranges = [];
  for (let f = 0; f <= n;) {
    if (f < n && bare[f] > ratio) {
      let e = f;
      while (e < n && bare[e] > ratio) e++;
      if ((e - f) / fps > minSec) {
        const mean = bare.slice(f, e).reduce((a, b) => a + b, 0) / (e - f);
        ranges.push({ from: f / fps, to: e / fps, bare: mean });
      }
      f = e;
    } else f++;
  }
  return ranges;
}

export async function sheets(video, { out, strips = [], loop = false } = {}) {
  video = resolve(video);
  out = resolve(out ?? dirname(video));
  const name = basename(video);
  const made = [];
  const temp = [];
  const sheet = async (spec, file, title, cols) => {
    const f = frames(video, spec);
    temp.push(f.dir);
    made.push(
      await makeSheet(f.cells, join(out, file), {
        title: `${name} · ${title}`,
        cols,
        cellW: spec.width,
      }),
    );
  };
  try {
    await sheet({ fps: 2, width: 200 }, "contact.png", "2 fps", 10);
    await sheet(
      { fps: 1, width: 360, guides: isReel(video) },
      "phone.png",
      "phone size, 1 fps",
      5,
    );
    const [num, den = 1] = probe(video, "stream=r_frame_rate", [
      "-select_streams",
      "v",
    ])
      .split("/")
      .map(Number);
    const fps = num / den;
    for (const t of strips) {
      await sheet(
        { fps, width: 240, start: Math.max(0, t - 6 / fps), count: 12 },
        `strip-${t}.png`,
        `12 frames around ${t}s`,
        6,
      );
    }
    if (probe(video, "stream=codec_type").includes("audio")) {
      const wave = join(out, "wave.png");
      ff([
        "-i",
        video,
        "-filter_complex",
        "showwavespic=s=1800x240:split_channels=1:colors=0xd9d6cc",
        "-frames:v",
        "1",
        wave,
      ]);
      made.push(wave);
    }
    if (loop) {
      const lc = join(out, "loop_check.mp4");
      ff(["-stream_loop", "1", "-i", video, "-c", "copy", lc]);
      made.push(lc);
    }
  } finally {
    for (const d of temp) rmSync(d, { recursive: true, force: true });
  }
  return made;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const video = process.argv[2];
  if (!video) {
    console.error(
      "usage: node sheets.mjs <video.mp4> [--out dir] [--strip t1,t2] [--loop] | --flat",
    );
    process.exit(2);
  }
  const get = (k) => {
    const i = process.argv.indexOf(`--${k}`);
    return i > 0 ? process.argv[i + 1] : undefined;
  };
  if (process.argv.includes("--flat")) {
    const ranges = flatRanges(video);
    for (const r of ranges)
      console.log(
        `flat ${r.from.toFixed(2)}s-${r.to.toFixed(2)}s  ${Math.round(r.bare * 100)}% of the frame is bare ground`,
      );
    if (!ranges.length)
      console.log("flat: no stretch over 0.5 s with more than 65% bare ground");
    process.exit(0);
  }
  const made = await sheets(video, {
    out: get("out"),
    strips: (get("strip") ?? "").split(",").filter(Boolean).map(Number),
    loop: process.argv.includes("--loop"),
  });
  for (const f of made) console.log(f);
}
