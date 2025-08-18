import { CameraControls, CameraControlsImpl } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { useControls } from 'leva'
import { Suspense } from 'react'
import Canvas from './Canvas'
import Environment from './Environment'
import Helpers from './Helpers'
import World from './World'

export default function Experience() {
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
        far: 200,
      }}
    >
      <Environment />

      <CameraControls
        enabled={false}
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
    </Canvas>
  )
}
