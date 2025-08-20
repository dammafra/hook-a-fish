import { Billboard, Html } from '@react-three/drei'
import { addEffect } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import useGame from '../stores/use-game'

export default function Timer() {
  const ref = useRef<HTMLSpanElement>(null!)

  useEffect(() => {
    const unsubscribeEffect = addEffect(() => {
      if (!ref.current) return
      const state = useGame.getState()
      if (state.phase === 'ready' || state.phase === 'ended') return

      const now = Date.now()
      const elapsed = Math.round((now - state.startedAt) / 1000)
      const countdown = state.countdownSeconds - elapsed

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
    <Billboard position={[0, 2, -2]}>
      <Html center transform wrapperClass="timer">
        <span
          ref={ref}
          className="font-title select-none px-2 pt-2.5 pb-1 rounded-lg text-lg border bg-white/20 border-white text-white animae-bounce!"
        />
      </Html>
    </Billboard>
  )
}
