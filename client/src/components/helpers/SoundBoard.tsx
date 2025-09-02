import { Howler } from 'howler'
import { useEffect, useState } from 'react'
import useSound from 'use-sound'
import useGame from '../../stores/use-game'
import useSoundBoard, { type ReturnedValue } from '../../stores/use-sound-board'

const parse = ([play, data]: ReturnedValue) => ({ play, ...data })

export default function SoundBoard() {
  const phase = useGame(state => state.phase)

  const setContext = useSoundBoard(state => state.setContext)
  const setSounds = useSoundBoard(state => state.setSounds)
  const muted = useSoundBoard(state => state.muted)

  const [loaded, setLoaded] = useState(0)
  const onload = () => setLoaded(loaded => loaded + 1)

  const sounds = {
    loop: parse(useSound('./sounds/loop.mp3', { loop: true, volume: 0.2, onload })),
    fishes: parse(useSound('./sounds/fishes.mp3', { loop: true, volume: 0.5, onload })),
    jump: parse(useSound('./sounds/jump.mp3', { onload })),
    reel: parse(useSound('./sounds/reel.mp3', { loop: true, volume: 0.1, onload })),
    bucket: parse(useSound('./sounds/bucket.mp3', { onload })),
    collect: parse(useSound('./sounds/collect.mp3', { onload })),
    whistle: parse(useSound('./sounds/whistle.mp3', { onload, volume: 0.5 })),
    tick: parse(useSound('./sounds/tick.mp3', { loop: true, onload })),
  }

  const toLoad = Object.keys(sounds).length

  useEffect(() => {
    if (loaded < toLoad) return

    setContext(Howler.ctx)
    setSounds(sounds)

    switch (phase) {
      case 'started':
        sounds.loop.play()
        sounds.fishes.play()
        sounds.jump.play()
        return

      case 'hooked':
        sounds.jump.play()
        sounds.reel.play()
        return

      case 'unhooked':
        sounds.bucket.play()
        sounds.collect.play()
        sounds.reel.stop()
        return

      case 'ended':
        sounds.loop.stop()
        sounds.reel.stop()
        sounds.fishes.stop()
        sounds.whistle.play({ playbackRate: 1.3 })
        return
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, toLoad, phase])

  useEffect(() => {
    Howler.volume(muted ? 0 : 1)
  }, [muted])

  /**
   * This helps resume AudioContext when the tab is suspended (e.g., when switching apps or locking the phone) and later resumed,
   * especially on mobile where browsers often suspend audio contexts to save resources;
   * by listening to user interactions (touchstart, touchend, mousedown, keydown), it ensures audio resumes reliably after the tab becomes active again.
   */
  // useEffect(() => {
  //   if (!context) return

  //   const events = ['touchstart', 'touchend', 'mousedown', 'keydown', 'visibilitychange']
  //   const resume = () => context.resume()
  //   const suspend = () => document.hidden && context.suspend()

  //   events.forEach(e => document.body.addEventListener(e, resume, false))
  //   document.addEventListener('visibilitychange', suspend)

  //   return () => {
  //     events.forEach(e => document.body.removeEventListener(e, resume, false))
  //     document.removeEventListener('visibilitychange', suspend)
  //   }
  // }, [context])

  return <></>
}
