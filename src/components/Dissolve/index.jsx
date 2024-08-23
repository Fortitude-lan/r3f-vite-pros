import React from 'react'
import { Bloom, EffectComposer } from "@react-three/postprocessing";
// import { SRGBColorSpace } from "three";
import DissolveShader from './DissolveShader';
export default function index() {
    return (
        <>
            <DissolveShader />
            <EffectComposer>
                <Bloom
                    luminanceThreshold={1}
                    intensity={1}
                    mipmapBlur
                />
            </EffectComposer>
        </>
    )
}
