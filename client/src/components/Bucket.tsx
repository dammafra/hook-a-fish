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
      <Counter />
      <Float
        key={`bucket-${phase}`} // re-render in order to reset position and rotation after floating
        speed={50}
        enabled={phase === 'hooked'}
        floatingRange={[0, 0.1]}
        floatIntensity={0.1}
        scale={2}
      >
        <BucketModel />
        <mesh scale={0.15} position-y={0.25} rotation={[-Math.PI * 0.5, 0, Math.PI * 0.14]}>
          <circleGeometry args={[1, 8]} />
          <meshStandardMaterial color="dodgerblue" />
        </mesh>
      </Float>
    </group>
  )
}
