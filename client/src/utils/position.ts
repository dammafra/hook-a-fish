import { Vector3 } from 'three'

export type Position = number | [number, number, number] | Vector3

export const parsePosition = (position: Position) => {
  return position instanceof Vector3
    ? position
    : new Vector3().fromArray(
        typeof position === 'number' ? [position, position, position] : position,
      )
}
