import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Euler,
  Matrix4,
  Quaternion,
  Vector3,
  type ColorRepresentation,
  type Mesh,
  type MeshStandardMaterial,
} from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/** Body, tail and fin of the fish model, with the transforms of their nodes */
const BODY_PARTS = [
  {
    node: 'Sphere_Color_0',
    position: [0, 231.474, 6.24],
    rotation: [-Math.PI / 2, 0, 0],
    scale: 140.754,
  },
  {
    node: 'Tail_Color_0',
    position: [0, 238.314, -111.059],
    rotation: [-Math.PI / 2, 1.571, 0],
    scale: 100,
  },
  {
    node: 'Sphere002_Color_0',
    position: [0, 231.474, 6.24],
    rotation: [-0.478, -0.674, 1.824],
    scale: 140.754,
  },
] as const

type BodyNodes = Record<(typeof BODY_PARTS)[number]['node'], Mesh>

const bodies = new WeakMap<BodyNodes, BufferGeometry>()

/**
 * Body, tail and fin merged in a single geometry, to save draw calls.
 * A `part` attribute (index in BODY_PARTS) lets the material color each part on its own
 */
export function getBody(nodes: BodyNodes) {
  const cached = bodies.get(nodes)
  if (cached) return cached

  const geometries = BODY_PARTS.map(({ node, position, rotation, scale }, part) => {
    // Copies (no uvs, the body has no texture): applyMatrix4 changes attributes in place
    const source = nodes[node].geometry
    const geometry = new BufferGeometry()
    geometry.setIndex(source.getIndex())
    geometry.setAttribute('position', source.getAttribute('position').clone())
    geometry.setAttribute('normal', source.getAttribute('normal').clone())
    geometry.applyMatrix4(
      new Matrix4().compose(
        new Vector3(...position),
        new Quaternion().setFromEuler(new Euler(...rotation)),
        new Vector3().setScalar(scale),
      ),
    )

    const count = geometry.getAttribute('position').count
    geometry.setAttribute('part', new BufferAttribute(new Float32Array(count).fill(part), 1))
    return geometry
  })

  const body = mergeGeometries(geometries)
  bodies.set(nodes, body)
  return body
}

/**
 * One material for the whole body (see getBody), with a color for each part.
 * Every fish gets its own, but they all share the same shader program
 */
export function createBodyMaterial(
  base: MeshStandardMaterial,
  colors: [ColorRepresentation, ColorRepresentation, ColorRepresentation],
) {
  const material = base.clone()
  material.map = null
  material.metalness = 0.5
  material.roughness = 0.8

  const partColors = colors.map(color => new Color(color))
  material.onBeforeCompile = shader => {
    shader.uniforms.uPartColors = { value: partColors }
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        '#include <common>\nattribute float part;\nvarying float vPart;',
      )
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvPart = part;')
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nuniform vec3 uPartColors[3];\nvarying float vPart;',
      )
      .replace(
        'vec4 diffuseColor = vec4( diffuse, opacity );',
        'vec3 partColor = vPart < 0.5 ? uPartColors[0] : vPart < 1.5 ? uPartColors[1] : uPartColors[2];\n' +
          'vec4 diffuseColor = vec4( diffuse * partColor, opacity );',
      )
  }

  return material
}
