import { Base, Geometry, Subtraction } from '@react-three/csg'
import { GradientTexture, GradientType, Sparkles } from '@react-three/drei'
import { useMemo } from 'react'
import { Euler, Vector3 } from 'three'
import type { GrassInstanceProps } from '../models/InstancedGrass'
import InstancedGrass from '../models/InstancedGrass'
import Stand from '../models/Stand'
import Tree from '../models/Tree'
import useGame from '../stores/use-game'

export default function Grass() {
  const radius = useGame(state => state.radius)
  const bucketPosition = useGame(state => state.bucketPosition)

  // const setupTexture = (texture: Texture) => {
  //   texture.repeat.set(6, 6)
  //   texture.wrapS = texture.wrapT = RepeatWrapping
  //   return texture
  // }

  // const map = setupTexture(useTexture('./textures/grass/grass_01_color_1k.png'))
  // const displacementMap = setupTexture(useTexture('./textures/grass/grass_01_height_1k.png'))
  // const normalMap = setupTexture(useTexture('./textures/grass/grass_01_normal_gl_1k.png'))
  // const aoMap = setupTexture(useTexture('./textures/grass/grass_01_ambient_occlusion_1k.png'))
  // const roughnessMap = setupTexture(useTexture('./textures/grass/grass_01_roughness_1k.png'))

  const grassInstancesCount = 100
  const grassInstances: GrassInstanceProps[] = useMemo(
    () =>
      Array.from({ length: grassInstancesCount }).map(() => {
        const r = radius + 0.5 + Math.random() * 3
        const angle = Math.random() * Math.PI * 2
        const position = new Vector3(r * Math.cos(angle), 0.17, r * Math.sin(angle))
        const rotation = new Euler(0, Math.random() * Math.PI * 2, 0)
        const scale = Math.random() * (0.002 - 0.001) + 0.001

        return { position, rotation, scale }
      }),
    [radius],
  )

  return (
    <>
      <mesh receiveShadow>
        <meshStandardMaterial
        // map={map}
        // displacementMap={displacementMap}
        // displacementScale={0.5}
        // normalMap={normalMap}
        // aoMap={aoMap}
        // roughnessMap={roughnessMap}
        >
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
          <Subtraction scale={radius - 0.5}>
            <icosahedronGeometry args={[1, 4]} />
          </Subtraction>
        </Geometry>
      </mesh>

      <InstancedGrass count={grassInstancesCount} instances={grassInstances} />

      <Tree scale={0.45} position={[1.5, 0, -4.5]} rotation-y={-Math.PI * 0.15} />
      <Tree scale={0.5} position={[3, 0, -5]} rotation-y={-Math.PI * 0.2} />
      <Tree scale={0.48} position={[3.5, 0, -3.5]} rotation-y={-Math.PI * 0.25} />

      <Stand
        scale={3}
        position={bucketPosition.clone().multiply(new Vector3(-1, 1, 1))}
        rotation-y={Math.PI * 0.2}
      />

      <Sparkles size={5} scale={[10, 2, 10]} position-y={1} speed={0.5} count={20} color="white" />
    </>
  )
}
