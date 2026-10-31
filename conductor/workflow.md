# Workflow — Development Practices & Quality Gates

## 1. Test-Driven Development (TDD)
- The Iron Law: **NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST**.
- **RED**: Write a minimal failing test expressing the desired behavior. Confirm it fails for the expected reason.
- **GREEN**: Write the minimal code to pass the test.
- **REFACTOR**: Clean up, eliminate redundancy, and ensure all tests stay green.

## 2. Master Test Suite Architecture
- **Tier 1: Feature Coverage**:
  - Auth & JWT
  - 23 WB Districts & Details
  - Promises CRUD & Lifecycle Timelines
  - Evidence Submissions & Review Workflow
  - Indicators ($1T / $5T Macroeconomic models)
  - Security Guards (AuthGuard & RolesGuard)
  - Frontend Views & App Router Layouts
  - Leaflet Map & Accessible Alternatives
  - Accessibility (WCAG 2.2 AA Contrast & Landmarks)
  - Dynamic Locale & next-intl (Bilingual EN/BN & Numerals)
  - Scraper, Tally Engine & Citizen AI Chatbot
  - Hostinger MySQL Database Schema & Adapter
  - Cryptographic JWT & Dual Auth RBAC Guard
  - External APIs & Gazette Intelligence Integration
- **Tier 2: Boundary & Adversarial Conditions**:
  - SQL injection vectors, prototype pollution, null byte payloads, extreme sizes.
- **Tier 3: Pairwise Interactions**:
  - Multi-tier lifecycle interactions (Admin create $\rightarrow$ Researcher submit $\rightarrow$ Citizen view).
- **Tier 4: End-to-End Governance Scenarios**:
  - Comprehensive real-world government workflows.

## 3. Pre-Commit / Pre-Deployment Gates
1. `npm run lint` (`tsc --noEmit`): Must pass with 0 errors.
2. `npm run test:e2e` (`node tests/e2e-runner.js`): All tiers must pass with 100% success rate.
3. `npm run build`: Must produce valid `.next/standalone` bundle without error.
