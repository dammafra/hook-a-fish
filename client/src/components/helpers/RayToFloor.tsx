import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, type RefObject } from 'react'
import { Mesh, Object3D, Raycaster, Vector3, type Intersection } from 'three'

interface RayToFloorProps {
  fromRef: RefObject<Object3D>
  minDistance?: number
  onHit?: (hit: Intersection) => void
}

export default function RayToFloor({ fromRef, minDistance = 0, onHit }: RayToFloorProps) {
  const { scene } = useThree()
  const raycaster = useMemo(() => new Raycaster(), [])
  const down = useMemo(() => new Vector3(0, -1, 0), [])
  const fromWorldPosition = useMemo(() => new Vector3(), [])

  useFrame(() => {
    if (!fromRef.current) return
    fromRef.current.getWorldPosition(fromWorldPosition)
    raycaster.set(fromWorldPosition, down)

    const toTest: Object3D[] = []
    scene.traverse(child => {
      if (child instanceof Mesh && !child.type.includes('Line')) toTest.push(child)
    })

    const hits = raycaster.intersectObjects(toTest).filter(hit => hit.distance > minDistance)
    if (hits.length && onHit) onHit(hits[0])
  })

  return <></>
}
