// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy API requests to your backend server during development
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Change this to your backend server URL
        changeOrigin: true,
        secure: false,
      }
    }
  }
});