import './generative-tiles-photo-demo.css';
import { initPhotoTiles } from './animations/glsl-photo-tiles.js';
import { animateFlightCopy } from './animations/shader-flight.js';
import textureLight from './assets/castle-stones/floor-material-light.png';
import textureMid from './assets/castle-stones/floor-material-macro.png';
import textureDark from './assets/castle-stones/floor-material-dark.png';

const root = document.querySelector('.flight-hero');
const canvas = document.querySelector('#photo-tiles-canvas');

try {
  initPhotoTiles(canvas, { textureLight, textureMid, textureDark });
  animateFlightCopy(root);
} catch (error) {
  document.documentElement.classList.remove('js');
  console.error('GLSL-Photo-Tiles konnte nicht gestartet werden — Text wird ohne Boden gezeigt.', error);
}
