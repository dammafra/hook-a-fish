import { GradientTexture, GradientType, MeshDistortMaterial } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { CuboidCollider, TrimeshCollider } from '@react-three/rapier'
import { useState } from 'react'
import { BackSide, CylinderGeometry } from 'three'
import useGame from '../stores/use-game'

const GROUP = 0x0001 // category bit 1
const MASK = 0xffff ^ GROUP // collide with everything except itself
export const BOUNDS_COLLISION_GROUP = (GROUP << 16) | MASK

export default function Water() {
  const { gl } = useThree()
  gl.transmissionResolutionScale = 0.6
  const radius = useGame(state => state.radius)

  const [boundsGeometry] = useState(
    () =>
      new CylinderGeometry(
        radius - 0.5, // radius top
        radius - 0.5, // radius top
        20, // height
        16, // radial segments
        1, // heightsegments
        true, // open ended
      ),
  )

  return (
    <>
      <mesh
        position-y={0.01}
        rotation-x={-Math.PI * 0.5}
        scale={radius * 1.05}
        userData={{ name: 'water' }}
      >
        <circleGeometry />
        <MeshDistortMaterial transmission={0.8} roughness={0.3} thickness={0.02} ior={2}>
          <GradientTexture
            stops={[0, 1]}
            colors={['dodgerblue', 'aquamarine']}
            size={512}
            width={512}
            type={GradientType.Radial}
            innerCircleRadius={200}
            outerCircleRadius={250}
          />
        </MeshDistortMaterial>
      </mesh>

      <mesh scale={radius} position={-0.1} rotation-x={Math.PI * 0.5}>
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
