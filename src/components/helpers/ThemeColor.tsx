import { useEffect } from 'react'
import useGame from '../../stores/use-game'

const WATER = '#035ba2'
const GRASS = '#598719'

/** Tints the browser UI after the scene: grass while playing, water otherwise */
export default function ThemeColor() {
  const playing = useGame(state => state.phase !== 'ready' && state.phase !== 'ended')
  const color = playing ? GRASS : WATER

  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color)
  }, [color])

  // iOS 26 Safari ignores theme-color and samples fixed elements at the viewport edges instead,
  // but only after a layout: remounting the layer on every change forces it to pick up the new color
  return (
    <div
      key={color}
      className="pointer-events-none fixed inset-0 -z-1"
      style={{ backgroundColor: color }}
    />
  )
}
