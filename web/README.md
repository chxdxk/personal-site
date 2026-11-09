# web – the 3D version of the site

A one-page site built with Vite + React + React Three Fiber.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static files in dist/ (ready for S3 + CloudFront)
```

## Where things live

| File | What it does |
| --- | --- |
| `src/App.jsx` | The page: a fixed `<Canvas>` with scrolling HTML sections on top, plus GSAP text reveals |
| `src/scroll.js` | Lenis smooth scrolling; turns scroll position into a decimal "section" number |
| `src/scene/keyframes.js` | The blob's look (position, size, noise, colors) for each section – edit me! |
| `src/scene/Blob.jsx` | The blob mesh: blends between keyframes on scroll, mouse hover, animation loop |
| `src/scene/Effects.jsx` | Post-processing: bloom, tone mapping, lens split, grain, vignette (press **F** to toggle) |
| `src/scene/shaders/blob.vert.glsl` | Vertex shader: moves vertices with noise to make it wobble |
| `src/scene/shaders/blob.frag.glsl` | Fragment shader: colors each pixel (gradient, light, rim glow) |
| `src/styles.css` | Layout and typography for the HTML layer |
