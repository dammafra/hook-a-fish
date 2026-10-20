import { Vector3 } from 'three'

export type Position = number | [number, number, number] | Vector3

export const parsePosition = (position: Position) => {
  return position instanceof Vector3
    ? position
    : new Vector3().fromArray(
        typeof position === 'number' ? [position, position, position] : position,
      )
}

export const getPositionOnCirlce = (radius: number, angle: number, positionY = 0) => {
  const radians = angle * (Math.PI / 180)
  const x = Math.sin(radians) * radius
  const z = Math.cos(radians) * radius
  return new Vector3(x, positionY, z)
}
