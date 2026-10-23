#!/usr/bin/env node
// Word timings from a narration: `node tools/captions/transcribe.mjs <audio.wav> <out.json>`
// writes {"words":[{"w","s","e"}]} (seconds). whisper.cpp runs locally; its build and the ggml
// model live in tools/captions/.whisper/{cpp,models}/ (gitignored) and are fetched on first use.
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  downloadWhisperModel,
  installWhisperCpp,
  toCaptions,
  transcribe,
} from "@remotion/install-whisper-cpp";

const WHISPER_VERSION = "1.5.5";
const MODEL = process.env.WHISPER_MODEL ?? "small.en";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const WHISPER_DIR = path.join(HERE, ".whisper", "cpp");
const MODEL_DIR = path.join(HERE, ".whisper", "models");

// whisper.cpp tokens carry a leading space per word; punctuation-only tokens glue to the word before.
export function captionsToWords(captions) {
  const words = [];
  for (const c of captions) {
    const text = c.text.trim();
    if (!text) continue;
    if (/^[^\p{L}\p{N}]+$/u.test(text) && words.length) {
      words[words.length - 1].w += text;
      words[words.length - 1].e = Math.max(words[words.length - 1].e, c.endMs / 1000);
      continue;
    }
    words.push({ w: text, s: c.startMs / 1000, e: c.endMs / 1000 });
  }
  return words;
}

async function main() {
  const [input, output] = process.argv.slice(2);
  if (!input || !output) {
    console.error("usage: transcribe.mjs <audio.wav> <out.json>");
    process.exit(2);
  }
  // installWhisperCpp git-clones into `to`, which therefore must not exist yet.
  mkdirSync(MODEL_DIR, { recursive: true });
  await installWhisperCpp({ to: WHISPER_DIR, version: WHISPER_VERSION, printOutput: false });
  await downloadWhisperModel({ model: MODEL, folder: MODEL_DIR, printOutput: false });

  // whisper.cpp reads 16 kHz mono WAV only.
  const tmp = mkdtempSync(path.join(tmpdir(), "motion-studio-whisper-"));
  const wav16 = path.join(tmp, "in16k.wav");
  try {
    execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", input, "-ar", "16000", "-ac", "1", wav16]);
    const out = await transcribe({
      inputPath: wav16,
      whisperPath: WHISPER_DIR,
      whisperCppVersion: WHISPER_VERSION,
      model: MODEL,
      modelFolder: MODEL_DIR,
      tokenLevelTimestamps: true,
      splitOnWord: true,
      language: "en",
    });
    const { captions } = toCaptions({ whisperCppOutput: out });
    const words = captionsToWords(captions);
    writeFileSync(output, JSON.stringify({ words }, null, 2) + "\n");
    console.log(`${words.length} words -> ${output}`);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

// Run as a script only: compare real paths, since argv[1] may reach this file through a symlink
// (or hold characters a file:// URL escapes) and a plain URL comparison would silently do nothing.
const isScript = process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (isScript) await main();
