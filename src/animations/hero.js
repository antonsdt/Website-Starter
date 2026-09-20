/* -----------------------------------------------------------------------
   Hero-Auftritt

   Die Bühne baut sich von außen nach innen auf: erst die Eck-Marginalien,
   dann die Marke, dann die Aussage, zuletzt die Handlungsaufforderung und
   der Scroll-Hinweis. Ein Zug, keine Einzelteile.
   ----------------------------------------------------------------------- */
import { createTimeline, stagger } from 'animejs';
import { easeOut, prefersReducedMotion } from './env.js';

export function initHero() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const corners = [...hero.querySelectorAll('.hero-corner[data-animate]')];
  const mark = hero.querySelector('.hero-mark[data-animate]');
  const word = hero.querySelector('.hero-word[data-animate]');
  const lede = hero.querySelector('.hero-lede[data-animate]');
  const actions = hero.querySelector('.hero-actions[data-animate]');
  const scrollCue = hero.querySelector('.hero-scroll[data-animate]');

  const targets = [...corners, mark, word, lede, actions, scrollCue].filter(Boolean);
  if (!targets.length) return;

  /* Weniger Bewegung: alles steht sofort an seinem Platz. */
  if (prefersReducedMotion()) return;

  const timeline = createTimeline({ defaults: { ease: easeOut } });

  timeline
    .add(corners, { opacity: [0, 1], translateY: [-8, 0], duration: 560, delay: stagger(90) }, 140)
    .add(mark, { opacity: [0, 1], scale: [0.86, 1], duration: 640 }, 300)
    .add(word, { opacity: [0, 1], translateY: [16, 0], duration: 620 }, '-=380')
    .add(lede, { opacity: [0, 1], translateY: [14, 0], duration: 560 }, '-=340')
    .add(actions, { opacity: [0, 1], translateY: [14, 0], duration: 520 }, '-=360')
    .add(scrollCue, { opacity: [0, 1], duration: 500 }, '-=180');

  return timeline;
}
