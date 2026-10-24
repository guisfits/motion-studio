import { AbsoluteFill, Img, useCurrentFrame } from "remotion";
import deskUrl from "../assets/gen/s16-desk.png";
import folderUrl from "../assets/gen/s16-folder-cut.png";
import cafe from "../assets/pd/cafe-terrace.jpg";
import { CircleMark } from "../../../../src/type";
import { bounce, drift, throwIn } from "../../../../src/physics";
import { H, ORBITRON, useShotFonts, W } from "../lib/s12-16-kit";

// S16 (492-554), rebuilt from the reference: one desk world, a camera that PUNCHES. The measured
// camera (cumulative scale per frame, motion-measure on the reference) is: a hard push-in 1 -> 1.49
// over 10 frames, a hard pull-out to 1.23 around f14-16, a second push-in to 1.52 on f27-45, then a
// hold. It is reproduced as that measured path, not eased by hand. The folder pops with a spring,
// the three Ae cards rise out of it with overshoot, the ring is written on at f14-23, and the URL
// types in screen space at ~1 char/frame from f32.

const URL_TEXT = "EARNEDITS.COM";
const FPS = 16;
const CAM_SCALE = [
  1.0, 1.098, 1.19, 1.267, 1.329, 1.377, 1.415, 1.444, 1.464, 1.479, 1.488, 1.49, 1.485, 1.471, 1.441, 1.385, 1.329, 1.296, 1.276, 1.261, 1.25, 1.241,
  1.234, 1.23, 1.227, 1.226, 1.227, 1.23, 1.237, 1.249, 1.273, 1.321, 1.375, 1.412, 1.438, 1.457, 1.472, 1.483, 1.49, 1.493, 1.497, 1.503, 1.507, 1.511,
  1.514, 1.516, 1.518, 1.519, 1.52, 1.52, 1.521, 1.521, 1.521, 1.521, 1.522, 1.522, 1.522, 1.522, 1.522, 1.522, 1.521, 1.521,
];
const camScale = (f: number) => CAM_SCALE[Math.max(0, Math.min(CAM_SCALE.length - 1, Math.round(f)))];

// Folder: world centre, the cut-out's visible body is 68 % of its image width.
const FOLDER_W = 356; // visible body width at rest
const BODY = 0.68;
const FOLDER_REST: [number, number] = [W * 0.5, H * 0.505];
const FOLDER_START: [number, number] = [W * 0.5, H * 0.56];

const Wood: React.FC = () => {
  // a clean strip of the plate's wood, mirrored every tile so the vertical grain runs unbroken
  const tileH = 838;
  const k = W / 580;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#6a3320" }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ position: "absolute", left: 0, top: i * tileH, width: W, height: tileH, overflow: "hidden", transform: i % 2 ? "scaleY(-1)" : undefined, filter: "saturate(1.05) brightness(1.0) contrast(1.05) blur(2.4px)" }}>
          <Img src={deskUrl} style={{ position: "absolute", left: -200 * k, top: -600 * k, width: 864 * k, height: 1536 * k }} />
        </div>
      ))}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 42%, rgba(255,170,90,0.14), transparent 70%)", mixBlendMode: "soft-light" }} />
    </div>
  );
};

const shadow = "drop-shadow(0 16px 14px rgba(0,0,0,0.5))";

const Frame: React.FC = () => (
  <div style={{ position: "absolute", left: 205 - 210, top: 518 - 165, width: 420, height: 330, transform: "rotate(17deg)", padding: 26, boxSizing: "border-box", background: "linear-gradient(135deg,#f0cf70,#9b6a1d 55%,#e2b550)", borderRadius: 10, boxShadow: "inset 0 0 0 5px rgba(255,235,170,0.55), inset 0 0 14px rgba(70,40,5,0.8)", filter: shadow }}>
    <Img src={cafe} style={{ width: "100%", height: "100%", objectFit: "cover", boxShadow: "inset 0 0 12px #000" }} />
  </div>
);

