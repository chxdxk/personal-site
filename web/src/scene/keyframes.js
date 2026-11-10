// What the blob looks like at each section of the page, in order.
// As you scroll between two sections, every value blends from one to the next.
// Edit these and save: the page hot-reloads so you can see changes instantly.
//
//   x, y        position, as a fraction of the screen (0 = center, 0.25 = a quarter-screen right/up)
//   scale       size multiplier
//   frequency   noise "busyness": low = big soft lumps, high = small spiky bumps
//   amplitude   how far the surface gets pushed in and out
//   speed       how fast the noise drifts
//   colorA/B    valley and peak colors
//   ring        particles: 1 = orbit the blob in a ring, 0 = scatter into floating dust

import * as THREE from 'three'
import { scroll } from '../scroll.js'

// Ease-in-out curve: slow at both ends, fast in the middle.
// Applied to the progress between two sections so things "settle" into
// each section's look instead of moving at a constant, robotic speed.
const smoothstep = (t) => t * t * (3 - 2 * t)

// Where are we on the page, in keyframe terms?
// scroll.section is a decimal like 1.4 = "40% of the way from section 1 to 2".
// Returns the two keyframe indexes we're between (i, i + 1), how far along (t),
// and the clamped section number (s).
export function sampleSection() {
  const s = THREE.MathUtils.clamp(scroll.section, 0, keyframes.length - 1)
  const i = Math.min(Math.floor(s), keyframes.length - 2)
  return { i, t: smoothstep(s - i), s }
}

// The blob's actual (damped) position and size, written by Blob.jsx every
// frame, so other objects (the particle ring) can follow it.
export const blobState = {
  position: new THREE.Vector3(),
  scale: 0,
}

export const keyframes = [
  // 0 – Hero
  {
    x: 0.22, y: 0.05, scale: 1,
    frequency: 1.4, amplitude: 0.25, speed: 0.25,
    colorA: '#3a2dff', colorB: '#ff6a3d',
    ring: 1,
  },
  // 1 – About (text on the right, blob on the left)
  {
    x: -0.22, y: 0, scale: 1.15,
    frequency: 0.8, amplitude: 0.35, speed: 0.18,
    colorA: '#0a3cff', colorB: '#19e3c1',
    ring: 0,
  },
  // 2 – Toolkit (text on the left, small, busy blob on the right)
  {
    x: 0.28, y: 0.02, scale: 0.75,
    frequency: 3.0, amplitude: 0.12, speed: 0.45,
    colorA: '#d4145a', colorB: '#ffc23d',
    ring: 0,
  },
  // 3 – Places (text on the right)
  {
    x: -0.24, y: -0.02, scale: 1.05,
    frequency: 1.1, amplitude: 0.3, speed: 0.22,
    colorA: '#0d4f8b', colorB: '#f2c879',
    ring: 0,
  },
  // 4 – Outro (centered above the text, calm)
  {
    x: 0, y: 0.2, scale: 0.95,
    frequency: 0.9, amplitude: 0.2, speed: 0.15,
    colorA: '#3a2dff', colorB: '#ff6a3d',
    ring: 1,
  },
]
