import { animated, useTransition } from '@react-spring/web'
import { Html, type CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { useIsTouch } from '../hooks/use-is-touch'
import useGame from '../stores/use-game'
import useMenu from '../stores/use-menu'

export default function Menu() {
  const phase = useGame(state => state.phase)
  const sections = useMenu(state => state.sections)

  const { controls, size } = useThree()
  const cameraAnimation = () => {
    if (phase !== 'ready') return

    const cameraControls = controls as CameraControls
    if (!cameraControls) return

    cameraControls.rotatePolarTo(0.5, false)
    cameraControls.dollyTo(3, false)
  }

  useEffect(cameraAnimation, [size, controls])

  const transitions = useTransition(sections, {
    from: { opacity: 0 },
    enter: { opacity: 1, delay: 1000 },
    leave: { opacity: 0, config: { duration: 500 } },
  })

  return (
    phase === 'ready' && (
      <Html center className="inset-0 w-screen h-[100dvh]">
        <div className="absolute inset-0 text-white font-body">
          {transitions((style, item) => {
            //prettier-ignore
            switch (item) {
              case 0: return <MainMenu style={style} />
              case 1: return <Tutorial style={style} />
            }
          })}
        </div>
      </Html>
    )
  )
}

const MainMenu = animated(props => {
  const start = useGame(state => state.start)
  const setSections = useMenu(state => state.setSections)

  return (
    <div {...props} className="menu-section">
      <h1 className="font-title flex flex-col items-center gap-0">
        <span className="text-7xl leading-8">Hook</span>
        <span className="text-2xl">-A-</span>
        <span className="text-7xl">Fish!</span>
      </h1>
      <button
        onClick={() => {
          start()
          setSections([])
        }}
      >
        <span className="icon-[solar--play-bold]" />
        <span>Start</span>
      </button>
      <button onClick={() => setSections([1])}>
        <span className="icon-[solar--question-circle-bold]" />
        <span>How to Play</span>
      </button>
      <button disabled>
        <span className="icon-[solar--info-circle-bold]" />
        <span>Credits</span>
      </button>

      <footer className="absolute bottom-10 inline-flex items-center justify-center gap-1 text-2xl">
        Made with <span className="icon-[solar--heart-angle-bold]" /> by{' '}
        <a href="https://github.com/dammafra/hook-a-fish" target="_blank">
          @dammafra
        </a>
      </footer>
    </div>
  )
})

const Tutorial = animated(props => {
  const isTouch = useIsTouch()
  const setSections = useMenu(state => state.setSections)

  return (
    <div {...props} className="menu-section text-4xl text-center px-5 gap-2">
      <span className="icon-[mdi--hook] text-5xl" />
      <p className="mb-10">
        Control the fishing rod by <b>moving your {isTouch ? 'finger' : 'mouse'}</b>
      </p>
      <span className="icon-[mdi--bucket] text-5xl" />
      <p className="mb-10">
        After you <span className="font-extrabold">Hook-A-Fish</span>, put it inside your bucket and
        catch another one!
      </p>
      <span className="icon-[solar--clock-circle-bold] text-5xl" />
      <p className="mb-10">Catch them as fast as you can!</p>

      <button className="absolute top-5 left-5" onClick={() => setSections([0])}>
        <span className="icon-[solar--alt-arrow-left-linear]" />
      </button>
    </div>
  )
})
