import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Relative asset URLs keep the app working on GitHub Pages' repository subpath.
  base: './',
  plugins: [react()]
})
