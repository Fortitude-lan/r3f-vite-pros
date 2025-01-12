/*
 * @Descripttion: 
 * @version: Antares
 * @Author: 
 * @Date: 2024-07-04 09:55:23
 * @LastEditors: Hesin
 * @LastEditTime: 2025-01-12 13:53:10
 */
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ScrollControls, Stage, useTexture } from "@react-three/drei";
import { Leva, useControls } from "leva";
import { Suspense } from "react";
import LoadingScreen from "./LoadingScreen";

import { Scene } from "./components/22/Scene";
// import WaterShader from "./components/28/WaterShader";
import { Experience } from "./components/35/Experience";
// import ChristmasCard from "./components/sdhk/ChristmasCard";
import Holo from "./components/Hologram";
import Dissolve from "./components/Dissolve";
import Grass from "./components/Grass/Grass";
import Grass2 from "./components/Grass2";
import Bush from "./components/Bush";
import Explosion from "./components/Explosion";
import WaterFall from "./components/28/WaterFall";
import Wind from "./components/Wind/Wind";
import Fire from "./components/Fire/Fire";
import ExplodingBall from "./components/ExplodeBall";
import Plant from "./components/Plant";
import { Flame } from "./components/Flame";

function App() {
  const statueBtns = useControls('Basic', {
    waterComp: false,
    grass: false,
    ballScene: false,
    hologram: false,
    shaderDemo: false,
    wind: false,
    bgColor: "#292929"
  })


  return (
    <>
      {/* 1.加载 */}
      <LoadingScreen />
      {/* 2.控制板 */}
      <Leva collapsed />
      {/* 3.Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 0, 5], fov: 75, near: 0.1, far: 1000 }}
        gl={{ antialias: true }}
        dpr={[1, 1.5]}
      >
        <OrbitControls enableDamping />
        <color attach="background" args={[statueBtns.bgColor]} />
        <Suspense fallback={null}>

          {/* Stage 聚光阴影 调用墙外hrd文件 */}
          {/* <Stage> */}
          {/* 随机球场景 */}
          {statueBtns.ballScene && <Scene />}

          {/* <DissolveEffect /> */}
          {/* {statueBtns.waterComp && <WaterShader />} */}

          {/* shader  学习*/}
          {statueBtns.shaderDemo && <Experience />}

          {/* threejs案例引入 */}
          {/* <ChristmasCard/> */}
          {/* </Stage> */}

          {/* 全息图 */}
          {statueBtns.hologram && <Holo />}
          {/* 溶解效果 */}
          {/* <Dissolve /> */}

          {/* 草地shader */}
          {/* <Grass /> */}
          {/* <Grass2 /> */}
          <Bush />
          {/* 爆炸碎片 */}
          {/* <ScrollControls damping={0.5} pages={3}>
            <Explosion />
          </ScrollControls> */}

          {/* 瀑布 */}
          {/* <WaterFall /> */}

          {/* 风 */}

          {statueBtns.wind && <Wind />}

          {/* 火 */}
          {/* <Fire/> */}
          {/* <ExplodingBall /> */}
          {/* 火焰 */}
          {/* <Flame /> */}
          {/* 平面测试 */}
          {/* <Plant/> */}
        </Suspense>
      </Canvas >
    </>
  );
}
export default App;
