import { defineConfig } from 'vite';
import { resolve } from 'node:path';

/* Zweiter Einstiegspunkt (generative-hero-demo.html) neben index.html —
   ohne diese Liste würde `npm run build` nur die Startseite bauen; der
   Dev-Server findet beide auch ohne diese Datei. */
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        generativeHeroDemo: resolve(__dirname, 'generative-hero-demo.html'),
      },
    },
  },
});
