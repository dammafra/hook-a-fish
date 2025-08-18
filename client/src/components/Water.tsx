import { CameraControls, MeshDistortMaterial } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { CuboidCollider, TrimeshCollider } from '@react-three/rapier'
import { useCallback, useEffect, useRef, useState } from 'react'
import { CylinderGeometry, type Mesh } from 'three'
import useGame from '../stores/use-game'

const GROUP = 0x0001 // category bit 1
const MASK = 0xffff ^ GROUP // collide with everything except itself
export const BOUNDS_COLLISION_GROUP = (GROUP << 16) | MASK

export default function Water() {
  const { gl, controls, size } = useThree()
  gl.transmissionResolutionScale = 0.5

  const radius = useGame(state => state.radius)

  const ref = useRef<Mesh>(null!)
  const [boundsGeometry] = useState(
    () =>
      new CylinderGeometry(
        radius - 1, // radius top
        radius - 1, // radius top
        5, // height
        16, // radial segments
        1, // heightsegments
        true, // open ended
      ),
  )

  const cameraAnimation = useCallback(() => {
    const cameraControls = controls as CameraControls
    cameraControls.fitToBox(ref.current, true)
    cameraControls.rotatePolarTo(Math.PI * 0.25, true)
    cameraControls.rotateAzimuthTo(0, true)
  }, [controls])

  useEffect(cameraAnimation, [cameraAnimation, size])

  useEffect(() => {
    const unsubscribePhase = useGame.subscribe(
      state => state.phase,
      phase => phase === 'ready' && cameraAnimation(),
    )
    return unsubscribePhase
  }, [cameraAnimation])

  return (
    <>
      <mesh ref={ref} scale={[radius, 0.15, radius]}>
        <cylinderGeometry args={[0.8, 1, 1]} />
        <MeshDistortMaterial
          color="dodgerblue"
          transmission={0.8}
          roughness={0.3}
          thickness={0.1}
          ior={2}
        />
      </mesh>

      <TrimeshCollider
        args={[boundsGeometry.attributes.position.array, boundsGeometry.index!.array]}
        friction={0}
        restitution={1}
        collisionGroups={BOUNDS_COLLISION_GROUP}
      />
      <CuboidCollider position={[0, -0.5, 0]} args={[radius, 0.1, radius]} friction={0} />
    </>
  )
}
