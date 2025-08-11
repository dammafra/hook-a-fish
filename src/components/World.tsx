import { RigidBody, useRapier } from '@react-three/rapier'
import { button, useControls } from 'leva'
import FishingRod from './FishingRod'

export default function World() {
  const { step } = useRapier()
  useControls('physics', { step: button(() => step(1 / 60)) })

  return (
    <>
      <FishingRod />

      <RigidBody type="fixed">
        <mesh receiveShadow scale={[5, 0.1, 5]}>
          <boxGeometry />
          <meshStandardMaterial color="limegreen" />
        </mesh>
      </RigidBody>
    </>
  )
}
