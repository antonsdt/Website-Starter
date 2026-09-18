/* -----------------------------------------------------------------------
   GLSL Tiles — dieselbe Flug-Mechanik wie glsl-hills.js (Kamera fest,
   Zeit-Uniform verschiebt den Boden), aber auf einen Natursteinboden statt
   organische Hügel gemünzt: leicht verzerrtes Fliesenraster, Fugen,
   Ton-Variation pro Fliese und ein wanderndes Streiflicht als Echo der
   Sonnenstreifen aus den Castle-Stones-Referenzfotos.

   Eigenständige Demo-Variante — noch nicht in eine echte Seite
   eingebunden, siehe generative-tiles-demo.html.
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

  /* Zwei Töne genügen — Fugenfarbe wird daraus abgeleitet, damit jede
     Castle-Stones-Kollektionsfarbe (siehe initGLSLTiles) ohne weitere
     Anpassung ein stimmiges Fugenbild ergibt. */
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

    /* Steinton pro Platte leicht verschoben, plus feine Maserung. */
    float toneSeed = hash21(tileId);
    vec3 tileColor = mix(uColorDark, uColorLight, toneSeed);

    float mottle = noise2(p * 0.6 + tileId) * 0.5 + noise2(p * 2.2 + tileId) * 0.18;
    tileColor *= 0.86 + mottle * 0.32;

    /* Helle Mörtelfuge wie auf den Referenzfotos (nicht dunkel!), mit einem
       hauchdünnen Schattensaum direkt an der Naht für die Tiefe der Rille. */
    vec3 groutColor = clamp(mix(uColorDark, uColorLight, 0.92) * 1.1, 0.0, 1.0);
    vec3 groutShadow = groutColor * 0.55;
    float seamAo = smoothstep(0.0, 0.16, edgeDist);
    vec3 groutFinal = mix(groutShadow, groutColor, seamAo);

    float grout = smoothstep(0.0, 0.65, edgeDist);
    vec3 color = mix(groutFinal, tileColor, grout);

    /* Wanderndes Streiflicht — Echo der tiefstehenden Sonne aus den
       Referenzfotos, kein echtes Lichtmodell. */
    float sweep = sin(vGroundUV.x * 0.05 + vGroundUV.y * 0.11);
    color += pow(max(sweep, 0.0), 6.0) * 0.25;

    /* Abstand vor der Kamera, nicht vom Weltursprung — sonst wirkt der
       Boden direkt vor der Kamera fälschlich abgedunkelt/transparent,
       weil er zufällig weit vom Ursprung entfernt liegt. */
    float dist = max(uCameraZ - vPosition.z, 0.0);
    float fade = clamp((165.0 - dist) / 165.0, 0.0, 1.0);

    gl_FragColor = vec4(color, fade * 0.95);
  }
`;

/* Die acht Castle-Stones-Kollektionsfarben (Muster-Referenz von der
   Original-Website), je als hell/dunkel-Paar für uColorLight/uColorDark.
   Werte per Augenmaß aus den Musterfotos abgeleitet — vor Produktivnutzung
   gegen das Originalmuster prüfen (siehe deren eigener Hinweis dazu). */
export const TILE_PALETTES = {
  warmDesert: { light: '#e4ded2', dark: '#b7ac99' },
  eveningShadow: { light: '#cfc7ba', dark: '#9a9186' },
  morningMist: { light: '#dcdad4', dark: '#b3b0a8' },
  naturalBeige: { light: '#d8d2c4', dark: '#aea690' },
  coralBeach: { light: '#e9e5da', dark: '#c2bcac' },
  brownGrey: { light: '#c7bfb2', dark: '#8f8577' },
  oldGrey: { light: '#65635f', dark: '#393734' },
  terraStoneAntique: { light: '#b9705a', dark: '#7b3c2c' },
};

/**
 * Baut die Tiles-Szene in `canvas` auf (siehe shader-flight.js). Kamera
 * sitzt tiefer und flacher als bei den Hills — ein Gleiten knapp über dem
 * Boden statt ein Flug über Hügel.
 *
 * `palette` wählt eine der Castle-Stones-Kollektionsfarben (Standard: das
 * warme Mittelgrau "Evening Shadow", tonal am nächsten am echten Hero-Foto
 * — für einen möglichst nahtlosen späteren Übergang dorthin).
 *
 * @returns {() => void} destroy
 */
export function initGLSLTiles(
  canvas,
  { cameraZ = 70, planeSize = 260, speed = 6, palette = 'eveningShadow' } = {},
) {
  const { light, dark } = TILE_PALETTES[palette] ?? TILE_PALETTES.eveningShadow;
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
