import { useMemo, useRef } from 'react'
import { Euler, Vector3 } from 'three'
import { useIsTouch } from '../hooks/use-is-touch'
import useGame from '../stores/use-game'
import { getPositionOnCirlce } from '../utils/position'
import FishingRod from './FishingRod'
import PhotoCamera, { type PhotoCameraHandle } from './PhotoCamera'
import PointerControls from './PointerControls'

export default function Controller() {
  const isTouch = useIsTouch()

  const phase = useGame(state => state.phase)
  const setLastPhoto = useGame(state => state.setLastPhoto)

  const initialPosition = useMemo(() => getPositionOnCirlce(2, 0, 2), [])
  const initialRotation = useMemo(() => new Euler(0, 0, Math.PI * 0.35), [])

  const photoCameraRef = useRef<PhotoCameraHandle>(null)

  const takePhoto = (target: Vector3) => {
    const dataUrl = photoCameraRef.current?.takePhoto(target)
    setLastPhoto(dataUrl)
  }

  if (phase === 'ready' || phase === 'ended') return

  return (
    <>
      <PointerControls
        type="billboard"
        hideCursor
        lockPositionYAt={1.5}
        positionOffset={isTouch ? [0, 0, -2] : 0}
        rotationYOffset={0.5}
        position={initialPosition}
        rotation={initialRotation}
        onMove={p => photoCameraRef.current && photoCameraRef.current.camera.position.copy(p)}
      >
        <FishingRod onHook={takePhoto} />
      </PointerControls>

      <PhotoCamera ref={photoCameraRef} fov={25} size={1024} />
    </>
  )
}
