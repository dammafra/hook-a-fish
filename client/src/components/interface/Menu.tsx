import { animated, useSpring, useTransition, type UseSpringProps } from '@react-spring/web'
import { Html } from '@react-three/drei'
import { useMemo } from 'react'
import { useIsTouch } from '../../hooks/use-is-touch'
import useGame from '../../stores/use-game'
import { randomInt, randomOneOf } from '../../utils/random'
import { LOST_MESSAGES, WIN_MESSAGES } from '../data/messages'

const getButtonSpringConfig = () =>
  ({
    from: { x: 0, y: 0 },
    to: async next => {
      while (true) {
        await next({
          x: Math.random() * randomInt(5, 8),
          y: Math.random() * randomInt(5, 8),
          velocity: 0,
        })
      }
    },
    config: { damping: 0, frequency: 4 },
  }) as UseSpringProps

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

  const logoSpring = useSpring({
    from: { rotate: -5 },
    to: { rotate: 5 },
    loop: { reverse: true },
    config: { damping: 0, frequency: 3, bounce: 1 },
  })

  const buttonStartSpring = useSpring(getButtonSpringConfig())
  const buttonTutorialSpring = useSpring(getButtonSpringConfig())
  const buttonCreditsSpring = useSpring(getButtonSpringConfig())

  return (
    <div {...props} className="menu-section">
      <h1 className="font-title flex flex-col items-center gap-0 relative">
        <span className="text-7xl leading-8">Hook</span>
        <span className="text-2xl">-A-</span>
        <span className="text-7xl">Fish!</span>
        <animated.div
          style={logoSpring}
          className="absolute size-100 -top-[191px] -left-22 rotate-15"
        >
          <span className="absolute left-14 top-33 icon-[mdi--hook] text-[250px] text-white/20" />
        </animated.div>
      </h1>
      <animated.button onClick={start} style={buttonStartSpring}>
        <span className="icon-[solar--play-bold]" />
        <span>Start</span>
      </animated.button>
      <animated.button onClick={() => setMenu('tutorial')} style={buttonTutorialSpring}>
        <span className="icon-[solar--question-circle-bold]" />
        <span>How to Play</span>
      </animated.button>
      <animated.button onClick={() => setMenu('credits')} style={buttonCreditsSpring}>
        <span className="icon-[solar--info-circle-bold]" />
        <span>Credits</span>
      </animated.button>

      <footer className="absolute bottom-10 flex flex-col items-center gap-2">
        <p className="inline-flex items-center gap-1 text-2xl">
          Made with <span className="icon-[solar--heart-angle-bold]" /> by{' '}
          <a href="https://github.com/dammafra/hook-a-fish" target="_blank">
            @dammafra
          </a>
        </p>
        <a href="https://www.buymeacoffee.com/dammafra" target="_blank">
          <img
            src="./bmc.png"
            alt="Buy Me A Coffee"
            className="h-10 hover:opacity-80 active:opacity-80"
          />
        </a>
      </footer>
    </div>
  )
})

const Tutorial = animated(props => {
  const isTouch = useIsTouch()
  const setMenu = useGame(state => state.setMenu)

  const buttonBackSpring = useSpring(getButtonSpringConfig())

  return (
    <div {...props} className="menu-section text-2xl md:text-3xl text-center px-5 gap-2">
      <span className="icon-[mdi--hook] text-4xl md:text-5xl" />
      <p className="mb-5 md:mb-10">
        Control the fishing rod{' '}
        <span className="font-extrabold"> with your {isTouch ? 'finger' : 'mouse'}</span>,
        <br className="max-md:hidden" />
        aim for the fish’s mouth and catch them as they jump
      </p>
      <span className="icon-[mdi--bucket] text-4xl md:text-5xl" />
      <p className="mb-5 md:mb-10">
        After you <span className="font-extrabold">Hook-A-Fish</span>, <br />
        put it inside your bucket
      </p>
      <span className="icon-[solar--clock-circle-bold] text-4xl md:text-5xl" />
      <p className="mb-5 md:mb-10">
        Catch them as fast as you can! <br />
        Each fish gives you a <span className="font-extrabold">time bonus</span>
      </p>
      <animated.button style={buttonBackSpring} onClick={() => setMenu('main')} className="sm">
        <span className="icon-[solar--alt-arrow-left-linear]" /> <span>Back</span>
      </animated.button>
      {/* <p className="text-2xl mt-5 animate-pulse uppercase font-extrabold">
        Power-ups are coming soon!
        <br />
        Stay tuned!
      </p> */}
    </div>
  )
})

