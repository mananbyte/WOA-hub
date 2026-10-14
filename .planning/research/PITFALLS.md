# Pitfalls Research

**Domain:** Community Marketplace & Discord Bot Platforms
**Researched:** 2026-10-14
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Race Conditions on Simultaneous Contract Claims

**What goes wrong:**
Two players click "Claim" on an open high-reward aircraft contract at the exact same millisecond. Both requests succeed, assigning two recipients to a single flight. In-game, only one flight can be dispatched, resulting in anger, confusion, and broken contract state.

**Why it happens:**
Naive implementation using separate `SELECT` followed by `UPDATE` queries without database transactions or row-level locking.

**How to avoid:**
1. Execute claim operations inside a strict PostgreSQL transaction using `SELECT ... FOR UPDATE` on the listing row.
2. Add a database-level partial unique index:
   ```sql
   CREATE UNIQUE INDEX idx_single_active_claim 
   ON listing_claims (listing_id) 
   WHERE status IN ('pending', 'accepted', 'in_progress');
   ```
3. Return HTTP 409 Conflict if the row is already locked or status is no longer `open`.

**Warning signs:**
- Duplicate claim records appearing in test environments under concurrent load tests.
- Users complaining that a contract they claimed was awarded to someone else.

**Phase to address:**
Phase 2: Domain Engine & Contract State Machine.

---

### Pitfall 2: Discord 3,000ms Interaction Timeout & Blocked Gateway

**What goes wrong:**
When a user issues `/contract create` or `/contract find` via Discord, the bot attempts to make slow external HTTP calls or heavy unindexed database queries. If the response takes longer than 3.0 seconds, Discord fails the interaction with "This interaction failed" or "The application did not respond".

**Why it happens:**
Discord has a hard 3-second deadline for initial interaction acknowledgments. Developers doing heavy logic before replying or making round-trip HTTP hops between bot and API run out of time.

**How to avoid:**
1. Direct domain access: Have the Discord bot call the TypeScript domain service in-process rather than making HTTP round-trips over the network.
2. Immediate deferral: Always acknowledge upfront for any operation requiring I/O:
   ```typescript
   await interaction.deferReply({ ephemeral: true });
   // Execute domain logic...
   await interaction.editReply({ ... });
   ```
3. Add composite indexes on query fields (`airport_code`, `status`, `audience`).

**Warning signs:**
- Sporadic "Application did not respond" errors during Discord testing.
- Bot event loop latency spikes during bursts of channel messages.

**Phase to address:**
Phase 5: Discord Bot Integration.

---

### Pitfall 3: Discord Gateway Privileged Intent Bloat & DM Failures

**What goes wrong:**
1. The bot attempts to send DMs to players whose Discord privacy settings disallow direct messages from server members, causing unhandled promise rejections (`50007: Cannot send messages to this user`).
2. Developers enable unnecessary Gateway Intents (like `MessageContent` or `GuildMembers`), requiring manual Discord verification once the bot reaches 100 servers.

**Why it happens:**
Assuming every Discord user can be DM'd by default, and requesting broad intents instead of using pure Slash Commands and Interactions.

**How to avoid:**
1. Wrap all DM dispatch calls in resilient try/catch handlers:
   ```typescript
   try {
     await user.send(embed);
   } catch (err: any) {
     if (err.code === 50007) {
       // Log notification fallback; user will see notification on web dashboard
       await recordInAppNotification(userId, notificationPayload);
     }
   }
   ```
2. Rely strictly on Application Slash Commands and Interaction components, which require **zero privileged gateway intents**.

**Warning signs:**
- Unhandled Promise Rejections crashing the Node.js process when a player with closed DMs is notified.
- Bot rejected or blocked during Discord verification.

**Phase to address:**
Phase 5: Discord Bot Integration.

---

### Pitfall 4: Data Leakage Between Private Alliance Scopes & Public Marketplace

**What goes wrong:**
A private alliance-only contract (e.g. internal route coordination with proprietary alliance liveries) shows up in the public marketplace feed or global Discord request channel.

**Why it happens:**
Filtering logic performed in-memory on the application tier rather than strictly enforced at the SQL database query level. Missing authorization checks on direct `/api/listings/:id` REST endpoints.

**How to avoid:**
1. Enforce audience scoping directly in SQL using parameterized queries with explicit user context:
   ```sql
   WHERE audience = 'open' 
      OR (audience = 'alliance_only' AND group_id IN (
            SELECT group_id FROM group_memberships WHERE user_id = $current_user_id
         ))
   ```
2. Unit and integration tests specifically asserting that unauthenticated or non-member sessions receive 403/404 when querying private listings.

**Warning signs:**
- Alliance leaders reporting that public players are applying to internal alliance listings.
- API endpoints returning listings without verifying caller's group membership.

