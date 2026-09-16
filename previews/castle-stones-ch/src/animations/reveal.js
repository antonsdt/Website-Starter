/* -----------------------------------------------------------------------
   Scroll-Reveals

   Jedes [data-reveal] startet in motion.css auf opacity: 0 und wird hier
   sichtbar gemacht, sobald sein Abschnitt in den Blick kommt.

   Gestaffelt wird gruppenweise: Elemente unter demselben Container
   erscheinen als ein Zug statt einzeln zu flackern. Jede Gruppe läuft
   genau einmal — bei jedem Vorbeiscrollen neu zu animieren wäre eine
   Oberfläche, die gegen ihren Leser arbeitet.
   ----------------------------------------------------------------------- */
import { animate, stagger, utils } from 'animejs';
import { easeOut, prefersReducedMotion } from './env.js';

/* Container, deren Kinder zusammen auftreten sollen. */
const GROUP_SELECTOR = [
  '.section-head',
  '.trust-list',
  '.process-grid',
  '[data-services]',
  '[data-references]',
  '.info-list',
].join(', ');

export function initReveal() {
  const targets = [...document.querySelectorAll('[data-reveal]')];
  if (!targets.length) return;

  /* Weniger Bewegung: motion.css zeigt die Elemente bereits vollständig an.
     Hier gar nicht erst zu animieren vermeidet ein sichtbares Aufblitzen. */
  if (prefersReducedMotion()) return;

  const pending = new Map();
  for (const element of targets) {
    const container = element.closest(GROUP_SELECTOR) ?? element;
    if (!pending.has(container)) pending.set(container, []);
    pending.get(container).push(element);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        settle(entry.target, show);
      }
    },
    /* Erst auslösen, wenn der Abschnitt wirklich im Blickfeld liegt und
       nicht schon am äußersten unteren Rand. */
    { rootMargin: '0px 0px -12% 0px', threshold: 0 },
  );

  for (const container of pending.keys()) observer.observe(container);

  /* -------------------------------------------------------------------
     Nachlauf für übersprungene Abschnitte

     Bei einem Ankersprung (etwa "Beratung anfragen") wandert ein Abschnitt
     direkt von unterhalb des Fensters nach oberhalb. Der Observer meldet
     das nicht: `isIntersecting` war vorher falsch und ist es danach immer
     noch, also entsteht gar kein Eintrag. Ohne diesen Nachlauf bliebe der
     übersprungene Abschnitt für immer leer.

     Der Listener läuft nur, solange überhaupt etwas aussteht, und hängt
     sich danach selbst wieder aus.
     ------------------------------------------------------------------- */
  let ticking = false;

  const sweep = () => {
    ticking = false;

    for (const container of [...pending.keys()]) {
      if (container.getBoundingClientRect().bottom < 0) {
        /* Schon vorbei — ohne Animation setzen, sonst blendet sich beim
           Zurückscrollen etwas ein, das der Nutzer längst passiert hat. */
        settle(container, (members) => utils.set(members, { opacity: 1, translateY: 0 }));
      }
    }

    if (!pending.size) window.removeEventListener('scroll', onScroll);
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(sweep);
  };

  window.addEventListener('scroll', onScroll, { passive: true });

  function settle(container, apply) {
    const members = pending.get(container);
    if (!members) return;
    pending.delete(container);
    observer.unobserve(container);
    apply(members);
  }
}

function show(elements) {
  animate(elements, {
    opacity: [0, 1],
    translateY: [18, 0],
    duration: 620,
    delay: stagger(70),
    ease: easeOut,
  });
}
