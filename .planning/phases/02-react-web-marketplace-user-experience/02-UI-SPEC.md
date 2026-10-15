---
phase: 02
slug: react-web-marketplace-user-experience
status: approved
shadcn_initialized: false
preset: modern-aerospace-ops-3d
created: 2026-10-15
---

# Phase 02 — UI Design Contract: WoA Contract Hub

> Visual, spatial, and interaction contract incorporating 3D animation systems and dedicated, uncluttered task pages.

---

## 1. Design Philosophy Inspirations & Selected Direction

### Evaluated Inspirations

1. **Inspiration A: Radar Ops & ATC Glassmorphism**
   - *Aesthetic*: Dark airport terminal glass, emerald/cyan radar sweeps, subtle glowing vectors.
   - *3D System*: Canvas-based rotating 3D low-poly globe displaying active flight great-circle arcs between WoA hubs.
2. **Inspiration B: Modern Aerospace Luxe (Linear / Vercel Aviation)** — **[SELECTED BASE]**
   - *Aesthetic*: Ultra-clean deep space obsidian (`#070A11`), micro-borders (`border-white/10`), ambient electric cyan (`#38BDF8`) & turbine amber (`#F59E0B`) glows. High spatial discipline, zero clutter.
   - *3D System*: Framer Motion 3D perspective card tilts (`rotateX`, `rotateY`, dynamic specular glare) + interactive 3D connection pins (Aceternity 3D Pin style) representing flight routes.
3. **Inspiration C: Retro-Futuristic Flight Deck (HUD / Cockpit)**
   - *Aesthetic*: Amber phosphor text, monospace instrument gauges, dark carbon texture cards.
   - *3D System*: 3D interactive toggle switches for "Dispatch" and "Accept" flight operations.
4. **Inspiration D: Swiss Clean Terminal Editorial**
   - *Aesthetic*: High-contrast stark white on obsidian, oversized typography, airport split-flap arrival/departure board animations.
   - *3D System*: 3D flip-card mechanics on contract status updates.
5. **Inspiration E: Cyber-Logistics Command Center**
   - *Aesthetic*: Industrial cargo bay look, isometric route maps, cargo vs passenger visual separation.
   - *3D System*: Interactive 3D aircraft model preview on contract creation.

### Chosen Synthesis: **Modern Aerospace Luxe with 3D Spatial Interactions**
Combines the high-legibility spatial restraint of Inspiration B with real-time 3D flight arcs and tilt-perspective card physics. Every screen breathes, avoiding information density overload.

---

## 2. Dedicated Multi-Page Architecture (Zero Clutter)

To prevent cognitive overload, every core workflow lives on its **own dedicated page** rather than squeezing everything into dense tabs or overcrowded modals:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          WOA CONTRACT HUB                              │
│  [Marketplace]   [Post Contract]   [My Flight Deck]   [Alliances]      │
└────────────────────────────────────────────────────────────────────────┘
          │                 │                 │                │
          ▼                 ▼                 ▼                ▼
   /marketplace      /contracts/new      /dashboard       /alliances
  (Discover & Claim) (Dedicated Wizard)  (My Operations)  (Group Hubs)
          │                                   │
          └───────────────┬───────────────────┘
                          ▼
                   /contracts/:id
              (In-Flight Ops Room)
