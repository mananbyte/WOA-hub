# Phase 03 Plan 03 Summary: Alliance Guest Request Protocol, 18-Hub Expansion, Renewal Flag & Directional Filtering

## Overview
Successfully implemented the Discord-style Alliance Guest aircraft request protocol, expanded the network to all 18 official playable World of Airports hubs, introduced the `↻ RENEWAL` toggle and badge, supported the `partially_dispatched` contract state, and engineered smart direction-aware airport filtering on the public marketplace and private flight decks.

## Key Deliverables
- **18 Playable World of Airports Hubs**:
  - `web/src/data/airports.ts`: Centralized registry of all 18 playable hubs (`INN`, `BRI`, `PRG`, `IAD`, `NGO`, `SAN`, `MCT`, `LEJ`, `SXM`, `LHR`, `SYD`, `BKK`, `MSY`, `HKG`, `ZRH`, `CNN`, `GRU`, `SCL`) with country names and regions.
  - `src/db/seed.ts`: Updated to seed all 18 airports into PostgreSQL database, seed 14 realistic contracts, 6 pilots, and 3 alliances.
- **Contract Renewal Flag**:
  - `src/db/schema.ts` & `src/types/contract.ts`: Added `renewal: boolean` column (defaults to `false`) to `listings` table and validation schemas.
  - `web/src/pages/NewContractPage.tsx`: Added interactive "Renewable Contract" toggle in Contract Manifest studio.
  - `web/src/components/ContractCard.tsx` & `web/src/pages/ContractDetailPage.tsx`: Added prominent `↻ RENEWAL` badge on marketplace cards, detail headers, and operations decks.
- **Outgoing Contract States & Partial Dispatch**:
  - `src/db/schema.ts` & `src/services/contract.service.ts`: Added `partially_dispatched` to `listingStatusEnum`. Implemented `reportPartialDispatch(listingId, actorId)` with audit event `partially_dispatched_woa`.
  - `src/routes/contract.routes.ts`: Mounted `POST /:id/partial-dispatch`.
  - `web/src/components/ContractCard.tsx` & `web/src/pages/ContractDetailPage.tsx`: Supported full lifecycle statuses (`open`, `claimed` / "WAITING FOR APPROVAL", `in_progress` / "APPROVED", `partially_dispatched`, `dispatched`, `completed`).
- **Smart Direction-Aware Airport Filtering**:
  - `src/services/contract.service.ts`: Updated query engine so when an airport filter is applied:
    - If `type === 'incoming'`, filters by `destinationAirport = ap` (aircraft arriving at that airport).
    - If `type === 'outgoing'`, filters by `originAirport = ap` (aircraft departing from that airport).
    - If `type === 'ALL'`, filters by `originAirport = ap OR destinationAirport = ap`.
  - `web/src/components/FilterBar.tsx`: Added directional badge indicators (`DEST: {ap}` or `ORIG: {ap}`) informing users of the smart filter behavior.
- **Discord-Style Alliance Guest Request Protocol**:
  - `web/src/pages/AllianceDetailPage.tsx` & `web/src/pages/AllianceOperationsDeckPage.tsx`:
    - Beginners and mid-level players can join alliances as "Guests" to request turnaround planes to their hub.
    - Added high-visibility "REQUEST AIRCRAFT FROM ALLIANCE FLEETS" hero CTA for guests.
    - Alliance members see guest incoming requests with a highlighted `★ MATCHES YOUR ASSIGNED HUB ({hub})` indicator when the destination matches one of their up to 3 operated hubs.
    - Members can click "CLAIM & DISPATCH PLANES" to claim the request directly.
    - Route matrix grid updated to an 18-hub responsive 6-column matrix layout.
- **Comprehensive Integration Test Suite**:
  - `tests/alliance_guest_flow.test.ts`: Verifies all 18 airports exist, directional filtering logic, renewal flag persistence, guest turnaround request workflow, assigned hub matching, partial dispatch, and bilateral completion.

## Verification
- `npx tsx tests/alliance_guest_flow.test.ts` passed (4/4 tests).
- Full test suite `npm test` passed 100% across all 6 test suites (34/34 tests passing).
- `cd web && npm run build` compiled cleanly with zero errors.
