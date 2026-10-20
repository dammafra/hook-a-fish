import { useEffect } from 'react'

// iOS Safari can leave the page scrolled after an orientation change: with a fixed body,
// elements render in place but touches are hit-tested with the stale offset
export default function ScrollResetter() {
  useEffect(() => {
    const reset = () => window.scrollTo(0, 0)
    window.addEventListener('resize', reset)
    window.visualViewport?.addEventListener('resize', reset)
    return () => {
      window.removeEventListener('resize', reset)
      window.visualViewport?.removeEventListener('resize', reset)
    }
  }, [])

  return null
}
