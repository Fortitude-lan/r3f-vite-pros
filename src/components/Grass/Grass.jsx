import React, { useRef, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sampler, useGLTF, ComputedAttribute, useTexture } from "@react-three/drei";
import * as THREE from "three";
// import Stats from "stats-gl";
import GrassMaterial from "./GrassMaterial";
import { useControls } from "leva";
// import { Sampler, useSurfaceSampler } from './SamplerCom'

export default function Grass() {
    // Fog and Scene Background
    // useEffect(() => {
    //     const fogColor = "#eeeeee";
    //     const fogDensity = 0.02;
    //     scene.background = new THREE.Color(fogColor);
    //     scene.fog = new THREE.FogExp2(fogColor, fogDensity);
    // }, [scene]);

    // Stats Setup
    //   useEffect(() => {
    //     const stats = new Stats();
    //     stats.dom.style.bottom = "45px";
    //     stats.dom.style.top = "auto";
    //     stats.dom.style.left = "auto";
    //     stats.dom.style.display = "none";
    //     document.body.appendChild(stats.dom);
    //     return () => document.body.removeChild(stats.dom);
    //   }, []);


    //草地mesh
    const terrainMeshRef = useRef()
    console.log('terrainRef', terrainMeshRef.current)
    return (
        <>
            <directionalLight
                castShadow
                intensity={2}
                position={[100, 100, 100]}
                shadow-camera-far={200}
                shadow-camera-left={-50}
                shadow-camera-right={50}
                shadow-camera-top={50}
                shadow-camera-bottom={-50}
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
            />
            {/* 草地 */}
            <Terrain tRef={terrainMeshRef} name="color" compute={computeUpness} />
        </>
    );
}

//草地
function Terrain({ tRef, name, compute }) {
    const { nodes: tNodes } = useGLTF("/models/island.glb");
    const { nodes: gNodes } = useGLTF('/models/grassLODs.glb');
    const { nodes: mNodes, materials } = useGLTF('/models/Mountain.glb')
    const [state, setstate] = useState(false)
    const grassNode = gNodes.GrassLOD00;
    if (mNodes) {
        mNodes.Landscape.geometry.scale(2, 2, 2);
        // setstate(!state)
    }
    useEffect(() => {
        if (mNodes) {
            mNodes.Landscape.geometry.scale(2, 2, 2);
            setstate(!state)
        }
    }, [mNodes])


    // Load textures
    const grassAlphaTexture = useTexture('/textures/grass.jpeg');
    const perlinNoiseTexture = useTexture('/textures/perlinnoise.webp');
    //草地颜色控制 
    const { TerrainColor, baseColor, tipColor1, tipColor2 } = useControls({
        TerrainColor: "#5e875e",
        baseColor: "#313f1b",
        tipColor1: "#9bd38d",
        tipColor2: "#1f352a",
    })
    // threejs写法
    // const terrainMat = new THREE.MeshPhongMaterial({ color: "#5e875e" });
    // useEffect(() => {
    //     scene.traverse((child) => {
    //         if (child instanceof THREE.Mesh) {
    //             child.material = terrainMat;
    //             child.receiveShadow = true;
    //             child.geometry.scale(3, 3, 3);
    //         }
    //     });
    // }, [scene]);

    //计算地面
    useEffect(() => {
        console.log(tRef.current.geometry)
        const geometry = tRef.current.geometry
        if (geometry) {
            const attribute = compute(geometry)
            geometry.setAttribute(name, attribute)
        }
    }, [tRef, compute, state])

    //草地数量
    const count = 100;

    useEffect(() => {
        if (grassNode) {
            console.log('+2')
            grassNode.geometry.scale(2, 2, 2);
            console.log(grassNode.geometry);
            // 如果需要存储 geometry，可以在这里处理
        }
    }, [gNodes, state])
    return <>
        <group dispose={null}>
            {/* 山 */}
            {/* <mesh geometry={mNodes.Landscape.geometry} ref={tRef}> */}
            {/* 地 */}
            <mesh geometry={tNodes.Plane.geometry} ref={tRef}>
                <meshPhongMaterial color={TerrainColor} side={THREE.DoubleSide} />
            </mesh>
            {/* 草 */}
            <Sampler mesh={tRef} count={count} weight="color">
                <instancedMesh
                    args={[grassNode.geometry, null, count]}
                    frustumCulled={false}
                    renderOrder={-1000}
                    receiveShadow
                    castShadow
                // rotation={[Math.PI / 2, 0, 0]}
                >
                    {/* <meshToonMaterial color={'#ff3080'} /> */}

                    <GrassMaterial
                        // uTime={0}
                        uEnableShadows={true}
                        uGrassLightIntensity={1}
                        uShadowDarkness={0.5}
                        uNoiseScale={1.5}
                        uPlayerPosition={new THREE.Vector3()}
                        // uBaseColor={new THREE.Color('#313f1b')}
                        // uTipColor1={new THREE.Color('#9bd38d')}
                        // uTipColor2={new THREE.Color('#1f352a')}
                        uBaseColor={new THREE.Color(baseColor)}
                        uTipColor1={new THREE.Color(tipColor1)}
                        uTipColor2={new THREE.Color(tipColor2)}
                        uNoiseTexture={perlinNoiseTexture}
                        uGrassAlphaTexture={grassAlphaTexture} />
                </instancedMesh>
            </Sampler>


            {/* 单独草组件*/}
            {/* <GrassCount tRef={tRef} /> */}
        </group>
        {/* <primitive object={scene} /> */}
    </>;
}
useGLTF.preload('/models/island.glb', '/models/Mountain.glb', '/models/grassLODs.glb')

