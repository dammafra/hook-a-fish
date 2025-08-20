import { Billboard, Html } from '@react-three/drei'
import useGame from '../stores/use-game'

export default function Counter() {
  const count = useGame(state => state.counter)

  return (
    <Billboard position={[0, 1, -1]}>
      <Html transform wrapperClass="counter">
        <span className="font-title select-none px-2 pt-2.5 pb-1 rounded-lg bg-white/20 border border-white text-white">
          {count}
        </span>
      </Html>
    </Billboard>
  )
}
