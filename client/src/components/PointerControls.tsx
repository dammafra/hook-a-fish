import { useThree } from '@react-three/fiber'
import { useEffect, useMemo, type RefObject } from 'react'
import { Object3D, Plane, Vector2, Vector3 } from 'three'
import { parsePosition, type Position } from '../utils/position'

interface PointerControlsProps {
  targetRef: RefObject<Object3D>
  enabled?: boolean
  lockPositionYAt?: number
  offset?: Position
  hideCursor?: boolean
  type?: 'billboard' | 'target' | 'fixed'
  target?: Position
  onMove?: () => void
}

export default function PointerControls({
  targetRef,
  enabled = true,
  lockPositionYAt = 0,
  offset = 0,
  hideCursor = false,
  type = 'target',
  target = 0,
  onMove,
}: PointerControlsProps) {
  const { camera, gl, raycaster } = useThree()

  const _target = useMemo(() => parsePosition(target), [target])
  const _offset = useMemo(() => parsePosition(offset), [offset])

  const mouse = useMemo(() => new Vector2(), [])
  const plane = useMemo(() => new Plane(new Vector3(0, 1, 0), -lockPositionYAt), [lockPositionYAt])

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (!enabled) return
      if (!targetRef.current) return

      const rect = gl.domElement.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

      const position = new Vector3()
      raycaster.setFromCamera(mouse, camera)
      raycaster.ray.intersectPlane(plane, position)
      targetRef.current.position.copy(position.add(_offset))

      if (type !== 'fixed') {
        const target = type === 'billboard' ? camera.position : _target
        const dir = new Vector3().subVectors(target, position).setY(0).normalize()
        const angle = Math.atan2(dir.x, dir.z)
        const rotationY = angle + Math.PI * (type === 'billboard' ? 1.5 : 0.5)
        targetRef.current.rotation.y = rotationY
      }

      onMove?.()
    }

    gl.domElement.addEventListener('pointermove', handleMove)
    if (hideCursor) gl.domElement.classList.add('cursor-none')

    return () => {
      gl.domElement.removeEventListener('pointermove', handleMove)
      gl.domElement.classList.remove('cursor-none')
    }
  }, [
    _offset,
    _target,
    camera,
    enabled,
    gl,
    hideCursor,
    lockPositionYAt,
    mouse,
    onMove,
    plane,
    raycaster,
    targetRef,
    type,
  ])

  return null
}
