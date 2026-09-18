import { defineConfig } from 'vite';
import { resolve } from 'node:path';

/* Weitere Einstiegspunkte neben index.html — ohne diese Liste würde
   `npm run build` nur die Startseite bauen; der Dev-Server findet alle
   auch ohne diese Datei. */
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        generativeHeroDemo: resolve(__dirname, 'generative-hero-demo.html'),
        generativeTilesDemo: resolve(__dirname, 'generative-tiles-demo.html'),
      },
    },
  },
});
