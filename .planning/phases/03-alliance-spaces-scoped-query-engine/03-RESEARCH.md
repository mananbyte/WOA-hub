# Phase 03: Alliance Spaces & Scoped Query Engine - Technical Research

## Executive Summary
Phase 3 extends the core contract marketplace engine into a multi-tenant alliance system supporting private group workspaces, 4-tier Role-Based Access Control (RBAC), multi-hub airport registries, and automated background workers via `pg-boss`. Following the user's domain guidance and decisions locked in `03-CONTEXT.md`, alliances primarily operate as fleet *senders*, while community pilots and registered guests act as turnaround *hosts*. The database query engine enforces strict audience-scoping so `alliance_only` listings remain invisible to non-members until automatic escalation timers transition them to the public marketplace.

---

## 1. Relational Database Schema & Data Modeling

### 1.1 New PostgreSQL Tables (Drizzle ORM)

```typescript
// src/db/schema.ts extensions

export const airportModelEnum = pgEnum("airport_model", ["assigned", "flexible", "hybrid"]);
export const joinPolicyEnum = pgEnum("join_policy", ["open", "approval", "invite_only"]);
export const allianceRoleEnum = pgEnum("alliance_role", ["owner", "admin", "member", "guest"]);
export const membershipStatusEnum = pgEnum("membership_status", ["active", "pending", "rejected"]);
export const listingVisibilityEnum = pgEnum("listing_visibility", ["public", "alliance_only"]);

export const alliances = pgTable("alliances", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  logoUrl: varchar("logo_url", { length: 500 }),
  discordUrl: varchar("discord_url", { length: 255 }),
  airportModel: airportModelEnum("airport_model").default("flexible").notNull(),
  joinPolicy: joinPolicyEnum("join_policy").default("approval").notNull(),
  maxEscalationDelayHours: integer("max_escalation_delay_hours").default(24).notNull(),
  creatorId: uuid("creator_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const allianceMemberships = pgTable("alliance_memberships", {
  id: uuid("id").defaultRandom().primaryKey(),
  allianceId: uuid("alliance_id").references(() => alliances.id).notNull(),
  userId: uuid("userId").references(() => users.id).notNull(),
  role: allianceRoleEnum("role").default("member").notNull(),
  status: membershipStatusEnum("status").default("pending").notNull(),
  applicationNote: text("application_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("idx_unique_alliance_membership").on(table.allianceId, table.userId),
]);

export const allianceAssignedAirports = pgTable("alliance_assigned_airports", {
  id: uuid("id").defaultRandom().primaryKey(),
  allianceId: uuid("alliance_id").references(() => alliances.id).notNull(),
  userId: uuid("userId").references(() => users.id).notNull(),
  airportCode: varchar("airport_code", { length: 4 }).references(() => airports.code).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("idx_unique_alliance_user_airport").on(table.allianceId, table.userId, table.airportCode),
]);
```

### 1.2 Enhancements to `listings` Table
- `allianceId`: nullable UUID foreign key referencing `alliances.id`.
- `visibility`: `listingVisibilityEnum` ("public" | "alliance_only", default "public").
- `autoEscalateDelayHours`: nullable integer specifying the private escalation window.
- `escalatedAt`: nullable timestamp tracking when an alliance listing was cross-posted to the public marketplace.

### 1.3 Strict Constraints & Business Rules
- **Single Primary Alliance Rule (D-07):** A user can have `status = 'active'` with `role IN ('owner', 'admin', 'member')` in at most **one** alliance. A partial unique index on `alliance_memberships(user_id) WHERE role IN ('owner', 'admin', 'member') AND status = 'active'` enforces this rule at the database transaction boundary.
- **Multiple Guest Affiliations (D-07):** A user can have `role = 'guest'` in unlimited alliances.
- **Max 3 Airport Assignments (D-01):** The assignment service verifies `count(assigned_airports) < 3` before inserting a new airport claim for a member.

---

## 2. Background Worker Architecture (`pg-boss`)

### 2.1 Why `pg-boss`
- **Zero Redis Dependency:** As decided in `STACK.md`, `pg-boss` runs natively on the existing PostgreSQL 16 container, eliminating operational overhead and multi-container sync failure modes.
- **ACID Guarantee:** Job dispatches participate in PostgreSQL transactions alongside listing creations.
- **Job Handlers Required for Phase 3:**
  1. `escalate-alliance-listing`: Scheduled on listing creation if `visibility = 'alliance_only'` and `autoEscalateDelayHours` is configured. Transitions `visibility` from `alliance_only` to `public` if still unclaimed.
  2. `expire-stale-listings`: Cron job running every 15 minutes checking `expires_at <= NOW() AND status = 'open'`. Transitions listing status to `expired`.
  3. `cancel-unconfirmed-claims`: Checks claims older than 4 hours awaiting creator approval, transitions to `cancelled`, and returns listing to `open`.

