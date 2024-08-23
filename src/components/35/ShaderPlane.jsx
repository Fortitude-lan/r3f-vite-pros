/*
 * @Descripttion: 
 * @version: Chevalier
 * @Author: 
 * @Date: 2024-08-15 15:36:06
 * @LastEditors: Chevalier
 * @LastEditTime: 2024-08-17 11:21:39
 */
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";

const MyShaderMaterial = shaderMaterial(
  {},
  /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`,
  /* glsl */ `
  varying vec2 vUv;
  void main() {
    
    // gl_FragColor = vec4(vUv, 0.5, 1.0); //渐变

    // 1. 上黑下白渐变[1.0 - vUv.y]  上白下黑渐变[vUv.y]
    // float strength = 1.0 - vUv.y;

    //2. 条纹渐变
    // float strength = mod(vUv.y *5.0,1.0);

    // 3. 条纹间隔黑白
    // float strength = mod(vUv.y *5.0,1.0);
    // //strength = strength<0.5?0.0:1.0;
    // strength = step(0.5,strength);
    
    // 4.网格
    // float strength = step(0.8,mod(vUv.x *10.0,1.0));
    // strength += step(0.8,mod(vUv.y *10.0,1.0));

    // 5.点阵
    float strength = step(0.8,mod(vUv.x *10.0,1.0));
    strength *= step(0.8,mod(vUv.y *10.0,1.0));

    

    gl_FragColor = vec4(strength,strength,strength, 1.0);

  }
  `
);
extend({ MyShaderMaterial })
export const ShaderPlane = ({ ...props }) => {

  return (
    <mesh {...props}>
      <planeGeometry args={[1, 1]} />
      {/* <meshBasicMaterial color={"black"} /> */}
      <myShaderMaterial />
    </mesh>
  );
};
