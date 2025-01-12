import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useGLTF, useAnimations, shaderMaterial, useTexture } from '@react-three/drei'
import { extend } from '@react-three/fiber'
import { useControls } from 'leva'


// 闪电噪波纹理
const FireMaterial = shaderMaterial({
    uTime: 0,
    transparent: true,
    side: THREE.DoubleSide,
    // depthTest: true,      // 启用深度测试
    // depthWrite: false,    // 禁用深度写入（确保后面的内容不被遮挡）
    // depthFunc: THREE.Lequal, // 确保按深度进行比较

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
         // 从噪声纹理中获取当前 UV 坐标下的颜色
    vec4 texColor = texture2D(uNoiseTexture, vUv);
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
extend({ FireMaterial })
export function Flame(props) {
    const group = useRef()
    const { nodes, materials, animations } = useGLTF('/models/flame.glb')

    const { color1, color2, color3, color4 } = useControls({
        color1: '#fff4a5',
        color2: '#ffd85c',
        color3: '#ff8900',
        color4: '#b2d3ff'
    })
    const texture0 = useTexture('/textures/VN0.png');
    const texture = useTexture('/textures/VN.png');
    const texture2 = useTexture('/textures/VN2.png');
    texture0.flipY = false
    texture.flipY = false
    texture2.flipY = false

    return (
        <group ref={group} {...props} dispose={null}>
            <ambientLight intensity={3} />
            <group name="Scene">
                <mesh name="棱角球003" geometry={nodes.棱角球003.geometry}>
                    <fireMaterial uNoiseTexture={texture0} uColor={color1} />
                </mesh>

                {/* <mesh name="棱角球004" geometry={nodes.棱角球004.geometry}> */}
                <mesh name="棱角球003" geometry={nodes.棱角球003.geometry} scale={0.7}>
                    <fireMaterial uNoiseTexture={texture} uColor={color2} />
                </mesh>
                {/* <mesh name="棱角球005" geometry={nodes.棱角球005.geometry}> */}
                <mesh name="棱角球003" geometry={nodes.棱角球003.geometry} scale={0.8}>
                    <fireMaterial uNoiseTexture={texture2} uColor={color3} />
                </mesh>
            </group>
        </group>
    )
}

useGLTF.preload('/models/flame.glb')