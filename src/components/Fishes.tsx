import { useFrame } from '@react-three/fiber'
import {
  BallCollider,
  RapierRigidBody,
  RigidBody,
  type CollisionEnterPayload,
} from '@react-three/rapier'
import { useMemo, useRef, useState } from 'react'
import { Vector3 } from 'three'
import useGame from '../stores/use-game'

interface FishProps {
  id: number
  onRemove?: (id: number) => void
}

export function Fish({ id, onRemove }: FishProps) {
  const hooked = useGame(state => state.hooked)
  const hook = useGame(state => state.hook)

  const radius = 0.25
  const targetRadius = 0.075
  const color = useMemo(() => `hsl(${Math.random() * 360}, 50%, 50%)`, [])

  const speed = useMemo(
    () => (Math.random() * (1 - 0.5) + 0.5) * (Math.random() < 0.5 ? -1 : 1),
    [],
  )
  const distance = useMemo(() => Math.random() * (2.5 - 0.5) + 0.5, [])

  const body = useRef<RapierRigidBody>(null!)
  const [bait, setBait] = useState<RapierRigidBody>()

  const onCollisionEnter = ({ other }: CollisionEnterPayload) => {
    // @ts-ignore
    if (other.rigidBody?.userData.name === 'bait') {
      setBait(other.rigidBody)
      hook()
    }
  }

  useFrame(({ clock }) => {
    if (bait) {
      const { x, y, z } = bait.translation()
      const position = new Vector3(x, y - 0.35, z)
      body.current.setTranslation(position, true)
      // TODO improve
      if (position.distanceTo(new Vector3()) > 3.5) {
        onRemove?.(id)
        hook()
      }
    } else {
      const time = clock.getElapsedTime()
      const angle = time * speed
      const x = Math.cos(angle) * distance
      const z = Math.sin(angle) * distance
      const y = Math.sin(angle * 6) * 0.1 // TODO improve
      const position = new Vector3(x, y, z)
      body.current.setNextKinematicTranslation(position)
    }
  })

  return (
    <RigidBody ref={body} type="kinematicPosition" colliders={false} position-x={id}>
      <mesh>
        <icosahedronGeometry args={[radius, 1]} />
        <meshStandardMaterial flatShading color={color} />
      </mesh>
      <mesh position-y={radius}>
        <icosahedronGeometry args={[targetRadius, 1]} />
        <meshStandardMaterial flatShading color="red" />
      </mesh>
      {!hooked && (
        <BallCollider
          args={[targetRadius]}
          position={[0, radius, 0]}
          onCollisionEnter={onCollisionEnter}
        />
      )}
    </RigidBody>
  )
}

export default function Fishes() {
  const [fishes, setFishes] = useState(Array.from({ length: 20 }, (_, i) => i))
  const onRemove = (id: number) => setFishes(fishes => fishes.filter(fid => fid !== id))

  return fishes.map(id => <Fish key={`fish-${id}`} id={id} onRemove={onRemove} />)
}
