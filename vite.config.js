import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const productionContentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://challenges.cloudflare.com",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://challenges.cloudflare.com https://formsubmit.co",
  "frame-src https://challenges.cloudflare.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "manifest-src 'self'",
].join('; ');

const productionCspPlugin = {
  name: 'production-content-security-policy',
  apply: 'build',
  transformIndexHtml() {
    return [{
      tag: 'meta',
      attrs: {
        'http-equiv': 'Content-Security-Policy',
        content: productionContentSecurityPolicy,
      },
      injectTo: 'head-prepend',
    }];
  },
};

export default defineConfig({
  plugins: [react(), productionCspPlugin],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    restoreMocks: true,
    env: {
      VITE_SUPABASE_URL: 'http://127.0.0.1:54321',
      VITE_SUPABASE_ANON_KEY: 'public-test-key',
      VITE_TURNSTILE_SITE_KEY: 'public-test-site-key',
      VITE_ENROLLMENT_ENABLED: 'true',
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
