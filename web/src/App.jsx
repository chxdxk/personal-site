import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import Blob from './scene/Blob.jsx'
import { useSmoothScroll, reducedMotion } from './scroll.js'

const toolkit = [
  { title: 'Frontend', items: ['JavaScript', 'TypeScript', 'React', 'HTML / CSS'] },
  { title: 'Cloud', items: ['AWS: S3, CloudFront, Lambda', 'API Gateway, DynamoDB', 'OpenTofu / Terraform'] },
  { title: 'Backend', items: ['Node.js', 'REST APIs', 'Serverless'] },
  { title: 'Workflow', items: ['Git & GitHub', 'GitHub Actions CI/CD', 'Testing'] },
]

const places = [
  { place: 'El Tunco, El Salvador', note: 'Surf and sun', date: 'Mar 2025' },
  { place: 'Houghton, Michigan', note: 'Summer in the Upper Peninsula', date: 'Jul 2025' },
  { place: 'Rocky Mountains, Colorado', note: 'Mountain adventure', date: 'Aug 2025' },
]

// The whole site is two layers stacked on top of each other:
//   1. <Canvas>  – a fixed, full-screen WebGL canvas where the 3D scene is drawn
//   2. <main>    – normal HTML that scrolls over it. Each <section data-section>
//                  is one "stop" on the scroll; the blob has a matching look for
//                  each one in scene/keyframes.js.
export default function App() {
  const main = useRef()
  useSmoothScroll()

  // GSAP animations for the HTML text. useGSAP is like useEffect, but it also
  // cleans up every animation automatically when the component unmounts.
  useGSAP(
    () => {
      if (reducedMotion) return

      // Hero: animate in once on page load, one line after another ("stagger")
      gsap.from('.hero .reveal', {
        y: 40,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
        stagger: 0.12,
        delay: 0.2,
      })

      // Everything else: animate in when it scrolls into view
      gsap.utils.toArray('.section:not(.hero) .reveal').forEach((el) => {
        gsap.from(el, {
          y: 60,
          opacity: 0,
          duration: 1.1,
          ease: 'power3.out',
          // ScrollTrigger: start this animation when the element's top
          // reaches 85% of the way down the screen
          scrollTrigger: { trigger: el, start: 'top 85%' },
        })
      })
    },
    { scope: main },
  )

  return (
    <>
      <Canvas className="webgl" camera={{ position: [0, 0, 4], fov: 45 }} dpr={[1, 2]}>
        <Blob />
      </Canvas>

      <main ref={main}>
        <section data-section className="section hero">
          <p className="hint">
            <span className="hint-mouse">move your mouse</span>
            <span className="hint-touch">touch the blob</span>
          </p>
          <div className="copy">
            <p className="eyebrow reveal">Hello, I'm</p>
            <h1 className="reveal">Chad Hildwein</h1>
            <p className="tagline reveal">Developer. Building things for the web and the cloud.</p>
          </div>
          <p className="scroll-cue reveal">scroll ↓</p>
        </section>

        <section data-section className="section right">
          <div className="copy">
            <p className="label reveal">01 / About</p>
            <h2 className="reveal">I learn by building.</h2>
            <p className="reveal">
              The first version of this site was an excuse to learn AWS: S3, CloudFront, Lambda
              and DynamoDB, all defined in OpenTofu and shipped by GitHub Actions.
            </p>
            <p className="reveal">
              This version is an excuse to learn the creative side of the web: WebGL, shaders and
              3D.
            </p>
          </div>
        </section>

        <section data-section className="section left">
          <div className="copy wide">
            <p className="label reveal">02 / Toolkit</p>
            <h2 className="reveal">What I work with.</h2>
            <div className="toolkit">
              {toolkit.map((group) => (
                <div key={group.title} className="reveal">
                  <h3>{group.title}</h3>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section data-section className="section right">
          <div className="copy">
            <p className="label reveal">03 / Places</p>
            <h2 className="reveal">Away from the keyboard.</h2>
            <ul className="places">
              {places.map((p) => (
                <li key={p.place} className="reveal">
                  <span className="place">{p.place}</span>
                  <span className="note">
                    {p.note} · {p.date}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section data-section className="section center">
          <div className="copy">
            <p className="label reveal">04 / Next</p>
            <h2 className="reveal">Work in progress.</h2>
            <p className="reveal">
              I'm rebuilding this site in public while I learn Three.js, shaders and Blender. It
              will keep getting weirder.
            </p>
          </div>
        </section>
      </main>
    </>
  )
}
