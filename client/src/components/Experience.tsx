import { CameraControls, CameraControlsImpl } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { useControls } from 'leva'
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
      gl={{ debug: { checkShaderErrors: debug, onShaderError: console.error } }}
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
        makeDefault
        minDistance={1}
        maxDistance={20}
        // TODO: enable dolly
        mouseButtons={
          debug
            ? undefined
            : {
                left: CameraControlsImpl.ACTION.NONE,
                right: CameraControlsImpl.ACTION.NONE,
                middle: CameraControlsImpl.ACTION.NONE,
                wheel: CameraControlsImpl.ACTION.NONE,
              }
        }
        touches={{
          one: CameraControlsImpl.ACTION.NONE,
          two: CameraControlsImpl.ACTION.NONE,
          three: CameraControlsImpl.ACTION.NONE,
        }}
      />

      <Physics {...physicsControls}>
        <World />
        <Helpers />
      </Physics>

      <SoundBooard />
    </Canvas>
  )
}
