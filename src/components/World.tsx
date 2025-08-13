import { CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useRapier } from '@react-three/rapier'
import { button, useControls } from 'leva'
import { useEffect } from 'react'
import FishingRod from './FishingRod'
import Water from './Water'

export default function World() {
  const { step } = useRapier()
  const { controls, viewport } = useThree()

  useControls('physics', { step: button(() => step(1 / 60)) })

  // TODO improve
  useEffect(() => {
    if (!controls) return

    const cameraControls = controls as CameraControls
    cameraControls.truck(0, viewport.aspect < 1 ? -1 : -0.5, true)
    cameraControls.dollyTo(10, true)
  }, [controls])

  return (
    <>
      <FishingRod position={0} color="red" />
      <FishingRod position={120} color="orange" />
      <FishingRod position={240} color="limegreen" />

      <Water radius={3} />
    </>
  )
}
