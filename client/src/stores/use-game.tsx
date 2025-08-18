import { Vector3 } from 'three'
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

type GameStore = {
  radius: number

  bucketPosition: Vector3
  setBucketPosition: (x: number, y: number, z: number) => void

  total: number
  counter: number
  fishes: number[]
  lastHooked?: number

  startTime: number
  endTime: number

  phase: 'ready' | 'started' | 'hooked' | 'unhooked' | 'ended'

  start: () => void
  hook: (fish: number) => void
  unhook: (fish: number) => void
  end: () => void
}

const useGame = create<GameStore>()(
  subscribeWithSelector(set => ({
    radius: 3.5,

    bucketPosition: new Vector3(0, 0, 0),
    setBucketPosition: (x, y, z) => set(() => ({ bucketPosition: new Vector3(x, y, z) })),

    total: 20,
    counter: 0,
    fishes: [],
    startTime: 0,
    endTime: 0,

    phase: 'ready',

    start: () => {
      set(state => {
        if (state.phase === 'ready') {
          return {
            phase: 'started',
            fishes: Array.from({ length: state.total }, (_, i) => i),
            startTime: Date.now(),
          }
        }

        return {}
      })
    },

    hook: () => {
      set(state => {
        if (state.phase === 'started' || state.phase === 'unhooked') {
          return {
            phase: 'hooked',
            lastHooked: undefined,
            fishes: state.fishes.filter(id => id !== state.lastHooked),
          }
        }

        return {}
      })
    },

    unhook: fish => {
      set(state => {
        if (state.phase === 'hooked') {
          return {
            phase: 'unhooked',
            lastHooked: fish,
            counter: state.counter + 1,
          }
        }

        return {}
      })
    },

    end: () => {
      set(state => {
        if (state.phase === 'unhooked') {
          return { phase: 'ended', endTime: Date.now() }
        }

        return {}
      })
    },
  })),
)

export default useGame
