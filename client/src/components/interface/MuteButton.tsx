import { Billboard, Html } from '@react-three/drei'
import { useState } from 'react'
import { useHideOnResize } from '../../hooks/use-hide-on-resize'
import useGame from '../../stores/use-game'
import useSoundBoard from '../../stores/use-sound-board'
import { getPositionOnCirlce } from '../../utils/position'

export default function MuteButton() {
  const hidden = useHideOnResize()

  const paused = useGame(state => state.paused)

  const muted = useSoundBoard(state => state.muted)
  const toggleMuted = useSoundBoard(state => state.toggleMuted)

  const [position] = useState(() => getPositionOnCirlce(1, 225, 1))

  return (
    <Billboard key={JSON.stringify(paused)} position={position}>
      {/* see https://github.com/pmndrs/drei/issues/859#issuecomment-1536513800 */}
      <Html scale={0.5} transform wrapperClass={hidden ? 'hidden' : 'block'}>
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
