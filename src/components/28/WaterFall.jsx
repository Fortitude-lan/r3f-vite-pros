/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: Hesin
 * @Date: 2024-08-24 21:38:19
 * @LastEditors: Hesin
 * @LastEditTime: 2024-08-26 17:02:05
 */
import { shaderMaterial } from '@react-three/drei'
import { extend, useFrame, useThree } from '@react-three/fiber';
import { useControls } from 'leva';
import React, { useEffect, useRef } from 'react'
import * as THREE from 'three';

const WaterFallShaderMaterial = shaderMaterial({
    iTime: 0,
    uStrength: 6.0,
    uColorStart: 2.0,
    uColorMiddle: 2.0,
    uColorEnd: 1.75,
    uC1: 0.4,
    transparent: true,
    side: THREE.DoubleSide//双面显示
},
    /*glsl*/
    `
    varying vec2 vUv;
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      vUv = uv;

    }`
    ,
    /*glsl*/
    `
    varying vec2 vUv;
    uniform float iTime;
    uniform float uStrength;
    uniform float uColorStart;     // 渐变起始颜色
    uniform float uColorMiddle;    // 渐变中间颜色
    uniform float uColorEnd;       // 渐变结束颜色
    uniform float uC1;       // 渐变结束颜色
    
    vec2 hash( vec2 p ) {
        p = vec2( dot(p,vec2(127.1,311.7)),
                dot(p,vec2(269.5,183.3)) );
        return -1.0 + 2.0*fract(sin(p*0.0001)*43758.5453123);
    }

    float noise( in vec2 p ) {
        const float K1 = 0.366025404;
        const float K2 = 0.211324865;

        vec2 i = floor( p + (p.x+p.y)*K1 );

        vec2 a = p - i + (i.x+i.y)*K2;
        vec2 o = (a.x>a.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
        vec2 b = a - o + K2;
        vec2 c = a - 1.0 + 2.0*K2;

        vec3 h = max( 0.5-vec3(dot(a,a), dot(b,b), dot(c,c) ), 0.0 );

        vec3 n = h*h*h*h*vec3( dot(a,hash(i+0.0)), dot(b,hash(i+o)), dot(c,hash(i+1.0)));

        return dot( n, vec3(70.0) );
    }

    float fbm(vec2 vUv) {
        float f;
        mat2 m = mat2( 1.6,  1.2, -1.2,  1.6 );
        f  = 0.5000*noise( vUv ); vUv = m*vUv;
        f += 0.2500*noise( vUv ); vUv = m*vUv;
        f += 0.1250*noise( vUv ); vUv = m*vUv;
        f += 0.0625*noise( vUv ); vUv = m*vUv;
        f = 0.6 + 0.5*f;
        return f;
    }

    void main() {
            // Convert vUv from [0.0, 1.0] to [-1.0, 1.0]
            vec2 q = (vUv * 2.0) - vec2(1.0, 1.0); // Center to (-1,1) range
            q.y -=0.7;
            q = q*-1.0;
            q.x *=0.4;
            
            //水流强度
            float strength = uStrength;
            float T3 = max(3.0, 1.25 * strength) * iTime * 0.6 + pow(abs(q.y), 1.25) * 2.0;

            float n = fbm(vec2(strength * q.x, strength * q.y) - vec2(0.0, T3));
            strength = 26.0;
            float T3B = max(3.0, 1.25 * strength) * iTime * 0.6 + pow(abs(q.y), 1.25) * 2.0;
            n = n * 0.5 + (n * 0.5) / (0.001 + 1.5 * fbm(vec2(strength * q.x, strength * q.y) - vec2(0.0, T3B)));

            //强度
            float intensity = abs(sin(iTime * 0.2));
            n *= 1.0 + pow(intensity, 8.0) * 0.5;

            //计算颜色分量
            float c = 1.0 - (16.0 / abs(pow(q.y, 1.0) * 4.0 + 1.0)) * pow(max(0.0, length(q * vec2(1.8 + q.y * 1.5, 0.75)) - n * max(0.0, q.y + 0.25)), 1.2);
            float c1 = n * c * ((0.7 + pow(intensity, 0.8) * 0.9 - pow(intensity, 4.0) * 0.4) - pow(1.0 * vUv.y, 2.0));
            c1 = c1 * 1.05 + sin(c1 * 3.4) * 0.4;
            c1 *= 0.95 - pow(q.y, 2.0);
            c1 = clamp(c1, uC1, 1.0);

            // 提高亮度
            // vec3 col = vec3(2.0 * c1 * c1 * c1, 2.0 * c1 * c1 * c1 * c1, 1.75 * c1 * c1 * c1 * c1);
            vec3 col = vec3(uColorStart * c1 * c1 * c1, uColorMiddle * c1 * c1 * c1 * c1, uColorEnd * c1 * c1 * c1 * c1);
            col = col.zyx;
            // 使用 uniform 颜色值进行颜色计算
        

            // 计算水流颜色 
            float a = c * (1.0 - pow(abs(vUv.y), 10.0));
            vec3 waterColor = vec3(mix(vec3(0.0), col, a));
            
            //设置透明度
            float alpha = 1.0;

            if (waterColor.r < 0.1 && waterColor.g < 0.1 && waterColor.b < 0.1) {
                alpha = 0.0; // 使黑色部分透明
            }
            gl_FragColor = vec4(waterColor, alpha);

    }
`)

extend({ WaterFallShaderMaterial });
const WaterFall = () => {
    const materialRef = useRef();
    const meshRef = useRef();
    const { strength, colorStart, colorMiddle, colorEnd, c1 } = useControls({
        strength: {
            value: 6.0,
            min: 0,
            max: 10,
            step: 0.01
        },
        c1: {
            value: 0.8,
            min: 0,
            max: 1,
            step: 0.01
        },
        colorStart: {
            value: 9.5,
            min: 0,
            max: 10,
            step: 0.01
        },    // 渐变起始颜色
        colorMiddle: {
            value: 7.0,
            min: 0,
            max: 10,
            step: 0.01
        },    // 渐变中间颜色
        colorEnd: {
            value: 5.1,
            min: 0,
            max: 10,
            step: 0.01
        },       // 渐变结束颜色
        // colorStart: '#fff',    // 渐变起始颜色
        // colorMiddle: '#00FFFF',    // 渐变中间颜色
        // colorEnd: '#eeeeee',       // 渐变结束颜色
    })
    useFrame(({ clock }) => {

        if (materialRef.current) {
            materialRef.current.uniforms.iTime.value = clock.getElapsedTime();
        }
    });

    return (
        <group>
            {/* <mesh  position={[-1,0, -0.42]}>

                <boxGeometry args={[1, 4, 1]} />
                <meshBasicMaterial color="#292929" />
            </mesh> */}
            <mesh ref={meshRef}>
                <planeGeometry args={[3, 6]} />
                {/* <meshBasicMaterial color="skyblue" /> */}
                <waterFallShaderMaterial
                    ref={materialRef}
                    uStrength={strength}
                    uColorStart={colorStart}    // 渐变起始颜色
                    uColorMiddle={colorMiddle}      // 渐变中间颜色
                    uColorEnd={colorEnd}       // 渐变结束颜色
                    uC1={c1}
                />
            </mesh>
        </group>
    )
}

export default WaterFall