```

1. **`/marketplace` — Discovery Terminal**
   - *Purpose*: Focused entirely on discovering and claiming open flight contracts.
   - *Layout*: Sticky header with uncluttered airport filter pills (PRG, INN, BRI, SAN, IAD, etc.) + search bar. Clean 3-column responsive grid of 3D tilt cards.
   - *Zero Clutter Rule*: Cards only show origin, destination, aircraft class, publisher, and time remaining. Full details open in dedicated page/drawer.
2. **`/contracts/new` — Contract Creation Studio**
   - *Purpose*: A calm, step-by-step creation flow for Outgoing or Incoming flights.
   - *Layout*: 3-step clean wizard: (1) Contract Type & Route (Origin ➔ Destination with interactive visual route line), (2) Aircraft Class & Payload (Class A–F selector with visual silhouettes), (3) Timing & Availability.
   - *Zero Clutter Rule*: No popups or tiny cramped modal boxes; generous whitespace.
3. **`/contracts/:id` — In-Flight Operations Command Room**
   - *Purpose*: The definitive single-contract management room for the involved source and destination pilots.
   - *Layout*: 
     - Top: Hero route card with 3D status progress beacon.
     - Middle: Bilateral action deck ("Mark Dispatched in WoA", "Confirm Accepted in WoA", "Cancel Contract").
     - Bottom: Live timeline stepper of immutable audit events from `status_events`.
   - *Zero Clutter Rule*: Uninvolved visitors see a clean summary; active pilots see prominent large action buttons.
4. **`/dashboard` — Pilot Flight Deck & Dispatch Desk**
   - *Purpose*: Personal operations desk for the logged-in player.
   - *Layout*: Split into two clear, uncluttered sections:
     - "Flights I Need to Dispatch" (Actions required by me).
     - "Flights Awaiting My Turnaround" (Inbound aircraft sent to my airport).
   - *Zero Clutter Rule*: Filters out archived or irrelevant contracts; highlights pending actions with amber glow.
5. **`/profile/:id` — Pilot Dossier & Reputation Profile**
   - *Purpose*: Independent player profile page showing WoA ID, Discord handle, reputation score, and verified flight history.
6. **`/alliances` — Alliance Operations Hub (Phase 3)**
   - *Purpose*: Private group spaces and assigned airport tables.

---

## 3. 3D Interaction & Animation Design System

| Animation / 3D Component | Library | Placement | Purpose |
|--------------------------|---------|-----------|---------|
| **3D Perspective Card Tilt** | Framer Motion (`useMotionValue`, `useTransform`) | Contract cards on `/marketplace` | Subtle 3D tilt following mouse cursor with specular gradient reflection. Creates depth without distraction. |
| **Interactive 3D Flight Pin & Arc** | Three.js / Canvas | Hero banner on `/marketplace` & route header on `/contracts/:id` | Visual 3D arc curving between origin and destination airport nodes. |
| **Bilateral Status Pulse Beacon** | Framer Motion + Tailwind | `/contracts/:id` stepper | 3D radiating radar ring indicating currently awaiting action (e.g. pulsing amber while awaiting dispatch). |
| **Page Transitions** | Framer Motion | Top-level routing | Smooth spatial slide/fade (`opacity: 0, y: 8` -> `opacity: 1, y: 0`) between dedicated pages. |

---

## 4. Design System Tokens

### Typography

| Role | Size | Weight | Line Height | Font Family |
|------|------|--------|-------------|-------------|
| Display / Route Codes | 32px / 40px | Bold (700) | 1.1 | JetBrains Mono / Inter |
| Page Heading | 24px / 28px | Semibold (600) | 1.25 | Inter |
| Card Title | 18px / 20px | Semibold (600) | 1.3 | Inter |
| Body | 14px / 16px | Regular (400) | 1.5 | Inter |
| Badges & Status Pills | 12px | Medium (500) | 1.2 | Inter / JetBrains Mono |

### Color Palette

| Role | Token / Hex | Usage |
|------|-------------|-------|
| **Dominant (60%)** | `#070A11` / `#0D111D` | Deep space aerospace obsidian canvas |
| **Secondary (30%)** | `#161D2F` / `#1F293D` | Elevated 3D cards, inputs, navigation header |
| **Borders** | `rgba(255, 255, 255, 0.08)` | Subtle crisp micro-borders defining cards |
| **Accent Primary (10%)** | `#38BDF8` (Electric Sky Cyan) | Primary action CTAs, route lines, active tabs |
| **Accent Operational** | `#F59E0B` (Turbine Amber) | Pending dispatch action beacons, class tags |
| **Success Verified** | `#10B981` (Emerald) | Bilateral completed state, high reputation score |
| **Destructive** | `#EF4444` (Rose) | Cancellation warnings & destructive dialogs |

### Spacing Scale (4px Base)

- **xs**: 4px — Tag padding, micro gaps
- **sm**: 8px — Button inner padding, pill gaps
- **md**: 16px — Form field spacing, standard card margins
- **lg**: 24px — Card internal padding, grid gaps
- **xl**: 32px — Header separation, wizard steps
- **2xl**: 48px — Page section spacing
- **3xl**: 64px — Hero / top-level container padding

---

## 5. Copywriting Contract

| Element | Copy |
|---------|------|
| Primary Navigation CTA | "Post Flight Contract" |
| Route Display | `PRG ✈ IAD` (or `SAN ➔ HKG`) |
| Empty Marketplace State | "No flights currently match your active filters. Ready to send planes or host turnarounds?" |
| Empty State CTA | "Create Contract in 30 Seconds" |
| Claim Flight Action | "Claim Connection" |
| Dispatch Confirmation | "Confirm In-Game Dispatch" |
| Accept Confirmation | "Confirm In-Game Turnaround" |
| Cancel Action Warning | "Cancel Flight: A cancellation reason is required and will be logged in your contract history." |

---

## 6. Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** Approved 2026-10-15 (Aviation 3D Luxe Edition)