const Ruler: React.FC = () => (
  <div style={{ position: "absolute", left: 432 - 190, top: 538 - 28, width: 380, height: 56, transform: "rotate(105deg)", background: "linear-gradient(180deg,#f0c4b8,#dba698)", borderRadius: 3, filter: shadow }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 22, background: "repeating-linear-gradient(90deg, rgba(60,30,25,0.8) 0 2px, transparent 2px 19px), repeating-linear-gradient(90deg, rgba(60,30,25,0.5) 0 1px, transparent 1px 9.5px)", backgroundSize: "100% 55%, 100% 28%", backgroundRepeat: "no-repeat" }} />
  </div>
);

const Calculator: React.FC = () => (
  <div style={{ position: "absolute", left: 788 - 120, top: 518 - 160, width: 240, height: 320, transform: "rotate(-12deg)", background: "linear-gradient(160deg,#35353a,#151518)", borderRadius: 16, filter: shadow, padding: 20, boxSizing: "border-box" }}>
    <div style={{ height: 62, background: "linear-gradient(180deg,#6d7468,#566052)", borderRadius: 5 }} />
    <div style={{ marginTop: 22, height: 190, backgroundImage: "repeating-linear-gradient(0deg, transparent 0 34px, #151518 34px 40px), repeating-linear-gradient(90deg, transparent 0 40px, #151518 40px 46px)", backgroundColor: "#4a4a50", borderRadius: 4 }} />
  </div>
);

const Pen: React.FC = () => (
  <div style={{ position: "absolute", left: 378 - 8, top: 1248 - 140, width: 16, height: 280, transform: "rotate(-13deg)", borderRadius: 8, background: "linear-gradient(90deg,#d8d8ee,#fff 40%,#c9c9e6)", filter: "drop-shadow(6px 8px 6px rgba(0,0,0,0.5))" }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 78, borderRadius: "8px 8px 2px 2px", background: "linear-gradient(90deg,#3a35c4,#6a63ee 45%,#2c27a2)" }} />
  </div>
);

const Tarot: React.FC = () => (
  <div style={{ position: "absolute", left: 238 - 150, top: 1498 - 230, width: 300, height: 460, transform: "rotate(-9deg)", background: "#efe8d4", borderRadius: 8, padding: 18, boxSizing: "border-box", filter: shadow }}>
    <div style={{ position: "relative", width: "100%", height: 372, overflow: "hidden", border: "2px solid #3a2a1a" }}>
      <Img src={deskUrl} style={{ position: "absolute", left: -640 * 1.16, top: -1190 * 1.16, width: 864 * 1.16, height: 1536 * 1.16 }} />
    </div>
    <div style={{ textAlign: "center", marginTop: 8, fontFamily: "Georgia, serif", fontSize: 24, letterSpacing: 4, color: "#3a2a1a" }}>JUSTICE</div>
  </div>
);

const Keyboard: React.FC = () => (
  <div style={{ position: "absolute", left: 918 - 280, top: 1382 - 115, width: 560, height: 230, transform: "rotate(-52deg)", background: "linear-gradient(180deg,#eef0f4,#b8bfcc)", borderRadius: 14, filter: shadow, padding: 16, boxSizing: "border-box" }}>
    <div style={{ width: "100%", height: "100%", backgroundImage: "repeating-linear-gradient(0deg, transparent 0 36px, #6d7587 34px 42px), repeating-linear-gradient(90deg, transparent 0 40px, #6d7587 38px 46px)", backgroundColor: "#f4f6fa", borderRadius: 6 }} />
  </div>
);

