import { create } from 'zustand'
import { load, save } from '../utils/storage'

const MUTED_KEY = 'hookafish-muted'

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

  muted: load(MUTED_KEY, false),
  toggleMuted: () => {
    set(state => {
      const muted = !state.muted
      save(MUTED_KEY, muted)

      if (muted) state.context?.suspend()
      else state.context?.resume()

      return { muted }
    })
  },
}))

export default useSoundBoard
