/* -----------------------------------------------------------------------
   Einstiegspunkt

   Die Bewegung liegt in src/animations/, nach Aufgaben geschnitten. Hier
   wird sie nur zusammengesetzt.

   Sicherheitsnetz: Schlägt irgendetwas davon fehl, fliegt die Klasse `js`
   vom <html>-Element. Damit greifen die Startzustände in motion.css nicht
   mehr und die Seite steht vollständig sichtbar da — lieber ohne
   Animation als mit unsichtbarem Inhalt.
   ----------------------------------------------------------------------- */
import './style.css';
import { initHero } from './animations/hero.js';
import { initReveal } from './animations/reveal.js';
import { initHeader } from './animations/header.js';
import { initForm } from './animations/form.js';

try {
  initHero();
  initReveal();
  initHeader();
  initForm();
} catch (error) {
  document.documentElement.classList.remove('js');
  console.error('Bewegung konnte nicht gestartet werden — Inhalt wird ohne Animation gezeigt.', error);
}
