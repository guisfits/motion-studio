import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SetDown, wiggle } from "../../src/paper";
import { Puppet, POSES, interpolatePose, type Part, type RigPose as Pose, type PoseKey } from "../../src/rig";
import puppetJson from "../../assets/cut/puppet.json";
import torso from "../../assets/cut/puppet-torso.png";
import head from "../../assets/cut/puppet-head.png";
import upperL from "../../assets/cut/puppet-upper_arm_l.png";
import lowerL from "../../assets/cut/puppet-lower_arm_l.png";
import upperR from "../../assets/cut/puppet-upper_arm_r.png";
import lowerR from "../../assets/cut/puppet-lower_arm_r.png";
import piranesi from "../../assets/img/piranesi-campo-vaccino.jpg";
import merian from "../../assets/img/merian-alsatiae.jpg";

const FPS = 30;
export const T11_DURATION = 14 * FPS;

const PARTS = puppetJson as Part[];
const IMAGES: Record<string, string> = {
  torso,
  head,
  upper_arm_l: upperL,
  lower_arm_l: lowerL,
  upper_arm_r: upperR,
  lower_arm_r: lowerR,
};

const SCALE = 0.95; // 886 px figure -> ~842 px, 78% of the frame height
const FIG = { x: 800, y: 100 };

// Seconds to frames at the demo's fps.
const sec = (s: number) => s * FPS;
// A pose key at `at` seconds.
const hold = (at: number, pose: Pose): PoseKey => ({ at: sec(at), pose });

// Wave: the forearm swings in and out, each leg 0.35 s.
const waveKeys = (from: number, to: number): PoseKey[] => {
  const keys: PoseKey[] = [];
  for (let t = from, i = 0; t <= to + 1e-6; t += 0.35, i++) keys.push(hold(t, i % 2 ? POSES.waveIn : POSES.waveUp));
  return keys;
};

const KEYS: PoseKey[] = [
  hold(0, POSES.rest),
  hold(2.0, POSES.rest),
  ...waveKeys(2.4, 3.8), // wave
  hold(4.2, POSES.rest),
  hold(4.7, POSES.point), // point at the first engraving
  hold(6.4, POSES.point),
  hold(6.9, POSES.rest),
  hold(7.2, POSES.nodDown), // nod
  hold(7.5, POSES.nodUp),
  hold(7.8, POSES.nodDown),
  hold(8.1, POSES.rest),
  hold(8.6, POSES.pointR), // point at the second engraving
  hold(10.3, POSES.pointR),
  hold(10.8, POSES.armsOut),
  hold(11.6, POSES.rest),
  ...waveKeys(12.0, 14.0), // final wave
];

const SEEDED = ["head", "upper_arm_l", "upper_arm_r", "lower_arm_l", "lower_arm_r"];

// The scripted pose plus a small secondary wiggle (+-1.2 deg) on head and arms, held per pose.
const poseAt = (frame: number): Pose => {
  const base = interpolatePose(KEYS, frame);
  const out: Pose = { ...base };
  for (const p of SEEDED) out[p] = (base[p] ?? 0) + wiggle(`t11-${p}`, frame, FPS, 1.2).rotate;
  return out;
};

/** Boil on a settled piece: a new offset every pose of the 12 fps clock. */
const Boil: React.FC<{ seed: string; children: React.ReactNode }> = ({ seed, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const w = wiggle(seed, frame, fps, 1.5);
  return <div style={{ transform: `translate(${w.x}px, ${w.y}px) rotate(${w.rotate * 0.25}deg)` }}>{children}</div>;
};

// An engraving on a paper mount.
const Print: React.FC<{ src: string; w: number; h: number }> = ({ src, w, h }) => (
  <div style={{ width: w, height: h, padding: 14, boxSizing: "border-box", background: "#f4efe3" }}>
    <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(0.4) contrast(1.05)" }} />
  </div>
);

/** A cut-out puppet dragged onto a paper ground: it waves, points at an engraving, nods, points again. */
export const T11Puppet: React.FC = () => {
  const frame = useCurrentFrame();
  // Gentle smooth push-in while the paper steps.
  const drift = interpolate(frame, [0, T11_DURATION], [1, 1.035], { extrapolateRight: "clamp" });
  return (
  <AbsoluteFill style={{ backgroundColor: "#b9b09d", overflow: "hidden" }}>
    <AbsoluteFill style={{ transform: `scale(${drift})` }}>
    <SetDown delay={0.1} from="bottom" rotate={-0.6} style={{ left: 150, top: 50 }}>
      <div style={{ width: 1620, height: 980, background: "#ece4d2" }} />
    </SetDown>
    <SetDown delay={1.0} from="right" rotate={0} margin={300} style={{ left: FIG.x, top: FIG.y }}>
      <Puppet parts={PARTS} images={IMAGES} poseAt={poseAt} size={[341, 886]} scale={SCALE} />
    </SetDown>
    <SetDown delay={5.2} from="left" rotate={-2} style={{ left: 110, top: 300 }}>
      <Boil seed="t11-a">
        <Print src={piranesi} w={650} h={453} />
      </Boil>
    </SetDown>
    <SetDown delay={9.0} from="right" rotate={2.5} style={{ left: 1200, top: 330 }}>
      <Boil seed="t11-b">
        <Print src={merian} w={640} h={480} />
      </Boil>
    </SetDown>
    </AbsoluteFill>
  </AbsoluteFill>
  );
};
