/*
 * @Descripttion:
 * @version: Antares
 * @Author:
 * @Date: 2024-07-04 09:58:43
 * @LastEditors: Antares
 * @LastEditTime: 2024-07-04 10:12:01
 */
import { useFrame } from "@react-three/fiber";
import { button, useControls } from "leva";
import React, { useRef, useMemo, useState, useEffect } from "react";
import * as THREE from "three";
function generateRandomBall() {
  return {
    position: [
      (0.5 - Math.random()) * 50,
      20 + (0.5 - Math.random()) * 50,
      (0.5 - Math.random()) * 50,
    ],
    color: "red",
    radius: Math.random() * 5,
  };
}

export function Balls() {
  const [balls, setBalls] = useState(() =>
    Array.from({ length: 10 }).map(generateRandomBall)
  );
  const addRandomBall = () =>
    setBalls((currBalls) => [...currBalls, generateRandomBall()]);
  const { flood } = useControls("BallScene",{
    addBall: button(addRandomBall),
    flood: false,
  });
  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    if (flood && Math.floor(elapsedTime * 10) % 2 === 0) addRandomBall();
  });
  console.log(balls);
  return balls.map((ballInfo, i) => <Ball key={i} {...ballInfo} />);
}

function Ball({ position = [0, 1, 0], color, radius }) {
  //   const sound = useMemo(() => new Audio('/sounds/knock.wav'), [])
  //   const playAudio = (collision) => collision.contact.impactVelocity > 1.5 && sound.play((sound.volume = radius / 5))
  const ref = useRef();
  useEffect(() => {
    if (ref.current) {
      console.log(ref.current.position.x);
      ref.current.position.x = position[0];
      ref.current.position.y = position[1];
      ref.current.position.z = position[2];
    }
  }, [position]);
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
