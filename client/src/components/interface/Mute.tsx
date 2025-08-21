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
        <div
          onClick={paused ? undefined : toggleMuted}
          className={`overlay-content size-10 md:size-8 flex items-center justify-center text-2xl ${paused ? 'pointer-events-none cursor-auto opacity-45' : 'cursor-pointer'}`}
        >
          <span className={muted ? 'icon-[solar--muted-bold]' : 'icon-[solar--volume-loud-bold]'} />
        </div>
      </Html>
    </Billboard>
  )
}
