# Plan Quick-02 Summary: Vercel & Supabase Deployment Configuration

**Plan:** Quick-02  
**Status:** Completed  
**Completed:** 2026-10-29  

## Delivered Items

1. **Vercel Serverless Function Handler (`api/index.ts`)**:
   - Created entrypoint wrapping Express `app` into a standard Vercel serverless function.

2. **Unified Vercel Orchestration (`vercel.json`)**:
   - Root configuration with `npm install` across workspace and `npm run build:all`.
   - Output directory configured to `web/dist`.
   - Clean URL rewrites routing `/api/(.*)` to the serverless function and `/(.*)` to `index.html` for client-side routing.
   - Configured free 15-minute Vercel Cron for `/api/cron/cleanup`.

3. **Serverless Cleanup & Escalation Route (`src/routes/cron.routes.ts`, `src/app.ts`)**:
   - `/api/cron/cleanup`: Automatically sweeps expired contracts past `expiresAt`, cancels claims idle for >4h, and escalates delayed alliance listings to the public marketplace.
   - Guarded with optional `CRON_SECRET`.
   - In `src/jobs/worker.ts`, bypasses persistent daemon polling when running in `process.env.VERCEL`.

4. **Database Pool for Supabase & Serverless (`src/db/index.ts`)**:
   - Enabled SSL with `rejectUnauthorized: false` for production, Vercel, and Supabase connections.
   - Configured connection pool bounds (`max: 5`, `idleTimeoutMillis: 30000`, `connectionTimeoutMillis: 10000`) to integrate safely with Supabase's transaction pooler (port 6543).

5. **Monorepo Workspace Support (`package.json`)**:
   - Added `"workspaces": ["web"]` so Vercel installs dependencies across both backend and frontend simultaneously.

