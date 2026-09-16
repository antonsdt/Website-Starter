/* -----------------------------------------------------------------------
   Hero-Auftritt

   Ein Zug von oben nach unten: Dachzeile, Überschrift, Fließtext,
   Schaltflächen — danach fächert sich der Farbfächer auf. Die vier
   Generationen erscheinen nacheinander, weil genau das die Aussage des
   Abschnitts ist.
   ----------------------------------------------------------------------- */
import { createTimeline, stagger, utils } from 'animejs';
import { easeOut, prefersReducedMotion } from './env.js';

export function initHero() {
  const copy = document.querySelectorAll('.hero [data-animate]');
  const swatches = document.querySelectorAll('[data-swatch-strip] .swatch');
  const eyebrow = document.querySelector('.hero .eyebrow');

  if (!copy.length) return;

  /* Weniger Bewegung: alles steht sofort an seinem Platz. Der Strich vor
     der Dachzeile wird trotzdem gesetzt, sonst bliebe er unsichtbar. */
  if (prefersReducedMotion()) {
    eyebrow?.classList.add('is-drawn');
    return;
  }

  /* Startzustand der Fächerkarten. Sie tragen kein [data-animate], also
     setzt CSS sie nicht auf 0 — das passiert hier, unmittelbar bevor die
     Zeitleiste läuft. */
  utils.set(swatches, { opacity: 0, translateX: 18 });

  const timeline = createTimeline({ defaults: { ease: easeOut } });

  timeline
    .add(copy, {
      opacity: [0, 1],
      translateY: [14, 0],
      duration: 560,
      delay: stagger(80),
    }, 60)
    .add(swatches, {
      opacity: [0, 1],
      translateX: [18, 0],
      duration: 520,
      delay: stagger(65),
    }, '-=240');

  /* Der Strich zieht sich per CSS-Transition auf — billiger als ein
     zweiter Tween und für ein Pseudo-Element der einzige Weg. */
  requestAnimationFrame(() => eyebrow?.classList.add('is-drawn'));

  return timeline;
}
