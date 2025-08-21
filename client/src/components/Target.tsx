import { useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import type { Object3D } from 'three'
import RayToFloor from './helpers/RayToFloor'

export default function Target() {
  const { scene } = useThree()

  const ref = useRef<Object3D>(null!)
  const hookRef = useRef<Object3D>(null!)
  const waterRef = useRef<Object3D>(null!)

  useEffect(() => {
    scene.traverse(child => {
      if (child.userData.name === 'hook') hookRef.current = child
      if (child.userData.name === 'water') waterRef.current = child
    })
  }, [scene])

  return (
    <>
      <mesh ref={ref} rotation-x={-Math.PI * 0.5} position-y={0.02} scale={0.025}>
        <circleGeometry />
        <meshBasicMaterial color="white" transparent opacity={0.5} />
      </mesh>
      <RayToFloor
        fromRef={hookRef}
        floorRef={waterRef}
        onHit={hit => {
          ref.current.position.x = hit.point.x
          ref.current.position.z = hit.point.z
        }}
      />
    </>
  )
}
