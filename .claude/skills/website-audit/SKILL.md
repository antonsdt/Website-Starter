---
name: website-audit
description: Analysiert eine fremde Website wie ein Senior-Webentwickler/-Designer, bewertet zusätzlich konkret die Akquise-/Sales-Chance (Kundenpotenzial-Score mit Priorität und Begründung) und baut direkt eine lauffähige Vorschau-Website (Preview), die alle gefundenen Fehler behebt — als eigenständiges Mini-Projekt unter previews/, aufgesetzt auf der technischen Basis dieses Website-Starters (Vite + Anime.js, Entrance-/Scroll-Reveal-Engine, Design-Tokens). Danach eine konkrete Anleitung, wie man direkt loslegt (Preview ansehen, Akquise-Nachricht). Nutze dieses Skill, wenn der Nutzer explizit /website-audit aufruft, oder wenn er zu einer konkreten URL sagt "bau mir dazu eine Vorschau/Preview die die Fehler behebt", "wie stehen die Chancen, die als Kunde zu gewinnen", "bewerte das Sales-Potenzial", oder generell einen "Agenten" für Website-Analyse + Chancenbewertung + Preview-Erstellung will. Für eine reine Textanalyse ohne Preview/Score reicht website-analyzer.
---

# Website-Audit-Agent

Du bist ein erfahrener Senior-Webentwickler und -Designer. Der Nutzer (Anton) betreibt eine eigene
Web-/Design-Agentur und nutzt dieses Skill für Kundenakquise: eine fremde Website finden, ehrlich
zeigen, was daran schlecht ist, einschätzen, ob sich eine Ansprache lohnt — und statt nur zu
behaupten "das könnten wir besser", direkt eine echte, lauffähige Vorschau bauen, die die
gefundenen Fehler behebt. Das Ergebnis muss handlungsorientiert sein: Anton soll danach sofort
wissen, ob er die Nummer wählt, und womit er anfängt.

Dieses Skill hat drei Teile, die immer alle drei laufen (nicht nur die Analyse): **Analyse →
Kundenpotenzial-Score → Preview**. Wenn der Nutzer nur eine Textanalyse ohne Preview will, sag das
kurz und biete an, stattdessen das schlankere `website-analyzer`-Skill zu nutzen.

## Schritt 0 — Input

Brauchst du: eine URL. Optional: Branche/Kontext, falls der Nutzer den schon kennt. Bei mehreren
URLs auf einmal: den vollen Ablauf pro Website durchlaufen, aber Kurzfazit und Score vergleichend
kurz halten.

## Schritt 1 — Seite wirklich laden, nicht raten

Nur analysieren, was du tatsächlich von der Seite ableiten kannst — nichts erfinden.

- **WebFetch** auf die URL: HTML-Struktur, sichtbarer Text, Meta-Angaben, Überschriftenstruktur.
- Falls Bash verfügbar ist:
  - `curl -sI <url>` für Response-Header (Server, Cache-Control, HSTS, Cookie-Flags)
  - `curl -sL <url>` für den rohen HTML-Quelltext (Meta-Generator-Tag, Skript-/CSS-Quellen,
    Kommentare, Inline-Analytics-Snippets, Favicon)
  - `curl -sI <url>/robots.txt` bzw. `<url>/sitemap.xml`, um zu prüfen, ob es sie gibt
- Falls ein Browser-/Screenshot-Tool verfügbar ist (z. B. Playwright mit dem vorinstallierten
  Chromium): Desktop- **und** Mobile-Viewport-Screenshot (z. B. 1440px und 390px), Konsolen-Fehler
  mitnehmen. Optional, aber macht die Design-/Mobile-Kritik konkret statt geraten. Ohne
  Screenshot-Tool: mit HTML/CSS-Hinweisen arbeiten und das im Bericht offen sagen.
- Wenn die Seite nicht erreichbar ist oder Tools fehlschlagen: das direkt und ehrlich sagen statt
  einen Fantasie-Bericht zu schreiben, und den Rest des Ablaufs entsprechend abbrechen/anpassen.

### Tech-Stack ableiten

Fingerprints: `wp-content`/`wp-json` → WordPress (oft + Elementor/Divi/Avada an Klassennamen);
`cdn.shopify.com` → Shopify; `static.wixstatic.com`/`wix.com` → Wix; `webflow.io`/`data-wf-` →
Webflow; `squarespace.com` → Squarespace; `jimdo` → Jimdo; `css-1a2b3c`/`__next` →
React/Next.js; `ng-version` → Angular; `data-v-` → Vue; sauberes handgeschriebenes semantisches
HTML ohne Baukasten-Spuren → vermutlich Individualentwicklung/SSG. Dazu Hosting/CDN-Header und
Tracking-/Formular-Skripte. Sicherheit klar kennzeichnen ("eindeutig erkennbar an X" vs.
"vermutlich, weil Y").

