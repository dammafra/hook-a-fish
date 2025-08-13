import { CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useRapier } from '@react-three/rapier'
import { button, monitor, useControls } from 'leva'
import { useRef, useState } from 'react'
import { Group, Vector3 } from 'three'
import Fish from './Fish'
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
  const game = useRef<Group>(null!)
  const { controls } = useThree()

  const start = () => {
    const cameraControls = controls as CameraControls
    cameraControls.fitToBox(game.current, true)
    cameraControls.rotatePolarTo(Math.PI * 0.25, true)
    cameraControls.rotateAzimuthTo(Math.PI * 0.25, true)
  }

  const [fishes, setFishes] = useState(Array.from({ length: 20 }, (_, i) => i))
  const onRemove = (id: number) => setFishes(fishes => fishes.filter(fid => fid !== id))

  return (
    <>
      <group ref={game}>
        <FishingRod position={getPosition(0)} color="red" />
        <FishingRod position={getPosition(120)} color="orange" type="billboard" />
        {/* <FishingRod position={getPosition(240)} color="limegreen" /> */}

        {fishes.map(id => (
          <Fish key={`fish-${id}`} id={id} onRemove={onRemove} />
        ))}

        <Water radius={3} />
      </group>

      <Tutorial onStart={start} />
    </>
  )
}
