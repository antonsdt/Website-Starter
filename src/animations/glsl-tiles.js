/* -----------------------------------------------------------------------
   GLSL Tiles — dieselbe Flug-Mechanik wie glsl-hills.js (Kamera fest,
   Zeit-Uniform verschiebt den Boden), aber auf einen Natursteinboden statt
   organische Hügel gemünzt: leicht verzerrtes Fliesenraster, Fugen,
   Ton-Variation pro Fliese und ein wanderndes Streiflicht als Echo der
   Sonnenstreifen aus den Castle-Stones-Referenzfotos.

   Eigenständige Demo-Variante — noch nicht in eine echte Seite
   eingebunden, siehe generative-tiles-demo.html.
   ----------------------------------------------------------------------- */
import { createShaderFlight } from './shader-flight.js';

const VERTEX_SHADER = `
  attribute vec3 position;
  uniform mat4 projectionMatrix;
  uniform mat4 modelViewMatrix;
  uniform float time;
  varying vec3 vPosition;
  varying vec2 vGroundUV;

  mat4 rotateMatrixX(float radian) {
    return mat4(
      1.0, 0.0, 0.0, 0.0,
      0.0, cos(radian), -sin(radian), 0.0,
      0.0, sin(radian), cos(radian), 0.0,
      0.0, 0.0, 0.0, 1.0
    );
  }

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise2(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main(void) {
    /* Lokales XY der Plane wird zu Welt-XZ (Boden), genau wie in
       glsl-hills.js — die zweite Komponente ist die Flugrichtung. */
    vec3 groundPosition = (rotateMatrixX(radians(90.0)) * vec4(position, 1.0)).xyz;
    vec2 flowUV = groundPosition.xz + vec2(0.0, time * -1.0);

    /* Naturstein ist fast eben — nur ein leichtes Relief, keine Hügel. */
    float bump = (noise2(flowUV * 0.12) - 0.5) * 1.3;
    vec3 finalPosition = groundPosition + vec3(0.0, bump, 0.0);

    vPosition = finalPosition;
    vGroundUV = flowUV;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPosition, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;
  varying vec3 vPosition;
  varying vec2 vGroundUV;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise2(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main(void) {
    /* Das Raster vor dem Zuschnitt leicht verzerren, damit die Fugen wie
       von Hand verlegt wirken statt mechanisch gerade — die Nähte bleiben
       trotzdem durchgängig, weil dasselbe Warp-Feld für Nachbarplatten gilt. */
    vec2 warp = (vec2(
      noise2(vGroundUV * 0.045),
      noise2(vGroundUV * 0.045 + 19.0)
    ) - 0.5) * 2.6;
    vec2 p = vGroundUV + warp;

    float tileW = 9.5;
    float tileH = 9.5;

    float rowF = floor(p.y / tileH);
    float rowOffset = (hash21(vec2(rowF, 3.1)) - 0.5) * tileW;
    float localX = p.x + rowOffset;
    float colF = floor(localX / tileW);

    float px = localX - colF * tileW;
    float py = p.y - rowF * tileH;
    float edgeDist = min(min(px, tileW - px), min(py, tileH - py));
    vec2 tileId = vec2(colF, rowF);

    /* Warme Steintöne, pro Platte leicht verschoben, plus feine Maserung. */
    float toneSeed = hash21(tileId);
    vec3 stoneLight = vec3(0.78, 0.71, 0.58);
    vec3 stoneDark = vec3(0.42, 0.36, 0.28);
    vec3 tileColor = mix(stoneDark, stoneLight, toneSeed);

    float mottle = noise2(p * 0.6 + tileId) * 0.5 + noise2(p * 2.2 + tileId) * 0.18;
    tileColor *= 0.82 + mottle * 0.4;

    float grout = smoothstep(0.0, 0.55, edgeDist);
    vec3 groutColor = vec3(0.05, 0.04, 0.035);
    vec3 color = mix(groutColor, tileColor, grout);

    /* Wanderndes Streiflicht — Echo der tiefstehenden Sonne aus den
       Referenzfotos, kein echtes Lichtmodell. */
    float sweep = sin(vGroundUV.x * 0.05 + vGroundUV.y * 0.11);
    color += pow(max(sweep, 0.0), 6.0) * 0.35;

    float dist = length(vPosition.xz);
    float fade = clamp((150.0 - dist) / 150.0, 0.0, 1.0);

    gl_FragColor = vec4(color, fade * 0.92);
  }
`;

/**
 * Baut die Tiles-Szene in `canvas` auf (siehe shader-flight.js). Kamera
 * sitzt tiefer und flacher als bei den Hills — ein Gleiten knapp über dem
 * Boden statt ein Flug über Hügel.
 * @returns {() => void} destroy
 */
export function initGLSLTiles(canvas, { cameraZ = 70, planeSize = 260, speed = 6 } = {}) {
  const uniforms = { time: { value: 0 } };
  return createShaderFlight(canvas, {
    uniforms,
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    planeSize,
    /* Steilerer Blick nach unten als bei den Hills: der Boden bleibt im
       unteren Bilddrittel, damit der Text darüber auf dunklem Grund
       lesbar bleibt statt die helle Horizontkante zu kreuzen. */
    cameraPosition: [0, 15, cameraZ],
    lookAt: [0, -5, 0],
    onFrame: (delta) => {
      uniforms.time.value += delta * speed;
    },
  });
}