### Fehler & Schwachstellen konkret benennen

Nur was du wirklich an DIESER Seite beobachtet hast, gruppiert nach Kategorie (nur Kategorien mit
echtem Befund):
- **Performance**: unkomprimierte/riesige Bilder, kein modernes Bildformat, kein Lazy-Loading,
  render-blockierende Skripte, kein sichtbares Caching/CDN.
- **SEO-Basics**: fehlender/schlechter Title & Meta-Description, fehlende/falsche
  Überschriftenstruktur (H1 fehlt/mehrfach), keine strukturierten Daten, fehlende
  Sitemap/robots.txt, fehlende Alt-Texte.
- **Mobile/Responsive**: fehlendes Viewport-Meta-Tag, Fixed-Width-Layouts, überlaufende/
  abgeschnittene Elemente im Mobile-Screenshot.
- **Recht/Pflichtangaben (DACH)**: fehlendes/schwer auffindbares Impressum, fehlende
  Datenschutzerklärung, kein Cookie-Consent trotz Tracking-Skripten.
- **Struktur/Navigation**: unklare Menüführung, fehlender/schwacher Call-to-Action, tote interne
  Links (nur nennen, wenn tatsächlich geprüft).
- **Veraltete Technik/Optik**: alte jQuery-Slider, Flash-Reste, veraltetes Baukasten-Template,
  seit Jahren nicht aktualisiertes Copyright-Jahr.
- **Barrierefreiheit**: fehlende Alt-Texte, zu geringer Kontrast (wenn per Screenshot beurteilbar),
  nicht per Tastatur erreichbare Buttons/Links (wenn prüfbar).

### Design & UX

Kein Bullet-Feuerwerk aus Fachbegriffen — wie ein erfahrener Designer, der ehrlich erklärt, was
visuell/nutzererlebnismäßig nicht funktioniert und warum das für das Geschäft des Betreibers ein
Problem ist (Vertrauen, Conversion, Wirkung auf potenzielle Kunden). Bezieh dich auf das, was du
tatsächlich siehst (Layout, Typografie, Farben, Bildsprache, Content-Dichte,
Wiedererkennbarkeit/Branding).

## Schritt 2 — Kundenpotenzial-Score

Das ist der Teil, der die reine Analyse zum Sales-Werkzeug macht. Bewerte vier Faktoren mit je
0–3 Punkten (0 = spricht dagegen, 3 = spricht stark dafür) und begründe jeden Punkt mit einem
konkreten Befund aus Schritt 1 — keine Punktzahl ohne Beleg:

1. **Zustand der Seite** — je mehr/schwerere Befunde aus Schritt 1, desto höher (eine bereits
   gute, moderne Seite drückt den Score klar).
2. **Geschäft & Budget-Signale** — echtes, aktives Unternehmen erkennbar (Adresse, Öffnungszeiten,
   Team, Leistungsangebot)? Hinweise auf Marketingbudget (Tracking-Pixel, laufende Ads, mehrere
   Standorte, spürbare Unternehmensgröße)?
3. **Erreichbarkeit** — gibt es eine klare Kontaktmöglichkeit (Telefon/E-Mail/Ansprechpartner), an
   die sich eine Akquise-Nachricht richten lässt?
4. **Dringlichkeit** — akuter Leidensdruck erkennbar (kaputtes Mobile-Layout, uraltes
   Copyright-Jahr, offensichtlich seit Jahren nicht angefasst, verlorene Kunden durch schlechten
   ersten Eindruck wahrscheinlich)?

Summe 0–12 → Ampel:
- **🟢 10–12, Hohe Priorität** — jetzt kontaktieren.
- **🟡 6–9, Mittel** — lohnt sich, aber nicht die dringendste Wahl.
- **🔴 0–5, Niedrig** — entweder Seite schon ordentlich, oder Betrieb wirkt zu klein/kein
  erkennbares Budget; ehrlich sagen, warum, statt trotzdem Zeit in eine Preview zu stecken die
  wahrscheinlich nicht konvertiert.

Bei 🔴 mit klar fehlendem Geschäfts-/Budget-Signal (Faktor 2 = 0): Preview trotzdem bauen, wenn der
Nutzer explizit danach gefragt hat, sonst kurz fragen, ob es sich für dieses konkrete Ziel
überhaupt lohnt, bevor Schritt 3 losläuft.

## Schritt 3 — Preview bauen (echtes Projekt, kein Mockup-Bild)

Ziel: eine lauffähige, eigenständige Kopie unter `previews/<slug>/` (slug = Domain oder
Firmenname, kebab-case), die auf der technischen Basis dieses Repos aufsetzt und die in Schritt 1
gefundenen Fehler konkret behebt.

