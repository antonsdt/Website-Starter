/* -----------------------------------------------------------------------
   GLSL Cobblestone — dieselbe Flug-Mechanik wie glsl-tiles.js, aber auf
   kleinteiliges Kopfsteinpflaster gemünzt: viele kleine, unterschiedlich
   stark eingerückte Steine mit breiter, heller Fuge — nach dem
   Castle-Stones-Referenzfoto aus dem Weinkeller (dunkle, gerundete
   Basaltsteine, breite helle Mörtelfuge).

   Eigenständige Demo-Variante, siehe generative-cobblestone-demo.html.
   ----------------------------------------------------------------------- */
import * as THREE from 'three';
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
    vec3 groundPosition = (rotateMatrixX(radians(90.0)) * vec4(position, 1.0)).xyz;
    vec2 flowUV = groundPosition.xz + vec2(0.0, time * -1.0);

    /* Pflaster liegt noch flacher als die Fliesenplatten — nur ein
       Hauch Relief, jeder Stein sitzt fast eben. */
    float bump = (noise2(flowUV * 0.22) - 0.5) * 0.7;
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

  uniform vec3 uColorLight;
  uniform vec3 uColorDark;
  uniform float uCameraZ;

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
    /* Leichte Verzerrung des Rasters wie bei den Fliesen, aber auf
       kleinerer Skala — Pflasterreihen laufen selten ganz gerade. */
    vec2 warp = (vec2(
      noise2(vGroundUV * 0.09),
      noise2(vGroundUV * 0.09 + 19.0)
    ) - 0.5) * 0.9;
    vec2 p = vGroundUV + warp;

    float cellW = 3.3;
    float cellH = 3.3;

    float rowF = floor(p.y / cellH);
    float rowOffset = (hash21(vec2(rowF, 3.1)) - 0.5) * cellW * 0.3;
    float localX = p.x + rowOffset;
    float colF = floor(localX / cellW);

    float px = localX - colF * cellW;
    float py = p.y - rowF * cellH;
    vec2 tileId = vec2(colF, rowF);

    /* Jeder Stein schrumpft zufällig innerhalb seiner Zelle — das ergibt
       die breite, unregelmäßige Fuge aus dem Referenzfoto statt eines
       gleichmäßigen Rasters. */
    vec2 center = vec2(cellW, cellH) * 0.5;
    float shrink = 0.68 + hash21(tileId + 5.0) * 0.22;
    vec2 rel = (vec2(px, py) - center) / shrink;
    vec2 shrunk = center + rel;
    float edgeDist = min(min(shrunk.x, cellW - shrunk.x), min(shrunk.y, cellH - shrunk.y));

    float toneSeed = hash21(tileId);
    vec3 stoneColor = mix(uColorDark, uColorLight, toneSeed);

    float mottle = noise2(p * 1.4 + tileId) * 0.5 + noise2(p * 4.0 + tileId) * 0.2;
    stoneColor *= 0.82 + mottle * 0.36;

    vec3 groutColor = clamp(mix(uColorDark, uColorLight, 0.95) * 1.55, 0.0, 1.0);
    vec3 groutShadow = groutColor * 0.6;
    float seamAo = smoothstep(0.0, 0.1, edgeDist);
    vec3 groutFinal = mix(groutShadow, groutColor, seamAo);

    /* Fuge ist relativ breit im Verhältnis zum Stein, siehe Referenz. */
    float grout = smoothstep(0.0, 0.4, edgeDist);
    vec3 color = mix(groutFinal, stoneColor, grout);

    float sweep = sin(vGroundUV.x * 0.06 + vGroundUV.y * 0.13);
    color += pow(max(sweep, 0.0), 6.0) * 0.18;

    float dist = max(uCameraZ - vPosition.z, 0.0);
    float fade = clamp((150.0 - dist) / 150.0, 0.0, 1.0);

    gl_FragColor = vec4(color, fade * 0.95);
  }
`;

/* Basalt-Pflaster aus dem Referenzfoto: dunkles, leicht bläuliches Grau,
   breite helle Mörtelfuge. Weitere Farbwege lassen sich analog zu
   TILE_PALETTES in glsl-tiles.js ergänzen. */
export const COBBLESTONE_PALETTES = {
  basaltGrey: { light: '#6e6f73', dark: '#1e1f22' },
};

/**
 * Baut die Cobblestone-Szene in `canvas` auf (siehe shader-flight.js).
 * Kamera sitzt noch tiefer/flacher als bei den Tiles — Pflaster liest sich
 * erst aus der Nähe als solches.
 * @returns {() => void} destroy
 */
export function initGLSLCobblestone(
  canvas,
  { cameraZ = 55, planeSize = 220, speed = 5, palette = 'basaltGrey' } = {},
) {
  const { light, dark } = COBBLESTONE_PALETTES[palette] ?? COBBLESTONE_PALETTES.basaltGrey;
  const uniforms = {
    time: { value: 0 },
    uColorLight: { value: new THREE.Color(light) },
    uColorDark: { value: new THREE.Color(dark) },
    uCameraZ: { value: cameraZ },
  };
  return createShaderFlight(canvas, {
    uniforms,
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    planeSize,
    cameraPosition: [0, 11, cameraZ],
    lookAt: [0, -6, 0],
    onFrame: (delta) => {
      uniforms.time.value += delta * speed;
    },
  });
}
