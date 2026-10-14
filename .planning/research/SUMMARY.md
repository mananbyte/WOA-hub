# Project Research Summary

**Project:** WoA Contract Hub  
**Domain:** Gaming Community Contract Marketplace & Discord Bot Platform  
**Researched:** 2026-10-14  
**Confidence:** HIGH  

---

## Executive Summary

World of Airports (WoA) players generate 5× higher in-game revenue from player-to-player flight contracts ("connections"), but currently must coordinate through chaotic, fragmented Discord chats, forum threads, and spreadsheets. Because Flyboys Games provides **no public game API**, the coordination platform must operate on verified, bilateral self-reporting.

The recommended architectural approach is a **Modular Monolith** using **Node.js LTS (TypeScript) + Express.js + PostgreSQL 16 (via Drizzle ORM)** with a **Vite + React SPA frontend** and a co-located **discord.js Gateway client**. Public players and alliance members operate on a single unified database with scoped visibility rules (`open`, `alliance_only`, `direct`), preventing fragmented liquidity while supporting both independent players and organized groups.

The primary operational risks include: (1) race conditions during simultaneous contract claims, (2) Discord 3,000ms slash command timeouts, (3) data leakage between alliance private spaces and the public feed, and (4) fake completion/reputation gaming. These are mitigated by row-level locking (`SELECT FOR UPDATE`), direct in-process domain access for the bot, strict SQL-level scoping with CTEs, and mandatory bilateral confirmation before a contract is finalized.

---

## Key Findings

### Recommended Stack

- **Backend & Core Domain:** Node.js (v22 LTS), TypeScript 5.6, Express.js 4.21.
- **Database & Query Layer:** PostgreSQL 16 with Drizzle ORM (lightweight, zero-binary overhead, full support for complex CTEs and row locking).
- **Frontend Web SPA:** React 18/19, Vite, TanStack React Query 5, Tailwind CSS, Lucide React icons.
- **Discord Bot:** discord.js v14, using Application Slash Commands and Interaction components (zero privileged gateway intents required).
- **Background Jobs & Timers:** `pg-boss` (utilizes PostgreSQL directly, eliminating the need for an external Redis cluster for MVP).
- **Hosting (2–3 Devs):** Containerized PaaS (Render / Railway / Fly.io) with managed Postgres + Cloudflare Pages CDN for the React frontend (~$20–$30/mo total).

### Expected Features

- **Table Stakes (Must-Have for Launch):**
  - Email/password authentication + Discord handle + WoA In-Game Player ID.
  - Outgoing ("I have planes to send") and Incoming ("I need planes sent to my airport") contract posting.
  - Centralized marketplace board with real-time filtering by airport, aircraft class, and region.
  - Concurrency-safe single-claim locking mechanism.
  - Bilateral self-reported status machine (`Open` → `Claimed` → `Dispatched` → `Accepted` → `Completed` / `Cancelled`).
  - Discord DM notifications on all status transitions.
  - Alliance creation, role-based access control (`Owner`, `Admin`, `Member`), and private group spaces.
- **Differentiators (Competitive Advantage):**
  - Integrated Discord slash commands (`/contract create`, `/contract find`, `/contract status`).
  - Automated or manual escalation of stale private alliance listings to the open marketplace.
  - Audited bilateral reputation score based on completion rates and 1-click reviews.
  - Configurable Discord webhook feeds for guild channels.
- **Anti-Features (Deferred from v1):**
  - No real-money subscriptions (growth first).
  - No in-platform web chat (Discord already handles conversation).
  - No native mobile apps (responsive mobile-first web SPA suffices).
  - No unverified game API hooks.

### Architecture Approach

