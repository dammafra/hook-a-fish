import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import restart from 'vite-plugin-restart'

// https://vite.dev/config/
export default defineConfig({
  plugins: [restart({ restart: ['../public/**'] }), react(), tailwindcss()],
  server: {
    host: true,
    open: true,
  },
  build: {
    emptyOutDir: true, // Empty the folder first
    sourcemap: true, // Add sourcemap
  },
})
