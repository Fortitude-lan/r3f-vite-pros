/**
 * shader source: https://medium.com/@gordonnl/wind-f4fc7a3b366a
 * 
 **/

import React, { useRef } from 'react'
import { shaderMaterial, useGLTF } from '@react-three/drei'
import { extend, useFrame } from '@react-three/fiber'
import * as THREE from 'three';

const WindShader = shaderMaterial({
    uTime: 0,
    transparent: true,
    side: THREE.DoubleSide,
    depthTest: true,      // 启用深度测试
    depthWrite: false,    // 禁用深度写入（确保后面的内容不被遮挡）
    depthFunc: THREE.Lequal  // 确保按深度进行比较
},
    /*glsl*/`
     varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
    /*glsl*/` varying vec2 vUv;
    uniform float uTime;
    void main() {
        float len = 0.15; //设置为表示胶囊的半宽度
        float falloff = 0.1; //边缘的平滑度
        float p = mod(uTime * 0.25, 1.0); //时间驱动的偏移量
        float alpha = smoothstep(len, len - falloff, abs(vUv.x - p));//计算当前片段的透明度 从白色渐变到透明
        float width = smoothstep(len * 2.0, 0.0, abs(vUv.x - p)) * 0.5;//更宽的平滑

        alpha *= smoothstep(width, width - 0.3, abs(vUv.y - 0.5));
        alpha *= smoothstep(0.5, 0.3, abs(p - 0.5) * (1.0 + len));

        gl_FragColor = vec4(vec3(1.0),alpha);
    }`)

extend({ WindShader })
const Wind = () => {
    const { nodes, scene } = useGLTF('/models/windStroke1Model.glb')
    const shaderRef = useRef()
    useFrame(({ clock }) => {
        shaderRef.current.uniforms.uTime.value = clock.getElapsedTime()
    })
    return (
        <group>
            <ambientLight intensity={2} />
            {/* <primitive object={scene}/> */}
            <mesh geometry={nodes.windStroke1Model.geometry}>
                <windShader ref={shaderRef} />
            </mesh>

            {/* <mesh>
                <planeGeometry args={[3, 1]} />
                <meshStandardMaterial color="blue" />
            </mesh> */}
        </group>
    )
}

export default Wind

useGLTF.preload('/models/windStroke1Model.glb')