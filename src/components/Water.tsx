import { MeshDistortMaterial } from '@react-three/drei'
import type { Ref } from 'react'
import type { Mesh } from 'three'

interface WaterProps {
  ref?: Ref<Mesh>
  radius?: number
}

export default function Water({ ref, radius = 1 }: WaterProps) {
  return (
    <mesh ref={ref} receiveShadow scale={[radius, 0.1, radius]}>
      <cylinderGeometry />
      <MeshDistortMaterial color="dodgerblue" />
    </mesh>
  )
}
