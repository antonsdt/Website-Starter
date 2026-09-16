#!/usr/bin/env bash
# -----------------------------------------------------------------------
# Scaffolds a standalone preview project under previews/<slug>/ from this
# repo's reusable technical foundation (build tooling, entrance-animation
# harness, scroll-reveal engine, base styles). It deliberately does NOT
# copy index.html or the token color values, since those hold one
# specific client's content/brand (currently Malereibetrieb Scheither) —
# the audit skill writes fresh content and a fresh palette per prospect
# on top of this foundation.
#
# Usage: scripts/scaffold_preview.sh <slug>
# -----------------------------------------------------------------------
set -euo pipefail

SLUG="${1:?Usage: scaffold_preview.sh <slug>}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST="$ROOT/previews/$SLUG"

if [ -e "$DEST" ]; then
  echo "previews/$SLUG existiert bereits — abgebrochen, um nichts zu überschreiben." >&2
  exit 1
fi

mkdir -p "$DEST/src/animations" "$DEST/src/styles" "$DEST/src/assets" "$DEST/public"

# Build tooling
cp "$ROOT/package.json" "$DEST/package.json"
cp "$ROOT/package-lock.json" "$DEST/package-lock.json" 2>/dev/null || true
node -e "
  const fs = require('fs');
  const path = '$DEST/package.json';
  const pkg = JSON.parse(fs.readFileSync(path, 'utf8'));
  pkg.name = 'preview-$SLUG';
  fs.writeFileSync(path, JSON.stringify(pkg, null, 2) + '\n');
"

# Static files
cp -r "$ROOT/public/." "$DEST/public/" 2>/dev/null || true

# Entrance-animation harness + scroll-reveal engine (business-agnostic,
# driven by data-* attributes, not by copy)
cp "$ROOT/src/main.js" "$DEST/src/main.js"
cp -r "$ROOT/src/animations/." "$DEST/src/animations/"

# Base styles: keep base.css/buttons.css/header.css/footer.css/motion.css
# as the layout & motion foundation; tokens.css is copied as a STARTING
# POINT only — the skill must overwrite its color/font values for the
# new client's brand rather than inheriting Scheither's palette.
cp -r "$ROOT/src/styles/." "$DEST/src/styles/"
cp "$ROOT/src/style.css" "$DEST/src/style.css"

# Generic placeholder favicon (replace with the client's own mark if you
# have one; never ship the Scheither logo in someone else's preview)
cp "$ROOT/src/assets/favicon.svg" "$DEST/src/assets/favicon.svg" 2>/dev/null || true

echo "Scaffold angelegt unter previews/$SLUG/"
echo "Fehlt noch: index.html (frischer Inhalt), src/styles/tokens.css (Marken-Palette),"
echo "src/assets/logo.svg (oder Platzhalter-Wortmarke)."
