# Phase 1: Core Foundation & Marketplace Engine - Research

**Researched:** 2026-10-14  
**Domain:** Node.js/TypeScript REST API, PostgreSQL + Drizzle ORM, Concurrency Locking, State Machine  
**Confidence:** HIGH  

<user_constraints>
## User Constraints (from PROJECT.md & Initial Decisions)

### Locked Decisions
- **Architecture**: Modular monolith with shared TypeScript domain services.
- **Backend Stack**: Node.js 22 LTS, Express.js 4.21, TypeScript 5.6, PostgreSQL 16 with Drizzle ORM.
- **Authentication**: Email + password signup with bcryptjs; Discord username required at registration; JWT-based authenticated session.
- **WoA Identity**: In-game Player ID stored on user profile for in-game flight targeting.
- **Marketplace Mechanics**: Both Outgoing ("I have planes") and Incoming ("I need planes") contracts.
- **Concurrency & Locking**: Pessimistic row locking (`SELECT ... FOR UPDATE`) and unique partial DB index on active claims to prevent duplicate claims.
- **Bilateral Status Progression**: Strict sequence: `OPEN` -> `CLAIMED` -> `IN_PROGRESS` (creator approval) -> `DISPATCHED` (sender reports) -> `ACCEPTED` (receiver reports) -> `COMPLETED`.
- **Cancellation**: Either party can cancel with mandatory reason.

### the agent's Discretion
- Exact table schema definitions and Drizzle migration setups.
- Password hashing rounds (10–12 bcrypt salt rounds).
- JWT expiration window (7 days).
- HTTP REST route structure and error response envelopes.

### Deferred Ideas (OUT OF SCOPE)
- Alliance spaces and scoping (Phase 3).
- React UI frontend (Phase 2).
- Discord bot gateway & slash commands (Phase 4).
</user_constraints>

<architectural_responsibility_map>
## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| User Auth & Sessions (AUTH-01..03) | API/Backend (Express + JWT) | Database (Postgres `users`) | Secure password verification, token generation, and persistence. |
| Player Profile & WoA ID (AUTH-04..05) | API/Backend | Database | Profile updates and sanitized public profile queries. |
| Contract Creation Outgoing/Incoming (MKT-01..02) | API/Backend | Database (Postgres `listings`) | Schema validation (Zod) and persistence. |
| Concurrency-Safe Claiming (STAT-01..03) | Database/Storage (`SELECT FOR UPDATE`) | API/Backend | Concurrency serialization MUST be enforced at the database level. |
| Bilateral Status Progression (STAT-04..07) | API/Backend (Domain State Machine) | Database (`status_events`) | State transition guards and append-only audit trail. |
</architectural_responsibility_map>

<research_summary>
## Summary

Phase 1 establishes the rock-solid foundation of the WoA Contract Hub. It implements the database models using Drizzle ORM on PostgreSQL 16, implements secure email/password authentication (storing Discord handles and WoA Player IDs), exposes RESTful API endpoints for posting Outgoing/Incoming contracts, and handles single-claim locking and bilateral status progression.

By solving claim concurrency with row-level locking (`SELECT ... FOR UPDATE`) and partial unique indexes in Phase 1, we eliminate the #1 risk identified in community marketplace platforms: race conditions that leave two players believing they claimed the same flight.

**Primary recommendation:** Build domain services with Drizzle transactions first, write automated integration tests covering concurrent claims and status progression, then expose Express controllers.
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `express` | ^4.21.0 | Web API routing & middleware | Simple, reliable, zero-overhead REST framework. |
| `drizzle-orm` | ^0.35.0 | TypeScript SQL ORM | Zero-binary, lightweight, produces explicit SQL with full support for `forUpdate()`. |
| `pg` | ^8.13.0 | PostgreSQL Client | De facto driver for Node.js PostgreSQL connections. |
| `zod` | ^3.23.0 | Schema validation | Validates incoming payloads and infers TypeScript types. |
| `jsonwebtoken` | ^9.0.2 | Session Auth | Stateless, standard JWT bearer token authentication. |
| `bcryptjs` | ^2.4.3 | Password Hashing | Battle-tested secure password hashing. |

### Supporting & Dev Tools
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `drizzle-kit` | ^0.26.0 | Migrations & schema push | Local migrations and schema management. |
| `tsx` | ^4.19.0 | Fast TS Execution | Running scripts and development server. |
| `dotenv` | ^16.4.0 | Environment Variables | Loading `.env` config. |
| `cors` | ^2.8.5 | Cross-Origin Resource Sharing | Allowing web client access. |
| `pino` | ^9.4.0 | Structured Logging | JSON logging for HTTP requests and DB queries. |

