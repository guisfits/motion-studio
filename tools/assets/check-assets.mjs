// Fails with a clear message when gitignored demo assets are missing (T09 needs the voice-over WAVs).
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const REQUIRED = ["assets/audio/vo-01.wav", "assets/audio/vo-02.wav", "assets/audio/vo-03.wav"];

const missing = REQUIRED.filter((f) => !existsSync(path.join(ROOT, f)));
if (missing.length) {
  console.error(`Missing generated assets:\n  ${missing.join("\n  ")}\nRun \`npm run assets\` (macOS only: uses \`say\` and ffmpeg).`);
  process.exit(1);
}