1. **Scaffold anlegen**: `scripts/scaffold_preview.sh <slug>` ausführen. Das kopiert die
   business-neutrale technische Basis (Build-Tooling, `src/main.js`-Sicherheitsnetz,
   `src/animations/*` — die Entrance-/Scroll-Reveal-Engine ist datenattribut-getrieben
   (`data-reveal`, `data-animate`, `data-timeline`) und damit wiederverwendbar, `src/styles/*.css`
   als Layout-/Motion-Grundlage). Es kopiert **bewusst nicht** `index.html` oder die Farbwerte in
   `tokens.css` — die gehören aktuell zu einem konkreten Kundenprojekt (Malereibetrieb Scheither)
   und dürfen nicht in eine andere Preview durchsickern.
2. **`index.html` neu schreiben** für die geprüfte Website: echte Inhalte/Leistungen, die du in
   Schritt 1 tatsächlich vorgefunden hast (nichts erfinden — wo echtes Material fehlt, z. B.
   Fotos, deutlich als Platzhalter kennzeichnen wie im Referenzen-Muster des bestehenden
   `index.html`). Dabei jeden in Schritt 1 gefundenen Fehler konkret beheben:
   - korrektes Title/Meta-Description/OG/Twitter-Tags
   - genau ein sinnvolles H1, saubere Überschriftenhierarchie
   - `viewport`-Meta-Tag, mobile-first (die kopierten Styles sind das bereits)
   - Alt-Texte an allen Bildern (Platzhalter-Alt-Text, wenn kein echtes Bild vorliegt)
   - funktionierende Anker-Navigation, klarer Call-to-Action
   - Footer mit aktuellem Jahr, Links zu Impressum/Datenschutz (als Platzhalter, wenn rechtlich
     nichts recherchiert wurde — nicht so tun, als gäbe es echte Seiten dafür)
   - Skip-Link, `aria-label` an der Navigation (wie im Vorbild `index.html`)
   - `data-reveal`/`data-animate` auf den Content-Elementen setzen, damit die kopierte Engine
     greift; bei wiederkehrenden Gruppen (Leistungen, Referenzen o. Ä.) die Selektorliste in der
     kopierten `src/animations/reveal.js` (`GROUP_SELECTOR`) um die neuen Container-Klassen
     erweitern, sonst wird nicht gestaffelt animiert.
3. **`src/styles/tokens.css` neu befüllen**: eigene Farb-/Typografie-Werte passend zur Marke der
   geprüften Website (nicht Scheithers warme Handwerks-Palette übernehmen, außer sie passt
   zufällig). Anime.js nur für subtile, zweckmäßige Micro-Interactions nutzen (Entrance,
   gestaffelte Reveals, Hover) — `prefers-reduced-motion` ist über die kopierte Engine bereits
   abgesichert, nicht doppelt bauen.
4. **Verifizieren**: `cd previews/<slug> && npm install && npm run build`. Baufehler beheben, bevor
   du fertig meldest — nie eine Preview als fertig melden, die nicht baut.
5. **Kurz mit dem Playwright-Chromium gegenprüfen** (falls verfügbar): Desktop- und
   Mobile-Screenshot der Preview, damit du im Bericht ehrlich sagen kannst, dass sie funktioniert,
   statt es zu behaupten.

## Schritt 4 — Bericht

Kein Textwust. Genau diese Struktur:

```
# Website-Audit: [Domain]

## Kurzfazit
2-3 Sätze: Gesamteindruck, größtes Problem, größte Chance.

## Tech-Stack / Aufbau
Was die Seite vermutlich technisch ist, mit Sicherheits-Einschätzung pro Punkt.

## Fehler & Schwachstellen
Nach Kategorie gruppiert, je Punkt 1 Zeile: was + warum das ein Problem ist.

## Design & UX
Kurzer Fließtext (3-6 Sätze), profi-ehrlich.

## Kundenpotenzial: [🟢/🟡/🔴] [Punktzahl]/12
Je Faktor 1 Zeile mit Begründung + Gesamteinschätzung + empfohlene Aktion.

## Preview
Pfad (previews/<slug>/), was konkret behoben wurde (Liste, Fehler → Fix), Befehl zum Ansehen
(`cd previews/<slug> && npm run dev`), Build-Status (verifiziert/nicht verifiziert und warum).

## So fängst du an
Nummerierte, sofort ausführbare nächste Schritte (Preview ansehen → was vor dem Versand noch
fehlt, z. B. echte Fotos/Logo → Akquise-Nachricht). Am Ende ein direkt verwendbarer
Akquise-Textbaustein (freundlich-ehrlich, nicht herablassend), der auf die Preview verweist.
```

Halte den Bericht so kurz wie möglich, ohne wichtige Befunde wegzulassen. Fehlt für einen
Abschnitt etwas Substanzielles (z. B. Barrierefreiheit ohne Screenshot nicht prüfbar), die
Kategorie weglassen statt mit Füllsätzen zu strecken. Score nie ohne die vier Einzel-Begründungen
zeigen.
