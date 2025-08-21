import { Center } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { RapierRigidBody, RigidBody } from '@react-three/rapier'
import { useMemo, useRef, type RefObject } from 'react'
import { Object3D, Quaternion, Vector3, type ColorRepresentation } from 'three'
import { parsePosition, type Position } from '../utils/position'
import { parseRotation, type Rotation } from '../utils/rotation'
import FishingHook from './models/FishingHook'
import FishingPole from './models/FishingPole'
import Rope from './Rope'
import { BOUNDS_COLLISION_GROUP } from './Water'

interface FishingRodProps {
  ref?: RefObject<Object3D>
  position?: Position
  rotation?: Rotation
  ropeLength?: number
  ropeRadius?: number
  colorA?: ColorRepresentation
  colorB?: ColorRepresentation
  onHook?: (position: Vector3) => void
}

export default function FishingRod({
  ref,
  position = 0,
  rotation = 0,
  ropeLength = 1.5,
  ropeRadius = 0.005,
  colorA,
  colorB,
  onHook,
}: FishingRodProps) {
  const _position = useMemo(() => parsePosition(position), [position])
  const _rotation = useMemo(() => parseRotation(rotation), [rotation])

  const poleBody = useRef<RapierRigidBody>(null!)
  const hookBody = useRef<RapierRigidBody>(null!)

  useFrame(() => {
    if (!ref?.current) return

    const position = new Vector3()
    ref.current.getWorldPosition(position)
    poleBody.current.setTranslation(position, false)

    const rotation = ref.current.rotation.clone()
    poleBody.current.setRotation(new Quaternion().setFromEuler(rotation), false)
  })

  return (
    <>
      <group ref={ref} position={_position} rotation={_rotation}>
        <RigidBody ref={poleBody} type="kinematicPosition" />
        <Center
          scale={0.01}
          position={[0, -0.06, -0.05]}
          rotation={[-Math.PI * 0.5, Math.PI * 0.094, 0]}
        >
          <FishingPole colorA={colorA} colorB={colorB} />
        </Center>
      </group>

      <RigidBody
        userData={{ name: 'hook' }}
        ref={hookBody}
        colliders="ball"
        position={_position}
        gravityScale={5}
        linearDamping={2}
        angularDamping={8}
        canSleep={false}
        collisionGroups={BOUNDS_COLLISION_GROUP}
        onCollisionEnter={({ target }) => {
          if (!onHook) return
          const translation = target.rigidBody?.translation()
          const position = new Vector3().fromArray(Object.values(translation || []))
          onHook(position)
        }}
      >
        <group>
          <mesh scale={0.04} position-y={0.1}>
            <icosahedronGeometry args={[1, 2]} />
            <meshStandardMaterial color="darkred" />
          </mesh>
          <Center scale={0.001} position={[0.003, 0, -0.001]}>
            <FishingHook />
          </Center>
        </group>
      </RigidBody>

      <Rope
        start={poleBody}
        end={hookBody}
        startAnchor={[0, 1, 0]}
        endAnchor={[0, 0.1, 0]}
        length={ropeLength}
        radius={ropeRadius}
      />
    </>
  )
}
