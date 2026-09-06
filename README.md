# Website Starter

Ein neutraler, hochwertiger Ausgangspunkt für neue Projekte: Vite + Vanilla HTML/CSS/JavaScript,
mit [Anime.js](https://animejs.com) für dezente, zweckmäßige Micro-Interactions. Kein UI-Framework,
keine zusätzliche Animationsbibliothek.

## Struktur

```
index.html       Einstiegspunkt
src/main.js       JavaScript-Einstiegspunkt (Anime.js-Entrance-Animation)
src/style.css     Design-Tokens & Styles
src/assets/       Bilder/Icons, die von main.js oder index.html referenziert werden
public/           Statische Dateien, die unverändert unter "/" ausgeliefert werden (z. B. robots.txt)
```

## Befehle

```bash
npm install       # Abhängigkeiten installieren
npm run dev        # Entwicklungsserver mit Hot-Module-Replacement starten
npm run build       # Produktions-Build nach dist/ erzeugen
npm run preview     # Den fertigen Build lokal testen
```

## Hinweise

- Design-Tokens (Farben, Radien, Easing) liegen in `:root` in `src/style.css` und lassen sich dort
  zentral für ein neues Projekt anpassen.
- Die Entrance-Animation respektiert `prefers-reduced-motion` und degradiert bei fehlendem/fehlerhaftem
  JavaScript sichtbar auf statischen, vollständig sichtbaren Inhalt.
- Der "Loslegen"-Button im Hero ist ein Platzhalter — Ziel-Aktion beim Einsatz in einem echten Projekt
  anpassen.
