import { useMemo } from 'react'
import { Euler } from 'three'
import { useIsTouch } from '../hooks/use-is-touch'
import useGame from '../stores/use-game'
import { getPositionOnCirlce } from '../utils/position'
import FishingRod from './FishingRod'
import PointerControls from './PointerControls'

export default function Controller() {
  const isTouch = useIsTouch()
  const phase = useGame(state => state.phase)

  const initialPosition = useMemo(() => getPositionOnCirlce(2, 0, 2), [])
  const initialRotation = useMemo(() => new Euler(0, 0, Math.PI * 0.35), [])

  return (
    phase !== 'ready' && (
      <PointerControls
        type="billboard"
        hideCursor
        lockPositionYAt={1.5}
        positionOffset={isTouch ? [0, 0, -2] : 0}
        rotationOffset={0.5}
        position={initialPosition}
        rotation={initialRotation}
      >
        <FishingRod />
      </PointerControls>
    )
  )
}
