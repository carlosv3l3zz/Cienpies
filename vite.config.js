import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path';

//https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    assetsInlineLimit: 30000, 
    chunkSizeWarningLimit: 4000, 
  }
})
