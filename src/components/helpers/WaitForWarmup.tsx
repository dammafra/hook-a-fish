import { use, useEffect } from 'react'
import useGame from '../../stores/use-game'
import { warmedUp } from '../../utils/warmup'

/**
 * Suspends until ShaderWarmup is done, which in turn only runs once every model has loaded,
 * then opens the main menu as the loader goes away
 */
export default function WaitForWarmup() {
  use(warmedUp)

  const setMenu = useGame(state => state.setMenu)
  useEffect(() => setMenu('main'), [setMenu])

  return null
}
