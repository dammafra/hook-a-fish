import { useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Euler, Object3D, Vector3 } from 'three'
import { useIsTouch } from '../hooks/use-is-touch'
import useGame from '../stores/use-game'
import FishingRod from './FishingRod'
import PhotoCamera, { type PhotoCameraHandle } from './helpers/PhotoCamera'
import PointerControls from './helpers/PointerControls'
import Target from './Target'

export default function Controller() {
  const isTouch = useIsTouch()
  const { viewport } = useThree()
  const paused = useGame(state => state.paused)

  const phase = useGame(state => state.phase)
  const setPhoto = useGame(state => state.setPhoto)

  const initialPosition = useMemo(() => new Vector3(0, 2, 3), [])
  const initialRotation = useMemo(() => new Euler(0, Math.PI * 1.65, Math.PI * 0.35), [])

  const photoCameraRef = useRef<PhotoCameraHandle>(null)

  const takePhoto = (target: Vector3) => {
    const dataUrl = photoCameraRef.current?.takePhoto(target)
    setPhoto(dataUrl)
  }

  const ref = useRef<Object3D>(null!)

  if (phase === 'ended') return

  return (
    <>
      <PointerControls
        type="billboard"
        visible={!paused}
        enabled={!paused}
        lockPositionYAt={1.48}
        positionOffset={isTouch && viewport.aspect < 1 ? [0, 0, -2] : 0}
        rotationYOffset={0.5}
        position={initialPosition}
        rotation={initialRotation}
        onMove={p => photoCameraRef.current && photoCameraRef.current.camera.position.copy(p)}
      >
        <FishingRod ref={ref} onHook={takePhoto} makeDefault />
      </PointerControls>

      <PhotoCamera ref={photoCameraRef} fov={25} size={1024} />
      <Target />
    </>
  )
}