//抽离的草组件
function GrassCount({ tRef }) {
    const { nodes, Scene } = useGLTF('/models/grassLODs.glb');
    const count = 100;
    console.log(nodes)
    useEffect(() => {
        const grassNode = nodes.GrassLOD00;
        if (grassNode) {
            console.log('+5')
            grassNode.geometry.scale(5, 5, 5);
            console.log(grassNode.geometry);
            // 如果需要存储 geometry，可以在这里处理
        }
    }, [nodes, count])

    // Load textures
    const grassAlphaTexture = useTexture('/textures/grass.jpeg');
    const perlinNoiseTexture = useTexture('/textures/perlinnoise.webp');

    return (
        <>
            <Sampler position={[0, 0, 0]} mesh={tRef} count={count} weight="color">
                <instancedMesh
                    args={[nodes.GrassLOD00.geometry, null, count]}
                    frustumCulled={false}
                    renderOrder={-1000}
                    receiveShadow
                    castShadow
                >
                    {/* <sphereGeometry args={[0.15, 32, 32]} /> */}
                    {/* <meshToonMaterial color={'#ff3080'} /> */}
                    <GrassMaterial
                        uTime={0}
                        uEnableShadows={true}
                        uGrassLightIntensity={1}
                        uShadowDarkness={0.5}
                        uNoiseScale={1.5}
                        uPlayerPosition={new THREE.Vector3()}
                        uBaseColor={new THREE.Color('#313f1b')}
                        uTipColor1={new THREE.Color('#9bd38d')}
                        uTipColor2={new THREE.Color('#1f352a')}
                        uNoiseTexture={perlinNoiseTexture}
                        uGrassAlphaTexture={grassAlphaTexture} />
                </instancedMesh>
            </Sampler>
        </>
    )
}

const remap = (x, [low1, high1], [low2, high2]) => low2 + ((x - low1) * (high2 - low2)) / (high1 - low1)

const computeUpness = (geometry, up = new THREE.Vector3(0, 0, -1), normal = new THREE.Vector3()) => {
    if (!geometry.attributes.normal) {
        geometry.computeVertexNormals() // Ensure normals are computed
    }
    const { array, count } = geometry.attributes.normal

    const ups = Float32Array.from({ length: count }, (_, i) => {
        const dot = normal.fromArray(array.slice(i * 3, i * 3 + 3)).dot(up)
        return Number(dot > 0.4 ? remap(dot, [0.4, 1], [0, 1]) : 0)
    })
    return new THREE.BufferAttribute(ups, 1)
}