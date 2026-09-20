import { defineConfig } from 'vite';

// GitHub Pages served this project from https://antonsdt.github.io/Website-Starter/,
// so every asset path needs that subpath prefix — without it the built
// index.html would request /assets/... from the domain root and 404.
export default defineConfig({
  base: '/Website-Starter/',
});
