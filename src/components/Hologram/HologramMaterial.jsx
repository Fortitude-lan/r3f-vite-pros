
import React, { useRef, useMemo } from 'react'
import { shaderMaterial } from '@react-three/drei'
import { extend, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useControls } from 'leva';

export default function HologramMaterial() {
    const config = useControls('HOLOGRAM', { color: { value: '#70c1ff' } })
    const HolographicMaterial = shaderMaterial(
        {
            uTime: 0,
            uColor: new THREE.Color('#70c1ff'),
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        },
         /*glsl*/`
            uniform float uTime;
    
            varying vec3 vPosition;
            varying vec3 vNormal;
    
    
            float random2D(vec2 value)
            {
                return fract(sin(dot(value.xy, vec2(12.9898,78.233))) * 43758.5453123);
            }
            void main()
            {
                // Position
                vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    
                // Glitch
                float glitchTime = uTime - modelPosition.y;
                float glitchStrength = sin(glitchTime) + sin(glitchTime * 3.45) +  sin(glitchTime * 8.76);
                glitchStrength /= 3.0;
                glitchStrength = smoothstep(0.3, 1.0, glitchStrength);
                glitchStrength *= 0.25;
                modelPosition.x += (random2D(modelPosition.xz + uTime) - 0.5) * glitchStrength;
                modelPosition.z += (random2D(modelPosition.zx + uTime) - 0.5) * glitchStrength;
    
                // Final position
                gl_Position = projectionMatrix * viewMatrix * modelPosition;
    
                // Model normal
                vec4 modelNormal = modelMatrix * vec4(normal, 0.0);
    
                // Varyings
                vPosition = modelPosition.xyz;
                vNormal = modelNormal.xyz;
            }
                    `,
        /*glsl*/`
        
        varying vec3 vPosition;
        uniform float uTime;
        varying vec3 vNormal;
        uniform vec3 uColor;

        void main() {

        // Adjust the normal
        vec3 normal = normalize(vNormal);
        if(!gl_FrontFacing) {
            normal *= -1.0;
        }
        
        // Add the stripes 
        float stripes = mod((vPosition.y - uTime * 0.02) * 20.0, 1.0);
        stripes = pow(stripes, 3.0);

        // Add the Fresnel effect 
        // Formula for the fresnel effect 
        // 1) Get the normal vector and the view direction
        vec3 viewDirection = normalize(vPosition - cameraPosition);
        // Calculate the dot product of the normal and the view direction
        float fresnel = dot(viewDirection, normal) + 1.0;
        // Add 1 to the dot product 
        fresnel = pow(fresnel, 2.0);
        // Reaise the result to a power

        // Adjust the falloff 
        float falloff = smoothstep(0.8, 0.0, fresnel);

        // Add the holographic effect 
        float holographic = stripes * fresnel;
        holographic += fresnel * 1.25;
        holographic *= falloff;

        gl_FragColor = vec4(uColor, holographic);
        
        }`
    )
    extend({ HolographicMaterial })
    const ref = useRef()


    useFrame((state, delta) => {
        // time
        ref.current.uTime += delta
        // color
        ref.current.uniforms.uColor.value.set(config.color)
        // console.log(ref.current)
        // console.log(ref.current.uColor.value)
    })
    return (
        <holographicMaterial
            ref={ref}
        />
    )
}


