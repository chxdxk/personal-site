import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  EffectComposer,
  Bloom,
  ToneMapping,
  ChromaticAberration,
  Noise,
  Vignette,
} from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'
import { scroll } from '../scroll.js'

// POST-PROCESSING
//
// Normally Three.js draws the scene straight to the screen. With an
// EffectComposer, it draws the scene into a hidden image (a "render target")
// first. That image is then run through each effect below, in order, like a
// stack of Instagram filters, and only the final result reaches the screen.
//
// Only the WebGL canvas is affected. The HTML text on top is untouched.
//
// Press "F" on the page to toggle the effects on and off and compare.

const BASE_ABERRATION = 0.0006

export default function Effects() {
  const enabled = useEffectsToggle()
  const aberration = useRef()
  const offset = useRef(0)

  // Make the lens split stronger while scrolling fast, then settle back.
  useFrame((_, delta) => {
    if (!aberration.current) return
    const target = BASE_ABERRATION + Math.min(Math.abs(scroll.velocity) * 0.00015, 0.006)
    offset.current = THREE.MathUtils.damp(offset.current, target, 6, delta)
    aberration.current.offset.set(offset.current, offset.current * 0.6)
  })

  if (!enabled) return null

  return (
    // multisampling = anti-aliasing (smoothing jagged edges). It's expensive
    // with post-processing, and the blob has soft edges plus grain on top, so
    // it's switched off. Try 4 and compare: you'll struggle to see a difference.
    <EffectComposer multisampling={0}>
      {/* 1. BLOOM: anything brighter than the threshold glows and bleeds light.
             mipmapBlur makes a soft, wide, cheap-to-compute glow. */}
      <Bloom
        mipmapBlur
        luminanceThreshold={0.9}
        luminanceSmoothing={0.25}
        intensity={1.1}
        radius={0.6}
      />

      {/* 2. TONE MAPPING: squeezes very bright colors back into a range the
             screen can show, the way a camera does. Without a composer, Three.js
             does this automatically; with one, it's our job, and it has to come
             AFTER bloom so the glow can use the extra-bright values first. */}
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />

      {/* 3. CHROMATIC ABERRATION: splits red and blue slightly apart, like a
             cheap camera lens. radialModulation keeps the center sharp and
             only splits toward the edges. */}
      <ChromaticAberration
        ref={aberration}
        offset={[BASE_ABERRATION, BASE_ABERRATION * 0.6]}
        radialModulation
        modulationOffset={0.2}
      />

      {/* 4. FILM GRAIN: subtle random noise that changes every frame.
             SCREEN blending only ever lightens, so the grain shows up even on
             the black background. */}
      <Noise blendFunction={BlendFunction.SCREEN} opacity={0.07} />

      {/* 5. VIGNETTE: darkens the corners to pull the eye to the middle. */}
      <Vignette offset={0.3} darkness={0.65} />
    </EffectComposer>
  )
}

// Press "F" to toggle effects on and off.
function useEffectsToggle() {
  const [enabled, setEnabled] = useState(true)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key.toLowerCase() === 'f' && !e.metaKey && !e.ctrlKey) setEnabled((v) => !v)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  return enabled
}
