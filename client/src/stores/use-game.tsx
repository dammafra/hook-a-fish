import { Vector3 } from 'three'
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

type GameStore = {
  started: boolean
  start: () => void

  count: number

  hooked: boolean
  toggleHook: () => void

  bucketPosition: Vector3
  setBucketPosition: (x: number, y: number, z: number) => void
}

const useGame = create<GameStore>()(
  subscribeWithSelector(set => ({
    started: false,
    start: () => set(() => ({ started: true })),

    count: 0,

    hooked: false,
    toggleHook: () => {
      return set(state => ({
        hooked: !state.hooked,
        count: state.hooked ? state.count + 1 : state.count,
      }))
    },

    bucketPosition: new Vector3(0, 0, 0),
    setBucketPosition: (x, y, z) => set(() => ({ bucketPosition: new Vector3(x, y, z) })),
  })),
)

export default useGame
