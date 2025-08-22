import { useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { Euler, Vector3 } from 'three'
import { useIsTouch } from '../hooks/use-is-touch'
import useGame from '../stores/use-game'
import FishingRod from './FishingRod'
import PhotoCamera, { type PhotoCameraHandle } from './helpers/PhotoCamera'
import PointerControls from './helpers/PointerControls'
import Target from './Target'

export default function Controller() {
  const isTouch = useIsTouch()
  const { gl, viewport } = useThree()

  const paused = useGame(state => state.paused)
  const phase = useGame(state => state.phase)
  const flip = useGame(state => state.flip)
  const setPhoto = useGame(state => state.setPhoto)

  const initialPosition = useMemo(() => new Vector3(0, 3, viewport.aspect < 1 ? 5 : 3), [viewport.aspect]) //prettier-ignore
  const initialRotation = useMemo(
    () => new Euler(0, -Math.PI * 0.25 * (flip ? Math.PI : 1), Math.PI * 0.35),
    [flip],
  )

  const photoCameraRef = useRef<PhotoCameraHandle>(null)

  const takePhoto = (target: Vector3) => {
    const dataUrl = photoCameraRef.current?.takePhoto(target)
    setPhoto(dataUrl)
  }

  useEffect(() => {
    gl.domElement.classList.toggle('cursor-grab!', !paused)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused])

  if (phase === 'ended') return

  return (
    <>
      <PointerControls
        type="billboard"
        visible={!paused}
        enabled={!paused}
        lockPositionYAt={1.5}
        positionOffset={[-0.5, 1, isTouch ? -1 : 0]}
        rotationYOffset={flip ? -0.8 : 0.8}
        position={initialPosition}
        rotation={initialRotation}
        onMove={p => photoCameraRef.current && photoCameraRef.current.camera.position.copy(p)}
      >
        <FishingRod makeDefault onHook={takePhoto} ropeLength={2.5} />
      </PointerControls>

      {/* TODO put inside a group togeher with FishingRod as child of  PointerControls removing onMove */}
      {/* In order to do this, reimplemnt Rope component */}
      <PhotoCamera ref={photoCameraRef} fov={25} size={1024} />
      <Target />
    </>
  )
}
