import { CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useRapier } from '@react-three/rapier'
import { button, useControls } from 'leva'
import { useEffect } from 'react'
import { Vector3 } from 'three'
import FishingRod from './FishingRod'
import Water from './Water'

const positionY = 2
const radius = 2

const getPosition = (degrees: number) => {
  const radians = degrees * (Math.PI / 180)
  const x = Math.sin(radians) * radius
  const z = Math.cos(radians) * radius
  return new Vector3(x, positionY, z)
}

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
      <FishingRod position={getPosition(0)} color="red" />
      <FishingRod position={getPosition(120)} color="orange" type="billboard" />
      {/* <FishingRod position={getPosition(240)} color="limegreen" /> */}

      <Water radius={3} />
    </>
  )
}
