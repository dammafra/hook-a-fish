import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import useGame from '../stores/use-game'
import FishingRod from './FishingRod'
import Flip from './interface/Flip'
import Mute from './interface/Mute'
import Pause from './interface/Pause'
import Stand from './models/Stand'

export default function Tools() {
  const { viewport } = useThree()
  const toolsPosition = useGame(state => state.toolsPosition)
  const setToolsPosition = useGame(state => state.setToolsPosition)

  useEffect(() => {
    if (viewport.aspect < 1) setToolsPosition(2, 0, 5)
    else setToolsPosition(3.5, 0, 3)
  }, [setToolsPosition, viewport.aspect])

  return (
    <group position={toolsPosition}>
      <group position={[0.2, 0, 0.2]}>
        <Pause />
        <Mute />
        <Flip />
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
