import { Vector3 } from 'three'
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { randomInt } from '../utils/random'

type MenuSection = 'main' | 'tutorial' | 'credits' | 'end' | 'pause'
type GamePhase = 'ready' | 'started' | 'hooked' | 'unhooked' | 'ended'

type GameStore = {
  countdownSeconds: number
  startedAt: number
  bonusTime: number
  radius: number

  lastPhoto?: string
  setLastPhoto: (lastPhoto?: string) => void

  bucketPosition: Vector3
  setBucketPosition: (x: number, y: number, z: number) => void

  total: number
  score: number
  fishes: string[]
  lastHooked?: string

  phase: GamePhase

  start: () => void
  hook: (fish: string) => void
  unhook: (fish: string) => void
  end: () => void

  menu?: MenuSection
  setMenu: (menu?: MenuSection) => void
}

const useGame = create<GameStore>()(
  subscribeWithSelector(set => ({
    countdownSeconds: 61, // start with 1 bonus second for the starting animation
    startedAt: 0,
    bonusTime: 0,
    radius: 3.5,

    setLastPhoto: lastPhoto => set(() => ({ lastPhoto })),

    bucketPosition: new Vector3(0, 0, 0),
    setBucketPosition: (x, y, z) => set(() => ({ bucketPosition: new Vector3(x, y, z) })),

    total: 20,
    score: 0,
    fishes: [],

    phase: 'ready',

    start: () => {
      set(state => {
        if (state.phase === 'ready' || state.phase === 'ended') {
          return {
            startedAt: Date.now(),
            lastPhoto: undefined,
            score: 0,
            fishes: Array.from({ length: state.total }, () => crypto.randomUUID()),
            phase: 'started',
            menu: undefined,
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
            score: state.score + 1,
            bonusTime: state.bonusTime + 3,
          }
        }

        return {}
      })
    },

    end: () => {
      set(state => {
        if (state.phase !== 'hooked' && state.phase !== 'ended') {
          return {
            countdownSeconds: 60, // remove the 1 bonus second since on the retry there is no starting animation
            bonusTime: 0,
            phase: 'ended',
            menu: 'end',
          }
        }

        return {}
      })
    },

    menu: 'main',
    setMenu: menu => set(() => ({ menu })),
  })),
)

export default useGame
