/* -----------------------------------------------------------------------
   Kontaktformular: Rückmeldung beim Absenden

   Ohne Handler würde das Formular die Seite neu laden und die Eingaben
   verwerfen. Hier wird geprüft, das erste unvollständige Feld angesprungen
   und kurz angestoßen — Feedback in dem Moment, in dem der Nutzer handelt.

   TODO für den Livegang: Der Versand ist noch nicht angebunden. Sobald ein
   Endpunkt (Formspree, Netlify Forms, eigenes Backend) feststeht, in
   `submitRequest` einsetzen und die Statusmeldung entsprechend anpassen.
   ----------------------------------------------------------------------- */
import { animate } from 'animejs';
import { easeOut, prefersReducedMotion } from './env.js';

const PHONE = '+41 44 211 77 00';

export function initForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  const status = form.querySelector('[data-form-status]');
  const fields = [...form.querySelectorAll('input, textarea')];

  /* Fehlerzustand verschwindet, sobald der Nutzer das Feld korrigiert —
     nicht erst beim nächsten Absenden. */
  for (const field of fields) {
    field.addEventListener('input', () => field.classList.remove('is-invalid'));
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const invalid = fields.filter((field) => !isValid(field));

    for (const field of fields) {
      field.classList.toggle('is-invalid', invalid.includes(field));
    }

    if (invalid.length) {
      setStatus(status, 'Bitte füllen Sie die markierten Felder aus.', 'error');
      const first = invalid[0];
      first.focus({ preventScroll: false });
      nudge(first);
      return;
    }

    submitRequest(status);
  });
}

function isValid(field) {
  const value = field.value.trim();
  if (!value) return false;
  if (field.type === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  return true;
}

function submitRequest(status) {
  /* Bewusst keine Erfolgsmeldung: Es wird noch nichts verschickt, und eine
     Bestätigung, hinter der kein Versand steht, wäre eine Lüge gegenüber
     dem Kunden. */
  setStatus(
    status,
    `Der Online-Versand ist noch nicht freigeschaltet. Rufen Sie uns gern direkt an: ${PHONE}`,
    'notice',
  );
}

function setStatus(status, message, tone) {
  if (!status) return;
  status.textContent = message;
  status.dataset.tone = tone;

  if (prefersReducedMotion()) return;

  /* Die Meldung erscheint statt zu springen — kurzes Feedback in dem
     Moment, in dem der Nutzer gerade auf eine Antwort wartet. */
  animate(status, {
    opacity: [0, 1],
    translateY: [6, 0],
    duration: 260,
    ease: easeOut,
  });
}

/* Kurzer seitlicher Anstoß: zeigt auf das Feld, ohne es zu verstecken. */
function nudge(field) {
  if (prefersReducedMotion()) return;

  animate(field, {
    translateX: [{ to: -5 }, { to: 5 }, { to: -3 }, { to: 0 }],
    duration: 340,
    ease: easeOut,
  });
}
