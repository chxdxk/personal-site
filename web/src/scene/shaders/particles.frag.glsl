// PARTICLES – FRAGMENT SHADER
// Each particle is drawn as a small square ("point sprite"). This runs for
// every pixel of that square and turns it into a soft, round glow.

varying vec3 vColor;
varying float vAlpha;

void main() {
  // gl_PointCoord: where this pixel is inside the square, (0,0) to (1,1)
  float d = length(gl_PointCoord - 0.5); // 0 at the center, 0.5 at the edge
  float glow = 1.0 - smoothstep(0.0, 0.5, d);
  glow *= glow; // squaring makes the falloff softer, more like light

  if (glow < 0.01) discard; // skip invisible corner pixels entirely

  gl_FragColor = vec4(vColor, glow * vAlpha);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
