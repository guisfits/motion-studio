// The project root a kit resolves its paths against: --root, $MOTION_ROOT, the git top level of
// the kit's directory, or this engine checkout. Lifted from the archived HTML server
// (archive/engine-v1/core/server.mjs) so the kit tool no longer depends on the old stage.
import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// The engine checkout (the directory holding tools/).
export const ENGINE_ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)));

// `explicit` is a --root value.
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
