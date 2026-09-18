/* -----------------------------------------------------------------------
   Photo Tiles — dieselbe Flug-Mechanik wie glsl-tiles.js, aber mit echtem
   Castle-Stones-Material statt prozeduraler Farbe.

   Vierter Anlauf: die vorherigen Versuche variierten die Plattengröße nur
   zufällig (rekursive Viertelung). Jetzt liegt ein echtes Verlegemodul
   zugrunde — abgelesen von einem tatsächlichen Castle-Stones-Musterbrett
   (Frontalaufnahme, 8 Steine unterschiedlicher Größe in einem Quadrat).
   Das Modul wird als Kachel über den Boden gelegt, aber pro Kachel-Bay
   zufällig gedreht/gespiegelt — echte Verlegemuster funktionieren genauso,
   damit sich das Wiederholen des Moduls nicht abzeichnet. Die Drehung
   betrifft nur die Fugen-Geometrie, nie die Fototextur selbst (siehe
   vorheriger Commit: rotierte Fototextur kippt die Lichtrichtung und
   wirkt sofort künstlich).

   Farblich mischen sich drei echte Castle-Stones-Aufnahmen (hell/mittel/
   dunkel) zufällig pro Stein, plus feiner Helligkeits-Jitter — echtes,
   von Hand gefärbtes Material schwankt so.

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

  uniform sampler2D uPhotoLight;
  uniform sampler2D uPhotoMid;
  uniform sampler2D uPhotoDark;
  uniform float uCameraZ;
  uniform float uUnit;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  vec3 sampleStone(vec2 tileId, vec2 local01) {
    vec2 subOffset = vec2(hash21(tileId + 11.3), hash21(tileId + 17.9)) * 0.45;
    vec2 sampleUV = local01 * 0.55 + subOffset;

    /* Überwiegend Mittelton, mit vereinzelten helleren/dunkleren
       Akzentsteinen — nicht zu gleichen Anteilen, sonst wirkt es wie ein
       Schachbrett statt wie eine natürlich gemischte Fläche. */
    float texPick = hash21(tileId + 31.0);
    vec3 color;
    if (texPick < 0.72) {
      color = texture2D(uPhotoMid, sampleUV).rgb;
    } else if (texPick < 0.86) {
      color = texture2D(uPhotoLight, sampleUV).rgb;
    } else {
      color = texture2D(uPhotoDark, sampleUV).rgb;
    }

    float jitter = 0.9 + hash21(tileId + 2.2) * 0.2;
    return color * jitter;
  }

  /* Das Verlegemodul (4x4 Raster-Einheiten), abgelesen von einem echten
     Castle-Stones-Musterbrett: 8 Steine, drei Größenklassen. lp liegt
     in [0,4)x[0,4). Liefert die Grenzen des Steins, in dem lp liegt. */
  void classifyModule(vec2 lp, out vec2 tMin, out vec2 tMax, out float id) {
    if (lp.x < 1.6) {
      if (lp.y < 1.4) { tMin = vec2(0.0, 0.0); tMax = vec2(1.6, 1.4); id = 0.0; }
      else if (lp.y < 2.2) { tMin = vec2(0.0, 1.4); tMax = vec2(1.6, 2.2); id = 1.0; }
      else { tMin = vec2(0.0, 2.2); tMax = vec2(1.6, 4.0); id = 2.0; }
    } else if (lp.x < 2.9) {
      if (lp.y < 1.4) { tMin = vec2(1.6, 0.0); tMax = vec2(2.9, 1.4); id = 3.0; }
      else { tMin = vec2(1.6, 1.4); tMax = vec2(2.9, 4.0); id = 4.0; }
    } else {
      if (lp.y < 2.2) { tMin = vec2(2.9, 0.0); tMax = vec2(4.0, 2.2); id = 5.0; }
      else if (lp.y < 3.1) { tMin = vec2(2.9, 2.2); tMax = vec2(4.0, 3.1); id = 6.0; }
      else { tMin = vec2(2.9, 3.1); tMax = vec2(4.0, 4.0); id = 7.0; }
    }
  }

  void main(void) {
    float moduleSize = uUnit * 4.0;
    vec2 moduleId = floor(vGroundUV / moduleSize);
    vec2 moduleLocal = vGroundUV - moduleId * moduleSize;

    /* Modul pro Bay zufällig drehen/spiegeln — das ist die Geometrie der
       Fugen, nicht das Foto, also kein Licht-Richtungs-Problem. Echte
       Verleger drehen das Modul genauso, um die Wiederholung zu brechen. */
    vec2 m = moduleLocal;
    float rot = floor(hash21(moduleId + 1.7) * 4.0);
    if (rot < 0.5) { /* keep */ }
    else if (rot < 1.5) { m = vec2(m.y, moduleSize - m.x); }
    else if (rot < 2.5) { m = vec2(moduleSize - m.x, moduleSize - m.y); }
    else { m = vec2(moduleSize - m.y, m.x); }
    if (hash21(moduleId + 3.3) > 0.5) { m.x = moduleSize - m.x; }

    vec2 tMin, tMax;
    float pieceId;
    classifyModule(m / uUnit, tMin, tMax, pieceId);

    vec2 tileWH = (tMax - tMin) * uUnit;
    vec2 tilePos = m - tMin * uUnit;
    vec2 tileId = moduleId * 8.0 + pieceId;

    vec2 center = tileWH * 0.5;
    float shrink = 0.9 + hash21(tileId + 5.0) * 0.06;
    vec2 rel = (tilePos - center) / shrink;
    vec2 shrunk = center + rel;
    float edgeDist = min(min(shrunk.x, tileWH.x - shrunk.x), min(shrunk.y, tileWH.y - shrunk.y));

    vec2 local01 = clamp(tilePos / tileWH, 0.0, 1.0);
    vec3 stoneColor = sampleStone(tileId, local01);

    vec3 groutColor = vec3(0.80, 0.775, 0.73);
    vec3 groutShadow = groutColor * 0.6;
    float seamAo = smoothstep(0.0, 0.1, edgeDist);
    vec3 groutFinal = mix(groutShadow, groutColor, seamAo);

    float grout = smoothstep(0.0, 0.5, edgeDist);
    vec3 color = mix(groutFinal, stoneColor, grout);

    float dist = max(uCameraZ - vPosition.z, 0.0);
    float fade = clamp((165.0 - dist) / 165.0, 0.0, 1.0);

    gl_FragColor = vec4(color, fade * 0.95);
  }
