import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'assets',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'static',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      input: {
        main: './index.html'
      },
      output: {
        manualChunks: {
          three: ['three'],
          gsap: ['gsap'],
          lenis: ['lenis'],
          howler: ['howler']
        }
      }
    }
  }
});
