import { QuadraticBezierLine, type QuadraticBezierLineRef } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { RapierRigidBody, useRopeJoint } from '@react-three/rapier'
import { useRef, useState, type RefObject } from 'react'
import { QuadraticBezierCurve3, Quaternion, Vector3 } from 'three'

interface RopeProps {
  start: RefObject<RapierRigidBody>
  end: RefObject<RapierRigidBody>
  startAnchor?: [number, number, number]
  endAnchor?: [number, number, number]
  length?: number
  type?: 'line' | 'tube'
}

// TODO: find a way to implement collisions, using instanced meshes along the curve might be an idea
export default function Rope({
  start,
  end,
  startAnchor = [0, 0, 0],
  endAnchor = [0, 0, 0],
  length = 1,
  type = 'line',
}: RopeProps) {
  const line = useRef<QuadraticBezierLineRef>(null!)
  const [tubeCurve, setTubeCurve] = useState(() => new QuadraticBezierCurve3())

  useRopeJoint(start, end, [
    new Vector3().fromArray(startAnchor),
    new Vector3().fromArray(endAnchor),
    length,
  ])

  useFrame(() => {
    const startPoint = new Vector3()
      .fromArray(startAnchor)
      .applyQuaternion(start.current.rotation() as Quaternion)
      .add(start.current.translation() as Vector3)

    const endPoint = new Vector3()
      .fromArray(endAnchor)
      .applyQuaternion(end.current.rotation() as Quaternion)
      .add(end.current.translation() as Vector3)

    const controlPoint = new Vector3().addVectors(startPoint, endPoint).multiplyScalar(0.5)
    const gravity = new Vector3(0, -1, 0)
    const length = startPoint.distanceTo(endPoint)
    const sagging = 0.3
    controlPoint.addScaledVector(gravity, sagging * length)

    type === 'line'
      ? line.current.setPoints(startPoint, endPoint, controlPoint)
      : setTubeCurve(new QuadraticBezierCurve3(startPoint, controlPoint, endPoint))
  })

  return type === 'line' ? (
    // @ts-ignore
    <QuadraticBezierLine ref={line} lineWidth={3} color="white" />
  ) : (
    <mesh castShadow>
      <tubeGeometry args={[tubeCurve, 6, 0.01, 3, false]} />
      <meshStandardMaterial color="white" flatShading />
    </mesh>
  )
}
