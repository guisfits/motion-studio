// Checks on the rendered file itself: dead frames (nothing moves for 4 s) and loudness.
import { spawnSync } from "node:child_process";
import { NORMS } from "./norms.mjs";
import { finding } from "./report.mjs";

// ffmpeg's log, or null when it could not read the input (so a gate never passes on an empty log).
function ffmpegLog(args) {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostats", ...args], {
    encoding: "utf8",
  });
  if (r.error?.code === "ENOENT") throw new Error("ffmpeg not found on PATH");
  if (r.error) throw r.error;
  return r.status === 0 ? r.stderr : null;
}
const unreadable = (file) =>
  finding("red", "M0", null, `ffmpeg could not read ${file}`);

export function deadFrames(mp4) {
  const log = ffmpegLog([
    "-i",
    mp4,
    "-vf",
    `freezedetect=n=${NORMS.frames.deadNoise}:d=${NORMS.frames.deadWindowS}`,
    "-an",
    "-f",
    "null",
    "-",
  ]);
  if (log === null) return [unreadable(mp4)];
  return [...log.matchAll(/freeze_start: ([\d.]+)/g)].map((m) =>
    finding(
      "red",
      "M1",
      Number(m[1]),
      `nothing moves for ≥ ${NORMS.frames.deadWindowS} s`,
    ),
  );
}

// Both readings must be inside their norm; one that could not be parsed (NaN) is a finding, never a pass.
export function judgeLoudness({ I, LRA }) {
  const findings = [];
  if (!(Math.abs(I - NORMS.audio.lufs) <= NORMS.audio.lufsTol))
    findings.push(
      finding("red", "M2", null, `integrated ${I} LUFS (target ${NORMS.audio.lufs} ± ${NORMS.audio.lufsTol})`),
    );
  if (!(LRA <= NORMS.audio.maxLra))
    findings.push(finding("orange", "M3", null, `LRA ${LRA} LU > ${NORMS.audio.maxLra}`));
  return findings;
}

export function loudness(media) {
  const log = ffmpegLog(["-i", media, "-af", "ebur128", "-f", "null", "-"]);
  if (log === null) return { I: NaN, LRA: NaN, findings: [unreadable(media)] };
  const tail = log.slice(log.lastIndexOf("Summary:"));
  const I = Number(tail.match(/I:\s+(-?[\d.]+) LUFS/)?.[1]);
  const LRA = Number(tail.match(/LRA:\s+([\d.]+) LU/)?.[1]);
  const findings = judgeLoudness({ I, LRA });
  return { I, LRA, findings };
}

// A sampler of the rendered video for T11: (t, box) -> rgb24 pixels of the frame at t inside a
// trace box. Boxes are in the film's W x H frame pixels, whatever size the video was rendered at;
// the part off the frame is dropped, and the crop is shrunk to at most 160 px on its long side
// (a median does not need more).
export function sampleBox(mp4, W, H) {
  return (t, [x, y, w, h]) => {
    const x0 = Math.max(0, x),
      y0 = Math.max(0, y);
    const x1 = Math.min(W, x + w),
      y1 = Math.min(H, y + h);
    if (x1 - x0 < 1 || y1 - y0 < 1) return Buffer.alloc(0);
    const k = Math.min(1, 160 / Math.max(x1 - x0, y1 - y0));
    const [ow, oh] = [x1 - x0, y1 - y0].map((v) => Math.max(1, Math.round(v * k)));
    const crop = `crop=w=iw*${(x1 - x0) / W}:h=ih*${(y1 - y0) / H}:x=iw*${x0 / W}:y=ih*${y0 / H}`;
    const r = spawnSync(
      "ffmpeg",
      ["-loglevel", "error", "-ss", String(t), "-i", mp4, "-frames:v", "1", "-vf",
        `${crop},scale=${ow}:${oh}:flags=area`, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
      { maxBuffer: 1 << 24 },
    );
    if (r.error) throw r.error;
    if (r.status !== 0) throw new Error(`ffmpeg could not sample ${mp4} at ${t} s: ${r.stderr}`);
    return r.stdout;
  };
}
