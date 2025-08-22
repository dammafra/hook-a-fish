import { QuadraticBezierLine, type QuadraticBezierLineRef } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { RapierRigidBody, useRopeJoint } from '@react-three/rapier'
import { useEffect, useRef, useState, type RefObject } from 'react'
import { Object3D, QuadraticBezierCurve3, Quaternion, Vector3 } from 'three'
import { parsePosition, type Position } from '../utils/position'

interface RopeProps {
  start: RefObject<RapierRigidBody>
  end: RefObject<RapierRigidBody>
  startAnchor?: Position
  endAnchor?: Position
  length?: number
  radius?: number
  type?: 'line' | 'tube'
}

const getWorldPositionOffset = (object: Object3D) => {
  const offset = new Vector3()

  let parent = object.parent
  while (parent) {
    offset.sub(parent.position)
    parent = parent.parent
  }

  return offset
}

// TODO: find a way to implement collisions, using instanced meshes along the curve might be an idea
export default function Rope({
  start,
  end,
  startAnchor = 0,
  endAnchor = 0,
  length = 1,
  radius = 0.01,
  type = 'line',
}: RopeProps) {
  const [offset, setOffset] = useState<[number, number, number]>([0, 0, 0])
  const line = useRef<QuadraticBezierLineRef>(null!)
  const [tubeCurve, setTubeCurve] = useState(() => new QuadraticBezierCurve3())

  const [_startAnchor] = useState(() => parsePosition(startAnchor))
  const [_endAnchor] = useState(() => parsePosition(endAnchor))

  useEffect(() => {
    if (!line.current) return

    const offset = getWorldPositionOffset(line.current)
    setOffset(offset.toArray())
  }, [])

  useRopeJoint(start, end, [_startAnchor, _endAnchor, length])

  useFrame(() => {
    if (!line.current) return

    const startPoint = _startAnchor
      .clone()
      .applyQuaternion(start.current.rotation() as Quaternion)
      .add(start.current.translation() as Vector3)

    const endPoint = _endAnchor
      .clone()
      .applyQuaternion(end.current.rotation() as Quaternion)
      .add(end.current.translation() as Vector3)

    const controlPoint = new Vector3().addVectors(startPoint, endPoint).multiplyScalar(0.5)
    const direction = new Vector3(0, -1, 0)
    const length = startPoint.distanceTo(endPoint)
    const sagging = 0.3
    controlPoint.addScaledVector(direction, sagging * length)

    if (type === 'line') line.current.setPoints(startPoint, endPoint, controlPoint)
    else setTubeCurve(new QuadraticBezierCurve3(startPoint, controlPoint, endPoint))

    line.current.geometry.translate(...offset)
  })

  return type === 'line' ? (
    <QuadraticBezierLine
      start={_startAnchor}
      end={_endAnchor}
      ref={line}
      lineWidth={radius * 300}
      color="white"
    />
  ) : (
    <mesh ref={line} castShadow>
      <tubeGeometry args={[tubeCurve, 6, radius, 3, false]} />
      <meshBasicMaterial color="white" />
    </mesh>
  )
}
