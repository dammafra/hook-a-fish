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
  const toggleHook = useGame(state => state.toggleHook)
  const bucketPosition = useGame(state => state.bucketPosition)

  const radius = 0.25
  const targetRadius = 0.075
  const color = useMemo(() => `hsl(${Math.random() * 360}, 50%, 50%)`, [])

  const position = useMemo(() => new Vector3(Math.random(), 0, Math.random()), [])

  const floatFrequency = useMemo(() => Math.random() * (3 - 1) + 1, [])
  const lastFloat = useRef(0)

  const moveFrequency = useMemo(() => Math.random() * (1 - 0.5) + 0.5, [])
  const lastMove = useRef(0)

  const body = useRef<RapierRigidBody>(null!)
  const [hook, setHook] = useState<RapierRigidBody>()

  const onCollisionEnter = ({ other }: CollisionEnterPayload) => {
    // @ts-expect-error `userData` is of type `Record<string, any>`
    if (!hooked && other.rigidBody?.userData.name === 'hook') {
      setHook(other.rigidBody)
      toggleHook()
    }
  }

  useFrame(({ clock }) => {
    if (hook) {
      body.current.setBodyType(2, false)
      body.current.setLinvel(new Vector3(), false)
      body.current.setAngvel(new Vector3(), false)

      const { x, y, z } = hook.translation()
      const position = new Vector3(x, y - 0.35, z)
      body.current.setTranslation(position, true)

      if (position.distanceTo(bucketPosition) < 0.8) {
        onRemove?.(id)
        toggleHook()
      }
    } else {
      const impulse = new Vector3()
      const now = clock.elapsedTime

      if (now - lastFloat.current >= floatFrequency) {
        impulse.y = 0.1
        lastFloat.current = now
      }

      if (now - lastMove.current >= moveFrequency) {
        impulse.x = (Math.random() - 0.5) * 0.25
        impulse.z = (Math.random() - 0.5) * 0.25
        lastMove.current = now
      }

      body.current.applyImpulse(impulse, true)
    }
  })

  return (
    <>
      <RigidBody
        ref={body}
        position={position}
        colliders={false}
        enabledRotations={[false, true, false]}
        gravityScale={0.5}
      >
        <mesh>
          <icosahedronGeometry args={[radius, 1]} />
          <meshStandardMaterial color={color} flatShading />
        </mesh>
        <mesh position-y={radius}>
          <icosahedronGeometry args={[targetRadius, 1]} />
          <meshStandardMaterial color="red" />
        </mesh>
        {!hook && (
          <>
            <BallCollider args={[radius]} />
            <BallCollider
              args={[targetRadius]}
              position={[0, radius, 0]}
              onCollisionEnter={onCollisionEnter}
            />
          </>
        )}
      </RigidBody>
    </>
  )
}

export default function Fishes() {
  const [fishes, setFishes] = useState(Array.from({ length: 20 }, (_, i) => i))
  const onRemove = (id: number) => setFishes(fishes => fishes.filter(fid => fid !== id))

  return fishes.map(id => <Fish key={`fish-${id}`} id={id} onRemove={onRemove} />)
}
