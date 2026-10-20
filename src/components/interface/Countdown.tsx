import { Billboard, Float, Html } from '@react-three/drei'
import { useEffect, useRef, useState } from 'react'
import { useHideOnResize } from '../../hooks/use-hide-on-resize'
import useGame from '../../stores/use-game'
import useSoundBoard from '../../stores/use-sound-board'

interface CountdownProps {
  seconds: number
}

export default function Countdown({ seconds }: CountdownProps) {
  const hidden = useHideOnResize()

  const phase = useGame(state => state.phase)
  const paused = useGame(state => state.paused)
  const end = useGame(state => state.end)
  const pause = useGame(state => state.pause)

  const ref = useRef<HTMLDivElement>(null!)
  const [timeLeft, setTimeLeft] = useState(seconds)
  const [alarm, setAlarm] = useState(false)
  const sounds = useSoundBoard(state => state.sounds)

  useEffect(() => {
    if (!ref.current || paused) return

    // format mm:ss
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0') //prettier-ignore
    const s = (timeLeft % 60).toString().padStart(2, '0')
    ref.current.textContent = `${m}:${s}`

    setAlarm(timeLeft <= 10)

    if (timeLeft <= 0) {
      end()
      setAlarm(false)
      return
    }

    const interval = setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => clearInterval(interval)
  }, [timeLeft, paused, end])

  useEffect(() => {
    if (alarm && !paused) sounds?.tick.play()
    else sounds?.tick.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alarm, paused])

  useEffect(() => {
    if (phase === 'started') setTimeLeft(seconds)
    if (phase === 'unhooked') setTimeLeft(t => t + 3)
  }, [seconds, phase])

  useEffect(() => {
    if (hidden) pause()
  }, [hidden, pause])

  return (
    <Float
      enabled={alarm && !paused}
      speed={50}
      floatIntensity={1}
      rotationIntensity={0}
      position={[0, 2, -2]}
    >
      <Billboard>
        {/* see https://github.com/pmndrs/drei/issues/859#issuecomment-1536513800 */}
        <Html scale={0.5} transform wrapperClass={`overlay ${hidden && 'hidden'}`}>
          <div
            style={{ transform: 'scale(2)' }}
            className={`overlay-content w-22 py-2 text-2xl ${paused && 'opacity-45'}`}
          >
            <div ref={ref} className="h-6" />
          </div>
        </Html>
      </Billboard>
    </Float>
  )
}
