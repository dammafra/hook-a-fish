import type { CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect, useState } from 'react'
import { type Object3D } from 'three'
import useGame from '../stores/use-game'

export default function CameraRig() {
  const { controls, size, scene } = useThree()
  const phase = useGame(state => state.phase)
  const [target, setTarget] = useState<Object3D>(null!)

  useEffect(() => {
    scene.traverse(child => {
      if (child.userData.name === 'water') setTarget(child)
    })
  }, [scene])

  useEffect(() => {
    if (!target || !controls) return
    const cameraControls = controls as CameraControls

    if (phase === 'ready') {
      cameraControls.rotatePolarTo(0.5, false)
      cameraControls.dollyTo(3, false)
      return
    }

    // TODO why do I need to call them two times?
    cameraControls.fitToBox(target, true)
    cameraControls.rotatePolarTo(Math.PI * 0.25, true)
    cameraControls.fitToBox(target, true)
    cameraControls.rotatePolarTo(Math.PI * 0.25, true)
    cameraControls.setTarget(0, 0.1, 0, true)

    // TODO improve mobile positioning
  }, [controls, target, size, phase])

  return <></>
}
