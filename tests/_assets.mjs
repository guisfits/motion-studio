// Generated stand-ins for the fixture films' pictures, so the suite needs no third-party image:
// cut-out "portraits" (alpha PNGs), a continuous-tone "engraving" for the halftone test, and page
// scans. Built once with ffmpeg's lavfi sources into tests/.assets/ (gitignored).
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
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
  // Stand-ins for photographed material (never shipped, never a drawn texture): a flat tape strip
  // with zigzag torn ends, a mottled sheet for the page-turn relief, and an ink matte (makeClip
  // frames: a black disc growing on white, 12 frames at 12 fps).
  ff(["-f", "lavfi", "-i", "color=c=0xcfb57a:s=400x90",
    "-vf", "format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(gt(min(X,399-X),8+6*abs(mod(Y,12)-6)/6),220,0)'"], "tape.png");
  ff(["-f", "lavfi", "-i", "color=c=0xd0d0d0:s=540x960", "-vf", "noise=alls=40:allf=t,gblur=sigma=6"], "crumple.png");
  const matte = `${ASSETS}ink-matte`;
  if (!existsSync(`${matte}/clip.json`)) {
    mkdirSync(matte, { recursive: true });
    execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "lavfi", "-i", "color=c=white:s=540x960:r=12:d=1",
      "-vf", "format=gray,geq=lum='if(lt(hypot(X-270,Y-480),(N+1)*45),0,255)'", "-frames:v", "12", `${matte}/%05d.jpg`]);
    writeFileSync(`${matte}/clip.json`, JSON.stringify({ fps: 12, count: 12, w: 540, h: 960 }));
  }
  // Stand-ins for texture scans (lib/texture.js), never a shipped scan. Paper: warm fibre and
  // soft blotches on a light ground. Specks: dark dust on light / bright dust on dark (the two
  // backgrounds blend "auto" tells apart). Marker: an 80x40 tile with one dark 20x20 square in its
  // corner, so a pixel row and a column show the period and that the tile was not stretched.
  // Dust: a 12-frame clip at 12 fps, frame N a flat grey of 10 + 20 N (a frame is identifiable by one pixel).
  if (!existsSync(`${ASSETS}tex-paper.png`))
    execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-filter_complex",
      "color=c=0xf0f0f0:s=1400x1400,format=gray,noise=alls=34:allf=t+u,gblur=sigma=0.8[fine];" +
      "color=c=0x808080:s=1400x1400,format=gray,noise=alls=100:allf=t+u,gblur=sigma=26,lut=y='clip((val-128)*9+247,0,255)'[blot];" +
      "color=c=0x808080:s=1400x1400,format=gray,noise=alls=100:allf=t+u,gblur=sigma=5:sigmaV=0.7,lut=y='clip((val-128)*3.5+249,0,255)'[fibre];" +
      "[fine][blot]blend=all_mode=multiply[a];" +
      "[a][fibre]blend=all_mode=multiply,format=gray,scale=in_range=full:out_range=full,format=rgb24,colorchannelmixer=rr=0.99:gg=0.95:bb=0.85",
      "-frames:v", "1", `${ASSETS}tex-paper.png`]);
  const speck = "mod(X*7+Y*13+X*Y,41)";
  ff(["-f", "lavfi", "-i", "color=c=white:s=200x200", "-vf", `format=rgb24,geq=r='if(lt(${speck},2),60,238)':g='if(lt(${speck},2),60,238)':b='if(lt(${speck},2),60,238)'`], "tex-specks-light.png");
  ff(["-f", "lavfi", "-i", "color=c=white:s=200x200", "-vf", `format=rgb24,geq=r='if(lt(${speck},2),210,10)':g='if(lt(${speck},2),210,10)':b='if(lt(${speck},2),210,10)'`], "tex-specks-dark.png");
  ff(["-f", "lavfi", "-i", "color=c=white:s=80x40", "-vf", "format=rgb24,geq=r='if(lt(X,20)*lt(Y,20),32,255)':g='if(lt(X,20)*lt(Y,20),32,255)':b='if(lt(X,20)*lt(Y,20),32,255)'"], "tex-marker.png");
  const dust = `${ASSETS}tex-dust`;
  if (!existsSync(`${dust}/clip.json`)) {
    mkdirSync(dust, { recursive: true });
    execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "lavfi", "-i", "color=c=black:s=64x64:r=12:d=1",
      "-vf", "format=gray,geq=lum='10+20*N'", "-frames:v", "12", `${dust}/%05d.jpg`]);
    writeFileSync(`${dust}/clip.json`, JSON.stringify({ fps: 12, count: 12, w: 64, h: 64 }));
  }
  // Film dust that looks like dust: sparse bright specks and the odd hairline scratch on black, a
  // different scatter each frame (12 frames at 12 fps), for the visual before/after of a film.
  const fine = `${ASSETS}tex-dust-fine`;
  if (!existsSync(`${fine}/clip.json`)) {
    mkdirSync(fine, { recursive: true });
    const scatter = "mod(X*7+Y*13+X*Y+N*911*X+N*37*Y,1499)";
    execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "lavfi", "-i", "color=c=black:s=540x960:r=12:d=1",
      "-vf", `format=gray,geq=lum='if(lt(${scatter},2),210,if(eq(X,mod(N*173+40,540))*lt(mod(Y+N*97,960),300),120,6))'`,
      "-frames:v", "12", `${fine}/%05d.jpg`]);
    writeFileSync(`${fine}/clip.json`, JSON.stringify({ fps: 12, count: 12, w: 540, h: 960 }));
  }
  return ASSETS;
}
