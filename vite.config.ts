import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 12000,
    host: true,
    allowedHosts: true,
  },
  preview: {
    port: 12000,
    host: true,
    allowedHosts: true,
  },
});
