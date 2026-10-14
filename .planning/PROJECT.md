# WoA Contract Hub

## What This Is

WoA Contract Hub is a web platform and Discord bot that lets World of Airports players
coordinate in-game flight contracts — posting outgoing or incoming contract requests,
discovering and claiming matches, and tracking each flight from posting through in-game
dispatch to confirmed completion. It serves independent players and organized alliances
through one shared marketplace, with private alliance spaces layered on top.

## Core Value

Any WoA player — new, mid-level, or veteran — can find or offer a flight contract in
minutes, without needing Discord contacts, alliance membership, or manual forum hunting.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active

<!-- Current scope. Building toward these. -->

**Authentication & Profiles**
- [ ] User can sign up with email and password
- [ ] User must provide their Discord username at signup (used for bot communication)
- [ ] User can link their WoA in-game player ID to their profile
- [ ] User profile displays reputation score, contract history, and badges

**Contract Marketplace (Outgoing Contracts)**
- [ ] Player can post an outgoing contract: available aircraft, aircraft class, preferred destination airport(s), availability window, and optional notes
- [ ] Other players can browse outgoing contract listings filtered by airport, aircraft class, and region
- [ ] A destination player can apply/claim an outgoing contract listing
- [ ] The source player who posted the contract reviews applicants and selects one recipient
- [ ] Once selected, the source player sends the flight contract in-game to the destination player
- [ ] Destination player can report that they have accepted the contract in-game; platform status updates accordingly
- [ ] Source player can report that they have dispatched the aircraft; platform status updates accordingly
- [ ] Either party can cancel a contract with a reason; reputation is adjusted accordingly

**Contract Marketplace (Incoming Contracts)**
- [ ] Player can post an incoming contract request: desired aircraft class, their destination airport, availability window, and optional notes
- [ ] Other players (with aircraft to send) can browse incoming requests and claim one
- [ ] Claiming player sends the aircraft in-game; same dispatch/accept/complete reporting flow as outgoing contracts

**Alliance System**
- [ ] Alliance leader can create a group with name, description, airport model (assigned / flexible / hybrid), membership mode (open / application / invite-only), and privacy setting
- [ ] Alliance gets a public page at /alliances/<slug> and a private member workspace
- [ ] Leader can share an invite link; players request to join; leader/admins approve
- [ ] Four roles: Owner, Admin/Recruiter, Member, Visitor — with appropriate permissions
- [ ] Members can post alliance-only contract listings visible only to group members
- [ ] Assigned-airport model: member is linked to a specific airport; relevant partners notified for that airport
- [ ] Flexible model: members announce available aircraft; eligible members claim on first-come basis
- [ ] Alliance can configure an escalation policy: unfilled private listings optionally exposed to the open marketplace after a set delay (opt-in, explicit, configurable)
- [ ] Alliance leader dashboard shows: active requests, unfilled requests, member participation, average claim time, and airport/class supply gaps

**Discord Bot**
- [ ] Bot communicates contract status notifications to players via Discord DM (Discord username collected at signup)
- [ ] Players can use slash commands: /contract create, /contract find, /contract status, /contract accept, /contract cancel
- [ ] Bot posts new contract listings to configured Discord channels (per server/alliance setup)
- [ ] Alliance admins can configure which Discord server channel receives their group's listing notifications
- [ ] All Discord interactions use the same underlying contract records as the website (no duplicate data)
- [ ] Bot installation in a Discord server is optional — platform is fully functional without it

**Reputation & Trust**
- [ ] User profile shows: total contracts posted, hosted, success rate, cancellation rate
- [ ] Both parties can optionally rate a completed contract (simple positive/negative + optional comment)
- [ ] Platform reputation score calculated from completion rate and ratings
- [ ] Disputed contracts are flagged for moderator review; each party's report is recorded

**Moderation & Safety**
- [ ] Platform admins can suspend or ban users violating community guidelines
- [ ] Rate limiting: maximum requests per day per user to prevent flooding
- [ ] Automated spam/profanity detection flags content for review

### Out of Scope (v1)

- Real-money transactions or premium subscriptions — growth first, monetization later
- Official WoA game API integration (no public API exists; all status updates are manual/self-reported)
- Native mobile app — responsive web (PWA-capable) is sufficient for v1
- Member voting workflows for alliance governance — post-launch based on feedback
- Complex algorithm-based auto-matching — v1 uses browse + claim; smart matching is v2
- Alliance leaderboards or cross-alliance rankings — post-launch
- In-platform chat or messaging between players — Discord handles conversation; platform handles contracts

## Context

- WoA's player community lives on the Flyboys Games forum and Discord. Current coordination happens via forum threads, Discord chats, and Google Forms — all manual, fragmented, and slow.
- The game has no public API. All contract events (dispatch, acceptance, completion) must be self-reported by players on the platform.
- Alliances already exist in three models: assigned-airport (each member owns an airport), flexible exchange (first-come fleet announcements), and hybrid. The platform must accommodate all three without forcing groups to abandon their existing Discord servers or internal rules.
- Discord bot is a notification and convenience layer — the web platform is the primary surface and the traffic goal. Bot commands drive users back to the website.
- The platform should be accessible to players with no Discord or forum experience — simple onboarding, clear flows.
- Growth strategy: announce on Flyboys forum and WoA Discord; partner with existing alliances to bring their communities to the platform.

## Constraints

- **No game API**: All in-game action reporting is manual and self-declared. Dispute resolution is reputation-based, not automated proof.
- **Discord Developer Policy**: No unsolicited DMs; users must opt-in (signup provides consent). Rate limit all bot commands. No storing of Discord passwords or sensitive credentials.
- **Age restriction**: Discord requires users to be 13+; platform must enforce this at signup.
- **Privacy**: Only necessary data stored (email, Discord username, WoA player ID). All data encrypted in transit. Email not displayed publicly.
- **Tech stack (preferred)**: Node.js + PostgreSQL backend; React frontend; discord.js bot; cloud hosting (AWS/GCP). To be confirmed in requirements.
- **Solo/small team**: Scope must stay executable by a 2–3 person team in the prototype and MVP phases.

## Key Decisions

| Decision | Rationale | Outcome |
|---|---|---|
| Web-first, Discord as notification layer | Website drives traffic; Discord drives engagement and reach. Discord-only would limit discoverability and analytics. | — Pending |
| One marketplace + alliance spaces (not two products) | Prevents split liquidity. Public and private listings share one contract DB and one matching surface. | — Pending |
| Manual self-reporting for contract status | No WoA game API exists. Automation can be added if Flyboys ever opens an API. | — Pending |
| Email primary auth + Discord username at signup | Keeps auth independent of Discord; Discord username enables bot DMs without full OAuth complexity in v1. | — Pending |
| Alliance features in v1 | Alliances are the community acquisition channel. Architecture must support group scope from day one to avoid costly data model rework. | — Pending |
| No monetization in v1 | Grow audience and prove value first. Introduce subscriptions/premium features once there is sufficient active user base. | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-10-14 after initialization*
