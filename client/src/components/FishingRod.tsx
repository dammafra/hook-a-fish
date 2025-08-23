import { Center } from '@react-three/drei'
import { CuboidCollider, RapierRigidBody, RigidBody, type CuboidArgs } from '@react-three/rapier'
import { useImperativeHandle, useMemo, useRef, type RefObject } from 'react'
import { Group, Vector3, type ColorRepresentation } from 'three'
import useGame from '../stores/use-game'
import { parsePosition, type Position } from '../utils/position'
import { parseRotation, type Rotation } from '../utils/rotation'
import FishingHook from './models/FishingHook'
import FishingPole from './models/FishingPole'
import Rope from './Rope'
import { BOUNDS_COLLISION_GROUP } from './Water'

export type FishingRodHandle = {
  mesh: RefObject<Group>
  body: RefObject<RapierRigidBody>
}

interface FishingRodProps {
  ref?: RefObject<FishingRodHandle>
  visible?: boolean
  position?: Position
  rotation?: Rotation
  ropeLength?: number
  ropeRadius?: number
  colorA?: ColorRepresentation
  colorB?: ColorRepresentation
  onHook?: (position: Vector3) => void
  makeDefault?: boolean
}

export default function FishingRod({
  ref,
  visible = true,
  position = 0,
  rotation = 0,
  ropeLength = 1.5,
  ropeRadius = 0.005,
  colorA,
  colorB,
  onHook,
  makeDefault = false,
}: FishingRodProps) {
  const phase = useGame(state => state.phase)

  const _position = useMemo(() => parsePosition(position), [position])
  const _rotation = useMemo(() => parseRotation(rotation), [rotation])

  const poleBody = useRef<RapierRigidBody>(null!)
  const hookBody = useRef<RapierRigidBody>(null!)
  const poleColliderArgs: CuboidArgs = [0.3, 1, 0.1]

  const group = useRef<Group>(null!)

  useImperativeHandle(ref, () => ({ mesh: group, body: poleBody }), [group, poleBody])

  return (
    <group ref={group} visible={visible} position={_position} rotation={_rotation}>
      <RigidBody
        ref={poleBody}
        type="fixed"
        colliders={false}
        collisionGroups={BOUNDS_COLLISION_GROUP}
      >
        <CuboidCollider args={poleColliderArgs} />
        <Center scale={0.01} rotation-x={-Math.PI * 0.5}>
          <FishingPole colorA={colorA} colorB={colorB} />
        </Center>
      </RigidBody>

      <RigidBody
        ref={hookBody}
        userData={makeDefault ? { name: 'hook' } : undefined}
        canSleep={!makeDefault}
        gravityScale={makeDefault && phase === 'hooked' ? 15 : 5}
        linearDamping={2}
        angularDamping={8}
        colliders="ball"
        collisionGroups={BOUNDS_COLLISION_GROUP}
        onCollisionEnter={({ target }) => {
          if (!onHook) return
          const translation = target.rigidBody?.translation()
          const position = new Vector3().fromArray(Object.values(translation || []))
          onHook(position)
        }}
      >
        <group>
          <mesh castShadow scale={0.04} position-y={0.1}>
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
        startAnchor={[-poleColliderArgs[0], poleColliderArgs[1], poleColliderArgs[2] * 0.5]}
        endAnchor={[0, 0.1, 0]}
        length={ropeLength}
        radius={ropeRadius}
      />
    </group>
  )
}
