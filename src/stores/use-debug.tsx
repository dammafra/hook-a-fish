import { create } from 'zustand'

type DebugStore = {
  debug: boolean
}

export default create<DebugStore>()(() => ({
  debug: import.meta.env.MODE === 'development' || location.hash === '#debug',
}))
