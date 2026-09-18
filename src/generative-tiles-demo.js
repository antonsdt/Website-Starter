import './generative-tiles-demo.css';
import { initGLSLTiles } from './animations/glsl-tiles.js';
import { animateFlightCopy } from './animations/shader-flight.js';

const root = document.querySelector('.flight-hero');
const canvas = document.querySelector('#tiles-canvas');

try {
  initGLSLTiles(canvas);
  animateFlightCopy(root);
} catch (error) {
  document.documentElement.classList.remove('js');
  console.error('GLSL-Tiles konnte nicht gestartet werden — Text wird ohne Boden gezeigt.', error);
}
