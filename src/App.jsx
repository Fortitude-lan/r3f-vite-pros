/*
 * @Descripttion: 
 * @version: Antares
 * @Author: 
 * @Date: 2024-07-04 09:55:23
 * @LastEditors: Hesin
 * @LastEditTime: 2024-08-23 11:09:25
 */
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage } from "@react-three/drei";
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
function App() {
  const statueBtns = useControls('Basic', {
    waterComp: false,
    ballScene: false,
    hologram: false,
    shaderDemo: false,
    bgColor: "#292929"
  })

  return (
    <>
      {/* 1.加载 */}
      <LoadingScreen />
      {/* 2.控制板 */}
      <Leva collapsed />
      {/* 3.Canvas */}
      <Canvas shadows camera={{ position: [15, 15, 15], fov: 75, near: 0.1, far: 1000 }} >
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
          <Grass />
          {/* <Grass2 /> */}
        </Suspense>
      </Canvas>
    </>
  );
}

export default App;
