import { Center } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import {
  BallCollider,
  RapierRigidBody,
  RigidBody,
  type CollisionEnterPayload,
} from '@react-three/rapier'
import { useMemo, useRef, useState } from 'react'
import { Vector3 } from 'three'
import FishModel from '../models/Fish'
import useGame from '../stores/use-game'

interface FishProps {
  id: number
}

export function Fish({ id }: FishProps) {
  const phase = useGame(state => state.phase)
  const hook = useGame(state => state.hook)
  const unhook = useGame(state => state.unhook)
  const bucketPosition = useGame(state => state.bucketPosition)

  const radius = 0.25
  const targetRadius = 0.075
  const colorA = useMemo(() => `hsl(${Math.random() * 360}, 40%, 60%)`, [])
  const colorB = useMemo(() => `hsl(${Math.random() * 360}, 50%, 50%)`, [])
  const colorC = useMemo(() => `hsl(${Math.random() * 360}, 40%, 70%)`, [])

  const position = useMemo(() => new Vector3(Math.random(), 0, Math.random()), [])

  const floatFrequency = useMemo(() => Math.random() * (3 - 1) + 1, [])
  const lastFloat = useRef(0)

  const moveFrequency = useMemo(() => Math.random() * (1 - 0.5) + 0.5, [])
  const lastMove = useRef(0)

  const body = useRef<RapierRigidBody>(null!)
  const [hookBody, setHookBody] = useState<RapierRigidBody>()

  const onCollisionEnter = ({ other }: CollisionEnterPayload) => {
    // @ts-expect-error `userData` is of type `Record<string, any>`
    if (phase !== 'hooked' && other.rigidBody?.userData.name === 'hook') {
      setHookBody(other.rigidBody)
      hook(id)
    }
  }

  useFrame(({ clock }) => {
    if (hookBody) {
      body.current.setBodyType(2, false)
      body.current.setLinvel(new Vector3(), false)
      body.current.setAngvel(new Vector3(), false)

      const { x, y, z } = hookBody.translation()
      const position = new Vector3(x, y - 0.25, z)
      body.current.setTranslation(position, true)

      if (position.distanceTo(bucketPosition) < 0.8) unhook(id)
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
        <Center rotation-x={-Math.PI * 0.5} scale={1.5}>
          <FishModel colorA={colorA} colorB={colorB} colorC={colorC} />
        </Center>
        {!hookBody && (
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
  const fishes = useGame(state => state.fishes)

  return fishes.map(id => <Fish key={`fish-${id}`} id={id} />)
}
