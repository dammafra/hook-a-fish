import { QuadraticBezierLine, type QuadraticBezierLineRef } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { quat, RapierRigidBody, useRopeJoint, vec3 } from '@react-three/rapier'
import { useRef, useState, type RefObject } from 'react'
import { QuadraticBezierCurve3, Vector3 } from 'three'
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
  const line = useRef<QuadraticBezierLineRef>(null!)
  const [tubeCurve, setTubeCurve] = useState(() => new QuadraticBezierCurve3())

  const [_startAnchor] = useState(() => parsePosition(startAnchor))
  const [_endAnchor] = useState(() => parsePosition(endAnchor))

  useRopeJoint(start, end, [_startAnchor, _endAnchor, length])

  useFrame(() => {
    if (!line.current || !start.current || !end.current) return

    const startWorldPos = vec3(start.current.translation())
    const startWorldQuat = quat(start.current.rotation())
    const startOffset = _startAnchor.clone().applyQuaternion(startWorldQuat)
    const startPoint = startWorldPos.add(startOffset)

    const endWorldPos = vec3(end.current.translation())
    const endWorldQuat = quat(end.current.rotation())
    const endOffset = _endAnchor.clone().applyQuaternion(endWorldQuat)
    const endPoint = endWorldPos.add(endOffset)

    const controlPoint = new Vector3().addVectors(startWorldPos, endWorldPos).multiplyScalar(0.5)
    const direction = new Vector3(0, -1, 0)
    const length = startWorldPos.distanceTo(endWorldPos)
    const sagging = 0.3
    controlPoint.addScaledVector(direction, sagging * length)

    const parent = line.current.parent!
    parent.worldToLocal(startWorldPos)
    parent.worldToLocal(endWorldPos)
    parent.worldToLocal(controlPoint)

    if (type === 'line') line.current.setPoints(startPoint, endPoint, controlPoint)
    else setTubeCurve(new QuadraticBezierCurve3(startPoint, controlPoint, endPoint))
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
