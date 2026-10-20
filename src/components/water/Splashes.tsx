import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useRef } from 'react'
import { InstancedMesh, Matrix4, Quaternion, Vector3 } from 'three'
import { random, randomAngle } from '../../utils/random'
import { emitRipple, pendingSplashes } from './events'

const COUNT = 96
const DROPLETS_PER_SPLASH = 24
const GRAVITY = -9.8

// Scratch objects reused every frame to avoid garbage collection hitches
const _matrix = new Matrix4()
const _quaternion = new Quaternion()
const _scale = new Vector3()
const _direction = new Vector3()
const _up = new Vector3(0, 1, 0)
const _hidden = new Matrix4().makeScale(0, 0, 0)

type Droplet = {
  position: Vector3
  velocity: Vector3
  size: number
  origin: Vector3
  surfaceY: number
  radius: number
  alive: boolean
}

// Module level pool: there is a single splashes instance, simulated every frame
const droplets: Droplet[] = Array.from({ length: COUNT }, () => ({
  position: new Vector3(),
  velocity: new Vector3(),
  size: 0,
  origin: new Vector3(),
  surfaceY: 0,
  radius: 0,
  alive: false,
}))

export default function Splashes() {
  const mesh = useRef<InstancedMesh>(null!)
  const cursor = useRef(0)
  const active = useRef(false)

  useLayoutEffect(() => {
    for (let i = 0; i < COUNT; i++) mesh.current.setMatrixAt(i, _hidden)
    mesh.current.instanceMatrix.needsUpdate = true
  }, [])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30)

    for (const { x, y, z, strength, size, radius } of pendingSplashes) {
      for (let i = 0; i < DROPLETS_PER_SPLASH; i++) {
        const droplet = droplets[cursor.current]
        cursor.current = (cursor.current + 1) % COUNT

        const angle = randomAngle()
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)
        const spread = random(0.4, 1.4) * strength

        droplet.position.set(x + cos * 0.08 * strength, y + 0.02, z + sin * 0.08 * strength)
        droplet.velocity.set(cos * spread, random(2, 3.8) * strength, sin * spread)
        droplet.size = random(0.03, 0.06) * size
        droplet.origin.set(x, y, z)
        droplet.surfaceY = y
        droplet.radius = radius
        droplet.alive = true
      }
      active.current = true
    }
    pendingSplashes.length = 0

    if (!active.current) return
    active.current = false

    for (let i = 0; i < COUNT; i++) {
      const droplet = droplets[i]

      if (droplet.alive) {
        droplet.velocity.y += GRAVITY * dt
        droplet.position.addScaledVector(droplet.velocity, dt)

        if (droplet.velocity.y < 0) {
          const { x, y, z } = droplet.position
          const inWater = Math.hypot(x - droplet.origin.x, z - droplet.origin.z) < droplet.radius

          // Back into the water
          if (inWater && y < droplet.surfaceY) {
            droplet.alive = false
            if (Math.random() < 0.35) emitRipple(x, z, 0.3)
          }

          // Out of it, onto the ground
          if (!inWater && y < 0) droplet.alive = false
        }
      }

      if (!droplet.alive) {
        mesh.current.setMatrixAt(i, _hidden)
        continue
      }

      active.current = true

      // Stretched along the velocity for a cartoon drop look
      const speed = droplet.velocity.length()
      _direction.copy(droplet.velocity).divideScalar(speed)
      _quaternion.setFromUnitVectors(_up, _direction)
      _scale.set(droplet.size, droplet.size * (1 + speed * 0.15), droplet.size)
      _matrix.compose(droplet.position, _quaternion, _scale)
      mesh.current.setMatrixAt(i, _matrix)
    }

    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <icosahedronGeometry args={[1, 1]} />
      <meshToonMaterial color="#e6fbff" />
    </instancedMesh>
  )
}
