import { Float } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import BucketModel from '../models/Bucket'
import useGame from '../stores/use-game'
import Counter from './Counter'

export default function Bucket() {
  const { viewport } = useThree()
  const phase = useGame(state => state.phase)
  const bucketPosition = useGame(state => state.bucketPosition)
  const setBucketPosition = useGame(state => state.setBucketPosition)

  useEffect(() => {
    if (viewport.aspect < 1) setBucketPosition(-2.5, 0, 4.5)
    else setBucketPosition(-3.5, 0, 3)
  }, [setBucketPosition, viewport.aspect])

  return (
    <group position={bucketPosition}>
      {phase !== 'ready' && <Counter />}
      <Float speed={50} enabled={phase === 'hooked'} floatingRange={[0.1, 0.2]}>
        <BucketModel scale={2} rotation-y={Math.PI * 0.25} />
      </Float>
    </group>
  )
}
