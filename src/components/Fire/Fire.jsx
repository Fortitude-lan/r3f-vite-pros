/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: Hesin
 * @Date: 2024-09-02 08:26:53
 * @LastEditors: Hesin
 * @LastEditTime: 2024-09-02 20:39:06
 */
/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: Hesin
 * @Date: 2024-09-02 08:26:53
 * @LastEditors: Hesin
 * @LastEditTime: 2024-09-02 08:38:55
 */
import React, { useRef, useState, useEffect } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';

const Fire = () => {
    const [options, setOptions] = useState({
        exposure: 2.8,
        bloomStrength: 1.7,
        bloomThreshold: 0,
        bloomRadius: 0.8,
        color0: [74, 30, 0],
        color1: [201, 158, 72],
    });

    const shaderRef = useRef()
    useFrame(({ clock }) => {
        shaderRef.current.uniforms.uTime.value = clock.getElapsedTime()
    })
    return (
        <EffectComposer>
            <Bloom
                attachArray="passes"
                kernelSize={3}
                luminanceThreshold={options.bloomThreshold}
                luminanceSmoothing={0.025}
                intensity={options.bloomStrength}
                radius={options.bloomRadius}
            />
            <mesh>
                <planeGeometry args={[5, 5]} />
                <fireShaderMaterial ref={shaderRef} />
                {/* <meshBasicMaterial color="red" /> */}
            </mesh>
        </EffectComposer>
    )
}

export default Fire

const FireShaderMaterial = shaderMaterial({
    uTime: 0,
    color0: [74, 30, 0], // CSS string
    color1: [201, 158, 72], // RGB array
    transparent: true,
    side: THREE.DoubleSide,

},
/*glsl*/`
 varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,
/*glsl*/`
  // Fragment Shader
    varying vec2 vUv; // Varying for texture coordinates
    uniform float uTime; // Time uniform

    vec2 hash(vec2 p) {
        p = vec2(dot(p, vec2(127.1, 311.7)),
                dot(p, vec2(269.5, 183.3)));
        return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
    }

    float noise(vec2 p) {
        const float K1 = 0.366025404; // (sqrt(3) - 1) / 2
        const float K2 = 0.211324865; // (3 - sqrt(3)) / 6

        vec2 i = floor(p + (p.x + p.y) * K1);
        vec2 a = p - i + (i.x + i.y) * K2;
        vec2 o = (a.x > a.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec2 b = a - o + K2;
        vec2 c = a - 1.0 + 2.0 * K2;

        vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
        vec3 n = h * h * h * h * vec3(dot(a, hash(i + vec2(0.0))),
                                        dot(b, hash(i + o)),
                                        dot(c, hash(i + vec2(1.0))));

        return dot(n, vec3(70.0));
    }

    float fbm(vec2 uv) {
        float f;
        mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
        f  = 0.5000 * noise(uv); uv = m * uv;
        f += 0.2500 * noise(uv); uv = m * uv;
        f += 0.1250 * noise(uv); uv = m * uv;
        f += 0.0625 * noise(uv); uv = m * uv;
        f = 0.5 + 0.5 * f;
        return f;
    }

    void main() {
        vec2 uv = vUv;

        uv = uv * 1.0;
        vec2 q = uv;
        q.x *= 1.0; //几个火焰
        q.y *= 1.0;
      
        float strength = floor(q.x + 5.0);
        
        float T3 = max(3.0, 1.25 * strength) * uTime;

        q.x = mod(q.x, 1.0) - 0.5;
        q.y -= 0.25;
        float n = fbm(strength * q - vec2(0.0, T3));

        float c = 1.0 - 16.0 * pow(max(0.0, length(q * vec2(1.8 + q.y * 1.5, 0.75)) - n * max(0.0, q.y + 0.25)), 1.2);

        float c1 = n * c * (1.5 - pow(2.50 * uv.y,0.0));
        
        c1 = clamp(c1, 0.0, 1.0);

        vec3 col = vec3(1.5 * c1, 1.5 * c1 * c1 * c1, c1 * c1 * c1 * c1 * c1 * c1);

        // Uncomment to change flame color
        // col = col.zyx; // BLUE_FLAME
        // col = 0.85 * col.yxz; // GREEN_FLAME

        // float a = c * (1.0 - pow(uv.y, 3.0));
        float a = c * (1.0 - pow(uv.y, 11.0)); // 或其他适合的值
        gl_FragColor = vec4(mix(vec3(0.0), col, 0.8), 1.0);
    }
  
`

)
extend({ FireShaderMaterial })