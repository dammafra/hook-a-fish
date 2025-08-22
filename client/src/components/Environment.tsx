import { Helper, SoftShadows } from '@react-three/drei'
import { useControls } from 'leva'
import { CameraHelper } from 'three'

export default function Environment() {
  const { helpers, ambientLightIntensity, directionalLightIntensity, directionalLightPosition } =
    useControls(
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
          value: 3.5,
          min: 0,
          max: 20,
          step: 0.01,
          label: 'directional intensity',
        },
        directionalLightPosition: {
          value: [0, 4, 3],
          min: 0,
          max: 20,
          step: 0.01,
          label: 'directional position',
        },
      },
      { collapsed: true },
    )

  return (
    <>
      <directionalLight
        castShadow
        position={directionalLightPosition}
        intensity={directionalLightIntensity}
        shadow-mapSize={[1024, 1024]}
      >
        <orthographicCamera
          attach="shadow-camera"
          near={-5}
          far={10}
          top={10}
          right={10}
          bottom={-10}
          left={-10}
        >
          {helpers && <Helper type={CameraHelper} />}
        </orthographicCamera>
      </directionalLight>

      <ambientLight intensity={ambientLightIntensity} />

      <SoftShadows size={15} />
    </>
  )
}
