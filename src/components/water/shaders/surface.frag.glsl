uniform float uTime;

// Scene rendered without the water (see WaterSurface pre-pass)
uniform sampler2D uSceneColor;
uniform sampler2D uSceneDepth;
uniform bool uHasScene; // false when rendered by a camera without a pre-pass
uniform mat4 uProjectionMatrixInverse;
uniform mat4 uCameraMatrixWorld;

uniform vec3 uShallowColor;
uniform vec3 uDeepColor;
uniform vec3 uFoamColor;
uniform float uDepthMax;
uniform float uRefraction;
uniform float uFoamWidth;
uniform float uShoreWaves;

uniform vec4 uRipples[RIPPLES_COUNT]; // (x, z, start time, strength)
uniform float uRippleRadius;
uniform float uRippleLife;

varying vec3 vWorldPosition;
varying vec4 vClipPosition;

#ifdef SHORE
  #define DEPTH_SCALE 1.0
  #define CONTACT_FOAM 0.3
  #define VEIL 0.05
#else
  // Small contained water (bucket): shallow but should still read as water
  #define DEPTH_SCALE 3.0
  #define CONTACT_FOAM 0.1
  #define VEIL 0.2
#endif

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

vec2 hash2(vec2 p) {
  return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

vec2 cellPoint(vec2 cell, float t) {
  return 0.5 + 0.5 * sin(t + 6.2831 * hash2(cell));
}

// Distance to the closest border of animated voronoi cells.
// Exact distance rather than F2 - F1, which drops below the line width over whole cells
// when two points get close and makes the lines merge into big blobs
float cellEdge(vec2 p, float t) {
  vec2 n = floor(p);
  vec2 f = fract(p);

  // Closest point
  vec2 mg = vec2(0.0);
  vec2 mr = vec2(0.0);
  float md = 8.0;

  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 r = g + cellPoint(n + g, t) - f;
      float d = dot(r, r);

      if (d < md) {
        md = d;
        mr = r;
        mg = g;
      }
    }
  }

  // Distance to the bisectors with its neighbours
  md = 8.0;

  for (int j = -2; j <= 2; j++) {
    for (int i = -2; i <= 2; i++) {
      vec2 g = mg + vec2(float(i), float(j));
      vec2 r = g + cellPoint(n + g, t) - f;
      vec2 delta = r - mr;

      if (dot(delta, delta) > 0.00001) {
        md = min(md, dot(0.5 * (mr + r), normalize(delta)));
      }
    }
  }

  return md;
}

// Crisp but anti-aliased "distance < width" mask
float line(float d, float width, float aa) {
  return 1.0 - smoothstep(width - aa, width + aa, d);
}

// Vertical distance between the water surface and the scene behind this pixel
float sceneDepth(vec2 uv) {
  float depth = texture2D(uSceneDepth, uv).x;
  vec4 view = uProjectionMatrixInverse * vec4(vec3(uv, depth) * 2.0 - 1.0, 1.0);
  vec3 world = (uCameraMatrixWorld * vec4(view.xyz / view.w, 1.0)).xyz;
  return vWorldPosition.y - world.y;
}

