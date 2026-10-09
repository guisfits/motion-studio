// Generated stand-ins for the fixture films' pictures, so the suite needs no third-party image:
// cut-out "portraits" (alpha PNGs), a continuous-tone "engraving" for the halftone test, and page
// scans. Built once with ffmpeg's lavfi sources into tests/.assets/ (gitignored).
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const ASSETS = fileURLToPath(new URL("./.assets/", import.meta.url));

const ff = (args, out) => {
  if (existsSync(`${ASSETS}${out}`)) return;
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", ...args, "-frames:v", "1", `${ASSETS}${out}`]);
};

// A figure: a vertical tone gradient inside an oval, transparent outside it.
const portrait = (out, c0, c1, seed) =>
  ff(["-f", "lavfi", "-i", `gradients=s=600x800:c0=${c0}:c1=${c1}:seed=${seed}:speed=0`,
    "-vf", "format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(lt(hypot((X-300)/280,(Y-400)/380),1),255,0)'"], out);

// A printed page: warm paper, noise, ruled "lines" of text.
const page = (out, w, h, color) =>
  ff(["-f", "lavfi", "-i", `color=c=${color}:s=${w}x${h}`,
    "-vf", "noise=alls=18:allf=t,drawgrid=w=iw:h=34:t=6:c=0x3a2e22@0.55,drawbox=x=0:y=0:w=iw:h=ih:t=40:c=" + color], out);

export function ensureAssets() {
  mkdirSync(ASSETS, { recursive: true });
  portrait("portrait-1.png", "0x2a2622", "0xb8ad9c", 1);
  portrait("portrait-2.png", "0x3b3025", "0xd4c3a8", 2);
  portrait("portrait-3.png", "0x1e2226", "0xa9b0b8", 3);
  portrait("portrait-4.png", "0x30261c", "0xc9b28f", 4);
  // Continuous tone, mostly mid greys, opaque: what a print screen turns into dots.
  ff(["-f", "lavfi", "-i", "gradients=s=600x800:c0=0x262626:c1=0xcfcfcf:x0=0:y0=0:x1=600:y1=800:speed=0:seed=1",
    "-vf", "format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(lt(hypot((X-300)/290,(Y-400)/390),1),255,0)'"], "engraving.png");
  page("page-a.jpg", 900, 1300, "0xe9dfc8");
  page("page-b.jpg", 900, 1200, "0xe4d6bb");
  ff(["-f", "lavfi", "-i", "color=c=0xd8c49a:s=700x900",
    "-vf", "noise=alls=25:allf=t,format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(lt(abs(X-350)+abs(Y-450)*0.6,520),255,0)'"], "scrap.png");
  return ASSETS;
}
