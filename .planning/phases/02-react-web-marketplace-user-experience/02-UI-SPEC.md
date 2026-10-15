---
phase: 02
slug: react-web-marketplace-user-experience
status: approved
shadcn_initialized: false
preset: airport-parchment-editorial
source_template: "WOA Contract Hub — Marketplace UI.svg"
created: 2026-10-15
---

# Phase 02 — UI Design Contract: WoA Contract Hub

> Visual and interaction contract based on the official "WOA Contract Hub — Marketplace UI.svg" design language: warm airport parchment canvas, crisp pill-shaped geometry, vivid aviation accents, and a dedicated uncluttered multi-page architecture.

---

## 1. Design System & Brand Identity

| Property | Value | Notes |
|----------|-------|-------|
| Base Aesthetic | Airport Blueprint & Editorial Parchment | Real flight terminal paper feel, avoiding generic AI dark mode |
| Canvas Color | `#F0EBDE` (Warm Airport Sand / Parchment) | Authentic aviation chart / terminal dispatch desk canvas |
| Surface Color | `#FFFFFA` (Warm Crisp White) | Cards, pill containers, modal dialogs, drawers |
| Primary Ink | `#141A1F` (Tarmac Black / Deep Graphite) | Maximum contrast, razor-sharp editorial legibility |
| Secondary Ink | `#5E6366` (Avionics Muted Slate) | Subtitles, timestamps, airport city labels |
| Primary Action | `#1240C7` (Cobalt Electric Blue) | Pill buttons (`rounded-full`), active navigation tab, primary CTAs |
| Accent Orange | `#F25E24` (International Runway Orange) | "Outgoing" contract badges, urgent alerts, turnaround highlights |
| Accent Lime | `#A8C229` (Flight Radar Chartreuse) | "Active" status pills, verified reputation tags, online indicators |
| Accent Ice Blue | `#E0E8FA` (Soft Cirrus Sky) | Hero feature card and radar widget backgrounds |
| Hairline Borders | `#C9C7BA` (Subtle Warm Slate) | 1px clean dividers, card outlines, pill container strokes |
| Typography | Inter / JetBrains Mono (for IATA codes & flight numbers) | Crisp modern sans-serif paired with aviation monospace |
| Icon Library | Lucide React | Plane, Radar, ArrowRight, ShieldCheck, Clock, CheckCircle |

---

## 2. Spacing & Geometry Scale

Declared values (multiples of 4, pill geometry):

| Token | Value | Radius / Usage |
|-------|-------|----------------|
| xs | 4px | Tag inner padding, icon-text gap |
| sm | 8px | Button inline gap, chip spacing |
| md | 16px | Standard card margin, form field padding |
| lg | 24px | Card internal padding (`p-6`), section gap |
| xl | 32px | Hero section padding, page container header |
| 2xl | 48px | Page-level vertical section breaks |
| Pill Badge | Full (9999px / 11px) | Filter chips, status tags (`h-[22px] px-3 rounded-full`) |
| Pill Button | Full (9999px / 24px) | Primary CTA buttons (`h-[48px] px-6 rounded-full`) |
| Card Box | 18px (`rounded-2xl`) | Listing cards (`w-[409px] h-[189px]`), stat tiles |
| Hero Feature | 32px (`rounded-3xl`) | Hero radar card (`w-[580px] h-[300px]`) |

---

## 3. Dedicated Multi-Page Architecture (Zero Clutter Policy)

To preserve the clean, spacious airport board aesthetic from the SVG and prevent overwhelming players:

```
┌────────────────────────────────────────────────────────────────────────┐
│  WOA CONTRACT HUB       [MARKETPLACE] [FLEET] [DASHBOARD] [ALLIANCES]  │
└────────────────────────────────────────────────────────────────────────┘
          │                 │                 │                │
          ▼                 ▼                 ▼                ▼
   /marketplace      /contracts/new      /dashboard       /alliances
  (Discover & Claim) (Dedicated Studio)  (Flight Deck)    (Group Spaces)
          │                                   │
          └───────────────┬───────────────────┘
                          ▼
                   /contracts/:id
              (In-Flight Ops Room)
```

