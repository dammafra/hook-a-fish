import { QuadraticBezierLine, type QuadraticBezierLineRef } from '@react-three/drei'
import { extend, useFrame } from '@react-three/fiber'
import { RapierRigidBody, useRopeJoint } from '@react-three/rapier'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import { useRef, useState, type RefObject } from 'react'
import { Vector3 } from 'three'

extend({ MeshLineGeometry, MeshLineMaterial })

interface RopeProps {
  from: RefObject<RapierRigidBody>
  to: RefObject<RapierRigidBody>
  fromAnchor?: [number, number, number]
  toAnchor?: [number, number, number]
  length?: number
  segments?: number
}

export default function Rope({ from, to, fromAnchor, toAnchor, length = 1 }: RopeProps) {
  const [_fromAnchor] = useState(() =>
    fromAnchor ? new Vector3(fromAnchor[0], fromAnchor[1], fromAnchor[2]) : new Vector3(),
  )

  const [_toAnchor] = useState(() =>
    toAnchor ? new Vector3(toAnchor[0], toAnchor[1], toAnchor[2]) : new Vector3(),
  )

  useRopeJoint(from, to, [_fromAnchor, _toAnchor, length])

  const ref = useRef<QuadraticBezierLineRef>(null!)

  useFrame(() => {
    const { x: fx, y: fy, z: fz } = from.current.translation()
    const fromPosition = new Vector3(fx, fy, fz).add(_fromAnchor)

    const { x: tx, y: ty, z: tz } = to.current.translation()
    const endPosition = new Vector3(tx, ty, tz).add(_toAnchor)

    ref.current.setPoints(fromPosition, endPosition, endPosition)
  })

  return (
    <QuadraticBezierLine ref={ref} start={[0, 0, 0]} end={[0, 0, 0]} lineWidth={3} color="red" />
  )
}
