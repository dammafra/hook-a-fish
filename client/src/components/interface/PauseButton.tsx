import { Billboard, Float, Html } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import { useHideOnResize } from '../../hooks/use-hide-on-resize'
import useGame from '../../stores/use-game'
import useSoundBoard from '../../stores/use-sound-board'
import { getPositionOnCirlce } from '../../utils/position'

export default function PauseButton() {
  const hidden = useHideOnResize()

  const phase = useGame(state => state.phase)
  const paused = useGame(state => state.paused)
  const flip = useGame(state => state.flip)
  const pause = useGame(state => state.pause)
  const resume = useGame(state => state.resume)

  const context = useSoundBoard(state => state.context)
  const muted = useSoundBoard(state => state.muted)

  const position = useMemo(() => getPositionOnCirlce(1, flip ? 270 : 180, 1), [flip])

  useEffect(() => {
    const handle = () => {
      if (document.hidden) pause()
      else if (phase === 'ended') resume()
    }

    document.addEventListener('visibilitychange', handle)
    return () => document.removeEventListener('visibilitychange', handle)
  }, [pause, resume, phase])

  useEffect(() => {
    if (paused) context?.suspend()
    else if (!muted) context?.resume()
  }, [context, paused, muted])

  return (
    <Float speed={paused ? 30 : 0} position={position} floatIntensity={0.5} rotationIntensity={2}>
      <Billboard>
        {/* see https://github.com/pmndrs/drei/issues/859#issuecomment-1536513800 */}
        <Html scale={0.5} transform wrapperClass={hidden ? 'hidden' : 'block'}>
          <button
            onClick={paused ? resume : pause}
            className="overlay-content overlay-button"
            style={{ transform: 'scale(2)' }}
          >
            <span className={paused ? 'icon-[solar--play-bold]' : 'icon-[solar--pause-bold]'} />
          </button>
        </Html>
      </Billboard>
    </Float>
  )
}
