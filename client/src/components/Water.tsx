import { CameraControls, MeshDistortMaterial } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { CuboidCollider, TrimeshCollider } from '@react-three/rapier'
import { useCallback, useEffect, useRef, useState } from 'react'
import { CylinderGeometry, Vector3, type Mesh } from 'three'
import Stand from '../models/Stand'
import Tree from '../models/Tree'
import useGame from '../stores/use-game'

export default function Water() {
  const { gl, controls, size } = useThree()
  gl.transmissionResolutionScale = 0.5

  const radius = useGame(state => state.radius)
  const bucketPosition = useGame(state => state.bucketPosition)
  const started = useGame(state => state.started)

  const [boundsGeometry] = useState(() => new CylinderGeometry(radius - 1, radius - 1, 0.5, 32, 1, true)) //prettier-ignore

  const ref = useRef<Mesh>(null!)
  const cameraAnimation = useCallback(() => {
    if (!started || !controls) return

    const cameraControls = controls as CameraControls
    cameraControls.fitToBox(ref.current, true)
    cameraControls.rotatePolarTo(Math.PI * 0.25, true)
    cameraControls.rotateAzimuthTo(0, true)
  }, [controls, started])

  useEffect(cameraAnimation, [cameraAnimation, size])

  useEffect(() => {
    const unsubscribeStart = useGame.subscribe(state => state.started, cameraAnimation)
    return unsubscribeStart
  }, [cameraAnimation])

  return (
    <>
      <Tree scale={0.5} position={[3, 0, -3]} rotation-y={-Math.PI * 0.25} />

      <Stand
        scale={3}
        position={bucketPosition.clone().multiply(new Vector3(-1, 1, 1))}
        rotation-y={Math.PI * 0.1}
      />

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
      />
      <CuboidCollider position={[0, -0.5, 0]} args={[radius, 0.1, radius]} friction={0} />
    </>
  )
}
