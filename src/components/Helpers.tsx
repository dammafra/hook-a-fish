import { GizmoHelper, GizmoViewport } from '@react-three/drei'
import { useControls } from 'leva'
import { Perf } from 'r3f-perf'
import useDebug from '../stores/use-debug'

export default function Helpers() {
  const debug = useDebug(state => state.debug)
  const { grid, axes, gizmo, perf } = useControls(
    'helpers',
    {
      grid: debug,
      axes: false,
      gizmo: debug,
      perf: debug,
    },
    { collapsed: true },
  )

  return (
    <>
      <gridHelper visible={grid} args={[10, 10, 'red', 'gray']} />
      <axesHelper visible={axes} args={[20]} position-y={0.001} />

      <GizmoHelper>
        <GizmoViewport visible={gizmo} labelColor="white" />
      </GizmoHelper>

      <Perf className={perf ? '' : 'hidden'} showGraph={false} position="top-left" />
    </>
  )
}
