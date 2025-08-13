import { MeshDistortMaterial } from '@react-three/drei'

interface WaterProps {
  radius?: number
}

export default function Water({ radius = 1 }: WaterProps) {
  return (
    <mesh receiveShadow scale={[radius, 0.1, radius]}>
      <cylinderGeometry />
      <MeshDistortMaterial color="dodgerblue" />
    </mesh>
  )
}
