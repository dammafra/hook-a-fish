import {
  Color,
  Matrix4,
  ShaderMaterial,
  type Camera,
  type Object3D,
  type Scene,
  type Texture,
  type WebGLRenderer,
  type WebGLRenderTarget,
} from 'three'
import { RIPPLES_COUNT, ripples } from './events'
import fragmentShader from './shaders/surface.frag.glsl?raw'
import vertexShader from './shaders/surface.vert.glsl?raw'
import { shoreChunk } from './shore'

/**
 * Uniforms shared by every water material (pond and bucket), updated once by WaterSurface.
 * Materials are created here rather than through JSX because R3F copies `uniforms` props.
 */
export const waterUniforms = {
  uTime: { value: 0 },
  uSceneColor: { value: null as Texture | null },
  uSceneDepth: { value: null as Texture | null },
  uHasScene: { value: false },
  uProjectionMatrixInverse: { value: new Matrix4() },
  uCameraMatrixWorld: { value: new Matrix4() },
  uShallowColor: { value: new Color() },
  uDeepColor: { value: new Color() },
  uFoamColor: { value: new Color() },
  uDepthMax: { value: 0 },
  uRefraction: { value: 0 },
  uFoamWidth: { value: 0 },
  uShoreWaves: { value: 0 },
  uShoreRadius: { value: 0 },
  uRipples: { value: ripples },
  uRippleRadius: { value: 0 },
  uRippleLife: { value: 0 },
}

function createWaterMaterial(shore: boolean) {
  return new ShaderMaterial({
    vertexShader,
    fragmentShader: shoreChunk + fragmentShader,
    defines: shore ? { RIPPLES_COUNT, SHORE: '' } : { RIPPLES_COUNT },
    uniforms: waterUniforms,
  })
}

/** Pond: organic shoreline with lapping waves and shore foam */
export const pondWaterMaterial = createWaterMaterial(true)

/** Water held by its geometry (bucket): contact foam only */
export const containedWaterMaterial = createWaterMaterial(false)

/** Camera the scene pre-pass was rendered with, set by renderWithWater */
const waterPass = { camera: null as Camera | null }

/** Objects hidden during the pre-pass: water surfaces and anything floating on them */
const waterObjects = new Set<Object3D>()

/**
 * Renders the scene into `target` (null for the canvas) with refracting water:
 * first the scene without the water into `prePass` (which needs a depth texture), then the full scene.
 * WaterSurface runs it every frame for the main camera, other cameras (e.g. PhotoCamera) run it on demand.
 */
export function renderWithWater(
  gl: WebGLRenderer,
  scene: Scene,
  camera: Camera,
  prePass: WebGLRenderTarget,
  target: WebGLRenderTarget | null = null,
) {
  waterPass.camera = camera
  waterUniforms.uSceneColor.value = prePass.texture
  waterUniforms.uSceneDepth.value = prePass.depthTexture

  for (const object of waterObjects) object.visible = false
  gl.setRenderTarget(prePass)
  gl.render(scene, camera)
  for (const object of waterObjects) object.visible = true

  // Shadow maps were just computed by the pre-pass
  gl.shadowMap.autoUpdate = false
  gl.setRenderTarget(target)
  gl.render(scene, camera)
  gl.setRenderTarget(null)
  gl.shadowMap.autoUpdate = true
}

/**
 * Ref callback registering an object to be hidden during the pre-pass, for as long as it is mounted.
 * Water surfaces also get their camera uniforms right before being drawn:
 * cameras without a pre-pass (see renderWithWater) get the plain (non refracted) look.
 */
function waterObjectRef(surface = true) {
  return (object: Object3D | null) => {
    if (!object) return
    waterObjects.add(object)

    if (surface) {
      object.onBeforeRender = (_renderer, _scene, camera, _geometry, material) => {
        waterUniforms.uHasScene.value = camera === waterPass.camera
        waterUniforms.uProjectionMatrixInverse.value = camera.projectionMatrixInverse
        waterUniforms.uCameraMatrixWorld.value = camera.matrixWorld
        ;(material as ShaderMaterial).uniformsNeedUpdate = true
      }
    }

    return () => {
      waterObjects.delete(object)
    }
  }
}

export const waterSurfaceRef = waterObjectRef()
export const floatingObjectRef = waterObjectRef(false)
