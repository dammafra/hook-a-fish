import { Vector4 } from 'three'

/**
 * Fire-and-forget water effects, emitted from anywhere (physics callbacks, frame loops)
 * and consumed every frame by the water surface and the splashes.
 * Plain mutable buffers instead of a store: no re-renders, no allocations.
 */

const start = performance.now()

/** Seconds since load, shared clock between ripple emitters and the water shader */
export const waterTime = () => (performance.now() - start) / 1000

export const RIPPLES_COUNT = 48

/** Ring buffer uploaded as-is to the shader: (x, z, start time, strength) */
export const ripples = Array.from({ length: RIPPLES_COUNT }, () => new Vector4(0, 0, -1000, 0))
let rippleIndex = 0

export function emitRipple(x: number, z: number, strength = 1) {
  ripples[rippleIndex].set(x, z, waterTime(), strength)
  rippleIndex = (rippleIndex + 1) % RIPPLES_COUNT
}

type SplashOptions = {
  strength?: number
  /** Droplets size multiplier */
  size?: number
  /** Number of droplets */
  count?: number
  /** Whether the splash and its droplets landing back leave ripples */
  ripples?: boolean
  /** Height of the water surface the splash comes from */
  y?: number
  /** Size of the water around the splash: droplets landing farther fall to the ground (y = 0) */
  radius?: number
}

type Splash = Required<SplashOptions> & { x: number; z: number }

/** Splashes waiting to be turned into droplets on the next frame */
export const pendingSplashes: Splash[] = []

export function emitSplash(
  x: number,
  z: number,
  {
    strength = 1,
    size = 1,
    count = 24,
    ripples = true,
    y = 0,
    radius = Infinity,
  }: SplashOptions = {},
) {
  pendingSplashes.push({ x, z, strength, size, count, ripples, y, radius })
  if (ripples) emitRipple(x, z, 2.5 * strength)
}
