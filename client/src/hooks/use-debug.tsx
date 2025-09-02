import { useState } from 'react'

export function useDebug() {
  const [debug] = useState(import.meta.env.MODE === 'development' || location.hash === '#debug')
  return debug
}
