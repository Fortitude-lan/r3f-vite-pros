/*
 * @Descripttion:
 * @version: Antares
 * @Author:
 * @Date: 2024-07-04 13:07:03
 * @LastEditors: Antares
 * @LastEditTime: 2024-07-04 13:44:58
 */
import React from "react";
import { ContactShadows } from "@react-three/drei";

export default function DissolveEffect() {
  return (
    <>
      <mesh position={[0, 0.5, 0]} scale={0.2}>
        <boxGeometry />
        <meshNormalMaterial />
      </mesh>
      {/* <ContactShadows /> */}
    </>
  );
}
