import { animated, useTransition } from '@react-spring/web'
import { Html, type CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
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

  useEffect(cameraAnimation, [size, controls, phase])

  const transitions = useTransition(sections, {
    from: item => (item < 3 ? { scale: 0 } : { opacity: 0 }),
    enter: item => (item < 3 ? { scale: 1 } : { opacity: 1 }),
    leave: item => (item < 3 ? { scale: 0 } : { opacity: 0 }),
  })

  return (
    <Html center className="menu">
      {transitions((style, item) => {
        //prettier-ignore
        switch (item) {
              case 0: return <MainMenu style={style} />
              case 1: return <Tutorial style={style} />
              // case 2: return <Credits style={style} /> 
              case 3: return <End style={style} /> 
            }
      })}
    </Html>
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

      <button onClick={() => setSections([0])}>
        <span className="icon-[solar--alt-arrow-left-linear]" /> <span>Back</span>
      </button>
    </div>
  )
})

const End = animated(props => {
  const start = useGame(state => state.start)
  const score = useGame(state => state.score)
  const lastPhoto = useGame(state => state.lastPhoto)
  const setSections = useMenu(state => state.setSections)

  const canShare = useMemo(() => !!score && lastPhoto, [score, lastPhoto])

  const share = async () => {
    const filename = `${Date.now()}_hook-a-fish_${score}.png`
    const res = await fetch(lastPhoto!)
    const blob = await res.blob()
    const file = new File([blob], filename, { type: 'image/png' })

    const toShare = {
      files: [file],
      url: 'https://hook-a-fish.vercel.app',
      title: 'Hook-A-Fish!',
      text: `I just hooked ${score} fish! 🎣 Can you beat my score? #hookafish #indiegame #threejs`,
    }

    if (navigator.canShare(toShare)) {
      await navigator.share(toShare)
    } else {
      const link = document.createElement('a')
      link.href = lastPhoto!
      link.download = filename
      link.click()
    }
  }

  return (
    <div {...props} className="menu-section bg-black/80">
      {canShare ? (
        <div className="relative">
          <img src={lastPhoto} className="w-80 border-20 border-b-80 border-white" />
          <p className="absolute top-82 w-full font-title text-center text-3xl text-black">
            Score: {score}
          </p>
        </div>
      ) : (
        <p className="font-title text-3xl text-center">Oops… the fishes are laughing at you!</p>
      )}

      <div className="flex max-md:flex-col gap-4">
        <button
          onClick={() => {
            start()
            setSections([])
          }}
        >
          <span className="icon-[stash--arrow-retry] -scale-x-100" />
          <span>Retry</span>
        </button>

        {canShare && (
          <button onClick={share}>
            <span className="icon-[solar--share-bold]" />
            <span>Share</span>
          </button>
        )}
      </div>
    </div>
  )
})
