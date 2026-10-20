import { QuadraticBezierLine, type QuadraticBezierLineRef } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { RapierRigidBody, useRopeJoint } from '@react-three/rapier'
import { useRef, useState, type RefObject } from 'react'
import { QuadraticBezierCurve3, Quaternion, Vector3 } from 'three'
import { parsePosition, type Position } from '../utils/position'

// Scratch objects reused every frame to avoid garbage collection hitches
const _startPoint = new Vector3()
const _endPoint = new Vector3()
const _controlPoint = new Vector3()
const _offset = new Vector3()
const _quaternion = new Quaternion()
const _down = new Vector3(0, -1, 0)

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

    _quaternion.copy(start.current.rotation())
    _offset.copy(_startAnchor).applyQuaternion(_quaternion)
    _startPoint.copy(start.current.translation()).add(_offset)

    _quaternion.copy(end.current.rotation())
    _offset.copy(_endAnchor).applyQuaternion(_quaternion)
    _endPoint.copy(end.current.translation()).add(_offset)

    const length = _startPoint.distanceTo(_endPoint)
    const sagging = 0.3
    _controlPoint
      .addVectors(_startPoint, _endPoint)
      .multiplyScalar(0.5)
      .addScaledVector(_down, sagging * length)

    const parent = line.current.parent!
    parent.worldToLocal(_startPoint)
    parent.worldToLocal(_endPoint)
    parent.worldToLocal(_controlPoint)

    if (type === 'line') line.current.setPoints(_startPoint, _endPoint, _controlPoint)
    else
      setTubeCurve(
        new QuadraticBezierCurve3(_startPoint.clone(), _controlPoint.clone(), _endPoint.clone()),
      )
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
