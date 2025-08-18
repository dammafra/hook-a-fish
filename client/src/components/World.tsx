import { useMemo } from 'react'
import useGame from '../stores/use-game'
import { getPositionOnCirlce } from '../utils/position'
import Bucket from './Bucket'
import Fishes from './Fishes'
import FishingRod from './FishingRod'
import Grass from './Grass'
import Tutorial from './Tutorial'
import Water from './Water'

export default function World() {
  const phase = useGame(state => state.phase)
  const fishingRodPosition = useMemo(() => getPositionOnCirlce(2, 0, 2), [])

  return (
    <>
      {phase === 'ready' ? (
        <Tutorial />
      ) : (
        <>
          <FishingRod position={fishingRodPosition} />
          <Fishes />
          <Water />
          <Bucket />
          <Grass />
        </>
      )}
    </>
  )
}
