import { useThree } from '@react-three/fiber'
import { useEffect, useRef, useState, type PropsWithChildren } from 'react'
import { WebGLRenderTarget, type Group } from 'three'

/**
 * Precompiles every shader variant while the menu is shown, so objects that appear later
 * (fishes, objects culled by the menu camera, the PhotoCamera render) don't stall the main thread.
 * Children are placed far below the scene (frustum culled) only to expose their materials.
 */
export default function ShaderWarmup({ children }: PropsWithChildren) {
  const { gl, scene, camera } = useThree()
  const group = useRef<Group>(null!)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let cancelled = false
    const target = new WebGLRenderTarget(1, 1)

    const warmup = async () => {
      // on-screen variants, non-blocking thanks to KHR_parallel_shader_compile
      await gl.compileAsync(scene, camera)

      // render target variants (linear output, no tone mapping) used by transmission and PhotoCamera
      gl.setRenderTarget(target)
      const compiling = gl.compileAsync(scene, camera)
      gl.setRenderTarget(null)
      await compiling
      if (cancelled) return

      // one off-screen render with culling disabled warms shadow depth materials and texture uploads
      group.current.traverse(child => (child.frustumCulled = false))
      gl.setRenderTarget(target)
      gl.render(scene, camera)
      gl.setRenderTarget(null)

      setDone(true)
    }

    warmup()

    return () => {
      cancelled = true
      target.dispose()
    }
  }, [gl, scene, camera])

  if (done) return null

  return (
    <group ref={group} position-y={-100}>
      {children}
    </group>
  )
}
