import { Billboard, Float, Html } from '@react-three/drei'
import { useEffect } from 'react'
import useGame from '../../stores/use-game'

export default function Pause() {
  const paused = useGame(state => state.paused)
  const pause = useGame(state => state.pause)
  const resume = useGame(state => state.resume)

  useEffect(() => {
    const handle = () => {
      if (document.hidden) pause()
    }

    document.addEventListener('visibilitychange', handle)
    return () => document.removeEventListener('visibilitychange', handle)
  }, [pause])

  return (
    <Float speed={paused ? 50 : 0} position={[0, 1, -1]} floatIntensity={0.5} rotationIntensity={2}>
      <Billboard position={[0, 0, 0]}>
        {/* see https://github.com/pmndrs/drei/issues/859#issuecomment-1536513800 */}
        <Html scale={0.5} transform>
          <div
            onClick={paused ? resume : pause}
            className="overlay-content size-10 flex items-center justify-center text-2xl cursor-pointer"
          >
            <span className={paused ? 'icon-[solar--play-bold]' : 'icon-[solar--pause-bold]'} />
          </div>
        </Html>
      </Billboard>
    </Float>
  )
}
