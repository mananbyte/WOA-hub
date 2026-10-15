# Requirements: WoA Contract Hub

**Defined:** 2026-10-14  
**Core Value:** Any WoA player — new, mid-level, or veteran — can find or offer a flight contract in minutes, without needing Discord contacts, alliance membership, or manual forum hunting.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication & Profiles

- [x] **AUTH-01**: User can sign up with email and password
- [x] **AUTH-02**: User must provide their Discord username during registration (stored for bot communications)
- [x] **AUTH-03**: User can log in with email/password and retain a persistent authenticated session
- [x] **AUTH-04**: User can set and edit their WoA in-game Player ID on their profile
- [x] **AUTH-05**: User can view other players' profiles with their WoA ID, Discord username, and activity summary

### Contract Marketplace (Posting & Discovery)

- [x] **MKT-01**: Player can post an Outgoing contract listing (available aircraft, aircraft class A–F, passenger/cargo, preferred destination airport(s), availability timeframe, notes)
- [x] **MKT-02**: Player can post an Incoming contract request (target airport operated by player, desired aircraft class, availability timeframe, notes)
- [x] **MKT-03**: Player can browse an interactive marketplace feed showing all active open contracts
- [x] **MKT-04**: Player can filter listings in real time by airport code (IATA/ICAO), aircraft class (A–F), contract type (outgoing/incoming), and cargo vs passenger
- [x] **MKT-05**: Player can search listings by keyword or airport name
- [x] **MKT-06**: Player can view detailed contract view with full terms, publisher stats, and status history

### Contract Claim & Bilateral Lifecycle

- [x] **STAT-01**: Counterparty player can apply to or claim an open contract listing
- [x] **STAT-02**: System enforces concurrency protection so that only one claim can be active per listing slot
- [x] **STAT-03**: Listing creator can approve or accept the claimant's request
- [x] **STAT-04**: Source player can mark the contract as "Dispatched in WoA" once they have sent the aircraft in-game
- [x] **STAT-05**: Destination player can mark the contract as "Accepted in WoA" once they have received and accepted the contract in-game
- [x] **STAT-06**: Contract reaches "Completed" state upon bilateral confirmation from both parties
- [x] **STAT-07**: Either party can cancel an active contract with a mandatory reason before completion
- [x] **STAT-08**: Background worker automatically expires stale unclaimed listings after 24 hours and unconfirmed claims after 4 hours

### Alliance Spaces & Multi-Model Workspaces

- [x] **ALNC-01**: Alliance leader can register a new alliance group (name, slug, description, airport model: assigned/flexible/hybrid, privacy: open/approval/invite-only)
- [x] **ALNC-02**: Alliance has a dedicated public profile page (`/alliances/:slug`) and private member workspace
- [x] **ALNC-03**: Group leader/admins can invite members via shareable link or approve incoming join requests
- [x] **ALNC-04**: System enforces 4-tier Role-Based Access Control: Owner, Admin, Member, Visitor
- [x] **ALNC-05**: Alliance members can post listings scoped as `alliance_only` visible solely to group members
- [x] **ALNC-06**: For Assigned-Airport alliances, members can register their assigned airport and filter for designated route partners
- [x] **ALNC-07**: Alliance leader can configure optional escalation rules: private listings automatically escalate to the public marketplace after a set delay (e.g. 2 hours)
- [x] **ALNC-08**: Alliance dashboard displays group activity metrics: active listings, unfilled requests, member participation, and route coverage

### Discord Bot & Notifications

- [ ] **DISC-01**: Discord bot sends automated DM notifications to users when their contract is claimed, approved, dispatched, or completed
- [ ] **DISC-02**: Users can run `/contract create` slash command to post an outgoing or incoming contract via Discord modal/command
- [ ] **DISC-03**: Users can run `/contract find` slash command with airport/class parameters to view matching open listings directly in Discord
- [ ] **DISC-04**: Users can run `/contract status` slash command to see a summary of their active contracts and pending actions
- [ ] **DISC-05**: Alliance administrators can configure a Discord guild channel where the bot broadcasts new alliance contract announcements
- [ ] **DISC-06**: Public channel webhook broadcasting new open marketplace requests into configured community Discord channels