const AeCard: React.FC<{ cx: number; cy: number; rot: number; size: number }> = ({ cx, cy, rot, size }) => (
  <div style={{ position: "absolute", left: cx - size / 2, top: cy - size / 2, width: size, height: size, borderRadius: size * 0.1, background: "linear-gradient(160deg,#2c2ca0,#12125c)", boxShadow: "0 4px 10px rgba(0,0,0,0.5)", transform: `rotate(${rot}deg)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <span style={{ fontFamily: "Arial, Helvetica, sans-serif", fontWeight: 700, fontSize: size * 0.6, color: "#b9b9ff", letterSpacing: "-0.04em" }}>Ae</span>
  </div>
);

export const S16: React.FC = () => {
  useShotFonts();
  const f = useCurrentFrame();
  const s = camScale(f);
  const dz = Math.abs(s / camScale(f - 1) - 1) * 100;
  const smear = Math.min(5, dz * 0.55); // zoom smear on the punches
  const pose = throwIn(f, FPS, {
    from: { x: FOLDER_START[0], y: FOLDER_START[1], rotate: -4, scale: 0.76 },
    to: { x: FOLDER_REST[0], y: FOLDER_REST[1], rotate: 0, scale: 1 },
    frames: 3,
    damping: 0.5,
  });
  const cw = (FOLDER_W / BODY) * pose.scale; // folder image width this frame
  const rise = bounce(f - 1, FPS, { hz: 1.8, damping: 0.42 }); // cards climb out of the folder
  const ch = cw * 0.8125;
  const cards = [
    { x: 0.27, rot: -9, dy: 0 },
    { x: 0.53, rot: -2, dy: -0.02 },
    { x: 0.74, rot: 11, dy: 0.01 },
  ];
  const n = Math.min(URL_TEXT.length, Math.max(0, Math.floor((f - 32) / 1.1) + 1));
  const typing = f >= 31;
  return (
    <AbsoluteFill style={{ background: "#5a2c18", overflow: "hidden" }}>
      <AbsoluteFill style={{ transformOrigin: "0 0", transform: `translate(${W / 2}px, ${H / 2}px) scale(${s}) translate(${-W / 2}px, ${-H / 2}px)`, filter: smear > 0.3 ? `blur(${smear.toFixed(2)}px)` : undefined }}>
        <Wood />
        {[Frame, Ruler, Calculator, Pen, Tarot, Keyboard].map((Item, i) => {
          // desk objects settle and nudge a few px (the reference's moving fraction is 12 %)
          const d = drift(f, FPS, `s16-${i}`, { amp: 4, hz: 0.45 });
          return (
            <div key={i} style={{ position: "absolute", inset: 0, transform: `translate(${d.x}px, ${d.y}px) rotate(${d.rotate}deg)`, filter: "blur(1.1px)" }}>
              <Item />
            </div>
          );
        })}
        <div style={{ position: "absolute", left: pose.x - cw / 2, top: pose.y - ch / 2, width: cw, height: ch, transform: `rotate(${pose.rotate}deg)` }}>
          {cards.map((c, i) => (
            <AeCard key={i} cx={c.x * cw} cy={(0.15 + 0.16 * (1 - rise) + c.dy) * cw} rot={c.rot} size={0.235 * cw} />
          ))}
          <Img src={folderUrl} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", filter: "drop-shadow(0 10px 12px rgba(0,0,0,0.45))" }} />
        </div>
        {f >= 12 && (
          <div style={{ position: "absolute", left: W / 2 - 240, top: H * 0.49 - 200, width: 480, height: 400 }}>
            <CircleMark at={17 / FPS} lead={3} dur={9} color="#d82424" strokeWidth={`${(6.5 * s).toFixed(1)}px`} pad={0} seed="earn-folder" style={{ width: "100%", height: "100%", display: "block" }} />
          </div>
        )}
      </AbsoluteFill>
      {typing && (
        <div style={{ position: "absolute", left: 0.05 * W, top: H * 0.49, transform: "translateY(-50%) scale(1, 1.4)", fontFamily: ORBITRON, fontWeight: 900, fontSize: 98, transformOrigin: "0 50%", color: "#f2f2f2", textShadow: "2px 0 0 #0a0a0a, -2px 0 0 #0a0a0a, 0 2px 0 #0a0a0a, 0 -2px 0 #0a0a0a, 2px 2px 0 #0a0a0a, -2px -2px 0 #0a0a0a, 2px -2px 0 #0a0a0a, -2px 2px 0 #0a0a0a, 0 5px 0 rgba(0,0,0,0.6)", whiteSpace: "nowrap" }}>
          <span style={{ color: "#27d13a" }}>{"{"}</span>
          {URL_TEXT.slice(0, n)}
          <span style={{ color: "#fff" }}>{"}"}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};
