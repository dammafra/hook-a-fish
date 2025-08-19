import { CameraControls, CameraControlsImpl } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { useControls } from 'leva'
import { Suspense } from 'react'
import { useDebug } from '../hooks/use-debug'
import Canvas from './Canvas'
import Environment from './Environment'
import Helpers from './Helpers'
import SoundBooard from './SoundBoard'
import World from './World'

export default function Experience() {
  const debug = useDebug()
  const physicsControls = useControls(
    'physics',
    { debug: false, paused: false },
    { collapsed: true },
  )

  return (
    <Canvas
      shadows
      camera={{
        fov: 45,
        near: 0.1,
        far: 100,
        position: [0, 10, 10],
      }}
    >
      <Environment />

      <CameraControls
        enabled={debug}
        makeDefault
        touches={{
          one: CameraControlsImpl.ACTION.NONE,
          two: CameraControlsImpl.ACTION.TOUCH_DOLLY_ROTATE,
          three: CameraControlsImpl.ACTION.NONE,
        }}
      />

      <Suspense>
        <Physics {...physicsControls}>
          <World />
          <Helpers />
        </Physics>
      </Suspense>

      <SoundBooard />
    </Canvas>
  )
}
