import { useEffect, useState } from 'react'

export function useIsTouch() {
  const [isTouch, setIsTouch] = useState(false)
  useEffect(() => {
    const check = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    setIsTouch(check)
  }, [])
  return isTouch
}
