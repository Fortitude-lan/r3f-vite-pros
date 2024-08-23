import { useRef } from "react"
import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useControls } from "leva"
import BurnMaterial from "./BurnMaterial.jsx"

export default function DissolveShader(props) {
    // import model
    const { nodes } = useGLTF('/models/Monkey.glb')

    // controls
    const { progress, scale, offset, color, burnColor, burnColorEnd, burnWidth } = useControls(
        {
            progress:
            {
                value: 0,
                min: 0,
                max: 1,
                step: 0.001
            },
            scale:
            {
                value: 10,
                min: 5,
                max: 20,
                step: 0.001
            },
            offset:
            {
                value: 3,
                min: 1,
                max: 10,
                step: 0.001
            },
            color:
            {
                value: '#592e83'
            },
            burnColor:
            {
                value: '#ff6600'
            },
            burnColorEnd:
            {
                value: '#ff6600'
            },
            burnWidth:
            {
                value: 1,
                min: 1,
                max: 5,
                step: 0.01
            }
        }
    )

    const monkey = useRef()

    useFrame((state) => {
        console.log(monkey.current.matrixWorld)
        // monkey.current.scale.set()
        // o.scale.setScalar(0.5);
        // monkey.current.updateMatrixWorld();
    })


    return (
        <mesh
            ref={monkey}
            // rotation-y={180 * Math.PI / 180}
            // geometry={nodes.Suzanne.geometry}
            scale={1.5}
        >
            <boxGeometry />
            <BurnMaterial
                objRef={monkey}
                burnProgress={progress}
                baseColor={color}
                burnColor={burnColor}
                burnColorEnd={burnColorEnd}
                burnAmt={scale}
                burnOffset={offset}
                burnWidth={burnWidth}
            />
        </mesh>
    )


}