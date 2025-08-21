import { Billboard, Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'

export default function BonusTime() {
  const ref = useRef<Group>(null!)

  useFrame(({ clock }, delta) => {
    if (!ref.current || !ref.current.scale.x) return

    ref.current.position.z -= delta * 2.5
    ref.current.position.x = Math.sin(clock.elapsedTime * 6) * 0.25

    ref.current.scale.multiplyScalar(1 - delta * 0.3)
    if (ref.current.scale.x < 0.3) ref.current.scale.setScalar(0)
  })

  return (
    <Billboard ref={ref} position={[0, 1, 0]}>
      {/* see https://github.com/pmndrs/drei/issues/859#issuecomment-1536513800 */}
      <Html transform scale={0.5}>
        <div
          style={{ transform: 'scale(1.5)' }}
          className="font-title text-center text-white flex gap-0.5"
        >
          +3 <span className="icon-[ic--twotone-access-time] mt-0.5" />
        </div>
      </Html>
    </Billboard>
  )
}
