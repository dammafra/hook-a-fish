import { RapierRigidBody, RigidBody } from '@react-three/rapier'
import { useRef } from 'react'
import { Object3D, Quaternion, type ColorRepresentation } from 'three'
import { parsePosition, type Position } from '../utils/position'
import { parseRotation, type Rotation } from '../utils/rotation'
import PointerControls from './PointerControls'
import Rope from './Rope'

interface FishingRodProps {
  position?: Position
  rotation?: Rotation
  color?: ColorRepresentation
  stickLength?: number
  stickRadius?: number
  ropeLength?: number
  ropeRadius?: number
  baitRadius?: number
}

export default function FishingRod({
  position = [0, 0, 0],
  rotation = [0, 0, Math.PI * 0.35],
  color = `hsl(${Math.random() * 360}, 100%, 50%)`,
  stickLength = 2,
  stickRadius = 0.05,
  ropeLength = 1.5,
  ropeRadius = 0.01,
  baitRadius = 0.05,
}: FishingRodProps) {
  const _position = parsePosition(position)
  const _rotation = parseRotation(rotation)

  const stickBody = useRef<RapierRigidBody>(null!)
  const baitBody = useRef<RapierRigidBody>(null!)

  const stickMesh = useRef<Object3D>(null!)

  const onMove = () => {
    const { position, rotation } = stickMesh.current
    stickBody.current.setNextKinematicTranslation(position)
    stickBody.current.setNextKinematicRotation(new Quaternion().setFromEuler(rotation))
  }

  return (
    <>
      <group ref={stickMesh} position={_position} rotation={_rotation}>
        <RigidBody ref={stickBody} type="kinematicPosition" />
        <mesh castShadow>
          <cylinderGeometry args={[stickRadius, stickRadius * 1.5, stickLength]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh scale={[2.5, 1.1, 2.5]} visible={false}>
          <cylinderGeometry args={[stickRadius, stickRadius * 1.5, stickLength]} />
          <meshBasicMaterial wireframe />
        </mesh>
      </group>

      <RigidBody
        userData={{ name: 'bait' }}
        ref={baitBody}
        colliders="ball"
        position={_position}
        gravityScale={5}
        linearDamping={2}
        angularDamping={8}
        canSleep={false}
      >
        <mesh castShadow>
          <icosahedronGeometry args={[baitRadius, 1]} />
          <meshStandardMaterial color="gray" metalness={0.8} roughness={0.2} />
        </mesh>
      </RigidBody>

      <Rope
        start={stickBody}
        end={baitBody}
        startAnchor={[0, 0.95, 0]}
        length={ropeLength}
        radius={ropeRadius}
      />

      {/* TODO improve lockPositionYAt value */}
      <PointerControls hideCursor targetRef={stickMesh} lockPositionYAt={1.4} onMove={onMove} />
    </>
  )
}
