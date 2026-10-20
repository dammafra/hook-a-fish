import { CameraControls } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { useControls } from 'leva'
import { PCFShadowMap } from 'three'
import { useDebug } from '../hooks/use-debug'
import { useIsTouch } from '../hooks/use-is-touch'
import Environment from './Environment'
import CameraRig from './helpers/CameraRig'
import Canvas from './helpers/Canvas'
import Helpers from './helpers/Helpers'
import SoundBooard from './helpers/SoundBoard'
import World from './World'

export default function Experience() {
  const isTouch = useIsTouch()
  const debug = useDebug()

  const physicsControls = useControls(
    'physics',
    { debug: false, paused: false },
    { collapsed: true },
  )

  return (
    <Canvas
      shadows={{ type: PCFShadowMap }}
      onCreated={({ gl }) => {
        gl.debug.checkShaderErrors = debug
        gl.debug.onShaderError = console.error
        gl.transmissionResolutionScale = 0.6
      }}
      camera={{
        fov: 45,
        near: 0.1,
        far: 100,
        position: [0, 10, 10],
      }}
    >
      <Environment />

      <CameraControls enabled={debug && !isTouch} makeDefault minDistance={1} maxDistance={20} />

      <Physics {...physicsControls}>
        <World />
        <Helpers />
      </Physics>

      <SoundBooard />
      <CameraRig />
    </Canvas>
  )
}
