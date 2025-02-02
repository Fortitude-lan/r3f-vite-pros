import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
// import grassShader from './shaders/grass.jsx';

const PLANE_SIZE = 30;
const BLADE_COUNT = 100000;
const BLADE_WIDTH = 0.1;
const BLADE_HEIGHT = 0.8;
const BLADE_HEIGHT_VARIATION = 0.6;

function Grass2() {
  const meshRef = useRef();
  const grassTexture = useTexture('/textures/grass.jpg');
  const cloudTexture = useTexture('/textures/cloud.jpg');
  cloudTexture.wrapS = cloudTexture.wrapT = THREE.RepeatWrapping;

  useEffect(() => {
    cloudTexture.wrapS = cloudTexture.wrapT = THREE.RepeatWrapping;

    const timeUniform = { value: 0.0 };
    const grassUniforms = {
      textures: { value: [grassTexture, cloudTexture] },
      iTime: timeUniform,
    };

    const grassMaterial = new THREE.ShaderMaterial({
      uniforms: grassUniforms,
      vertexShader: /*glsl*/`
      varying vec2 vUv;
      varying vec2 cloudUV;
      
      varying vec3 vColor;
      uniform float iTime;
      
      void main() {
        vUv = uv;
        cloudUV = uv;
        vColor = color;
        vec3 cpos = position;
      
        float waveSize = 10.0f;
        float tipDistance = 0.3f;
        float centerDistance = 0.1f;
      
        if (color.x > 0.6f) {
          cpos.x += sin((iTime / 500.) + (uv.x * waveSize)) * tipDistance;
        }else if (color.x > 0.0f) {
          cpos.x += sin((iTime / 500.) + (uv.x * waveSize)) * centerDistance;
        }
      
        float diff = position.x - cpos.x;
        cloudUV.x += iTime / 20000.;
        cloudUV.y += iTime / 10000.;
      
        vec4 worldPosition = vec4(cpos, 1.);
        vec4 mvPosition = projectionMatrix * modelViewMatrix * vec4(cpos, 1.0);
        gl_Position = mvPosition;
      }
      `,
      fragmentShader: /*glsl*/`uniform sampler2D texture1;
      uniform sampler2D textures[4];
      
      varying vec2 vUv;
      varying vec2 cloudUV;
      varying vec3 vColor;
      
      void main() {
        float contrast = 1.5;
        float brightness = 0.1;
        vec3 color = texture2D(textures[0], vUv).rgb * contrast;
        color = color + vec3(brightness, brightness, brightness);
        color = mix(color, texture2D(textures[1], cloudUV).rgb, 0.4);
        gl_FragColor.rgb = color;
        gl_FragColor.a = 1.;
      }
      `,
      vertexColors: true,
      side: THREE.DoubleSide,
    });

    const generateField = () => {
      const positions = [];
      const uvs = [];
      const indices = [];
      const colors = [];

      for (let i = 0; i < BLADE_COUNT; i++) {
        const VERTEX_COUNT = 5;
        const surfaceMin = PLANE_SIZE / 2 * -1;
        const surfaceMax = PLANE_SIZE / 2;
        const radius = PLANE_SIZE / 2;

        const r = radius * Math.sqrt(Math.random());
        const theta = Math.random() * 2 * Math.PI;
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);

        const pos = new THREE.Vector3(x, 0, y);

        const uv = [convertRange(pos.x, surfaceMin, surfaceMax, 0, 1), convertRange(pos.z, surfaceMin, surfaceMax, 0, 1)];

        const blade = generateBlade(pos, i * VERTEX_COUNT, uv);
        blade.verts.forEach(vert => {
          positions.push(...vert.pos);
          uvs.push(...vert.uv);
          colors.push(...vert.color);
        });
        blade.indices.forEach(indice => indices.push(indice));
      }

      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
      geom.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
      geom.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
      geom.setIndex(indices);
      // geom.computeVertexNormals();
      // geom.computeFaceNormals();

      return geom;
    };

    meshRef.current.geometry = generateField();
    meshRef.current.material = grassMaterial;
  }, []);

  useFrame(({ clock }) => {
    console.log(meshRef.current, clock.getElapsedTime())
    if (meshRef.current)
      meshRef.current.material.uniforms.iTime.value = clock.getElapsedTime()
  });

  return <group><mesh ref={meshRef} /></group>;

}

function convertRange(val, oldMin, oldMax, newMin, newMax) {
  return (((val - oldMin) * (newMax - newMin)) / (oldMax - oldMin)) + newMin;
}

function generateBlade(center, vArrOffset, uv) {
  const MID_WIDTH = BLADE_WIDTH * 0.5;
  const TIP_OFFSET = 0.1;
  const height = BLADE_HEIGHT + (Math.random() * BLADE_HEIGHT_VARIATION);

  const yaw = Math.random() * Math.PI * 2;
  const yawUnitVec = new THREE.Vector3(Math.sin(yaw), 0, -Math.cos(yaw));
  const tipBend = Math.random() * Math.PI * 2;
  const tipBendUnitVec = new THREE.Vector3(Math.sin(tipBend), 0, -Math.cos(tipBend));

  // Find the Bottom Left, Bottom Right, Top Left, Top right, Top Center vertex positions
  const bl = new THREE.Vector3().addVectors(center, new THREE.Vector3().copy(yawUnitVec).multiplyScalar((BLADE_WIDTH / 2) * 1));
  const br = new THREE.Vector3().addVectors(center, new THREE.Vector3().copy(yawUnitVec).multiplyScalar((BLADE_WIDTH / 2) * -1));
  const tl = new THREE.Vector3().addVectors(center, new THREE.Vector3().copy(yawUnitVec).multiplyScalar((MID_WIDTH / 2) * 1));
  const tr = new THREE.Vector3().addVectors(center, new THREE.Vector3().copy(yawUnitVec).multiplyScalar((MID_WIDTH / 2) * -1));
  const tc = new THREE.Vector3().addVectors(center, new THREE.Vector3().copy(tipBendUnitVec).multiplyScalar(TIP_OFFSET));

  tl.y += height / 2;
  tr.y += height / 2;
  tc.y += height;

  // Vertex Colors
  const black = [0, 0, 0];
  const gray = [0.5, 0.5, 0.5];
  const white = [1.0, 1.0, 1.0];

  const verts = [
    { pos: bl.toArray(), uv: uv, color: black },
    { pos: br.toArray(), uv: uv, color: black },
    { pos: tr.toArray(), uv: uv, color: gray },
    { pos: tl.toArray(), uv: uv, color: gray },
    { pos: tc.toArray(), uv: uv, color: white }
  ];

  const indices = [
    vArrOffset,
    vArrOffset + 1,
    vArrOffset + 2,
    vArrOffset + 2,
    vArrOffset + 4,
    vArrOffset + 3,
    vArrOffset + 3,
    vArrOffset,
    vArrOffset + 2
  ];

  return { verts, indices };
}

export default Grass2;
