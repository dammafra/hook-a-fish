import { useCallback, useEffect, useRef, useState } from 'react'

type UseSoundOptions = {
  times?: number
  loop?: boolean
  volume?: number
  muted?: boolean
}

type SoundControls = {
  play: () => void
  stop: () => void
  setVolume: (v: number) => void
  setMuted: (m: boolean) => void
  volume: number
  muted: boolean
}

// shared AudioContext
const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

export function useSound(url: string, options: UseSoundOptions = {}): SoundControls {
  const {
    times = 1,
    loop = false,
    volume: initialVolume = 1,
    muted: initialMuted = false,
  } = options

  const bufferRef = useRef<AudioBuffer | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)

  const [volume, setVolumeState] = useState(initialVolume)
  const [muted, setMutedState] = useState(initialMuted)

  // resume AudioContext on user interaction (mobile support)
  useEffect(() => {
    const resume = () => audioContext.resume()
    const events: (keyof HTMLElementEventMap)[] = ['touchstart', 'touchend', 'mousedown', 'keydown']
    events.forEach(e => document.body.addEventListener(e, resume, false))
    return () => events.forEach(e => document.body.removeEventListener(e, resume, false))
  }, [])

  const loadBuffer = useCallback(async () => {
    if (!bufferRef.current) {
      const res = await fetch(url)
      const arrayBuffer = await res.arrayBuffer()
      bufferRef.current = await audioContext.decodeAudioData(arrayBuffer)
    }
    return bufferRef.current
  }, [url])

  const play = useCallback(async () => {
    const buffer = await loadBuffer()
    if (!buffer || muted) return

    const source = audioContext.createBufferSource()
    source.buffer = buffer
    source.loop = loop

    const gainNode = audioContext.createGain()
    gainNode.gain.value = muted ? 0 : volume

    source.connect(gainNode).connect(audioContext.destination)
    source.start()

    sourceRef.current = source
    gainNodeRef.current = gainNode

    if (!loop) {
      let playCount = 1
      source.onended = () => {
        if (playCount < times) {
          playCount++
          const newSource = audioContext.createBufferSource()
          newSource.buffer = buffer
          newSource.loop = false
          newSource.connect(gainNode).connect(audioContext.destination)
          newSource.start()
          sourceRef.current = newSource
          newSource.onended = source.onended
        }
      }
    }
  }, [loop, times, muted, volume, loadBuffer])

  const stop = useCallback(() => {
    sourceRef.current?.stop()
    sourceRef.current = null
  }, [])

  const setVolume = useCallback(
    (v: number) => {
      setVolumeState(v)
      if (gainNodeRef.current) gainNodeRef.current.gain.value = muted ? 0 : v
    },
    [muted],
  )

  const setMuted = useCallback(
    (m: boolean) => {
      setMutedState(m)
      if (gainNodeRef.current) gainNodeRef.current.gain.value = m ? 0 : volume
    },
    [volume],
  )

  return {
    play,
    stop,
    setVolume,
    setMuted,
    volume,
    muted,
  }
}
