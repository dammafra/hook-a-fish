import { RapierRigidBody, RigidBody } from '@react-three/rapier'
import { useRef } from 'react'
import Rope from './Rope'

export default function FishingRod({ }) {
  const body1 = useRef<RapierRigidBody>(null!)
  const body2 = useRef<RapierRigidBody>(null!)

  return (
    <>
      <RigidBody ref={body1} type="fixed" position={[1, 2, 0]}>
        <mesh scale={[2, 0.1, 0.1]} castShadow>
          <boxGeometry />
          <meshStandardMaterial color="red" />
        </mesh>
      </RigidBody>

      <RigidBody ref={body2} colliders="ball" position={[0, 2, 2]}>
        <mesh scale={0.1} castShadow>
          <sphereGeometry />
          <meshStandardMaterial color="red" />
        </mesh>
      </RigidBody>

      <Rope from={body1} to={body2} fromAnchor={[-1, 0, 0]} length={1} />
    </>
  )
}
