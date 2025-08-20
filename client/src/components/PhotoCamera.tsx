import { useThree } from '@react-three/fiber'
import { useImperativeHandle, useRef, useState, type JSX, type Ref } from 'react'
import { PerspectiveCamera, SRGBColorSpace, WebGLRenderTarget } from 'three'
import { parsePosition, type Position } from '../utils/position'

export type PhotoCameraHandle = {
  cameraRef?: Ref<PerspectiveCamera>
  takePhoto: () => string | null
}

type PhotoCameraProps = JSX.IntrinsicElements['perspectiveCamera'] & {
  ref?: Ref<PhotoCameraHandle>
  target?: Position
  size?: number
}

export default function PhotoCamera({ ref, target = 0, size = 512 }: PhotoCameraProps) {
  const { gl, scene } = useThree()
  const cameraRef = useRef<PerspectiveCamera>(null!)
  const [rt] = useState(() => {
    const target = new WebGLRenderTarget(size, size)
    target.texture.colorSpace = SRGBColorSpace
    return target
  })

  const takePhoto = () => {
    const camera = cameraRef.current
    if (!camera) return null

    camera.lookAt(parsePosition(target))

    // render scene to render target
    gl.setRenderTarget(rt)
    gl.render(scene, camera)
    gl.setRenderTarget(null)

    // read pixels
    const pixels = new Uint8Array(size * size * 4)
    gl.readRenderTargetPixels(rt, 0, 0, size, size, pixels)

    // create canvas and flip pixels vertically
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const imageData = ctx.createImageData(size, size)
    const rowSize = size * 4
    for (let y = 0; y < size; y++) {
      const srcStart = (size - 1 - y) * rowSize
      const destStart = y * rowSize
      imageData.data.set(pixels.subarray(srcStart, srcStart + rowSize), destStart)
    }
    ctx.putImageData(imageData, 0, 0)

    return canvas.toDataURL('image/png')
  }

  useImperativeHandle(ref, () => ({ cameraRef, takePhoto }))

  return (
    <perspectiveCamera
      ref={cameraRef}
      fov={45}
      aspect={1}
      near={0.1}
      far={100}
      position={[0, 5, 6]}
    />
  )
}
