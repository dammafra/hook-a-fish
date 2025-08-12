import { MeshDistortMaterial } from '@react-three/drei'
import { RigidBody, useRapier } from '@react-three/rapier'
import { button, useControls } from 'leva'
import FishingRod from './FishingRod'

export default function World() {
  const { step } = useRapier()
  useControls('physics', { step: button(() => step(1 / 60)) })

  return (
    <>
      <FishingRod position={0} color="red" />
      <FishingRod position={120} color="orange" />
      <FishingRod position={240} color="limegreen" />

      <RigidBody type="fixed" colliders="hull" mass={100}>
        <mesh receiveShadow scale={[2, 0.1, 2]}>
          <cylinderGeometry />
          <MeshDistortMaterial color="dodgerblue" />
        </mesh>
      </RigidBody>
    </>
  )
}
