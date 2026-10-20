import { Float } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { MathUtils, type Group } from 'three'
import useGame from '../stores/use-game'
import { random, randomAngle } from '../utils/random'
import BonusTime from './interface/BonusTime'
import Score from './interface/Score'
import BucketModel from './models/Bucket'
import { emitSplash } from './water/events'
import { containedWaterMaterial, waterSurfaceRef, waterUniforms } from './water/material'

const BUCKET_SCALE = 2
const WATER_Y = 0.25
const WATER_RADIUS = 0.15

/** Height of the water surface above the bucket position */
export const BUCKET_WATER_HEIGHT = WATER_Y * BUCKET_SCALE
export const BUCKET_WATER_RADIUS = WATER_RADIUS * BUCKET_SCALE

export default function Bucket() {
  const { viewport } = useThree()
  const phase = useGame(state => state.phase)
  const paused = useGame(state => state.paused)
  const flip = useGame(state => state.flip)
  const [bonusTime, setBonusTime] = useState(0)
  const [prevPhase, setPrevPhase] = useState(phase)
  const bucketPosition = useGame(state => state.bucketPosition)
  const setBucketPosition = useGame(state => state.setBucketPosition)

  useEffect(() => {
    if (viewport.aspect < 1) setBucketPosition(-2 * (flip ? -1 : 1), 0, 5)
    else setBucketPosition(-3.5 * (flip ? -1 : 1), 0, 3)
  }, [setBucketPosition, viewport.aspect, flip])

  // Shaking bucket: the water sloshes, gets choppy and splashes around
  const water = useRef<Group>(null!)
  const agitation = useRef(0)
  const lastSplash = useRef(0)
  useFrame(({ clock }, delta) => {
    const shaking = !paused && phase === 'hooked'
    agitation.current = MathUtils.damp(agitation.current, shaking ? 1 : 0, 4, delta)
    waterUniforms.uAgitation.value = agitation.current

    const t = clock.elapsedTime
    water.current.rotation.x = Math.sin(t * 11) * 0.12 * agitation.current
    water.current.rotation.z = Math.cos(t * 9) * 0.12 * agitation.current

    if (!shaking || !bucketPosition || t - lastSplash.current < 0.2) return

    const angle = randomAngle()
    const distance = random(0, BUCKET_WATER_RADIUS * 0.7)
    emitSplash(
      bucketPosition.x + Math.cos(angle) * distance,
      bucketPosition.z + Math.sin(angle) * distance,
      {
        strength: random(0.3, 0.5),
        size: 0.35,
        count: 5,
        ripples: false,
        y: bucketPosition.y + BUCKET_WATER_HEIGHT,
        radius: BUCKET_WATER_RADIUS,
      },
    )
    lastSplash.current = t
  })

  if (phase !== prevPhase) {
    setPrevPhase(phase)
    if (phase === 'unhooked') setBonusTime(bt => bt + 1)
  }

  return (
    <group position={bucketPosition}>
      <Score />
      {!!bonusTime && <BonusTime key={bonusTime} />}

      <Float
        key={`bucket-${phase}`} // re-render in order to reset position and rotation after floating
        speed={50}
        enabled={!paused && phase === 'hooked'}
        floatingRange={[0, 0.1]}
        floatIntensity={0.1}
        scale={BUCKET_SCALE}
      >
        <BucketModel />
        <group ref={water} position-y={WATER_Y}>
          <mesh
            ref={waterSurfaceRef}
            scale={WATER_RADIUS}
            rotation={[-Math.PI * 0.5, 0, Math.PI * 0.14]}
            material={containedWaterMaterial}
          >
            <circleGeometry args={[1, 8]} />
          </mesh>
        </group>
      </Float>
    </group>
  )
}
