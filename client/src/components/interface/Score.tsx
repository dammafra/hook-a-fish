import { Billboard, Html } from '@react-three/drei'
import { useHideOnResize } from '../../hooks/use-hide-on-resize'
import useGame from '../../stores/use-game'

export default function Score() {
  const hidden = useHideOnResize()

  const score = useGame(state => state.score)
  const paused = useGame(state => state.paused)

  return (
    <Billboard position={[0, 1, -0.8]}>
      {/* see https://github.com/pmndrs/drei/issues/859#issuecomment-1536513800 */}
      <Html scale={0.5} transform wrapperClass={`overlay ${hidden && 'hidden'}`}>
        <div
          style={{ transform: 'scale(2)' }}
          className={`overlay-content min-w-6 aspect-square ${paused && 'pointer-events-none opacity-45'}`}
        >
          <div className="h-5">{score}</div>
        </div>
      </Html>
    </Billboard>
  )
}