### Reputation, Trust & Safety

- [x] **REPU-01**: System calculates and displays a Reputation Score on user profiles based on contract completion rate and total completed flights
- [ ] **REPU-02**: Both parties can submit a 1-click rating (thumbs up / thumbs down + optional feedback note) upon contract completion
- [ ] **REPU-03**: Users can report a non-delivered or fraudulent contract, which logs an audit entry and flags the counterparty
- [ ] **REPU-04**: System enforces daily contract creation rate limits (e.g., max 5 per day for new accounts) to prevent spam flooding
- [ ] **REPU-05**: Platform administrators have access to a moderation panel to view reported disputes and suspend abusive accounts

---

## v2 Requirements

Deferred to future releases.

### Advanced Matching & Mobile
- **MATCH-01**: Algorithmic smart-matching suggesting reciprocal flight routes between online players
- **PWA-01**: Progressive Web App install prompt with Web Push Notifications for browsers
- **DISC-07**: Discord interactive buttons on channel embeds to 1-click claim contracts without opening web links

### Community & Gamification
- **GAME-01**: Gamification milestone badges ("Century Host", "Master Dispatcher", "Hub Operator")
- **LEAD-01**: Alliance vs Alliance monthly flight coordination leaderboard
- **AUTO-01**: Automated in-game verification via Flyboys partner API (if an official API is ever released)

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| **Real-Money Paid Subscriptions / Fees** | Strategy prioritizes community growth and liquidity over premature monetization. |
| **In-Platform Direct Web Chat** | Discord already serves as the real-time community chat hub; building an in-app chat creates redundant moderation burden. |
| **Native iOS / Android App** | Unnecessary development and maintenance overhead for a 2–3 person team; responsive web SPA covers mobile users. |
| **Automated Game Reverse-Engineering** | Scraping or sniffing WoA mobile app network packets violates Flyboys Games TOS and risks game bans. |
| **Alliance Member Voting Governance** | High complexity for MVP; simple Owner/Admin approval model covers 99% of alliance needs. |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| AUTH-04 | Phase 1 | Complete |
| AUTH-05 | Phase 1 | Complete |
| MKT-01 | Phase 1 | Complete |
| MKT-02 | Phase 1 | Complete |
| MKT-03 | Phase 2 | Complete |
| MKT-04 | Phase 2 | Complete |
| MKT-05 | Phase 2 | Complete |
| MKT-06 | Phase 2 | Complete |
| STAT-01 | Phase 1 | Complete |
| STAT-02 | Phase 1 | Complete |
| STAT-03 | Phase 1 | Complete |
| STAT-04 | Phase 1 | Complete |
| STAT-05 | Phase 1 | Complete |
| STAT-06 | Phase 1 | Complete |
| STAT-07 | Phase 1 | Complete |
| STAT-08 | Phase 3 | Complete |
| ALNC-01 | Phase 3 | Complete |
| ALNC-02 | Phase 3 | Complete |
| ALNC-03 | Phase 3 | Complete |
| ALNC-04 | Phase 3 | Complete |
| ALNC-05 | Phase 3 | Complete |
| ALNC-06 | Phase 3 | Complete |
| ALNC-07 | Phase 3 | Complete |
| ALNC-08 | Phase 3 | Complete |
| DISC-01 | Phase 4 | Pending |
| DISC-02 | Phase 4 | Pending |
| DISC-03 | Phase 4 | Pending |
| DISC-04 | Phase 4 | Pending |
| DISC-05 | Phase 4 | Pending |
| DISC-06 | Phase 4 | Pending |
| REPU-01 | Phase 4 | Pending |
| REPU-02 | Phase 4 | Pending |
| REPU-03 | Phase 4 | Pending |
| REPU-04 | Phase 4 | Pending |
| REPU-05 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 35 total
- Complete: 14 / 35 (40%)
- Pending: 21 / 35 (60%)

---
*Requirements defined: 2026-10-14*  
*Last updated: 2026-10-15 after Phase 1 completion*
