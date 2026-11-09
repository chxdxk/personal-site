import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { scroll, reducedMotion } from '../scroll.js'
import { keyframes } from './keyframes.js'

// Vite's "?raw" suffix imports a file as a plain string – exactly what
// Three.js wants for shader source code.
import vertexShader from './shaders/blob.vert.glsl?raw'
import fragmentShader from './shaders/blob.frag.glsl?raw'

const { lerp, damp, clamp } = THREE.MathUtils

// Ease-in-out curve: slow at both ends, fast in the middle.
// Applied to the progress between two sections so the blob "settles" into
// each section's look instead of moving at a constant, robotic speed.
const smoothstep = (t) => t * t * (3 - 2 * t)

export default function Blob() {
  const mesh = useRef()
  const hovered = useRef(false)
  const pointerTarget = useRef(new THREE.Vector3())
  const velocityBoost = useRef(0)

  // viewport = size of the visible area in 3D units (not pixels)
  const viewport = useThree((state) => state.viewport)
  const isWide = viewport.aspect > 1

  // Turn the hex colors in keyframes.js into THREE.Color objects once, up front
  const looks = useMemo(
    () =>
      keyframes.map((k) => ({
        ...k,
        colorA: new THREE.Color(k.colorA),
        colorB: new THREE.Color(k.colorB),
      })),
    [],
  )

  // "Uniforms" are the values JavaScript sends to the shader every frame.
  // These are just the starting values; they're updated every frame below.
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uFrequency: { value: looks[0].frequency },
      uAmplitude: { value: looks[0].amplitude },
      uSpeed: { value: looks[0].speed },
      uPointer: { value: new THREE.Vector3() },
      uHover: { value: 0 },
      uColorA: { value: looks[0].colorA.clone() },
      uColorB: { value: looks[0].colorB.clone() },
      uRimColor: { value: new THREE.Color('#ffd7a8') },
    }),
    [looks],
  )

  // useFrame runs on every frame (~60x/sec) right before the scene is drawn.
  // This is the "game loop": all animation happens here.
  useFrame((state, delta) => {
    const m = mesh.current
    // Note: R3F copies the `uniforms` object onto the material, so we must
    // update the material's own copy – changing `uniforms` above does nothing.
    const u = m.material.uniforms

    // ---- 1. Where are we on the page? ----------------------------------
    // scroll.section is a decimal like 1.4 = "40% of the way from section 1 to 2".
    // Split it into the two keyframes we're between (a, b) and how far along (t).
    const s = clamp(scroll.section, 0, looks.length - 1)
    const i = Math.min(Math.floor(s), looks.length - 2)
    const t = smoothstep(s - i)
    const a = looks[i]
    const b = looks[i + 1]

    // ---- 2. Blend every property between the two looks ------------------
    // On phones the blob stays near the top-center, above the text.
    const targetX = isWide ? lerp(a.x, b.x, t) * viewport.width : lerp(a.x, b.x, t) * 0.25
    const targetY = isWide ? lerp(a.y, b.y, t) * viewport.height : viewport.height * 0.18
    const baseScale = isWide ? 1 : Math.min(1, viewport.width / 3)
    const targetScale = lerp(a.scale, b.scale, t) * baseScale

    // "Damping" eases a value toward a target instead of jumping there.
    // Higher number = catches up faster.
    m.position.x = damp(m.position.x, targetX, 5, delta)
    m.position.y = damp(m.position.y, targetY, 5, delta)
    m.scale.setScalar(damp(m.scale.x, targetScale, 5, delta))

    u.uFrequency.value = lerp(a.frequency, b.frequency, t)
    u.uSpeed.value = lerp(a.speed, b.speed, t)
    u.uColorA.value.lerpColors(a.colorA, b.colorA, t)
    u.uColorB.value.lerpColors(a.colorB, b.colorB, t)

    // ---- 3. Scroll speed makes it wobble harder ---------------------------
    // Flick the scroll wheel and the blob gets agitated, then calms back down.
    const boostTarget = Math.min(Math.abs(scroll.velocity) * 0.006, 0.3)
    velocityBoost.current = damp(velocityBoost.current, boostTarget, 3, delta)
    u.uAmplitude.value = lerp(a.amplitude, b.amplitude, t) + velocityBoost.current

    // ---- 4. Time, hover and mouse tilt (same as before) ------------------
    u.uTime.value += delta * (reducedMotion ? 0.25 : 1)
    u.uHover.value = damp(u.uHover.value, hovered.current ? 1 : 0, 4, delta)
    u.uPointer.value.lerp(pointerTarget.current, 1 - Math.exp(-8 * delta))

    // Tilt toward the cursor, plus a slow spin as you scroll down the page.
    // state.pointer is the mouse position in -1..1 coordinates.
    m.rotation.x = damp(m.rotation.x, -state.pointer.y * 0.4 + s * 0.3, 3, delta)
    m.rotation.y = damp(m.rotation.y, state.pointer.x * 0.6 + s * 0.9, 3, delta)
  })

  return (
    <mesh
      ref={mesh}
      // R3F raycasts the mouse against meshes for you. e.point is where the
      // mouse ray hits the surface, in world space. We convert it to the mesh's
      // own (local) space so it lines up with the vertex positions in the shader.
      onPointerMove={(e) => {
        hovered.current = true
        pointerTarget.current.copy(mesh.current.worldToLocal(e.point.clone()))
      }}
      onPointerOut={() => (hovered.current = false)}
    >
      {/* A sphere made of triangles. 1 = radius, 64 = how finely it's subdivided.
          More triangles = smoother deformation (and more GPU work). */}
      <icosahedronGeometry args={[1, 64]} />

      {/* ShaderMaterial = "I'll write the GPU code myself". */}
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  )
}
