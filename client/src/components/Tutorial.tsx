import { animated } from '@react-spring/web'
import { Html } from '@react-three/drei'
import { useIsTouch } from '../hooks/use-is-touch'
import useGame from '../stores/use-game'

export default function Tutorial() {
  const isTouch = useIsTouch()
  const start = useGame(state => state.start)

  return (
    <group>
      <mesh visible={false}>
        <planeGeometry args={[10, 10]} />
      </mesh>
      <Html center>
        <animated.div className="bg-white/50 border border-white p-10 rounded-xl font-mono w-80 flex flex-col gap-4">
          <p>
            🎣 Control the fishing rod by <b>moving your {isTouch ? 'finger' : 'mouse'}</b>
          </p>

          <p>
            🪣 After you <b>Hook-A-Fish</b>, put it inside your bucket and catch another one!
          </p>

          <button
            className="w-fit bg-green-400 px-5 py-2 rounded-md text-slate-800 font-bold cursor-pointer active:bg-green-300 hover:bg-green-300 self-center"
            onClick={start}
          >
            START
          </button>
        </animated.div>
      </Html>
    </group>
  )
}
