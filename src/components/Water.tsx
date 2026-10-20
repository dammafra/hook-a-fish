import { GradientTexture, GradientType } from '@react-three/drei'
import { CuboidCollider, TrimeshCollider } from '@react-three/rapier'
import { useState } from 'react'
import { BackSide, CylinderGeometry } from 'three'
import useGame from '../stores/use-game'
import WaterSurface from './water/WaterSurface'

const GROUP = 0x0001 // category bit 1
const MASK = 0xffff ^ GROUP // collide with everything except itself
export const BOUNDS_COLLISION_GROUP = (GROUP << 16) | MASK

export default function Water() {
  const radius = useGame(state => state.radius)

  const [boundsGeometry] = useState(
    () =>
      new CylinderGeometry(
        radius - 0.5, // radius top
        radius - 0.5, // radius bottom
        20, // height
        16, // radial segments
        1, // heightsegments
        true, // open ended
      ),
  )

  return (
    <>
      <WaterSurface radius={radius * 1.05} shoreRadius={radius - 0.5} />

      <mesh scale={radius} position-y={-0.1} rotation-x={Math.PI * 0.5}>
        <sphereGeometry args={[1, 32, 16, 0, Math.PI]} />
        <meshStandardMaterial side={BackSide}>
          <GradientTexture
            stops={[0, 1]}
            colors={['brown', 'limegreen']}
            size={512}
            width={512}
            type={GradientType.Radial}
            innerCircleRadius={10}
            outerCircleRadius={200}
          />
        </meshStandardMaterial>
      </mesh>

      <TrimeshCollider
        args={[boundsGeometry.attributes.position.array, boundsGeometry.index!.array]}
        friction={0}
        restitution={1}
        collisionGroups={BOUNDS_COLLISION_GROUP}
      />
      <CuboidCollider position={[0, -0.5, 0]} args={[radius, 0.1, radius]} friction={0} />
    </>
  )
}