const Credits = animated(props => {
  const setMenu = useGame(state => state.setMenu)

  const buttonBackSpring = useSpring(getButtonSpringConfig())

  return (
    <div
      {...props}
      className="menu-section text-xs sm:text-sm md:text-lg tracking-wide text-center"
    >
      <div>
        <h2 className="font-title">Models</h2>
        {/* prettier-ignore */}
        <ul>
          <li><a href="https://poly.pizza/m/eyuCxAqI9er" target="_blank" className='uppercase'>Fishing Pole</a> by <span className="uppercase">Shawn Westphal</span> [<a href="https://creativecommons.org/licenses/by/3.0/" target="_blank">CC-BY</a>] via Poly Pizza</li>
          <li><a href="https://poly.pizza/m/3xxRFD2brcq" target="_blank" className='uppercase'>Fish hook</a> by <span className="uppercase">Poly by Google</span> [<a href="https://creativecommons.org/licenses/by/3.0/" target="_blank">CC-BY</a>] via Poly Pizza</li>
          <li><a href="https://poly.pizza/m/3tyh15Fbmsx" target="_blank" className='uppercase'>Tuft of grass</a> by <span className="uppercase">Poly by Google</span> [<a href="https://creativecommons.org/licenses/by/3.0/" target="_blank">CC-BY</a>] via Poly Pizza</li>
          <li><a href="https://poly.pizza/m/i4QMw4L64D" target="_blank" className='uppercase'>Tree</a> by <span className="uppercase">Quaternius</span></li>
          <li><a href="https://poly.pizza/m/83obI9bNun" target="_blank"className='uppercase'>Bucket</a> by <span className="uppercase">Quaternius</span></li>
          <li><a href="https://poly.pizza/m/Li1cr0atPF" target="_blank"className='uppercase'>Fishing Stand</a> by <span className="uppercase">Kenney</span></li>
          <li><a href="https://skfb.ly/6WVNM" target="_blank"className='uppercase'>Fish</a> by <span className="uppercase">Zainal Abd. Kahar</span> <a href="http://creativecommons.org/licenses/by/4.0/" target="_blank">[CC-BY]</a></li>
        </ul>
      </div>
      <div>
        <h2 className="font-title">Sound Effects</h2>
        {/* prettier-ignore */}
        <ul>
          <li><a href="https://pixabay.com/users/audiopapkin-14728698/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=302355" target="_blank" className="uppercase">Fishing Reel</a> by <span className="uppercase">Pawel Spychala</span> from <a href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=302355" target="_blank">Pixabay</a></li>
          <li><a href="https://pixabay.com/users/u_vlcuq4wxwj-34182338/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=142159" target="_blank" className="uppercase">Your Plastic Bucket is Full of Water</a> by <span className="uppercase">u_vlcuq4wxwj</span> from <a href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=142159" target="_blank">Pixabay</a></li>
          <li><a href="https://pixabay.com/users/freesound_community-46691455/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=6114" target="_blank" className="uppercase">Fish in River</a> by <span className="uppercase">freesound_community</span> from <a href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=6114" target="_blank">Pixabay</a></li>
          <li><a href="https://pixabay.com/users/sergequadrado-24990007/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=109009" target="_blank" className="uppercase">Positive Cartoon Loop</a> Music by <span className="uppercase">Sergei Chetvertnykh</span> from <a href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=109009" target="_blank">Pixabay</a></li>
          <li><a href="https://pixabay.com/users/alexis_gaming_cam-50011695/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=367087" target="_blank" className="uppercase">Item Collected</a> by <span className="uppercase">ALEXIS_GAMING_CAM</span> from <a href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=367087" target="_blank">Pixabay</a></li>
          <li><a href="https://pixabay.com/users/freesound_community-46691455/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=6462" target="_blank" className="uppercase">Jump</a> by <span className="uppercase">freesound_community</span> from <a href="https://pixabay.com/sound-effects//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=6462" target="_blank">Pixabay</a></li>
          <li><a href="https://pixabay.com/users/freesound_community-46691455/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=6320" target="_blank" className="uppercase">Referee whistle blow, gymnasium</a> by <span className="uppercase">freesound_community</span> from <a href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=6320" target="_blank">Pixabay</a></li>
          <li><a href="https://pixabay.com/users/reddog0607-51038821/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=365218" target="_blank" className="uppercase">Clock Ticking</a> by <span className="uppercase">RedDog0607</span> from <a href="https://pixabay.com/sound-effects//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=365218" target="_blank">Pixabay</a></li>
      </ul>
      </div>
      <div>
        <h2 className="font-title">Others</h2>
        {/* prettier-ignore */}
        <ul>
          <li><a href="https://codepen.io/matchboxhero/pen/LzdgOv" target="_blank" className="uppercase">Animated SVG Bubbles</a> by <span className="uppercase">Steven Roberts</span> from <a href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=302355" target="_blank">CodePen</a></li>
          <li><a href="https://kenney.nl/assets/cursor-pack" target="_blank" className="uppercase">Cursor Pack</a> by <span className="uppercase">Kenney</span></li>
        </ul>
      </div>
      <animated.button
        style={buttonBackSpring}
        className="max-md:absolute max-md:bottom-10 sm"
        onClick={() => setMenu('main')}
      >
        <span className="icon-[solar--alt-arrow-left-linear]" /> <span>Back</span>
      </animated.button>
    </div>
  )
})

