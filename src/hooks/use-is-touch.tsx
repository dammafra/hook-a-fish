import { useSyncExternalStore } from 'react'

const mediaQuery = window.matchMedia('(pointer: coarse)')

function subscribe(onChange: () => void) {
  mediaQuery.addEventListener('change', onChange)
  return () => mediaQuery.removeEventListener('change', onChange)
}

export function useIsTouch() {
  return useSyncExternalStore(subscribe, () => mediaQuery.matches)
}