**Phase to address:**
Phase 4: Alliance Spaces & Scoped Query Engine.

---

### Pitfall 5: Ghost Listings, Inactive Hosts & Bilateral Deadlock

**What goes wrong:**
A player posts a contract or accepts one, but then closes the World of Airports app and forgets about it. The counterparty is stuck waiting indefinitely, unable to release their aircraft slot or progress their game.

**Why it happens:**
Absence of automated time-to-live (TTL) expiration and failure to provide an explicit timeout cancellation mechanism.

**How to avoid:**
1. Every listing and claim has an explicit expiration timestamp (default: 4 hours for active claims; 24 hours for open postings).
2. A background worker (via `pg-boss`) scans every 15 minutes:
   - Notifies users 30 minutes before expiration.
   - Automatically marks expired claims as `CANCELLED_TIMEOUT` and returns the listing to `OPEN` status.
3. Allow either party to cancel with a mutual reason if the counterparty has not reported in-game progress within 60 minutes.

**Warning signs:**
- Marketplace cluttered with listings created days ago.
- High ratio of `in_progress` contracts that never reach `completed`.

**Phase to address:**
Phase 2: Domain Engine & Contract State Machine & Phase 4: Escalation Worker.

---

### Pitfall 6: Trust Breakdown & Fake Completion Gaming

**What goes wrong:**
Because there is no official game API, malicious players create dummy accounts to fake completions and inflate their reputation scores, or accept contracts and immediately mark them "Completed" without ever sending planes in WoA.

**Why it happens:**
Relying on single-party self-reporting instead of requiring bilateral acknowledgment.

**How to avoid:**
1. **Bilateral Confirmation**: Both the sender (who dispatches the aircraft) and the receiver (who handles the aircraft turnaround) must independently confirm the action. A contract is only marked `COMPLETED` when both parties confirm.
2. Rate-limit contract creations to 5 per user per day for new accounts.
3. Require account email verification and a valid WoA in-game player ID format.
4. Provide a 1-click "Report Non-Delivery" button that immediately flags the transaction for administrative review and freezes the accused player's ability to claim new contracts.

**Warning signs:**
- A single user completing dozens of contracts within minutes.
- Mismatched bilateral confirmation timestamps.

**Phase to address:**
Phase 6: Trust, Reputation, Moderation & Rate Limiting.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| **Hardcoding airport codes in frontend** | Avoids creating an airport database table. | Cannot add new airports when WoA updates; inconsistent codes break search. | **Never**. Create a standardized `airports` lookup seed (IAD, PRG, INN, HKG, SXM, NGO, etc.). |
| **Storing Discord bot token in source control** | Fast local setup. | Immediate compromise of the Discord bot by GitHub scrapers. | **Never**. Enforce `.env` with validation via Zod. |
| **Synchronous HTTP calls between bot and API** | Separates codebases completely. | High latency, network failure points, breaks Discord 3s timeout. | **Never** for 2–3 devs; use Modular Monolith. |
| **In-memory store for session caching** | Skips database sessions. | Sessions lost on every server restart or container restart. | **Acceptable in early MVP** if using signed JWTs. |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| **Missing composite indexes on marketplace filters** | Marketplace search queries take 500ms+ instead of <10ms. | Add compound index: `CREATE INDEX idx_listings_search ON listings(status, audience, airport_code, aircraft_class);` | > 1,000 active listings |
| **Unbounded Discord Gateway Event Listeners** | Memory leak warnings in Node.js process; bot crashes every 48 hours. | Always unregister or use `.once()` for ephemeral interaction events; use central dispatcher. | > 50 Discord guilds |
| **Full table scans on audit logs** | Admin dashboard takes seconds to load user history. | Partition or index `status_events` on `(listing_id, created_at)`. | > 10,000 completed contracts |

---

## "Looks Done But Isn't" Checklist

- [ ] **Contract Claiming:** Often missing concurrency protection — verify two simultaneous POST requests cannot both claim the same listing.
- [ ] **Discord Slash Commands:** Often missing error handling — verify bot handles closed user DMs gracefully without throwing uncaught exceptions.
- [ ] **Alliance Privacy:** Often missing API authorization — verify calling `GET /api/listings/:id` for an internal alliance contract returns 403 Forbidden for non-members.
- [ ] **Contract Expiry:** Often missing cleanup worker — verify listings created 48 hours ago are automatically expired and archived.
- [ ] **Bilateral Flow:** Often missing counterparty confirmation — verify a contract cannot be marked `COMPLETED` by the sender alone without the receiver's acknowledgment.

---

## Sources
- Discord Developer Documentation & Discord API Community Post-Mortems
- PostgreSQL Explicit Locking Documentation (`SELECT FOR UPDATE`)
- World of Airports Community Forum Disruption Reports

---
*Pitfalls research for: WoA Contract Hub*  
*Researched: 2026-10-14*
