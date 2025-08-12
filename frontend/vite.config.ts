import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { fileURLToPath } from 'url'
// Get the directory name in ESM context
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


// https://vite.dev/config/\
export default defineConfig({
  plugins: [react()],
  // base: '/', // Absolute path for development
  build: {
    manifest: true,
    outDir: 'dist',
    rollupOptions: {
      input: {
        main:  path.resolve(__dirname, 'src/main.tsx'),
      },
    },
  },
  server: {
    port: 5173,
  }
})
