import { Center, MeshDistortMaterial } from '@react-three/drei'
import type { Ref } from 'react'
import type { Mesh } from 'three'
import Grass from '../models/Grass'
import Tree from '../models/Tree'

interface WaterProps {
  ref?: Ref<Mesh>
  radius?: number
}

export default function Water({ ref, radius = 1 }: WaterProps) {
  return (
    <>
      <Tree scale={0.5} position={[1, 0, -4]} />

      {Array.from({ length: 50 }).map((_, index) => {
        const r = radius + 0.5 + Math.random() * 2
        const angle = Math.random() * Math.PI * 2
        const x = r * Math.cos(angle)
        const z = r * Math.sin(angle)
        const rotationY = Math.random() * Math.PI * 2

        return (
          <Center key={`grass-${index}`} scale={0.001} position={[x, 0.17, z]} rotation-y={rotationY}>
            <Grass />
          </Center>
        )
      })}

      <mesh receiveShadow rotation-x={-Math.PI * 0.5}>
        <circleGeometry args={[radius + 3]} />
        <meshStandardMaterial transparent opacity={0.5} color="limegreen" />
      </mesh>
      <mesh ref={ref} receiveShadow scale={[radius, 0.1, radius]}>
        <cylinderGeometry args={[0.8, 1, 1]} />
        <MeshDistortMaterial color="dodgerblue" transmission={0.8} roughness={0.3} />
      </mesh>
    </>
  )
}
