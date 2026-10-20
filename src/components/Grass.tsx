import { Base, Geometry, Subtraction } from '@react-three/csg'
import { GradientTexture, GradientType, Sparkles } from '@react-three/drei'
import { useMemo } from 'react'
import { Euler, Vector3 } from 'three'
import useGame from '../stores/use-game'
import { random, randomAngle } from '../utils/random'
import Bucket, { BUCKET_WATER_RADIUS } from './Bucket'
import InstancedGrass from './models/InstancedGrass'
import Tree from './models/Tree'
import Tools from './Tools'
import { createShoreGeometry } from './water/shore'

// Bucket footprint plus the size of a tuft
const BUCKET_CLEARANCE = BUCKET_WATER_RADIUS + 0.35

export default function Grass() {
  const radius = useGame(state => state.radius)
  const bucketPosition = useGame(state => state.bucketPosition)

  const shoreGeometry = useMemo(() => createShoreGeometry(radius - 0.5), [radius])

  const grassInstancesCount = 150
  const grassInstances = useMemo(
    () =>
      Array.from({ length: grassInstancesCount }).map(() => {
        const r = random(radius + 0.75, radius + 4)
        const angle = randomAngle()
        const position = new Vector3(r * Math.cos(angle), 0.17, r * Math.sin(angle))
        const rotation = new Euler(0, randomAngle(), 0)
        const scale = random(0.001, 0.002)

        return { position, rotation, scale }
      }),
    [radius],
  )

  // Filtered rather than regenerated, so the rest of the grass stays put when the bucket moves (flip, resize)
  const visibleGrassInstances = useMemo(
    () =>
      grassInstances.filter(
        ({ position }) =>
          !bucketPosition ||
          Math.hypot(position.x - bucketPosition.x, position.z - bucketPosition.z) >
            BUCKET_CLEARANCE,
      ),
    [grassInstances, bucketPosition],
  )

  return (
    <>
      <mesh receiveShadow>
        <meshStandardMaterial>
          <GradientTexture
            stops={[0, 1]}
            colors={['#9BC45E', '#598719']}
            size={512}
            width={512}
            type={GradientType.Radial}
            innerCircleRadius={10}
            outerCircleRadius={100}
          />
        </meshStandardMaterial>
        <Geometry>
          <Base rotation-x={-Math.PI * 0.5}>
            <planeGeometry args={[50, 50]} />
          </Base>
          <Subtraction geometry={shoreGeometry} />
        </Geometry>
      </mesh>

      <InstancedGrass count={grassInstancesCount} instances={visibleGrassInstances} />

      <Tree scale={0.45} position={[1.5, 0, -4.5]} rotation-y={-Math.PI * 0.15} />
      <Tree scale={0.5} position={[3, 0, -5]} rotation-y={-Math.PI * 0.2} />
      <Tree scale={0.48} position={[3.5, 0, -3.5]} rotation-y={-Math.PI * 0.25} />

      <Bucket />
      <Tools />

      <Sparkles size={5} scale={[10, 2, 10]} position-y={1} speed={0.5} count={20} color="white" />
    </>
  )
}
