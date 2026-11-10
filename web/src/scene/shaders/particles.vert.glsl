// PARTICLES – VERTEX SHADER
//
// Runs once per particle, every frame, all in parallel on the GPU.
// JavaScript never moves a single particle: it only updates a handful of
// uniforms (time, scroll, mouse...) and each particle works out its own
// position from those plus its personal attributes. That's why we can
// animate thousands of them for almost free.
//
// Every particle has TWO homes and blends between them:
//   1. "dust"  – a random spot in a big volume, drifting and rising as you scroll
//   2. "ring"  – a slot in a tilted disk orbiting the blob, like Saturn's rings

uniform float uTime;
uniform float uScroll;      // page scroll in sections (0..4)
uniform float uRing;        // 0 = all dust, 1 = all ring (from keyframes.js)
uniform vec3 uCenter;       // the blob's position
uniform float uScale;       // the blob's size
uniform vec2 uPointer;      // mouse, -1..1
uniform float uPush;        // 0..1, how strongly the mouse pushes (0 until it moves)
uniform vec2 uHalfView;     // half the visible width/height at z = 0
uniform float uSize;
uniform float uPixelRatio;
uniform vec3 uColorA;
uniform vec3 uColorB;

// Per-particle data ("attributes"), set once in JS when the page loads.
// `position` (the dust home) is built in to Three.js; these are our own.
attribute vec3 aOrbit;  // ring home: (radius, starting angle, height above the disk)
attribute float aRandom; // 0..1, a personal random number for variety

varying vec3 vColor;
varying float vAlpha;

const float CAMERA_Z = 4.0;

// Tilts the flat ring so we see it at an angle (rotate around X, then Z).
// 0.0 around X = perfectly edge-on (a thin line), 1.57 = facing us (a circle).
vec3 tilt(vec3 p) {
  float cx = cos(0.4), sx = sin(0.4);
  p = vec3(p.x, p.y * cx - p.z * sx, p.y * sx + p.z * cx);
  float cz = cos(0.35), sz = sin(0.35);
  return vec3(p.x * cz - p.y * sz, p.x * sz + p.y * cz, p.z);
}

void main() {
  // ---- 1. Dust home ------------------------------------------------------
  vec3 dust = position;
  // Rise as the page scrolls (nearer particles faster = depth/parallax), and
  // wrap around with mod() so the field never runs out: a particle leaving
  // the top re-enters at the bottom.
  dust.y = mod(dust.y + uScroll * (1.2 + aRandom * 1.6) + 5.0, 10.0) - 5.0;
  // Gentle drifting
  dust.x += sin(uTime * 0.2 + aRandom * 40.0) * 0.12;
  dust.y += cos(uTime * 0.15 + aRandom * 25.0) * 0.12;

  // ---- 2. Ring home -------------------------------------------------------
  float radius = aOrbit.x;
  // Inner particles orbit faster than outer ones, like real planets' moons
  float angle = aOrbit.y + uTime * (0.45 / radius);
  vec3 ring = vec3(cos(angle) * radius, aOrbit.z, sin(angle) * radius);
  ring = tilt(ring) * uScale + uCenter;

  // ---- 3. Morph between the two -------------------------------------------
  // Each particle starts its trip at a slightly different moment (delay),
  // so the ring assembles and breaks apart in a ripple instead of all at once.
  float delay = aRandom * 0.4;
  float morph = smoothstep(delay, delay + 0.6, uRing);
  vec3 pos = mix(dust, ring, morph);

  // ---- 4. Push away from the mouse ---------------------------------------
  // Where is the mouse at this particle's depth? (Further away = the same
  // screen spot covers more space, so scale by distance from the camera.)
  vec2 mouse = uPointer * uHalfView * (CAMERA_Z - pos.z) / CAMERA_Z;
  vec2 away = pos.xy - mouse;
  float dist = length(away);
  float push = (1.0 - smoothstep(0.0, 0.9, dist)) * 0.45 * uPush;
  pos.xy += normalize(away + 0.0001) * push;

  // ---- 5. Project to the screen and size the dot -------------------------
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // "Size attenuation": dots further from the camera are drawn smaller
  float size = uSize * (0.35 + aRandom * aRandom * 1.65);
  gl_PointSize = min(size * uPixelRatio / -mvPosition.z, 40.0 * uPixelRatio);

  // ---- 6. Color -----------------------------------------------------------
  vColor = mix(uColorA, uColorB, fract(aRandom * 7.31));
  // ~6% of particles are "sparkles": pushed brighter than white so Bloom makes them glow
  if (aRandom > 0.94) vColor *= 3.0;
  vAlpha = mix(0.55, 0.9, morph);
}
