import { useMemo } from 'react'
import { useIsTouch } from '../hooks/use-is-touch'
import useGame from '../stores/use-game'
import { getPositionOnCirlce } from '../utils/position'
import FishingRod from './FishingRod'
import PointerControls from './PointerControls'

export default function Controller() {
  const isTouch = useIsTouch()
  const phase = useGame(state => state.phase)
  const initialPosition = useMemo(() => getPositionOnCirlce(2, 0, 2), [])

  return (
    phase !== 'ready' && (
      <PointerControls
        type={phase === 'hooked' ? 'billboard' : 'target'}
        hideCursor
        lockPositionYAt={1.5}
        offset={isTouch ? [0, 0, -2] : 0}
        position={initialPosition}
      >
        <FishingRod rotation={[0, 0, Math.PI * 0.35]} />
      </PointerControls>
    )
  )
}
