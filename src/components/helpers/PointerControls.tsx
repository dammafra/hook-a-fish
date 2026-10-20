import { useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type JSX, type PropsWithChildren } from 'react'
import { Object3D, Plane, Quaternion, Vector2, Vector3 } from 'three'
import { parsePosition, type Position } from '../../utils/position'

type PointerControlsProps = JSX.IntrinsicElements['object3D'] &
  PropsWithChildren & {
    enabled?: boolean
    lockPositionYAt?: number
    positionOffset?: Position
    rotationYOffset?: number
    hideCursor?: boolean
    type?: 'billboard' | 'target' | 'fixed'
    target?: Position
    onMove?: (position: Vector3, quaternion: Quaternion) => void
  }

export default function PointerControls({
  children,
  enabled = true,
  lockPositionYAt = 0,
  positionOffset = 0,
  rotationYOffset = 0,
  hideCursor = false,
  type = 'fixed',
  target = 0,
  onMove,
  ...props
}: PointerControlsProps) {
  const { camera, gl, raycaster } = useThree()

  const ref = useRef<Object3D>(null!)

  const _target = useMemo(() => parsePosition(target), [target])
  const _positionOffset = useMemo(() => parsePosition(positionOffset), [positionOffset])

  const mouse = useMemo(() => new Vector2(), [])
  const plane = useMemo(() => new Plane(new Vector3(0, 1, 0), -lockPositionYAt), [lockPositionYAt])

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (!enabled || !ref.current) return

      const rect = gl.domElement.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

      const position = new Vector3()
      raycaster.setFromCamera(mouse, camera)
      raycaster.ray.intersectPlane(plane, position)
      ref.current.position.copy(position.add(_positionOffset))

      if (type !== 'fixed') {
        const target = type === 'billboard' ? camera.position : _target
        const dir = new Vector3().subVectors(target, position).setY(0).normalize()
        const angle = Math.atan2(dir.x, dir.z)
        const rotationY = angle + Math.PI * (type === 'billboard' ? 1.5 : 0.5)
        ref.current.rotation.y = rotationY + rotationYOffset
      }

      onMove?.(ref.current.position, ref.current.quaternion)
    }

    gl.domElement.addEventListener('pointermove', handleMove)
    if (hideCursor) gl.domElement.classList.add('cursor-none')

    return () => {
      gl.domElement.removeEventListener('pointermove', handleMove)
      gl.domElement.classList.remove('cursor-none')
    }
  }, [
    _positionOffset,
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
    rotationYOffset,
    type,
  ])

  return (
    <group {...props} ref={ref}>
      {children}
    </group>
  )
}
