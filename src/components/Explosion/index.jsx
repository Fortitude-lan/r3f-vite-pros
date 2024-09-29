import { useAnimations, useGLTF, useScroll } from '@react-three/drei'
import React, { useRef, useEffect } from 'react'
import { useMotionValue, useSpring } from 'framer-motion'
import { useFrame } from '@react-three/fiber'
import { MathUtils } from 'three'
const Explosion = () => {
    const { nodes, animations, scene } = useGLTF('models/cube-explosion.glb')
    const { actions, clips } = useAnimations(animations, scene)
    const groupRef = useRef()

    const scroll = useScroll()
    const motionVal = useMotionValue(0)
    const spring = useSpring(motionVal, { stiffness: 20 })
    useEffect(() => {
        console.log(actions)
        actions["Action.042"].play().paused = true
    }, [])
    useFrame((state, delta) => {
        // console.log(groupRef.current.rotation.x)
        groupRef.current.rotateY(MathUtils.degToRad(0.2))
        //  爆炸
        Object.keys(actions).forEach((name) => {
            console.log(name)
            const act = actions[name]
            act.play().paused = true;
            act.time = spring.get()
        })
        // 42号碎片 
        actions["Action.042"].time = actions["Action.042"].getClip().duration * scroll.offset / 4
    })
    return (
        <group
            onPointerUp={() => { motionVal.set(0) }}
            onPointerDown={() => { motionVal.set(0.8) }}
            ref={groupRef} scale={5}>
            <ambientLight intensity={1} />
            <directionalLight position={[10, 10, 10]} intensity={4} />
            <primitive object={scene} />
        </group>
    )
}

export default Explosion
useGLTF.preload('models/cube-explosion.glb')
