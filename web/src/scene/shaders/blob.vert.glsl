// VERTEX SHADER
// Runs once for every vertex (corner point) of the sphere, in parallel on the GPU.
// Its job: decide where each vertex ends up on screen.
// Here we push each vertex in/out along its normal using noise to make the blob wobble.

uniform float uTime;
uniform float uFrequency; // how "busy" the noise is (small = big smooth lumps)
uniform float uAmplitude; // how far vertices get pushed
uniform float uSpeed;     // how fast the noise drifts
uniform vec3 uPointer;    // where the mouse touches the blob (in the mesh's local space)
uniform float uHover;     // 0 = mouse away, 1 = mouse on the blob (eased in JS)

// "varyings" pass data from the vertex shader to the fragment shader
varying float vDisplacement;
varying vec3 vNormal;
varying vec3 vViewPosition;

// ---------------------------------------------------------------------------
// 3D simplex noise – smooth, organic randomness.
// By Ian McEwan & Stefan Gustavson (Ashima Arts), MIT license.
// https://github.com/ashima/webgl-noise
// ---------------------------------------------------------------------------
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
// ---------------------------------------------------------------------------

// How far to push a point on the sphere outward (+) or inward (-)
float getDisplacement(vec3 p) {
  // Layer 1: drifting noise for the organic wobble
  float noise = snoise(p * uFrequency + uTime * uSpeed);

  // Layer 2: a bulge that swells up under the mouse cursor
  float distToPointer = distance(p, uPointer);
  float bulge = (1.0 - smoothstep(0.0, 0.9, distToPointer)) * uHover * 0.35;

  return noise * uAmplitude + bulge;
}

// Any vector perpendicular to v (used to find neighbouring points below)
vec3 orthogonal(vec3 v) {
  return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0) : vec3(0.0, -v.z, v.y));
}

void main() {
  float displacement = getDisplacement(position);
  vec3 displacedPosition = position + normal * displacement;

  // Moving vertices breaks the original normals (the direction each point "faces"),
  // which lighting depends on. Trick: displace two tiny neighbouring points too,
  // then the cross product of the two edges gives the new surface direction.
  vec3 tangent = orthogonal(normal);
  vec3 bitangent = normalize(cross(normal, tangent));
  float eps = 0.01;
  vec3 neighbourA = position + tangent * eps;
  vec3 neighbourB = position + bitangent * eps;
  neighbourA += normal * getDisplacement(neighbourA);
  neighbourB += normal * getDisplacement(neighbourB);
  vec3 displacedNormal = normalize(cross(neighbourA - displacedPosition, neighbourB - displacedPosition));

  // Standard Three.js transforms: local space -> camera space -> screen
  vec4 mvPosition = modelViewMatrix * vec4(displacedPosition, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  vDisplacement = displacement;
  vNormal = normalize(normalMatrix * displacedNormal);
  vViewPosition = -mvPosition.xyz;
}
