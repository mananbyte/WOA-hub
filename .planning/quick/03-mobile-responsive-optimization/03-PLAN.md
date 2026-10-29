---
phase: "quick"
plan: "03"
type: "execute"
title: "Safely Optimize Existing Website for Mobile Responsiveness"
files_modified:
  - "web/src/components/Navbar.tsx"
  - "web/src/components/FilterBar.tsx"
  - "web/src/components/ContractCard.tsx"
  - "web/src/components/AuthModal.tsx"
  - "web/src/pages/MarketplacePage.tsx"
  - "web/src/pages/DashboardPage.tsx"
  - "web/src/pages/ContractDetailPage.tsx"
  - "web/src/pages/NewContractPage.tsx"
  - "web/src/pages/AlliancesDirectoryPage.tsx"
  - "web/src/pages/AllianceDetailPage.tsx"
  - "web/src/pages/ProfilePage.tsx"
autonomous: true
requirements:
  - "RESPONSIVE-MOBILE"
  - "RESPONSIVE-TABLET"
  - "RESPONSIVE-DESKTOP"
---

<objective>
Optimize WoA Contract Hub for complete mobile, tablet, laptop, and desktop responsiveness (testing targets: 320px, 375px, 390px, 430px, 768px, 1024px, 1280px, 1440px) while preserving 100% of the existing frontend design, color palette, component structure, and desktop layout.
</objective>

<rules>
- No visual redesign or rebuilding from scratch.
- Preserve desktop layouts (protected baseline).
- Add mobile navigation menu using existing routes and destinations.
- Prevent horizontal scrollbars/overflow on all viewports.
- Ensure form modals are scrollable with mobile keyboards (`max-h-[90vh] overflow-y-auto`).
</rules>

<tasks>
<task id="T1">
  <action>
    Add responsive mobile menu and compact brand wordmark in `web/src/components/Navbar.tsx`.
  </action>
  <verify>
    Verify mobile menu toggle renders on < 768px and navigation options work.
  </verify>
</task>

<task id="T2">
  <action>
    Optimize `web/src/components/FilterBar.tsx` and `web/src/components/ContractCard.tsx` for small mobile screens.
  </action>
  <verify>
    Verify filter controls and contract card badges fit without horizontal overflow.
  </verify>
</task>

<task id="T3">
  <action>
    Optimize `web/src/pages/MarketplacePage.tsx` and `web/src/pages/DashboardPage.tsx` for responsive reflow, airport crests strip, and stats metrics.
  </action>
  <verify>
    Check hero typography, airport crest horizontal strip on mobile, and metrics grid at 320px-430px.
  </verify>
</task>

<task id="T4">
  <action>
    Optimize `web/src/pages/ContractDetailPage.tsx`, `web/src/pages/NewContractPage.tsx`, `web/src/pages/ProfilePage.tsx`, and `web/src/components/AuthModal.tsx` for touch targets, action desks, modals, and keyboard friendly viewports.
  </action>
  <verify>
    Verify bilateral operations desk, step wizard, and auth modal fit without clipping.
  </verify>
</task>

<task id="T5">
  <action>
    Optimize `web/src/pages/AlliancesDirectoryPage.tsx` and `web/src/pages/AllianceDetailPage.tsx` for responsive cards and matrix coverage grid.
  </action>
  <verify>
    Verify alliance directories and 18-hub route matrix adapt on mobile and tablet.
  </verify>
</task>

<task id="T6">
  <action>
    Build and test full web application, verifying no regressions across breakpoints (320px, 375px, 390px, 430px, 768px, 1024px, 1280px, 1440px).
  </action>
  <verify>
    Run tests and create completion summary.
  </verify>
</task>
</tasks>