`;

const textureLoader = new THREE.TextureLoader();

function loadStoneTexture(url) {
  const texture = textureLoader.load(url);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Baut die Photo-Tiles-Szene in `canvas` auf (siehe shader-flight.js).
 *
 * @param {string} options.textureLight - Heller Materialausschnitt.
 * @param {string} options.textureMid - Mittlerer Materialausschnitt
 *   (häufigster Ton).
 * @param {string} options.textureDark - Dunkler Materialausschnitt.
 *   Alle drei fugenfrei, z. B. aus src/assets/castle-stones/.
 * @param {number} options.unit - Rastereinheit des Verlegemoduls in
 *   Weltgrößen; das Modul selbst ist 4×uUnit groß.
 * @returns {() => void} destroy
 */
export function initPhotoTiles(
  canvas,
  { textureLight, textureMid, textureDark, cameraZ = 70, planeSize = 260, speed = 6, unit = 7 } = {},
) {
  const uniforms = {
    time: { value: 0 },
    uPhotoLight: { value: loadStoneTexture(textureLight) },
    uPhotoMid: { value: loadStoneTexture(textureMid) },
    uPhotoDark: { value: loadStoneTexture(textureDark) },
    uCameraZ: { value: cameraZ },
    uUnit: { value: unit },
  };

  return createShaderFlight(canvas, {
    uniforms,
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    planeSize,
    cameraPosition: [0, 15, cameraZ],
    lookAt: [0, 5, 0],
    fov: 40,
    onFrame: (delta) => {
      uniforms.time.value += delta * speed;
    },
  });
}
