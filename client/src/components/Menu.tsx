import { animated, useSpring, useTransition } from '@react-spring/web'
import { Html } from '@react-three/drei'
import { useMemo } from 'react'
import { useIsTouch } from '../hooks/use-is-touch'
import useGame from '../stores/use-game'

export default function Menu() {
  const menu = useGame(state => state.menu)

  const sections = useMemo(() => (menu ? [menu] : []), [menu])
  const transitions = useTransition(sections, {
    from: { scale: 0 },
    enter: { scale: 1 },
    leave: { scale: 0 },
    config: { tension: 120, friction: 14 },
  })

  return (
    <Html center className="menu">
      {transitions((style, item) => {
        //prettier-ignore
        switch (item) {
              case 'main': return <MainMenu style={style} />
              case 'tutorial': return <Tutorial style={style} />
              case 'credits': return <Credits style={style} /> 
              case 'game-over': return <End style={style} /> 
            }
      })}
    </Html>
  )
}

const MainMenu = animated(props => {
  const start = useGame(state => state.start)
  const setMenu = useGame(state => state.setMenu)

  return (
    <div {...props} className="menu-section">
      <h1 className="font-title flex flex-col items-center gap-0">
        <span className="text-7xl leading-8">Hook</span>
        <span className="text-2xl">-A-</span>
        <span className="text-7xl">Fish!</span>
      </h1>
      <button onClick={start}>
        <span className="icon-[solar--play-bold]" />
        <span>Start</span>
      </button>
      <button onClick={() => setMenu('tutorial')}>
        <span className="icon-[solar--question-circle-bold]" />
        <span>How to Play</span>
      </button>
      <button onClick={() => setMenu('credits')}>
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
  const setMenu = useGame(state => state.setMenu)

  return (
    <div {...props} className="menu-section text-2xl md:text-3xl text-center px-5 gap-2">
      <span className="icon-[mdi--hook] text-4xl md:text-5xl" />
      <p className="mb-10">
        Control the fishing rod{' '}
        <span className="font-extrabold"> with your {isTouch ? 'finger' : 'mouse'}</span>,
        <br className="max-md:hidden" />
        aim for the fish’s mouth and catch them as they jump
      </p>
      <span className="icon-[mdi--bucket] text-4xl md:text-5xl" />
      <p className="mb-10">
        After you <span className="font-extrabold">Hook-A-Fish</span>, <br />
        put it inside your bucket
      </p>
      <span className="icon-[solar--clock-circle-bold] text-4xl md:text-5xl" />
      <p className="mb-10">
        Catch them as fast as you can! <br />
        Each fish gives you a <span className="font-extrabold">time bonus</span>
      </p>
      <button onClick={() => setMenu('main')}>
        <span className="icon-[solar--alt-arrow-left-linear]" /> <span>Back</span>
      </button>
      <p className="text-2xl mt-5 animate-pulse uppercase font-extrabold">
        Power-ups are coming soon!
        <br />
        Stay tuned!
      </p>
    </div>
  )
})

const Credits = animated(props => {
  const setMenu = useGame(state => state.setMenu)

  return (
    <div {...props} className="menu-section text-2xl">
      <p>TBD</p>
      <button onClick={() => setMenu('main')}>
        <span className="icon-[solar--alt-arrow-left-linear]" /> <span>Back</span>
      </button>
    </div>
  )
})

const End = animated(props => {
  const start = useGame(state => state.start)
  const lastScore = useGame(state => state.lastScore)
  const lastPhoto = useGame(state => state.lastPhoto)

  const canShare = useMemo(() => !!lastScore && lastPhoto, [lastScore, lastPhoto])

  const share = async () => {
    const filename = `${Date.now()}_hook-a-fish_${lastScore}.png`
    const res = await fetch(lastPhoto!)
    const blob = await res.blob()
    const file = new File([blob], filename, { type: 'image/png' })

    const toShare = {
      files: [file],
      text: `I just caught ${lastScore} fish in Hook-A-Fish!
Can you beat my score?
#hookafish #indiegame #indiedev #fishinggame #webgame #threejs

🎣 https://hook-a-fish.vercel.app`,
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

  const imgProps = useSpring({
    from: { transform: 'scale(0) rotate(0deg)' },
    to: { transform: 'scale(1) rotate(355deg)' },
    config: { tension: 120, friction: 14 },
  })

  return (
    <div {...props} className="menu-section">
      <p className="font-title text-6xl">Game Over</p>
      {canShare && <p className="text-4xl uppercase -mt-4">{lastScore} Fish Caught</p>}
      {canShare ? (
        <animated.div className="relative" style={imgProps}>
          <img
            src={lastPhoto}
            className="w-60 md:w-80 border-15 border-b-50 md:border-20 md:border-b-80 border-white"
          />
          <p className="absolute top-58 md:top-80 w-full text-center text-2xl md:text-3xl text-black">
            Here's the last one you hooked!
          </p>
        </animated.div>
      ) : (
        <p className="text-3xl text-center">Oops… the fishes are laughing at you!</p>
      )}

      <div className="flex max-md:flex-col gap-4 mt-4">
        <button onClick={start}>
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
