import useGame from '../stores/use-game'
import { getPositionOnCirlce } from '../utils/position'
import Bucket from './Bucket'
import Fishes from './Fishes'
import FishingRod from './FishingRod'
import Grass from './Grass'
import Tutorial from './Tutorial'
import Water from './Water'

export default function World() {
  const started = useGame(state => state.started)

  return (
    <>
      {!started && <Tutorial />}

      {started && (
        <>
          <Fishes />
          <Water />
          <FishingRod position={getPositionOnCirlce(2, 0, 2)} />
          <Bucket />
          <Grass />
        </>
      )}
    </>
  )
}
