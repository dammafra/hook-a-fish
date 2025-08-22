import { Billboard, Html } from '@react-three/drei'
import { useState } from 'react'
import useGame from '../../stores/use-game'
import { getPositionOnCirlce } from '../../utils/position'

export default function Flip() {
  const paused = useGame(state => state.paused)
  const flip = useGame(state => state.flip)
  const toggleFlip = useGame(state => state.toggleFlip)

  const [position] = useState(() => getPositionOnCirlce(1, 270, 1))

  return (
    <Billboard position={position}>
      {/* see https://github.com/pmndrs/drei/issues/859#issuecomment-1536513800 */}
      <Html scale={0.5} transform>
        <button
          onClick={toggleFlip}
          className={`overlay-content overlay-button ${paused && 'pointer-events-none opacity-45'}`}
          style={{ transform: 'scale(2)' }}
        >
          <span className={`icon-[uim--flip-v-alt] ${flip && 'rotate-y-180'}`} />
        </button>
      </Html>
    </Billboard>
  )
}
