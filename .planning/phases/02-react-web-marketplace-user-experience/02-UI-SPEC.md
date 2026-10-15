---
phase: 02
slug: react-web-marketplace-user-experience
status: approved
shadcn_initialized: false
preset: aviation-dark
created: 2026-10-15
---

# Phase 02 — UI Design Contract: WoA Contract Hub Marketplace

> Visual and interaction contract for the React Web Marketplace SPA.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | Tailwind CSS |
| Preset | Aviation Operations Dark Theme |
| Component library | Custom Tailwind Components |
| Icon library | Lucide React |
| Font | Inter / JetBrains Mono (for airport/flight codes) |

---

## Spacing Scale

Declared values (multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Tag padding, icon-text gap |
| sm | 8px | Button padding, compact card gap |
| md | 16px | Default grid gap, form input spacing |
| lg | 24px | Card internal padding, filter bar spacing |
| xl | 32px | Section headers, modal padding |
| 2xl | 48px | Page container margins |
| 3xl | 64px | Hero / board vertical spacing |

---

## Typography

| Role | Size | Weight | Line Height | Notes |
|------|------|--------|-------------|-------|
| Body | 14px / 16px | Regular (400) | 1.5 | Clean readability on mobile & desktop |
| Label | 12px / 13px | Medium (500) | 1.2 | Airport badges, class pills, statuses |
| Heading | 18px / 20px | Semibold (600) | 1.3 | Card titles, modal headers |
| Display | 28px / 32px | Bold (700) | 1.2 | Marketplace board hero & counts |

---

## Color Palette

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#0B0F19` / `#111827` | Deep aerospace navy background & page wrapper |
| Secondary (30%) | `#1F2937` / `#374151` | Listing cards, modals, filter drawers, table headers |
| Accent (10%) | `#38BDF8` (Sky Cyan) & `#F59E0B` (Amber) | Primary action CTAs, active status badges, claim buttons |
| Success | `#10B981` (Emerald) | `completed` status badge, bilateral verification badge |
| Destructive | `#EF4444` (Rose Red) | Cancel contract confirmation & destructive actions |

**Accent reserved for:** Primary "Post Contract" CTA button, "Claim Flight" action, active filter pills, and in-flight turnaround status indicators.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | "Post Flight Contract" |
| Filter CTA | "Apply Filters" / "Clear Filters" |
| Empty state heading | "No active contracts found" |
| Empty state body | "Try clearing your airport or aircraft class filters, or post a new contract request to kick off coordination." |
| Claim CTA | "Claim Connection" |
| Dispatch CTA | "Confirm In-Game Dispatch" |
| Accept CTA | "Confirm In-Game Acceptance" |
| Destructive confirmation | "Cancel Contract: Are you sure? A cancellation reason is mandatory and will be logged to your audit history." |

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** Approved 2026-10-15
