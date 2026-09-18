import './generative-hero-demo.css';
import { initGLSLHills } from './animations/glsl-hills.js';
import { animateFlightCopy } from './animations/shader-flight.js';

const root = document.querySelector('.flight-hero');
const canvas = document.querySelector('#hills-canvas');

try {
  initGLSLHills(canvas);
  animateFlightCopy(root);
} catch (error) {
  document.documentElement.classList.remove('js');
  console.error('GLSL-Hills konnte nicht gestartet werden — Text wird ohne Terrain gezeigt.', error);
}
