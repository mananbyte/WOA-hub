---
phase: "quick"
plan: "02"
type: "execute"
title: "Configure full-stack Vercel and Supabase deployment"
files_modified:
  - "api/index.ts"
  - "vercel.json"
  - "src/db/index.ts"
  - "src/routes/cron.routes.ts"
  - "src/app.ts"
  - "src/jobs/worker.ts"
autonomous: true
requirements:
  - "MKT-03"
  - "STAT-08"
---

<objective>
Configure WoA Contract Hub for zero-cost, high-performance deployment using Vercel (unified hosting for Vite React SPA + Express serverless API) and Supabase (managed PostgreSQL 16 database with SSL and connection pooling). Provide serverless-friendly scheduled cleanup to replace persistent daemon workers.
</objective>

<threat_model>
ASVS Level 1:
- Cron authorization: `/api/cron/cleanup` should accept Vercel Cron header (`x-vercel-cron`) or authorization secret to prevent unauthorized public spamming.
- SSL enforcement: Supabase PostgreSQL connections must use SSL without failing on self-signed cert validation in production.
- Connection leak prevention: Configure node-postgres pool with bounded connection limits and idle timeouts suitable for serverless micro-VMs.
</threat_model>

<tasks>
<task id="T1">
  <action>
    Create Vercel Serverless Function entrypoint:
    - Create `api/index.ts` exporting a serverless handler for Express `app`.
  </action>
  <verify>
    Inspect `api/index.ts`.
  </verify>
</task>

<task id="T2">
  <action>
    Configure `vercel.json` at repository root:
    - Set `buildCommand: "npm run build:all"` and `outputDirectory: "web/dist"`.
    - Configure rewrites:
      - Route `/api/(.*)` to `/api`.
      - Fallback `/(.*)` to `/index.html` for client-side routing.
    - Configure free Vercel Cron job triggering `/api/cron/cleanup` every 15 minutes (`*/15 * * * *`).
  </action>
  <verify>
    Validate `vercel.json` syntax.
  </verify>
</task>

<task id="T3">
  <action>
    Implement Serverless Cron Cleanup Route:
    - Create `src/routes/cron.routes.ts` with `GET /cleanup`:
      - Expire listings past `expiresAt`.
      - Cancel unapproved claims older than 4 hours.
      - Escalate private alliance listings whose `autoEscalateDelayHours` has elapsed.
    - Mount `cronRouter` in `src/app.ts` at `/api/cron`.
    - In `src/jobs/worker.ts`, bypass starting persistent `pg-boss` worker if `process.env.VERCEL` is defined.
  </action>
  <verify>
    Inspect `src/routes/cron.routes.ts` and `src/app.ts`.
  </verify>
</task>

<task id="T4">
  <action>
    Update Database Pool for Supabase and Serverless:
    - In `src/db/index.ts`:
      - Enable SSL with `rejectUnauthorized: false` when in production or when connecting to Supabase/remote hosts.
      - Configure `max: 5` and `idleTimeoutMillis: 30000` to prevent exhausting connection limits under serverless scaling.
  </action>
  <verify>
    Check `src/db/index.ts` pool options.
  </verify>
</task>
</tasks>

