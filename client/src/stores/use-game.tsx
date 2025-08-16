import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

type GameStore = {
  started: boolean
  start: () => void

  count: number

  hooked: boolean
  hook: () => void
}

const useGame = create<GameStore>()(
  subscribeWithSelector(set => ({
    started: false,
    start: () => set(() => ({ started: true })),

    count: 0,

    hooked: false,
    hook: () => {
      return set(state => ({
        hooked: !state.hooked,
        count: state.hooked ? state.count + 1 : state.count,
      }))
    },
  })),
)

export default useGame
