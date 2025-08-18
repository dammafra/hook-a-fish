import { Center } from '@react-three/drei'
import { RapierRigidBody, RigidBody } from '@react-three/rapier'
import { useRef, useState } from 'react'
import { Object3D, Quaternion } from 'three'
import { useIsTouch } from '../hooks/use-is-touch'
import FishingHook from '../models/FishingHook'
import FishingPole from '../models/FishingPole'
import { parsePosition, type Position } from '../utils/position'
import { parseRotation, type Rotation } from '../utils/rotation'
import PointerControls from './PointerControls'
import Rope from './Rope'
import { BOUNDS_COLLISION_GROUP } from './Water'

interface FishingRodProps {
  position?: Position
  rotation?: Rotation
  ropeLength?: number
  ropeRadius?: number
}

export default function FishingRod({
  position = 0,
  rotation = [0, 0, Math.PI * 0.35],
  ropeLength = 1.5,
  ropeRadius = 0.005,
}: FishingRodProps) {
  const isTouch = useIsTouch()
  const [_position] = useState(() => parsePosition(position))
  const [_rotation] = useState(() => parseRotation(rotation))

  const poleBody = useRef<RapierRigidBody>(null!)
  const hookBody = useRef<RapierRigidBody>(null!)

  const poleMesh = useRef<Object3D>(null!)
  const hookMesh = useRef<Object3D>(null!)

  const onMove = () => {
    const { position, rotation } = poleMesh.current
    poleBody.current.setNextKinematicTranslation(position)
    poleBody.current.setNextKinematicRotation(new Quaternion().setFromEuler(rotation))
  }

  return (
    <>
      <group ref={poleMesh} position={_position} rotation={_rotation}>
        <RigidBody ref={poleBody} type="kinematicPosition" />
        <Center
          scale={0.01}
          position={[0, -0.06, -0.05]}
          rotation={[-Math.PI * 0.5, Math.PI * 0.094, 0]}
        >
          <FishingPole />
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
      >
        <Center scale={0.001} position={[0.003, 0, -0.001]}>
          <FishingHook ref={hookMesh} />
        </Center>
      </RigidBody>

      <Rope
        start={poleBody}
        end={hookBody}
        startAnchor={[0, 1, 0]}
        endAnchor={[0, 0.1, 0]}
        length={ropeLength}
        radius={ropeRadius}
      />

      {/* TODO improve lockPositionYAt value */}
      <PointerControls
        type="billboard"
        hideCursor
        targetRef={poleMesh}
        lockPositionYAt={1.5}
        onMove={onMove}
        offset={isTouch ? [0, 0, -2] : 0}
      />
    </>
  )
}
