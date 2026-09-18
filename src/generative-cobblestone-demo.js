import './generative-cobblestone-demo.css';
import { initGLSLCobblestone } from './animations/glsl-cobblestone.js';
import { animateFlightCopy } from './animations/shader-flight.js';

const root = document.querySelector('.flight-hero');
const canvas = document.querySelector('#cobblestone-canvas');

try {
  initGLSLCobblestone(canvas);
  animateFlightCopy(root);
} catch (error) {
  document.documentElement.classList.remove('js');
  console.error('GLSL-Cobblestone konnte nicht gestartet werden — Text wird ohne Boden gezeigt.', error);
}
