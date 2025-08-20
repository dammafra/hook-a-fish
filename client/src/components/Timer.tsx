import { Billboard, Html } from '@react-three/drei'
import { addEffect } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import useGame from '../stores/use-game'

export default function Timer() {
  const ref = useRef<HTMLDivElement>(null!)

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
    // see https://github.com/pmndrs/drei/issues/859#issuecomment-1536513800
    <Billboard position={[0, 2, -2]}>
      <Html scale={0.5} transform wrapperClass="overlay">
        <div
          ref={ref}
          style={{ transform: 'scale(2)' }}
          className="overlay-content text-xl w-20 pt-2 pb-0.5"
        />
      </Html>
    </Billboard>
  )
}
