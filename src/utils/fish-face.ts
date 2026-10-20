import {
  Box3,
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  Raycaster,
  Vector2,
  Vector3,
} from 'three'

/**
 * A part of the face, with its geometry centered on its own pivot.
 * In the face space, x is left/right, y is depth (forward is negative) and z is up/down.
 */
export interface FacePart {
  geometry: BufferGeometry
  center: Vector3
  size: Vector3
}

export interface Face {
  eyes: [FacePart, FacePart]
  pupils: [FacePart, FacePart]
  /** Slope of each eyeball surface under its pupil: depth change per unit of x and z */
  slopes: [Vector2, Vector2]
  mouth: FacePart
}

const faces = new WeakMap<BufferGeometry, Face>()

/**
 * The fish model has eyeballs, pupils and lips merged in a single mesh (`Iris`):
 * splits it in its connected pieces so that they can be animated on their own
 */
export function getFace(geometry: BufferGeometry): Face {
  const cached = faces.get(geometry)
  if (cached) return cached

  const parts = splitConnected(geometry).map(toFacePart)

  // The mouth is the lowest piece, pupils are the smallest ones, left before right
  const volume = ({ size }: FacePart) => size.x * size.y * size.z
  const byX = (a: FacePart, b: FacePart) =>
    (a.center.x < b.center.x ? [a, b] : [b, a]) as [FacePart, FacePart]

  const [mouth, ...rest] = parts.sort((a, b) => a.center.z - b.center.z)
  const [pupilA, pupilB, eyeA, eyeB] = rest.sort((a, b) => volume(a) - volume(b))
  const eyes = byX(eyeA, eyeB)
  const pupils = byX(pupilA, pupilB)
  const slopes = eyes.map((eye, i) => surfaceSlope(eye, pupils[i])) as [Vector2, Vector2]

  const face: Face = { mouth, eyes, pupils, slopes }
  faces.set(geometry, face)
  return face
}

/** Splits an indexed geometry in its connected pieces, as index arrays */
function splitConnected(geometry: BufferGeometry) {
  const position = geometry.getAttribute('position')
  const index = geometry.getIndex()!

  // Union-find over triangles, welding vertices at the same position (split along UV seams)
  const parent = Array.from({ length: position.count }, (_, i) => i)
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])))
  const union = (a: number, b: number) => (parent[find(a)] = find(b))

  const welded = new Map<string, number>()
  for (let i = 0; i < position.count; i++) {
    const key = [position.getX(i), position.getY(i), position.getZ(i)].map(v => v.toFixed(4)).join()
    const other = welded.get(key)
    if (other === undefined) welded.set(key, i)
    else union(i, other)
  }

  for (let i = 0; i < index.count; i += 3) {
    union(index.getX(i), index.getX(i + 1))
    union(index.getX(i), index.getX(i + 2))
  }

  const pieces = new Map<number, number[]>()
  for (let i = 0; i < index.count; i += 3) {
    const root = find(index.getX(i))
    if (!pieces.has(root)) pieces.set(root, [])
    pieces.get(root)!.push(index.getX(i), index.getX(i + 1), index.getX(i + 2))
  }

  return [...pieces.values()].map(indices => ({ geometry, indices }))
}

/** Copies a piece in its own geometry, centered on its bounding box */
function toFacePart({ geometry, indices }: { geometry: BufferGeometry; indices: number[] }) {
  const remap = new Map<number, number>()
  for (const i of indices) if (!remap.has(i)) remap.set(i, remap.size)

  const part = new BufferGeometry()
  for (const [name, attribute] of Object.entries(geometry.attributes)) {
    const { itemSize } = attribute
    const array = new Float32Array(remap.size * itemSize)
    for (const [from, to] of remap)
      for (let k = 0; k < itemSize; k++) array[to * itemSize + k] = attribute.getComponent(from, k)
    part.setAttribute(name, new BufferAttribute(array, itemSize))
  }
  part.setIndex(indices.map(i => remap.get(i)!))

  const box = new Box3().setFromBufferAttribute(part.getAttribute('position') as BufferAttribute)
  const center = box.getCenter(new Vector3())
  part.translate(-center.x, -center.y, -center.z)
  part.computeBoundingSphere()

  return { geometry: part, center, size: box.getSize(new Vector3()) }
}

const raycaster = new Raycaster()
const _origin = new Vector3()
const _forward = new Vector3(0, 1, 0)

/**
 * Eyeballs are tilted ellipsoids: samples the actual front surface around the pupil.
 * Pupils slide on its tangent plane, which can only float above a convex surface, never sink in it
 */
function surfaceSlope(eye: FacePart, pupil: FacePart) {
  const mesh = new Mesh(eye.geometry, new MeshBasicMaterial({ side: DoubleSide }))
  const x = pupil.center.x - eye.center.x
  const z = pupil.center.z - eye.center.z

  const depth = (dx: number, dz: number) => {
    raycaster.set(_origin.set(x + dx, -100, z + dz), _forward)
    return raycaster.intersectObject(mesh)[0]?.point.y ?? 0
  }

  const h = 0.25
  return new Vector2((depth(h, 0) - depth(-h, 0)) / (2 * h), (depth(0, h) - depth(0, -h)) / (2 * h))
}
