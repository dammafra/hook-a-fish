import { useState } from 'react'

export function useIsTouch() {
  const [isTouch] = useState('ontouchstart' in window || navigator.maxTouchPoints > 0)
  return isTouch
}
