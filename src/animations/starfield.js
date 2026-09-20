/* -----------------------------------------------------------------------
   Sternenfeld

   Ein Canvas statt eines Fotos: leichtgewichtig, unendlich skalierbar und
   ohne Lizenzfrage. Die Sterne funkeln über einen reinen Sinus auf ihrer
   Deckkraft — keine Positionsänderung, also kein Bewegungs-Trigger für
   empfindliche Nutzer:innen, aber genug Leben, um die Szene nicht statisch
   wirken zu lassen.

   Pausiert außerhalb des Sichtfelds über IntersectionObserver: die Bühne
   läuft nur, während sie wirklich zu sehen ist.
   ----------------------------------------------------------------------- */
import { prefersReducedMotion } from './env.js';

export function initStarfield() {
  const canvas = document.querySelector('[data-starfield]');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reduced = prefersReducedMotion();
  let width = 0;
  let height = 0;
  let dpr = 1;
  let stars = [];
  let frame = null;

  function seed() {
    const density = 9000;
    const count = Math.max(60, Math.round((width * height) / density));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height * 0.82,
      r: Math.random() * 1.1 + 0.25,
      base: Math.random() * 0.45 + 0.2,
      speed: Math.random() * 0.0016 + 0.0004,
      phase: Math.random() * Math.PI * 2,
    }));
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
    draw(0);
  }

  function draw(time) {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#f4f2ec';
    for (const star of stars) {
      const twinkle = reduced ? 0 : Math.sin(time * star.speed + star.phase) * 0.32;
      ctx.globalAlpha = Math.max(0, Math.min(1, star.base + twinkle));
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function loop(time) {
    draw(time);
    frame = requestAnimationFrame(loop);
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });

  if (reduced) return;

  const visibility = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        if (frame === null) frame = requestAnimationFrame(loop);
      } else if (frame !== null) {
        cancelAnimationFrame(frame);
        frame = null;
      }
    },
    { threshold: 0 },
  );

  visibility.observe(canvas);
}
