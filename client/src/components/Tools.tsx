import { Vector3 } from 'three'
import useGame from '../stores/use-game'
import FishingRod from './FishingRod'
import Stand from './models/Stand'

export default function Tools() {
  const bucketPosition = useGame(state => state.bucketPosition)

  return (
    <group position={bucketPosition.clone().multiply(new Vector3(-1, 1, 1))}>
      <Stand scale={3} rotation-y={Math.PI * 0.2} />
      <FishingRod
        position={[0, 0.82, -0.4]}
        rotation={[0, -1, 0.8]}
        ropeLength={0.2}
        colorA="saddlebrown"
        colorB="silver"
      />
      <FishingRod
        position={[-0.3, 0.82, -0.2]}
        rotation={[0, -1, 0.8]}
        ropeLength={0.2}
        colorA="sandyBrown"
        colorB="brown"
      />
    </group>
  )
}
