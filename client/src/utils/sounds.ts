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
export const parseSound = ([play, data]: ReturnedValue) => ({ play, ...data })
