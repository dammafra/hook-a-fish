import { useEffect, useState } from 'react'

export function useHideOnResize(delay: number = 300): boolean {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    const handleResize = () => {
      setHidden(true)
      clearTimeout(timer)
      timer = setTimeout(() => setHidden(false), delay)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timer)
    }
  }, [delay])

  return hidden
}
