varying vec3 vWorldPosition;
varying vec4 vClipPosition;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;

  gl_Position = projectionMatrix * viewMatrix * worldPosition;
  vClipPosition = gl_Position;
}
