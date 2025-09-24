import { useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { Euler, Quaternion, Vector3 } from 'three'
import { useIsTouch } from '../hooks/use-is-touch'
import useGame from '../stores/use-game'
import FishingRod, { type FishingRodHandle } from './FishingRod'
import PhotoCamera, { type PhotoCameraHandle } from './helpers/PhotoCamera'
import PointerControls from './helpers/PointerControls'
import Target from './Target'

export default function Controller() {
  const isTouch = useIsTouch()
  const { gl } = useThree()

  const paused = useGame(state => state.paused)
  const phase = useGame(state => state.phase)
  const flip = useGame(state => state.flip)
  const setPhoto = useGame(state => state.setPhoto)

  // TODO*:
  // const initialPosition = useMemo(() => new Vector3(0, 3, viewport.aspect < 1 ? 5 : 3), [viewport.aspect]) //prettier-ignore
  // const initialRotation = useMemo(() => new Euler(0, -Math.PI * 0.25 * (flip ? Math.PI : 1), Math.PI * 0.35), [flip]) //prettier-ignore
  const initialPosition = useMemo(() => new Vector3(0, 3, 5), [])
  const initialRotation = useMemo(() => new Euler(0, -Math.PI * 0.25, Math.PI * 0.35), [])

  const fishingRod = useRef<FishingRodHandle>(null!)
  const photoCamera = useRef<PhotoCameraHandle>(null!)

  const onMove = (position: Vector3, quaternion: Quaternion) => {
    if (!fishingRod.current) return

    fishingRod.current.body.current.setTranslation(position, false)
    fishingRod.current.body.current.setRotation(quaternion, false)
  }

  const takePhoto = (target: Vector3) => {
    const dataUrl = photoCamera.current?.takePhoto(target)
    setPhoto(dataUrl)
  }

  useEffect(() => {
    gl.domElement.classList.toggle('cursor-grab!', !paused)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused])

  useEffect(() => {
    const rotation = initialRotation.clone()
    rotation.y = rotation.y * (flip ? 3 : 1)
    onMove(initialPosition, new Quaternion().setFromEuler(rotation))
  }, [flip, initialPosition, initialRotation])

  if (phase === 'ended') return

  return (
    <>
      <PointerControls
        type="billboard"
        visible={!paused}
        enabled={!paused}
        lockPositionYAt={1.5}
        positionOffset={isTouch ? [flip ? 1 : -1, 1, -0.5] : [flip ? 0.5 : -0.5, 0, -0.5]}
        rotationYOffset={flip ? -0.5 : 0.5}
        position={initialPosition}
        rotation={initialRotation}
        onMove={onMove}
      >
        <PhotoCamera ref={photoCamera} fov={25} size={1024} />
      </PointerControls>

      <FishingRod
        ref={fishingRod}
        makeDefault
        onHook={takePhoto}
        ropeLength={isTouch ? 2.25 : 1.25} // make sure the distance to water is around 0.324
        position={initialPosition}
        rotation={initialRotation}
      />
      <Target />
    </>
  )
}
