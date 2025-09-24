import { Float } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect, useState } from 'react'
import useGame from '../stores/use-game'
import BonusTime from './interface/BonusTime'
import Score from './interface/Score'
import BucketModel from './models/Bucket'

export default function Bucket() {
  const { viewport } = useThree()
  const phase = useGame(state => state.phase)
  const paused = useGame(state => state.paused)
  const flip = useGame(state => state.flip)
  const [bonusTime, setBonusTime] = useState(0)
  const bucketPosition = useGame(state => state.bucketPosition)
  const setBucketPosition = useGame(state => state.setBucketPosition)

  useEffect(() => {
    if (viewport.aspect < 1) setBucketPosition(-2 * (flip ? -1 : 1), 0, 5)
    else setBucketPosition(-3.5 * (flip ? -1 : 1), 0, 3)
  }, [setBucketPosition, viewport.aspect, flip])

  useEffect(() => {
    if (phase === 'unhooked') setBonusTime(bt => bt + 1)
  }, [phase])

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
        scale={2}
      >
        <BucketModel />
        <mesh
          scale={0.15}
          position-y={0.25}
          rotation={[-Math.PI * 0.5, 0, Math.PI * 0.14]}
          receiveShadow
        >
          <circleGeometry args={[1, 8]} />
          <meshStandardMaterial color="#006CB1" />
        </mesh>
      </Float>
    </group>
  )
}
