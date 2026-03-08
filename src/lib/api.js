/**
 * api.js — Central API base URL config for SamaanAI
 *
 * Set VITE_API_URL in:
 *   - Local dev:  .env.local  →  VITE_API_URL=http://localhost:8000
 *   - Vercel:     Dashboard → Settings → Environment Variables
 *                             VITE_API_URL=https://<your-railway-service>.up.railway.app
 */
export const API_BASE_URL =
    import.meta.env.VITE_API_URL || 'https://samaan-ai-production-cd68.up.railway.app';
