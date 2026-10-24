import React, { useLayoutEffect } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { Book3D, Card3D, Phone3D } from "../../src/three";
import sibyl from "../../assets/img/schedel-tiburtine-sibyl.jpg";
import riders from "../../assets/img/durer-four-riders.jpg";
import virgin from "../../assets/img/durer-virgin-st-john.jpg";
import genesis from "../../assets/img/gutenberg-genesis.jpg";
import moses from "../../assets/img/dore-moses-sinai.jpg";
import campo from "../../assets/img/piranesi-campo-vaccino.jpg";
import map from "../../assets/img/ortelius-1572-world-map.jpg";

type V3 = [number, number, number];
const FPS = 30;
export const T10_DURATION = 16.5 * FPS;
const sec = (s: number) => s * FPS;

const ease = Easing.bezier(0.45, 0, 0.2, 1);
const out = Easing.bezier(0.16, 1, 0.3, 1);
/** Eased 0..1 ramp between two seconds. */
const ramp = (f: number, a: number, b: number, e = ease) =>
  interpolate(f, [sec(a), sec(b)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });

/** Slow camera drift around the table, driven only by the frame. */
const Rig: React.FC = () => {
  const frame = useCurrentFrame();
  const camera = useThree((s) => s.camera);
  useLayoutEffect(() => {
    const t = frame / FPS;
    const push = interpolate(t, [10, 16.5], [0, 0.5], { extrapolateLeft: "clamp" });
    camera.position.set(Math.sin(t * 0.45) * 0.55, 0.25 + Math.cos(t * 0.38) * 0.2, 10.4 - push);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [frame, camera]);
  return null;
};

/** Card, phone and book enter one after another from outside the frame, each with its own moves. */
const Scene: React.FC = () => {
  const frame = useCurrentFrame();

  // Act 1: a row of three cards, staggered in from three sides, flipping one after another.
  const row = [
    { img: sibyl, back: riders, x: -3.3, from: [-13, 3, 0] as V3, exit: [-13, 0, 0] as V3 },
    { img: riders, back: sibyl, x: 0, from: [0, 9, 0] as V3, exit: [0, 9, 0] as V3 },
    { img: moses, back: virgin, x: 3.3, from: [13, -3, 0] as V3, exit: [13, 0, 0] as V3 },
  ];
  const cardsGone = frame >= sec(5.7);

  // Act 2: phone (5.0 - 10.8 s) between two cards that rest behind it
  const phIn = ramp(frame, 5.0, 6.3, out);
  const phTurn = ramp(frame, 6.6, 8.2);
  const phScroll = ramp(frame, 7.2, 9.2);
  const phOut = ramp(frame, 9.6, 10.8);
  const sideIn = ramp(frame, 5.1, 6.4, out);
  const sideOut = ramp(frame, 9.8, 10.9);
  const sideSway = Math.sin(frame / 25) * 0.04;

  // Act 3: book (10.2 - 16.5 s)
  const bkIn = ramp(frame, 10.2, 11.5, out);
  const bkOpen = ramp(frame, 11.6, 13.4);
  const bkTurn = ramp(frame, 13.9, 15.2);
  const bkOut = ramp(frame, 15.5, 16.5);

  return (
    <>
      <Rig />
      <ambientLight intensity={0.85} />
      <hemisphereLight args={["#fff4dd", "#b9a98a", 0.5]} />
      <directionalLight
        position={[-3, 4.5, 10]}
        intensity={2.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-camera-far={30}
        shadow-bias={-0.0004}
        shadow-radius={5}
      />
      <mesh position={[0, 0, -0.7]} receiveShadow>
        <planeGeometry args={[60, 36]} />
        <meshStandardMaterial color="#e6dcc6" roughness={1} />
      </mesh>

      {!cardsGone &&
        row.map((c, i) => {
          const enter = ramp(frame, i * 0.35, 1.2 + i * 0.35, out);
          const f1 = ramp(frame, 1.5 + i * 0.4, 2.5 + i * 0.4);
          const f2 = ramp(frame, 3.1 + i * 0.3, 4.0 + i * 0.3);
          const o = ramp(frame, 4.6 + i * 0.15, 5.5 + i * 0.15);
          return (
            <Card3D
              key={i}
              image={c.img}
              backImage={c.back}
              size={[2.9, 4.05]}
              rotateY={(f1 + f2) * Math.PI + (1 - enter) * 0.9}
              rotateX={0.1 + Math.sin(frame / 22 + i) * 0.04 * enter}
              rotateZ={(i - 1) * -0.05}
              progress={enter}
              from={c.from}
              position={[c.x + c.exit[0] * o, c.exit[1] * o, 0]}
            />
          );
        })}

      {frame >= sec(4.9) && sideOut < 1 && (
        <>
          <Card3D
            image={sibyl}
            size={[2.6, 3.7]}
            rotateY={0.35 + sideSway}
            rotateZ={0.07}
            progress={sideIn}
            from={[-12, 0.5, 0]}
            position={[-3.5 - sideOut * 10, 0.2, -0.5]}
          />
          <Card3D
            image={riders}
            size={[2.6, 3.7]}
            rotateY={-0.35 - sideSway}
            rotateZ={-0.08}
            progress={sideIn}
            from={[12, -0.5, 0]}
            position={[3.5 + sideOut * 10, -0.2, -0.5]}
          />
        </>
      )}

      {frame >= sec(4.9) && phOut < 1 && (
        <Phone3D
          screen={virgin}
          size={[2.4, 4.9]}
          rotateY={-0.55 + phTurn * 0.9 + phOut * 0.5}
          rotateX={0.1}
          rotateZ={0.04}
          progress={phIn}
          from={[0, -9, 0]}
          position={[0, phOut * 9, 0.5]}
          screenZoom={1 + phScroll * 0.7}
          screenPan={[0, -1 + phScroll * 2]}
        />
      )}

      {frame >= sec(10.0) && bkOut < 1 && (
        <Book3D
          cover={genesis}
          pages={[moses, riders, campo, map, virgin, sibyl, moses, riders, campo, map, virgin, sibyl]}
          progress={bkOpen}
          turn={bkTurn}
          rotateX={0.28 - bkOpen * 0.1}
          rotateY={-0.45 + bkOpen * 0.4 + bkTurn * 0.1}
          enter={bkIn}
          from={[0, 10, 0]}
          position={[bkOut * 13, 0.25, 0]}
        />
      )}
    </>
  );
};

export const T10Three: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#e6dcc6" }}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows="soft"
        camera={{ fov: 32, position: [0, 0, 10.4], near: 0.1, far: 60 }}
      >
        <Scene />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
