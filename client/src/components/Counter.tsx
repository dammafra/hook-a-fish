import { Html } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import { Object3D } from 'three'
import useGame from '../stores/use-game'

export default function Counter() {
  const count = useGame(state => state.counter)
  const { camera } = useThree()
  const ref = useRef<Object3D>(null!)

  useFrame(() => {
    if (!ref.current) return
    ref.current.lookAt(camera.position)
  })

  return (
    <group ref={ref} position={[0, 1, -1]}>
      <Html transform wrapperClass="counter">
        <span className="font-title select-none px-2 pt-2.5 pb-1 rounded-lg text-lg bg-white/20 border border-white text-white">
          {count}
        </span>
      </Html>
    </group>
  )
}
