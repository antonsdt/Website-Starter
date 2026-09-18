/* -----------------------------------------------------------------------
   Photo Tiles — dieselbe Flug-Mechanik wie glsl-tiles.js, aber statt
   prozeduraler Farbe liegt hier ein echtes, fugenfreies Castle-Stones-
   Materialfoto als Quelle. Jede Fliesenzelle sampelt einen anderen
   Ausschnitt daraus (zufällig gedreht, gespiegelt, verschoben) — dieselbe
   Aufnahme wird also nie zweimal gleich gezeigt, statt sich sichtbar als
   Tapetenmuster zu wiederholen. "Jede Fliese ein Unikat", wie im echten
   Naturstein.

   Eigenständige Demo-Variante, siehe generative-tiles-photo-demo.html.
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

  uniform sampler2D uPhoto;
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
    vec2 tileId = vec2(colF, rowF);

    /* Fuge: wie bei den anderen Steinvarianten leicht eingerückt, damit
       die Breite pro Stein variiert statt ein starres Raster zu zeigen. */
    vec2 center = vec2(tileW, tileH) * 0.5;
    float shrink = 0.84 + hash21(tileId + 5.0) * 0.12;
    vec2 rel = (vec2(px, py) - center) / shrink;
    vec2 shrunk = center + rel;
    float edgeDist = min(min(shrunk.x, tileW - shrunk.x), min(shrunk.y, tileH - shrunk.y));

    /* Kern des Unikat-Effekts: jede Zelle bekommt ihre eigene Drehung,
       Spiegelung und ihren eigenen Ausschnitt aus demselben Foto — nie
       dieselbe Ansicht zweimal. */
    vec2 local01 = clamp(vec2(px, py) / vec2(tileW, tileH), 0.0, 1.0);
    float rot = floor(hash21(tileId + 1.7) * 4.0);
    vec2 uv = local01 - 0.5;
    if (rot < 0.5) { uv = uv; }
    else if (rot < 1.5) { uv = vec2(-uv.y, uv.x); }
    else if (rot < 2.5) { uv = vec2(-uv.x, -uv.y); }
    else { uv = vec2(uv.y, -uv.x); }
    if (hash21(tileId + 3.3) > 0.5) uv.x = -uv.x;
    if (hash21(tileId + 7.1) > 0.5) uv.y = -uv.y;
    uv += 0.5;

    vec2 subOffset = vec2(hash21(tileId + 11.3), hash21(tileId + 17.9)) * 0.55;
    vec2 sampleUV = uv * 0.45 + subOffset;
    vec3 stoneColor = texture2D(uPhoto, sampleUV).rgb;

    /* Feiner Helligkeits-/Ton-Jitter pro Stein — echtes Naturmaterial
       schwankt selbst innerhalb derselben Kollektionsfarbe. */
    float jitter = 0.82 + hash21(tileId + 2.2) * 0.34;
    stoneColor *= jitter;

    vec3 groutColor = vec3(0.80, 0.775, 0.73);
    vec3 groutShadow = groutColor * 0.55;
    float seamAo = smoothstep(0.0, 0.14, edgeDist);
    vec3 groutFinal = mix(groutShadow, groutColor, seamAo);

    float grout = smoothstep(0.0, 0.6, edgeDist);
    vec3 color = mix(groutFinal, stoneColor, grout);

    float sweep = sin(vGroundUV.x * 0.05 + vGroundUV.y * 0.11);
    color += pow(max(sweep, 0.0), 6.0) * 0.2;

    float dist = max(uCameraZ - vPosition.z, 0.0);
    float fade = clamp((165.0 - dist) / 165.0, 0.0, 1.0);

    gl_FragColor = vec4(color, fade * 0.95);
  }
`;

const textureLoader = new THREE.TextureLoader();

/**
 * Baut die Photo-Tiles-Szene in `canvas` auf (siehe shader-flight.js).
 *
 * @param {string} options.textureUrl - Pfad zu einem fugenfreien
 *   Materialausschnitt (z. B. src/assets/castle-stones/sample-6-material.png)
 *   — ein reines Stein-Patch ohne eigene Fugenlinien, da die Fuge hier im
 *   Shader gezeichnet wird.
 * @returns {() => void} destroy
 */
export function initPhotoTiles(canvas, { textureUrl, cameraZ = 70, planeSize = 260, speed = 6 } = {}) {
  const texture = textureLoader.load(textureUrl);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;

  const uniforms = {
    time: { value: 0 },
    uPhoto: { value: texture },
    uCameraZ: { value: cameraZ },
  };

  return createShaderFlight(canvas, {
    uniforms,
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    planeSize,
    cameraPosition: [0, 15, cameraZ],
    lookAt: [0, -5, 0],
    onFrame: (delta) => {
      uniforms.time.value += delta * speed;
    },
  });
}
