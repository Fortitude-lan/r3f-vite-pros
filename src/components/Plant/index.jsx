/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: Hesin
 * @Date: 2024-09-29 07:50:16
 * @LastEditors: Hesin
 * @LastEditTime: 2024-09-29 13:40:20
 */
import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useGLTF, useTexture, useAnimations } from '@react-three/drei'
import { useFrame, extend } from '@react-three/fiber'
import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing'
import { shaderMaterial, useFBO } from "@react-three/drei";//创建自定义着色器材质和渲染目标。
import { Leva, useControls } from "leva";
export const ShadeMaterial = shaderMaterial({
    uTime: 0,
    transparent: true,
    side: THREE.DoubleSide,
    depthTest: true,      // 启用深度测试
    depthWrite: false,    // 禁用深度写入（确保后面的内容不被遮挡）
    depthFunc: THREE.Lequal, // 确保按深度进行比较

    uColor: new THREE.Color("skyblue"),
    uNoiseTexture: new THREE.Texture()
},
/*glsl*/`
 varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,

/*glsl*/`
    varying vec2 vUv;
    uniform float uTime;
    uniform vec3 uColor;
    uniform sampler2D uNoiseTexture;
    void main() {

        // 移动纹理的 UV 坐标（在 y 轴方向上根据 uTime 偏移）
    vec2 movingUV = vUv;
    movingUV.y += uTime; // 控制移动速度
    // 让纹理在 y 轴上循环移动，通过 mod 限制坐标范围在 [0, 1]
    movingUV.y = mod(movingUV.y, 1.0);
    // 采样噪声纹理
    vec4 texColor = texture2D(uNoiseTexture, movingUV);
     // 计算黑白过渡区域，用于检测边界
     float edge = smoothstep(0.2, 0.5, texColor.r);

    // 基于边界的亮度调整，让亮区渐变为更亮的 uColor
    vec3 brightColor = uColor * 2.0; // 适当增加亮度

    // 根据边界的结果，选择不同的颜色：亮色或原色
    vec3 finalColor = mix(uColor, brightColor, edge);

    // 应用 alpha 通道，让黑色区域变透明
    float alpha = texColor.r > 0.2 ? 1.0 : 0.0;

    // 输出最终颜色
    gl_FragColor = vec4(finalColor, alpha);
 
    }
`)
extend({ ShadeMaterial })

export default function Plant() {


    const { color1, color2, color3 } = useControls({
        color1: '#94e6ff',
        color2: '#ffd85c',
        color3: '#ff8900'
    })
    const ref = useRef()
    const sphereRef = useRef()
    const texture = useTexture('/textures/elec2.png');
    useFrame(({ clock }) => {
        // ref.current.uniforms.uTime.value = clock.getElapsedTime()
        // sphereRef.current.rotation.y = clock.getElapsedTime()
    })
    const { intensity, radius, levels } = useControls({
        intensity: { value: 1, min: 0, max: 1.5, step: 0.01 },
        radius: { value: 1, min: 0, max: 1, step: 0.01 },
        levels: { value: 7, min: 0, max: 8, step: 1 }
    })
    return (
        <>
            <EffectComposer>
                <Bloom luminanceThreshold={0} intensity={intensity} mipmapBlur radius={radius} levels={levels} />
            </EffectComposer>
            <mesh ref={sphereRef}>
                <sphereGeometry args={[1, 32, 32]} />
                <shadeMaterial ref={ref} uColor={color1} uNoiseTexture={texture} />
            </mesh>

        </>
    )
}
