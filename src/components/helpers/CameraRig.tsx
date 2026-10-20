import type { CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { type Object3D } from 'three'
import useGame from '../../stores/use-game'

export default function CameraRig() {
  const { controls, size, scene, viewport } = useThree()
  const phase = useGame(state => state.phase)
  const target = useRef<Object3D>(null!)

  useEffect(() => {
    scene.traverse(child => {
      if (child.userData.name === 'water') target.current = child
    })
  }, [scene])

  useEffect(() => {
    if (!target || !controls) return
    const cameraControls = controls as CameraControls

    cameraControls.setTarget(0, 0, 0, true)

    if (phase === 'ready' || phase === 'ended') {
      cameraControls.rotatePolarTo(0.5, phase === 'ended')
      cameraControls.dollyTo(3, phase === 'ended')
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0094a5')
      return
    }

    if (phase === 'started') {
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#7cad33')
    }

    // TODO why do I need to call them multiple times?
    for (let i = 0; i < 3; i++) {
      cameraControls.fitToBox(target.current, true, viewport.aspect < 1 ?{ paddingLeft: -1, paddingRight: -1 } : undefined) // prettier-ignore
      cameraControls.rotatePolarTo(Math.PI * 0.25, true)
      cameraControls.setTarget(0, 0.1, 0, true)
    }

    if (viewport.aspect < 1) cameraControls.setTarget(0, -1, 0, true)
  }, [controls, target, size, viewport.aspect, phase])

  return <></>
}
