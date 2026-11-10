import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { scroll, reducedMotion } from '../scroll.js'
import { keyframes, sampleSection, blobState } from './keyframes.js'

import vertexShader from './shaders/particles.vert.glsl?raw'
import fragmentShader from './shaders/particles.frag.glsl?raw'

const { lerp, damp } = THREE.MathUtils

// Fewer particles on phones: they're cheap, but not free
const isSmallScreen = window.matchMedia('(max-width: 700px)').matches
const COUNT = isSmallScreen ? 2500 : 5000

// Touch screens have no hovering cursor, so the mouse push is mouse-only
const hasMouse = window.matchMedia('(hover: hover)').matches

// PARTICLES
//
// A "Points" object draws one dot per vertex instead of connecting vertices
// into triangles. We give the GPU one big list of particles up front – each
// with its own random data – and from then on the vertex shader animates them
// all. See shaders/particles.vert.glsl for the interesting part.
export default function Particles() {
  const points = useRef()
  const mouseMoved = useRef(false)
  const viewport = useThree((state) => state.viewport)
  const pixelRatio = useThree((state) => state.gl.getPixelRatio())

  // ---- Per-particle data, generated once --------------------------------
  // Typed arrays (Float32Array) are flat lists of numbers, the format the GPU
  // wants: [x0, y0, z0, x1, y1, z1, ...]. 3 numbers per particle for vec3s.
  const { dust, orbit, random } = useMemo(() => {
    const dust = new Float32Array(COUNT * 3)
    const orbit = new Float32Array(COUNT * 3)
    const random = new Float32Array(COUNT)

    for (let i = 0; i < COUNT; i++) {
      // Dust home: anywhere in a big box around (mostly behind) the scene
      dust[i * 3 + 0] = (Math.random() - 0.5) * 14 // x: -7..7
      dust[i * 3 + 1] = (Math.random() - 0.5) * 10 // y: -5..5
      dust[i * 3 + 2] = -8 + Math.random() * 10 // z: -8..2 (camera is at 4)

      // Ring home: radius, starting angle, and a little height off the disk.
      // pow() bunches particles toward the inner edge, like a real ring.
      orbit[i * 3 + 0] = 1.45 + Math.pow(Math.random(), 1.5) * 0.55
      orbit[i * 3 + 1] = Math.random() * Math.PI * 2
      orbit[i * 3 + 2] = (Math.random() + Math.random() - 1) * 0.08

      random[i] = Math.random()
    }
    return { dust, orbit, random }
  }, [])

  const looks = useMemo(
    () =>
      keyframes.map((k) => ({
        ring: k.ring,
        colorA: new THREE.Color(k.colorA),
        colorB: new THREE.Color(k.colorB),
      })),
    [],
  )

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uRing: { value: 1 },
      uCenter: { value: new THREE.Vector3() },
      uScale: { value: 1 },
      uPointer: { value: new THREE.Vector2() },
      uPush: { value: 0 }, // 0 = no mouse push, 1 = full
      uHalfView: { value: new THREE.Vector2() },
      uSize: { value: 26 },
      uPixelRatio: { value: 1 },
      uColorA: { value: new THREE.Color() },
      uColorB: { value: new THREE.Color() },
    }),
    [],
  )

  useFrame((state, delta) => {
    const u = points.current.material.uniforms // (R3F copies uniforms – see Blob.jsx)
    const { i, t } = sampleSection()
    const a = looks[i]
    const b = looks[i + 1]

    u.uTime.value += delta * (reducedMotion ? 0.25 : 1)
    u.uScroll.value = scroll.section
    u.uRing.value = lerp(a.ring, b.ring, t)
    u.uColorA.value.lerpColors(a.colorA, b.colorA, t)
    u.uColorB.value.lerpColors(a.colorB, b.colorB, t)

    // Follow the blob (Blob.jsx writes its position every frame)
    u.uCenter.value.copy(blobState.position)
    u.uScale.value = Math.max(blobState.scale, 0.3)

    // Ease the mouse so particles flow away and back instead of snapping.
    // R3F reports the pointer at the screen center (0, 0) until the mouse
    // actually moves, so wait for real movement before pushing anything.
    if (!mouseMoved.current && (state.pointer.x !== 0 || state.pointer.y !== 0)) {
      mouseMoved.current = true
      u.uPointer.value.copy(state.pointer) // start where the mouse is, no swoop
    }
    u.uPush.value = damp(u.uPush.value, hasMouse && mouseMoved.current ? 1 : 0, 3, delta)
    u.uPointer.value.x = damp(u.uPointer.value.x, state.pointer.x, 6, delta)
    u.uPointer.value.y = damp(u.uPointer.value.y, state.pointer.y, 6, delta)
    u.uHalfView.value.set(viewport.width / 2, viewport.height / 2)
    u.uPixelRatio.value = pixelRatio
  })

  return (
    // frustumCulled={false}: Three.js normally skips drawing objects that are
    // off-screen, judged from their `position` data. Our shader moves particles
    // far from those positions (into the ring), so that check would be wrong.
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        {/* Each attribute is a list of numbers + how many make up one particle */}
        <bufferAttribute attach="attributes-position" args={[dust, 3]} />
        <bufferAttribute attach="attributes-aOrbit" args={[orbit, 3]} />
        <bufferAttribute attach="attributes-aRandom" args={[random, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        // Additive blending: overlapping particles ADD their light together
        // and get brighter, like real light. Great for glows, dust and sparks.
        blending={THREE.AdditiveBlending}
        // Don't block things behind: particles are see-through light, not solid
        depthWrite={false}
      />
    </points>
  )
}
