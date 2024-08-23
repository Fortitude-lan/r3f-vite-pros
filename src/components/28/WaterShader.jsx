import React, { useRef } from "react";
import { useControls } from "leva";
import { extend, useFrame } from "@react-three/fiber";
import { shaderMaterial, useFBO } from "@react-three/drei";//创建自定义着色器材质和渲染目标。
import { resolveLygia } from "resolve-lygia"; //着色器库
import {
  Color,
  FloatType,
  MeshDepthMaterial,
  NoBlending,
  RGBADepthPacking,
} from "three";

//MeshDepthMaterial 用于渲染深度信息
//depthPacking 设置为 RGBADepthPacking 以确保深度数据被正确打包
const depthMaterial = new MeshDepthMaterial();
depthMaterial.depthPacking = RGBADepthPacking;
depthMaterial.blending = NoBlending;

export default function WaterShader() {
  const waterMaterialRef = useRef();
  const {
    waterColor,
    waterOpacity,
    speed,
    noiseType,
    foam,
    foamTop,
    repeat,
    maxDepth,
  } = useControls("waterComp",{
    waterOpacity: { value: 0.8, min: 0, max: 1 },
    waterColor: "#00c3ff",
    speed: { value: 0.5, min: 0, max: 5 },
    repeat: {
      value: 30,
      min: 1,
      max: 100,
    },
    foam: {
      value: 0.4,
      min: 0,
      max: 1,
    },
    foamTop: {
      value: 0.7,
      min: 0,
      max: 1,
    },
    noiseType: {
      value: 0,
      options: {
        Perlin: 0,
        Voronoi: 1,
      },
    },
    maxDepth: { value: 2, min: 0, max: 5 },
  });

  const renderTarget = useFBO({
    depth: true,
    type: FloatType,
  });

  const waterRef = useRef();

  useFrame(({ gl, scene, camera, clock }) => {
    // We hide the water mesh and render the scene to the render target
    // waterRef.current.visible = false;
    // gl.setRenderTarget(renderTarget);
    // scene.overrideMaterial = depthMaterial;
    // gl.render(scene, camera);

    // We reset the scene and show the water mesh
    // scene.overrideMaterial = null;
    // waterRef.current.visible = true;
    // gl.setRenderTarget(null);

    // We set the uniforms
    if (waterMaterialRef.current) {
      waterMaterialRef.current.uniforms.uTime.value = clock.getElapsedTime();
      waterMaterialRef.current.uniforms.uDepth.value = renderTarget.texture;
      const pixelRatio = gl.getPixelRatio();
      waterMaterialRef.current.uniforms.uResolution.value = [
        window.innerWidth * pixelRatio,
        window.innerHeight * pixelRatio,
      ];
      // waterMaterialRef.current.uniforms.uCameraNear.value = camera.near;
      // waterMaterialRef.current.uniforms.uCameraFar.value = camera.far;
    }
  });
  return (
    <>
      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} position-y={-0.1}>
        {/* <planeGeometry args={[1, 3, 2, 2]} /> */}
        <sphereGeometry args={[3,32,16]}/>
        <waterMaterial
          ref={waterMaterialRef}
          uColor={new Color(waterColor)}
          transparent
          uOpacity={waterOpacity}
          uNoiseType={noiseType}
          uSpeed={speed}
          uRepeat={repeat}
          uFoam={foam}
          uFoamTop={foamTop}
          uMaxDepth={maxDepth}
        />
      </mesh>
    </>
  );
}

// **********************************************************
export const WaterMaterial = shaderMaterial(
  {
    uColor: new Color("skyblue"),
    uOpacity: 0.8,
    uTime: 0,
    uSpeed: 0.5,
    uRepeat: 20.0,
    uNoiseType: 0,
    uFoam: 0.4,
    uFoamTop: 0.7,
    uDepth: null,
    uMaxDepth: 1.0,
    uResolution: [0, 0],
    uCameraNear: 0,
    uCameraFar: 0,
  },
  /*glsl*/ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`,
  resolveLygia(/*glsl*/ ` 
    #include "lygia/generative/pnoise.glsl"
    #include "lygia/generative/voronoise.glsl"
    varying vec2 vUv;
    uniform vec3 uColor;
    uniform float uOpacity;
    uniform float uTime;
    uniform float uSpeed;
    uniform float uRepeat;
    uniform int uNoiseType;
    uniform float uFoam;
    uniform float uFoamTop;
    uniform sampler2D uDepth;
    uniform float uMaxDepth;
    uniform vec2 uResolution;
    uniform float uCameraNear;
    uniform float uCameraFar;

    #include <packing>

    float getViewZ(const in float depth) {
      return perspectiveDepthToViewZ(depth, uCameraNear, uCameraFar);
    }

    float getDepth(const in vec2 screenPosition ) {
      return unpackRGBAToDepth(texture2D(uDepth, screenPosition));
    }

    void main() {
      float adjustedTime = uTime * uSpeed;

      // NOISE GENERATION
      float noise = 0.0;
      if (uNoiseType == 0) {
        noise = pnoise(vec3(vUv * uRepeat, adjustedTime * 0.5), vec3(100.0, 24.0, 112.0));
      } else if (uNoiseType == 1) {
        vec2 p = 0.5 - 0.5*cos(adjustedTime *vec2(1.0,0.5));
        p = p*p*(3.0-2.0*p);
        p = p*p*(3.0-2.0*p);
        p = p*p*(3.0-2.0*p);
        noise = voronoise(vec3(vUv * uRepeat, adjustedTime), p.x, 1.0);
      }

      // DEPTH
      vec2 screenUV = gl_FragCoord.xy / uResolution;
      float fragmentLinearEyeDepth = getViewZ(gl_FragCoord.z);
      float linearEyeDepth = getViewZ(getDepth(screenUV));

      float depth = fragmentLinearEyeDepth - linearEyeDepth;
      noise += smoothstep(uMaxDepth, 0.0, depth);

      // FOAM
      noise = smoothstep(uFoam, uFoamTop, noise);
      
      //  COLOR 
      vec3 intermediateColor = uColor * 1.8;
      vec3 topColor = intermediateColor * 2.0;
      vec3 finalColor = uColor;
      finalColor = mix(uColor, intermediateColor, step(0.01, noise));
      finalColor = mix(finalColor, topColor, step(1.0, noise));

      // if (depth > uMaxDepth) {
      //   finalColor = vec3(1.0, 0.0, 0.0);
      // } else {
      //   finalColor = vec3(depth);
      // }

      gl_FragColor = vec4(finalColor, uOpacity);
      #include <tonemapping_fragment>
      #include <encodings_fragment>
    }`)
);  

extend({ WaterMaterial });
