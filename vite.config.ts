import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative asset paths, so the same build works at a domain root and from a
  // GitHub Pages project subpath (/frame-in-goa/) without rebuilding.
  base: './',
  plugins: [react()],
});
