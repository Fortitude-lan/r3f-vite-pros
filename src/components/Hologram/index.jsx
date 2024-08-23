import React, { useRef, useMemo, useEffect } from 'react'
import { shaderMaterial } from "@react-three/drei";
import { useFrame, extend } from "@react-three/fiber";

import * as THREE from 'three'
import { useControls } from 'leva';
import HologramMaterial from './HologramMaterial';
import HolographicMaterial from './HolographicMaterial';

export default function Index(props) {
    const ref1 = useRef()
    const ref2 = useRef()
    const ref3 = useRef()
    useFrame((state, delta) => {
        console.log(state.clock.elapsedTime)

        ref1.current.rotation.x = -state.clock.elapsedTime * 0.3
        ref1.current.rotation.y = state.clock.elapsedTime * 0.5
        ref2.current.rotation.x = -state.clock.elapsedTime * 0.3
        ref2.current.rotation.y = state.clock.elapsedTime * 0.5
        ref3.current.rotation.x = -state.clock.elapsedTime * 0.3
        ref3.current.rotation.y = state.clock.elapsedTime * 0.5
        // spref.current.rotation.x += delta
        // console.log(spref.current.rotation)
    })
    return (
        <group {...props} dispose={null}>
            <mesh position={[-5, 0, 0]} ref={ref1} >
                <sphereGeometry args={[1.5, 32, 16]} />
                <HologramMaterial />
            </mesh>
            <mesh ref={ref2} >
                <cylinderGeometry args={[1.5, 0.5, 1.5, 16, 15, false]} />
                <HologramMaterial />
                {/* <HolographicMaterial/> */}
            </mesh>
            <mesh position={[5, 0, 0]} ref={ref3} >

                <torusKnotGeometry args={[1, 0.15, 80, 15]} />
                <HologramMaterial />
            </mesh>
        </group>
    )
}
