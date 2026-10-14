import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { parsePriceInr, formatInr } from './shared/pricing.js';

export default defineConfig(({ mode }) => {
  // Reads SESSION_PRICE_INR from Vercel env vars or .env files; fails the build if it's invalid.
  const price = parsePriceInr(loadEnv(mode, process.cwd(), '').SESSION_PRICE_INR);

  return {
    plugins: [
      react(),
      {
        name: 'session-price-in-html',
        transformIndexHtml: (html) => html.replaceAll('%PRICE_LABEL%', formatInr(price)),
      },
    ],
    define: {
      __SESSION_PRICE_INR__: JSON.stringify(price),
    },
    server: {
      proxy: {
        // Local dev: forward /api to the reference payment server (npm run server)
        '/api': 'http://localhost:8787',
        // Same PostHog proxy as vercel.json
        '/ingest/static': { target: 'https://us-assets.i.posthog.com', changeOrigin: true, rewrite: (p) => p.replace(/^\/ingest/, '') },
        '/ingest': { target: 'https://us.i.posthog.com', changeOrigin: true, rewrite: (p) => p.replace(/^\/ingest/, '') },
      },
    },
  };
});