const End = animated(props => {
  const start = useGame(state => state.start)
  const lastScore = useGame(state => state.lastScore)
  const lastPhoto = useGame(state => state.lastPhoto)

  const win = useMemo(() => !!lastScore, [lastScore])
  const winMessage = useMemo(() => randomOneOf(WIN_MESSAGES), [])
  const lostMessage = useMemo(() => randomOneOf(LOST_MESSAGES), [])

  const share = async () => {
    const filename = `${Date.now()}_hook-a-fish_${lastScore}.png`
    const res = await fetch(lastPhoto!)
    const blob = await res.blob()
    const file = new File([blob], filename, { type: 'image/png' })

    const toShare = {
      files: [file],
      text: `${winMessage}
      
I just caught ${lastScore} fish in Hook-A-Fish!
Can you beat my score?

🎣 https://hook-a-fish.vercel.app

#hookafish #indiegame #indiedev #fishinggame #webgame #threejs`,
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

  const imgSprings = useSpring({
    from: { transform: 'scale(0) rotate(0deg)' },
    to: { transform: 'scale(1) rotate(355deg)' },
    config: { tension: 120, friction: 14 },
  })

  const buttonBackSpring = useSpring(getButtonSpringConfig())
  const buttonShareSpring = useSpring(getButtonSpringConfig())

  return (
    <div {...props} className="menu-section">
      <p className="font-title text-6xl">Game Over</p>
      {win ? (
        <>
          <p className="text-4xl uppercase -mt-4">{lastScore} Fish Caught</p>
          <animated.div className="relative" style={imgSprings}>
            <img
              src={lastPhoto}
              className="w-64 md:w-80 border-15 border-b-80 md:border-20 md:border-b-110 border-white"
            />
            <p className="text-shadow-none absolute h-16 md:h-20 inline-flex items-center justify-center top-62 md:top-78 w-full text-2xl md:text-3xl text-black text-center">
              {winMessage}
            </p>
          </animated.div>
        </>
      ) : (
        <p className="text-3xl md:text-5xl text-center">{lostMessage}</p>
      )}

      <div className="flex max-md:flex-col gap-4 mt-4">
        <animated.button style={buttonBackSpring} onClick={start} className="backdrop-blur-sm">
          <span className="icon-[stash--arrow-retry] -scale-x-100" />
          <span>Retry</span>
        </animated.button>

        {win && (
          <animated.button style={buttonShareSpring} onClick={share} className="backdrop-blur-sm">
            <span className="icon-[solar--share-bold]" />
            <span>Share</span>
          </animated.button>
        )}
      </div>
    </div>
  )
})
