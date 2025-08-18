import { Center, Float, MeshDistortMaterial } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect, useMemo, type Ref } from 'react'
import { Vector3, type Mesh } from 'three'
import Bucket from '../models/Bucket'
import Grass from '../models/Grass'
import Stand from '../models/Stand'
import Tree from '../models/Tree'
import useGame from '../stores/use-game'
import Counter from './Counter'

interface WaterProps {
  ref?: Ref<Mesh>
  radius?: number
}

export default function Water({ ref, radius = 1 }: WaterProps) {
  const { gl, viewport } = useThree()
  gl.transmissionResolutionScale = 0.5

  const hooked = useGame(state => state.hooked)
  const bucketPosition = useGame(state => state.bucketPosition)
  const setBucketPosition = useGame(state => state.setBucketPosition)

  const grass = useMemo(
    () =>
      Array.from({ length: 50 }).map((_, index) => {
        const r = radius + 0.5 + Math.random() * 2
        const angle = Math.random() * Math.PI * 2
        const x = r * Math.cos(angle)
        const z = r * Math.sin(angle)
        const rotationY = Math.random() * Math.PI * 2

        return (
          <Center
            key={`grass-${index}`}
            scale={0.001}
            position={[x, 0.17, z]}
            rotation-y={rotationY}
          >
            <Grass />
          </Center>
        )
      }),
    [radius],
  )

  useEffect(() => {
    if (viewport.aspect < 1) setBucketPosition(-2.5, 0.1, 4.5)
    else setBucketPosition(-3.5, 0.1, 3)
  }, [setBucketPosition, viewport.aspect])

  return (
    <>
      <Tree scale={0.5} position={[3, 0, -3]} rotation-y={-Math.PI * 0.25} />

      <group position={bucketPosition}>
        <Counter />
        <Float speed={50} enabled={hooked}>
          <Bucket scale={2} rotation-y={Math.PI * 0.25} />
        </Float>
      </group>

      <Stand
        scale={3}
        position={bucketPosition.clone().multiply(new Vector3(-1, 1, 1))}
        rotation-y={Math.PI * 0.1}
      />

      {grass}

      <mesh receiveShadow rotation-x={-Math.PI * 0.5}>
        <circleGeometry args={[radius + 3]} />
        <meshStandardMaterial transparent opacity={0.5} color="limegreen" />
      </mesh>

      <mesh ref={ref} scale={[radius, 0.15, radius]}>
        <cylinderGeometry args={[0.8, 1, 1]} />
        <MeshDistortMaterial
          color="dodgerblue"
          transmission={0.8}
          roughness={0.3}
          thickness={0.1}
          ior={2}
        />
      </mesh>
    </>
  )
}
