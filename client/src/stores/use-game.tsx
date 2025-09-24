import { Vector3 } from 'three'
import { create } from 'zustand'
import { randomInt } from '../utils/random'

type MenuSection = 'main' | 'tutorial' | 'credits' | 'game-over' | 'pause'
type GamePhase = 'ready' | 'started' | 'hooked' | 'unhooked' | 'ended'

type GameStore = {
  startedAt: number
  radius: number

  flip: boolean
  toggleFlip: () => void

  photo?: string
  lastPhoto?: string
  setPhoto: (photo?: string) => void

  bucketPosition?: Vector3
  setBucketPosition: (x: number, y: number, z: number) => void
  toolsPosition?: Vector3
  setToolsPosition: (x: number, y: number, z: number) => void

  total: number
  score: number
  lastScore: number

  fishes: string[]
  lastHooked?: string

  phase: GamePhase

  start: () => void
  hook: (fish: string) => void
  unhook: (fish: string) => void
  end: () => void

  paused: boolean
  pause: () => void
  resume: () => void

  menu?: MenuSection
  setMenu: (menu?: MenuSection) => void
}

const generateId = () =>
  crypto.randomUUID ? crypto.randomUUID() : (Date.now() * Math.random()).toFixed(0)

const useGame = create<GameStore>()(set => ({
  startedAt: 0,
  radius: 3.5,

  flip: JSON.parse(localStorage.getItem('hookafish-flip') || 'false'),
  toggleFlip: () =>
    set(state => {
      const flip = !state.flip
      localStorage.setItem('hookafish-flip', JSON.stringify(flip))
      return { flip }
    }),

  setPhoto: photo => set(() => ({ photo })),

  setBucketPosition: (x, y, z) => set(() => ({ bucketPosition: new Vector3(x, y, z) })),
  setToolsPosition: (x, y, z) => set(() => ({ toolsPosition: new Vector3(x, y, z) })),

  total: 20,
  score: 0,
  lastScore: 0,

  fishes: [],

  phase: 'ready',

  start: () => {
    set(state => {
      if (state.phase === 'ready' || state.phase === 'ended') {
        return {
          startedAt: Date.now(),
          photo: undefined,
          score: 0,
          fishes: Array.from({ length: state.total }, generateId),
          phase: 'started',
          paused: false,
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
          const toSpawn = randomInt(remaining === 2 ? 1 : 0, 5)
          const newFishes = Array.from({ length: toSpawn }, generateId)
          fishes = [...fishes, ...newFishes]
        }

        return {
          fishes,
          lastHooked: undefined,
          phase: 'hooked',
        }
      }

      return {}
    })
  },

  unhook: fish => {
    set(state => {
      if (state.phase === 'hooked') {
        return {
          score: state.score + 1,
          lastHooked: fish,
          phase: 'unhooked',
        }
      }

      return {}
    })
  },

  end: () => {
    set(state => {
      if (state.phase !== 'ended') {
        return {
          lastPhoto: state.photo,
          lastScore: state.score,
          phase: 'ended',
          menu: 'game-over',
        }
      }

      return {}
    })
  },

  paused: true,
  pause: () => set(() => ({ paused: true })),
  resume: () => set(() => ({ paused: false })),

  menu: 'main',
  setMenu: menu => set(() => ({ menu })),
}))

export default useGame
