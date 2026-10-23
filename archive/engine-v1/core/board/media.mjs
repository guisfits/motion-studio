// The board's media next to the page: step pictures scaled for the page, audio as a small mp3 and
// video copies, each under the host's per-file limit and all of them inside one publish. ffmpeg is
// optional: without it pictures are copied as they are and wav audio is skipped.

import fs from "node:fs";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";

// The host's limits: 15 MB per binary file, 64 MB per publish. A board is capped per file (a full
// draft video fits); the media share of a publish leaves 1 MB for the page itself.
export const FILE_MAX_BYTES = 15 * 1024 * 1024;
export const PUBLISH_MAX_BYTES = 64 * 1024 * 1024;
export const BUDGET_BYTES = PUBLISH_MAX_BYTES - 1024 * 1024;

let ffmpegKnown = null;
export function hasFfmpeg() {
  if (ffmpegKnown == null) {
    try {
      ffmpegKnown = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" }).status === 0;
    } catch {
      ffmpegKnown = false;
    }
  }
  return ffmpegKnown;
}

const run = (args) =>
  new Promise((ok) => {
    let p;
    try {
      p = spawn("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: "ignore" });
    } catch {
      return ok(false);
    }
    p.on("error", () => ok(false));
    p.on("close", (c) => ok(c === 0));
  });

export class Media {
  constructor(outDir, { budget = BUDGET_BYTES, fileMax = FILE_MAX_BYTES } = {}) {
    this.dir = path.join(outDir, "media");
    this.rel = "media";
    this.budget = budget;
    this.fileMax = fileMax;
    this.used = 0;
    fs.rmSync(this.dir, { recursive: true, force: true });
    fs.mkdirSync(this.dir, { recursive: true });
  }

  // A file of `n` bytes can go on the page: under the per-file limit and the publish budget.
  fits(n) {
    return n <= this.fileMax && this.used + n <= this.budget;
  }

  // Keeps a written file only while it fits; otherwise removes it.
  _account(file) {
    try {
      const n = fs.statSync(file).size;
      if (!this.fits(n)) {
        fs.rmSync(file, { force: true });
        return false;
      }
      this.used += n;
      return true;
    } catch {
      return false;
    }
  }

  // An audio file as mono 96 kbps mp3, or null.
  async mp3(src, name) {
    if (!src || !fs.existsSync(src) || !hasFfmpeg()) return null;
    const out = path.join(this.dir, `${name}.mp3`);
    const ok = await run(["-i", src, "-vn", "-ac", "1", "-codec:a", "libmp3lame", "-b:a", "96k", out]);
    return ok && this._account(out) ? `${this.rel}/${path.basename(out)}` : null;
  }

  // An image for the page: scaled to `maxW` wide when wider, and re-encoded as JPEG when it is
  // wider or a heavy PNG, so a few step pictures fit the page budget. Null when the file is
  // already light and small (or no ffmpeg): the caller then copies it as it is.
  async image(src, name, maxW) {
    if (!hasFfmpeg()) return null;
    const probe = spawnSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width", "-of", "csv=p=0", src], { encoding: "utf8" });
    const w = Number.parseInt(probe.stdout, 10);
    const heavy = /\.png$/i.test(src) && fs.statSync(src).size > 600 * 1024;
    if (!(w > maxW) && !heavy) return null;
    const jpg = name.replace(/\.\w+$/, "") + ".jpg";
    const out = path.join(this.dir, jpg);
    const ok = await run(["-i", src, "-vf", `scale='min(${maxW},iw)':-2`, "-frames:v", "1", "-q:v", "4", out]);
    return ok && this._account(out) ? `${this.rel}/${jpg}` : null;
  }

  // Copies a file when it fits (per file and the remaining budget); else null.
  copy(src, name) {
    try {
      const size = fs.statSync(src).size;
      if (!this.fits(size)) return null;
      const out = path.join(this.dir, name);
      fs.copyFileSync(src, out);
      return this._account(out) ? `${this.rel}/${name}` : null;
    } catch {
      return null;
    }
  }
}
