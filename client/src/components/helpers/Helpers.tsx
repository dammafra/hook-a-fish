import { GizmoHelper, GizmoViewport } from '@react-three/drei'
import { useRapier } from '@react-three/rapier'
import { button, monitor, useControls } from 'leva'
import { Perf } from 'r3f-perf'
import { useDebug } from '../../hooks/use-debug'

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

  const { step, world } = useRapier()
  useControls('physics', {
    step: button(() => step(1 / 60)),
    bodies: monitor(() => world.bodies.len()),
    colliders: monitor(() => world.colliders.len()),
    joints: monitor(() => world.impulseJoints.len()),
  })

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
