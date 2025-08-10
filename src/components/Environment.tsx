import { Helper } from '@react-three/drei'
import { useControls } from 'leva'
import { CameraHelper } from 'three'

export default function Environment() {
  const {
    helpers,
    ambientLightIntensity,
    directionalLightIntensity,
    directionalLightPosition,
    backgroundColor,
  } = useControls(
    'environment',
    {
      helpers: false,
      ambientLightIntensity: {
        value: 1.5,
        min: 0,
        max: 20,
        step: 0.01,
        label: 'ambient intensity',
      },
      directionalLightIntensity: {
        value: 4.5,
        min: 0,
        max: 20,
        step: 0.01,
        label: 'directional intensity',
      },
      directionalLightPosition: {
        value: [4, 4, 1],
        min: 0,
        max: 20,
        step: 0.01,
        label: 'directional position',
      },
      backgroundColor: { value: 'ivory', label: 'background' },
    },
    { collapsed: true },
  )

  return (
    <>
      <color args={[backgroundColor]} attach="background" />

      <directionalLight
        castShadow
        position={directionalLightPosition}
        intensity={directionalLightIntensity}
        shadow-mapSize={[512, 512]}
      >
        <orthographicCamera
          attach="shadow-camera"
          near={1}
          far={10}
          top={5}
          right={5}
          bottom={-5}
          left={-5}
        >
          {helpers && <Helper type={CameraHelper} />}
        </orthographicCamera>
      </directionalLight>

      <ambientLight intensity={ambientLightIntensity} />
    </>
  )
}
