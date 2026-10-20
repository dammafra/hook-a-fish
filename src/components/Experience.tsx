import { CameraControls } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { lazy, Suspense } from 'react'
import { PCFShadowMap } from 'three'
import { useControls } from '../hooks/use-controls'
import { useIsTouch } from '../hooks/use-is-touch'
import { isDebug } from '../utils/debug'
import Environment from './Environment'
import CameraRig from './helpers/CameraRig'
import Canvas from './helpers/Canvas'
import SoundBooard from './helpers/SoundBoard'
import World from './World'

// Debug only, out of the main bundle with leva and r3f-monitor
const Helpers = lazy(() => import('./helpers/Helpers'))

export default function Experience() {
  const isTouch = useIsTouch()

  const physicsControls = useControls(
    'physics',
    { debug: false, paused: false },
    { collapsed: true },
  )

  return (
    <Canvas
      shadows={{ type: PCFShadowMap }}
      onCreated={({ gl }) => {
        gl.debug.checkShaderErrors = isDebug
        gl.debug.onShaderError = console.error
      }}
      camera={{
        fov: 45,
        near: 0.1,
        far: 100,
        position: [0, 10, 10],
      }}
    >
      <Environment />

      <CameraControls enabled={isDebug && !isTouch} makeDefault minDistance={1} maxDistance={20} />

      <Physics {...physicsControls}>
        <World />
        {isDebug && (
          <Suspense>
            <Helpers />
          </Suspense>
        )}
      </Physics>

      <SoundBooard />
      <CameraRig />
    </Canvas>
  )
}
