# Feature Research

**Domain:** Gaming Community Contract Marketplace & Discord Bot Platform
**Researched:** 2026-10-14
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features players and alliance managers take for granted. Missing these will cause immediate bounce or abandonment back to Discord chats.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **User Sign-up & Profiles** | Identifies the player; links their in-game WoA ID and Discord username for notifications. | LOW | Email/Password auth; validation for Discord handle format and WoA ID. |
| **Outgoing Contract Posting** | Player says "I have X aircraft of class Y ready to fly to destination airport Z". | MEDIUM | Form with validation: airport code (IATA/ICAO), class (A/B/C/D/E/F), cargo vs pax, availability timeframe. |
| **Incoming Contract Posting** | Player says "I operate Airport Z and need aircraft of class Y sent to me". | MEDIUM | Mirror of outgoing: allows players who need turnarounds to request inbound traffic. |
| **Marketplace Search & Filters** | Instant filtering by destination airport, aircraft class, passenger/cargo, and region. | MEDIUM | Debounced search and multi-select filtering with URL state synchronization. |
| **Contract Claim / Application** | A counterparty applies for or claims an open contract listing. | MEDIUM | Must handle race conditions: only 1 active claim allowed per single-slot listing. |
| **Bilateral Status Progression** | Step-by-step reporting: Claimed → In-Game Contract Sent → In-Game Contract Accepted → Aircraft Dispatched → Completed. | HIGH | Clear status badges, action buttons ("Mark Dispatched", "Confirm Accepted"), and cancel safeguards. |
| **Discord DM Notifications** | Bot alerts parties when their listing is claimed, accepted, dispatched, or canceled. | MEDIUM | Uses discord.js REST client to send direct messages to the player's stored Discord handle. |
| **Alliance / Group Creation & Workspaces** | Group leaders register their alliance, select airport model (assigned, flexible, hybrid), and manage members. | HIGH | Multi-tenant RBAC: Owner, Admin, Member, Visitor. Private group workspace view. |
| **Scoped Listing Visibility** | Listings can be marked `open` (public marketplace) or `alliance_only` (internal group board). | MEDIUM | Clean permission enforcement in database queries so members see combined or filtered feeds. |

---

### Differentiators (Competitive Advantage)

Features that clearly outperform informal forum threads and Google forms, creating defensible network effects.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Discord Slash Command Integration (`/contract`, `/alliance`)** | Users can post, find, and accept contracts without ever leaving their favorite Discord channels. | HIGH | Slash commands execute directly against the shared domain layer, offering Discord buttons and modals. |
| **Configurable Alliance Escalation Window** | Alliance listings stay internal for a set time (e.g. 2 hours), and automatically or manually escalate to the public marketplace if unclaimed. | MEDIUM | Solves liquidity problem: alliances get first dibs without leaving requests stuck if internal members are inactive. |
| **Reputation & Completion Rating System** | Quantifiable trust score based on verified contract completions and mutual 1-click ratings. | MEDIUM | Eliminates ghosting and unreliable hosts that plague forum threads. |
| **Assigned Airport Tracker for Hub Alliances** | Visual dashboard showing which alliance airports have active managers and where route gaps exist. | MEDIUM | Tailored specifically to major WoA alliances (like IAG, Flexi) replacing static Google Sheets. |
| **Discord Channel Feed Webhooks** | Automated, rich embeds broadcast into configured guild channels (e.g. `#woa-requests`, `#alliance-feed`). | LOW | Drives live engagement into alliance Discord servers. |

---

### Anti-Features (Deliberately NOT to Build in v1)

