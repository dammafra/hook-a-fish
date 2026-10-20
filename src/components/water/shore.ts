import { IcosahedronGeometry } from 'three'

/**
 * Organic pond outline: a base radius bulging outward by up to `SHORE_AMPLITUDE`.
 * Only outward, so the fishes physics bounds (a circle of base radius) always stay in the water.
 * Shared by the hole cut in the grass and the shore foam of the water shader.
 */
const SHORE_AMPLITUDE = 0.35

// [weight, frequency, phase], integer frequencies keep the outline seamless around the circle
const WAVES = [
  [0.25, 2, 1.3],
  [0.15, 3, 0.4],
  [0.1, 5, 2.1],
] as const

/** Offset in [0, 1] at the given angle */
function shoreOffset(angle: number) {
  return WAVES.reduce((sum, [w, f, p]) => sum + w * Math.sin(f * angle + p), 0.5)
}

function shoreRadius(angle: number, radius: number) {
  return radius + SHORE_AMPLITUDE * shoreOffset(angle)
}

/** Same function for the shader, angle measured on the world XZ plane */
export const shoreChunk = /* glsl */ `
  uniform float uShoreRadius;

  float shoreRadius(vec2 p) {
    float angle = atan(p.y, p.x);
    float offset = 0.5${WAVES.map(([w, f, p]) => ` + ${w.toFixed(3)} * sin(${f.toFixed(1)} * angle + ${p.toFixed(3)})`).join('')};
    return uShoreRadius + ${SHORE_AMPLITUDE.toFixed(3)} * offset;
  }
`

/** Unit sphere stretched horizontally so that its section at y = 0 follows the shore */
export function createShoreGeometry(radius: number, detail = 8) {
  const geometry = new IcosahedronGeometry(1, detail)
  const position = geometry.attributes.position

  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i)
    const z = position.getZ(i)
    const scale = shoreRadius(Math.atan2(z, x), radius)
    position.setXYZ(i, x * scale, position.getY(i) * radius, z * scale)
  }

  geometry.computeVertexNormals()
  return geometry
}
