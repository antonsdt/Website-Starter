/* -----------------------------------------------------------------------
   Shader-Flight — gemeinsames Gerüst für "Flug über generative Ebene"-
   Effekte (Hills, Tiles, …). Kamera und Ebene sind fest, nur eine
   Zeit-Uniform wandert — das jeweilige Shader-Paar entscheidet, was daraus
   wird. Lifecycle (Resize, Reduced-Motion, Aufräumen) liegt hier zentral,
   damit jede Variante nur noch Shader + Kamera-Parameter beisteuert.
   ----------------------------------------------------------------------- */
import * as THREE from 'three';
import { animate, stagger } from 'animejs';
import { easeOut, prefersReducedMotion } from './env.js';

/**
 * Baut eine Shader-Ebene in `canvas` auf. Die Größe folgt dem Elternelement
 * von `canvas`, nicht dem Viewport — damit die Komponente auch als
 * Abschnitt statt als Vollbild-Hero funktioniert.
 *
 * @returns {() => void} destroy — Loop stoppen, Beobachter und
 *   GPU-Ressourcen freigeben.
 */
export function createShaderFlight(
  canvas,
  {
    uniforms,
    vertexShader,
    fragmentShader,
    planeSize = 256,
    cameraPosition = [0, 16, 125],
    lookAt = [0, 28, 0],
    fov = 45,
    onFrame,
  },
) {
  const container = canvas.parentElement;
  const reduceMotion = prefersReducedMotion();

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fov, 1, 1, 10000);
  const clock = new THREE.Clock();
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(planeSize, planeSize, planeSize, planeSize),
    new THREE.RawShaderMaterial({ uniforms, vertexShader, fragmentShader, transparent: true }),
  );
  scene.add(mesh);

  camera.position.set(...cameraPosition);
  camera.lookAt(new THREE.Vector3(...lookAt));

  const resize = () => {
    const { clientWidth: width, clientHeight: height } = container;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  let frameId = null;
  const tick = () => {
    onFrame?.(clock.getDelta());
    renderer.render(scene, camera);
    frameId = requestAnimationFrame(tick);
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  /* Weniger Bewegung: ein Bild reicht — die Noise-Verschiebung selbst ist
     Gestaltung (das Terrain), nur ihr Fortschritt über die Zeit ist die
     Bewegung, die wegfällt. */
  if (reduceMotion) {
    renderer.render(scene, camera);
  } else {
    tick();
  }

  return function destroy() {
    if (frameId !== null) cancelAnimationFrame(frameId);
    resizeObserver.disconnect();
    mesh.geometry.dispose();
    mesh.material.dispose();
    renderer.dispose();
  };
}

/**
 * Einmaliger, gestaffelter Eintritt für den Text über der Ebene. Läuft
 * unabhängig von `createShaderFlight` — die Ebene fließt weiter, der Text
 * steht danach fest.
 */
export function animateFlightCopy(root) {
  const copy = root.querySelectorAll('[data-animate]');
  if (!copy.length) return;

  if (prefersReducedMotion()) return;

  animate(copy, {
    opacity: [0, 1],
    translateY: [16, 0],
    duration: 640,
    delay: stagger(110, { start: 200 }),
    ease: easeOut,
  });
}
