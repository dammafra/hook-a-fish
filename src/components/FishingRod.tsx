import { DragControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { RapierRigidBody, RigidBody } from '@react-three/rapier'
import { useRef } from 'react'
import { Euler, Mesh, Quaternion, Vector3, type ColorRepresentation } from 'three'
import Rope from './Rope'

interface FishingRodProps {
  position?: number
  color?: ColorRepresentation
}

const radius = 2
const positionY = 2
const rotationZ = -Math.PI * 0.15

const getPosition = (degrees: number) => {
  const radians = degrees * (Math.PI / 180)
  const x = Math.sin(radians) * radius
  const z = Math.cos(radians) * radius
  return new Vector3(x, positionY, z)
}

const getRotation = (pos: Vector3) => {
  const dir = new Vector3(-pos.x, 0, -pos.z).normalize()
  const angle = Math.atan2(dir.x, dir.z)
  return angle + Math.PI * 0.5
}

export default function FishingRod({
  position = 0,
  color = `hsl(${Math.random() * 360}, 100%, 50%)`,
}: FishingRodProps) {
  const { gl } = useThree()

  const _position = getPosition(position)
  const _rotationY = getRotation(_position)

  const stickBody = useRef<RapierRigidBody>(null!)
  const stickMesh = useRef<Mesh>(null!)
  const dragMesh = useRef<Mesh>(null!)

  const ballBody = useRef<RapierRigidBody>(null!)

  function onDrag() {
    const position = new Vector3()
    stickMesh.current.getWorldPosition(position)
    stickBody.current.setNextKinematicTranslation(position)
  }

  useFrame(() => {
    const angle = getRotation(stickBody.current.translation() as Vector3)

    stickBody.current.setRotation(
      new Quaternion().setFromEuler(new Euler(0, angle, rotationZ)),
      false,
    )

    stickMesh.current.rotation.y = angle
    dragMesh.current.rotation.y = angle
  })

  return (
    <group>
      <RigidBody
        ref={stickBody}
        type="kinematicPosition"
        position={_position}
        rotation-y={_rotationY}
        rotation-z={rotationZ}
      />

      <DragControls
        onDragStart={() => gl.domElement.classList.add('dragging')}
        onDragEnd={() => gl.domElement.classList.remove('dragging')}
        onHover={value => gl.domElement.classList.toggle('drag', value)}
        onDrag={onDrag}
        dragLimits={[
          [-4, 4],
          [-positionY + 1, positionY - 1],
          [-4, 4],
        ]}
      >
        <mesh
          ref={stickMesh}
          position={_position}
          rotation-y={_rotationY}
          rotation-z={rotationZ + Math.PI * 0.5}
          scale={[0.05, 2, 0.05]}
          castShadow
        >
          <cylinderGeometry args={[1, 2]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh
          ref={dragMesh}
          position={_position}
          rotation-y={_rotationY}
          rotation-z={rotationZ + Math.PI * 0.5}
          scale={[0.15, 2, 0.15]}
          visible={false}
        >
          <cylinderGeometry args={[1, 2]} />
          <meshBasicMaterial wireframe />
        </mesh>
      </DragControls>

      <RigidBody
        ref={ballBody}
        colliders="ball"
        position={_position}
        linearDamping={0.5}
        angularDamping={8}
        canSleep={false}
      >
        <mesh scale={0.05} castShadow>
          <icosahedronGeometry args={[1, 2]} />
          <meshStandardMaterial color="gray" metalness={0.8} roughness={0.2} />
        </mesh>
      </RigidBody>

      <Rope start={stickBody} end={ballBody} startAnchor={[-0.95, 0, 0]} length={1.5} />
    </group>
  )
}
