import { RigidBody } from '@react-three/rapier';
import { useControls } from 'leva';

export default function World() {
  const { cubeColor } = useControls("world", {
    cubeColor: { value: "orange", label: "cube color" },
  });

  return (
    <>
      <RigidBody position={[0, 1, 0]}>
        <mesh castShadow>
          <boxGeometry />
          <meshStandardMaterial color={cubeColor} />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed">
        <mesh receiveShadow scale={[5, 0.1, 5]}>
          <boxGeometry />
          <meshStandardMaterial color="limegreen" />
        </mesh>
      </RigidBody>
    </>
  )
}
