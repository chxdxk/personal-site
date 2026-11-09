// FRAGMENT SHADER
// Runs once for every pixel the blob covers on screen.
// Its job: decide that pixel's color.

uniform vec3 uColorA;   // color of the "valleys"
uniform vec3 uColorB;   // color of the "peaks"
uniform vec3 uRimColor; // glow around the edges

varying float vDisplacement;
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);

  // 1. Base color: blend between two colors depending on how far the surface was pushed out
  float peak = smoothstep(-0.25, 0.35, vDisplacement);
  vec3 color = mix(uColorA, uColorB, peak);

  // 2. Simple lighting: surfaces facing the light are brighter
  vec3 lightDir = normalize(vec3(1.0, 1.0, 0.8));
  float diffuse = max(dot(normal, lightDir), 0.0);
  color *= 0.3 + diffuse * 0.9;

  // 3. Fresnel rim: edges facing away from the camera glow
  float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
  color += uRimColor * fresnel * 0.9;

  gl_FragColor = vec4(color, 1.0);

  // Let Three.js apply tone mapping + convert to the screen's color space,
  // so our colors match the hex values we picked.
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
