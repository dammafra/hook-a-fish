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
import useGame from '../stores/use-game'
import { random, randomAngle, randomColor } from '../utils/random'
import FishModel from './models/Fish'

// Scratch objects reused every frame to avoid garbage collection hitches
const _position = new Vector3()
const _impulse = new Vector3()
const _zero = new Vector3()
const _identity = new Quaternion()

interface FishProps {
  id: string
}

export function Fish({ id }: FishProps) {
  // Frame-dependent state is read via `useGame.getState()` to avoid re-rendering every fish on each change
  const radius = useGame(state => state.radius)
  const hook = useGame(state => state.hook)
  const unhook = useGame(state => state.unhook)

  const bodyRadius = 0.25
  const targetRadius = 0.075
  const targetOffsetY = -0.2
  const targetOffsetZ = 0.1
  const colorA = useMemo(() => randomColor(), [])
  const colorB = useMemo(() => randomColor(), [])
  const colorC = useMemo(() => randomColor(), [])

  const position = useMemo(
    () =>
      new Vector3(
        random(-0.5 * radius, 0.5 * radius),
        random(-1, -0.5),
        random(-0.5 * radius, 0.5 * radius),
      ),
    [radius],
  )
  const rotation = useMemo(() => new Euler(0, randomAngle(), 0), [])

  const moveFrequency = useMemo(() => random(1, 3), [])
  const lastMove = useRef(0)

  const floatFrequency = useMemo(() => random(1, 3), [])
  const lastFloat = useRef(0)

  const body = useRef<RapierRigidBody>(null!)
  const [bodyType, setBodyType] = useState<RigidBodyTypeString>('kinematicPosition')
  const [hookBody, setHookBody] = useState<RapierRigidBody>()

  const onCollisionEnter = ({ other }: CollisionEnterPayload) => {
    // @ts-expect-error `userData` is of type `Record<string, any>`
    if (useGame.getState().phase !== 'hooked' && other.rigidBody?.userData.name === 'hook') {
      setHookBody(other.rigidBody)
      hook(id)
    }
  }

  useFrame(({ clock }, delta) => {
    const { phase, paused, lastHooked, bucketPosition } = useGame.getState()
    if (phase === 'ended' || !bucketPosition) return

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
    // Teleports must wake the body: react-three-rapier stops syncing meshes of sleeping bodies
    if (id === lastHooked) {
      _position.copy(bucketPosition).setY(0.5)
      body.current.setTranslation(_position, true)
      body.current.setRotation(_identity, true)
      return
    }

    // Follow hook
    if (hookBody) {
      body.current.setBodyType(2, false)
      body.current.setLinvel(_zero, false)
      body.current.setAngvel(_zero, false)

      const { x, y, z } = hookBody.translation()
      _position.set(x, y - targetRadius + targetOffsetY, z - targetOffsetZ)
      body.current.setTranslation(_position, true)
      body.current.setRotation(_identity, true) // this ensures accurate positioning of hook

      if (_position.distanceTo(bucketPosition) < 0.8) unhook(id)
      return
    }

    if (paused) return

    // Move
    const impulse = _impulse.set(0, 0, 0)
    const now = clock.elapsedTime

    if (now - lastFloat.current >= floatFrequency) {
      impulse.y = 0.1
      lastFloat.current = now
    }

    if (now - lastMove.current >= moveFrequency) {
      impulse.x = random(-0.1, 0.1)
      impulse.z = random(-0.1, 0.1)
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
        friction={0.2}
        restitution={0.2}
        angularDamping={0.5}
      >
        <Center rotation-x={-Math.PI * 0.5} scale={1.5}>
          <FishModel
            colorA={colorA}
            colorB={colorB}
            colorC={colorC}
            castShadow={!!hookBody}
          />
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