1. **`/marketplace` — Discovery Terminal**
   - *Header*: Brand in `#141A1F` with Cobalt Blue pill button ("OPEN A ROOM" / "POST CONTRACT").
   - *Hero Section*: High-contrast editorial headline ("AIRPORT FLEET EXCHANGE: THE SHARED MARKETPLACE") alongside the soft ice-blue (`#E0E8FA`) interactive radar widget displaying concentric coordinate rings and live hub dots.
   - *Pill Search & Filter Bar*: Seamless `#FFFFFA` pill container (`rounded-full border border-[#C9C7BA]`) with search input and `#141A1F` filter chips:
     - `ALL AIRPORTS` (PRG, INN, BRI, SAN, IAD, MCT, NGO, LEJ, SXM, HKG)
     - `CLASS: ALL` (A, B, C, D, E, F)
     - `OUTGOING` / `INCOMING` / `CARGO`
     - `#1240C7` Cobalt Filter Action Pill
   - *Listing Cards Grid*: 3-column grid of spacious `#FFFFFA` cards (`rounded-2xl border border-[#C9C7BA]`):
     - Top badge: `#F25E24` (Outgoing) or `#1240C7` (Incoming) or `#A8C229` (Active).
     - Route display: `PRG ➔ IAD` with aircraft class and duration.
     - Hairline separator: `#C9C7BA`.
     - Footer: Publisher reputation and "Claim Connection" pill.
2. **`/contracts/new` — Contract Creation Studio**
   - Dedicated 3-step studio wizard with generous whitespace (no cramped popup dialogs).
   - Warm parchment background with crisp white card containers.
   - Visual route selector with interactive airport pins.
3. **`/contracts/:id` — In-Flight Operations Room**
   - Isolated command room for an active flight connection.
   - Hero route banner with bilateral action desk:
     - Primary Blue Pill: "Confirm In-Game Dispatch" (for sender).
     - Primary Lime Pill: "Confirm In-Game Turnaround" (for receiver).
     - Destructive Red Pill: "Cancel Flight" (mandatory reason prompt).
   - Immutable audit event timeline (`status_events`).
4. **`/dashboard` — Pilot Flight Deck & Dispatch Desk**
   - Player's personal dispatch board split into:
     - "Flights I Need to Dispatch" (actions pending by me).
     - "Flights Awaiting My Turnaround" (planes landed at my airport).
5. **`/profile/:id` — Pilot Dossier & Reputation Profile**
   - Player profile with WoA In-Game ID, Discord handle, reputation score, and verified flight history.

---

## 4. Color Palette Specifications

| Role | Hex | Tailwind Equivalent | Usage |
|------|-----|---------------------|-------|
| **Canvas Background** | `#F0EBDE` | `bg-[#F0EBDE]` | Full-page background, navigation backdrop |
| **Card / Surface** | `#FFFFFA` | `bg-[#FFFFFA]` | Listing cards, search pill, modals |
| **Feature Card** | `#E0E8FA` | `bg-[#E0E8FA]` | Hero radar widget, highlighted route cards |
| **Primary Text** | `#141A1F` | `text-[#141A1F]` | Page headlines, airport codes, bold labels |
| **Secondary Text** | `#5E6366` | `text-[#5E6366]` | Flight times, aircraft models, creator stats |
| **Hairline Dividers** | `#C9C7BA` | `border-[#C9C7BA]` | Clean 1px horizontal dividers and card borders |
| **Cobalt Primary** | `#1240C7` | `bg-[#1240C7]` | Primary CTA pill buttons, Incoming contract tags |
| **Runway Orange** | `#F25E24` | `bg-[#F25E24]` | Outgoing contract tags, live alerts, warning pills |
| **Radar Lime** | `#A8C229` | `bg-[#A8C229]` | Active status indicators, verified turnaround pills |
| **Dark Pill Surface** | `#141A1F` | `bg-[#141A1F]` | Navigation profile pill, dark filter chips |

---

## 5. Copywriting Contract

| Element | Copy |
|---------|------|
| Primary Navigation CTA | "Post Contract" |
| Hero Tag | "THE SHARED MARKETPLACE" |
| Hero Heading | "AIRPORT FLEET EXCHANGE" |
| Hero Description | "Coordinate real-time flight connections with players across all hubs." |
| Filter Chip Defaults | "ALL AIRPORTS", "CLASS: ALL", "OUTGOING", "CARGO" |
| Empty State Heading | "No active flight contracts found" |
| Empty State Body | "No flights currently match your active filters. Ready to send aircraft or host turnarounds?" |
| Claim Flight CTA | "Claim Connection" |
| Dispatch Confirmation | "Confirm In-Game Dispatch" |
| Turnaround Confirmation | "Confirm In-Game Turnaround" |
| Cancel Flight CTA | "Cancel Flight" |

---

## 6. Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS (Faithful to "WOA Contract Hub — Marketplace UI.svg")
- [x] Dimension 3 Color: PASS (`#F0EBDE`, `#FFFFFA`, `#141A1F`, `#1240C7`, `#F25E24`, `#A8C229`)
- [x] Dimension 4 Typography: PASS (Inter + JetBrains Mono)
- [x] Dimension 5 Spacing: PASS (Pill geometry, 18px/32px radius)
- [x] Dimension 6 Registry Safety: PASS

**Approval:** Approved 2026-10-15 (Official SVG UI Alignment)
