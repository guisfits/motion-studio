// Static server for films (ES modules do not load from file://). It serves a ROOT directory:
// a film imports the engine and its own assets by absolute URL paths under that root.
//
//   node core/server.mjs <film-dir> [--port 4321] [--root <dir>]   # live preview URLs
//
// The root is, in order: --root, $MOTION_ROOT, the git top level of the film's directory, or the
// engine's own directory (so examples/ work in a plain checkout). A project that mounts the engine
// at, say, vendor/motion-studio/ serves its repo root and imports /vendor/motion-studio/core/lib/*.js.
import { createServer } from "node:http";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import { dirname, extname, join, normalize, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

// The engine checkout (the directory holding core/).
export const ENGINE_ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));

// The root a film in `dir` is served from (see the header). `explicit` is a --root value.
export function rootFor(dir, explicit) {
  if (explicit) return resolve(explicit);
  if (process.env.MOTION_ROOT) return resolve(process.env.MOTION_ROOT);
  let probe = resolve(dir);
  while (!existsSync(probe)) probe = dirname(probe);
  if (!statSync(probe).isDirectory()) probe = dirname(probe);
  try {
    return execFileSync("git", ["-C", probe, "rev-parse", "--show-toplevel"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return ENGINE_ROOT;
  }
}

// "/" + the engine's path under `root`, the prefix a film's imports start with.
export function enginePrefix(root) {
  const rel = relative(root, ENGINE_ROOT).split(sep).join("/");
  if (rel.startsWith("..")) throw new Error(`the engine (${ENGINE_ROOT}) is outside the served root ${root}`);
  return rel ? `/${rel}` : "";
}

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".json": "application/json",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".wav": "audio/wav",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
};

export function startServer(port = 0, root = ENGINE_ROOT) {
  root = resolve(root);
  const server = createServer(async (req, res) => {
    const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
    const file = normalize(join(root, path));
    if (file !== root && !file.startsWith(root + sep)) {
      res.writeHead(403).end();
      return;
    }
    try {
      const body = await readFile(file);
      res.writeHead(200, {
        "content-type": TYPES[extname(file)] ?? "application/octet-stream",
        "cache-control": "no-store",
      });
      res.end(body);
    } catch {
      res.writeHead(404).end(`not found: ${path}`);
    }
  });
  server.root = root;
  return new Promise((ok) =>
    server.listen(port, "127.0.0.1", () => ok(server)),
  );
}

// URL of a film's index.html on a running server.
export function filmUrl(server, filmDir, query = "") {
  const rel = relative(server.root, resolve(filmDir)).split(sep).join("/");
  if (rel.startsWith("..")) throw new Error(`film ${filmDir} is outside the served root ${server.root} (pass --root)`);
  return `http://127.0.0.1:${server.address().port}/${rel}/index.html${query}`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const film = process.argv[2];
  if (!film) {
    console.error("usage: node core/server.mjs <film-dir> [--port N] [--root DIR]");
    process.exit(2);
  }
  const arg = (k) => {
    const i = process.argv.indexOf(`--${k}`);
    return i > 0 ? process.argv[i + 1] : undefined;
  };
  const server = await startServer(Number(arg("port") ?? 4321), rootFor(film, arg("root")));
  for (const f of ["9x16", "1x1", "16x9"])
    console.log(`${f.padEnd(5)} ${filmUrl(server, film, `?format=${f}`)}`);
  console.log(
    "preview: space pauses, ←/→ step a frame (shift: 1 s), ?t=4.2 opens paused at 4.2 s",
  );
}
