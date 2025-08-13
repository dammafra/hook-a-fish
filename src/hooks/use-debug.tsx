import { useEffect, useState } from 'react'

export function useDebug() {
  const [debug, setDebug] = useState(false)
  useEffect(() => {
    const check = import.meta.env.MODE === 'development' || location.hash === '#debug'
    setDebug(check)
  }, [])
  return debug
}
