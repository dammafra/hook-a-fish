import { GizmoHelper, GizmoViewport } from '@react-three/drei'
import { useControls } from 'leva'
import { Perf } from 'r3f-perf'
import { useDebug } from '../hooks/use-debug'

export default function Helpers() {
  const debug = useDebug()
  const { grid, axes, gizmo, perf } = useControls(
    'helpers',
    {
      grid: false,
      axes: false,
      gizmo: false,
      perf: debug,
    },
    { collapsed: true },
  )

  return (
    <>
      {grid && <gridHelper args={[10, 10, 'red', 'gray']} />}
      {axes && <axesHelper args={[20]} position-y={0.001} />}

      {gizmo && (
        <GizmoHelper>
          <GizmoViewport labelColor="white" />
        </GizmoHelper>
      )}

      {perf && <Perf showGraph={false} position="top-left" />}
    </>
  )
}
