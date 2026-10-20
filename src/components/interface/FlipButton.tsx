import { Billboard, Html } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import { useHideOnResize } from '../../hooks/use-hide-on-resize'
import useGame from '../../stores/use-game'
import { getPositionOnCirlce } from '../../utils/position'

export default function FlipButton() {
  const { viewport } = useThree()
  const hidden = useHideOnResize()

  const flip = useGame(state => state.flip)
  const toggleFlip = useGame(state => state.toggleFlip)

  const position = useMemo(() => getPositionOnCirlce(1, flip ? 180 : 270, 1), [flip])

  useEffect(() => {
    if (viewport.aspect > 1 && flip) toggleFlip()
  }, [viewport.aspect, flip, toggleFlip])

  return (
    viewport.aspect < 1 && (
      <Billboard position={position}>
        {/* see https://github.com/pmndrs/drei/issues/859#issuecomment-1536513800 */}
        <Html
          scale={[flip ? -0.5 : 0.5, 0.5, 0.5]}
          transform
          wrapperClass={hidden ? 'hidden' : 'block'}
        >
          <button
            onClick={toggleFlip}
            className="overlay-content overlay-button"
            style={{ transform: 'scale(2)' }}
          >
            <span className="icon-[uim--flip-v-alt]" />
          </button>
        </Html>
      </Billboard>
    )
  )
}
