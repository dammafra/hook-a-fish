import { Billboard, Float, Html } from '@react-three/drei'
import { addEffect } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import useGame from '../stores/use-game'

export default function Countdown() {
  const phase = useGame(state => state.phase)
  const ref = useRef<HTMLDivElement>(null!)
  const [alarm, setAlarm] = useState(false)

  useEffect(() => {
    const unsubscribeEffect = addEffect(() => {
      if (!ref.current) return

      const state = useGame.getState()

      if (state.phase === 'ready') return
      if (state.phase === 'ended') {
        setAlarm(false)
        return
      }

      const now = Date.now()
      const elapsed = Math.round((now - state.startedAt) / 1000)
      const countdown = state.countdownSeconds - elapsed + state.bonusTime

      setAlarm(countdown <= 10)
      if (countdown <= 0) state.end()
      if (countdown < 0) return

      // format mm:ss
      const m = Math.floor(countdown / 60).toString().padStart(2, '0') //prettier-ignore
      const s = (countdown % 60).toString().padStart(2, '0')
      ref.current.textContent = `${m}:${s}`
    })
    return unsubscribeEffect
  }, [])

  return (
    phase !== 'ended' && (
      // see https://github.com/pmndrs/drei/issues/859#issuecomment-1536513800
      <Float speed={alarm ? 50 : 0} floatIntensity={1} rotationIntensity={0}>
        <Billboard position={[0, 2, -2]}>
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
  )
}
