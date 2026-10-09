import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Local dev: forward /api to the reference payment server (npm run server)
      '/api': 'http://localhost:8787',
      // Same PostHog proxy as vercel.json
      '/ingest/static': { target: 'https://us-assets.i.posthog.com', changeOrigin: true, rewrite: (p) => p.replace(/^\/ingest/, '') },
      '/ingest': { target: 'https://us.i.posthog.com', changeOrigin: true, rewrite: (p) => p.replace(/^\/ingest/, '') },
    },
  },
});