Features that seem appealing on the surface but create fatal friction, technical debt, or scope creep.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Real-Money / Paid Subscriptions** | Revenue generation. | Premature; kills early community adoption in a hobby gaming space; violates user trust before network effects exist. | **100% Free Growth-First MVP** (Monetization evaluated after establishing user base). |
| **In-Platform Direct Chat System** | Players want to chat about flight timings. | Discord already exists and excels at real-time messaging; building web chat wastes weeks and requires heavy moderation. | **Deep-link to Discord profile or in-game player ID**. |
| **Game API Integration Claim** | Automated flight tracking without manual reporting. | World of Airports (Flyboys Games) provides **no public API**. Attempting to reverse engineer mobile packets risks game bans. | **Audited bilateral self-reporting with cancellation logs**. |
| **Native iOS/Android App** | Mobile convenience. | High build and app-store maintenance cost for 2–3 devs. | **Responsive, mobile-optimized PWA-friendly React Web SPA**. |
| **Complex Algorithmic Auto-Matching** | Automated AI matching between incoming and outgoing contracts. | Users have subtle preferences (liveries, exact play sessions); premature automation feels robotic. | **Fast, rich filter and search board with 1-click claim**. |

---

## Feature Dependencies

```
[User Auth & Profile]
    └──requires──> [WoA ID & Discord Username]
                       └──requires──> [Marketplace Post/Claim Engine]
                                          ├──requires──> [Bilateral Status State Machine]
                                          │                  └──requires──> [Reputation Ledger]
                                          ├──requires──> [Alliance Workspace & RBAC]
                                          │                  └──requires──> [Listing Visibility Scoping]
                                          │                                     └──requires──> [Escalation Worker]
                                          └──requires──> [Discord Bot Notification Engine]
                                                             └──requires──> [Discord Slash Commands]
```

### Dependency Notes
- **Marketplace Post/Claim Engine requires Profiles**: A contract cannot be initiated or assigned without identifiable source and destination identities.
- **Bilateral Status State Machine requires Claim Engine**: Status transitions (`dispatched`, `accepted`, `completed`) are valid only on locked, accepted claims.
- **Alliance Workspace requires RBAC**: Listing scope security relies on authenticated membership roles (`owner`, `admin`, `member`).
- **Discord Bot requires Domain Services**: The bot interacts directly with the contract service to avoid diverging business logic.

---

## MVP Definition (v1 Launch Scope)

### Launch With (v1)
- [ ] User authentication with email/password + Discord username + WoA In-Game ID.
- [ ] Outgoing & Incoming contract posting with full aircraft class and airport taxonomy.
- [ ] Centralized marketplace board with live search and multi-attribute filters.
- [ ] Single-claim locking mechanism with creator approval.
- [ ] Bilateral manual status tracking (`Open` → `Claimed` → `Dispatched` → `Accepted` → `Completed` / `Cancelled`).
- [ ] User profile with completed contract history and reputation rating.
- [ ] Alliance creation, role assignments (`Owner`, `Admin`, `Member`), and private group boards.
- [ ] Alliance escalation setting (optional transition of stale private listings to public marketplace).
- [ ] Discord bot with DM alerts on contract events and basic slash commands (`/contract create`, `/contract find`, `/contract status`).
- [ ] Configurable Discord webhook feeds for alliance and public request channels.

### Add After Validation (v1.x)
- [ ] Assigned-airport interactive map for hub-style alliances.
- [ ] Discord interactive action buttons directly on channel request embeds.
- [ ] Badges and platform milestones (e.g., "100 Flights Hosted", "Reliable Dispatcher").
- [ ] Moderator dispute review queue with audit logs.

### Future Consideration (v2+)
- [ ] Alliance vs Alliance community leaderboards.
- [ ] Official Flyboys Games API partner integration (if developer access ever opens).
- [ ] Discord Premium Apps subscription tier for advanced alliance management metrics.

---

## Sources
- Flyboys Games Official World of Airports Forum Guides (Beginner & Connection Mechanics)
- World of Airports Community Alliances (IAG Hub Model, Flexi Alliance Announce Model)
- Discord Developer Portal (Interactions, Components, and Application Commands)

---
*Feature research for: WoA Contract Hub*  
*Researched: 2026-10-14*
