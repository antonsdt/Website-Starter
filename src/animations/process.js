/* -----------------------------------------------------------------------
   Prozess: die Linie wächst mit

   Die Zeitleiste hat in CSS bereits eine ruhende Linie. Darüber legt sich
   eine glühende, die an den Scrollfortschritt gekoppelt ist — der Weg vom
   ersten Gespräch bis zum Wachstum baut sich beim Lesen auf. Erklärende
   Bewegung, kein Effekt — deshalb scrollgebunden statt einmalig abgespielt.

   Bewusst kein Tween, sondern ein direkt gesetzter Wert: Die Position
   gehört dem Scrollrad, nicht einer Zeitachse.
   ----------------------------------------------------------------------- */
import { utils } from 'animejs';
import { prefersReducedMotion } from './env.js';

export function initProcess() {
  const list = document.querySelector('[data-timeline]');
  if (!list) return;

  /* Weniger Bewegung: keine mitlaufende Linie. Die ruhende CSS-Linie
     trägt die Struktur bereits allein. */
  if (prefersReducedMotion()) return;

  const line = document.createElement('span');
  line.className = 'timeline-line';
  line.setAttribute('aria-hidden', 'true');
  list.prepend(line);

  let ticking = false;

  const update = () => {
    ticking = false;

    const rect = list.getBoundingClientRect();
    /* Die Linie ist voll, wenn das Ende der Zeitleiste die Mitte des
       Fensters erreicht — nicht erst, wenn sie ganz oben herausläuft. */
    const start = window.innerHeight * 0.85;
    const end = window.innerHeight * 0.5;
    const travel = rect.height + start - end;

    /* Geklemmt statt bedingt: Oberhalb des Fensters ergibt die Rechnung
       von selbst 1, unterhalb 0. Genau deshalb läuft sie bei jedem
       Scrollschritt — ein Sichtbarkeits-Schalter davor hatte die Linie bei
       Ankersprüngen auf dem alten Wert stehen lassen, weil der
       IntersectionObserver den Wechsel von "unterhalb" nach "oberhalb"
       gar nicht meldet. */
    utils.set(line, { scaleY: utils.clamp((start - rect.top) / travel, 0, 1) });
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
}
