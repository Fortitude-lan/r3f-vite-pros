/*
 * @Descripttion:
 * @version: Antares
 * @Author:
 * @Date: 2024-07-04 09:58:54
 * @LastEditors: Antares
 * @LastEditTime: 2024-07-04 10:02:58
 */
import React, { useRef } from "react";
import * as THREE from "three";

export function Plane({ size }) {
  const ref = useRef();
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={size} />
      <meshStandardMaterial color="blue" side={THREE.DoubleSide} />
    </mesh>
  );
}
