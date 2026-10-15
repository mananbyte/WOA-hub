# Roadmap: WoA Contract Hub

## Overview

WoA Contract Hub is built as a modular monolith providing a unified contract marketplace for World of Airports players and alliances, combined with a Discord bot for live DM alerts and slash commands. The roadmap is structured into 4 cohesive coarse phases: establishing the core domain engine and database, building the responsive React web marketplace, implementing multi-model alliance spaces with background escalation, and finishing with the Discord bot integration and reputation trust system.

## Phases

- [x] **Phase 1: Core Foundation & Marketplace Engine** - Database models, authentication, contract posting, concurrency-safe claiming, and bilateral status state machine.
- [x] **Phase 2: React Web Marketplace & User Experience** - Responsive web SPA, real-time filtering board, contract detail views, and user dashboards.
- [x] **Phase 3: Alliance Spaces & Scoped Query Engine** - Group management, RBAC, private listings, assigned-airport hubs, and background escalation workers.
- [ ] **Phase 4: Discord Bot Integration, Notifications & Trust System** - discord.js bot, DM alerts, slash commands, channel feeds, reputation ratings, and moderation tools.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|---|---|---|---|
| 1. Core Foundation & Marketplace Engine | 3/3 | Complete | 2026-10-15 |
| 2. React Web Marketplace & User Experience | 2/2 | Complete | 2026-10-15 |
| 3. Alliance Spaces & Scoped Query Engine | 3/3 | Complete | 2026-10-15 |
| 4. Discord Bot Integration, Notifications & Trust System | 0/2 | Not started | - |

### Phase 1: Core Foundation & Marketplace Engine
**Goal**: Deliver the relational database schema, TypeScript domain services, user authentication, Outgoing/Incoming contract creation, concurrency-safe single-claim locking, and bilateral status progression.
**Mode**: mvp
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, MKT-01, MKT-02, STAT-01, STAT-02, STAT-03, STAT-04, STAT-05, STAT-06, STAT-07
**UI hint**: no
**Success Criteria** (what must be TRUE):
  1. User can register with email, password, and Discord username, log in, and edit their WoA In-Game Player ID. [VERIFIED]
  2. Player can post Outgoing contract listings (aircraft available) and Incoming contract requests (aircraft needed). [VERIFIED]
  3. Concurrent claims on a single listing are serialized with row-level locks so only one counterparty claim can be active. [VERIFIED]
  4. Both parties can advance contract through in-game dispatch, in-game acceptance, and verified complete status. [VERIFIED]
**Plans**: 3 plans (3 completed)

Plans:
- [x] 01-01: Setup Node.js/TypeScript project, PostgreSQL schema, Drizzle ORM models, and seed airport codes.
- [x] 01-02: Implement email/password authentication, JWT session handling, and user profile management with Discord handle and WoA ID.
- [x] 01-03: Implement contract domain engine: Outgoing/Incoming posting, transactional claim locking (`SELECT FOR UPDATE`), and bilateral status state machine.

### Phase 2: React Web Marketplace & User Experience
**Goal**: Build a responsive React SPA frontend providing an interactive marketplace board, real-time filtering, posting forms, and contract tracking dashboards to drive website traffic.
**Mode**: mvp
**Depends on**: Phase 1
**Requirements**: MKT-03, MKT-04, MKT-05, MKT-06
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. Player can browse open contracts on a clean, responsive web interface.
  2. Player can filter listings in real time by airport code, aircraft class (A–F), contract type, and cargo vs passenger.
  3. Player can view full contract details, publisher profile, and live status progress.
  4. Authenticated users can post contracts and execute status actions ("Mark Dispatched", "Confirm Accepted") directly from the web UI.
**Plans**: 2 plans

Plans:
- [ ] 02-01: Scaffold Vite + React + Tailwind frontend, TanStack Query integration, authentication context, and navigation layout.
- [ ] 02-02: Build interactive marketplace board with debounced search, multi-attribute filter drawer, contract detail modal/page, and user dashboard.

### Phase 3: Alliance Spaces & Scoped Query Engine
**Goal**: Enable alliances to create private workspaces supporting assigned-airport and flexible models, enforce audience-scoped listing visibility, and run background workers for automated listing expiration and public escalation.
**Mode**: mvp
**Depends on**: Phase 2
**Requirements**: STAT-08, ALNC-01, ALNC-02, ALNC-03, ALNC-04, ALNC-05, ALNC-06, ALNC-07, ALNC-08
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. Alliance leaders can create a group with custom airport model (assigned, flexible, hybrid) and invite members via link.
  2. Four-tier RBAC (Owner, Admin, Member, Visitor) governs member permissions and workspace administration.
  3. Members can post `alliance_only` listings that are strictly hidden from non-members in database queries.
  4. Background worker (`pg-boss`) automatically escalates unclaimed private listings to public marketplace after configured delay and archives expired listings.
**Plans**: 3 plans

Plans:
- [x] 03-01: Implement Alliance data model, membership invite/approval flow, 4-tier RBAC, and assigned-airport registry.
- [x] 03-02: Implement audience-scoped query engine (`open` vs `alliance_only`), alliance web workspace, and `pg-boss` worker for listing expiration and escalation timers.
- [x] 03-03: Implement Discord-style Alliance Guest request protocol, 18-playable airport expansion, renewal flag, partial dispatch state, and direction-aware smart airport filtering.

### Phase 4: Discord Bot Integration, Notifications & Trust System
**Goal**: Integrate the discord.js bot sharing the in-process domain core for instant DM notifications, slash commands, and webhook channel broadcasts, alongside a bilateral reputation rating and moderation system.
**Mode**: mvp
**Depends on**: Phase 3
**Requirements**: DISC-01, DISC-02, DISC-03, DISC-04, DISC-05, DISC-06, REPU-01, REPU-02, REPU-03, REPU-04, REPU-05
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. Users receive automatic Discord DMs when their contracts are claimed, approved, dispatched, or completed.
  2. Players can run `/contract create`, `/contract find`, and `/contract status` in Discord servers with sub-3-second responses.
  3. Configured guild channels receive rich embed announcements for new public or alliance contracts.
  4. Bilateral completion triggers 1-click reputation rating, updates the user's Reputation Score, and provides reporting tools for disputed contracts.
**Plans**: 2 plans

Plans:
- [ ] 04-01: Setup discord.js client sharing the domain layer, implement DM notification dispatcher with error fallbacks, and deploy slash commands (`/contract create`, `/contract find`, `/contract status`).
- [ ] 04-02: Implement guild channel webhook broadcasts, mutual 1-click reputation rating system, user trust score calculations, and admin dispute moderation panel.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Core Foundation & Marketplace Engine | 3/3 | Complete | 2026-10-15 |
| 2. React Web Marketplace & User Experience | 2/2 | Complete | 2026-10-15 |
| 3. Alliance Spaces & Scoped Query Engine | 3/3 | Complete | 2026-10-15 |
| 4. Discord Bot Integration, Notifications & Trust System | 0/2 | Not started | - |

---
*Roadmap created: 2026-10-14*  
*Last updated: 2026-10-15 (Phase 3 Shipped)*