### Installation Command
```bash
npm init -y
npm install express pg drizzle-orm zod jsonwebtoken bcryptjs dotenv cors pino
npm install -D typescript @types/node @types/express @types/pg @types/jsonwebtoken @types/bcryptjs @types/cors tsx drizzle-kit
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Database Entities for Phase 1
1. **`users`**:
   - `id`: UUID (Primary Key)
   - `email`: VARCHAR(255) UNIQUE NOT NULL
   - `password_hash`: VARCHAR(255) NOT NULL
   - `discord_username`: VARCHAR(100) NOT NULL
   - `woa_player_id`: VARCHAR(100)
   - `reputation_score`: NUMERIC(4, 2) DEFAULT 5.00
   - `created_at`, `updated_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

2. **`airports`** (Seed reference):
   - `code`: VARCHAR(4) PRIMARY KEY (e.g., 'PRG', 'IAD', 'INN', 'HKG', 'SXM', 'NGO', 'SAN')
   - `name`: VARCHAR(100) NOT NULL
   - `region`: VARCHAR(50) NOT NULL

3. **`listings`**:
   - `id`: UUID (Primary Key)
   - `creator_id`: UUID REFERENCES `users(id)`
   - `contract_type`: ENUM ('outgoing', 'incoming')
   - `status`: ENUM ('open', 'claimed', 'in_progress', 'completed', 'cancelled') DEFAULT 'open'
   - `aircraft_class`: ENUM ('A', 'B', 'C', 'D', 'E', 'F')
   - `is_cargo`: BOOLEAN DEFAULT FALSE
   - `origin_airport`: VARCHAR(4) REFERENCES `airports(code)`
   - `destination_airport`: VARCHAR(4) REFERENCES `airports(code)`
   - `notes`: TEXT
   - `expires_at`: TIMESTAMP WITH TIME ZONE NOT NULL
   - `created_at`, `updated_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

4. **`listing_claims`**:
   - `id`: UUID (Primary Key)
   - `listing_id`: UUID REFERENCES `listings(id)`
   - `claimant_id`: UUID REFERENCES `users(id)`
   - `status`: ENUM ('pending', 'accepted', 'rejected', 'cancelled') DEFAULT 'pending'
   - `created_at`, `updated_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

5. **`status_events`** (Immutable Audit Log):
   - `id`: UUID (Primary Key)
   - `listing_id`: UUID REFERENCES `listings(id)`
   - `actor_id`: UUID REFERENCES `users(id)`
   - `from_status`: VARCHAR(50)
   - `to_status`: VARCHAR(50)
   - `event_type`: VARCHAR(50) ('claimed', 'approved', 'dispatched_woa', 'accepted_woa', 'completed', 'cancelled')
   - `notes`: TEXT
   - `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### Partial Unique Index for Single Claim Concurrency
```sql
CREATE UNIQUE INDEX idx_single_active_claim 
ON listing_claims (listing_id) 
WHERE status IN ('pending', 'accepted');
```
</architecture_patterns>

<pitfalls_and_gotchas>
## Pitfalls and Gotchas

1. **Race Condition on Claim**: Never use a standalone `SELECT` then `UPDATE`. Always wrap the claim in a database transaction with `FOR UPDATE` on the listing row.
2. **Missing WoA Airport Codes**: Do not allow arbitrary freeform text for airports; seed official WoA airports (PRG, INN, BRI, SAN, IAD, MCT, NGO, LEJ, SXM, HKG, etc.) to ensure reliable filtering and search.
3. **Invalid State Machine Transitions**: Prevent skipping states (e.g., going straight from `OPEN` to `COMPLETED`). Transitions must strictly enforce prerequisites.
4. **JWT Security**: Keep access token payload minimal (`{ userId, email, discordUsername }`). Never store password hashes in JWT.
</pitfalls_and_gotchas>

<schema_push_requirement>
**[BLOCKING] Schema Push Required**
Phase 1 introduces the complete PostgreSQL schema in `src/db/schema.ts`.
- ORM: Drizzle ORM
- Push Command: `npx drizzle-kit push` (or `npx drizzle-kit generate` + migrate script)
- Verification: Schema tables and indexes verified in local PostgreSQL instance.
</schema_push_requirement>