### 2.2 Worker Initialization Lifecycle
```typescript
// src/jobs/worker.ts
import PgBoss from "pg-boss";

export const boss = new PgBoss(process.env.DATABASE_URL!);

export async function initBackgroundWorkers() {
  await boss.start();
  
  // Register delayed escalation job
  await boss.work("escalate-alliance-listing", async ([job]) => {
    const { listingId } = job.data as { listingId: string };
    await AllianceService.escalateListingToPublic(listingId);
  });

  // Schedule recurring listing cleanup
  await boss.schedule("cleanup-stale-listings", "*/15 * * * *", {});
  await boss.work("cleanup-stale-listings", async () => {
    await ContractService.archiveExpiredListings();
  });
}
```

---

## 3. Scoped Query Engine & Authorization

### 3.1 Listing Query Matrix

| Request Context | Visible Listings |
|---|---|
| Public Discovery (`/marketplace`) | `visibility = 'public' AND status = 'open'` |
| Public Marketplace (Logged-in member) | `(visibility = 'public' OR (alliance_id IN (user_alliances) AND visibility = 'alliance_only'))` |
| Alliance Deck (`/alliances/:slug/deck`) | `alliance_id = :allianceId` (All member requests) |
| Route Partner Ping | Contracts where destination airport matches partner's registered hubs are flagged `partner_priority = true` |

### 3.2 4-Tier RBAC Hierarchy

| Role | Permissions |
|---|---|
| **Owner** | Full alliance control: transfer ownership, change slug/name/model, appoint Admins, configure escalation ceiling, disband group. |
| **Admin** | Approve/reject membership applications, remove members, manage assigned airports, moderate listings. |
| **Member** | Post `alliance_only` contracts, claim alliance listings, register up to 3 operated hubs. |
| **Guest** | View alliance recruitment profile, receive host requests for alliance planes, claim cross-posted contracts. |

---

## 4. Route Coverage Matrix Calculation

To render the visual airport route matrix on `/alliances/:slug/deck`:
1. Retrieve all 10 official WoA airports from database: `PRG, INN, BRI, SAN, IAD, MCT, NGO, LEJ, SXM, HKG`.
2. Query `allianceAssignedAirports` for the alliance.
3. Group pilots by airport code:
   ```typescript
   interface HubCoverage {
     code: string;
     pilots: { id: string; discordUsername: string }[];
     outgoingFlightCount: number;
     incomingNeedCount: number;
     status: "covered" | "unassigned" | "bottleneck";
   }
   ```
4. Flag "route gaps" where outgoing flights from alliance members lack a destination partner pilot, encouraging guest host recruitment!

---

## 5. Web Frontend Multi-Page Architecture

1. **`/alliances` (Alliance Directory)**:
   - Filter chips: All Models, Assigned Hubs, Flexible Exchange, Hybrid, Open Recruitment.
   - Alliance card: Logo, Name, Member Count, Hub Model Badge (`#141A1F` / `#1240C7`), Covered Airports pills.
   - Primary Action: "REGISTER AN ALLIANCE" pill button.

2. **`/alliances/:slug` (Public Lounge & Recruitment Dossier)**:
   - Hero header with alliance banner, description, Discord server link, and leader dossier.
   - Operating Model explanation box (e.g. "Assigned Airport Model: Members manage designated hubs").
   - Airport Coverage showcase (10 hubs with assigned pilot avatars).
   - "APPLY TO JOIN ALLIANCE" button (if not in an alliance) or "BECOME GUEST HOST" button.

3. **`/alliances/:slug/deck` (Private Operations Deck)**:
   - Tab 1: **Internal Flight Deck** — Member requests (`alliance_only` listings) with priority partner tags.
   - Tab 2: **Interactive Route Matrix** — 10-hub coverage grid highlighting covered routes and route gaps.
   - Tab 3: **Pilot Roster & Hub Assignments** — Member list with role pills (Owner, Admin, Member, Guest) and airport assignment badges.
   - Tab 4: **Admin Settings** (Admin/Owner only) — Escalate delay slider (2h–24h), Join Policy toggle, Invite Link generator.

---

## 6. Execution Plan Breakdown

Phase 3 is organized into 2 distinct execution plans:

- **Plan 03-01**: Alliance Core Models, Migrations, RBAC Service, Membership Join/Invite Flow, and Route Matrix Registry.
- **Plan 03-02**: Scoped Query Engine, `pg-boss` Background Worker for Auto-Escalation & Expiration, and Dedicated Alliance Web Pages (`/alliances`, `/alliances/:slug`, `/alliances/:slug/deck`).
