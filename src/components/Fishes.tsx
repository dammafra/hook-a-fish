import { animated, useSpring } from '@react-spring/three'
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
import { BUCKET_WATER_HEIGHT, BUCKET_WATER_RADIUS } from './Bucket'
import FishModel from './models/Fish'
import { emitSplash } from './water/events'

// Scratch objects reused every frame to avoid garbage collection hitches
const _position = new Vector3()
const _impulse = new Vector3()
const _zero = new Vector3()
const _identity = new Quaternion()
const _rotation = new Quaternion()
const _euler = new Euler()
const _up = new Vector3(0, 1, 0)
const _right = new Vector3()
const _toCamera = new Vector3()
const _ndc = new Vector3()

const GRAVITY = -9.8

interface FishProps {
  id: string
  /** Removed from the game: jumps off screen from the bucket, or shrinks to nothing, then `onLeft` is called */
  leaving?: boolean
  onLeft?: (id: string) => void
}

export function Fish({ id, leaving = false, onLeft }: FishProps) {
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

  const bobPhase = useMemo(() => randomAngle(), [])
  const [inBucket, setInBucket] = useState(false)
  const jump = useRef<{ velocity: Vector3; startedAt: number }>(null)
  const left = useRef(false)

  const leave = () => {
    if (left.current) return
    left.current = true
    onLeft?.(id)
  }

  // Fishes still in the pond (e.g. on restart) just shrink away
  const shrink = leaving && !inBucket
  const { scale } = useSpring({
    scale: shrink ? 0 : 1,
    config: { tension: 300, friction: 20, clamp: true },
    onRest: () => shrink && leave(),
  })

  const body = useRef<RapierRigidBody>(null!)
  const [bodyType, setBodyType] = useState<RigidBodyTypeString>('kinematicPosition')
  const [hookBody, setHookBody] = useState<RapierRigidBody>()

  const onCollisionEnter = ({ other }: CollisionEnterPayload) => {
    // @ts-expect-error `userData` is of type `Record<string, any>`
    if (useGame.getState().phase !== 'hooked' && other.rigidBody?.userData.name === 'hook') {
      setHookBody(other.rigidBody)
      hook(id)

      const { x, z } = body.current.translation()
      emitSplash(x, z)
    }
  }

  useFrame(({ clock, camera }, delta) => {
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

    // Jump out of the bucket and off screen, bottom left (bottom right when flipped, as the bucket)
    if (leaving && inBucket) {
      const t = clock.elapsedTime
      const position = _position.copy(body.current.translation())

      if (!jump.current) {
        const side = useGame.getState().flip ? -1 : 1
        _right.setFromMatrixColumn(camera.matrixWorld, 0).setY(0).normalize()
        _toCamera.copy(camera.position).sub(position).setY(0).normalize()
        const direction = _toCamera.addScaledVector(_right, -side).normalize()
        jump.current = { velocity: direction.clone().multiplyScalar(4).setY(5), startedAt: t }
      }

      const { velocity, startedAt } = jump.current
      velocity.y += GRAVITY * delta
      position.addScaledVector(velocity, delta)
      body.current.setTranslation(position, true)

      // Tumbling
      const age = t - startedAt
      body.current.setRotation(_rotation.setFromEuler(_euler.set(age * 8, age * 5, 0)), true)

      _ndc.copy(position).project(camera)
      if (Math.abs(_ndc.x) > 1.3 || _ndc.y < -1.3 || age > 3) leave()
      return
    }

    // Stay in bucket, floating up and down and turning around, until it has left
    // Teleports must wake the body: react-three-rapier stops syncing meshes of sleeping bodies
    // `inBucket` keeps it there once the next fish is hooked (`lastHooked` reset) and before `leaving` arrives,
    // otherwise for a frame it would follow the hook it was caught with, to the new fish
    if (id === lastHooked || inBucket) {
      const t = clock.elapsedTime
      const bob = Math.sin(t * 2 + bobPhase) * 0.03
      // Two slow waves with unrelated periods: turns here and there, never in a regular loop
      const yaw = Math.sin(t * 0.7 + bobPhase) * 0.8 + Math.sin(t * 0.31 + bobPhase * 2) * 0.6
      _position.copy(bucketPosition).setY(BUCKET_WATER_HEIGHT + bob)
      body.current.setTranslation(_position, true)
      body.current.setRotation(_rotation.setFromAxisAngle(_up, yaw), true)
      return
    }

    if (leaving) return

    // Follow hook
    if (hookBody) {
      body.current.setBodyType(2, false)
      body.current.setLinvel(_zero, false)
      body.current.setAngvel(_zero, false)

      const { x, y, z } = hookBody.translation()
      _position.set(x, y - targetRadius + targetOffsetY, z - targetOffsetZ)
      body.current.setTranslation(_position, true)
      body.current.setRotation(_identity, true) // this ensures accurate positioning of hook

      if (phase === 'hooked' && _position.distanceTo(bucketPosition) < 0.8) {
        unhook(id)
        setInBucket(true)
        emitSplash(bucketPosition.x, bucketPosition.z, {
          strength: 0.8,
          size: 0.5,
          y: bucketPosition.y + BUCKET_WATER_HEIGHT,
          radius: BUCKET_WATER_RADIUS,
        })
      }
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
        <animated.group scale={scale}>
          <Center rotation-x={-Math.PI * 0.5} scale={1.5}>
            <FishModel
              colorA={colorA}
              colorB={colorB}
              colorC={colorC}
              castShadow={!!hookBody}
              hooked={!!hookBody && !inBucket}
            />
          </Center>
        </animated.group>
        {!hookBody && !leaving && (
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

  // Fishes removed from the game stay mounted until their exit animation is over
  const [leaving, setLeaving] = useState<string[]>([])
  const [prevFishes, setPrevFishes] = useState(fishes)

  if (fishes !== prevFishes) {
    setPrevFishes(fishes)
    const removed = prevFishes.filter(id => !fishes.includes(id))
    if (removed.length) setLeaving(ids => [...ids, ...removed])
  }

  const onLeft = (id: string) => setLeaving(ids => ids.filter(other => other !== id))

  // A single list, so that keys match and leaving fishes keep their state
  return [...fishes, ...leaving].map(id => (
    <Fish key={`fish-${id}`} id={id} leaving={leaving.includes(id)} onLeft={onLeft} />
  ))
}
