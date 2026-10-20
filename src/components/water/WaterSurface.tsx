import { useFBO } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useControls } from 'leva'
import { useEffect, useState } from 'react'
import { DepthTexture } from 'three'
import { waterTime } from './events'
import {
  floatingObjectRef,
  pondWaterMaterial,
  waterObjects,
  waterPass,
  waterSurfaceRef,
  waterUniforms,
} from './material'
import Splashes from './Splashes'

interface WaterSurfaceProps {
  /** Size of the water disc, larger than the pond: the shader cuts the actual shoreline */
  radius: number
  /** Base radius of the pond outline (see shore.ts), used for shore foam */
  shoreRadius: number
}

export default function WaterSurface({ radius, shoreRadius }: WaterSurfaceProps) {
  const size = useThree(state => state.size)
  const dpr = useThree(state => Math.min(state.viewport.dpr, 1))

  // Scene without the water: color for refraction, depth for absorption and contact foam
  const [depthTexture] = useState(() => new DepthTexture(1, 1))
  const target = useFBO(size.width * dpr, size.height * dpr, { depthTexture })

  const controls = useControls(
    'water',
    {
      shallowColor: '#74d6a6',
      deepColor: '#1f4f96',
      foamColor: '#aef3ec',
      depthMax: { value: 1.2, min: 0.1, max: 5, step: 0.01 },
      refraction: { value: 0.02, min: 0, max: 0.1, step: 0.001 },
      foamWidth: { value: 0.12, min: 0, max: 0.5, step: 0.01 },
      shoreWaves: { value: 0.1, min: 0, max: 0.3, step: 0.01 },
      rippleRadius: { value: 0.45, min: 0.05, max: 2, step: 0.01 },
      rippleLife: { value: 1.5, min: 0.1, max: 5, step: 0.01 },
    },
    { collapsed: true },
  )

  useEffect(() => {
    const uniforms = waterUniforms
    uniforms.uSceneColor.value = target.texture
    uniforms.uSceneDepth.value = target.depthTexture
    uniforms.uShallowColor.value.set(controls.shallowColor)
    uniforms.uDeepColor.value.set(controls.deepColor)
    uniforms.uFoamColor.value.set(controls.foamColor)
    uniforms.uDepthMax.value = controls.depthMax
    uniforms.uRefraction.value = controls.refraction
    uniforms.uFoamWidth.value = controls.foamWidth
    uniforms.uShoreWaves.value = controls.shoreWaves
    uniforms.uRippleRadius.value = controls.rippleRadius
    uniforms.uRippleLife.value = controls.rippleLife
    uniforms.uShoreRadius.value = shoreRadius
  }, [target, controls, shoreRadius])

  // Takes over rendering (priority > 0) so the pre-pass runs after physics and controls updates,
  // keeping the refracted fish aligned with the parts sticking out of the water
  useFrame(({ gl, scene, camera }) => {
    waterUniforms.uTime.value = waterTime()
    waterPass.camera = camera

    for (const object of waterObjects) object.visible = false
    gl.setRenderTarget(target)
    gl.render(scene, camera)
    gl.setRenderTarget(null)
    for (const object of waterObjects) object.visible = true

    // Shadow maps were just computed by the pre-pass
    gl.shadowMap.autoUpdate = false
    gl.render(scene, camera)
    gl.shadowMap.autoUpdate = true
  }, 1)

  return (
    <>
      <mesh
        ref={waterSurfaceRef}
        position-y={0.005} // just above the grass, to spill over it
        rotation-x={-Math.PI * 0.5}
        scale={radius}
        material={pondWaterMaterial}
        userData={{ name: 'water' }}
      >
        <circleGeometry args={[1, 64]} />
      </mesh>

      <group ref={floatingObjectRef}>
        <Splashes />
      </group>
    </>
  )
}
