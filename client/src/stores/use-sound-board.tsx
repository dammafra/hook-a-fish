import { create } from 'zustand'

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

export declare type ReturnedValue = [PlayFunction, ExposedData]

declare type Sound = ExposedData & {
  play: PlayFunction
}

declare type SoundMap = { [key: string]: Sound }

type SoundBoardStore = {
  context?: AudioContext
  setContext: (context: AudioContext) => void

  sounds?: SoundMap
  setSounds: (sounds: SoundMap) => void

  muted: boolean
  toggleMuted: () => void
}

const useSoundBoard = create<SoundBoardStore>()(set => ({
  setContext: context => set(() => ({ context })),
  setSounds: sounds => set(() => ({ sounds })),

  muted: JSON.parse(localStorage.getItem('hookafish-muted') || 'false'),
  toggleMuted: () => {
    set(state => {
      const muted = !state.muted
      localStorage.setItem('hookafish-muted', JSON.stringify(muted))

      if (muted) state.context?.suspend()
      else state.context?.resume()

      return { muted }
    })
  },
}))

export default useSoundBoard
