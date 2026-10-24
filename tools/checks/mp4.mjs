// Checks on a rendered Remotion mp4, with no trace of the stage: how long it runs, black or
// frozen stretches, loudness (only when the file has sound), and text boxes inside the safe area
// when the composition hands them over. Each check returns findings (report.mjs).
import { spawnSync } from "node:child_process";
import { NORMS } from "./norms.mjs";
import { finding } from "./report.mjs";
import { loudness } from "./media.mjs";

// Thresholds of the mp4 runner. A demo has an event every 2–3 s, so 3 s with nothing moving is
// already a fault here (the film norm, NORMS.frames.deadWindowS, is the looser 4 s).
export const MP4 = Object.freeze({
  blackS: 2,
  blackPixel: 0.1,
  frozenS: 3,
  frozenNoise: NORMS.frames.deadNoise,
  // Title-safe margin on each side, as a share of the frame (EBU R 95 title-safe ≈ 5 %).
  safeMargin: 0.05,
});

function ffmpegLog(args) {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostats", ...args], { encoding: "utf8" });
  if (r.error?.code === "ENOENT") throw new Error("ffmpeg not found on PATH");
  if (r.error) throw r.error;
  return r.status === 0 ? r.stderr : null;
}

// Duration, frame size and whether there is an audio stream, read with ffprobe; null when the
// file cannot be read.
export function probe(mp4) {
  const r = spawnSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration:stream=codec_type,width,height", "-of", "json", mp4],
    { encoding: "utf8" },
  );
  if (r.error?.code === "ENOENT") throw new Error("ffprobe not found on PATH");
  if (r.status !== 0) return null;
  const j = JSON.parse(r.stdout);
  const video = j.streams.find((s) => s.codec_type === "video");
  return {
    duration: Number(j.format.duration),
    W: video?.width ?? 0,
    H: video?.height ?? 0,
    audio: j.streams.some((s) => s.codec_type === "audio"),
  };
}

// Red when the duration is outside [min, max] seconds; either bound may be omitted.
export function judgeDuration(duration, { min, max } = {}) {
  if (!Number.isFinite(duration)) return [finding("red", "V0", null, "duration could not be read")];
  if (min !== undefined && duration < min) return [finding("red", "V1", null, `${duration.toFixed(2)} s < ${min} s`)];
  if (max !== undefined && duration > max) return [finding("red", "V1", null, `${duration.toFixed(2)} s > ${max} s`)];
  return [];
}

// Every stretch of ≥ MP4.blackS s of black picture.
export function blackStretches(mp4) {
  const log = ffmpegLog(["-i", mp4, "-vf", `blackdetect=d=${MP4.blackS}:pix_th=${MP4.blackPixel}`, "-an", "-f", "null", "-"]);
  if (log === null) return [finding("red", "V0", null, `ffmpeg could not read ${mp4}`)];
  return [...log.matchAll(/black_start:([\d.]+) black_end:([\d.]+)/g)].map((m) =>
    finding("red", "V2", Number(m[1]), `black for ${(Number(m[2]) - Number(m[1])).toFixed(2)} s`),
  );
}

// Every stretch of ≥ MP4.frozenS s where nothing moves.
export function frozenStretches(mp4) {
  const log = ffmpegLog(["-i", mp4, "-vf", `freezedetect=n=${MP4.frozenNoise}:d=${MP4.frozenS}`, "-an", "-f", "null", "-"]);
  if (log === null) return [finding("red", "V0", null, `ffmpeg could not read ${mp4}`)];
  return [...log.matchAll(/freeze_start: ([\d.]+)/g)].map((m) =>
    finding("red", "V3", Number(m[1]), `nothing moves for ≥ ${MP4.frozenS} s`),
  );
}

// Text boxes ({t, box: [x, y, w, h], label}, in frame px) that leave the title-safe area.
export function judgeSafeArea(boxes, W, H) {
  const mx = W * MP4.safeMargin,
    my = H * MP4.safeMargin;
  return boxes
    .filter(({ box: [x, y, w, h] }) => x < mx || y < my || x + w > W - mx || y + h > H - my)
    .map(({ t, label }) => finding("orange", "V4", t ?? null, `${label ?? "text"} leaves the title-safe area`));
}

// One still per box with the box and the safe area drawn on it, for a human to look at.
export function writeStills(mp4, boxes, W, H, dir) {
  const mx = Math.round(W * MP4.safeMargin),
    my = Math.round(H * MP4.safeMargin);
  return boxes.map(({ t, box: [x, y, w, h], label }, i) => {
    const out = `${dir}/${String(i).padStart(2, "0")}-${(label ?? "text").replace(/\W+/g, "_")}.png`;
    const vf = `scale=${W}:${H},drawbox=x=${mx}:y=${my}:w=${W - 2 * mx}:h=${H - 2 * my}:color=yellow@0.6:t=2,drawbox=x=${x}:y=${y}:w=${w}:h=${h}:color=red@0.9:t=3`;
    const r = spawnSync("ffmpeg", ["-loglevel", "error", "-y", "-ss", String(t ?? 0), "-i", mp4, "-frames:v", "1", "-vf", vf, out]);
    if (r.status !== 0) throw new Error(`could not write still ${out}: ${r.stderr}`);
    return out;
  });
}

// All checks on one file. `audio: true` makes a silent file red (a film that must carry sound).
export function checkMp4(mp4, { min, max, audio = false, boxes = [] } = {}) {
  const p = probe(mp4);
  if (!p) return { probe: null, findings: [finding("red", "V0", null, `ffprobe could not read ${mp4}`)] };
  const findings = [...judgeDuration(p.duration, { min, max }), ...blackStretches(mp4), ...frozenStretches(mp4)];
  let lufs = null;
  if (p.audio) {
    const l = loudness(mp4);
    lufs = l.I;
    findings.push(...l.findings);
  } else if (audio) findings.push(finding("red", "V5", null, "no audio stream"));
  findings.push(...judgeSafeArea(boxes, p.W, p.H));
  return { probe: { ...p, lufs }, findings };
}
