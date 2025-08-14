import { Html } from '@react-three/drei'
import useGame from '../stores/use-game'

export default function Interface() {
  const count = useGame(state => state.count)

  return (
    <Html center className="w-screen h-screen pointer-events-none">
      <span className="absolute bottom-10  left-10 font-mono select-none pointer-events-none cursor-none px-5 py-2.5 rounded-lg text-6xl bg-black/20 text-white">
        {count}
      </span>
    </Html>
  )
}
