export const starVertexShader = /* glsl */ `
uniform float uTime;
uniform vec2 uMouse;
uniform float uLensRadius;
uniform float uLensStrength;
uniform float uPixelRatio;
uniform float uReducedMotion;

attribute float aSize;
attribute float aDepth;
attribute float aPhase;
attribute float aTwinkleSpeed;
attribute vec3 aTint;

varying float vAlpha;
varying float vSizeNorm;
varying vec3 vTint;

void main() {
  vec3 pos = position;

  // Soft parallax drift — deeper stars move less
  if (uReducedMotion < 0.5) {
    pos.x += sin(uTime * 0.05 + aPhase) * 0.015 * (1.0 - aDepth);
    pos.y += cos(uTime * 0.04 + aPhase * 1.3) * 0.01 * (1.0 - aDepth);
  }

  // Gravitational lens: pinch toward cursor, falloff goes to 0 at center and edge
  float dist = distance(pos.xy, uMouse);
  float falloff = pow(1.0 - smoothstep(0.0, uLensRadius, dist), 2.0);
  float strength = uLensStrength * (0.35 + 0.65 * aDepth);

  if (dist > 0.0001 && uReducedMotion < 0.5) {
    vec2 dir = (uMouse - pos.xy) / dist;
    // Softer pinch — still a lens pocket, less dramatic pull
    pos.xy += dir * dist * falloff * strength * 0.46;
  }

  float twinkle = 0.55 + 0.45 * sin(uTime * aTwinkleSpeed + aPhase);
  float sparkle = 0.08 * sin(uTime * aTwinkleSpeed * 3.7 + aPhase * 2.1);
  if (uReducedMotion > 0.5) {
    twinkle = 0.75;
    sparkle = 0.0;
  }

  float baseBright = mix(0.35, 1.0, aDepth);
  float magnify = 1.0 + falloff * strength * 0.63;

  vAlpha = clamp((twinkle + sparkle) * baseBright * magnify, 0.0, 1.0);
  vSizeNorm = aSize;
  vTint = aTint;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  float sizeBoost = 1.0 + falloff * strength * 0.86;
  // Orthographic: scale point size in CSS pixels (aSize ~0.15–1.15)
  gl_PointSize = max(aSize * sizeBoost * uPixelRatio * 18.0, 2.0 * uPixelRatio);
}
`

export const starFragmentShader = /* glsl */ `
varying float vAlpha;
varying float vSizeNorm;
varying vec3 vTint;

void main() {
  vec2 uv = gl_PointCoord - vec2(0.5);
  float r = length(uv);

  // Soft circular core
  float core = smoothstep(0.5, 0.0, r);
  float glow = exp(-r * 4.5) * 0.55;

  // Subtle 4-point glint on larger stars (echoes notebook asterisks)
  float glint = 0.0;
  if (vSizeNorm > 0.55) {
    float arms =
      exp(-abs(uv.x) * 18.0) * exp(-abs(uv.y) * 3.5) +
      exp(-abs(uv.y) * 18.0) * exp(-abs(uv.x) * 3.5);
    glint = arms * 0.35 * smoothstep(0.55, 0.9, vSizeNorm);
  }

  float alpha = (core + glow + glint) * vAlpha;
  if (alpha < 0.01) discard;

  vec3 color = vTint * (0.85 + glow * 0.4 + glint * 0.5);
  gl_FragColor = vec4(color, alpha);
}
`
