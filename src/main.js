import { animate, stagger, cubicBezier } from 'animejs';
import './style.css';

const revealTargets = document.querySelectorAll('[data-animate]');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

try {
  // Reduced motion: CSS already shows these elements at full opacity by
  // default (see the [data-animate] rules in style.css), so skipping the
  // tween entirely — rather than animating opacity 0 -> 1 on top of that —
  // avoids a visible flash for users who asked for less motion.
  if (revealTargets.length && !prefersReducedMotion) {
    const easeOut = cubicBezier(0.23, 1, 0.32, 1);

    animate(revealTargets, {
      opacity: [0, 1],
      translateY: [12, 0],
      duration: 500,
      delay: stagger(70, { start: 80 }),
      ease: easeOut,
    });
  }
} catch (error) {
  // If the animation fails for any reason, fall back to plain visible
  // content instead of leaving it stuck at opacity: 0.
  document.documentElement.classList.remove('js');
  console.error('Entrance animation failed, showing content without it.', error);
}
