import { Center } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import {
  BallCollider,
  RapierRigidBody,
  RigidBody,
  type CollisionEnterPayload,
  type RigidBodyTypeString,
} from '@react-three/rapier'
import { useMemo, useRef, useState } from 'react'
import { Euler, Quaternion, Vector3 } from 'three'
import FishModel from '../models/Fish'
import useGame from '../stores/use-game'

interface FishProps {
  id: number
}

export function Fish({ id }: FishProps) {
  const radius = useGame(state => state.radius)
  const phase = useGame(state => state.phase)
  const hook = useGame(state => state.hook)
  const unhook = useGame(state => state.unhook)
  const lastHooked = useGame(state => state.lastHooked)
  const bucketPosition = useGame(state => state.bucketPosition)

  const bodyRadius = 0.25
  const targetRadius = 0.075
  const targetOffsetZ = 0.1
  const colorA = useMemo(() => `hsl(${Math.random() * 360}, 50%, 50%)`, [])
  const colorB = useMemo(() => `hsl(${Math.random() * 360}, 50%, 50%))`, [])
  const colorC = useMemo(() => `hsl(${Math.random() * 360}, 50%, 50%))`, [])

  const position = useMemo(() => new Vector3((Math.random() - 0.5) * radius, Math.random() * (-0.5 + 1) - 1, (Math.random() - 0.5) * radius), [radius]) //prettier-ignore
  const rotation = useMemo(() => new Euler(0, Math.random() * 2 * Math.PI, 0), [])

  const floatFrequency = useMemo(() => Math.random() * (3 - 1) + 1, [])
  const lastFloat = useRef(0)

  const moveFrequency = useMemo(() => Math.random() * (1 - 0.5) + 0.5, [])
  const lastMove = useRef(0)

  const body = useRef<RapierRigidBody>(null!)
  const [bodyType, setBodyType] = useState<RigidBodyTypeString>('kinematicPosition')
  const [hookBody, setHookBody] = useState<RapierRigidBody>()

  const onCollisionEnter = ({ other }: CollisionEnterPayload) => {
    // @ts-expect-error `userData` is of type `Record<string, any>`
    if (phase !== 'hooked' && other.rigidBody?.userData.name === 'hook') {
      setHookBody(other.rigidBody)
      hook(id)
    }
  }

  useFrame(({ clock }, delta) => {
    // Emerge on start
    if (bodyType === 'kinematicPosition') {
      const position = body.current.translation()
      if (position.y >= 0) {
        setBodyType('dynamic')
        return
      }

      position.y += delta
      body.current.setTranslation(position, false)
      return
    }

    // Stay in bucket
    if (id === lastHooked) {
      const position = bucketPosition.clone()
      position.y = 0.5
      body.current.setTranslation(position, false)
      body.current.setRotation(new Quaternion(), false)
      return
    }

    // Follow hook
    if (hookBody) {
      body.current.setBodyType(2, false)
      body.current.setLinvel(new Vector3(), false)
      body.current.setAngvel(new Vector3(), false)

      const { x, y, z } = hookBody.translation()
      const position = new Vector3(x, y - targetRadius, z - targetOffsetZ)
      body.current.setTranslation(position, false)
      body.current.setRotation(new Quaternion(), false)

      if (position.distanceTo(bucketPosition) < 0.8) unhook(id)
      return
    }

    // Move
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
  })

  return (
    <>
      <RigidBody
        type={bodyType}
        ref={body}
        position={position}
        rotation={rotation}
        colliders={false}
        enabledRotations={[false, true, false]}
        gravityScale={0.5}
        angularDamping={0.5}
      >
        <Center rotation-x={-Math.PI * 0.5} scale={1.5}>
          <FishModel colorA={colorA} colorB={colorB} colorC={colorC} />
        </Center>
        {!hookBody && (
          <>
            <BallCollider args={[bodyRadius]} />
            <BallCollider
              args={[targetRadius]}
              position={[0, bodyRadius, targetOffsetZ]}
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
