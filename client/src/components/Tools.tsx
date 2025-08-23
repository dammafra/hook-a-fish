import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import useGame from '../stores/use-game'
import FishingRod from './FishingRod'
import FlipButton from './interface/FlipButton'
import MuteButton from './interface/MuteButton'
import PauseButton from './interface/PauseButton'
import Stand from './models/Stand'

export default function Tools() {
  const { viewport } = useThree()
  const flip = useGame(state => state.flip)
  const toolsPosition = useGame(state => state.toolsPosition)
  const setToolsPosition = useGame(state => state.setToolsPosition)

  useEffect(() => {
    if (viewport.aspect < 1) setToolsPosition(2 * (flip ? -1 : 1), 0, 5)
    else setToolsPosition(3.5 * (flip ? -1 : 1), 0, 3)
  }, [setToolsPosition, viewport.aspect, flip])

  return (
    <group position={toolsPosition} rotation-y={flip ? Math.PI * 1.5 : 0}>
      <group position={[0.2, 0, 0.2]}>
        <PauseButton />
        <MuteButton />
        <FlipButton />
      </group>

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
