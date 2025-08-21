import { Billboard, Html } from '@react-three/drei'
import useGame from '../../stores/use-game'
import useSoundBoard from '../../stores/use-sound-board'

export default function Mute() {
  const paused = useGame(state => state.paused)

  const muted = useSoundBoard(state => state.muted)
  const toggleMuted = useSoundBoard(state => state.toggleMuted)

  return (
    <Billboard position={[-0.6, 1, -0.4]}>
      {/* see https://github.com/pmndrs/drei/issues/859#issuecomment-1536513800 */}
      <Html scale={0.5} transform>
        <button
          onClick={paused ? undefined : toggleMuted}
          className={`overlay-content overlay-button ${paused && 'pointer-events-none opacity-45'}`}
          style={{ transform: 'scale(2)' }}
        >
          <span className={muted ? 'icon-[solar--muted-bold]' : 'icon-[solar--volume-loud-bold]'} />
        </button>
      </Html>
    </Billboard>
  )
}
