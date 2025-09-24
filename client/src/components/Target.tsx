import { useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import type { Object3D } from 'three'
import RayToFloor from './helpers/RayToFloor'

export default function Target() {
  const { scene, camera } = useThree()
  camera.layers.enable(1)

  const ref = useRef<Object3D>(null!)
  const hookRef = useRef<Object3D>(null!)
  const waterRef = useRef<Object3D>(null!)

  // TODO improve
  useEffect(() => {
    scene.traverse(child => {
      if (child.userData.name === 'hook') hookRef.current = child
      if (child.userData.name === 'water') waterRef.current = child
    })
  }, [scene])

  useEffect(() => {
    // Set target mesh to layer 1 so that will be ignored from PhotoCamera
    ref.current.layers.set(1)
  }, [])

  return (
    <>
      <mesh ref={ref} rotation-x={-Math.PI * 0.5} scale={0.025}>
        <circleGeometry />
        <meshBasicMaterial color="white" transparent opacity={0.5} />
      </mesh>
      <RayToFloor
        fromRef={hookRef}
        floorRef={waterRef}
        onHit={hit => {
          ref.current.visible = true
          ref.current.position.x = hit.point.x
          ref.current.position.y = hit.point.y + 0.001
          ref.current.position.z = hit.point.z
        }}
        onMiss={() => (ref.current.visible = false)}
      />
    </>
  )
}
