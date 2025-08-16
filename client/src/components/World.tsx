import { CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useRapier } from '@react-three/rapier'
import { button, monitor, useControls } from 'leva'
import { useCallback, useEffect, useRef } from 'react'
import { Mesh, Vector3 } from 'three'
import useColyseus from '../stores/use-colyseus'
import useGame from '../stores/use-game'
import Fishes from './Fishes'
import FishingRod from './FishingRod'
import Interface from './Interface'
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
  useColyseus()

  const { step, world } = useRapier()
  useControls('physics', {
    step: button(() => step(1 / 60)),
    bodies: monitor(() => world.bodies.len()),
    colliders: monitor(() => world.colliders.len()),
    joints: monitor(() => world.impulseJoints.len()),
  })

  // TODO improve
  const game = useRef<Mesh>(null!)
  const started = useGame(state => state.started)
  const { controls, size } = useThree()

  const cameraAnimation = useCallback(() => {
    if (!started || !controls) return

    const cameraControls = controls as CameraControls
    cameraControls.fitToBox(game.current, true)
    cameraControls.rotatePolarTo(Math.PI * 0.25, true)
    cameraControls.rotateAzimuthTo(Math.PI * 0.25, true)
  }, [controls, started])

  useEffect(cameraAnimation, [cameraAnimation, size])

  useEffect(() => {
    const unsubscribeStart = useGame.subscribe(state => state.started, cameraAnimation)
    return unsubscribeStart
  }, [cameraAnimation])

  return (
    <>
      {!started && <Tutorial />}

      <Water ref={game} radius={3} />
      <Fishes />

      {started && <FishingRod position={getPosition(60)} color="red" />}
      {started && <Interface />}
    </>
  )
}
