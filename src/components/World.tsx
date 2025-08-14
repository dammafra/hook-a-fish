import { CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useRapier } from '@react-three/rapier'
import { button, monitor, useControls } from 'leva'
import { useRef, useState } from 'react'
import { Mesh, Vector3 } from 'three'
import Fishes from './Fishes'
import FishingRod from './FishingRod'
import Tutorial from './Tutorial'
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
  const { step, world } = useRapier()
  useControls('physics', {
    step: button(() => step(1 / 60)),
    bodies: monitor(() => world.bodies.len()),
    colliders: monitor(() => world.colliders.len()),
    joints: monitor(() => world.impulseJoints.len()),
  })

  // TODO improve
  const game = useRef<Mesh>(null!)
  const [started, setStarted] = useState(false)
  const { controls } = useThree()

  const start = () => {
    const cameraControls = controls as CameraControls
    cameraControls.fitToBox(game.current, true)
    cameraControls.rotatePolarTo(Math.PI * 0.25, true)
    cameraControls.rotateAzimuthTo(Math.PI * 0.25, true)
    cameraControls.enabled = false
    setStarted(true)
  }

  return (
    <>
      <Water ref={game} radius={3} />
      <Fishes />
      {started && <FishingRod position={getPosition(0)} color="red" />}

      <Tutorial onStart={start} />
    </>
  )
}
