import { Billboard, Html } from '@react-three/drei'
import useGame from '../stores/use-game'

export default function Score() {
  const count = useGame(state => state.score)

  return (
    // see https://github.com/pmndrs/drei/issues/859#issuecomment-1536513800
    <Billboard position={[0, 1, -1]}>
      <Html scale={0.5} transform wrapperClass="overlay">
        <div style={{ transform: 'scale(2)' }} className="overlay-content min-w-6 pt-1.5 ">
          {count}
        </div>
      </Html>
    </Billboard>
  )
}
