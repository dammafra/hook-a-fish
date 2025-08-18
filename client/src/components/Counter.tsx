import { Html } from '@react-three/drei'
import useGame from '../stores/use-game'

export default function Counter() {
  const count = useGame(state => state.count)

  return (
    <Html transform position={[0, 1, -1]} rotation-x={-Math.PI * 0.1} wrapperClass="counter">
      <span className="font-mono select-none px-3 py-2.5 rounded-lg text-xl bg-white/20 border border-white text-white">
        {count}
      </span>
    </Html>
  )
}
