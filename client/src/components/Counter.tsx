import { Html } from '@react-three/drei'
import useGame from '../stores/use-game'
import { parsePosition, type Position } from '../utils/position'
import { parseRotation, type Rotation } from '../utils/rotation'

interface CounterProps {
  position?: Position
  rotation?: Rotation
}

export default function Counter({ position = [0, 0, 0], rotation = [0, 0, 0] }: CounterProps) {
  const count = useGame(state => state.count)
  const _position = parsePosition(position)
  const _rotation = parseRotation(rotation)

  return (
    <Html transform position={_position} rotation={_rotation} wrapperClass="counter">
      <span className="font-mono select-none px-3 py-2.5 rounded-lg text-xl bg-white/20 border border-white text-white">
        {count}
      </span>
    </Html>
  )
}
