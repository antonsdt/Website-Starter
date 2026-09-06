/* -----------------------------------------------------------------------
   Kopfleiste: Zustand statt Dauerbewegung

   Zwei Rückmeldungen, beide über IntersectionObserver statt über einen
   scroll-Listener — der würde bei jedem Pixel feuern.

   1. "gescrollt": die Leiste setzt sich sichtbar vom Inhalt ab, sobald
      sie nicht mehr am Seitenanfang klebt.
   2. Aktiver Abschnitt: der Navigationspunkt zum gerade gelesenen
      Abschnitt bleibt markiert. Reine Zustandsanzeige, keine Zierde.
   ----------------------------------------------------------------------- */
/* Das Band in der Mitte des Fensters entscheidet, was gerade gelesen wird —
   sonst wechselt die Markierung schon am Rand hin und her. */
const MIDDLE_BAND = '-45% 0px -50% 0px';

export function initHeader() {
  const header = document.querySelector('.site-header');
  const sentinel = document.querySelector('#top');

  if (header && sentinel) {
    new IntersectionObserver(
      ([entry]) => header.classList.toggle('is-scrolled', !entry.isIntersecting),
      { threshold: 0 },
    ).observe(sentinel);
  }

  const links = [...document.querySelectorAll('.nav a[href^="#"]:not(.nav-cta)')];
  const sections = links
    .map((link) => ({ link, section: document.querySelector(link.getAttribute('href')) }))
    .filter((pair) => pair.section);

  if (!sections.length) return;

  const clear = () => {
    for (const { link } of sections) link.classList.remove('is-active');
  };

  const spy = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const match = sections.find((pair) => pair.section === entry.target);
        if (!match) continue;
        clear();
        match.link.classList.add('is-active');
      }
    },
    { rootMargin: MIDDLE_BAND, threshold: 0 },
  );

  for (const { section } of sections) spy.observe(section);

  /* Im Hero gehört die Markierung nirgendwohin. Ohne diesen Fall bliebe
     der zuletzt gelesene Abschnitt markiert, während der Nutzer längst
     wieder ganz oben steht — die Leiste behauptete dann etwas Falsches. */
  const firstSection = sections[0].section;

  new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) clear();
    },
    /* Dasselbe Mittelband wie oben: Sonst zählte der Hero schon als
       "gelesen", solange nur sein unterer Rand ins Bild ragt, und würde
       die Markierung des Abschnitts darunter sofort wieder löschen. */
    { rootMargin: MIDDLE_BAND, threshold: 0 },
  ).observe(document.querySelector('.hero') ?? firstSection);
}
