import './generative-hero-demo.css';
import { initGLSLHills, animateHillsCopy } from './animations/glsl-hills.js';

const root = document.querySelector('.glsl-hills-hero');
const canvas = document.querySelector('#hills-canvas');

try {
  initGLSLHills(canvas);
  animateHillsCopy(root);
} catch (error) {
  document.documentElement.classList.remove('js');
  console.error('GLSL-Hills konnte nicht gestartet werden — Text wird ohne Terrain gezeigt.', error);
}
