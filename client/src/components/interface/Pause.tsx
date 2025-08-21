import { Billboard, Float, Html } from '@react-three/drei'
import { useEffect } from 'react'
import useGame from '../../stores/use-game'
import useSoundBoard from '../../stores/use-sound-board'

export default function Pause() {
  const phase = useGame(state => state.phase)
  const paused = useGame(state => state.paused)
  const pause = useGame(state => state.pause)
  const resume = useGame(state => state.resume)

  const context = useSoundBoard(state => state.context)
  const muted = useSoundBoard(state => state.muted)

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
    <Float speed={paused ? 50 : 0} position={[0, 1, -1]} floatIntensity={0.5} rotationIntensity={2}>
      <Billboard>
        {/* see https://github.com/pmndrs/drei/issues/859#issuecomment-1536513800 */}
        <Html scale={0.5} transform>
          <button
            onClick={paused ? resume : pause}
            className="overlay-content size-10 md:size-8 flex items-center justify-center text-2xl"
          >
            <span className={paused ? 'icon-[solar--play-bold]' : 'icon-[solar--pause-bold]'} />
          </button>
        </Html>
      </Billboard>
    </Float>
  )
}