void main() {
  vec2 p = vWorldPosition.xz;
  float px = length(fwidth(p)); // world units per pixel, for anti-aliasing
  vec2 screenUv = vClipPosition.xy / vClipPosition.w * 0.5 + 0.5;

  #ifdef SHORE
    // Waves lapping the shore: the water spills over the grass by an animated amount,
    // always a bit so the edge of the hole in the ground stays covered
    float angle = atan(p.y, p.x);
    float lapping = 0.5 + 0.3 * sin(uTime * 1.1 + angle * 4.0) + 0.2 * sin(uTime * 0.7 - angle * 7.0 + 1.3);
    lapping += (noise(p * 4.0 + uTime * 0.3) - 0.5) * 0.4;
    float spill = uShoreWaves * (0.3 + lapping);

    float shoreDistance = shoreRadius(p) + spill - length(p); // shoreRadius() from shore.ts
    if (shoreDistance < 0.0) discard;
  #else
    // Contained by its geometry (e.g. the bucket): only contact foam along the walls
    float shoreDistance = 1000.0;
  #endif

  // Ripples
  float rippleLines = 0.0;
  vec2 rippleOffset = vec2(0.0);

  for (int i = 0; i < RIPPLES_COUNT; i++) {
    vec4 ripple = uRipples[i];
    float age = uTime - ripple.z;
    if (age < 0.0 || age > uRippleLife) continue;

    float k = age / uRippleLife;
    float fade = 1.0 - k;
    float radius = uRippleRadius * ripple.w * (1.0 - fade * fade); // ease out
    float width = 0.004 + 0.016 * fade;

    vec2 dir = p - ripple.xy;
    float d = length(dir);

    float outer = line(abs(d - radius), width, px);
    // Second ring only for the stronger ripples
    float inner = line(abs(d - radius * 0.55), width * 0.7, px) * 0.7 * smoothstep(0.6, 1.0, ripple.w);
    rippleLines = max(rippleLines, max(outer, inner) * fade);

    float wave = (d - radius) / 0.05;
    rippleOffset += dir / max(d, 0.001) * exp(-wave * wave) * fade * ripple.w;
  }

  // Surface motion
  vec2 wave = vec2(
    noise(p * 3.0 + uTime * 0.3),
    noise(p * 3.0 + vec2(5.2, 1.3) - uTime * 0.3)
  ) - 0.5;
  vec2 distortion = (wave + rippleOffset * 0.5) * uRefraction;

  float shore = 1.0 - smoothstep(0.0, 1.3, shoreDistance);

  // Underwater: refracted scene, absorbed with depth
  vec3 color;
  float contactDepth = 1000.0;

  if (uHasScene) {
    contactDepth = max(sceneDepth(screenUv), 0.0);

    // Shallow areas refract less; discard samples of objects above the surface
    vec2 uv = screenUv + distortion * clamp(contactDepth * 3.0, 0.0, 1.0);
    float depth = sceneDepth(uv);
    if (depth < 0.0) {
      uv = screenUv;
      depth = contactDepth;
    }

    vec3 scene = texture2D(uSceneColor, uv).rgb;
    vec3 tinted = scene * mix(vec3(1.0), uDeepColor, 0.4);
    color = mix(tinted, uDeepColor, smoothstep(0.0, uDepthMax, depth * DEPTH_SCALE));
  } else {
    color = mix(uDeepColor, uShallowColor, 0.3);
  }

  // Never fully clear: a veil of water color and lighter shallows near the shore
  color = mix(color, uShallowColor, VEIL + 0.75 * shore * shore);

  #ifdef SHORE
    // Cartoon highlights
    float edge = cellEdge(p * 1.5 + wave * 0.8, uTime * 0.6);
    float highlightMask = smoothstep(0.55, 0.8, noise(p * 0.8 + uTime * 0.05));
    float highlights = line(edge, 0.018, px * 0.75) * highlightMask;
    color = mix(color, uFoamColor, highlights * 0.25);
  #endif

  color = mix(color, uFoamColor, rippleLines * 0.8);

  // Foam: wobbly band along the shore and around anything piercing the surface
  float foamNoise = noise(p * 7.0 + vec2(uTime * 0.3, -uTime * 0.25));
  float shoreFoam = line(shoreDistance, uFoamWidth * (0.55 + 0.9 * foamNoise), px);
  float contactFoam = 1.0 - smoothstep(0.0, 0.01, contactDepth - uFoamWidth * CONTACT_FOAM * (0.5 + foamNoise));

  // Dashed line breathing back and forth off the shore
  float lineDistance = uFoamWidth * (2.0 + 0.6 * sin(uTime * 1.3)) + (foamNoise - 0.5) * 0.06;
  float shoreLine = line(abs(shoreDistance - lineDistance), 0.012, px);
  shoreLine *= smoothstep(0.3, 0.4, noise(p * 3.0 - uTime * 0.1));

  float foam = max(max(shoreFoam, contactFoam), shoreLine);
  color = mix(color, uFoamColor, foam);

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
