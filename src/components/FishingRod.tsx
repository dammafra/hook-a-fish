import { RapierRigidBody, RigidBody } from '@react-three/rapier'
import { useRef } from 'react'
import Rope from './Rope'

export default function FishingRod() {
  const body1 = useRef<RapierRigidBody>(null!)
  const body2 = useRef<RapierRigidBody>(null!)

  return (
    <>
      <RigidBody ref={body1} type="fixed" position={[0.75, 2, -0.75]} rotation-y={Math.PI * 0.25}>
        <mesh scale={[2, 0.1, 0.1]} castShadow>
          <boxGeometry />
          <meshStandardMaterial color="red" />
        </mesh>
      </RigidBody>

      <RigidBody
        ref={body2}
        colliders="ball"
        position={[0, 2, 3]}
        linearDamping={0.5}
        angularDamping={0.5}
      >
        <mesh scale={0.05} castShadow>
          <icosahedronGeometry args={[1, 2]} />
          <meshStandardMaterial color="red" />
        </mesh>
      </RigidBody>

      <Rope start={body1} end={body2} startAnchor={[-0.98, 0, 0]} length={1.5} />
    </>
  )
}
