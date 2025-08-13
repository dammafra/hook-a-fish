import { CameraControls, Html } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import type { Mesh } from 'three'

interface TutorialProps {
  onStart?: () => void
}

export default function Tutorial({ onStart }: TutorialProps) {
  const { controls, viewport } = useThree()
  const tutorial = useRef<Mesh>(null!)
  const [visible, setVisible] = useState(true)

  // TODO improve
  useEffect(() => {
    if (!controls || !tutorial) return

    const cameraControls = controls as CameraControls
    cameraControls.fitToBox(tutorial.current, false)
    viewport.aspect < 1 && cameraControls.dollyTo(30, true)
  }, [controls, tutorial.current])

  return (
    <group position={[-25, 0, 0]}>
      <mesh ref={tutorial} visible={false}>
        <planeGeometry args={[15, 20]} />
      </mesh>
      <Html className="z-10!" wrapperClass="z-10" transform center>
        <div
          className={`${visible ? 'opacity-100' : 'opacity-0'} duration-1000 transition-opacity bg-slate-900 text-white border border-white p-10 rounded-xl font-mono w-100 md:w-150 flex flex-col gap-4`}
        >
          <ul className="list-disc">
            <li>
              Control the fishing rods by <b>dragging</b> them.
            </li>
            <br />
            <li>
              The <span className="text-red-500">red fishing rod</span> has a<b> target behavior</b>
              , so it points always towards the center of the scene.
              <br />
              <br />
              The <span className="text-yellow-500">yellow fishing rod</span> has a{' '}
              <b>billboard behavior</b> instead, so it points always outside the camera.
              <br />
              <br />
              Find the one that fits you best!
            </li>
            <br />
            <li>
              On mobile you can move the camera using <b>two fingers</b>.
            </li>
            <br />
            <li>
              After you <b>Hook-A-Fish</b>, pull it high enough out of the water to catch another
              one!
            </li>
          </ul>

          <button
            className="bg-green-400 px-5 py-2 rounded-md text-slate-800 font-bold cursor-pointer active:bg-green-300 hover:bg-green-300"
            onClick={() => {
              setVisible(false)
              onStart?.()
            }}
          >
            START
          </button>
        </div>
      </Html>
    </group>
  )
}
