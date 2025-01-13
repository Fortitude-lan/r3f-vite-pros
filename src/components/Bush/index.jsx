import { Instance, Instances, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
// import * as THREE from 'three'
import * as THREE from 'three/webgpu'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { positionLocal, positionWorld, texture, mix, sin, time, mul, vec3 } from 'three/tsl'
const PLANE_COUNT = 500
const BRUSH_COUNT = 50
const Bush = () => {
  const alphaMap = useTexture('/textures/alphaMap/brush.png')
  const matcap = useTexture('/textures/matcaps/bush2.png')
  matcap.colorSpace = THREE.SRGBColorSpace

  const { geometries } = useMemo(() => {
    const planes = []
    for (let i = 0; i < PLANE_COUNT; i++) {
      const plane = new THREE.PlaneGeometry(1, 1)
      planes.push(plane)

      const spherial = new THREE.Spherical(
        (1 - Math.pow(Math.random(), 3)) * 2,
        (Math.PI / 2) * Math.random(),
        Math.PI * Math.random() * 2,
      )

      const position = new THREE.Vector3().setFromSpherical(spherial)
      plane.rotateX(Math.random() * 9999)
      plane.rotateY(Math.random() * 9999)
      plane.rotateZ(Math.random() * 9999)
      plane.translate(position.x, position.y, position.z)

      // Normal
      const normal = position.clone().normalize()
      const normalArray = new Float32Array(12)
      for (let i = 0; i < 4; i++) {
        const i3 = i * 3
        const position = new THREE.Vector3(
          plane.attributes.position.array[i3],
          plane.attributes.position.array[i3 + 1],
          plane.attributes.position.array[i3 + 2],
        )

        const mixedNormal = position.lerp(normal, 0.4)
        normalArray[i3] = mixedNormal.x
        normalArray[i3 + 1] = mixedNormal.y
        normalArray[i3 + 2] = mixedNormal.z
      }

      plane.setAttribute('normal', new THREE.BufferAttribute(normalArray, 3))
    }

    const geometries = mergeGeometries(planes)

    return {
      geometries,
    }
  }, [])

  const instanceMeshRef = useRef(null)
  const perlinTexture = useTexture('/textures/perlin.png')
  const uniforms = useMemo(
    () => ({
      uTime: {
        value: 0,
      },
      uNoise: {
        value: perlinTexture,
      },
    }),
    [],
  )

  useEffect(() => {
    if (instanceMeshRef.current) {
      // const perlinUv = positionWorld.xz.mul(0.2).add(time.mul(0.5))
      // const perlinColor = texture(perlinTexture, perlinUv).sub(0.5).mul(positionWorld.y)
      // console.log(instanceMeshRef.current.material)
      // instanceMeshRef.current.material.positionNode = positionLocal.add(vec3(perlinColor.r, 0, perlinColor.r))

      // instanceMeshRef.current.material.onBeforeCompile = (shader) => {
      //   shader.vertexShader = shader.vertexShader.replace(
      //     '#include <common>',
      //     `
      //     uniform sampler2D uNoise;
      //     uniform float uTime;
      //     varying vec3 vPositionWorld; 
      //     varying vec3 vPositionLocal; 
      //     #include <common>
      //     `,
      //   )
      //   shader.vertexShader = shader.vertexShader.replace(
      //     '#include <begin_vertex>',
      //     `
      //     #include <begin_vertex>
      //     // Compute world position
      //     vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      //     vPositionWorld = worldPosition.xyz;
      //     vPositionLocal = position;

      //     // Compute Perlin noise-based wind effect
      //     float interpolatedTime = sin(uTime) * 0.6;
      //     vec2 perlinUv = vPositionWorld.xz * 0.2 + interpolatedTime;
      //     vec3 perlinColor = texture2D(uNoise, perlinUv).rgb - vec3(0.5);

      //     float windEffect = 0.0;
      //     if (vPositionWorld.y >= -0.5) {
      //         windEffect = perlinColor.r * vPositionWorld.y;
      //     }

      //     // Final position
      //     transformed.xz += vec2(windEffect);
      //   `,
      //   )
      //   shader.uniforms.uNoise = uniforms.uNoise
      //   shader.uniforms.uTime = uniforms.uTime
      // }

      // TSL 暂时不行
      // if (instanceMeshRef) {
      // }
    }
    if (instanceMeshRef.current) {
      const currentTime = time.mul(0.5)
      const perlinUv = positionWorld.xz.mul(0.2).add(sin(currentTime).mul(0.5))
      const perlinColor = texture(perlinTexture, perlinUv).sub(0.5).mul(positionWorld.y)
      instanceMeshRef.current.material.positionNode = positionLocal.add(vec3(perlinColor.r, 0, perlinColor.r))
    }
  }, [instanceMeshRef])

  const material = new THREE.MeshBasicNodeMaterial()
  useEffect(() => {
    const red = vec3(1, 0, 0)
    const blue = vec3(0, 0, 1)
    const currentTime = time.mul(0.5)
    material.colorNode = mix(red, blue, sin(currentTime))
    material.positionNode = positionLocal.add(vec3(0, sin(currentTime).mul(0.2), 0))
  }, [material])
  return (
    <>
      <mesh>
        <boxGeometry />
        <primitive attach="material" object={material} />
      </mesh>
      <Instances
        material={
          new THREE.MeshMatcapNodeMaterial({
            matcap,
            alphaMap,
            transparent: true,
            depthWrite: true,
            blending: THREE.NormalBlending,
            alphaTest: 0.5,
            color: new THREE.Color().setHex(0xffffff),
          })
        }
        geometry={geometries}
        ref={instanceMeshRef}
      >
        {Array.from(Array(BRUSH_COUNT)).map((i, index) => (
          <Instance key={index} position={[(Math.random() * 2 - 1) * 10 - 1, 2, (Math.random() * 2 - 1) * 10]} />
        ))}
      </Instances>
    </>
  )
}

export default Bush