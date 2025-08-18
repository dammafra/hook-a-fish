import { useMemo } from 'react'
import { Euler, Vector3 } from 'three'
import InstancedGrass, { type GrassInstanceProps } from '../models/InstancedGrass'
import useGame from '../stores/use-game'

export default function Grass() {
  const radius = useGame(state => state.radius)

  const grassInstances: GrassInstanceProps[] = useMemo(
    () =>
      Array.from({ length: 50 }).map(_ => {
        const r = radius + 0.5 + Math.random() * 2
        const angle = Math.random() * Math.PI * 2
        const position = new Vector3(r * Math.cos(angle), 0.17, r * Math.sin(angle))
        const rotation = new Euler(0, Math.random() * Math.PI * 2, 0)
        const scale = 0.001

        return { position, rotation, scale }
      }),
    [radius],
  )

  return (
    <>
      <InstancedGrass count={50} instances={grassInstances} />

      <mesh receiveShadow rotation-x={-Math.PI * 0.5}>
        <circleGeometry args={[radius + 3]} />
        <meshStandardMaterial transparent opacity={0.5} color="limegreen" />
      </mesh>
    </>
  )
}
