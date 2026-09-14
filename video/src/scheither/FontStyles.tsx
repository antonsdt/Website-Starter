// Loads the site's real font family (Fraunces / Work Sans / IBM Plex Mono,
// same as src/style.css) from self-hosted local files (public/fonts/) rather
// than fetching fonts.gstatic.com at render time: the headless Chromium this
// environment's Remotion render uses doesn't trust the outbound proxy's CA
// for direct HTTPS font fetches, so files were pre-downloaded once (via curl,
// which does trust it) and are served locally instead.
import { useEffect } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

export const FontStyles: React.FC = () => {
  useEffect(() => {
    const handle = delayRender('Loading local brand fonts (Fraunces/Work Sans/IBM Plex Mono)');
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = staticFile('fonts/fonts.css');
    document.head.appendChild(link);
    document.fonts.ready.then(() => continueRender(handle)).catch(() => continueRender(handle));
    return () => {
      document.head.removeChild(link);
    };
  }, []);
  return null;
};
