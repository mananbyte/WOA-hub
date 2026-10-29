---
phase: "quick"
plan: "01"
type: "execute"
title: "Make WoA Player ID mandatory and Discord username optional"
files_modified:
  - "src/db/schema.ts"
  - "src/middleware/validate.ts"
  - "src/middleware/auth.ts"
  - "src/services/auth.service.ts"
  - "src/routes/auth.routes.ts"
  - "web/src/api/client.ts"
  - "web/src/context/AuthContext.tsx"
  - "web/src/components/AuthModal.tsx"
  - "web/src/components/Navbar.tsx"
  - "web/src/components/ContractCard.tsx"
  - "web/src/pages/ContractDetailPage.tsx"
  - "web/src/pages/DashboardPage.tsx"
  - "web/src/pages/ProfilePage.tsx"
  - "web/src/pages/NewContractPage.tsx"
  - "web/src/pages/AllianceDetailPage.tsx"
  - "web/src/pages/AllianceOperationsDeckPage.tsx"
  - "tests/auth.test.ts"
  - "tests/contract.test.ts"
  - "tests/concurrency.test.ts"
  - "tests/alliance.test.ts"
  - "tests/escalation.test.ts"
  - "tests/alliance_guest_flow.test.ts"
autonomous: true
requirements:
  - "AUTH-02"
  - "AUTH-04"
---

<objective>
Refactor user registration and pilot identification across the full stack so that World of Airports Player ID (`woa_player_id`) is a required field at registration, and Discord Username (`discord_username`) is strictly optional. Ensure all frontend components safely render pilot identity without runtime null exceptions when a Discord handle is not provided.
</objective>

<threat_model>
ASVS Level 1:
- Input validation: `woa_player_id` must be sanitized and validated (minimum 2 chars, max 100 chars).
- Optional field handling: `discord_username` must accept undefined, null, or empty string without throwing validation errors or storing malformed empty strings.
- Frontend null safety: Any `.slice()` or `.toUpperCase()` invocation on `discordUsername` must fall back safely to `woaPlayerId` or email to prevent unhandled React render crashes.
</threat_model>

<tasks>
<task id="T1">
  <action>
    Update Database Schema and Types:
    - In `src/db/schema.ts`:
      - Change `woaPlayerId` in `users` table to `.notNull()`.
      - Change `discordUsername` in `users` table to remove `.notNull()` (nullable).
  </action>
  <verify>
    Inspect `src/db/schema.ts` lines 15-26.
  </verify>
</task>

<task id="T2">
  <action>
    Update Backend Validation, Auth Service & Middleware:
    - In `src/middleware/validate.ts`:
      - In `registerSchema`, make `woa_player_id` required (`z.string().min(2, "WoA Player ID is required").max(100)`).
      - Make `discord_username` optional (`z.string().max(32).regex(/^[^@#:]{2,32}$/).optional().or(z.literal("")).transform(v => v || null)`).
    - In `src/services/auth.service.ts`:
      - Update `RegisterInput` interface: `woa_player_id: string; discord_username?: string | null;`.
      - In `register`: insert `woaPlayerId: input.woa_player_id`, `discordUsername: input.discord_username || null`.
    - In `src/middleware/auth.ts`:
      - Update `AuthUser` interface: `woaPlayerId: string; discordUsername: string | null;`.
  </action>
  <verify>
    Check types and schemas in `src/middleware/validate.ts` and `src/services/auth.service.ts`.
  </verify>
</task>

<task id="T3">
  <action>
    Update Frontend Client, Context and AuthModal:
    - In `web/src/api/client.ts`:
      - Update `User`, `PublicProfile`, `Listing.creator`, `ListingClaim.claimant` to type `woaPlayerId: string` and `discordUsername: string | null`.
      - Update `api.auth.register` argument type to require `woa_player_id` and make `discord_username` optional.
    - In `web/src/context/AuthContext.tsx`:
      - Update `register` signature to require `woa_player_id: string` and optional `discord_username?: string`.
    - In `web/src/components/AuthModal.tsx`:
      - Swap order: place WoA Player ID before Discord Username.
      - Mark WoA Player ID as `required` with prominent label.
      - Mark Discord Username as `(Optional)` with no `required` attribute.
      - Submit payload with `woa_player_id` and optional `discord_username`.
  </action>
  <verify>
    Inspect `AuthModal.tsx` form controls and submit handler.
  </verify>
</task>

<task id="T4">
  <action>
    Guard Frontend Pilot Name and Avatar Display:
    - In `web/src/components/Navbar.tsx`:
      - Use `(user.discordUsername || user.woaPlayerId || "WOA").slice(0, 2).toUpperCase()` for initials.
      - Display `user.discordUsername || user.woaPlayerId`.
    - In `web/src/components/ContractCard.tsx`:
      - Use `(listing.creator.discordUsername || listing.creator.woaPlayerId || "WOA").slice(0, 2).toUpperCase()`.
      - Display `listing.creator.discordUsername || listing.creator.woaPlayerId`.
    - In `web/src/pages/ContractDetailPage.tsx`:
      - Safeguard creator and claimant avatar initials and labels.
    - In `web/src/pages/DashboardPage.tsx`:
      - Display `(user.discordUsername || user.woaPlayerId).toUpperCase()`.
    - In `web/src/pages/ProfilePage.tsx`:
      - Safeguard avatar initials and primary name header.
    - In `web/src/pages/NewContractPage.tsx`:
      - Fallback to `user?.discordUsername || user?.woaPlayerId`.
    - In `web/src/pages/AllianceDetailPage.tsx` and `AllianceOperationsDeckPage.tsx`:
      - Safe avatar initials and display name for creator and members.
  </action>
  <verify>
    Search for all occurrences of `.discordUsername` across `web/src/` to ensure no unprotected `.slice` or unhandled null renders.
  </verify>
</task>

<task id="T5">
  <action>
    Update Test Suite:
    - In `tests/auth.test.ts`:
      - Add test for registration without Discord username (verifying 201 Created and null `discordUsername`).
      - Add test for registration without `woa_player_id` (verifying 400 Bad Request).
      - Ensure standard registration passes both.
    - In `tests/contract.test.ts`, `tests/concurrency.test.ts`, `tests/alliance.test.ts`, `tests/escalation.test.ts`, `tests/alliance_guest_flow.test.ts`:
      - Add `woa_player_id` to all test registration payloads.
  </action>
  <verify>
    Inspect updated test files.
  </verify>
</task>
</tasks>

