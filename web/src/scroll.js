import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import 'lenis/dist/lenis.css'

gsap.registerPlugin(ScrollTrigger)

export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Shared scroll state that the 3D scene reads every frame.
//
// Why a plain object instead of React state? React state triggers a re-render
// whenever it changes. Scroll changes ~60 times a second, and re-rendering the
// whole app that often would be slow. Instead, we mutate this object and the
// scene reads it inside useFrame, so nothing re-renders.
export const scroll = {
  section: 0, // which section we're on, as a decimal: 1.5 = halfway from section 1 to 2
  velocity: 0, // how fast the page is scrolling (pixels per frame, + down / - up)
}

// Sets up smooth scrolling and keeps `scroll` up to date.
export function useSmoothScroll() {
  useEffect(() => {
    // Lenis replaces the browser's jumpy wheel scrolling with eased, "buttery" scrolling.
    // The page still scrolls normally underneath (scrollbars, keyboard, links all work).
    const lenis = new Lenis({ smoothWheel: !reducedMotion })

    // The scroll position where each section "arrives" (its top edge).
    // The last section may be too short to reach the top, so cap at the max scroll.
    let anchors = []
    const measure = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      anchors = [...document.querySelectorAll('[data-section]')].map((el) =>
        Math.min(el.offsetTop, maxScroll),
      )
    }

    const onScroll = () => {
      scroll.section = sectionAt(lenis.scroll, anchors)
      ScrollTrigger.update() // let GSAP's scroll animations know we moved
    }

    // Drive Lenis from GSAP's clock so smooth scroll and GSAP animations
    // update in the same frame and never drift out of sync.
    const tick = (time) => {
      lenis.raf(time * 1000)
      scroll.velocity = lenis.velocity
    }

    measure()
    onScroll()
    lenis.on('scroll', onScroll)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    // Section positions change when the window resizes or fonts finish loading
    const resizeObserver = new ResizeObserver(() => {
      measure()
      onScroll()
    })
    resizeObserver.observe(document.body)
    document.fonts.ready.then(() => ScrollTrigger.refresh())

    return () => {
      gsap.ticker.remove(tick)
      resizeObserver.disconnect()
      lenis.destroy()
    }
  }, [])
}

// Turn a pixel scroll position into a decimal section index.
// e.g. anchors [0, 800, 1600]: scrollY 1200 -> 1.5
function sectionAt(y, anchors) {
  if (anchors.length === 0 || y <= anchors[0]) return 0
  for (let i = 0; i < anchors.length - 1; i++) {
    const start = anchors[i]
    const end = anchors[i + 1]
    if (y < end) return i + (end > start ? (y - start) / (end - start) : 0)
  }
  return anchors.length - 1
}
