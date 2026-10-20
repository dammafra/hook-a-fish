import { Float } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import useGame from '../stores/use-game'
import { random, randomAngle } from '../utils/random'
import BonusTime from './interface/BonusTime'
import Score from './interface/Score'
import BucketModel from './models/Bucket'
import { emitRipple } from './water/events'
import { containedWaterMaterial, waterSurfaceRef } from './water/material'

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

  // Shaking bucket: small ripples all over the water
  const lastRipple = useRef(0)
  useFrame(({ clock }) => {
    if (paused || phase !== 'hooked' || !bucketPosition) return
    if (clock.elapsedTime - lastRipple.current < 0.15) return

    const angle = randomAngle()
    const distance = random(0, BUCKET_WATER_RADIUS * 0.6)
    const x = bucketPosition.x + Math.cos(angle) * distance
    const z = bucketPosition.z + Math.sin(angle) * distance
    emitRipple(x, z, 0.25)
    lastRipple.current = clock.elapsedTime
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
        <mesh
          ref={waterSurfaceRef}
          scale={WATER_RADIUS}
          position-y={WATER_Y}
          rotation={[-Math.PI * 0.5, 0, Math.PI * 0.14]}
          material={containedWaterMaterial}
        >
          <circleGeometry args={[1, 8]} />
        </mesh>
      </Float>
    </group>
  )
}
