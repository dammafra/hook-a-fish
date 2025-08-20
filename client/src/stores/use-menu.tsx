import { create } from 'zustand'

type MenuStore = {
  sections: number[]
  setSections: (sections: number[]) => void
}

const useMenu = create<MenuStore>()(set => ({
  sections: [0],
  setSections: sections => set(() => ({ sections })),
}))

export default useMenu
