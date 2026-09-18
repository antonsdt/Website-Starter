/* -----------------------------------------------------------------------
   Photo Tiles — dieselbe Flug-Mechanik wie glsl-tiles.js, aber statt
   prozeduraler Farbe liegt hier ein echtes, fugenfreies Castle-Stones-
   Materialfoto als Quelle.

   Zweiter Anlauf nach Feedback: die erste Version drehte/spiegelte das
   Foto pro Fliese zufällig, um Wiederholung zu vermeiden — dabei kippte
   die Lichtrichtung des Fotos von Fliese zu Fliese, was sofort künstlich
   wirkte (echte Steine liegen alle im selben Licht). Jetzt bleibt die
   Bildausrichtung fest; Varianz kommt nur noch aus einem anderen
   Bildausschnitt pro Fliese plus leichtem Helligkeits-/Ton-Jitter, so wie
   es auf der Castle-Stones-Seite selbst beschrieben ist: von Hand gefärbt,
   jeder Boden ein Unikat, aber dieselbe Werkstatt-Machart. Der Boden ist
   außerdem flach (kein Höhen-Rauschen mehr) und die Fugen folgen einem
   geraden Raster mit nur kleiner Größenvarianz pro Stein statt eines
   wellig verzerrten Musters — beides sah nach "computergeneriertes
   Terrain" aus, nicht nach gegossenem Stein.

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

  void main(void) {
    /* Kein Höhen-Rauschen mehr — ein gegossener Steinboden liegt eben,
       nur die Musterkoordinate wandert für den Flug-Effekt. */
    vec3 groundPosition = (rotateMatrixX(radians(90.0)) * vec4(position, 1.0)).xyz;
    vGroundUV = groundPosition.xz + vec2(0.0, time * -1.0);

    vPosition = groundPosition;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(groundPosition, 1.0);
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

  void main(void) {
    /* Gerades Raster — nur die Fliesengröße variiert minimal pro Reihe,
       keine großflächige Verzerrung, die wie ein wogender Stoff aussieht. */
    float tileW = 9.5;
    float tileH = 9.5;

    float rowF = floor(vGroundUV.y / tileH);
    float rowOffset = (hash21(vec2(rowF, 3.1)) - 0.5) * tileW * 0.4;
    float localX = vGroundUV.x + rowOffset;
    float colF = floor(localX / tileW);

    float px = localX - colF * tileW;
    float py = vGroundUV.y - rowF * tileH;
    vec2 tileId = vec2(colF, rowF);

    /* Fuge: pro Stein leicht anders breit, wie handverlegt — aber die
       Kanten selbst bleiben gerade. */
    vec2 center = vec2(tileW, tileH) * 0.5;
    float shrink = 0.88 + hash21(tileId + 5.0) * 0.08;
    vec2 rel = (vec2(px, py) - center) / shrink;
    vec2 shrunk = center + rel;
    float edgeDist = min(min(shrunk.x, tileW - shrunk.x), min(shrunk.y, tileH - shrunk.y));

    /* Unikat-Effekt ohne Drehung: jede Fliese zeigt einen anderen
       Ausschnitt desselben Fotos, aber immer in derselben Ausrichtung —
       die Lichtrichtung des Fotos bleibt über den ganzen Boden konsistent. */
    vec2 local01 = clamp(vec2(px, py) / vec2(tileW, tileH), 0.0, 1.0);
    vec2 subOffset = vec2(hash21(tileId + 11.3), hash21(tileId + 17.9)) * 0.45;
    vec2 sampleUV = local01 * 0.55 + subOffset;
    vec3 stoneColor = texture2D(uPhoto, sampleUV).rgb;

    /* Feiner Helligkeits-/Ton-Jitter — von Hand gefärbtes Material
       schwankt leicht selbst innerhalb einer Kollektionsfarbe. */
    float jitter = 0.88 + hash21(tileId + 2.2) * 0.22;
    stoneColor *= jitter;

    vec3 groutColor = vec3(0.80, 0.775, 0.73);
    vec3 groutShadow = groutColor * 0.6;
    float seamAo = smoothstep(0.0, 0.1, edgeDist);
    vec3 groutFinal = mix(groutShadow, groutColor, seamAo);

    float grout = smoothstep(0.0, 0.55, edgeDist);
    vec3 color = mix(groutFinal, stoneColor, grout);

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
 *   Materialausschnitt (z. B. src/assets/castle-stones/floor-material-macro.png)
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
