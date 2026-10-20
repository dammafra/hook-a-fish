import { Euler, Quaternion } from 'three'

export type Rotation = number | [number, number, number] | Quaternion | Euler

export const parseRotation = (rotation: Rotation) => {
  return rotation instanceof Euler
    ? rotation
    : rotation instanceof Quaternion
      ? new Euler().setFromQuaternion(rotation)
      : new Euler().fromArray(
          typeof rotation === 'number' ? [rotation, rotation, rotation] : rotation,
        )
}
