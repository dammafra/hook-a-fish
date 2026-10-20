import { registerSW } from 'virtual:pwa-register'
import useGame from '../stores/use-game'

const UPDATE_INTERVAL = 60 * 60 * 1000

// Reloading mid-game would throw the match away: only reload on the loader or the main menu
const canReload = () => {
  const { phase, menu } = useGame.getState()
  const inGame = phase !== 'ready' && phase !== 'ended'
  return !inGame && (menu === 'main' || menu === undefined)
}

const reloadWhenIdle = () => {
  if (canReload()) return window.location.reload()

  const unsubscribe = useGame.subscribe(() => {
    if (!canReload()) return
    unsubscribe()
    window.location.reload()
  })
}

export function registerPWA() {
  registerSW({
    immediate: true,
    onNeedReload: reloadWhenIdle,
    onRegisteredSW: (_, registration) => {
      if (!registration) return

      // Installed PWAs are resumed rather than reloaded, so the browser rarely checks for a new sw.js on its own
      const update = () => registration.update().catch(() => {})
      setInterval(update, UPDATE_INTERVAL)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') update()
      })
    },
  })
}
