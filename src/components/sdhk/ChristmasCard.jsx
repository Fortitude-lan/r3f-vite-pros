/*
 * @Descripttion:  
 * @version: Chevalier
 * @Author: 
 * @Date: 2024-08-17 09:16:42
 * @LastEditors: Hesin
 * @LastEditTime: 2024-08-22 13:52:08
 */
import React, { useRef, useMemo } from "react";
import { extend, useThree, useLoader, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";

import { Water } from "three/examples/jsm/objects/Water.js";

extend({ Water });

export default function ChristmasCard() {
    const ref = useRef();
    const gl = useThree((state) => state.gl);
    // Normal
    const waterNormals = useLoader(
        THREE.TextureLoader, "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/waternormals.jpg"
    );
    waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;

    const geom = useMemo(() => new THREE.CircleGeometry(30000, 30000), []);

    const config = useMemo(
        () => ({
            textureWidth: 512,
            textureHeight: 512,
            waterNormals,
            sunDirection: new THREE.Vector3(),
            sunColor: 0xeb8934,
            waterColor: 0x0064b5,
            distortionScale: 10,
            fog: false,
            format: gl.encoding,
        }),
        [waterNormals]
    );

    useFrame((state, delta) => {
        const material = ref?.current?.material;
        material.uniforms.time.value += delta * 10;
    })
    return (
        <>
            <Environment background files="sky_4k.hdr" path="/textures/" />
            <water
                ref={ref}
                args={[geom, config]}
                rotation-x={-Math.PI / 2}
                position={[0, 0, 0]}
            />
        </>
    );

}
