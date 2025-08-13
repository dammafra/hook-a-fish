import { DragControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { RapierRigidBody, RigidBody } from '@react-three/rapier'
import { useRef } from 'react'
import { Euler, Mesh, Quaternion, Vector3, type ColorRepresentation } from 'three'
import Rope from './Rope'

interface FishingRodProps {
  position?: [number, number, number] | Vector3
  color?: ColorRepresentation

  stickLength?: number
  stickRadius?: number
  ropeLength?: number
  ropeRadius?: number
  baitRadius?: number

  type?: 'billboard' | 'target' | 'fixed'
  target?: [number, number, number] | Vector3

  draggable?: boolean
}

export default function FishingRod({
  position = [0, 0, 0],
  color = `hsl(${Math.random() * 360}, 100%, 50%)`,
  stickLength = 2,
  stickRadius = 0.05,
  ropeLength = 1.5,
  ropeRadius = 0.01,
  baitRadius = 0.05,
  type = 'target',
  target = [0, 0, 0],
  draggable = true,
}: FishingRodProps) {
  const { gl, camera } = useThree()

  const _position = position instanceof Vector3 ? position : new Vector3().fromArray(position)
  const _target = target instanceof Vector3 ? target : new Vector3().fromArray(target)
  const rotationZ = -Math.PI * 0.15

  const stickBody = useRef<RapierRigidBody>(null!)
  const stickMesh = useRef<Mesh>(null!)

  const baitBody = useRef<RapierRigidBody>(null!)

  function onDrag() {
    const position = new Vector3()
    stickMesh.current.getWorldPosition(position)
    stickBody.current.setNextKinematicTranslation(position)
  }

  const getRotation = (position: Vector3) => {
    const target = type === 'billboard' ? camera.position : _target
    const dir = new Vector3().subVectors(target, position).setY(0).normalize()
    const angle = Math.atan2(dir.x, dir.z)
    return angle + Math.PI * (type === 'billboard' ? 1.5 : 0.5)
  }

  useFrame(() => {
    if (type === 'fixed') return

    const position = stickBody.current.translation() as Vector3
    const angle = getRotation(position)
    const rotation = new Quaternion().setFromEuler(new Euler(0, angle, rotationZ))
    stickBody.current.setRotation(rotation, false)
    stickMesh.current.rotation.y = angle
  })

  return (
    <group>
      <RigidBody
        ref={stickBody}
        type="kinematicPosition"
        position={_position}
        rotation-z={rotationZ}
      />

      <DragControls
        dragConfig={{ enabled: draggable }}
        onDragStart={() => draggable && gl.domElement.classList.add('dragging')}
        onDragEnd={() => draggable && gl.domElement.classList.remove('dragging')}
        onHover={value => draggable && gl.domElement.classList.toggle('drag', value)}
        onDrag={onDrag}
        dragLimits={[
          [-4, 4],
          [-_position.y + 1, _position.y - 1],
          [-4, 4],
        ]}
      >
        <group ref={stickMesh} position={_position} rotation-z={rotationZ + Math.PI * 0.5}>
          <mesh castShadow>
            <cylinderGeometry args={[stickRadius, stickRadius * 1.5, stickLength]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh scale={[2.5, 1.1, 2.5]} visible={false}>
            <cylinderGeometry args={[stickRadius, stickRadius * 1.5, stickLength]} />
            <meshBasicMaterial wireframe />
          </mesh>
        </group>
      </DragControls>

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
        startAnchor={[-0.95, 0, 0]}
        length={ropeLength}
        radius={ropeRadius}
      />
    </group>
  )
}