A clean **Modular Monolith** structure where the Web Express API and Discord Bot are co-located adapters calling a shared, in-process TypeScript Domain Service layer:
1. **Web Ingress (Express API):** Handles REST requests from React SPA with JWT authentication.
2. **Bot Ingress (discord.js):** Listens to Discord slash commands and button interactions, directly executing domain functions with immediate deferral (`deferReply`) to prevent timeouts.
3. **Domain Service Core:** Contains business logic for listing validation, state transitions, alliance access rules, and reputation calculation.
4. **PostgreSQL Persistence:** Single relational database with ACID transactions, partial unique indexes for claim concurrency, and immutable `status_events` audit logging.
5. **Worker Service (`pg-boss`):** Handles background cleanup of expired listings and triggers alliance escalation timers.

### Critical Pitfalls

1. **Simultaneous Claim Race Conditions:** Mitigated via `SELECT ... FOR UPDATE` and a unique partial database index on active claims.
2. **Discord 3-Second Timeout:** Mitigated by in-process domain execution (zero HTTP hops) and immediate interaction deferrals.
3. **Alliance Scope Data Leakage:** Mitigated by enforcing audience filters directly in parameterized SQL queries, accompanied by automated multi-tenant authorization tests.
4. **Reputation Gaming & Fake Completions:** Mitigated by requiring bilateral confirmation (both sender and receiver must report in-game completion).
5. **Ghost Listings & Inactive Hosts:** Mitigated by strict TTL expiration timers and automated status reset workers.

---

## Implications for Roadmap

Based on research findings and dependencies, the project should be structured into **4 cohesive coarse phases**:

### Phase 1: Core Foundation & Marketplace Engine
- **Delivers:** PostgreSQL schema, Drizzle ORM setup, User auth (email/password + WoA ID + Discord username), Outgoing/Incoming contract listings, concurrency-safe claim engine, bilateral status progression state machine, and basic REST API.
- **Avoids:** Race conditions on contract claims and data corruption.

### Phase 2: React Web Marketplace & User Experience
- **Delivers:** Responsive Vite + React SPA, marketplace board with live debounced filters (airport, class, region), posting forms, user profile pages, contract management dashboards, and bilateral status progression action triggers.
- **Addresses:** Complete web-first workflow to drive website traffic and user onboarding.

### Phase 3: Alliance Spaces & Scoped Query Engine
- **Delivers:** Alliance creation, RBAC (`Owner`, `Admin`, `Member`), private group workspaces, assigned/flexible airport models, audience scoping (`open` vs `alliance_only`), and background escalation worker (`pg-boss`) to escalate stale private listings to public.
- **Addresses:** Alliance acquisition channel and private group coordination without fragmenting marketplace liquidity.

### Phase 4: Discord Bot Integration, Notifications & Trust System
- **Delivers:** discord.js integration sharing the in-process domain layer, slash commands (`/contract create`, `/contract find`, `/contract status`), bilateral DM notifications on contract events, guild webhook channel broadcasts, and reputation rating/review calculations.
- **Addresses:** Community engagement loop and prevents ghosting/trust breakdown.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| **Stack** | HIGH | Proven 2025/2026 Node/TypeScript/Drizzle/Postgres/React stack with optimal developer velocity. |
| **Features** | HIGH | Directly synthesized from WoA mechanics, Flyboys forums, and alliance case studies. |
| **Architecture** | HIGH | Comprehensive 36KB blueprint detailing concurrency, CTE queries, and modular monolith design. |
| **Pitfalls** | HIGH | Detailed mitigation strategies for Discord timeouts, race conditions, and self-reporting abuse. |

**Overall Confidence: HIGH**

---

## Sources

### Primary (HIGH Confidence)
- Discord Developer Documentation (API v10, Interactions, Slash Commands, Rate Limits)
- PostgreSQL Documentation (Explicit Locking, Row-Level Concurrency, Indexes)
- Drizzle ORM Documentation & Node.js 22 LTS Release Notes

### Secondary (MEDIUM Confidence)
- Flyboys Games Forum WoA Guides (Beginner, Connection & Alliance Mechanics)
- Community Alliance Structures (IAG Hub Model, Flexi Alliance Announce Model)

---
*Research completed: 2026-10-14*  
*Ready for roadmap: YES*
