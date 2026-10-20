import { useFBO } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect, useImperativeHandle, useRef, useState, type JSX, type RefObject } from 'react'
import { DepthTexture, PerspectiveCamera, SRGBColorSpace, UnsignedByteType } from 'three'
import { parsePosition, type Position } from '../../utils/position'
import { renderWithWater } from '../water/material'

export type PhotoCameraHandle = {
  camera: RefObject<PerspectiveCamera>
  takePhoto: (target?: Position) => Promise<string | undefined>
}

type PhotoCameraProps = Omit<JSX.IntrinsicElements['perspectiveCamera'], 'ref'> & {
  ref?: RefObject<PhotoCameraHandle>
  target?: Position
  size?: number
}

export default function PhotoCamera({
  ref,

  target = 0,
  size = 512,

  fov = 45,
  aspect = 1,
  near = 0.1,
  far = 100,

  ...props
}: PhotoCameraProps) {
  const { gl, scene } = useThree()
  const cameraRef = useRef<PerspectiveCamera>(null!)

  // 8 bit sRGB, to read pixels straight into the canvas
  const renderTarget = useFBO(size, size, { type: UnsignedByteType, colorSpace: SRGBColorSpace })

  // Scene without the water, see renderWithWater
  const [depthTexture] = useState(() => new DepthTexture(1, 1))
  const prePassTarget = useFBO(size, size, { depthTexture })

  const [canvas] = useState(() => {
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    return canvas
  })

  useEffect(() => {
    if (!cameraRef.current) return
    cameraRef.current.fov = fov
    cameraRef.current.aspect = aspect
    cameraRef.current.near = near
    cameraRef.current.far = far
    cameraRef.current.updateProjectionMatrix()
  }, [fov, aspect, near, far])

  const takePhoto = async (_target?: Position) => {
    const camera = cameraRef.current
    if (!camera) return

    camera.lookAt(parsePosition(_target || target))

    // render scene to render target, water needs its own pre-pass from this camera
    renderWithWater(gl, scene, camera, prePassTarget, renderTarget)

    // read pixels without stalling the GPU pipeline
    const pixels = new Uint8Array(size * size * 4)
    await gl.readRenderTargetPixelsAsync(renderTarget, 0, 0, size, size, pixels)

    // flip pixels vertically
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const imageData = ctx.createImageData(size, size)
    const rowSize = size * 4
    for (let y = 0; y < size; y++) {
      const srcStart = (size - 1 - y) * rowSize
      const destStart = y * rowSize
      imageData.data.set(pixels.subarray(srcStart, srcStart + rowSize), destStart)
    }
    ctx.putImageData(imageData, 0, 0)

    // encode off the main thread (toDataURL is synchronous)
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'))
    if (!blob) return

    return new Promise<string>(resolve => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.readAsDataURL(blob)
    })
  }

  useImperativeHandle(ref, () => ({ camera: cameraRef, takePhoto }))

  return (
    <perspectiveCamera ref={cameraRef} fov={fov} aspect={aspect} near={near} far={far} {...props} />
  )
}
