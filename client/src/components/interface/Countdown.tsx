import { Billboard, Float, Html } from '@react-three/drei'
import { useEffect, useRef, useState } from 'react'
import useSoundBoard from '../../hooks/use-sound-board'
import useGame from '../../stores/use-game'

interface CountdownProps {
  seconds: number
}

export default function Countdown({ seconds }: CountdownProps) {
  const phase = useGame(state => state.phase)
  const paused = useGame(state => state.paused)
  const end = useGame(state => state.end)

  const ref = useRef<HTMLDivElement>(null!)
  const [timeLeft, setTimeLeft] = useState(seconds)
  const [alarm, setAlarm] = useState(false)
  const { sounds } = useSoundBoard()

  useEffect(() => {
    if (!ref.current || paused) return

    if (timeLeft <= 0) {
      end()
      setAlarm(false)
      return
    }

    setAlarm(timeLeft <= 10)

    // format mm:ss
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0') //prettier-ignore
    const s = (timeLeft % 60).toString().padStart(2, '0')
    ref.current.textContent = `${m}:${s}`

    const interval = setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => clearInterval(interval)
  }, [timeLeft, paused, end])

  useEffect(() => {
    if (alarm && !paused) sounds.tick.play()
    else sounds.tick.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alarm, paused])

  useEffect(() => {
    if (phase === 'started') setTimeLeft(seconds)
    if (phase === 'unhooked') setTimeLeft(t => t + 3)
  }, [seconds, phase])

  return (
    <Float enabled={alarm && !paused} speed={50} floatIntensity={1} rotationIntensity={0}>
      <Billboard position={[0, 2, -2]}>
        {/* see https://github.com/pmndrs/drei/issues/859#issuecomment-1536513800 */}
        <Html scale={0.5} transform wrapperClass="overlay">
          <div
            ref={ref}
            style={{ transform: 'scale(2)' }}
            className="overlay-content text-xl w-20 pt-2 pb-0.5"
          />
        </Html>
      </Billboard>
    </Float>
  )
}
