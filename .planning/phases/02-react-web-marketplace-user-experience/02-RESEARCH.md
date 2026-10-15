# Phase 2: React Web Marketplace & User Experience - Research

**Researched:** 2026-10-15  
**Domain:** Vite, React 18, TanStack React Query 5, Tailwind CSS, Responsive Web Marketplace  
**Confidence:** HIGH  

<user_constraints>
## User Constraints (from PROJECT.md & Initial Decisions)

### Locked Decisions
- Web is the primary user surface to drive traffic and community discovery.
- Responsive mobile-first design (playable / browsable on mobile while gaming on phone/tablet).
- Zero split liquidity: Public marketplace feed displays all open Outgoing and Incoming contracts.
- Filter criteria must support: Origin/Destination Airport, Aircraft Class (A–F), Cargo vs Passenger, Contract Type (Outgoing vs Incoming).
- Real-time or fast optimistic updates on claim, dispatch, and accept actions.

### the agent's Discretion
- Frontend project structure (Vite inside `web/` or root SPA).
- State management: TanStack Query + React Context for Auth.
- Form handling and validation.
</user_constraints>

<research_summary>
## Summary

Phase 2 builds the public and authenticated web face of WoA Contract Hub. Players need to quickly find contracts matching their current game session (e.g. "I am playing Prague PRG right now and have empty stands for Class C aircraft").

Using Vite + React + Tailwind CSS with Lucide icons provides sub-second HMR during development and <50ms bundle execution in production. TanStack React Query ensures automatic cache revalidation whenever a user posts, claims, or reports in-game turnaround dispatches.

**Primary recommendation:** Scaffold the React SPA in `web/` directory with Vite proxying `/api` to the Express backend (`http://localhost:3000`).
</research_summary>

<standard_stack>
## Standard Stack

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `vite` | ^5.4.0 | Build Tool & Dev Server | Instant hot reloading, ES module bundling, easy proxying to Express backend. |
| `react` & `react-dom` | ^18.3.0 | UI Framework | Declarative component model, ecosystem standard. |
| `@tanstack/react-query` | ^5.59.0 | Server State Management | Caches listings query, manages revalidation, handles mutations cleanly. |
| `lucide-react` | ^0.450.0 | Iconography | High-quality aviation icons (Plane, Send, CheckCircle, AlertCircle, Filter). |
| `tailwindcss` | ^3.4.0 | Styling | Mobile-first utility CSS, zero runtime overhead. |
| `clsx` & `tailwind-merge` | Latest | Class Utilities | Dynamic conditionally styled classnames. |

### Installation Command
```bash
npm create vite@latest web -- --template react-ts
cd web && npm install @tanstack/react-query lucide-react clsx tailwind-merge
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```
</standard_stack>
