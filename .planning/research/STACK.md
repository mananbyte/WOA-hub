# Stack Research

**Domain:** Community Contract Marketplace & Discord Bot Platform
**Researched:** 2026-10-14
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Node.js (LTS)** | 22.x | Runtime Environment | High-throughput async I/O, native TypeScript support via tsx/ts-node, native Fetch, long-term stability for co-located bot and API. |
| **TypeScript** | ^5.6.0 | Language | Type safety across database models, REST API request/response contracts, and Discord interaction payloads. Eliminates runtime contract mismatches. |
| **Express.js** | ^4.21.0 | REST API Framework | Minimalist, robust, battle-tested for small teams; zero complex meta-framework abstractions. Integrates easily into modular monolith pattern. |
| **PostgreSQL** | 16.x | Relational Database | ACID transactions essential for concurrent contract claims (`SELECT ... FOR UPDATE`), JSONB for flexible group configuration, rich partial indexes. |
| **Drizzle ORM** | ^0.35.0 | SQL Query & Migration Engine | Zero-overhead lightweight TypeScript SQL query builder. Unlike Prisma, Drizzle has zero Rust engine binary bloat, generates explicit SQL, and supports complex joins/CTEs required for scoped alliance listings. |
| **React** | ^18.3.0 / 19.x | Web Frontend SPA | Standard frontend UI ecosystem, rich component libraries, predictable state management. |
| **Vite** | ^5.4.0 | Frontend Build Tool | Sub-second HMR, optimized production asset bundles, zero-config proxy for local Express development. |
| **discord.js** | ^14.16.0 | Discord Gateway Client | Official and de facto standard JavaScript library for Discord API v10, supporting modern slash commands, buttons, modals, and autocompletion. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **Zod** | ^3.23.0 | Schema Validation | Validates incoming REST API payloads and Discord slash command inputs; infers TypeScript types. |
| **bcryptjs / argon2** | ^2.4.3 / ^0.41.0 | Password Hashing | Secure one-way hashing for email/password authentication. |
| **jsonwebtoken** | ^9.0.2 | Stateless Auth Tokens | HttpOnly cookie-based JWT or Bearer authorization for React SPA web sessions. |
| **TanStack React Query** | ^5.59.0 | Client State & Caching | Manages server state on the web, handles optimistic updates when claims/dispatches occur, eliminates boilerplate. |
| **Tailwind CSS** | ^3.4.0 | Utility CSS Styling | Rapid development of responsive, mobile-first marketplace boards and dashboards without CSS bloat. |
| **Lucide React** | ^0.450.0 | Iconography | Clean, aviation and dashboard icons (Plane, Users, Shield, Clock, ArrowRight). |
| **pg-boss / bullmq** | ^9.0.0 / ^5.0.0 | Job Queue & Timers | Background scheduling for alliance listing escalation timers and contract expiry reminders. `pg-boss` uses PostgreSQL directly, eliminating Redis for MVP! |
| **pino / pino-pretty** | ^11.3.0 | Structured Logging | High-performance JSON logging for API requests and Discord events with correlation IDs. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **tsx** | Fast Node.js / TS Execution | Instant local execution and live reloading without build step. |
| **Drizzle Kit** | Schema Migration Tooling | Declarative migration generator (`drizzle-kit generate` & `drizzle-kit push`). |
| **Docker & Docker Compose** | Local & Production Containers | Compose spins up PostgreSQL and pgadmin for effortless local dev and deployment. |
| **Biome / ESLint + Prettier**| Linting and Formatting | Enforces code quality and consistency across frontend and backend. |

---

## Installation

```bash
# Backend & Shared Domain
npm install express pg drizzle-orm zod jsonwebtoken bcryptjs dotenv cors pino discord.js pg-boss
npm install -D typescript @types/node @types/express @types/pg @types/jsonwebtoken @types/bcryptjs @types/cors tsx drizzle-kit

# Frontend (Vite + React)
npm create vite@latest web -- --template react-ts
cd web
npm install @tanstack/react-query axios lucide-react clsx tailwind-merge
npm install -D tailwindcss postcss autoprefixer
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| **Drizzle ORM** | Prisma | Prisma is good for beginners who want automatic GraphQL/client generation, but its engine binary overhead, slow cold starts, and clunky raw query support make Drizzle superior for high-performance SQL with partial indexes and CTEs. |
| **Express.js** | NestJS | NestJS is appropriate for 15+ developer enterprise teams with strict Angular-like DI requirements. For 2–3 developers, NestJS adds massive cognitive overhead and slow compile times. |
| **Vite + React SPA** | Next.js | Next.js SSR adds deployment complexity (Node server or Edge runtimes) and complex caching behavior. Since the marketplace is an authenticated app with live client state and Discord bot parity, a clean SPA hosted on S3/Cloudflare Pages + REST API is vastly simpler. |
| **pg-boss (Postgres Queue)** | BullMQ + Redis | BullMQ is great when Redis is already part of the infrastructure. For a 2–3 person team, using `pg-boss` saves maintaining and paying for a separate Redis cluster while keeping transactions atomic. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **MongoDB / Mongoose** | WoA contracts have relational integrity: Users, Groups, Memberships, Listings, Claims, and audit events. Relational transactions with row locking are critical. | **PostgreSQL 16** |
| **Separate Microservices for Bot and Web** | Introducing an HTTP network boundary between the Discord bot and REST backend introduces double serialization, network latency, and risks exceeding Discord's 3,000ms slash command response window. | **Modular Monolith sharing a TypeScript Domain Layer** |
| **Direct Discord OAuth Gate only** | Forcing Discord OAuth blocks non-Discord users and forum-only players from signing up. | **Email/Password primary + Discord username stored** |
| **Client-side polling with `setInterval`** | Spams the database and exhausts connection pools. | **React Query with smart revalidation + Discord bot push notifications** |

---

## Hosting & Cloud Deployment for 2–3 Developers

### Recommended: Render / Railway / Fly.io (Container-based PaaS)
- **Primary Service:** Web API + Discord Bot running as a Docker container or twin processes.
- **Database:** Managed PostgreSQL (Render Postgres, Railway Postgres, or Supabase).
- **Frontend:** Static SPA deployed on Cloudflare Pages or Vercel (free, globally distributed CDN with sub-50ms TTFB).
- **Monthly Cost:** ~$15–$30/month initially, scaling smoothly without AWS IAM/VPC administrative overhead.

### Migration Path to AWS/GCP (Scale Phase):
- **AWS:** ECS Fargate (API & Bot) + Amazon RDS PostgreSQL + S3/CloudFront (Frontend).
- **GCP:** Cloud Run (API) + Compute Engine / GKE (Discord Bot stateful gateway) + Cloud SQL.

---

## Sources

- Discord Developer Documentation (API v10, Interactions & Gateway Lifecycle)
- Drizzle ORM Official Documentation & Benchmarks (2025/2026)
- Flyboys Games Forum WoA Community Mechanics
- Official Node.js LTS Release Schedules

---
*Stack research for: WoA Contract Hub*  
*Researched: 2026-10-14*
