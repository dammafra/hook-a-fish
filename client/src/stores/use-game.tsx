import { Vector3 } from 'three'
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { randomInt } from '../utils/random'

type GameStore = {
  countdownSeconds: number
  startedAt: number
  radius: number

  bucketPosition: Vector3
  setBucketPosition: (x: number, y: number, z: number) => void

  total: number
  counter: number
  fishes: string[]
  lastHooked?: string

  phase: 'ready' | 'started' | 'hooked' | 'unhooked' | 'ended'

  start: () => void
  hook: (fish: string) => void
  unhook: (fish: string) => void
  end: () => void
}

const useGame = create<GameStore>()(
  subscribeWithSelector(set => ({
    countdownSeconds: 61,
    startedAt: 0,
    radius: 3.5,

    bucketPosition: new Vector3(0, 0, 0),
    setBucketPosition: (x, y, z) => set(() => ({ bucketPosition: new Vector3(x, y, z) })),

    total: 24,
    counter: 0,
    fishes: [],

    phase: 'ready',

    start: () => {
      set(state => {
        if (state.phase === 'ready') {
          return {
            phase: 'started',
            fishes: Array.from({ length: state.total }, () => crypto.randomUUID()),
            startedAt: Date.now(),
          }
        }

        return {}
      })
    },

    hook: () => {
      set(state => {
        if (state.phase === 'started' || state.phase === 'unhooked') {
          let fishes = state.fishes.filter(id => id !== state.lastHooked)

          const spawnThreshold = Math.max(state.total / 2, 2)
          const remaining = fishes.length

          if (remaining <= spawnThreshold) {
            const toSpawn = randomInt(remaining === 2 ? 1 : 0, 3)
            const newFishes = Array.from({ length: toSpawn }, () => crypto.randomUUID())
            fishes = [...fishes, ...newFishes]
          }

          return {
            phase: 'hooked',
            lastHooked: undefined,
            fishes,
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
        if (state.phase !== 'hooked' && state.phase !== 'ended') {
          return { phase: 'ended' }
        }

        return {}
      })
    },
  })),
)

export default useGame
