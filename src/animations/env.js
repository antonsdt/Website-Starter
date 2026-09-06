/* -----------------------------------------------------------------------
   Gemeinsame Bewegungs-Grundlagen

   Die Kurven spiegeln die CSS-Tokens (--ease-out, --ease-in-out) in
   tokens.css. Wer dort etwas ändert, ändert es hier mit — damit CSS- und
   JS-Bewegung dieselbe Handschrift behalten.
   ----------------------------------------------------------------------- */
import { cubicBezier } from 'animejs';

export const easeOut = cubicBezier(0.23, 1, 0.32, 1);
export const easeInOut = cubicBezier(0.77, 0, 0.175, 1);

const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

/* Live abgefragt, nicht einmalig gespeichert: Wer die Einstellung während
   des Besuchs umstellt, bekommt ab dem nächsten Abschnitt das ruhige
   Verhalten. */
export const prefersReducedMotion = () => reduceQuery.matches;
