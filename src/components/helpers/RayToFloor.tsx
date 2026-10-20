import { useFrame } from '@react-three/fiber'
import { useMemo, type RefObject } from 'react'
import { Object3D, Raycaster, Vector3, type Intersection } from 'three'

interface RayToFloorProps {
  fromRef: RefObject<Object3D>
  floorRef: RefObject<Object3D>
  onHit?: (hit: Intersection) => void
  onMiss?: () => void
}

export default function RayToFloor({ fromRef, floorRef, onHit, onMiss }: RayToFloorProps) {
  const raycaster = useMemo(() => new Raycaster(), [])
  const down = useMemo(() => new Vector3(0, -1, 0), [])
  const fromWorldPosition = useMemo(() => new Vector3(), [])

  useFrame(() => {
    if (!fromRef.current || !floorRef.current) return

    fromRef.current.getWorldPosition(fromWorldPosition)
    raycaster.set(fromWorldPosition, down)
    const hits = raycaster.intersectObject(floorRef.current, true)

    if (hits.length) onHit?.(hits[0])
    else onMiss?.()
  })

  return <></>
}
