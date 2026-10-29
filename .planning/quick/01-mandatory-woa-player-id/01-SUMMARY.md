# Plan Quick-01 Summary: Mandatory WoA Player ID & Optional Discord Username

**Plan:** Quick-01  
**Status:** Completed  
**Completed:** 2026-10-29  

## Delivered Items

1. **Database Schema (`src/db/schema.ts`)**:
   - Updated `users.woaPlayerId` to `.notNull()`.
   - Updated `users.discordUsername` to optional / nullable (removed `.notNull()`).

2. **Validation & Auth Engine (`src/middleware/validate.ts`, `src/services/auth.service.ts`, `src/middleware/auth.ts`)**:
   - `registerSchema`: `woa_player_id` is now strictly required (min 2, max 100 chars); `discord_username` is optional (supports undefined, null, or empty string converted to null).
   - `AuthService.register`: Persists mandatory `woaPlayerId` and optional `discordUsername`.
   - `AuthUser` and `generateToken`: Include `woaPlayerId` in the JWT payload alongside nullable `discordUsername`.

3. **Frontend Registration & Auth Modal (`web/src/components/AuthModal.tsx`, `web/src/context/AuthContext.tsx`, `web/src/api/client.ts`)**:
   - Reordered registration form: placed **World of Airports Player ID** first as a required field marked with `*`.
   - Marked **Discord Username** as optional with no required attribute.
   - Updated TypeScript client and context interfaces (`User`, `PublicProfile`, `Listing.creator`, `ListingClaim.claimant`).

4. **Frontend UI Null-Safety & Display Guards**:
   - Safeguarded avatar initials and display name rendering across `Navbar.tsx`, `ContractCard.tsx`, `ContractDetailPage.tsx`, `DashboardPage.tsx`, `ProfilePage.tsx`, `NewContractPage.tsx`, `AllianceDetailPage.tsx`, and `AllianceOperationsDeckPage.tsx`.
   - Prevents `TypeError: Cannot read properties of null (reading 'slice')` when a user registers without a Discord username.
   - Pilot identity smoothly falls back to `woaPlayerId`.

5. **Integration Test Suite (`tests/`)**:
   - Added explicit test cases in `tests/auth.test.ts` verifying registration succeeds with null `discordUsername` and fails (400) when `woa_player_id` is omitted.
   - Updated registration payloads across `tests/concurrency.test.ts` and `tests/alliance.test.ts` to include `woa_player_id`.

## Requirements Satisfied
- `AUTH-02`: User can optionally provide their Discord username during registration (optional).
- `AUTH-04`: User must provide their WoA in-game Player ID during registration (mandatory).

