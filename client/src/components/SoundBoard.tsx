import { useEffect, useState } from 'react'
import useSound from 'use-sound'
import useGame from '../stores/use-game'

interface PlayOptions {
  id?: string
  forceSoundEnabled?: boolean
  playbackRate?: number
}

declare type PlayFunction = (options?: PlayOptions) => void

interface ExposedData {
  sound: Howl | null
  stop: (id?: string) => void
  pause: (id?: string) => void
  duration: number | null
}

declare type ReturnedValue = [PlayFunction, ExposedData]

const parse = ([play, data]: ReturnedValue) => ({ play, ...data })

export default function SoundBooard() {
  const [loaded, setLoaded] = useState(0)
  const onload = () => setLoaded(loaded => loaded + 1)

  const sounds = {
    loop: parse(useSound('./sounds/loop.mp3', { loop: true, volume: 0.1, onload })),
    fishes: parse(useSound('./sounds/fishes.mp3', { loop: true, volume: 0.5, onload })),
    jump: parse(useSound('./sounds/jump.mp3', { onload })),
    reel: parse(useSound('./sounds/reel.mp3', { loop: true, volume: 0.3, onload })),
    bucket: parse(useSound('./sounds/bucket.mp3', { onload })),
    collect: parse(useSound('./sounds/collect.mp3', { onload })),
  }

  const toLoad = Object.keys(sounds).length

  useEffect(() => {
    if (loaded < toLoad) return

    const unsubscribePhase = useGame.subscribe(
      state => state.phase,
      phase => {
        switch (phase) {
          case 'started':
            sounds.loop.play()
            sounds.fishes.play()
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
        }
      },
    )

    return unsubscribePhase
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded])

  return <></>
}
